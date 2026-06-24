import { Suspense } from "react";
import { Header } from "@/components/Header";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DiagnosticFlowWrapper } from "./DiagnosticFlowWrapper";
import { getDiagnostics, getHiddenThematiqueIds } from "@/lib/actions/diagnostics";
import { getCustomThematiques } from "@/lib/actions/thematiques";
import { getCoachProfile } from "@/lib/actions/coach";
import { getSkillCategories } from "@/lib/actions/categories";
import { THEMATIQUES } from "@/lib/mock-data";
import type { Thematique, Diagnostic } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diagnostic Dirigeant — Osalys",
  description: "Passez votre diagnostic personnalisé en 5 minutes et obtenez un résultat immédiat.",
};

export default async function DiagnosticPage() {
  const [dbDiagnostics, hiddenIds, customThematiques, coach, categories] = await Promise.all([
    getDiagnostics(),
    getHiddenThematiqueIds(),
    getCustomThematiques(),
    getCoachProfile(),
    getSkillCategories(),
  ]);

  // Merge DB diagnostics into mock THEMATIQUES (filter hidden)
  const mergedMock: Thematique[] = THEMATIQUES
    .filter((t) => !hiddenIds.includes(t.id))
    .map((theme) => {
      const dbForTheme = dbDiagnostics
        .filter((d) => d.thematique === theme.titre && d.is_published)
        .map((d): Diagnostic => ({
          id: d.id, thematique_id: theme.id, titre: d.titre,
          description: d.description ?? "", duree_estimee: d.duree_estimee,
          questions: d.questions, profils: d.profils,
        }));
      return { ...theme, diagnostics: [...theme.diagnostics, ...dbForTheme] };
    });

  // Add custom thematiques that are published (not hidden)
  const mergedCustom: Thematique[] = customThematiques
    .filter((t) => !hiddenIds.includes(t.id))
    .map((t): Thematique => {
      const dbForTheme = dbDiagnostics
        .filter((d) => d.thematique === t.titre && d.is_published)
        .map((d): Diagnostic => ({
          id: d.id, thematique_id: t.id, titre: d.titre,
          description: d.description ?? "", duree_estimee: d.duree_estimee,
          questions: d.questions, profils: d.profils,
        }));
      return { id: t.id, titre: t.titre, subtitle: t.subtitle, accroche: t.accroche, diagnostics: dbForTheme };
    });

  const mergedThematiques = [...mergedMock, ...mergedCustom];

  return (
    <>
      <Header />
      <ScrollToTop />
      <main style={{ flex: 1, paddingTop: "0" }}>
        <Suspense>
          <DiagnosticFlowWrapper thematiques={mergedThematiques} coach={coach} categories={categories} />
        </Suspense>
      </main>
    </>
  );
}
