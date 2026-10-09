-- Foundation only. No demo catalog, contacts or default administrator are seeded.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema private revoke execute on functions from public;

create table private.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);
alter table private.admin_members enable row level security;
revoke all on private.admin_members from public, anon, authenticated;

-- The only privileged lookup; no arguments, no mutation, no metadata-based roles.
create function private.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from private.admin_members where user_id = auth.uid()
  );
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

create function public.is_admin() returns boolean
language sql stable security invoker set search_path = ''
as $$ select private.is_admin(); $$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create table public.profiles (
  id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  display_name text not null default 'Estudante' check (char_length(trim(display_name)) between 2 and 60),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy profiles_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy profiles_create on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy profiles_edit on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
grant select on public.profiles to authenticated;
grant insert (display_name), update (display_name) on public.profiles to authenticated;

create table public.offer_settings (
  id boolean primary key default true check (id),
  price_cents integer not null default 1990 check (price_cents between 0 and 1000000),
  offer_text text not null default 'Seleção personalizada por demanda' check (char_length(offer_text) between 1 and 500),
  delivery_text text check (char_length(delivery_text) <= 500),
  public_whatsapp text check (public_whatsapp ~ '^[1-9][0-9]{7,14}$'),
  pilot_enabled boolean not null default false,
  requests_enabled boolean not null default false
);
insert into public.offer_settings (id) values (true);
alter table public.offer_settings enable row level security;
create policy offer_read on public.offer_settings for select to anon, authenticated using (true);
create policy offer_admin on public.offer_settings for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
grant select on public.offer_settings to anon, authenticated;
grant update on public.offer_settings to authenticated;

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 2 and 100)
);
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(trim(title)) between 2 and 200),
  author text not null check (char_length(trim(author)) between 2 and 200),
  original_url text check (original_url ~ '^https?://[^[:space:]]+$' and char_length(original_url) <= 2048),
  summary text not null check (char_length(summary) between 1 and 1000),
  coverage text not null check (char_length(coverage) between 1 and 4000),
  limitations text not null check (char_length(limitations) between 1 and 4000),
  prerequisites text not null check (char_length(prerequisites) between 1 and 2000),
  level text not null check (level in ('Iniciante','Intermediário','Avançado')),
  format text not null check (char_length(format) between 2 and 60),
  language text not null check (char_length(language) between 2 and 60),
  access text not null check (access in ('Gratuito','Pago','Parcialmente gratuito')),
  duration text check (char_length(duration) <= 100),
  study_estimate text check (char_length(study_estimate) <= 100),
  external_price_cents integer check (external_price_cents >= 0),
  price_checked_at date,
  reviewed_at date,
  curation text not null check (char_length(curation) between 1 and 4000),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  check (external_price_cents is null or price_checked_at is not null)
);
create table public.material_topics (
  material_id uuid not null references public.materials(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  primary key (material_id, topic_id)
);
create index material_topics_topic_idx on public.material_topics(topic_id);
create index materials_status_idx on public.materials(status);
alter table public.topics enable row level security;
alter table public.materials enable row level security;
alter table public.material_topics enable row level security;
create policy materials_read on public.materials for select to anon, authenticated
  using (status = 'published' or (select private.is_admin()));
create policy materials_admin on public.materials for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy topics_read on public.topics for select to anon, authenticated using (true);
create policy topics_admin on public.topics for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy material_topics_read on public.material_topics for select to anon, authenticated
  using (exists (select 1 from public.materials m where m.id = material_id));
create policy material_topics_admin on public.material_topics for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
grant select on public.materials, public.topics, public.material_topics to anon, authenticated;
grant insert, update, delete on public.materials, public.topics, public.material_topics to authenticated;

create table public.study_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  subject text not null check (char_length(trim(subject)) between 2 and 150),
  topics text not null check (char_length(trim(topics)) between 2 and 2000),
  objective text not null check (objective in ('prova','trabalho','compreensao','outro')),
  knowledge_level text not null check (knowledge_level in ('Iniciante','Intermediário','Avançado')),
  prerequisites text not null check (char_length(prerequisites) <= 2000),
  deadline date,
  study_hours numeric(6,2) not null check (study_hours > 0 and study_hours <= 1000),
  formats text[] not null default '{}',
  languages text[] not null default '{"Português"}',
  free_only boolean not null default true,
  external_budget_cents integer check (external_budget_cents >= 0),
  tried_materials text check (char_length(tried_materials) <= 2000),
  notes text check (char_length(notes) <= 2000),
  contact_email text not null,
  whatsapp text check (whatsapp ~ '^[1-9][0-9]{7,14}$'),
  preferred_channel text not null default 'email' check (preferred_channel in ('email','whatsapp')),
  offer_snapshot jsonb not null,
  state text not null default 'received' check (state in ('received','in_review','awaiting_information','selection_available','adjustment_requested','completed','cancelled')),
  commercial_status text not null default 'to_agree' check (commercial_status in ('free_pilot','to_agree','awaiting_payment','payment_reported','cancelled')),
  agreed_price_cents integer check (agreed_price_cents >= 0),
  curator_minutes integer not null default 0 check (curator_minutes >= 0),
  created_at timestamptz not null default now(),
  check (preferred_channel <> 'whatsapp' or whatsapp is not null),
  check (not free_only or coalesce(external_budget_cents,0) = 0),
  check (cardinality(formats) <= 10 and cardinality(languages) between 1 and 10)
);
create index requests_student_created_idx on public.study_requests(student_id, created_at desc);
create index requests_state_idx on public.study_requests(state);
alter table public.study_requests enable row level security;
create policy requests_read on public.study_requests for select to authenticated
  using (student_id = (select auth.uid()) or (select private.is_admin()));
