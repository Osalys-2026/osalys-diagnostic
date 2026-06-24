"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { THEMATIQUES } from "@/lib/mock-data";
import type { Thematique } from "@/lib/types";

export interface CustomThematique {
  id: string;
  titre: string;
  subtitle: string;
  accroche: string;
  created_at: string;
}

export interface ThematiqueOverride {
  id: string;
  titre: string;
  subtitle: string;
  accroche: string;
}

/* ─── Helpers ─── */

function applyMockOverrides(
  thematiques: Thematique[],
  overrides: ThematiqueOverride[]
): Thematique[] {
  return thematiques.map((t) => {
    const o = overrides.find((o) => o.id === t.id);
    return o ? { ...t, titre: o.titre, subtitle: o.subtitle, accroche: o.accroche } : t;
  });
}

/* ─── Overrides (thématiques mock modifiables) ─── */

async function ensureOverridesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS thematique_overrides (
      id TEXT PRIMARY KEY,
      titre TEXT NOT NULL,
      subtitle TEXT NOT NULL DEFAULT '',
      accroche TEXT NOT NULL DEFAULT ''
    )
  `;
}

export async function getThematiqueOverrides(): Promise<ThematiqueOverride[]> {
  await ensureOverridesTable();
  const rows = await sql`SELECT * FROM thematique_overrides`;
  return rows as unknown as ThematiqueOverride[];
}

export async function getResolvedMockThematiques(): Promise<Thematique[]> {
  const overrides = await getThematiqueOverrides();
  return applyMockOverrides(THEMATIQUES, overrides);
}

export async function upsertThematiqueOverride(
  id: string,
  data: { titre: string; subtitle: string; accroche: string }
): Promise<void> {
  await ensureOverridesTable();

  // Determine current effective title to update diagnostics if title changed
  const existing = await sql`SELECT titre FROM thematique_overrides WHERE id = ${id}`;
  const originalMock = THEMATIQUES.find((t) => t.id === id);
  const currentTitre = (existing[0]?.titre as string | undefined) ?? originalMock?.titre ?? "";

  const newTitre = data.titre.trim();
  if (currentTitre && currentTitre.toLowerCase() !== newTitre.toLowerCase()) {
    await sql`UPDATE diagnostics SET thematique = ${newTitre} WHERE LOWER(thematique) = LOWER(${currentTitre})`;
  }

  await sql`
    INSERT INTO thematique_overrides (id, titre, subtitle, accroche)
    VALUES (${id}, ${newTitre}, ${data.subtitle.trim()}, ${data.accroche.trim()})
    ON CONFLICT (id) DO UPDATE SET
      titre    = EXCLUDED.titre,
      subtitle = EXCLUDED.subtitle,
      accroche = EXCLUDED.accroche
  `;
  revalidatePath("/", "layout");
}

/* ─── Custom thématiques ─── */

export async function getCustomThematiques(): Promise<CustomThematique[]> {
  const rows = await sql`SELECT * FROM custom_thematiques ORDER BY created_at ASC`;
  return rows as unknown as CustomThematique[];
}

export async function createThematique(data: {
  titre: string;
  subtitle: string;
  accroche: string;
}): Promise<{ id: string }> {
  const rows = await sql`
    INSERT INTO custom_thematiques (titre, subtitle, accroche)
    VALUES (${data.titre.trim()}, ${data.subtitle.trim()}, ${data.accroche.trim()})
    RETURNING id
  `;
  revalidatePath("/", "layout");
  return { id: rows[0].id as string };
}

export async function updateCustomThematique(
  id: string,
  data: { titre: string; subtitle: string; accroche: string }
): Promise<void> {
  await sql`
    UPDATE custom_thematiques
    SET titre = ${data.titre.trim()}, subtitle = ${data.subtitle.trim()}, accroche = ${data.accroche.trim()}
    WHERE id = ${id}
  `;
  revalidatePath("/", "layout");
}

export async function deleteCustomThematique(id: string): Promise<void> {
  await sql`DELETE FROM custom_thematiques WHERE id = ${id}`;
  revalidatePath("/", "layout");
}
