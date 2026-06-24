"use client";

import { useState, useEffect, useRef } from "react";
import type { OnboardingData } from "@/lib/types";

interface Props {
  onComplete: (data: OnboardingData) => void;
}

type Field = keyof Omit<OnboardingData, "rgpd_consent">;

const FIELDS: { key: Field; label: string; placeholder: string; required: boolean; type?: string }[] = [
  { key: "prenom", label: "Votre prénom", placeholder: "Jean-Marc", required: true },
  { key: "nom", label: "Votre nom", placeholder: "Dupont", required: false },
  { key: "metier", label: "Votre fonction", placeholder: "Directeur Général, Fondateur...", required: true },
  { key: "entreprise", label: "Votre entreprise", placeholder: "Nom de votre organisation", required: false },
  { key: "email", label: "Votre email professionnel", placeholder: "jean-marc@entreprise.fr", required: true, type: "email" },
];

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Partial<OnboardingData>>({});
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [rgpd, setRgpd] = useState(false);
  const [visible, setVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = FIELDS[step];
  const isLastField = step === FIELDS.length - 1;

  useEffect(() => {
    setVisible(true);
    setInputValue("");
    setError("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [step]);

  function validate(value: string): string {
    if (current.required && !value.trim()) return "Ce champ est requis.";
    if (current.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Adresse email invalide.";
    return "";
  }

  function handleNext() {
    const err = validate(inputValue);
    if (err) { setError(err); return; }

    const newValues = { ...values, [current.key]: inputValue.trim() };
    setValues(newValues);

    if (isLastField) {
      if (!rgpd) { setError("Veuillez accepter les conditions pour continuer."); return; }
      setVisible(false);
      setTimeout(() => {
        onComplete({ ...newValues, rgpd_consent: true } as OnboardingData);
      }, 200);
    } else {
      setVisible(false);
      setTimeout(() => { setStep((s) => s + 1); setVisible(true); }, 200);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleNext();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px clamp(24px, 6vw, 96px) 80px",
      }}
    >
      {/* Indicateur d'étape */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "64px",
        }}
      >
        {FIELDS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? "24px" : "8px",
              height: "8px",
              borderRadius: "999px",
              background: i < step ? "#C9F1DF" : i === step ? "#fff" : "rgba(255,255,255,0.20)",
              transition: "all 300ms cubic-bezier(0.2,0.7,0.2,1)",
            }}
          />
        ))}
      </div>

      {/* Question */}
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
      >
        <p
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.40)",
            marginBottom: "16px",
          }}
        >
          {step + 1} sur {FIELDS.length}
          {!current.required && (
            <span style={{ marginLeft: "12px", color: "rgba(255,255,255,0.28)" }}>
              — facultatif
            </span>
          )}
        </p>

        <h2
          style={{
            fontFamily: "Sora, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(28px, 3.2vw, 44px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: "40px",
            textTransform: "uppercase",
          }}
        >
          {current.key === "prenom" && values.prenom
            ? `${values.prenom}, `
            : ""}
          {current.label}
        </h2>

        {/* Input */}
        <div style={{ position: "relative", marginBottom: "12px" }}>
          <input
            ref={inputRef}
            type={current.type ?? "text"}
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            placeholder={current.placeholder}
            autoComplete="off"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${error ? "#E86A33" : "rgba(255,255,255,0.25)"}`,
              color: "#fff",
              fontFamily: "Sora, sans-serif",
              fontSize: "clamp(20px, 2.4vw, 32px)",
              fontWeight: 300,
              lineHeight: 1.2,
              padding: "12px 0",
              outline: "none",
              transition: "border-color 200ms",
              caretColor: "#C9F1DF",
            }}
            onFocus={(e) => {
              if (!error) (e.target as HTMLInputElement).style.borderBottomColor = "#C9F1DF";
            }}
            onBlur={(e) => {
              if (!error) (e.target as HTMLInputElement).style.borderBottomColor = "rgba(255,255,255,0.25)";
            }}
          />
        </div>

        {error && (
          <p style={{ fontSize: "13px", color: "#E86A33", marginBottom: "16px" }}>{error}</p>
        )}

        {/* RGPD (dernier champ uniquement) */}
        {isLastField && (
          <div
            style={{
              marginTop: "32px",
              marginBottom: "32px",
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              cursor: "pointer",
            }}
            onClick={() => setRgpd((v) => !v)}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                border: `1.5px solid ${rgpd ? "#C9F1DF" : "rgba(255,255,255,0.35)"}`,
                background: rgpd ? "#C9F1DF" : "transparent",
                flexShrink: 0,
                marginTop: "2px",
                transition: "all 200ms",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {rgpd && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <polyline
                    points="2 6 5 9 10 3"
                    stroke="#000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <p style={{ fontSize: "13px", lineHeight: 1.55, color: "rgba(255,255,255,0.55)", userSelect: "none" }}>
              Vos données sont utilisées uniquement par Delphine dans le cadre de son accompagnement. Aucune revente, aucun démarchage automatisé. Vous pouvez demander la suppression de vos données à tout moment.{" "}
              <a href="#" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "underline" }}>
                Politique de confidentialité
              </a>
            </p>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "40px" }}>
          <button
            onClick={handleNext}
            className="btn-outline"
            style={{ padding: "16px 32px" }}
          >
            {isLastField ? "Démarrer mon diagnostic" : "Continuer"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="13 6 19 12 13 18" />
            </svg>
          </button>

          {!current.required && step < FIELDS.length && (
            <button
              onClick={() => {
                setValues((v) => ({ ...v, [current.key]: "" }));
                if (isLastField) {
                  if (!rgpd) { setError("Veuillez accepter les conditions pour continuer."); return; }
                  onComplete({ ...values, [current.key]: "", rgpd_consent: true } as OnboardingData);
                } else {
                  setVisible(false);
                  setTimeout(() => { setStep((s) => s + 1); setVisible(true); }, 200);
                }
              }}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.40)",
                fontFamily: "Sora, sans-serif",
                fontSize: "13px",
                cursor: "pointer",
                letterSpacing: "0.04em",
                padding: 0,
              }}
            >
              Passer cette étape
            </button>
          )}

          {step > 0 && (
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(() => { setStep((s) => s - 1); setVisible(true); }, 200);
              }}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.40)",
                fontFamily: "Sora, sans-serif",
                fontSize: "13px",
                cursor: "pointer",
                letterSpacing: "0.04em",
                marginLeft: "auto",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="11 6 5 12 11 18" />
              </svg>
              Retour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
