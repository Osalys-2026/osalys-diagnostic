"use server";

import { sql } from "@/lib/db";

export interface SavePassationInput {
  prenom: string;
  nom?: string;
  email: string;
  metier?: string;
  entreprise?: string;
  rgpd_consent: boolean;
  thematique: string;
  diagnostic: string;
  score: number;
  profil: string;
}

export async function savePassation(input: SavePassationInput): Promise<{ passationId: string }> {
  const rows = await sql`
    INSERT INTO leads (prenom, nom, email, metier, entreprise, rgpd_consent)
    VALUES (${input.prenom}, ${input.nom ?? null}, ${input.email}, ${input.metier ?? null}, ${input.entreprise ?? null}, ${input.rgpd_consent})
    RETURNING id
  `;

  const leadId = rows[0].id as string;

  const passationRows = await sql`
    INSERT INTO passations (lead_id, thematique, diagnostic, score, profil)
    VALUES (${leadId}, ${input.thematique}, ${input.diagnostic}, ${input.score}, ${input.profil})
    RETURNING id
  `;

  return { passationId: passationRows[0].id as string };
}

export async function updateActionPost(passationId: string, action: "rdv" | "site" | "partage") {
  await sql`
    UPDATE passations SET action_post = ${action} WHERE id = ${passationId}
  `;
}
