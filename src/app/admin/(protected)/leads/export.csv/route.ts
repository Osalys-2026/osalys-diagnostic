import { requireAdmin } from "@/lib/auth";
import { getLeads } from "@/lib/actions/leads";

export async function GET() {
  await requireAdmin();
  const leads = await getLeads();

  const headers = ["Prénom", "Nom", "Email", "Métier", "Entreprise", "Thématique", "Diagnostic", "Score", "Profil", "Action post", "Statut", "Date lead", "Date diagnostic"];

  const escape = (v: string | number | null | undefined) => {
    if (v == null) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const rows: string[] = [];
  for (const l of leads) {
    if (l.passations.length === 0) {
      rows.push([
        l.prenom, l.nom, l.email, l.metier, l.entreprise,
        "", "", "", "", "",
        l.status, new Date(l.created_at).toLocaleString("fr-FR"), "",
      ].map(escape).join(","));
    } else {
      for (const p of l.passations) {
        rows.push([
          l.prenom, l.nom, l.email, l.metier, l.entreprise,
          p.thematique, p.diagnostic, p.score, p.profil, p.action_post,
          l.status, new Date(l.created_at).toLocaleString("fr-FR"), new Date(p.completed_at).toLocaleString("fr-FR"),
        ].map(escape).join(","));
      }
    }
  }

  const csv = [headers.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-osalys-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
