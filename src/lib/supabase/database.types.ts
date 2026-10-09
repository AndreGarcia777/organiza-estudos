// Generated from versioned SQL migrations. Run npm run db:types after schema changes.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type Database = { public: { Tables: {
"analytics_events": {
Row: {
"event_key": string;
"event_type": string;
"material_id": string | null;
"occurred_at": string;
};
Insert: {
"event_key": string;
"event_type": string;
"material_id"?: string | null;
"occurred_at"?: string;
};
Update: {
"event_key"?: string;
"event_type"?: string;
"material_id"?: string | null;
"occurred_at"?: string;
};
Relationships: [];
};
"feedbacks": {
Row: {
"id": string;
"request_id": string;
"student_id": string;
"recommendation_id": string | null;
"kind": string;
"used_material": boolean | null;
"met_objective": boolean | null;
"search_effort": string | null;
"message": string;
"created_at": string;
};
Insert: {
"id"?: string;
"request_id": string;
"student_id"?: string;
"recommendation_id"?: string | null;
"kind": string;
"used_material"?: boolean | null;
"met_objective"?: boolean | null;
"search_effort"?: string | null;
"message": string;
"created_at"?: string;
};
Update: {
"id"?: string;
"request_id"?: string;
"student_id"?: string;
"recommendation_id"?: string | null;
"kind"?: string;
"used_material"?: boolean | null;
"met_objective"?: boolean | null;
"search_effort"?: string | null;
"message"?: string;
"created_at"?: string;
};
Relationships: [];
};
"material_topics": {
Row: {
"material_id": string;
"topic_id": string;
};
Insert: {
"material_id": string;
"topic_id": string;
};
Update: {
"material_id"?: string;
"topic_id"?: string;
};
Relationships: [];
};
"materials": {
Row: {
"id": string;
"slug": string;
"title": string;
"author": string;
"original_url": string | null;
"summary": string;
"coverage": string;
"limitations": string;
"prerequisites": string;
"level": string;
"format": string;
"language": string;
"access": string;
"duration": string | null;
"study_estimate": string | null;
"external_price_cents": number | null;
"price_checked_at": string | null;
"reviewed_at": string | null;
"curation": string;
"status": string;
"created_at": string;
};
Insert: {
"id"?: string;
"slug": string;
"title": string;
"author": string;
"original_url"?: string | null;
"summary": string;
"coverage": string;
"limitations": string;
"prerequisites": string;
"level": string;
"format": string;
"language": string;
"access": string;
"duration"?: string | null;
"study_estimate"?: string | null;
"external_price_cents"?: number | null;
"price_checked_at"?: string | null;
"reviewed_at"?: string | null;
"curation": string;
"status"?: string;
"created_at"?: string;
};
Update: {
"id"?: string;
"slug"?: string;
"title"?: string;
"author"?: string;
"original_url"?: string | null;
"summary"?: string;
"coverage"?: string;
"limitations"?: string;
"prerequisites"?: string;
"level"?: string;
"format"?: string;
"language"?: string;
"access"?: string;
"duration"?: string | null;
"study_estimate"?: string | null;
"external_price_cents"?: number | null;
"price_checked_at"?: string | null;
"reviewed_at"?: string | null;
"curation"?: string;
"status"?: string;
"created_at"?: string;
};
Relationships: [];
};
"offer_settings": {
Row: {
"id": boolean;
"price_cents": number;
"offer_text": string;
"delivery_text": string | null;
"public_whatsapp": string | null;
"pilot_enabled": boolean;
"requests_enabled": boolean;
};
Insert: {
"id"?: boolean;
"price_cents"?: number;
"offer_text"?: string;
"delivery_text"?: string | null;
"public_whatsapp"?: string | null;
"pilot_enabled"?: boolean;
"requests_enabled"?: boolean;
};
Update: {
"id"?: boolean;
"price_cents"?: number;
"offer_text"?: string;
"delivery_text"?: string | null;
"public_whatsapp"?: string | null;
"pilot_enabled"?: boolean;
"requests_enabled"?: boolean;
};
Relationships: [];
};
"profiles": {
Row: {
"id": string;
"display_name": string;
"created_at": string;
};
Insert: {
"id"?: string;
"display_name"?: string;
"created_at"?: string;
};
Update: {
"id"?: string;
"display_name"?: string;
"created_at"?: string;
};
Relationships: [];
};
"recommendation_sets": {
Row: {
"id": string;
"request_id": string;
"version": number;
"status": string;
"no_suitable_material_reason": string | null;
"published_at": string | null;
"created_at": string;
"single_option_reason": string | null;
};
Insert: {
"id"?: string;
"request_id": string;
"version": number;
"status"?: string;
"no_suitable_material_reason"?: string | null;
"published_at"?: string | null;
"created_at"?: string;
"single_option_reason"?: string | null;
};
Update: {
"id"?: string;
"request_id"?: string;
"version"?: number;
"status"?: string;
"no_suitable_material_reason"?: string | null;
"published_at"?: string | null;
"created_at"?: string;
"single_option_reason"?: string | null;
};
Relationships: [];
};
"recommendations": {
Row: {
"id": string;
"selection_id": string;
"material_id": string | null;
"position": number;
"material_snapshot": Json;
"rationale": string;
"covered_topics": string;
"limitations": string;
"prerequisites": string;
"prioritize": string;
};
Insert: {
"id"?: string;
"selection_id": string;
"material_id"?: string | null;
"position": number;
"material_snapshot": Json;
"rationale": string;
"covered_topics": string;
"limitations": string;
"prerequisites": string;
"prioritize": string;
};
Update: {
"id"?: string;
"selection_id"?: string;
"material_id"?: string | null;
"position"?: number;
"material_snapshot"?: Json;
"rationale"?: string;
"covered_topics"?: string;
"limitations"?: string;
"prerequisites"?: string;
"prioritize"?: string;
};
Relationships: [];
};
"request_answers": {
Row: {
"id": string;
"request_id": string;
"question": string;
"message": string;
"created_at": string;
"student_id": string;
};
Insert: {
"id"?: string;
"request_id": string;
"question"?: string;
"message": string;
"created_at"?: string;
"student_id"?: string;
};
Update: {
"id"?: string;
"request_id"?: string;
"question"?: string;
"message"?: string;
"created_at"?: string;
"student_id"?: string;
};
Relationships: [];
};
"reviews": {
Row: {
"id": string;
"author_id": string;
"material_id": string;
"display_name": string;
"used_material": boolean;
"subject": string;
"topics": string;
"study_context": string;
"institution": string | null;
"positives": string;
"limitations": string;
"recommends": boolean;
"status": string;
"created_at": string;
"updated_at": string;
"moderated_at": string | null;
};
Insert: {
"id"?: string;
"author_id"?: string;
"material_id": string;
"display_name": string;
"used_material": boolean;
"subject": string;
"topics": string;
"study_context": string;
"institution"?: string | null;
"positives": string;
"limitations": string;
"recommends": boolean;
"status"?: string;
"created_at"?: string;
"updated_at"?: string;
"moderated_at"?: string | null;
};
Update: {
"id"?: string;
"author_id"?: string;
"material_id"?: string;
"display_name"?: string;
"used_material"?: boolean;
"subject"?: string;
"topics"?: string;
"study_context"?: string;
"institution"?: string | null;
"positives"?: string;
"limitations"?: string;
"recommends"?: boolean;
"status"?: string;
"created_at"?: string;
"updated_at"?: string;
"moderated_at"?: string | null;
};
Relationships: [];
};
"study_requests": {
Row: {
"id": string;
"student_id": string;
"subject": string;
"topics": string;
"objective": string;
"knowledge_level": string;
"prerequisites": string;
"deadline": string | null;
"study_hours": number;
"formats": string[];
"languages": string[];
"free_only": boolean;
"external_budget_cents": number | null;
"tried_materials": string | null;
"notes": string | null;
"contact_email": string;
"whatsapp": string | null;
"preferred_channel": string;
"offer_snapshot": Json;
"state": string;
"commercial_status": string;
"agreed_price_cents": number | null;
"curator_minutes": number;
"created_at": string;
"submission_key": string;
"information_prompt": string | null;
"payment_reported_at": string | null;
};
Insert: {
"id"?: string;
"student_id"?: string;
"subject": string;
"topics": string;
"objective": string;
"knowledge_level": string;
"prerequisites": string;
"deadline"?: string | null;
"study_hours": number;
"formats"?: string[];
"languages"?: string[];
"free_only"?: boolean;
"external_budget_cents"?: number | null;
"tried_materials"?: string | null;
"notes"?: string | null;
"contact_email": string;
"whatsapp"?: string | null;
"preferred_channel"?: string;
"offer_snapshot": Json;
"state"?: string;
"commercial_status"?: string;
"agreed_price_cents"?: number | null;
"curator_minutes"?: number;
"created_at"?: string;
"submission_key"?: string;
"information_prompt"?: string | null;
"payment_reported_at"?: string | null;
};
Update: {
"id"?: string;
"student_id"?: string;
"subject"?: string;
"topics"?: string;
"objective"?: string;
"knowledge_level"?: string;
"prerequisites"?: string;
"deadline"?: string | null;
"study_hours"?: number;
"formats"?: string[];
"languages"?: string[];
"free_only"?: boolean;
"external_budget_cents"?: number | null;
"tried_materials"?: string | null;
"notes"?: string | null;
"contact_email"?: string;
"whatsapp"?: string | null;
"preferred_channel"?: string;
"offer_snapshot"?: Json;
"state"?: string;
"commercial_status"?: string;
"agreed_price_cents"?: number | null;
"curator_minutes"?: number;
"created_at"?: string;
"submission_key"?: string;
"information_prompt"?: string | null;
"payment_reported_at"?: string | null;
};
Relationships: [];
};
"topics": {
Row: {
"id": string;
"name": string;
};
Insert: {
"id"?: string;
"name": string;
};
Update: {
"id"?: string;
"name"?: string;
};
Relationships: [];
};
}; Views: {
"published_reviews": { Row: {
"id": string | null;
"material_id": string | null;
"display_name": string | null;
"used_material": boolean | null;
"subject": string | null;
"topics": string | null;
"study_context": string | null;
"institution": string | null;
"positives": string | null;
"limitations": string | null;
"recommends": boolean | null;
"created_at": string | null;
}; Relationships: []; };
}; Functions: { is_admin: { Args: Record<string, never>; Returns: boolean }; submit_request: {Args:{payload:Json;submission:string;accepted_offer:Json};Returns:string}; save_material: {Args:{payload:Json;topic_names:string[]};Returns:string}; save_selection: {Args:{request:string;options:Json;missing_reason:string;single_reason:string};Returns:string}; publish_selection: {Args:{selection:string};Returns:undefined}; record_catalog_event: {Args:{p_event_key:string;p_event_type:string;p_material_id?:string|null};Returns:boolean}; pilot_metrics: {Args:{p_start:string;p_end:string};Returns:Json};}; Enums: Record<string, never>; CompositeTypes: Record<string, never> } };
