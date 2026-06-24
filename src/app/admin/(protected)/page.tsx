import { requireAdmin } from "@/lib/auth";
import { getLeads, getStats, getThematiqueStats } from "@/lib/actions/leads";
import { getHiddenThematiqueIds } from "@/lib/actions/diagnostics";
import { getCustomThematiques, getResolvedMockThematiques } from "@/lib/actions/thematiques";

export default async function AdminDashboard() {
  await requireAdmin();
  const [stats, allLeads, hiddenIds, customThematiques, resolvedMocks] = await Promise.all([
    getStats(), getLeads(), getHiddenThematiqueIds(), getCustomThematiques(), getResolvedMockThematiques(),
  ]);
  const visibleTitles = [
    ...resolvedMocks.filter((t) => !hiddenIds.includes(t.id)).map((t) => t.titre),
    ...customThematiques.filter((t) => !hiddenIds.includes(t.id)).map((t) => t.titre),
  ];
  const themeStats = await getThematiqueStats(visibleTitles);
  const recentLeads = allLeads.slice(0, 5);

  return (
    <div style={{ maxWidth: "1100px" }}>
      <PageHeader
        title="Dashboard"
        subtitle="Vue d'ensemble en temps réel"
      />

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "48px",
        }}
      >
        <StatCard label="Total leads" value={stats.total_leads} suffix="" accent />
        <StatCard label="Nouveaux" value={stats.nouveaux} suffix="" />
        <StatCard label="Score moyen" value={stats.score_moyen} suffix="/100" />
        <StatCard label="RDV pris" value={stats.rdv_pris} suffix="" />
      </div>

      {/* Thématiques */}
      {themeStats.length > 0 && (
        <Section title="Thématiques populaires">
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {themeStats.map((t, i) => (
              <div
                key={t.thematique}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  borderBottom: i === themeStats.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                }}
              >
                <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "14px", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
                  {t.thematique}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "20px", color: "#C9F1DF" }}>
                      {t.total}
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>PASSATIONS</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "20px" }}>
                      {t.score_moyen}
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>MOY. SCORE</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Derniers leads */}
      <Section title="Derniers leads" action={{ label: "Voir tous les leads →", href: "/admin/leads" }}>
        {recentLeads.length === 0 ? (
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.30)", padding: "24px 0" }}>
            Aucun lead pour l'instant. Les résultats apparaîtront après les premiers diagnostics.
          </p>
        ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Dirigeant", "Thématique", "Score", "Statut", "Date"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "0 16px 12px 0",
                      fontSize: "11px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.35)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => (
                <tr key={lead.id} style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <td style={{ padding: "14px 16px 14px 0" }}>
                    <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "14px" }}>
                      {lead.prenom} {lead.nom ?? ""}
                    </p>
                    {(lead.metier || lead.entreprise) && (
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.40)", marginTop: "2px" }}>
                        {[lead.metier, lead.entreprise].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px 14px 0", fontSize: "13px", color: "rgba(255,255,255,0.60)" }}>
                    {lead.passations[0]?.thematique ?? "—"}
                  </td>
                  <td style={{ padding: "14px 16px 14px 0" }}>
                    {lead.passations[0]?.score != null ? <ScoreBadge score={lead.passations[0].score} /> : <span style={{ color: "rgba(255,255,255,0.25)" }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 16px 14px 0" }}>
                    <StatusBadge status={lead.status} />
                  </td>
                  <td style={{ padding: "14px 0", fontSize: "12px", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
                    {new Date(lead.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Section>
    </div>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h1
        style={{
          fontFamily: "Sora, sans-serif",
          fontWeight: 700,
          fontSize: "clamp(24px, 2.4vw, 36px)",
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.40)" }}>{subtitle}</p>
      )}
    </div>
  );
}

function StatCard({ label, value, suffix, accent }: { label: string; value: number; suffix: string; accent?: boolean }) {
  return (
    <div
      style={{
        padding: "20px 24px",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "12px",
        background: accent ? "rgba(201,241,223,0.04)" : "rgba(255,255,255,0.02)",
      }}
    >
      <p style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginBottom: "10px" }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: "Sora, sans-serif",
          fontWeight: 700,
          fontSize: "32px",
          lineHeight: 1,
          color: accent ? "#C9F1DF" : "#fff",
        }}
      >
        {value}
        <span style={{ fontSize: "16px", fontWeight: 400, color: "rgba(255,255,255,0.40)", marginLeft: "4px" }}>
          {suffix}
        </span>
      </p>
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: { label: string; href: string } }) {
  return (
    <div style={{ marginBottom: "48px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2
          style={{
            fontFamily: "Sora, sans-serif",
            fontWeight: 700,
            fontSize: "16px",
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </h2>
        {action && (
          <a
            href={action.href}
            style={{ fontSize: "12px", color: "#C9F1DF", textDecoration: "none", letterSpacing: "0.04em" }}
          >
            {action.label}
          </a>
        )}
      </div>
      {children}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 61 ? "#C9F1DF" : score >= 31 ? "rgba(255,255,255,0.72)" : "rgba(232,106,51,0.80)";
  return (
    <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "14px", color }}>
      {score}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    nouveau:   { bg: "rgba(201,241,223,0.10)", text: "#C9F1DF" },
    contacté:  { bg: "rgba(255,255,255,0.07)", text: "rgba(255,255,255,0.60)" },
    client:    { bg: "rgba(123,211,172,0.15)", text: "#7BD3AC" },
    archivé:   { bg: "rgba(255,255,255,0.04)", text: "rgba(255,255,255,0.28)" },
  };
  const c = colors[status] ?? colors.nouveau;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "999px",
        background: c.bg,
        color: c.text,
        fontFamily: "Sora, sans-serif",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {status}
    </span>
  );
}
