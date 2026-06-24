import { requireAdmin } from "@/lib/auth";
import { getHiddenThematiqueIds } from "@/lib/actions/diagnostics";
import {
  getCustomThematiques, getResolvedMockThematiques,
  createThematique, deleteCustomThematique,
  updateCustomThematique, upsertThematiqueOverride,
} from "@/lib/actions/thematiques";
import { ThematiqueList } from "@/components/admin/ThematiqueList";

export const metadata = { title: "Thématiques — Osalys Admin" };

export default async function ThematiquesPage() {
  await requireAdmin();
  const [hiddenIds, customThematiques, resolvedMockThematiques] = await Promise.all([
    getHiddenThematiqueIds(),
    getCustomThematiques(),
    getResolvedMockThematiques(),
  ]);

  return (
    <div style={{ maxWidth: "860px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(24px, 2.4vw, 36px)", letterSpacing: "-0.02em", textTransform: "uppercase", marginBottom: "6px" }}>
          Thématiques
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.40)" }}>
          Gérez les thématiques disponibles dans le diagnostic.
        </p>
      </div>
      <ThematiqueList
        hiddenIds={hiddenIds}
        customThematiques={customThematiques}
        resolvedMockThematiques={resolvedMockThematiques}
        onCreate={async (data) => {
          "use server";
          return createThematique(data);
        }}
        onDeleteCustom={async (id) => {
          "use server";
          await deleteCustomThematique(id);
        }}
        onUpdateCustom={async (id, data) => {
          "use server";
          await updateCustomThematique(id, data);
        }}
        onUpdateMock={async (id, data) => {
          "use server";
          await upsertThematiqueOverride(id, data);
        }}
      />
    </div>
  );
}
