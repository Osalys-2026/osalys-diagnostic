"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { THEMATIQUES } from "@/lib/mock-data";

export interface ThematiqueOption { id: string; titre: string; }
import type { Question, ProfilResultat, SkillCategory } from "@/lib/types";
import { saveDiagnostic, updateDiagnostic } from "@/lib/actions/diagnostics";

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface WizardState {
  thematique_id: string;
  titre: string;
  description: string;
  duree_estimee: number;
  questions: Question[];
  profils: ProfilResultat[];
}

const INITIAL: WizardState = {
  thematique_id: "",
  titre: "",
  description: "",
  duree_estimee: 5,
  questions: [],
  profils: [
    { id: "p1", score_min: 0,  score_max: 30,  label: "", analyse: "", points_force: [], axes_dev: [] },
    { id: "p2", score_min: 31, score_max: 60,  label: "", analyse: "", points_force: [], axes_dev: [] },
    { id: "p3", score_min: 61, score_max: 85,  label: "", analyse: "", points_force: [], axes_dev: [] },
    { id: "p4", score_min: 86, score_max: 100, label: "", analyse: "", points_force: [], axes_dev: [] },
  ],
};

const STEP_LABELS: Record<WizardStep, string> = {
  1: "Informations",
  2: "Questions",
  3: "Profils résultat",
  4: "Prévisualisation",
  5: "Publié",
};

