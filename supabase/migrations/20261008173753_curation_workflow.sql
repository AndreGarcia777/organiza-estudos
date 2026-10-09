SET local check_function_bodies = off;

CREATE TABLE "public"."request_answers" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "request_id" uuid                     NOT NULL,
  "question"   text                     NOT NULL,
  "message"    text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "request_answers_message_check" CHECK (((char_length(TRIM(BOTH FROM message)) >= 2) AND (char_length(TRIM(BOTH FROM message)) <= 2000))),
  CONSTRAINT "request_answers_pkey" PRIMARY KEY (id),
  "student_id" uuid                     NOT NULL DEFAULT auth.uid()
);

ALTER TABLE "public"."request_answers"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."request_answers" FROM "anon";

ALTER TABLE "public"."recommendation_sets"
  ADD COLUMN "single_option_reason" text;

ALTER TABLE "public"."study_requests"
  ADD COLUMN "submission_key" uuid NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE "public"."study_requests"
  ADD COLUMN "information_prompt" text;

CREATE OR REPLACE FUNCTION private.apply_adjustment()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if new.kind='adjustment' then update public.study_requests set state='adjustment_requested' where id=new.request_id and student_id=auth.uid(); end if;
  return new;
end; $function$;

CREATE OR REPLACE FUNCTION private.guard_feedback()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare current_state text;
begin
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,2));
  select state into current_state from public.study_requests where id=new.request_id and student_id=auth.uid();
  if current_state is null or current_state not in ('selection_available','completed') then raise exception 'Selection is not ready for feedback' using errcode='23514'; end if;
  if new.kind='adjustment' and current_state<>'selection_available' then raise exception 'Request is already closed' using errcode='23514'; end if;
  if new.kind='usage' and (new.used_material is null or (new.used_material and (new.recommendation_id is null or new.met_objective is null)) or nullif(trim(new.search_effort),'') is null) then
    raise exception 'Usage details required' using errcode='23514'; end if;
  if (select count(*) from public.feedbacks where student_id=auth.uid() and created_at>now()-interval '1 day')>=20 then raise exception 'Daily feedback limit reached' using errcode='23514'; end if;
  return new;
end; $function$;

CREATE OR REPLACE FUNCTION private.guard_recommendation()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare set_status text; material public.materials%rowtype;
begin
  select status into set_status from public.recommendation_sets where id=case when tg_op='DELETE' then old.selection_id else new.selection_id end for update;
  -- Cascaded removal of a deleted request is allowed.
  if set_status='published' then raise exception 'Published selection is immutable' using errcode='23514'; end if;
  if tg_op='DELETE' then return old; end if;
  if tg_op='UPDATE' and new.selection_id<>old.selection_id then raise exception 'Selection is immutable' using errcode='23514'; end if;
  select * into material from public.materials where id=new.material_id and status='published';
  if material.id is null then raise exception 'Select a published material' using errcode='23514'; end if;
  new.material_snapshot:=to_jsonb(material)-'created_at'-'status';
  return new;
end; $function$;

CREATE OR REPLACE FUNCTION private.guard_request_workflow()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  if not private.is_admin() then
    if (to_jsonb(new)-'state') is distinct from (to_jsonb(old)-'state')
      or old.state not in ('selection_available','completed') or new.state<>'adjustment_requested'
      or not exists(select 1 from public.feedbacks where request_id=old.id and student_id=auth.uid() and kind='adjustment' and created_at=now())
    then raise exception 'Request update restricted' using errcode='42501'; end if;
  end if;
  if new.state is distinct from old.state and not (
    (old.state='received' and new.state in ('in_review','cancelled')) or
    (old.state='in_review' and new.state in ('awaiting_information','selection_available','cancelled')) or
    (old.state='awaiting_information' and new.state in ('in_review','cancelled')) or
    (old.state='selection_available' and new.state in ('completed','adjustment_requested','cancelled')) or
    (old.state='adjustment_requested' and new.state in ('in_review','cancelled'))
  ) then raise exception 'Invalid state transition' using errcode='23514'; end if;
  if new.state='awaiting_information' and new.information_prompt is null then
    raise exception 'Information question required' using errcode='23514'; end if;
  if new.state='selection_available' and not exists(select 1 from public.recommendation_sets where request_id=old.id and status='published') then
    raise exception 'Publish a selection first' using errcode='23514'; end if;
  if new.commercial_status='free_pilot' and new.agreed_price_cents is distinct from 0 then
    raise exception 'Pilot price must be zero' using errcode='23514'; end if;
  if new.commercial_status in ('awaiting_payment','payment_reported') and coalesce(new.agreed_price_cents,0)<=0 then
    raise exception 'Agreed price required' using errcode='23514'; end if;
  return new;
