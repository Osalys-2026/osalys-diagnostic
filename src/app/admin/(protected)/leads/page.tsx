import { requireAdmin } from "@/lib/auth";
import { getLeads } from "@/lib/actions/leads";
import { LeadsTable } from "@/components/admin/LeadsTable";

export const metadata = { title: "Leads — Osalys Admin" };

export default async function LeadsPage() {
  await requireAdmin();
  const leads = await getLeads();
  return (
    <div style={{ maxWidth: "1200px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "40px", gap: "24px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(24px, 2.4vw, 36px)", letterSpacing: "-0.02em", textTransform: "uppercase", marginBottom: "6px" }}>
            Leads
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.40)" }}>
            {leads.length} lead{leads.length !== 1 ? "s" : ""} collecté{leads.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ExportButton />
      </div>
      <LeadsTable initialLeads={leads} />
    </div>
  );
}

function ExportButton() {
  return (
    <a
      href="/admin/leads/export.csv"
      className="btn-outline"
      style={{ padding: "12px 24px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "8px" }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Exporter CSV
    </a>
  );
}
