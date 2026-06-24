"use client";

import { useState, useEffect } from "react";
import type { DiagnosticStep, OnboardingData, Thematique, Diagnostic, Passation, ProfilResultat, SkillCategory, CategoryScore } from "@/lib/types";
import type { CoachProfile } from "@/lib/actions/coach";
import { savePassation } from "@/lib/actions/passation";
import { Onboarding } from "./steps/Onboarding";
import { ThemeSelection } from "./steps/ThemeSelection";
import { Questions } from "./steps/Questions";
import { Result } from "./steps/Result";

function computeScore(diagnostic: Diagnostic, reponses: Record<string, number>): number {
  let totalWeight = 0;
  let weightedScore = 0;

  for (const q of diagnostic.questions) {
    const value = reponses[q.id] ?? 0;
    weightedScore += value * q.poids;
    totalWeight += 100 * q.poids;
  }

  return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
}

function findProfil(diagnostic: Diagnostic, score: number): ProfilResultat | undefined {
  return diagnostic.profils.find((p) => score >= p.score_min && score <= p.score_max);
}

function computeCategoryScores(
  diagnostic: Diagnostic,
  reponses: Record<string, number>,
  categories: SkillCategory[]
): CategoryScore[] {
  const map: Record<string, { label: string; weightedScore: number; totalWeight: number }> = {};
  for (const q of diagnostic.questions) {
    if (!q.category_id) continue;
    const cat = categories.find((c) => c.id === q.category_id);
    if (!cat) continue;
    if (!map[q.category_id]) map[q.category_id] = { label: cat.label, weightedScore: 0, totalWeight: 0 };
    map[q.category_id].weightedScore += (reponses[q.id] ?? 0) * q.poids;
    map[q.category_id].totalWeight += 100 * q.poids;
  }
  return Object.entries(map)
    .map(([id, { label, weightedScore, totalWeight }]) => ({
      category_id: id,
      label,
      score: totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0,
    }))
    .sort((a, b) => b.score - a.score);
}

export function DiagnosticFlow({ thematiques, initialThemeId, coach, categories = [] }: { thematiques: Thematique[]; initialThemeId?: string; coach?: CoachProfile; categories?: SkillCategory[] }) {
  const [step, setStep] = useState<DiagnosticStep>("onboarding");
  const [lead, setLead] = useState<OnboardingData | null>(null);
  const [thematique, setThematique] = useState<Thematique | null>(null);
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [passation, setPassation] = useState<Passation | null>(null);
  const [passationId, setPassationId] = useState<string | null>(null);
  const [pageVisible, setPageVisible] = useState(true);

  // Pré-sélection via paramètre URL
  useEffect(() => {
    if (initialThemeId) {
      const found = thematiques.find((t) => t.id === initialThemeId);
      if (found) setThematique(found);
    }
  }, [initialThemeId, thematiques]);

  function transition(fn: () => void) {
    setPageVisible(false);
    setTimeout(() => { fn(); setPageVisible(true); }, 200);
  }

  function handleOnboardingComplete(data: OnboardingData) {
    setLead(data);
    transition(() => setStep("theme-selection"));
  }

  function handleThemeSelect(t: Thematique, d: Diagnostic) {
    setThematique(t);
    setDiagnostic(d);
    transition(() => setStep("questions"));
  }

  async function handleQuestionsComplete(reponses: Record<string, number>) {
    if (!lead || !thematique || !diagnostic) return;
    const score = computeScore(diagnostic, reponses);
    const profil = findProfil(diagnostic, score);
    const categoryScores = computeCategoryScores(diagnostic, reponses, categories);
    const p: Passation = { lead, thematique, diagnostic, reponses, score, profil, categoryScores };
    setPassation(p);

    // Persist asynchronously — ne bloque pas la navigation
    savePassation({
      prenom: lead.prenom,
      nom: lead.nom,
      email: lead.email,
      metier: lead.metier,
      entreprise: lead.entreprise,
      rgpd_consent: lead.rgpd_consent ?? false,
      thematique: thematique.titre,
      diagnostic: diagnostic.titre,
      score,
      profil: profil?.label ?? "Inconnu",
    }).then(({ passationId: id }) => setPassationId(id)).catch(console.error);

    transition(() => setStep("result"));
  }

  return (
    <div
      style={{
        opacity: pageVisible ? 1 : 0,
        transition: "opacity 200ms ease",
      }}
    >
      {step === "onboarding" && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {step === "theme-selection" && (
        <ThemeSelection
          thematiques={thematiques}
          prenom={lead?.prenom ?? ""}
          onSelect={handleThemeSelect}
        />
      )}

      {step === "questions" && diagnostic && (
        <Questions
          diagnostic={diagnostic}
          prenom={lead?.prenom ?? ""}
          onComplete={handleQuestionsComplete}
        />
      )}

      {step === "result" && passation && (
        <Result
          passation={passation}
          passationId={passationId ?? undefined}
          coach={coach}
          onNewDiagnostic={() => {
            setDiagnostic(null);
            setPassation(null);
            setPassationId(null);
            transition(() => setStep("theme-selection"));
          }}
        />
      )}
    </div>
  );
}