create policy requests_create on public.study_requests for insert to authenticated
  with check (student_id = (select auth.uid()) and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false));
create policy requests_admin_update on public.study_requests for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
grant select, update on public.study_requests to authenticated;
grant insert (subject,topics,objective,knowledge_level,prerequisites,deadline,study_hours,formats,languages,free_only,external_budget_cents,tried_materials,notes,whatsapp,preferred_channel)
  on public.study_requests to authenticated;

-- The snapshot is computed in the database, not accepted from a browser.
create function private.prepare_request() returns trigger
language plpgsql security invoker set search_path = ''
as $$
declare offer public.offer_settings%rowtype;
begin
  if tg_op = 'UPDATE' then
    if new.student_id is distinct from old.student_id or new.offer_snapshot is distinct from old.offer_snapshot
       or new.created_at is distinct from old.created_at or new.id is distinct from old.id then
      raise exception 'Immutable request history' using errcode = '42501';
    end if;
    return new;
  end if;
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into strict offer from public.offer_settings where id;
  if not offer.requests_enabled then raise exception 'Requests are closed' using errcode = '23514'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  if (select count(*) from public.study_requests where student_id = auth.uid() and created_at > now() - interval '1 day') >= 10 then
    raise exception 'Daily request limit reached' using errcode = '23514';
  end if;
  new.student_id := auth.uid();
  new.contact_email := auth.jwt()->>'email';
  if new.contact_email is null then raise exception 'Account email required' using errcode = '23514'; end if;
  new.offer_snapshot := jsonb_build_object('price_cents',offer.price_cents,'offer_text',offer.offer_text,'delivery_text',offer.delivery_text,'pilot_enabled',offer.pilot_enabled,'accepted_at',now());
  new.state := 'received';
  new.commercial_status := 'to_agree';
  new.agreed_price_cents := null;
  new.curator_minutes := 0;
  return new;
end;
$$;
revoke all on function private.prepare_request() from public, anon, authenticated;
create trigger prepare_request before insert or update on public.study_requests
for each row execute function private.prepare_request();

create table public.recommendation_sets (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.study_requests(id) on delete cascade,
  version integer not null check (version > 0),
  status text not null default 'draft' check (status in ('draft','published')),
  no_suitable_material_reason text check (char_length(no_suitable_material_reason) between 5 and 2000),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique(request_id, version),
  check ((status = 'published') = (published_at is not null))
);
create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  selection_id uuid not null references public.recommendation_sets(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  position integer not null check (position between 1 and 3),
  material_snapshot jsonb not null check (jsonb_typeof(material_snapshot) = 'object'),
  rationale text not null check (char_length(rationale) between 5 and 4000),
  covered_topics text not null check (char_length(covered_topics) between 1 and 2000),
  limitations text not null check (char_length(limitations) between 1 and 2000),
  prerequisites text not null check (char_length(prerequisites) between 1 and 2000),
  prioritize text not null check (char_length(prioritize) between 1 and 2000),
  unique(selection_id, position)
);
create index recommendations_material_idx on public.recommendations(material_id);
alter table public.recommendation_sets enable row level security;
alter table public.recommendations enable row level security;
create policy selections_read on public.recommendation_sets for select to authenticated
  using ((select private.is_admin()) or (status = 'published' and exists (
    select 1 from public.study_requests r where r.id = request_id and r.student_id = (select auth.uid())
  )));
