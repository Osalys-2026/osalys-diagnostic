"use client";

import { useState, useEffect } from "react";
import type { Diagnostic, Question } from "@/lib/types";
import { ProgressBar } from "../ProgressBar";

interface Props {
  diagnostic: Diagnostic;
  prenom: string;
  onComplete: (reponses: Record<string, number>) => void;
}

export function Questions({ diagnostic, prenom, onComplete }: Props) {
  const [qIndex, setQIndex] = useState(0);
  const [reponses, setReponses] = useState<Record<string, number>>({});
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState(50);
  const [visible, setVisible] = useState(true);

  const question = diagnostic.questions[qIndex];
  const isLast = qIndex === diagnostic.questions.length - 1;

  useEffect(() => {
    setVisible(true);
    setSelectedValue(null);
    setSliderValue(50);
  }, [qIndex]);

  function handleNext() {
    const value = question.type_reponse === "slider" ? sliderValue : selectedValue;
    if (value === null) return;

    const newReponses = { ...reponses, [question.id]: value };
    setReponses(newReponses);

    if (isLast) {
      setVisible(false);
      setTimeout(() => onComplete(newReponses), 250);
    } else {
      setVisible(false);
      setTimeout(() => { setQIndex((i) => i + 1); setVisible(true); }, 250);
    }
  }

  function handleBack() {
    if (qIndex === 0) return;
    setVisible(false);
    setTimeout(() => { setQIndex((i) => i - 1); setVisible(true); }, 250);
  }

  const canProceed = question.type_reponse === "slider" || selectedValue !== null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "100px clamp(24px, 5vw, 96px) 80px",
        maxWidth: "860px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Progress */}
      <div style={{ marginBottom: "64px" }}>
        <ProgressBar
          current={qIndex + 1}
          total={diagnostic.questions.length}
          label={`${diagnostic.titre} — ${diagnostic.duree_estimee} min`}
        />
      </div>

      {/* Question */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 250ms ease, transform 250ms ease",
        }}
      >
        <p
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            marginBottom: "24px",
          }}
        >
          Question {qIndex + 1}
          {prenom && `, ${prenom}`}
        </p>

        <h3
          style={{
            fontFamily: "Sora, sans-serif",
            fontWeight: 600,
            fontSize: "clamp(20px, 2.2vw, 30px)",
            lineHeight: 1.35,
            letterSpacing: "-0.01em",
            marginBottom: "48px",
            maxWidth: "700px",
          }}
        >
          {question.texte}
        </h3>

        {/* Réponses */}
        {(question.type_reponse === "likert" || question.type_reponse === "choice") && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "48px" }}>
            {question.options?.map((opt) => (
              <OptionButton
                key={opt.id}
                label={opt.texte}
                selected={selectedValue === opt.valeur_score}
                onClick={() => setSelectedValue(opt.valeur_score)}
              />
            ))}
          </div>
        )}

        {question.type_reponse === "slider" && (
          <SliderInput
            value={sliderValue}
            onChange={setSliderValue}
            minLabel={question.slider_min_label ?? "0"}
            maxLabel={question.slider_max_label ?? "100"}
          />
        )}

        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "auto", paddingTop: "40px" }}>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="btn-outline"
            style={{
              padding: "16px 32px",
              opacity: canProceed ? 1 : 0.35,
              cursor: canProceed ? "pointer" : "not-allowed",
            }}
          >
            {isLast ? "Voir mon résultat" : "Question suivante"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="13 6 19 12 13 18" />
            </svg>
          </button>

          {qIndex > 0 && (
            <button
              onClick={handleBack}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.40)",
                fontFamily: "Sora, sans-serif",
                fontSize: "13px",
                cursor: "pointer",
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
              Précédent
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 20px",
        background: selected ? "rgba(53,53,255,0.10)" : hovered ? "rgba(255,255,255,0.04)" : "transparent",
        border: `1.5px solid ${selected ? "#3535FF" : hovered ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.12)"}`,
        borderRadius: "12px",
        color: selected ? "#fff" : "#fff",
        fontFamily: "Sora, sans-serif",
        fontSize: "clamp(14px, 1.2vw, 16px)",
        lineHeight: 1.45,
        cursor: "pointer",
        textAlign: "left",
        transition: "all 200ms cubic-bezier(0.2,0.7,0.2,1)",
      }}
    >
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          border: `1.5px solid ${selected ? "#3535FF" : "rgba(255,255,255,0.25)"}`,
          background: selected ? "#3535FF" : "transparent",
          flexShrink: 0,
          transition: "all 200ms",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && (
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#000" }} />
        )}
      </div>
      {label}
    </button>
  );
}

function SliderInput({
  value,
  onChange,
  minLabel,
  maxLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <div style={{ marginBottom: "48px" }}>
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: "100%",
            appearance: "none",
            background: `linear-gradient(to right, #3535FF ${value}%, rgba(255,255,255,0.15) ${value}%)`,
            height: "3px",
            borderRadius: "999px",
            outline: "none",
            cursor: "pointer",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-36px",
            left: `${value}%`,
            transform: "translateX(-50%)",
            background: "#3535FF",
            color: "#fff",
            fontFamily: "Sora, sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            padding: "4px 10px",
            borderRadius: "999px",
            pointerEvents: "none",
            transition: "left 0ms",
          }}
        >
          {value}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.40)", maxWidth: "200px" }}>{minLabel}</span>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.40)", maxWidth: "200px", textAlign: "right" }}>{maxLabel}</span>
      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          border: 2px solid #3535FF;
          box-shadow: 0 0 0 3px rgba(53,53,255,0.20);
        }
        input[type=range]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          border: 2px solid #3535FF;
        }
      `}</style>
    </div>
  );
}
