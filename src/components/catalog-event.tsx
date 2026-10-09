"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type EventType = "catalog_visit" | "filter_applied" | "material_opened";

export function CatalogEvent({ type, token, materialId }: { type: EventType; token: string; materialId?: string }) {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return;
    const storageKey = "guia-estudos:event:v1:" + token;
    let eventKey: string;
    try {
      eventKey = sessionStorage.getItem(storageKey) ?? crypto.randomUUID();
      sessionStorage.setItem(storageKey, eventKey);
    } catch {
      return;
    }
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    void client.rpc("record_catalog_event", {
      p_event_key: eventKey,
      p_event_type: type,
      p_material_id: materialId ?? null,
    });
  }, [materialId, token, type]);
  return null;
}