create policy selections_admin on public.recommendation_sets for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy recommendations_read on public.recommendations for select to authenticated
  using (exists (select 1 from public.recommendation_sets s where s.id = selection_id));
create policy recommendations_admin on public.recommendations for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
grant select, insert, update, delete on public.recommendation_sets, public.recommendations to authenticated;

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 60),
  used_material boolean not null check (used_material),
  subject text not null check (char_length(subject) between 2 and 150),
  topics text not null check (char_length(topics) between 2 and 1000),
  study_context text not null check (char_length(study_context) between 2 and 1000),
  institution text check (char_length(institution) <= 150),
  positives text not null check (char_length(positives) between 2 and 2000),
  limitations text not null check (char_length(limitations) between 2 and 2000),
  recommends boolean not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  unique(author_id, material_id)
);
create index reviews_material_status_idx on public.reviews(material_id, status);
alter table public.reviews enable row level security;
create policy reviews_read on public.reviews for select to anon, authenticated
  using ((status = 'approved' and exists(select 1 from public.materials m where m.id = material_id and m.status = 'published'))
    or author_id = (select auth.uid()) or (select private.is_admin()));
create policy reviews_create on public.reviews for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'pending' and exists(select 1 from public.materials m where m.id = material_id and m.status = 'published'));
create policy reviews_edit on public.reviews for update to authenticated
  using (author_id = (select auth.uid()) or (select private.is_admin()))
  with check (author_id = (select auth.uid()) or (select private.is_admin()));
-- Public readers cannot select author_id, even through the REST API.
grant select (id, material_id, display_name, used_material, subject, topics, study_context, institution, positives, limitations, recommends, status, created_at)
  on public.reviews to anon, authenticated;
grant insert (material_id,display_name,used_material,subject,topics,study_context,institution,positives,limitations,recommends)
  on public.reviews to authenticated;
grant update (display_name,used_material,subject,topics,study_context,institution,positives,limitations,recommends,status)
  on public.reviews to authenticated;
create function private.moderate_review() returns trigger
language plpgsql security invoker set search_path = ''
as $$
begin
  if not private.is_admin() then
    if new.status is distinct from old.status then raise exception 'Moderation is restricted' using errcode = '42501'; end if;
    new.status := 'pending';
  end if;
  return new;
end;
$$;
revoke all on function private.moderate_review() from public, anon, authenticated;
create trigger moderate_review before update on public.reviews
for each row execute function private.moderate_review();

create view public.published_reviews with (security_invoker = true) as
select id,material_id,display_name,used_material,subject,topics,study_context,institution,positives,limitations,recommends,created_at
from public.reviews where status = 'approved';
grant select on public.published_reviews to anon, authenticated;

create table public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.study_requests(id) on delete cascade,
  student_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recommendation_id uuid references public.recommendations(id),
  kind text not null check (kind in ('usage','adjustment')),
  used_material boolean,
  met_objective boolean,
  search_effort text check (char_length(search_effort) <= 1000),
  message text not null check (char_length(trim(message)) between 2 and 2000),
  created_at timestamptz not null default now()
);
create index feedbacks_request_idx on public.feedbacks(request_id);
create index feedbacks_student_idx on public.feedbacks(student_id);
create index feedbacks_recommendation_idx on public.feedbacks(recommendation_id);
alter table public.feedbacks enable row level security;
create policy feedbacks_read on public.feedbacks for select to authenticated
  using (student_id = (select auth.uid()) or (select private.is_admin()));
create policy feedbacks_create on public.feedbacks for insert to authenticated
  with check (student_id = (select auth.uid()) and exists (
    select 1 from public.study_requests r where r.id = request_id and r.student_id = (select auth.uid())
  ) and (recommendation_id is null or exists (
    select 1 from public.recommendations rec join public.recommendation_sets s on s.id = rec.selection_id
    where rec.id = recommendation_id and s.request_id = feedbacks.request_id and s.status = 'published'
  )));
grant select on public.feedbacks to authenticated;
grant insert (request_id,recommendation_id,kind,used_material,met_objective,search_effort,message) on public.feedbacks to authenticated;

-- Explicitly remove any inherited default API access before granting the intended privileges.
-- service_role is never configured in the application; migrations/admin bootstrap use trusted SQL.
revoke all on public.profiles, public.study_requests, public.recommendation_sets, public.recommendations, public.feedbacks from anon;
commit;
