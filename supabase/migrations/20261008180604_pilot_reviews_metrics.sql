begin;

-- Anonymous catalog instrumentation stores no account, contact, search term or form content.
-- The client reuses event_key across reloads and this primary key makes retries idempotent.
create table public.analytics_events (
  event_key uuid primary key,
  event_type text not null check (event_type in ('catalog_visit','filter_applied','material_opened')),
  material_id uuid references public.materials(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  check ((event_type = 'material_opened') = (material_id is not null))
);
create index analytics_events_type_time_idx on public.analytics_events(event_type, occurred_at desc);
create index analytics_events_material_time_idx on public.analytics_events(material_id, occurred_at desc) where material_id is not null;
alter table public.analytics_events enable row level security;
create policy analytics_events_create on public.analytics_events for insert to anon, authenticated
  with check (
    event_type in ('catalog_visit','filter_applied')
    or (event_type = 'material_opened' and exists (
      select 1 from public.materials m where m.id = material_id and m.status = 'published'
    ))
  );
create policy analytics_events_admin_read on public.analytics_events for select to authenticated
  using ((select private.is_admin()));
grant insert (event_key,event_type,material_id) on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;

create function public.record_catalog_event(p_event_key uuid, p_event_type text, p_material_id uuid default null)
returns boolean
language plpgsql security invoker set search_path = ''
as $$
begin
  begin
    insert into public.analytics_events(event_key,event_type,material_id)
    values(p_event_key,p_event_type,p_material_id);
    return true;
  exception
    when unique_violation then return false;
  end;
end;
$$;
revoke all on function public.record_catalog_event(uuid,text,uuid) from public;
grant execute on function public.record_catalog_event(uuid,text,uuid) to anon, authenticated;

-- Anonymous readers use the public view. Direct table access is limited to the author or admin.
drop policy reviews_read on public.reviews;
create policy reviews_anon_read on public.reviews for select to anon
  using (status = 'approved' and exists (
    select 1 from public.materials m where m.id = material_id and m.status = 'published'
  ));
create policy reviews_authenticated_read on public.reviews for select to authenticated
  using (author_id = (select auth.uid()) or (select private.is_admin()));
grant select (author_id) on public.reviews to authenticated;

alter table public.reviews add column updated_at timestamptz not null default now();
alter table public.reviews add column moderated_at timestamptz;
grant select (updated_at,moderated_at) on public.reviews to authenticated;

create or replace function private.moderate_review() returns trigger
language plpgsql security invoker set search_path = ''
as $$
begin
  new.updated_at := now();
  if private.is_admin() then
    if new.status is distinct from old.status then new.moderated_at := now(); end if;
  else
    if new.author_id is distinct from old.author_id or new.material_id is distinct from old.material_id
       or new.created_at is distinct from old.created_at or new.id is distinct from old.id then
      raise exception 'Immutable review ownership' using errcode = '42501';
    end if;
    if new.status is distinct from old.status then
      raise exception 'Moderation is restricted' using errcode = '42501';
    end if;
    new.status := 'pending';
    new.moderated_at := null;
  end if;
  return new;
end;
$$;

-- Preserve the first time payment was manually reported; completion remains independent.
alter table public.study_requests add column payment_reported_at timestamptz;
create index requests_payment_reported_idx on public.study_requests(payment_reported_at) where payment_reported_at is not null;
create function private.track_payment_reported() returns trigger
language plpgsql security invoker set search_path = ''
as $$
begin
  new.payment_reported_at := old.payment_reported_at;
  if old.payment_reported_at is null and old.commercial_status is distinct from 'payment_reported'
     and new.commercial_status = 'payment_reported' then
    new.payment_reported_at := now();
  end if;
  return new;
end;
$$;
revoke all on function private.track_payment_reported() from public, anon, authenticated;
create trigger track_payment_reported before update on public.study_requests
for each row execute function private.track_payment_reported();

create function public.pilot_metrics(p_start timestamptz, p_end timestamptz)
returns jsonb
language plpgsql stable security invoker set search_path = ''
as $$
declare result jsonb;
begin
  if not private.is_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
  if p_start is null or p_end is null or p_start >= p_end or p_end > now() + interval '1 day'
     or p_start < p_end - interval '366 days' then
    raise exception 'Invalid metrics period' using errcode = '22023';
  end if;
  with cohort as (
    select * from public.study_requests where created_at >= p_start and created_at < p_end
  ), first_publications as (
    select request_id, min(published_at) as first_published_at
    from public.recommendation_sets where status = 'published' group by request_id
  ), cohort_totals as (
    select count(*)::int requests,
      count(distinct student_id)::int requesting_students,
      count(*) filter (where payment_reported_at is not null and payment_reported_at < p_end)::int payments_reported,
      count(distinct student_id) filter (where payment_reported_at is not null and payment_reported_at < p_end)::int paying_students,
      coalesce(sum(agreed_price_cents) filter (where payment_reported_at is not null and payment_reported_at < p_end),0)::bigint payment_value_cents,
      count(*) filter (where curator_minutes > 0)::int timed_requests,
      coalesce(sum(curator_minutes),0)::bigint curator_minutes
    from cohort
  ), publication_totals as (
    select count(*)::int selected_requests from cohort c join first_publications f on f.request_id=c.id
      where f.first_published_at < p_end
  ), feedback_totals as (
    select count(*) filter (where kind='usage')::int usage_declarations,
      count(*) filter (where kind='usage' and used_material)::int materials_used,
      count(*) filter (where kind='usage' and used_material and met_objective is not null)::int objective_answers,
      count(*) filter (where kind='usage' and used_material and met_objective)::int objectives_met,
      count(*) filter (where kind='adjustment')::int adjustments
    from public.feedbacks where created_at >= p_start and created_at < p_end
  ), review_totals as (
    select count(*)::int reviews_submitted,
      count(*) filter (where status='approved')::int reviews_approved,
      count(*) filter (where status='pending')::int reviews_pending,
      count(*) filter (where status='rejected')::int reviews_rejected
    from public.reviews where created_at >= p_start and created_at < p_end
  ), event_totals as (
    select count(*) filter (where event_type='catalog_visit')::int catalog_visits,
      count(*) filter (where event_type='filter_applied')::int filters_applied,
      count(*) filter (where event_type='material_opened')::int material_opens
    from public.analytics_events where occurred_at >= p_start and occurred_at < p_end
  )
  select jsonb_build_object(
    'start',p_start,'end',p_end,
    'requests',c.requests,'requesting_students',c.requesting_students,
    'selected_requests',p.selected_requests,
    'payments_reported',c.payments_reported,'paying_students',c.paying_students,
    'payment_value_cents',c.payment_value_cents,
    'timed_requests',c.timed_requests,'curator_minutes',c.curator_minutes,
    'usage_declarations',f.usage_declarations,'materials_used',f.materials_used,
    'objective_answers',f.objective_answers,'objectives_met',f.objectives_met,
    'adjustments',f.adjustments,
    'reviews_submitted',r.reviews_submitted,'reviews_approved',r.reviews_approved,
    'reviews_pending',r.reviews_pending,'reviews_rejected',r.reviews_rejected,
    'catalog_visits',e.catalog_visits,'filters_applied',e.filters_applied,'material_opens',e.material_opens
  ) into result
  from cohort_totals c cross join publication_totals p cross join feedback_totals f
    cross join review_totals r cross join event_totals e;
  return result;
end;
$$;
revoke all on function public.pilot_metrics(timestamptz,timestamptz) from public, anon;
grant execute on function public.pilot_metrics(timestamptz,timestamptz) to authenticated;

commit;
