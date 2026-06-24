import { requireAdmin } from "@/lib/auth";
import { getThematiqueStats } from "@/lib/actions/leads";
import { getHiddenThematiqueIds } from "@/lib/actions/diagnostics";
import { getCustomThematiques, getResolvedMockThematiques } from "@/lib/actions/thematiques";

export const metadata = { title: "Statistiques — Osalys Admin" };

export default async function StatsPage() {
  await requireAdmin();
  const [hiddenIds, customThematiques, resolvedMocks] = await Promise.all([
    getHiddenThematiqueIds(), getCustomThematiques(), getResolvedMockThematiques(),
  ]);
  const visibleTitles = [
    ...resolvedMocks.filter((t) => !hiddenIds.includes(t.id)).map((t) => t.titre),
    ...customThematiques.filter((t) => !hiddenIds.includes(t.id)).map((t) => t.titre),
  ];
  const themeStats = await getThematiqueStats(visibleTitles);

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(24px, 2.4vw, 36px)", letterSpacing: "-0.02em", textTransform: "uppercase", marginBottom: "6px" }}>
          Statistiques
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.40)" }}>
          Résultats en temps réel depuis la base de données.
        </p>
      </div>

      <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "15px", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "20px" }}>
        Résultats par thématique
      </h2>

      {themeStats.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed rgba(255,255,255,0.10)", borderRadius: "12px" }}>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.30)" }}>
            Aucune donnée pour l'instant. Les statistiques apparaîtront après les premiers diagnostics complétés.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {themeStats.map((t) => (
            <div
              key={t.thematique}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                alignItems: "center",
                gap: "32px",
                padding: "20px 24px",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "14px", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
                {t.thematique}
              </p>
              <Stat label="Passations" value={t.total} />
              <Stat label="Score moyen" value={`${t.score_moyen}/100`} />
              <Stat label="RDV pris" value={t.rdv} accent />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{ textAlign: "right" }}>
      <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "20px", color: accent ? "#C9F1DF" : "#fff" }}>
        {value}
      </p>
      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.30)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </p>
    </div>
  );
}