export function DiagnosticWizard({ initialState, editId, availableThematiques, availableCategories = [] }: { initialState?: Partial<WizardState>; editId?: string; availableThematiques?: ThematiqueOption[]; availableCategories?: SkillCategory[] } = {}) {
  const themes = availableThematiques ?? THEMATIQUES.map((t) => ({ id: t.id, titre: t.titre }));
  const [step, setStep]     = useState<WizardStep>(1);
  const [state, setState]   = useState<WizardState>({ ...INITIAL, ...initialState });
  const [error, setError]   = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!editId;

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  const thematique = themes.find((t) => t.id === state.thematique_id);

  const ready =
    !!state.titre &&
    !!state.thematique_id &&
    state.questions.length >= 4 &&
    state.profils.every((p) => p.label);

  function handleSave(publish: boolean) {
    setError(null);
    startTransition(async () => {
      try {
        const data = {
          thematique: thematique?.titre ?? state.thematique_id,
          titre: state.titre,
          description: state.description,
          duree_estimee: state.duree_estimee,
          questions: state.questions,
          profils: state.profils,
          is_published: publish,
        };
        if (isEdit && editId) {
          await updateDiagnostic(editId, data);
        } else {
          await saveDiagnostic(data);
        }
        if (publish) {
          setStep(5);
        } else {
          router.push("/admin/diagnostics");
        }
      } catch {
        setError("Une erreur est survenue lors de l'enregistrement. Réessayez.");
      }
    });
  }

  if (step === 5) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "rgba(201,241,223,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9F1DF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "24px", textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: "10px" }}>
          {isEdit ? "Diagnostic mis à jour" : "Diagnostic publié"}
        </h2>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", marginBottom: "40px" }}>
          « {state.titre} » est maintenant visible dans la liste des diagnostics.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <button
            onClick={() => { setState(INITIAL); setStep(1); }}
            className="btn-solid"
          >
            Créer un autre diagnostic
          </button>
          <button
            onClick={() => router.push("/admin/diagnostics")}
            className="btn-outline"
            style={{ padding: "14px 28px" }}
          >
            Voir tous les diagnostics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Barre d'étapes */}
      <div style={{ display: "flex", marginBottom: "48px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {([1, 2, 3, 4] as WizardStep[]).map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            style={{
              flex: 1,
              padding: "12px 8px",
              background: "none",
              border: "none",
              borderBottom: `2px solid ${step === s ? "#C9F1DF" : "transparent"}`,
              color: step === s ? "#fff" : step > s ? "rgba(255,255,255,0.50)" : "rgba(255,255,255,0.25)",
              fontFamily: "Sora, sans-serif",
              fontSize: "12px",
              fontWeight: step === s ? 700 : 400,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 150ms",
              textAlign: "center",
            }}
          >
            {s}. {STEP_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div style={{ minHeight: "400px" }}>
        {step === 1 && <Step1 state={state} update={update} themes={themes} />}
        {step === 2 && <Step2 state={state} update={update} categories={availableCategories} />}
        {step === 3 && <Step3 state={state} update={update} />}
        {step === 4 && (
          <Step4
            state={state}
            thematique={thematique}
            ready={ready}
            error={error}
            isPending={isPending}
            isEdit={isEdit}
            onPublish={() => handleSave(true)}
            onDraft={() => handleSave(false)}
          />
        )}
      </div>

      {/* Navigation */}
      {step < 4 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "48px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1) as WizardStep)}
            disabled={step === 1}
            style={{
              background: "none",
              border: "none",
              color: step === 1 ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.50)",
              fontFamily: "Sora, sans-serif",
              fontSize: "13px",
              cursor: step === 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: 0,
            }}
          >
            ← Étape précédente
          </button>
          <button
            onClick={() => setStep((s) => Math.min(4, s + 1) as WizardStep)}
            className="btn-outline"
            style={{ padding: "14px 28px" }}
          >
            Étape suivante →
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Étape 1 : Informations ─── */
function Step1({ state, update, themes }: { state: WizardState; update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void; themes: ThematiqueOption[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <Field label="Thématique parente" required>
        <select value={state.thematique_id} onChange={(e) => update("thematique_id", e.target.value)} style={selectStyle}>
          <option value="" style={{ background: "#111" }}>Sélectionnez une thématique…</option>
          {themes.map((t) => (
            <option key={t.id} value={t.id} style={{ background: "#111" }}>{t.titre}</option>
          ))}
        </select>
      </Field>
      <Field label="Titre du diagnostic" required>
        <input
          type="text"
          value={state.titre}
          onChange={(e) => update("titre", e.target.value)}
          placeholder="ex. Légitimité & posture"
          style={inputStyle}
        />
      </Field>
      <Field label="Description courte">
        <textarea
          value={state.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Ce diagnostic permet d'évaluer…"
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </Field>
      <Field label="Durée estimée (minutes)">
        <input
          type="number"
          min={1}
          max={30}
          value={state.duree_estimee}
          onChange={(e) => update("duree_estimee", Number(e.target.value))}
          style={{ ...inputStyle, width: "100px" }}
        />
      </Field>
    </div>
  );
}

/* ─── Étape 2 : Questions ─── */
function Step2({ state, update, categories }: { state: WizardState; update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void; categories: SkillCategory[] }) {
  function addQuestion() {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      texte: "",
      type_reponse: "likert",
      poids: 1,
      ordre: state.questions.length + 1,
      options: [
        { id: "o1", texte: "Jamais",   valeur_score: 0   },
        { id: "o2", texte: "Rarement", valeur_score: 25  },
        { id: "o3", texte: "Parfois",  valeur_score: 50  },
        { id: "o4", texte: "Souvent",  valeur_score: 75  },
        { id: "o5", texte: "Toujours", valeur_score: 100 },
      ],
    };
    update("questions", [...state.questions, newQ]);
  }

  function updateQ(id: string, field: keyof Question, value: unknown) {
    update("questions", state.questions.map((q) => q.id === id ? { ...q, [field]: value } : q));
  }

  function removeQ(id: string) {
    update("questions", state.questions.filter((q) => q.id !== id));
  }

  function moveQ(id: string, dir: -1 | 1) {
    const idx = state.questions.findIndex((q) => q.id === id);
    if (idx + dir < 0 || idx + dir >= state.questions.length) return;
    const next = [...state.questions];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    update("questions", next.map((q, i) => ({ ...q, ordre: i + 1 })));
  }

  return (
    <div>
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.40)", marginBottom: "20px" }}>
        {state.questions.length} question{state.questions.length !== 1 ? "s" : ""} — minimum 4 requis pour publier.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        {state.questions.length === 0 && (
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "40px 0", border: "1px dashed rgba(255,255,255,0.10)", borderRadius: "10px" }}>
            Aucune question. Cliquez sur « Ajouter une question » pour commencer.
          </p>
        )}
        {state.questions.map((q, i) => (
          <QuestionEditor
            key={q.id}
            question={q}
            index={i}
            total={state.questions.length}
            categories={categories}
            onUpdate={updateQ}
            onRemove={removeQ}
            onMove={moveQ}
          />
        ))}
      </div>
      <button
        onClick={addQuestion}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 20px",
          border: "1px dashed rgba(255,255,255,0.20)",
          borderRadius: "10px",
          background: "none",
          color: "rgba(255,255,255,0.55)",
          fontFamily: "Sora, sans-serif",
          fontSize: "13px",
          cursor: "pointer",
          width: "100%",
          justifyContent: "center",
          transition: "all 150ms",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.40)";
          (e.currentTarget as HTMLElement).style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.20)";
          (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
        }}
      >
        + Ajouter une question
      </button>
    </div>
  );
}

