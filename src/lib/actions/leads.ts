"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface PassationRow {
  thematique: string;
  diagnostic: string;
  score: number;
  profil: string;
  action_post: string | null;
  completed_at: string;
}

export interface LeadRow {
  id: string;
  prenom: string;
  nom: string | null;
  email: string;
  metier: string | null;
  entreprise: string | null;
  status: string;
  created_at: string;
  passations: PassationRow[];
}

export async function getLeads(): Promise<LeadRow[]> {
  const rows = await sql`
    SELECT
      l.id,
      l.prenom,
      l.nom,
      l.email,
      l.metier,
      l.entreprise,
      l.status,
      l.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'thematique',   p.thematique,
            'diagnostic',   p.diagnostic,
            'score',        p.score,
            'profil',       p.profil,
            'action_post',  p.action_post,
            'completed_at', p.completed_at
          ) ORDER BY p.completed_at DESC
        ) FILTER (WHERE p.id IS NOT NULL),
        '[]'
      ) AS passations
    FROM leads l
    LEFT JOIN passations p ON p.lead_id = l.id
    GROUP BY l.id
    ORDER BY l.created_at DESC
  `;
  return rows as unknown as LeadRow[];
}

export async function updateLeadStatus(id: string, status: string) {
  await sql`
    UPDATE leads SET status = ${status}, updated_at = NOW() WHERE id = ${id}
  `;
  revalidatePath("/", "layout");
}

export async function deleteLead(id: string): Promise<void> {
  await sql`DELETE FROM passations WHERE lead_id = ${id}`;
  await sql`DELETE FROM leads WHERE id = ${id}`;
  revalidatePath("/", "layout");
}

export interface StatsRow {
  total_leads: number;
  nouveaux: number;
  score_moyen: number;
  rdv_pris: number;
}

export async function getStats(): Promise<StatsRow> {
  const rows = await sql`
    SELECT
      COUNT(DISTINCT l.id)::int                                          AS total_leads,
      COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'nouveau')::int     AS nouveaux,
      COALESCE(ROUND(AVG(p.score))::int, 0)                             AS score_moyen,
      COUNT(*) FILTER (WHERE p.action_post = 'rdv')::int                AS rdv_pris
    FROM leads l
    LEFT JOIN passations p ON p.lead_id = l.id
  `;
  return rows[0] as StatsRow;
}

export async function getThematiqueStats(visibleTitles?: string[]) {
  const rows = visibleTitles && visibleTitles.length > 0
    ? await sql`
        SELECT
          thematique,
          COUNT(*)::int          AS total,
          ROUND(AVG(score))::int AS score_moyen,
          COUNT(*) FILTER (WHERE action_post = 'rdv')::int AS rdv
        FROM passations
        WHERE thematique = ANY(${visibleTitles})
        GROUP BY thematique
        ORDER BY total DESC
      `
    : await sql`
        SELECT
          thematique,
          COUNT(*)::int          AS total,
          ROUND(AVG(score))::int AS score_moyen,
          COUNT(*) FILTER (WHERE action_post = 'rdv')::int AS rdv
        FROM passations
        GROUP BY thematique
        ORDER BY total DESC
      `;
  return rows as { thematique: string; total: number; score_moyen: number; rdv: number }[];
}