end; $function$;

CREATE OR REPLACE FUNCTION private.guard_selection()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare total integer;
begin
  if tg_op='DELETE' then
    if old.status='published' and exists(select 1 from public.study_requests where id=old.request_id) then raise exception 'Published selection is immutable' using errcode='23514'; end if;
    return old;
  end if;
  if tg_op='UPDATE' and (old.status='published' or new.request_id<>old.request_id or new.version<>old.version) then raise exception 'Published selection is immutable' using errcode='23514'; end if;
  if new.status='published' then
    if tg_op='INSERT' then raise exception 'Save a draft before publishing' using errcode='23514'; end if;
    select count(*) into total from public.recommendations where selection_id=new.id;
    if total=0 and new.no_suitable_material_reason is null then raise exception 'Explain missing materials' using errcode='23514'; end if;
    if total>0 and new.no_suitable_material_reason is not null then raise exception 'Conflicting selection' using errcode='23514'; end if;
    if total=1 and new.single_option_reason is null then raise exception 'Explain the single option' using errcode='23514'; end if;
    new.published_at:=now();
  end if;
  return new;
end; $function$;

CREATE OR REPLACE FUNCTION private.prepare_answer()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,1));
  select information_prompt into new.question from public.study_requests where id=new.request_id and student_id=auth.uid() and state='awaiting_information';
  if new.question is null then raise exception 'No pending question' using errcode='42501'; end if;
  if (select count(*) from public.request_answers where student_id=auth.uid() and created_at>now()-interval '1 day')>=20 then raise exception 'Daily answer limit reached' using errcode='23514'; end if;
  return new;
end; $function$;

