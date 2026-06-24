import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => l.split("=").map((s) => s.trim()))
);

const sql = neon(env.DATABASE_URL);

const questions = [
  {
    id: "ef1", ordre: 1,
    texte: "Quel est votre niveau d'énergie physique et psychique ?",
    type_reponse: "slider", poids: 1,
    slider_min_label: "Très faible", slider_max_label: "Excellent",
  },
  {
    id: "ef2", ordre: 2,
    texte: "À combien évaluez-vous votre légèreté mentale ?",
    type_reponse: "slider", poids: 1,
    slider_min_label: "Très faible", slider_max_label: "Excellent",
  },
  {
    id: "ef3", ordre: 3,
    texte: "Comment qualifieriez-vous la qualité de votre sommeil ?",
    type_reponse: "slider", poids: 1,
    slider_min_label: "Très faible", slider_max_label: "Excellent",
  },
  {
    id: "ef4", ordre: 4,
    texte: "À combien vous sentez-vous lucide et en recul pour décider ?",
    type_reponse: "slider", poids: 1,
    slider_min_label: "Très faible", slider_max_label: "Excellent",
  },
  {
    id: "ef5", ordre: 5,
    texte: "Comment évalueriez-vous votre capacité à être soutenu(e) ?",
    type_reponse: "slider", poids: 1,
    slider_min_label: "Très faible", slider_max_label: "Excellent",
  },
  {
    id: "ef6", ordre: 6,
    texte: "À quel point ressentez-vous un alignement entre vos décisions et vos valeurs ?",
    type_reponse: "slider", poids: 1,
    slider_min_label: "Très faible", slider_max_label: "Excellent",
  },
  {
    id: "ef7", ordre: 7,
    texte: "Quelle est votre capacité à prendre de réelles pauses ce mois-ci ?",
    type_reponse: "slider", poids: 1,
    slider_min_label: "Très faible", slider_max_label: "Excellent",
  },
  {
    id: "ef8", ordre: 8,
    texte: "À quel point arrivez-vous à déléguer sereinement ?",
    type_reponse: "slider", poids: 1,
    slider_min_label: "Très faible", slider_max_label: "Excellent",
  },
  {
    id: "ef9", ordre: 9,
    texte: "Quel est votre niveau d'isolement ressenti dans votre rôle ?",
    type_reponse: "slider", poids: 1,
    slider_min_label: "Très isolé(e)", slider_max_label: "Bien entouré(e)",
  },
  {
    id: "ef10", ordre: 10,
    texte: "Quel est votre sentiment de fierté et d'accomplissement ?",
    type_reponse: "slider", poids: 1,
    slider_min_label: "Très faible", slider_max_label: "Excellent",
  },
];

const profils = [
  {
    id: "p1", score_min: 0, score_max: 40,
    label: "Dirigeant sous tension",
    analyse: "Votre baromètre révèle des signaux importants. Votre charge mentale et physique dépasse vos ressources actuelles. Plusieurs dimensions — énergie, sommeil, recul décisionnel — sont en zone critique. Un accompagnement individuel vous permettrait de reprendre le contrôle, de prioriser et de retrouver de la clarté dans vos décisions.",
    points_force: [
      "Conscience de vos limites actuelles — premier pas vers le changement",
      "Capacité à vous évaluer avec lucidité malgré la pression",
    ],
    axes_dev: [
      "Restaurer vos fondamentaux physiologiques : sommeil et énergie",
      "Rompre l'isolement du dirigeant — chercher du soutien",
      "Apprendre à déléguer pour réduire la charge opérationnelle",
      "Retrouver l'alignement entre décisions et valeurs",
    ],
  },
  {
    id: "p2", score_min: 41, score_max: 70,
    label: "Dirigeant en équilibre fragile",
    analyse: "Vous tenez la barre, mais certains signaux méritent votre attention. Plusieurs dimensions oscillent autour de la moyenne. Un coaching ciblé peut vous aider à transformer ces points de vigilance en leviers de performance durable, avant qu'ils ne s'aggravent.",
    points_force: [
      "Capacité à maintenir l'équilibre malgré les contraintes",
      "Conscience des zones à surveiller — vous ne subissez pas en silence",
    ],
    axes_dev: [
      "Identifier et agir sur vos 2-3 dimensions les plus faibles",
      "Structurer de vraies plages de déconnexion sans culpabilité",
      "Renforcer votre réseau de soutien professionnel et personnel",
      "Cultiver davantage l'alignement valeurs-décisions",
    ],
  },
  {
    id: "p3", score_min: 71, score_max: 100,
    label: "Dirigeant en dynamique positive",
    analyse: "Vos indicateurs sont solides. Vous semblez dans une bonne dynamique globale — énergie, clarté mentale, soutien et alignement. Pour maintenir cette dynamique, restez attentif aux signaux faibles et continuez à investir dans votre équilibre. Un accompagnement ponctuel peut vous aider à aller encore plus loin dans votre leadership.",
    points_force: [
      "Énergie et vitalité au service de vos projets",
      "Clarté mentale et capacité de recul décisionnel",
      "Alignement fort entre vos valeurs et vos actions",
    ],
    axes_dev: [
      "Rester vigilant aux signaux faibles avant qu'ils ne s'installent",
      "Investir dans des pratiques de récupération préventives",
      "Partager votre modèle d'équilibre avec votre entourage professionnel",
    ],
  },
];

const rows = await sql`
  INSERT INTO diagnostics (thematique, titre, description, duree_estimee, questions, profils, is_published)
  VALUES (
    ${"État de forme"},
    ${"Baromètre Santé Mentale du Dirigeant"},
    ${"Un outil d'auto-perception pour détecter les signaux faibles. 10 questions pour faire le point sur votre état, à réaliser chaque trimestre."},
    ${3},
    ${JSON.stringify(questions)},
    ${JSON.stringify(profils)},
    ${true}
  )
  RETURNING id
`;

console.log("✓ Diagnostic créé — id:", rows[0].id);
