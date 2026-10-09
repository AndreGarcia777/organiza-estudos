import "server-only";
import { cache } from "react";
import { demoMaterials, type Material } from "@/data/demo-materials";
import { createPublicSupabase } from "@/lib/supabase/public";
import { appMode } from "@/lib/app-mode";

export type CatalogMaterial = Material & { id?: string; isDemo: boolean; externalPrice?: number | null; priceCheckedAt?: string | null };
export const getCatalog = cache(async (): Promise<CatalogMaterial[]> => {
  if (appMode() === "demo") return demoMaterials.map((material) => ({ ...material, isDemo: true }));
  const client = createPublicSupabase();
  if (!client) throw new Error("Catálogo não configurado.");
  const [materials, topics, links] = await Promise.all([
    client.from("materials").select("*").eq("status", "published").order("title").limit(1000),
    client.from("topics").select("id,name").limit(1000),
    client.from("material_topics").select("material_id,topic_id").limit(1000),
  ]);
  if (materials.error || topics.error || links.error) throw new Error("Catálogo indisponível.");
  return materials.data.map((material) => ({
    id: material.id, slug: material.slug, title: material.title, author: material.author,
    topics: links.data.filter((link) => link.material_id === material.id).map((link) => topics.data.find((topic) => topic.id === link.topic_id)?.name).filter((name): name is string => Boolean(name)),
    level: material.level, format: material.format, language: material.language,
    access: material.access as Material["access"], summary: material.summary,
    coverage: material.coverage, limitations: material.limitations, prerequisites: material.prerequisites,
    duration: material.duration, studyEstimate: material.study_estimate, reviewedAt: material.reviewed_at,
    curation: material.curation, url: material.original_url, isDemo: false,
    externalPrice: material.external_price_cents, priceCheckedAt: material.price_checked_at,
  }));
});

export async function getPublicReviews(materialId?: string) {
  if (!materialId || appMode() === "demo") return [];
  const client = createPublicSupabase();
  if (!client) throw new Error("Avaliações não configuradas.");
  const { data, error } = await client.from("published_reviews")
    .select("id,display_name,subject,topics,study_context,institution,positives,limitations,recommends,used_material")
    .eq("material_id", materialId).order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error("Avaliações indisponíveis.");
  return data;
}

export async function getOffer() {
  if (appMode() === "demo") return null;
  const client = createPublicSupabase();
  if (!client) throw new Error("Oferta não configurada.");
  const { data, error } = await client.from("offer_settings").select("*").eq("id", true).single();
  if (error) throw new Error("Oferta indisponível.");
  return data;
}
