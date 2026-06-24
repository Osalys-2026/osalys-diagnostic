"use client";

import { useState } from "react";
import type { Thematique, Diagnostic } from "@/lib/types";

interface Props {
  thematiques: Thematique[];
  prenom: string;
  onSelect: (thematique: Thematique, diagnostic: Diagnostic) => void;
}

export function ThemeSelection({ thematiques, prenom, onSelect }: Props) {
  const [selectedTheme, setSelectedTheme] = useState<Thematique | null>(null);

  if (selectedTheme) {
    return (
      <DiagnosticSelection
        thematique={selectedTheme}
        onSelect={(d) => onSelect(selectedTheme, d)}
        onBack={() => setSelectedTheme(null)}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "120px clamp(24px, 5vw, 96px) 80px",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <p
        style={{
          fontFamily: "Sora, sans-serif",
          fontSize: "11px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.40)",
          marginBottom: "24px",
        }}
      >
        Choisissez votre thématique
      </p>

      <h2
        style={{
          fontFamily: "Sora, sans-serif",
          fontWeight: 700,
          fontSize: "clamp(32px, 4vw, 60px)",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          marginBottom: "16px",
        }}
      >
        {prenom ? <><span style={{ color: "#3535FF" }}>{prenom}</span>{", sur"}</> : "Sur"} quoi{" "}
        <span style={{ fontStyle: "italic" }}>travaillons-nous ?</span>
      </h2>

      <p
        style={{
          fontSize: "16px",
          lineHeight: 1.55,
          color: "rgba(255,255,255,0.55)",
          marginBottom: "72px",
          maxWidth: "520px",
        }}
      >
        Choisissez la thématique qui correspond le mieux à ce que vous vivez en ce moment.
        La bonne méthode, c'est celle qui vous correspond.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {thematiques.map((theme, i) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isLast={i === thematiques.length - 1}
            onSelect={() => setSelectedTheme(theme)}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeCard({
  theme,
  isLast,
  onSelect,
}: {
  theme: Thematique;
  isLast: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr auto",
        alignItems: "center",
        gap: "clamp(24px, 4vw, 64px)",
        padding: "clamp(28px, 4vh, 48px) 0",
        border: "none",
        borderTop: "1px solid rgba(255,255,255,0.15)",
        borderBottom: isLast ? "1px solid rgba(255,255,255,0.15)" : "none",
        background: "none",
        color: "#fff",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div>
        <p
          style={{
            fontFamily: "Sora, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(20px, 2vw, 30px)",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
          }}
        >
          {theme.titre}
        </p>
        <p
          style={{
            fontFamily: "Sora, sans-serif",
            fontStyle: "italic",
            fontSize: "clamp(15px, 1.4vw, 20px)",
            color: "rgba(255,255,255,0.72)",
            marginTop: "4px",
          }}
        >
          {theme.subtitle}
        </p>
      </div>

      <p
        style={{
          fontFamily: "Sora, sans-serif",
          fontSize: "clamp(14px, 1.2vw, 17px)",
          lineHeight: 1.55,
          color: "rgba(255,255,255,0.55)",
        }}
      >
        « {theme.accroche} »
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            fontSize: "12px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.30)",
            whiteSpace: "nowrap",
          }}
        >
          {theme.diagnostics.length} diagnostic{theme.diagnostics.length > 1 ? "s" : ""}
        </span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: hovered ? "#3535FF" : "#fff",
            transform: hovered ? "translate(4px, -4px)" : "translate(0, 0)",
            transition: "transform 200ms cubic-bezier(0.2,0.7,0.2,1), color 200ms",
            flexShrink: 0,
          }}
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </div>
    </button>
  );
}

function DiagnosticSelection({
  thematique,
  onSelect,
  onBack,
}: {
  thematique: Thematique;
  onSelect: (d: Diagnostic) => void;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "120px clamp(24px, 5vw, 96px) 80px",
        maxWidth: "900px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.40)",
          fontFamily: "Sora, sans-serif",
          fontSize: "13px",
          cursor: "pointer",
          marginBottom: "48px",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="11 6 5 12 11 18" />
        </svg>
        Retour aux thématiques
      </button>

      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.40)",
          marginBottom: "16px",
        }}
      >
        {thematique.titre}
      </p>

      <h2
        style={{
          fontFamily: "Sora, sans-serif",
          fontWeight: 700,
          fontSize: "clamp(28px, 3.6vw, 52px)",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          marginBottom: "56px",
        }}
      >
        Choisissez <span style={{ fontStyle: "italic" }}>votre diagnostic</span>
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {thematique.diagnostics.map((diag) => (
          <button
            key={diag.id}
            onClick={() => onSelect(diag)}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "16px",
              padding: "clamp(24px, 3vh, 40px) clamp(24px, 3vw, 40px)",
              color: "#fff",
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 200ms, background 200ms",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.35)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px" }}>
              <div>
                <p
                  style={{
                    fontFamily: "Sora, sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(18px, 1.8vw, 24px)",
                    letterSpacing: "-0.01em",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                  }}
                >
                  {diag.titre}
                </p>
                <p style={{ fontSize: "15px", lineHeight: 1.55, color: "rgba(255,255,255,0.60)" }}>
                  {diag.description}
                </p>
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", whiteSpace: "nowrap" }}>
                  {diag.duree_estimee} min
                </p>
                <p style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", whiteSpace: "nowrap", marginTop: "4px" }}>
                  {diag.questions.length} questions
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
