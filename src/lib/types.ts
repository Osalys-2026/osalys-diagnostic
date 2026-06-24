// ─── Modèle de données Osalys Diagnostic ───

export type QuestionType = "likert" | "choice" | "slider";

export interface OptionReponse {
  id: string;
  texte: string;
  valeur_score: number;
}

export interface SkillCategory {
  id: string;
  label: string;
  order: number;
}

export interface CategoryScore {
  category_id: string;
  label: string;
  score: number; // 0–100
}

export interface Question {
  id: string;
  texte: string;
  type_reponse: QuestionType;
  poids: number;
  ordre: number;
  category_id?: string; // référence à SkillCategory.id
  options?: OptionReponse[];
  slider_min_label?: string;
  slider_max_label?: string;
}

export interface ProfilResultat {
  id: string;
  score_min: number;
  score_max: number;
  label: string;
  analyse: string;
  points_force: string[];
  axes_dev: string[];
}

export interface Diagnostic {
  id: string;
  thematique_id: string;
  titre: string;
  description: string;
  duree_estimee: number; // minutes
  questions: Question[];
  profils: ProfilResultat[];
}

export interface Thematique {
  id: string;
  titre: string;
  subtitle: string;
  accroche: string;
  diagnostics: Diagnostic[];
}

// ─── État du parcours utilisateur ───

export interface OnboardingData {
  prenom: string;
  nom: string;
  metier: string;
  entreprise: string;
  email: string;
  rgpd_consent: boolean;
}

export interface Passation {
  lead: OnboardingData;
  thematique: Thematique;
  diagnostic: Diagnostic;
  reponses: Record<string, number>; // question_id → valeur_score
  score?: number;
  profil?: ProfilResultat;
  categoryScores?: CategoryScore[]; // scores par catégorie de compétences
}

export type DiagnosticStep =
  | "onboarding"
  | "theme-selection"
  | "diagnostic-selection"
  | "questions"
  | "result";
