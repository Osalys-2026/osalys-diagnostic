import Anthropic from "@anthropic-ai/sdk";
import type { Question, CategoryScore } from "@/lib/types";

export const maxDuration = 60; // Vercel function timeout (seconds)

export interface AnalyseInput {
  prenom: string;
  thematique: string;
  diagnostic: string;
  score: number;
  profilLabel: string;
  profilAnalyse: string;
  categoryScores: CategoryScore[];
  questions: Question[];
  reponses: Record<string, number>;
}

function getAnswerText(q: Question, value: number | undefined): string {
  if (value === undefined || value === null) return "sans réponse";
  if (q.type_reponse === "likert") {
    const map: Record<number, string> = { 0: "Jamais", 25: "Rarement", 50: "Parfois", 75: "Souvent", 100: "Toujours" };
    return map[value] ?? `${value}%`;
  }
  if (q.type_reponse === "choice") {
    const opt = (q.options ?? []).find((o) => o.valeur_score === value);
    return opt?.texte ?? `Score ${value}`;
  }
  if (q.type_reponse === "slider") {
    const min = q.slider_min_label ?? "minimum";
    const max = q.slider_max_label ?? "maximum";
    if (value <= 20) return `Très proche de "${min}"`;
    if (value >= 80) return `Très proche de "${max}"`;
    if (value < 50)  return `Plutôt "${min}" (${value}/100)`;
    if (value > 50)  return `Plutôt "${max}" (${value}/100)`;
    return `Équilibré (${value}/100)`;
  }
  return `${value}`;
}

export async function POST(req: Request) {
  try {
    const data: AnalyseInput = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Clé API manquante" }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });

    /* ── Bloc catégories ── */
    const catBlock = data.categoryScores?.length > 0
      ? data.categoryScores.map((c) =>
          `• ${c.label} : ${c.score}% (${c.score >= 60 ? "point de force" : c.score < 40 ? "axe de travail" : "en développement"})`
        ).join("\n")
      : "Aucune catégorie définie";

    /* ── Bloc réponses ── */
    const reponsesBlock = (data.questions ?? [])
      .filter((q) => q.texte)
      .map((q) => `• ${q.texte}\n  → ${getAnswerText(q, data.reponses?.[q.id])}`)
      .join("\n");

    const prompt = `Tu es Delphine, coach experte en leadership & développement professionnel chez Osalys. Tu t'adresses à ${data.prenom}, dirigeant(e) d'entreprise, après avoir analysé ses réponses au diagnostic "${data.diagnostic}".

RÉSULTATS DE ${data.prenom.toUpperCase()}
Score global : ${data.score}/100 — Profil : ${data.profilLabel}

Par compétence :
${catBlock}

Réponses détaillées :
${reponsesBlock}

---

Rédige un bilan de 2 paragraphes, en vouvoyant ${data.prenom}. Ton registre est celui d'un coach expérimenté qui s'adresse à un dirigeant : professionnel, précis, sans condescendance.

Paragraphe 1 : commence directement par une observation ancrée dans une ou deux réponses spécifiques. Cite-les naturellement, sans les mettre entre guillemets de façon artificielle.
Paragraphe 2 : identifie le pattern central qui ressort de l'ensemble des réponses. Soyez précis sur ce que cela révèle du fonctionnement actuel de ce dirigeant.

Règles absolues :
- Vouvoiement tout au long du texte
- Aucune recommandation, aucun conseil d'action
- Jamais : "il est important de", "comme beaucoup de dirigeants", "vous êtes sur la bonne voie", "n'oubliez pas", "je vous encourage"
- Ton : analytique, bienveillant, direct — comme un regard extérieur juste et respectueux
- 120 à 160 mots au total
- Texte fluide uniquement — aucun titre, aucune puce, aucun gras`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    return Response.json({ text });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/analyse] error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
