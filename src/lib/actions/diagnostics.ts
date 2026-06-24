"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Question, ProfilResultat } from "@/lib/types";

export interface DiagnosticRecord {
  id: string;
  thematique: string;
  titre: string;
  description: string | null;
  duree_estimee: number;
  questions: Question[];
  profils: ProfilResultat[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export async function saveDiagnostic(data: {
  thematique: string;
  titre: string;
  description: string;
  duree_estimee: number;
  questions: Question[];
  profils: ProfilResultat[];
  is_published: boolean;
}): Promise<{ id: string }> {
  const rows = await sql`
    INSERT INTO diagnostics (thematique, titre, description, duree_estimee, questions, profils, is_published)
    VALUES (
      ${data.thematique}, ${data.titre}, ${data.description || null},
      ${data.duree_estimee}, ${JSON.stringify(data.questions)},
      ${JSON.stringify(data.profils)}, ${data.is_published}
    )
    RETURNING id
  `;
  revalidatePath("/", "layout");
  return { id: rows[0].id as string };
}

export async function updateDiagnostic(id: string, data: {
  thematique: string;
  titre: string;
  description: string;
  duree_estimee: number;
  questions: Question[];
  profils: ProfilResultat[];
  is_published: boolean;
}): Promise<void> {
  await sql`
    UPDATE diagnostics
    SET thematique    = ${data.thematique},
        titre         = ${data.titre},
        description   = ${data.description || null},
        duree_estimee = ${data.duree_estimee},
        questions     = ${JSON.stringify(data.questions)},
        profils       = ${JSON.stringify(data.profils)},
        is_published  = ${data.is_published},
        updated_at    = NOW()
    WHERE id = ${id}
  `;
  revalidatePath("/", "layout");
}

export async function publishDiagnostic(id: string): Promise<void> {
  await sql`UPDATE diagnostics SET is_published = TRUE, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath("/", "layout");
}

export async function deleteDiagnostic(id: string): Promise<void> {
  await sql`DELETE FROM diagnostics WHERE id = ${id}`;
  revalidatePath("/", "layout");
}

export async function getDiagnostics(): Promise<DiagnosticRecord[]> {
  const rows = await sql`SELECT * FROM diagnostics ORDER BY created_at DESC`;
  return rows as unknown as DiagnosticRecord[];
}

export async function getDiagnostic(id: string): Promise<DiagnosticRecord | null> {
  const rows = await sql`SELECT * FROM diagnostics WHERE id = ${id}`;
  return rows.length ? rows[0] as unknown as DiagnosticRecord : null;
}

export async function getHiddenMockIds(): Promise<string[]> {
  const rows = await sql`SELECT diagnostic_id FROM hidden_mock_diagnostics`;
  return rows.map((r) => r.diagnostic_id as string);
}

export async function hideMockDiagnostic(diagnosticId: string): Promise<void> {
  await sql`INSERT INTO hidden_mock_diagnostics (diagnostic_id) VALUES (${diagnosticId}) ON CONFLICT DO NOTHING`;
  revalidatePath("/", "layout");
}

export async function getHiddenThematiqueIds(): Promise<string[]> {
  const rows = await sql`SELECT thematique_id FROM hidden_thematiques`;
  return rows.map((r) => r.thematique_id as string);
}

export async function hideThematique(thematiqueId: string): Promise<void> {
  await sql`INSERT INTO hidden_thematiques (thematique_id) VALUES (${thematiqueId}) ON CONFLICT DO NOTHING`;
  revalidatePath("/", "layout");
}

export async function unhideThematique(thematiqueId: string): Promise<void> {
  await sql`DELETE FROM hidden_thematiques WHERE thematique_id = ${thematiqueId}`;
  revalidatePath("/", "layout");
}

export async function seedMockDiagnostic(data: {
  thematique: string;
  titre: string;
  description: string;
  duree_estimee: number;
  questions: Question[];
  profils: ProfilResultat[];
}): Promise<{ id: string }> {
  return saveDiagnostic({ ...data, is_published: true });
}
