"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { SkillCategory } from "@/lib/types";

export async function getSkillCategories(): Promise<SkillCategory[]> {
  const rows = await sql`SELECT id, label, "order" FROM skill_categories ORDER BY "order" ASC, created_at ASC`;
  return rows as unknown as SkillCategory[];
}

export async function createSkillCategory(label: string): Promise<SkillCategory> {
  const rows = await sql`
    INSERT INTO skill_categories (label, "order")
    VALUES (${label.trim()}, (SELECT COALESCE(MAX("order"), 0) + 1 FROM skill_categories))
    RETURNING id, label, "order"
  `;
  revalidatePath("/", "layout");
  return rows[0] as unknown as SkillCategory;
}

export async function deleteSkillCategory(id: string): Promise<void> {
  await sql`DELETE FROM skill_categories WHERE id = ${id}`;
  revalidatePath("/", "layout");
}
