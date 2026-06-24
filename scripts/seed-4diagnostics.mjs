import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf-8")
    .split("\n").filter(l => l.includes("="))
    .map(l => { const i = l.indexOf("="); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);
const sql = neon(env.DATABASE_URL);

// ─── Options réutilisables ───────────────────────────────────────────────────

const FIRO_OPTIONS = [
  { id: "o0", texte: "Pas du tout",   valeur_score: 0   },
  { id: "o1", texte: "Très rarement", valeur_score: 20  },
  { id: "o2", texte: "Parfois",       valeur_score: 40  },
  { id: "o3", texte: "Régulièrement", valeur_score: 60  },
  { id: "o4", texte: "Souvent",       valeur_score: 80  },
  { id: "o5", texte: "Tout le temps", valeur_score: 100 },
];

const LEGIT_OPTIONS = [
  { id: "jamais",   texte: "Jamais",   valeur_score: 20  },
  { id: "rarement", texte: "Rarement", valeur_score: 40  },
  { id: "parfois",  texte: "Parfois",  valeur_score: 60  },
  { id: "souvent",  texte: "Souvent",  valeur_score: 80  },
  { id: "toujours", texte: "Toujours", valeur_score: 100 },
];

function slider(id, ordre, texte) {
  return { id, ordre, texte, type_reponse: "slider", poids: 1,
           slider_min_label: "Pas du tout", slider_max_label: "Tout à fait" };
}

function choice(id, ordre, texte, options) {
  return { id, ordre, texte, type_reponse: "choice", poids: 1, options };
}

// ─── DIAGNOSTIC 1 : Soft Skills FIRO ────────────────────────────────────────

const softSkillsQuestions = [
  choice("ss1",  1,  "J'ai du mal à faire participer tous les membres de l'équipe.", FIRO_OPTIONS),
  choice("ss2",  2,  "Je me sens parfois seul(e) dans mes décisions ou dans mes interactions.", FIRO_OPTIONS),
  choice("ss3",  3,  "Je ne valorise pas suffisamment les contributions des autres.", FIRO_OPTIONS),
  choice("ss4",  4,  "J'ai tendance à monopoliser les discussions ou à rester en retrait.", FIRO_OPTIONS),
  choice("ss5",  5,  "J'ai du mal à poser des limites ou à dire non quand c'est nécessaire.", FIRO_OPTIONS),
  choice("ss6",  6,  "Je contrôle trop ou pas assez les activités de mes collaborateurs.", FIRO_OPTIONS),
  choice("ss7",  7,  "Je procrastine ou j'hésite à prendre des décisions difficiles.", FIRO_OPTIONS),
  choice("ss8",  8,  "J'ai du mal à accepter les suggestions ou critiques des autres.", FIRO_OPTIONS),
  choice("ss9",  9,  "J'ai du mal à écouter vraiment ou à montrer de l'empathie.", FIRO_OPTIONS),
  choice("ss10", 10, "Je me sens parfois déconnecté(e) de mes collaborateurs.", FIRO_OPTIONS),
  choice("ss11", 11, "Je crains d'exprimer mes émotions ou d'accueillir celles des autres.", FIRO_OPTIONS),
  choice("ss12", 12, "Je n'arrive pas à instaurer un climat de confiance et d'authenticité.", FIRO_OPTIONS),
  choice("ss13", 13, "J'ai du mal à prendre du recul sur mon impact émotionnel sur l'équipe.", FIRO_OPTIONS),
  choice("ss14", 14, "Je réagis souvent de manière impulsive ou défensive.", FIRO_OPTIONS),
  choice("ss15", 15, "Je trouve difficile de naviguer dans des situations ambiguës ou paradoxales.", FIRO_OPTIONS),
  choice("ss16", 16, "J'ai du mal à créer du sens et à accompagner la transformation des équipes.", FIRO_OPTIONS),
];

const softSkillsProfils = [
  {
    id: "ss-p1", score_min: 0, score_max: 30,
    label: "Profil ancré — Leadership maîtrisé",
    analyse: "Vos résultats reflètent une posture de leadership solide et consciente. Vous naviguez avec aisance dans les dimensions relationnelles clés (Inclusion, Contrôle, Affection, Conscience). Pour aller plus loin, un accompagnement ciblé pourrait vous aider à transformer vos forces en leviers d'impact encore plus puissants pour vos équipes.",
    points_force: [
      "Leadership relationnel solide et naturel",
      "Capacité à créer un environnement de confiance",
      "Régulation émotionnelle bien développée",
    ],
    axes_dev: [
      "Approfondir la pratique du feedback et de la reconnaissance",
      "Partager votre modèle de leadership avec vos équipes",
      "Explorer les situations qui testent encore vos automatismes",
    ],
  },
  {
    id: "ss-p2", score_min: 31, score_max: 50,
    label: "Profil en mouvement — Potentiel à libérer",
    analyse: "Vous disposez de bases solides mais certaines dimensions méritent une attention particulière. Les zones de vigilance identifiées sont autant d'opportunités de croissance. Un accompagnement structuré vous permettrait de franchir un cap dans votre posture de leader.",
    points_force: [
      "Conscience partielle de vos modes relationnels",
      "Volonté de progresser dans votre leadership",
      "Capacité à remettre en question vos pratiques",
    ],
    axes_dev: [
      "Renforcer votre capacité d'inclusion et de reconnaissance",
      "Travailler l'équilibre contrôle / délégation",
      "Développer la qualité du lien avec vos collaborateurs",
    ],
  },
  {
    id: "ss-p3", score_min: 51, score_max: 70,
    label: "Profil en tension — Transformation nécessaire",
    analyse: "Plusieurs indicateurs signalent des difficultés relationnelles qui impactent significativement votre leadership et la dynamique de vos équipes. Ces résultats ne sont pas une fatalité : ils révèlent des leviers de transformation à activer. Un accompagnement professionnel est fortement recommandé.",
    points_force: [
      "Prise de conscience des enjeux relationnels",
      "Disponibilité pour un travail de fond sur votre leadership",
    ],
    axes_dev: [
      "Travailler en profondeur votre régulation émotionnelle",
      "Reconstruire la confiance et la proximité avec vos équipes",
      "Sortir des schémas de sur-contrôle ou d'évitement",
      "Explorer votre rapport à l'autorité et à l'influence",
    ],
  },
  {
    id: "ss-p4", score_min: 71, score_max: 100,
    label: "Profil en alerte — Accompagnement prioritaire",
    analyse: "Vos résultats mettent en lumière des difficultés importantes sur plusieurs dimensions fondamentales du leadership relationnel. Ces signaux méritent une attention immédiate. Un programme de coaching structuré vous aiderait à retrouver un équilibre et à transformer ces défis en forces.",
    points_force: [
      "Courage de vous évaluer avec honnêteté",
      "Conscience que quelque chose doit changer — moteur puissant",
    ],
    axes_dev: [
      "Stabiliser votre régulation émotionnelle en priorité",
      "Reconstruire votre capacité d'inclusion et de connexion",
      "Travailler votre rapport au contrôle et à la délégation",
      "Trouver un accompagnement individuel adapté à votre contexte",
    ],
  },
];

// ─── DIAGNOSTIC 2 : Légitimité ───────────────────────────────────────────────

const legitQuestions = [
  choice("lg1",  1,  "J'attribue mes réussites à des facteurs externes (chance, indulgence, timing).", LEGIT_OPTIONS),
  choice("lg2",  2,  "Je crains que les autres surestiment mes compétences.", LEGIT_OPTIONS),
  choice("lg3",  3,  "Je travaille plus que nécessaire pour « assurer ».", LEGIT_OPTIONS),
  choice("lg4",  4,  "Je minimise mes succès dès qu'on me félicite.", LEGIT_OPTIONS),
  choice("lg5",  5,  "Je pense souvent que je ne suis pas « encore assez ».", LEGIT_OPTIONS),
  choice("lg6",  6,  "Je redoute d'être évalué·e ou observé·e.", LEGIT_OPTIONS),
  choice("lg7",  7,  "Je me compare fréquemment à des personnes que je juge « meilleures ».", LEGIT_OPTIONS),
  choice("lg8",  8,  "Je doute de pouvoir reproduire mes réussites.", LEGIT_OPTIONS),
  choice("lg9",  9,  "Je me sens parfois « en fraude » dans mon rôle.", LEGIT_OPTIONS),
  choice("lg10", 10, "Je me sens soulagé·e plutôt que fier·e quand je réussis.", LEGIT_OPTIONS),
  choice("lg11", 11, "Je pense que mes compétences ne sont pas « réelles ».", LEGIT_OPTIONS),
  choice("lg12", 12, "Je me sens en décalage entre ce que je montre et ce que je crois être.", LEGIT_OPTIONS),
];

const legitProfils = [
  {
    id: "lg-p1", score_min: 0, score_max: 40,
    label: "Ancrage solide",
    analyse: "Vous avez développé un rapport sain à votre légitimité. Vos réussites sont reconnues comme le fruit de vos compétences et de votre engagement. Ce n'est pas de l'arrogance — c'est de l'ancrage. Cet équilibre est précieux, mais il n'est jamais définitif. Les transitions peuvent réactiver des doutes enfouis.",
    points_force: [
      "Rapport sain à vos réussites et compétences",
      "Capacité à reconnaître votre valeur sans la minimiser",
      "Posture professionnelle ancrée et cohérente",
    ],
    axes_dev: [
      "Rester vigilant lors des transitions professionnelles",
      "Transformer cet ancrage en levier de leadership pour votre entourage",
      "Approfondir la connaissance de vos ressources internes",
    ],
  },
  {
    id: "lg-p2", score_min: 41, score_max: 67,
    label: "Signaux à surveiller",
    analyse: "Votre légitimité vacille dans certaines situations : prise de parole, évaluation, nouveau périmètre. Ces doutes ne sont pas anodins — ils consomment de l'énergie, freinent vos décisions et vous empêchent de prendre la place qui vous revient. Sans intervention ciblée, les mécanismes de doute se renforcent.",
    points_force: [
      "Conscience de vos doutes — premier pas vers leur dépassement",
      "Motivation à progresser et à vous améliorer",
      "Sensibilité aux signaux internes",
    ],
    axes_dev: [
      "Identifier vos déclencheurs de doute spécifiques",
      "Construire une relation plus juste à vos compétences réelles",
      "Développer des rituels de reconnaissance de vos succès",
    ],
  },
  {
    id: "lg-p3", score_min: 68, score_max: 80,
    label: "Zone de vigilance",
    analyse: "Le doute est devenu un compagnon quotidien. Vous surcompensez, vous évitez l'exposition, vous attribuez vos succès à tout sauf à vous-même. Ce fonctionnement a un coût : fatigue, stress, décisions en retrait. Ce que vous vivez n'est ni une fatalité ni un trait de caractère — c'est un schéma qui se déconstruit.",
    points_force: [
      "Conscience que quelque chose doit changer",
      "Exigence personnelle élevée — une ressource à réorienter",
      "Capacité d'introspection développée",
    ],
    axes_dev: [
      "Déconstruire les mécanismes de surcompensation",
      "Reconstruire une légitimité authentique, pas une façade",
      "Travailler votre rapport à l'évaluation et au regard des autres",
    ],
  },
  {
    id: "lg-p4", score_min: 81, score_max: 100,
    label: "Urgence d'agir",
    analyse: "Le syndrome de l'imposteur impacte significativement votre quotidien professionnel, votre bien-être et potentiellement votre trajectoire de carrière. La tension entre ce que vous montrez et ce que vous ressentez est coûteuse — en énergie, en opportunités manquées, en confiance érodée. Attendre ne fera qu'amplifier ces mécanismes.",
    points_force: [
      "Capacité à nommer ce que vous vivez",
      "Conscience de l'écart — moteur puissant de transformation",
    ],
    axes_dev: [
      "Traiter les croyances limitantes à la racine",
      "Développer une posture professionnelle alignée avec qui vous êtes réellement",
      "Construire un accompagnement individuel en profondeur",
    ],
  },
];

// ─── DIAGNOSTIC 3 : Freelance ────────────────────────────────────────────────

const freelanceQuestions = [
  slider("fl1",  1,  "Je manque d'énergie pour mon activité."),
  slider("fl2",  2,  "Mon travail m'épuise durablement."),
  slider("fl3",  3,  "Je n'arrive pas à récupérer après des périodes intenses."),
  slider("fl4",  4,  "Mes revenus sont irréguliers ou imprévisibles."),
  slider("fl5",  5,  "Je ressens une pression financière liée à mon activité."),
  slider("fl6",  6,  "Je me demande parfois si mon activité est réellement viable."),
  slider("fl7",  7,  "J'ai du mal à trouver régulièrement de nouveaux clients."),
  slider("fl8",  8,  "Je consacre beaucoup d'énergie à chercher des missions."),
  slider("fl9",  9,  "Je me demande comment développer mon activité durablement."),
  slider("fl10", 10, "J'ai l'impression de travailler tout le temps."),
  slider("fl11", 11, "J'ai du mal à déconnecter du travail."),
  slider("fl12", 12, "Je ressens une fatigue liée à la charge de travail."),
  slider("fl13", 13, "Je me demande parfois si ce que je fais a encore du sens pour moi."),
  slider("fl14", 14, "Mon activité ne me procure plus le même enthousiasme qu'avant."),
  slider("fl15", 15, "Je réfléchis à une évolution ou un changement de direction."),
  slider("fl16", 16, "Je me sens seul(e) dans mes décisions professionnelles."),
  slider("fl17", 17, "J'aimerais pouvoir échanger davantage avec d'autres entrepreneurs."),
  slider("fl18", 18, "Je manque parfois de soutien ou de regard extérieur."),
  slider("fl19", 19, "J'ai l'impression que mon activité stagne."),
  slider("fl20", 20, "Je ne sais pas comment passer à l'étape suivante."),
  slider("fl21", 21, "Je me demande s'il faut changer de modèle ou de positionnement."),
  slider("fl22", 22, "Je sens que mes aspirations professionnelles changent."),
  slider("fl23", 23, "Mon activité actuelle ne reflète plus totalement qui je suis aujourd'hui."),
  slider("fl24", 24, "J'ai envie de réinventer mon projet professionnel."),
  slider("fl25", 25, "J'ai du mal à organiser mon travail librement."),
  slider("fl26", 26, "Je ne contrôle pas toujours le choix de mes clients ou missions."),
  slider("fl27", 27, "Je ne me sens pas pleinement maître de mon activité."),
  slider("fl28", 28, "Je n'arrive pas à innover dans mon activité."),
  slider("fl29", 29, "Je suis enfermé(e) dans des tâches répétitives."),
  slider("fl30", 30, "Je manque d'idées pour développer mon activité."),
];

const freelanceProfils = [
  {
    id: "fl-p1", score_min: 0, score_max: 35,
    label: "Profil équilibré",
    analyse: "Votre diagnostic ne révèle pas de tension majeure. Votre activité semble relativement équilibrée sur les principales dimensions de l'entrepreneuriat. Continuez à surveiller régulièrement ces indicateurs et n'hésitez pas à solliciter un accompagnement pour optimiser les zones que vous souhaitez développer.",
    points_force: [
      "Bonne stabilité globale de votre activité entrepreneuriale",
      "Gestion saine des tensions inhérentes à l'indépendance",
      "Énergie et sens au rendez-vous dans votre parcours",
    ],
    axes_dev: [
      "Surveiller régulièrement les dimensions pour anticiper les signaux",
      "Investir dans vos zones de développement prioritaires",
      "S'entourer pour prévenir plutôt que guérir",
    ],
  },
  {
    id: "fl-p2", score_min: 36, score_max: 65,
    label: "Tensions identifiées",
    analyse: "Vous montrez des signes de tension sur plusieurs dimensions de votre activité. Ces tensions sont normales dans un parcours entrepreneurial — elles indiquent des zones qui méritent votre attention avant qu'elles ne s'aggravent. Un accompagnement ciblé peut vous aider à les transformer en leviers de progression.",
    points_force: [
      "Conscience de vos zones de friction",
      "Motivation à faire évoluer votre activité",
      "Résilience prouvée face aux défis de l'entrepreneuriat",
    ],
    axes_dev: [
      "Identifier vos 2-3 tensions prioritaires à traiter",
      "Construire un plan d'action concret par dimension",
      "Chercher du soutien pour rompre l'isolement entrepreneurial",
    ],
  },
  {
    id: "fl-p3", score_min: 66, score_max: 100,
    label: "Crises actives",
    analyse: "Plusieurs dimensions de votre activité sont en zone critique. Votre parcours entrepreneurial traverse une phase difficile qui nécessite une intervention. Ce que vous vivez n'est pas un échec — c'est le signe que votre modèle actuel a atteint ses limites. Un accompagnement professionnel vous aiderait à reprendre le contrôle.",
    points_force: [
      "Courage de continuer malgré les obstacles",
      "Conscience de la situation — première étape vers la transformation",
    ],
    axes_dev: [
      "Traiter d'urgence vos tensions prioritaires",
      "Repenser votre modèle économique si nécessaire",
      "Rompre l'isolement en rejoignant un réseau d'entrepreneurs",
      "Envisager un accompagnement professionnel structuré",
    ],
  },
];

// ─── DIAGNOSTIC 4 : Conscience de soi ───────────────────────────────────────

const conscienceQuestions = [
  slider("cs1",  1,  "Je connais clairement mes valeurs personnelles et professionnelles."),
  slider("cs2",  2,  "Je sais quelles activités ou missions me donnent le plus de sens."),
  slider("cs3",  3,  "Je peux identifier mes motivations profondes qui me font avancer."),
  slider("cs4",  4,  "Je reconnais quand je suis en décalage avec mes valeurs et je comprends pourquoi."),
  slider("cs5",  5,  "Je sais quelles sont mes compétences clés et talents distinctifs."),
  slider("cs6",  6,  "Je peux identifier les situations où je réussis et contribue le mieux."),
  slider("cs7",  7,  "Je connais mes forces à mobiliser dans mon projet professionnel."),
  slider("cs8",  8,  "Je suis conscient(e) des compétences que je souhaite développer."),
  slider("cs9",  9,  "Je sais quels comportements ou habitudes limitent mon efficacité."),
  slider("cs10", 10, "Je connais les situations ou contextes qui me mettent en difficulté."),
  slider("cs11", 11, "Je suis conscient(e) des obstacles internes (peurs, croyances) qui freinent mon projet."),
  slider("cs12", 12, "Je sais identifier mes limites et comment les contourner ou les dépasser."),
  slider("cs13", 13, "Je peux évaluer dans quelle mesure mes décisions sont alignées avec mes valeurs."),
  slider("cs14", 14, "Je suis conscient(e) de ce qui me donne de l'énergie et ce qui me fatigue."),
  slider("cs15", 15, "Je sais quelles ressources ou soutiens peuvent m'aider dans mon projet."),
  slider("cs16", 16, "Je peux formuler une vision claire de mon projet professionnel."),
  slider("cs17", 17, "Je sais quelles actions concrètes je peux mettre en place pour avancer."),
  slider("cs18", 18, "Je peux identifier les priorités à travailler pour lever mes blocages."),
  slider("cs19", 19, "Je suis capable de mesurer mes progrès et de m'ajuster en fonction."),
  slider("cs20", 20, "Je peux mobiliser mes forces et mon réseau pour concrétiser mes choix professionnels."),
];

const conscienceProfils = [
  {
    id: "cs-p1", score_min: 0, score_max: 30,
    label: "Zone de vigilance",
    analyse: "Vous êtes au début d'un travail d'introspection important. C'est une démarche courageuse qui peut transformer votre trajectoire professionnelle. Un accompagnement structuré vous permettrait de poser les fondations de votre projet avec sérénité et de progresser plus rapidement.",
    points_force: [
      "Courage d'entreprendre ce travail d'introspection",
      "Disponibilité pour une démarche de développement personnel",
    ],
    axes_dev: [
      "Clarifier vos valeurs et motivations profondes",
      "Identifier vos forces et talents distinctifs",
      "Explorer vos blocages internes avec un accompagnement",
      "Construire une vision de votre projet professionnel",
    ],
  },
  {
    id: "cs-p2", score_min: 31, score_max: 60,
    label: "Conscience partielle",
    analyse: "Vous avez des bases solides mais certains aspects nécessitent un travail approfondi pour sécuriser votre projet professionnel. Certaines dimensions sont bien ancrées, d'autres méritent d'être approfondies. Le potentiel de progression est important.",
    points_force: [
      "Conscience de soi en développement actif",
      "Capacité à identifier certaines forces et blocages",
      "Engagement dans votre développement personnel",
    ],
    axes_dev: [
      "Approfondir les dimensions les moins développées",
      "Renforcer l'alignement entre vos valeurs et vos décisions",
      "Accélérer le passage à l'action sur vos priorités identifiées",
    ],
  },
  {
    id: "cs-p3", score_min: 61, score_max: 100,
    label: "Points solides",
    analyse: "Vous disposez de ressources claires à mobiliser et à renforcer. Vos indicateurs de conscience de soi sont solides sur l'ensemble des 5 dimensions. Le passage à l'action peut s'accélérer. Un accompagnement ciblé vous permettrait d'aller encore plus loin dans votre leadership.",
    points_force: [
      "Connaissance approfondie de vos valeurs, forces et motivations",
      "Capacité à identifier vos blocages et à les contourner",
      "Alignement fort entre votre vision et vos décisions",
    ],
    axes_dev: [
      "Mettre en œuvre votre vision avec discipline et régularité",
      "Continuer à développer les dimensions encore en progression",
      "Partager votre démarche pour en amplifier l'impact",
    ],
  },
];

// ─── Insertion ───────────────────────────────────────────────────────────────

const diagnostics = [
  {
    thematique: "Soft Skills",
    titre: "Scan FIRO des Soft Skills du Leader",
    description: "16 questions pour évaluer vos compétences relationnelles de leader selon le modèle FIRO : Inclusion, Contrôle, Affection, Conscience de soi. À réaliser idéalement chaque trimestre.",
    duree_estimee: 5,
    questions: softSkillsQuestions,
    profils: softSkillsProfils,
  },
  {
    thematique: "Légitimité",
    titre: "Baromètre de la Légitimité Professionnelle",
    description: "Un outil d'auto-perception pour identifier vos signaux internes et mieux comprendre votre rapport à la légitimité au travail. 12 affirmations sur une échelle de Jamais à Toujours.",
    duree_estimee: 3,
    questions: legitQuestions,
    profils: legitProfils,
  },
  {
    thematique: "Freelance",
    titre: "Le diagnostic des crises de l'entrepreneur",
    description: "30 questions pour repérer les tensions normales de votre parcours entrepreneurial. Ce que vous vivez n'est pas un échec — c'est une étape.",
    duree_estimee: 5,
    questions: freelanceQuestions,
    profils: freelanceProfils,
  },
  {
    thematique: "Conscience de soi",
    titre: "Diagnostic Conscience de soi",
    description: "20 questions pour évaluer votre niveau de conscience de soi à travers 5 dimensions clés : valeurs, forces, blocages, alignement et passage à l'action.",
    duree_estimee: 5,
    questions: conscienceQuestions,
    profils: conscienceProfils,
  },
];

for (const d of diagnostics) {
  const rows = await sql`
    INSERT INTO diagnostics (thematique, titre, description, duree_estimee, questions, profils, is_published)
    VALUES (
      ${d.thematique}, ${d.titre}, ${d.description}, ${d.duree_estimee},
      ${JSON.stringify(d.questions)}, ${JSON.stringify(d.profils)}, ${true}
    )
    RETURNING id
  `;
  console.log(`✓ ${d.titre} — id: ${rows[0].id}`);
}
