import { requireAdmin } from "@/lib/auth";
import { getHiddenThematiqueIds } from "@/lib/actions/diagnostics";
import { getCustomThematiques } from "@/lib/actions/thematiques";
import { getSkillCategories } from "@/lib/actions/categories";
import { THEMATIQUES } from "@/lib/mock-data";
import { DiagnosticWizard } from "@/components/admin/DiagnosticWizard";

export const metadata = { title: "Nouveau diagnostic — Osalys Admin" };

export default async function NewDiagnosticPage() {
  await requireAdmin();
  const [hiddenIds, customThematiques, categories] = await Promise.all([
    getHiddenThematiqueIds(),
    getCustomThematiques(),
    getSkillCategories(),
  ]);

  const availableThematiques = [
    ...THEMATIQUES.filter((t) => !hiddenIds.includes(t.id)).map((t) => ({ id: t.id, titre: t.titre })),
    ...customThematiques.filter((t) => !hiddenIds.includes(t.id)).map((t) => ({ id: t.id, titre: t.titre })),
  ];

  return (
    <div style={{ maxWidth: "860px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(24px, 2.4vw, 36px)", letterSpacing: "-0.02em", textTransform: "uppercase", marginBottom: "6px" }}>
          Nouveau diagnostic
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.40)" }}>
          Construisez votre diagnostic en 5 étapes.
        </p>
      </div>
      <DiagnosticWizard availableThematiques={availableThematiques} availableCategories={categories} />
    </div>
  );
}