CREATE OR REPLACE FUNCTION public.publish_selection (
  selection uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare request uuid; current_state text;
begin
  if not private.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
  select request_id into request from public.recommendation_sets where id=selection;
  select state into current_state from public.study_requests where id=request for update;
  if current_state<>'in_review' then raise exception 'Move request to analysis first' using errcode='23514'; end if;
  update public.recommendation_sets set status='published',published_at=now() where id=selection and status='draft';
  if not found then raise exception 'Draft not found' using errcode='23514'; end if;
  update public.study_requests set state='selection_available' where id=request;
end; $function$;

REVOKE ALL ON FUNCTION "public"."publish_selection"(uuid) FROM PUBLIC, "anon", "service_role";

CREATE OR REPLACE FUNCTION public.save_material (
  payload     jsonb,
  topic_names text[]
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare material uuid:=coalesce(nullif(payload->>'id','')::uuid,gen_random_uuid()); topic text; topic_id uuid;
begin
  if not private.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
  if cardinality(topic_names) not between 1 and 10 then raise exception 'Choose one to ten topics' using errcode='23514'; end if;
  insert into public.materials(id,slug,title,author,original_url,summary,coverage,limitations,prerequisites,level,format,language,access,duration,study_estimate,external_price_cents,price_checked_at,reviewed_at,curation,status)
  values(material,payload->>'slug',payload->>'title',payload->>'author',nullif(payload->>'original_url',''),payload->>'summary',payload->>'coverage',payload->>'limitations',payload->>'prerequisites',payload->>'level',payload->>'format',payload->>'language',payload->>'access',nullif(payload->>'duration',''),nullif(payload->>'study_estimate',''),(payload->>'external_price_cents')::integer,nullif(payload->>'price_checked_at','')::date,nullif(payload->>'reviewed_at','')::date,payload->>'curation',payload->>'status')
  on conflict(id) do update set slug=excluded.slug,title=excluded.title,author=excluded.author,original_url=excluded.original_url,summary=excluded.summary,coverage=excluded.coverage,limitations=excluded.limitations,prerequisites=excluded.prerequisites,level=excluded.level,format=excluded.format,language=excluded.language,access=excluded.access,duration=excluded.duration,study_estimate=excluded.study_estimate,external_price_cents=excluded.external_price_cents,price_checked_at=excluded.price_checked_at,reviewed_at=excluded.reviewed_at,curation=excluded.curation,status=excluded.status;
  delete from public.material_topics where material_id=material;
  foreach topic in array topic_names loop
    insert into public.topics(name) values(trim(topic)) on conflict(name) do update set name=excluded.name returning id into topic_id;
    insert into public.material_topics(material_id,topic_id) values(material,topic_id) on conflict do nothing;
  end loop;
  return material;
end; $function$;

REVOKE ALL ON FUNCTION "public"."save_material"(jsonb, text[]) FROM PUBLIC, "anon", "service_role";

CREATE OR REPLACE FUNCTION public.save_selection (
  request        uuid,
  options        jsonb,
  missing_reason text,
  single_reason  text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare selection uuid; current_state text; item jsonb; pos integer:=0;
begin
  if not private.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
  select state into current_state from public.study_requests where id=request for update;
  if current_state is null or current_state not in ('in_review','awaiting_information','adjustment_requested') then raise exception 'Request cannot be edited now' using errcode='23514'; end if;
  if jsonb_typeof(options)<>'array' or jsonb_array_length(options)>3 then raise exception 'Maximum three options' using errcode='23514'; end if;
  select id into selection from public.recommendation_sets where request_id=request and status='draft' for update;
  if selection is null then
    insert into public.recommendation_sets(request_id,version) values(request,(select coalesce(max(version),0)+1 from public.recommendation_sets where request_id=request)) returning id into selection;
  end if;
  update public.recommendation_sets set no_suitable_material_reason=nullif(trim(missing_reason),''),single_option_reason=nullif(trim(single_reason),'') where id=selection;
  delete from public.recommendations where selection_id=selection;
  for item in select * from jsonb_array_elements(options) loop
    pos:=pos+1;
    insert into public.recommendations(selection_id,position,material_id,material_snapshot,rationale,covered_topics,limitations,prerequisites,prioritize)
    values(selection,pos,(item->>'material_id')::uuid,'{}',item->>'rationale',item->>'covered_topics',item->>'limitations',item->>'prerequisites',item->>'prioritize');
  end loop;
  return selection;
end; $function$;

REVOKE ALL ON FUNCTION "public"."save_selection"(uuid, jsonb, text, text) FROM PUBLIC, "anon", "service_role";

CREATE OR REPLACE FUNCTION public.submit_request (
  payload        jsonb,
  submission     uuid,
  accepted_offer jsonb
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
declare result uuid; offer public.offer_settings%rowtype;
begin
  if auth.uid() is null or submission is null then raise exception 'Authentication required' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
  select id into result from public.study_requests where student_id=auth.uid() and submission_key=submission;
  if result is not null then return result; end if;
  select * into strict offer from public.offer_settings where id;
  if accepted_offer is distinct from (to_jsonb(offer)-'id'-'public_whatsapp') then
    raise exception 'Offer changed; review it again' using errcode='P0001';
  end if;
  insert into public.study_requests(submission_key,subject,topics,objective,knowledge_level,prerequisites,deadline,study_hours,formats,languages,free_only,external_budget_cents,tried_materials,notes,whatsapp,preferred_channel)
  values(submission,payload->>'subject',payload->>'topics',payload->>'objective',payload->>'knowledge_level',payload->>'prerequisites',nullif(payload->>'deadline','')::date,(payload->>'study_hours')::numeric,
    array(select jsonb_array_elements_text(payload->'formats')),array(select jsonb_array_elements_text(payload->'languages')),
    (payload->>'free_only')::boolean,(payload->>'external_budget_cents')::integer,payload->>'tried_materials',payload->>'notes',payload->>'whatsapp',payload->>'preferred_channel')
  returning id into result;
  -- Recheck the actual trigger snapshot, so a concurrent offer change rolls back this submission.
  if (select offer_snapshot - 'accepted_at' from public.study_requests where id=result)
     is distinct from (accepted_offer - 'requests_enabled') then
    raise exception 'Offer changed; review it again' using errcode='P0001';
  end if;
  return result;
end; $function$;

REVOKE ALL ON FUNCTION "public"."submit_request"(jsonb, uuid, jsonb) FROM PUBLIC, "anon", "service_role";

ALTER TABLE "public"."recommendation_sets"
  ADD CONSTRAINT "recommendation_sets_single_option_reason_check" CHECK (((char_length(single_option_reason) >= 5) AND (char_length(single_option_reason) <= 2000)));

ALTER TABLE "public"."request_answers"
  ADD CONSTRAINT "request_answers_request_id_fkey" FOREIGN KEY (request_id) REFERENCES public.study_requests(id) ON DELETE CASCADE;

ALTER TABLE "public"."study_requests"
  ADD CONSTRAINT "study_requests_information_prompt_check" CHECK (((char_length(information_prompt) >= 5) AND (char_length(information_prompt) <= 2000)));

CREATE INDEX request_answers_request_idx ON public.request_answers USING btree (request_id, created_at);

CREATE UNIQUE INDEX requests_submission_idx ON public.study_requests USING btree (student_id, submission_key);

CREATE UNIQUE INDEX selections_one_draft_idx ON public.recommendation_sets USING btree (request_id)
  WHERE (status = 'draft'::text);

CREATE TRIGGER apply_adjustment
  AFTER INSERT ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION private.apply_adjustment();

CREATE TRIGGER guard_feedback
  BEFORE INSERT ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION private.guard_feedback();

CREATE TRIGGER guard_selection
  BEFORE INSERT OR DELETE OR UPDATE ON public.recommendation_sets
  FOR EACH ROW
  EXECUTE FUNCTION private.guard_selection();

CREATE TRIGGER guard_recommendation
  BEFORE INSERT OR DELETE OR UPDATE ON public.recommendations
  FOR EACH ROW
  EXECUTE FUNCTION private.guard_recommendation();

CREATE TRIGGER prepare_answer
  BEFORE INSERT ON public.request_answers
  FOR EACH ROW
  EXECUTE FUNCTION private.prepare_answer();

CREATE TRIGGER guard_request_workflow
  BEFORE UPDATE ON public.study_requests
  FOR EACH ROW
  EXECUTE FUNCTION private.guard_request_workflow();

CREATE POLICY "requests_owner_state" ON "public"."study_requests"
  FOR UPDATE
  TO "authenticated"
  USING ((student_id = ( SELECT auth.uid() AS uid)))
  WITH CHECK ((student_id = ( SELECT auth.uid() AS uid)));

REVOKE ALL ON FUNCTION "private"."apply_adjustment"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "private"."guard_feedback"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "private"."guard_recommendation"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "private"."guard_request_workflow"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "private"."guard_selection"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "private"."prepare_answer"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."publish_selection"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."publish_selection"(uuid) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."publish_selection"(uuid) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."save_material"(jsonb, text[]) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."save_material"(jsonb, text[]) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."save_material"(jsonb, text[]) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."save_selection"(uuid, jsonb, text, text) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."save_selection"(uuid, jsonb, text, text) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."save_selection"(uuid, jsonb, text, text) TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."submit_request"(jsonb, uuid, jsonb) TO "authenticated";

REVOKE ALL ON FUNCTION "public"."submit_request"(jsonb, uuid, jsonb) FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."submit_request"(jsonb, uuid, jsonb) TO "postgres";

REVOKE ALL ON TABLE "public"."request_answers" FROM "authenticated";

REVOKE ALL ("message") ON TABLE "public"."request_answers" FROM "authenticated";

GRANT INSERT ("message") ON TABLE "public"."request_answers" TO "authenticated";

REVOKE ALL ("request_id") ON TABLE "public"."request_answers" FROM "authenticated";

GRANT INSERT ("request_id") ON TABLE "public"."request_answers" TO "authenticated";

GRANT SELECT ON TABLE "public"."request_answers" TO "authenticated";

REVOKE ALL ON TABLE "public"."request_answers" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."request_answers" TO "postgres";

REVOKE ALL ON TABLE "public"."request_answers" FROM "service_role";

GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLE "public"."request_answers" TO "service_role";

REVOKE ALL ("submission_key") ON TABLE "public"."study_requests" FROM "authenticated";

GRANT INSERT ("submission_key") ON TABLE "public"."study_requests" TO "authenticated";

ALTER TABLE "public"."request_answers"
  ADD CONSTRAINT "request_answers_student_id_fkey" FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX request_answers_student_idx ON public.request_answers USING btree (student_id);

CREATE POLICY "answers_insert" ON "public"."request_answers"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((student_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.study_requests
  WHERE
    ((study_requests.id = request_answers.request_id) AND (study_requests.student_id = ( SELECT auth.uid() AS uid)) AND (study_requests.state = 'awaiting_information'::text))))));

CREATE POLICY "answers_read" ON "public"."request_answers"
  FOR SELECT
  TO "authenticated"
  USING (((student_id = ( SELECT auth.uid() AS uid)) OR ( SELECT private.is_admin() AS is_admin)));