function QuestionEditor({ question, index, total, categories, onUpdate, onRemove, onMove }: {
  question: Question;
  index: number;
  total: number;
  categories: SkillCategory[];
  onUpdate: (id: string, field: keyof Question, value: unknown) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: "10px", overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", background: "rgba(255,255,255,0.03)", cursor: "pointer" }}
        onClick={() => setOpen((o) => !o)}
      >
        <span style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", color: "#C9F1DF", fontWeight: 700, width: "20px", flexShrink: 0 }}>
          {index + 1}
        </span>
        <p style={{ flex: 1, fontSize: "14px", color: question.texte ? "#fff" : "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {question.texte || "Nouvelle question…"}
        </p>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.30)", letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
          {question.type_reponse}
        </span>
        {/* Réordonner */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onMove(question.id, -1)}
            disabled={index === 0}
            style={{ background: "none", border: "none", color: index === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.40)", cursor: index === 0 ? "default" : "pointer", padding: "2px 4px", fontSize: "10px", lineHeight: 1 }}
          >▲</button>
          <button
            onClick={() => onMove(question.id, 1)}
            disabled={index === total - 1}
            style={{ background: "none", border: "none", color: index === total - 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.40)", cursor: index === total - 1 ? "default" : "pointer", padding: "2px 4px", fontSize: "10px", lineHeight: 1 }}
          >▼</button>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(question.id); }}
          style={{ background: "none", border: "none", color: "rgba(232,106,51,0.60)", cursor: "pointer", padding: "4px 6px", fontSize: "18px", lineHeight: 1, flexShrink: 0 }}
        >×</button>
      </div>

      {/* Corps */}
      {open && (
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Field label="Texte de la question">
            <textarea
              value={question.texte}
              onChange={(e) => onUpdate(question.id, "texte", e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="Formulez votre question ici…"
            />
          </Field>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Field label="Type de réponse">
              <select value={question.type_reponse} onChange={(e) => onUpdate(question.id, "type_reponse", e.target.value)} style={selectStyle}>
                <option value="likert"  style={{ background: "#111" }}>Likert (Jamais → Toujours)</option>
                <option value="choice"  style={{ background: "#111" }}>Choix unique</option>
                <option value="slider"  style={{ background: "#111" }}>Curseur</option>
              </select>
            </Field>
            <Field label="Catégorie de compétence">
              {categories.length === 0 ? (
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", paddingTop: "8px" }}>
                  Aucune catégorie — <a href="/admin/categories" style={{ color: "#C9F1DF", textDecoration: "none" }}>en créer</a>
                </p>
              ) : (
                <select
                  value={question.category_id ?? ""}
                  onChange={(e) => onUpdate(question.id, "category_id", e.target.value || undefined)}
                  style={{ ...selectStyle, minWidth: "180px" }}
                >
                  <option value="" style={{ background: "#111" }}>— Sans catégorie —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: "#111" }}>{c.label}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Poids">
              <input
                type="number"
                min={0.1}
                max={3}
                step={0.1}
                value={question.poids}
                onChange={(e) => onUpdate(question.id, "poids", Number(e.target.value))}
                style={{ ...inputStyle, width: "90px" }}
              />
            </Field>
          </div>

          {/* Options pour type "choice" */}
          {question.type_reponse === "choice" && (
            <OptionsEditor question={question} onUpdate={onUpdate} />
          )}

          {/* Labels slider */}
          {question.type_reponse === "slider" && (
            <div style={{ display: "flex", gap: "16px" }}>
              <Field label="Label gauche (min)">
                <input
                  type="text"
                  value={question.slider_min_label ?? ""}
                  onChange={(e) => onUpdate(question.id, "slider_min_label", e.target.value)}
                  placeholder="ex. Jamais"
                  style={inputStyle}
                />
              </Field>
              <Field label="Label droite (max)">
                <input
                  type="text"
                  value={question.slider_max_label ?? ""}
                  onChange={(e) => onUpdate(question.id, "slider_max_label", e.target.value)}
                  placeholder="ex. Toujours"
                  style={inputStyle}
                />
              </Field>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OptionsEditor({ question, onUpdate }: {
  question: Question;
  onUpdate: (id: string, field: keyof Question, value: unknown) => void;
}) {
  function addOption() {
    const opts = [...(question.options ?? []), { id: `o-${Date.now()}`, texte: "", valeur_score: 50 }];
    onUpdate(question.id, "options", opts);
  }
  function updateOption(oid: string, field: "texte" | "valeur_score", val: string | number) {
    const opts = (question.options ?? []).map((o) => o.id === oid ? { ...o, [field]: val } : o);
    onUpdate(question.id, "options", opts);
  }
  function removeOption(oid: string) {
    onUpdate(question.id, "options", (question.options ?? []).filter((o) => o.id !== oid));
  }

  return (
    <Field label="Options de réponse">
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
        {(question.options ?? []).map((opt) => (
          <div key={opt.id} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              value={opt.texte}
              onChange={(e) => updateOption(opt.id, "texte", e.target.value)}
              placeholder="Texte de l'option"
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              type="number"
              value={opt.valeur_score}
              onChange={(e) => updateOption(opt.id, "valeur_score", Number(e.target.value))}
              min={0}
              max={100}
              title="Score (0-100)"
              style={{ ...inputStyle, width: "70px", textAlign: "center" }}
            />
            <button
              onClick={() => removeOption(opt.id)}
              style={{ background: "none", border: "none", color: "rgba(232,106,51,0.60)", cursor: "pointer", fontSize: "16px", padding: "4px" }}
            >×</button>
          </div>
        ))}
      </div>
      <button
        onClick={addOption}
        style={{ fontSize: "12px", color: "rgba(255,255,255,0.40)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "Sora, sans-serif", letterSpacing: "0.04em" }}
      >
        + Ajouter une option
      </button>
    </Field>
  );
}

/* ─── Étape 3 : Profils résultat ─── */
function Step3({ state, update }: { state: WizardState; update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void }) {
  function updateProfil(id: string, field: keyof ProfilResultat, value: unknown) {
    update("profils", state.profils.map((p) => p.id === id ? { ...p, [field]: value } : p));
  }

  const PROFIL_COLORS = ["rgba(232,106,51,0.80)", "rgba(255,255,255,0.70)", "#7BD3AC", "#C9F1DF"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{
        padding: "14px 18px",
        background: "rgba(201,241,223,0.06)",
        border: "1px solid rgba(201,241,223,0.15)",
        borderRadius: "10px",
        marginBottom: "4px",
      }}>
        <p style={{ fontSize: "13px", color: "rgba(201,241,223,0.80)", lineHeight: 1.6 }}>
          <strong>Points de force</strong> et <strong>axes de développement</strong> sont désormais générés automatiquement
          à partir des catégories de compétences attribuées aux questions.
          Renseignez ici le <strong>label</strong> et l'<strong>analyse</strong> pour chaque tranche de score.
        </p>
      </div>
      {state.profils.map((profil, i) => (
        <div key={profil.id} style={{ border: `1px solid ${profil.label ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)"}`, borderRadius: "12px", padding: "24px", transition: "border-color 200ms" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span style={{
              fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700,
              color: "#000", background: PROFIL_COLORS[i], padding: "4px 12px", borderRadius: "999px",
            }}>
              {profil.score_min} – {profil.score_max}
            </span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.30)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Profil {i + 1} / 4
            </span>
            {profil.label && <span style={{ marginLeft: "auto", fontSize: "12px", color: "#C9F1DF" }}>✓</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Field label="Label du profil" required>
              <input
                type="text"
                value={profil.label}
                onChange={(e) => updateProfil(profil.id, "label", e.target.value)}
                placeholder="ex. Leadership en émergence"
                style={inputStyle}
              />
            </Field>
            <Field label="Analyse (3-4 phrases)">
              <textarea
                value={profil.analyse}
                onChange={(e) => updateProfil(profil.id, "analyse", e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Description bienveillante et précise du profil…"
              />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Étape 4 : Récap + publication ─── */
function Step4({ state, thematique, ready, error, isPending, isEdit, onPublish, onDraft }: {
  state: WizardState;
  thematique: { titre: string } | undefined;
  ready: boolean;
  error: string | null;
  isPending: boolean;
  isEdit: boolean;
  onPublish: () => void;
  onDraft: () => void;
}) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
        <RecapCard title="Diagnostic" items={[
          { label: "Thématique",  value: thematique?.titre ?? "Non sélectionnée", ok: !!thematique },
          { label: "Titre",       value: state.titre || "—", ok: !!state.titre },
          { label: "Durée",       value: `${state.duree_estimee} min`, ok: true },
          { label: "Description", value: state.description ? "Renseignée" : "Facultative", ok: true },
        ]} />
        <RecapCard title="Contenu" items={[
          { label: "Questions", value: `${state.questions.length}`, ok: state.questions.length >= 4 },
          { label: "Profils complétés", value: `${state.profils.filter((p) => p.label).length} / 4`, ok: state.profils.every((p) => p.label) },
        ]} />
      </div>

      {!ready && (
        <div style={{ padding: "14px 20px", background: "rgba(232,106,51,0.08)", border: "1px solid rgba(232,106,51,0.20)", borderRadius: "10px", marginBottom: "24px" }}>
          <p style={{ fontSize: "13px", color: "rgba(232,106,51,0.90)", lineHeight: 1.55 }}>
            Avant de publier : sélectionnez une thématique, renseignez un titre, ajoutez au moins 4 questions et remplissez les 4 labels de profils.
          </p>
        </div>
      )}

      {error && (
        <div style={{ padding: "14px 20px", background: "rgba(232,106,51,0.08)", border: "1px solid rgba(232,106,51,0.20)", borderRadius: "10px", marginBottom: "24px" }}>
          <p style={{ fontSize: "13px", color: "rgba(232,106,51,0.90)" }}>{error}</p>
        </div>
      )}

      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <button
          onClick={onPublish}
          disabled={!ready || isPending}
          className="btn-solid"
          style={{ opacity: ready && !isPending ? 1 : 0.40, cursor: ready && !isPending ? "pointer" : "not-allowed" }}
        >
          {isPending ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Publier le diagnostic"}
        </button>
        <button
          onClick={onDraft}
          disabled={!state.titre || isPending}
          style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "8px",
            color: "rgba(255,255,255,0.55)",
            fontFamily: "Sora, sans-serif",
            fontSize: "13px",
            cursor: state.titre && !isPending ? "pointer" : "not-allowed",
            opacity: state.titre && !isPending ? 1 : 0.40,
            padding: "12px 20px",
          }}
        >
          Enregistrer en brouillon
        </button>
      </div>
    </div>
  );
}

function RecapCard({ title, items }: { title: string; items: { label: string; value: string; ok: boolean }[] }) {
  return (
    <div style={{ padding: "20px", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "10px" }}>
      <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.40)", marginBottom: "16px" }}>
        {title}
      </p>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginBottom: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.40)" }}>{item.label}</span>
          <span style={{ fontSize: "13px", color: item.ok ? "#fff" : "rgba(232,106,51,0.80)", fontWeight: 500 }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Helpers UI ─── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginBottom: "8px" }}>
        {label}{required && <span style={{ color: "#C9F1DF", marginLeft: "4px" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "8px",
  color: "#fff",
  fontFamily: "Sora, sans-serif",
  fontSize: "14px",
  padding: "10px 14px",
  outline: "none",
  caretColor: "#C9F1DF",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
};
