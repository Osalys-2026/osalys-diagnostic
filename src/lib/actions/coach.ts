"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface CoachProfile {
  name: string;
  title: string;
  description: string;
  photo_url: string;
  calendly_url: string;
}

export async function getCoachProfile(): Promise<CoachProfile> {
  await sql`ALTER TABLE coach_profile ADD COLUMN IF NOT EXISTS calendly_url TEXT NOT NULL DEFAULT ''`;
  const rows = await sql`SELECT name, title, description, photo_url, calendly_url FROM coach_profile WHERE id = 1`;
  if (!rows.length) return { name: "", title: "", description: "", photo_url: "", calendly_url: "" };
  return rows[0] as CoachProfile;
}

export async function saveCoachProfile(data: CoachProfile): Promise<void> {
  await sql`
    UPDATE coach_profile
    SET name = ${data.name}, title = ${data.title},
        description = ${data.description}, photo_url = ${data.photo_url},
        calendly_url = ${data.calendly_url},
        updated_at = NOW()
    WHERE id = 1
  `;
  revalidatePath("/", "layout");
}
