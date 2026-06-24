import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDiagnostic, getHiddenThematiqueIds } from "@/lib/actions/diagnostics";
import { getCustomThematiques, getResolvedMockThematiques } from "@/lib/actions/thematiques";
import { getSkillCategories } from "@/lib/actions/categories";
import { DiagnosticWizard } from "@/components/admin/DiagnosticWizard";

export const metadata = { title: "Modifier un diagnostic — Osalys Admin" };

export default async function EditDiagnosticPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [diag, hiddenIds, customThematiques, categories, resolvedMocks] = await Promise.all([
    getDiagnostic(id),
    getHiddenThematiqueIds(),
    getCustomThematiques(),
    getSkillCategories(),
    getResolvedMockThematiques(),
  ]);
  if (!diag) notFound();

  // En mode édition : on inclut TOUTES les thématiques (même masquées) avec titres résolus
  const availableThematiques = [
    ...resolvedMocks.map((t) => ({ id: t.id, titre: t.titre })),
    ...customThematiques.map((t) => ({ id: t.id, titre: t.titre })),
  ];

  // Find thematique_id : comparaison insensible à la casse
  const normalise = (s: string) => s.toLowerCase().trim();
  const mockMatch = resolvedMocks.find((t) => normalise(t.titre) === normalise(diag.thematique));
  const customMatch = customThematiques.find((t) => normalise(t.titre) === normalise(diag.thematique));
  const thematique_id = mockMatch?.id ?? customMatch?.id ?? diag.thematique;

  return (
    <DiagnosticWizard
      editId={diag.id}
      availableThematiques={availableThematiques}
      availableCategories={categories}
      initialState={{
        thematique_id,
        titre: diag.titre,
        description: diag.description ?? "",
        duree_estimee: diag.duree_estimee,
        questions: diag.questions,
        profils: diag.profils,
      }}
    />
  );
}
