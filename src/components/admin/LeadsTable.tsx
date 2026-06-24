"use client";

import { useState, useTransition } from "react";
import type { LeadRow, PassationRow } from "@/lib/actions/leads";
import { updateLeadStatus, deleteLead } from "@/lib/actions/leads";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";

const STATUTS = ["tous", "nouveau", "contacté", "client", "archivé"] as const;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  nouveau:  { bg: "rgba(201,241,223,0.10)", text: "#C9F1DF" },
  contacté: { bg: "rgba(255,255,255,0.07)", text: "rgba(255,255,255,0.60)" },
  client:   { bg: "rgba(123,211,172,0.15)", text: "#7BD3AC" },
  archivé:  { bg: "rgba(255,255,255,0.04)", text: "rgba(255,255,255,0.28)" },
};

export function LeadsTable({ initialLeads }: { initialLeads: LeadRow[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [themeFilter, setThemeFilter]   = useState<string>("toutes");
  const [search, setSearch]             = useState("");
  const [expandedIds, setExpandedIds]   = useState<Set<string>>(new Set());
  const [, startTransition]             = useTransition();

  const allThematiques = Array.from(
    new Set(leads.flatMap((l) => l.passations.map((p) => p.thematique)).filter(Boolean))
  );
  const thematiques = ["toutes", ...allThematiques];

  const filtered = leads.filter((l) => {
    if (statusFilter !== "tous" && l.status !== statusFilter) return false;
    if (themeFilter !== "toutes" && !l.passations.some((p) => p.thematique === themeFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !l.prenom.toLowerCase().includes(q) &&
        !(l.nom ?? "").toLowerCase().includes(q) &&
        !l.email.toLowerCase().includes(q) &&
        !(l.entreprise ?? "").toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleStatusChange(id: string, newStatus: string) {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
    startTransition(() => { updateLeadStatus(id, newStatus).catch(console.error); });
  }

  async function handleDelete(id: string) {
    await deleteLead(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div>
      {/* Filtres */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="search"
          placeholder="Rechercher un lead..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 200px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "8px",
            color: "#fff",
            fontFamily: "Sora, sans-serif",
            fontSize: "14px",
            padding: "10px 14px",
            outline: "none",
            caretColor: "#C9F1DF",
          }}
        />
        <FilterSelect value={statusFilter} options={STATUTS} onChange={setStatusFilter} label="Statut" />
        <FilterSelect value={themeFilter} options={thematiques as readonly string[]} onChange={setThemeFilter} label="Thématique" />
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginLeft: "auto", whiteSpace: "nowrap" }}>
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["Dirigeant", "Diagnostics", "Dernier score", "Statut", "Date", ""].map((h) => (
                <th key={h} style={{
                  textAlign: "left", padding: "12px 16px", fontSize: "11px",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)", fontWeight: 600, whiteSpace: "nowrap",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => {
              const latest = lead.passations[0] ?? null;
              const isExpanded = expandedIds.has(lead.id);
              const hasMultiple = lead.passations.length > 1;

              return (
                <>
                  {/* Main row */}
                  <tr key={lead.id} style={{ borderBottom: isExpanded ? "none" : "1px solid rgba(255,255,255,0.06)", background: isExpanded ? "rgba(255,255,255,0.02)" : "transparent" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "14px" }}>
                        {lead.prenom} {lead.nom ?? ""}
                      </p>
                      {(lead.metier || lead.entreprise) && (
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.40)", marginTop: "2px" }}>
                          {[lead.metier, lead.entreprise].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", marginTop: "2px" }}>{lead.email}</p>
                    </td>

                    {/* Diagnostics count + expand */}
                    <td style={{ padding: "14px 16px" }}>
                      {lead.passations.length === 0 ? (
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>—</span>
                      ) : (
                        <button
                          onClick={() => hasMultiple && toggleExpand(lead.id)}
                          style={{
                            background: "none", border: "none", cursor: hasMultiple ? "pointer" : "default",
                            display: "flex", alignItems: "center", gap: "6px", padding: 0,
                          }}
                        >
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(201,241,223,0.10)", color: "#C9F1DF",
                            fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "12px",
                            borderRadius: "999px", padding: "2px 10px", whiteSpace: "nowrap",
                          }}>
                            {lead.passations.length} diagnostic{lead.passations.length > 1 ? "s" : ""}
                          </span>
                          {hasMultiple && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 200ms" }}>
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Latest score */}
                    <td style={{ padding: "14px 16px" }}>
                      {latest ? (
                        <div>
                          <span style={{
                            fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "18px",
                            color: latest.score >= 61 ? "#C9F1DF" : latest.score >= 31 ? "#fff" : "rgba(232,106,51,0.90)",
                          }}>
                            {latest.score}
                          </span>
                          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.30)", marginTop: "2px" }}>{latest.thematique}</p>
                          {latest.profil && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{latest.profil}</p>}
                        </div>
                      ) : (
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <StatusSelect value={lead.status} onChange={(v) => handleStatusChange(lead.id, v)} />
                    </td>

                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
                      {new Date(lead.created_at).toLocaleDateString("fr-FR")}
                      <br />
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>
                        {new Date(lead.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <a href={`mailto:${lead.email}`} style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          padding: "6px 12px", borderRadius: "6px",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "rgba(255,255,255,0.50)", fontSize: "12px",
                          textDecoration: "none", whiteSpace: "nowrap",
                        }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          Contacter
                        </a>
                        <DeleteConfirmButton
                          compact
                          label={
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          }
                          onConfirm={() => handleDelete(lead.id)}
                        />
                      </div>
                    </td>
                  </tr>

                  {/* Expanded passations */}
                  {isExpanded && lead.passations.map((p, i) => (
                    <tr key={`${lead.id}-p-${i}`} style={{
                      borderBottom: i === lead.passations.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.03)",
                      background: "rgba(255,255,255,0.015)",
                    }}>
                      <td style={{ padding: "10px 16px 10px 32px" }}>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>
                          {new Date(p.completed_at).toLocaleDateString("fr-FR")} à {new Date(p.completed_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.70)" }}>{p.thematique}</p>
                        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{p.diagnostic}</p>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{
                          fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px",
                          color: p.score >= 61 ? "#C9F1DF" : p.score >= 31 ? "#fff" : "rgba(232,106,51,0.90)",
                        }}>
                          {p.score}
                        </span>
                        {p.profil && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.30)", marginTop: "2px" }}>{p.profil}</p>}
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <ActionBadge action={p.action_post} />
                      </td>
                      <td colSpan={2} />
                    </tr>
                  ))}
                </>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "rgba(255,255,255,0.30)", fontSize: "14px" }}>
                  Aucun lead trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterSelect({ value, options, onChange, label }: { value: string; options: readonly string[]; onChange: (v: string) => void; label: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: "8px", color: value === options[0] ? "rgba(255,255,255,0.40)" : "#fff",
      fontFamily: "Sora, sans-serif", fontSize: "13px", padding: "10px 14px",
      outline: "none", cursor: "pointer",
    }}>
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "#111" }}>
          {o.charAt(0).toUpperCase() + o.slice(1)}
        </option>
      ))}
    </select>
  );
}

function StatusSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const c = STATUS_COLORS[value] ?? STATUS_COLORS.nouveau;
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{
      background: c.bg, border: "none", borderRadius: "999px",
      color: c.text, fontFamily: "Sora, sans-serif", fontSize: "11px",
      fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "4px 10px", cursor: "pointer", outline: "none",
    }}>
      {["nouveau", "contacté", "client", "archivé"].map((s) => (
        <option key={s} value={s} style={{ background: "#111", textTransform: "uppercase" }}>{s}</option>
      ))}
    </select>
  );
}

function ActionBadge({ action }: { action: string | null }) {
  const map: Record<string, { label: string; color: string }> = {
    rdv:     { label: "RDV pris", color: "#C9F1DF" },
    site:    { label: "Site visité", color: "rgba(255,255,255,0.45)" },
    partage: { label: "Partagé", color: "#7BD3AC" },
  };
  if (!action) return <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>—</span>;
  const item = map[action] ?? { label: action, color: "rgba(255,255,255,0.40)" };
  return <span style={{ fontSize: "12px", color: item.color, fontFamily: "Sora, sans-serif" }}>{item.label}</span>;
}
