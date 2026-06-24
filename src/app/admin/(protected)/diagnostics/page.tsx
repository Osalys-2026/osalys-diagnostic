import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  getDiagnostics, getHiddenMockIds, getHiddenThematiqueIds,
  hideMockDiagnostic, deleteDiagnostic, saveDiagnostic,
} from "@/lib/actions/diagnostics";
import { getCustomThematiques, getResolvedMockThematiques } from "@/lib/actions/thematiques";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import type { DiagnosticRecord } from "@/lib/actions/diagnostics";
import type { Diagnostic } from "@/lib/types";

export const metadata = { title: "Diagnostics — Osalys Admin" };

export default async function DiagnosticsPage() {
  await requireAdmin();
  const [dbDiagnostics, hiddenMockIds, hiddenThematiqueIds, customThematiques, resolvedMocks] = await Promise.all([
    getDiagnostics(),
    getHiddenMockIds(),
    getHiddenThematiqueIds(),
    getCustomThematiques(),
    getResolvedMockThematiques(),
  ]);

  const visibleMockThematiques = resolvedMocks.filter((t) => !hiddenThematiqueIds.includes(t.id));
  const visibleCustomThematiques = customThematiques.filter((t) => !hiddenThematiqueIds.includes(t.id));

  // Build a unified list of sections: mock + custom
  type Section = { id: string; titre: string; subtitle: string };
  const allSections: Section[] = [
    ...visibleMockThematiques.map((t) => ({ id: t.id, titre: t.titre, subtitle: t.subtitle })),
    ...visibleCustomThematiques.map((t) => ({ id: t.id, titre: t.titre, subtitle: t.subtitle })),
  ];

  const totalMockVisible = visibleMockThematiques.reduce(
    (acc, t) => acc + t.diagnostics.filter((d) => !hiddenMockIds.includes(d.id)).length, 0
  );
  const total = dbDiagnostics.length + totalMockVisible;

  return (
    <div style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "48px", gap: "24px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(24px, 2.4vw, 36px)", letterSpacing: "-0.02em", textTransform: "uppercase", marginBottom: "6px" }}>
            Diagnostics
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.40)" }}>
            {total} diagnostic{total !== 1 ? "s" : ""} · {allSections.length} thématiques
          </p>
        </div>
        <Link href="/admin/diagnostics/new" className="btn-solid" style={{ padding: "12px 24px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouveau diagnostic
        </Link>
      </div>

      {/* Thématiques */}
      <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
        {allSections.map((section) => {
          const mockTheme = visibleMockThematiques.find((t) => t.id === section.id);
          const dbForTheme = dbDiagnostics.filter((d) => d.thematique.toLowerCase() === section.titre.toLowerCase());
          const mockForTheme = mockTheme ? mockTheme.diagnostics.filter((d) => !hiddenMockIds.includes(d.id)) : [];
          const count = dbForTheme.length + mockForTheme.length;

          return (
            <section key={section.id}>
              {/* Thematique header */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "20px", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
                  {section.titre}
                </h2>
                <span style={{ fontFamily: "Sora, sans-serif", fontStyle: "italic", fontWeight: 400, fontSize: "16px", color: "rgba(255,255,255,0.40)" }}>
                  {section.subtitle}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "12px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.04em", flexShrink: 0 }}>
                  {count} diagnostic{count !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Diagnostic cards */}
              {count === 0 ? (
                <div style={{ padding: "32px 24px", textAlign: "center", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "12px" }}>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)" }}>
                    Aucun diagnostic.{" "}
                    <Link href="/admin/diagnostics/new" style={{ color: "rgba(255,255,255,0.50)", textDecoration: "underline" }}>En créer un</Link>
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {dbForTheme.map((diag) => (
                    <DbDiagnosticCard key={diag.id} diag={diag} />
                  ))}
                  {mockForTheme.map((diag) => (
                    <MockDiagnosticCard key={diag.id} diag={diag} thematicTitle={section.titre} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

/* ─── DB Diagnostic Card ─── */
function DbDiagnosticCard({ diag }: { diag: DiagnosticRecord }) {
  const qCount = (diag.questions as unknown[]).length;
  const pCount = (diag.profils as unknown[]).filter((p: unknown) => (p as { label: string }).label).length;

  return (
    <div style={cardStyle(diag.is_published)}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <p style={titleStyle}>{diag.titre}</p>
          <StatusBadge published={diag.is_published} />
        </div>
        {diag.description && <p style={descStyle}>{diag.description}</p>}
        <div style={metaRowStyle}>
          {[`${qCount} question${qCount !== 1 ? "s" : ""}`, `${diag.duree_estimee} min`, `${pCount} profil${pCount !== 1 ? "s" : ""}`].map((v) => (
            <span key={v} style={metaItemStyle}>{v}</span>
          ))}
        </div>
      </div>
      <div style={actionsStyle}>
        <Link href={`/admin/diagnostics/${diag.id}/edit`} style={btnSecondary}>Modifier</Link>
        <DeleteConfirmButton
          onConfirm={async () => {
            "use server";
            await deleteDiagnostic(diag.id);
          }}
        />
      </div>
    </div>
  );
}

/* ─── Mock Diagnostic Card ─── */
function MockDiagnosticCard({ diag, thematicTitle }: { diag: Diagnostic; thematicTitle: string }) {
  return (
    <div style={cardStyle(true)}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <p style={titleStyle}>{diag.titre}</p>
          <StatusBadge published />
        </div>
        {diag.description && <p style={descStyle}>{diag.description}</p>}
        <div style={metaRowStyle}>
          {[`${diag.questions.length} question${diag.questions.length !== 1 ? "s" : ""}`, `${diag.duree_estimee} min`, `${diag.profils.length} profil${diag.profils.length !== 1 ? "s" : ""}`].map((v) => (
            <span key={v} style={metaItemStyle}>{v}</span>
          ))}
        </div>
      </div>
      <div style={actionsStyle}>
        <ConvertAndEditButton diag={diag} thematicTitle={thematicTitle} />
        <DeleteConfirmButton
          onConfirm={async () => {
            "use server";
            await hideMockDiagnostic(diag.id);
          }}
        />
      </div>
    </div>
  );
}

/* ─── Convert mock → DB then edit ─── */
function ConvertAndEditButton({ diag, thematicTitle }: { diag: Diagnostic; thematicTitle: string }) {
  return (
    <form action={async () => {
      "use server";
      const { id } = await saveDiagnostic({
        thematique: thematicTitle,
        titre: diag.titre,
        description: diag.description,
        duree_estimee: diag.duree_estimee,
        questions: diag.questions,
        profils: diag.profils,
        is_published: true,
      });
      await hideMockDiagnostic(diag.id);
      redirect(`/admin/diagnostics/${id}/edit`);
    }}>
      <button type="submit" style={btnSecondary}>Modifier</button>
    </form>
  );
}

/* ─── Shared UI ─── */
function StatusBadge({ published }: { published: boolean }) {
  return (
    <span style={{
      fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase" as const,
      color: published ? "#C9F1DF" : "rgba(255,255,255,0.35)",
      background: published ? "rgba(201,241,223,0.10)" : "rgba(255,255,255,0.07)",
      padding: "3px 8px", borderRadius: "999px",
    }}>
      {published ? "Publié" : "Brouillon"}
    </span>
  );
}

const cardStyle = (published: boolean): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: "24px",
  padding: "20px 24px",
  border: `1px solid ${published ? "rgba(201,241,223,0.12)" : "rgba(255,255,255,0.09)"}`,
  borderRadius: "12px",
  background: published ? "rgba(201,241,223,0.02)" : "rgba(255,255,255,0.02)",
});

const titleStyle: React.CSSProperties = {
  fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "15px",
  textTransform: "uppercase", letterSpacing: "-0.01em",
};
const descStyle: React.CSSProperties = {
  fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.45, marginBottom: "10px",
};
const metaRowStyle: React.CSSProperties = { display: "flex", gap: "20px", marginTop: "8px" };
const metaItemStyle: React.CSSProperties = { fontSize: "11px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em" };
const actionsStyle: React.CSSProperties = { display: "flex", gap: "10px", flexShrink: 0, alignItems: "center" };
const btnSecondary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", padding: "8px 16px",
  borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(255,255,255,0.55)", fontSize: "12px", fontFamily: "Sora, sans-serif",
  textDecoration: "none", background: "none", cursor: "pointer", whiteSpace: "nowrap" as const,
};
