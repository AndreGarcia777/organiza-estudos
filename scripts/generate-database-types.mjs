import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir, writeFile } from "node:fs/promises";
const db = new PGlite();
try {
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql as $$ select null::uuid $$;
    create function auth.jwt() returns jsonb language sql as $$ select '{}'::jsonb $$;
  `);
  for (const name of (await readdir("supabase/migrations")).filter((x) => x.endsWith(".sql")).sort()) {
    await db.exec(await readFile("supabase/migrations/" + name, "utf8"));
  }
  const { rows } = await db.query(`
    select c.table_name,c.column_name,c.data_type,c.udt_name,c.is_nullable,c.column_default,t.table_type
    from information_schema.columns c join information_schema.tables t using (table_schema,table_name)
    where c.table_schema='public' order by c.table_name,c.ordinal_position
  `);
  function type(c) {
    const base = c.data_type === "ARRAY" ? "string[]" : ["integer","bigint","smallint","numeric","double precision","real"].includes(c.data_type) ? "number" : c.data_type === "boolean" ? "boolean" : ["json","jsonb"].includes(c.data_type) ? "Json" : "string";
    return base + (c.is_nullable === "YES" ? " | null" : "");
  }
  const tables = [...new Set(rows.filter((x) => x.table_type === "BASE TABLE").map((x) => x.table_name))];
  const views = [...new Set(rows.filter((x) => x.table_type === "VIEW").map((x) => x.table_name))];
  let output = "// Generated from versioned SQL migrations. Run npm run db:types after schema changes.\n";
  output += "export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];\n";
  output += "export type Database = { public: { Tables: {\n";
  for (const table of tables) {
    const columns = rows.filter((x) => x.table_name === table);
    output += JSON.stringify(table) + ": {\n";
    for (const kind of ["Row","Insert","Update"]) {
      output += kind + ": {\n";
      for (const c of columns) output += JSON.stringify(c.column_name) + ((kind === "Update" || (kind === "Insert" && (c.column_default || c.is_nullable === "YES" || (table === "request_answers" && c.column_name === "question")))) ? "?" : "") + ": " + type(c) + ";\n";
      output += "};\n";
    }
    output += "Relationships: [];\n};\n";
  }
  output += "}; Views: {\n";
  for (const view of views) {
    output += JSON.stringify(view) + ": { Row: {\n";
    for (const c of rows.filter((x) => x.table_name === view)) output += JSON.stringify(c.column_name) + ": " + type(c) + ";\n";
    output += "}; Relationships: []; };\n";
  }
  output += "}; Functions: { is_admin: { Args: Record<string, never>; Returns: boolean }; submit_request: {Args:{payload:Json;submission:string;accepted_offer:Json};Returns:string}; save_material: {Args:{payload:Json;topic_names:string[]};Returns:string}; save_selection: {Args:{request:string;options:Json;missing_reason:string;single_reason:string};Returns:string}; publish_selection: {Args:{selection:string};Returns:undefined}; record_catalog_event: {Args:{p_event_key:string;p_event_type:string;p_material_id?:string|null};Returns:boolean}; pilot_metrics: {Args:{p_start:string;p_end:string};Returns:Json};}; Enums: Record<string, never>; CompositeTypes: Record<string, never> } };\n";
  await writeFile("src/lib/supabase/database.types.ts", output);
  console.log("Tipos gerados das migrações. Relacionamentos não são expandidos; consultas usam tabelas explícitas.");
} finally { await db.close(); }
