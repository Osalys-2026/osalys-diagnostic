"use client";

import { useSearchParams } from "next/navigation";
import { DiagnosticFlow } from "@/components/diagnostic/DiagnosticFlow";
import type { Thematique, SkillCategory } from "@/lib/types";
import type { CoachProfile } from "@/lib/actions/coach";

export function DiagnosticFlowWrapper({ thematiques, coach, categories }: { thematiques: Thematique[]; coach?: CoachProfile; categories?: SkillCategory[] }) {
  const params = useSearchParams();
  const themeId = params.get("theme") ?? undefined;
  return <DiagnosticFlow thematiques={thematiques} initialThemeId={themeId} coach={coach} categories={categories} />;
}
