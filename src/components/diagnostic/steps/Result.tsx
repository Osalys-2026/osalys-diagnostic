"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import Link from "next/link";
import type { Passation, CategoryScore } from "@/lib/types";
import type { CoachProfile } from "@/lib/actions/coach";
import { updateActionPost } from "@/lib/actions/passation";

const DEFAULT_CALENDLY_URL = "https://calendly.com/chloeleuk03/30min";

interface Props {
  passation: Passation;
  passationId?: string;
  onNewDiagnostic?: () => void;
  coach?: CoachProfile;
}

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string; prefill?: Record<string, string> }) => void;
      initInlineWidget: (opts: { url: string; parentElement: HTMLElement; prefill?: Record<string, string> }) => void;
    };
  }
}

export function Result({ passation, passationId, onNewDiagnostic, coach }: Props) {
  const { lead, diagnostic, profil, score, categoryScores } = passation;
  const finalScore = score ?? 0;
  const [displayScore, setDisplayScore] = useState(0);
  const [visible, setVisible] = useState(false);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calendlyRef = useRef<HTMLDivElement>(null);
  const calendlyInit = useRef(false);

  // IA : analyse personnalisée en streaming
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState("");
  const aiStarted = useRef(false);

  const calendlyUrl = coach?.calendly_url || DEFAULT_CALENDLY_URL;

  const initInlineWidget = useCallback(() => {
    if (calendlyInit.current || !calendlyRef.current || !window.Calendly) return;
    calendlyInit.current = true;
    if (passationId) updateActionPost(passationId, "rdv").catch(() => {});
    window.Calendly.initInlineWidget({
      url: calendlyUrl,
      parentElement: calendlyRef.current,
      prefill: {
        name: [lead.prenom, lead.nom].filter(Boolean).join(" "),
        email: lead.email,
      },
    });
  }, [passationId, lead.prenom, lead.nom, lead.email, calendlyUrl]);

  // Lancer l'analyse IA une seule fois
  useEffect(() => {
    if (aiStarted.current || !profil) return;
    aiStarted.current = true;

    const fetchAnalyse = async () => {
      try {
        const res = await fetch("/api/analyse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prenom: lead.prenom,
            thematique: passation.thematique.titre,
            diagnostic: diagnostic.titre,
            score: finalScore,
            profilLabel: profil.label,
            profilAnalyse: profil.analyse,
            categoryScores: categoryScores ?? [],
            questions: diagnostic.questions,
            reponses: passation.reponses,
          }),
        });

        const json = await res.json();

        if (!res.ok || json.error || !json.text) {
          const errMsg = json.error || `HTTP ${res.status}`;
          console.error("[analyse]", errMsg);
          setAiError(errMsg);
          setAiLoading(false);
          return;
        }

        // Révélation progressive mot par mot
        const words = (json.text as string).split(" ");
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setAiText(words.slice(0, i).join(" "));
          if (i >= words.length) {
            clearInterval(interval);
            setAiLoading(false);
          }
        }, 40);

      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[analyse]", msg);
        setAiError(msg);
        setAiLoading(false);
      }
    };

    fetchAnalyse();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Entrée
    setTimeout(() => setVisible(true), 100);

    // Compteur animé
    const duration = 1800;
    const steps = 60;
    const increment = finalScore / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), finalScore);
      setDisplayScore(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => {
      clearInterval(timer);
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [finalScore]);

  if (!profil) return null;

  const scoreColor =
    finalScore >= 86 ? "#C9F1DF" :
    finalScore >= 61 ? "#C9F1DF" :
    finalScore >= 31 ? "rgba(255,255,255,0.90)" :
    "rgba(255,255,255,0.72)";


  return (
    <>
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "100px clamp(24px, 5vw, 96px) 80px",
        maxWidth: "900px",
        margin: "0 auto",
        width: "100%",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 400ms ease, transform 400ms ease",
      }}
    >
      {/* En-tête */}
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
        Votre diagnostic — {diagnostic.thematique_id}
      </p>

      <h1
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
        {lead.prenom ? `${lead.prenom}, voici` : "Voici"}{" "}
        <span style={{ fontStyle: "italic" }}>votre diagnostic</span>
      </h1>

      {/* Score + profil */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "clamp(32px, 5vw, 80px)",
          alignItems: "center",
          marginBottom: "64px",
          padding: "clamp(32px, 4vh, 56px) clamp(24px, 4vw, 48px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "28px",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {/* Jauge circulaire */}
        <ScoreGauge score={displayScore} color={scoreColor} />

        {/* Profil */}
        <div>
          <p style={{
            fontFamily: "Sora, sans-serif", fontSize: "11px", letterSpacing: "0.12em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginBottom: "10px",
          }}>
            Votre profil
          </p>
          <p style={{
            fontFamily: "Sora, sans-serif", fontWeight: 700,
            fontSize: "clamp(22px, 2.4vw, 34px)", letterSpacing: "-0.01em",
            textTransform: "uppercase", color: scoreColor, lineHeight: 1.1,
          }}>
            {profil.label}
          </p>
        </div>
      </div>

      {/* Résultats par compétence ou profil classique */}
      {categoryScores && categoryScores.length > 0 ? (
        <CategoryResults categoryScores={categoryScores} style={{ marginBottom: "48px" }} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "48px" }}>
          <ResultBlock title="Vos points de force" items={profil.points_force} accent="#C9F1DF" />
          <ResultBlock title="Axes de développement" items={profil.axes_dev} accent="rgba(255,255,255,0.55)" />
        </div>
      )}

      {/* ─── Analyse personnalisée par Delphine ─── */}
      <div style={{
        marginBottom: "64px",
        padding: "clamp(28px, 4vw, 44px)",
        border: "1px solid rgba(201,241,223,0.18)",
        borderRadius: "24px",
        background: "linear-gradient(135deg, rgba(201,241,223,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Accent décoratif */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "3px", height: "100%",
          background: "linear-gradient(180deg, #C9F1DF 0%, rgba(201,241,223,0.20) 100%)",
          borderRadius: "3px 0 0 3px",
        }} />

        <p style={{
          fontFamily: "Sora, sans-serif", fontSize: "11px", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#C9F1DF", marginBottom: "20px", opacity: 0.7,
        }}>
          L'analyse de Delphine
        </p>

        {aiLoading && !aiText ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[92, 86, 79, 88, 72].map((w, i) => (
              <div key={i} style={{
                height: "15px", background: "rgba(255,255,255,0.06)", borderRadius: "4px",
                width: `${w}%`,
                animation: `pulse 1.6s ease-in-out ${i * 0.12}s infinite`,
              }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:.80} }`}</style>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", fontFamily: "Sora, sans-serif", marginTop: "4px" }}>
              Analyse en cours…
            </p>
          </div>
        ) : aiError ? (
          <p style={{ fontSize: "13px", color: "rgba(232,106,51,0.80)", fontFamily: "Sora, sans-serif" }}>
            Erreur : {aiError}
          </p>
        ) : (
          <div>
            <p style={{
              fontSize: "16px", lineHeight: 1.8, color: "rgba(255,255,255,0.82)",
              fontFamily: "Sora, sans-serif", whiteSpace: "pre-wrap",
            }}>
              {aiText || profil.analyse}
              {aiLoading && aiText && (
                <>
                  <span style={{
                    display: "inline-block", width: "2px", height: "16px",
                    background: "#C9F1DF", marginLeft: "2px", verticalAlign: "middle",
                    animation: "blink 1s step-end infinite",
                  }} />
                  <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
                </>
              )}
            </p>
            {!aiLoading && aiText && (
              <p style={{
                fontFamily: "Sora, sans-serif", fontSize: "12px", color: "rgba(201,241,223,0.50)",
                marginTop: "20px", fontStyle: "italic",
              }}>
                — Delphine, votre coach Osalys
              </p>
            )}
          </div>
        )}
      </div>

      {/* Calendly + Coach */}
      <div style={{ marginBottom: "48px" }}>
        <p style={{
          fontFamily: "Sora, sans-serif",
          fontSize: "11px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.40)",
          marginBottom: "24px",
        }}>
          Prendre rendez-vous
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: "20px",
          alignItems: "stretch",
        }}>
          {/* Calendly */}
          <div
            ref={calendlyRef}
            style={{
              height: "440px",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#fff",
            }}
          />

          {/* Coach card — toujours rendu, même si vide */}
          <div style={{
            padding: "28px 24px",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "0",
          }}>
            {/* Photo */}
            {coach?.photo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={coach.photo_url}
                alt={coach?.name ?? "Coach"}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(201,241,223,0.30)",
                  marginBottom: "20px",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(201,241,223,0.08)",
                border: "2px solid rgba(201,241,223,0.15)",
                marginBottom: "20px",
                flexShrink: 0,
              }} />
            )}

            {/* Label */}
            <p style={{
              fontFamily: "Sora, sans-serif",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.30)",
              marginBottom: "8px",
            }}>
              Votre coach
            </p>

            {/* Nom */}
            <p style={{
              fontFamily: "Sora, sans-serif",
              fontWeight: 700,
              fontSize: "17px",
              letterSpacing: "-0.01em",
              color: "#C9F1DF",
              marginBottom: "4px",
              lineHeight: 1.2,
            }}>
              {coach?.name || "—"}
            </p>

            {/* Titre */}
            {coach?.title && (
              <p style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.5,
                marginBottom: "16px",
                fontStyle: "italic",
              }}>
                {coach.title}
              </p>
            )}

            {/* Séparateur */}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "16px 0" }} />

            {/* Description */}
            {coach?.description && (
              <p style={{
                fontSize: "13px",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.50)",
              }}>
                {coach.description}
              </p>
            )}
          </div>
        </div>

        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
          onLoad={initInlineWidget}
        />
      </div>

      {/* Actions secondaires */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "8px",
        }}
      >
        <Link
          href="https://www.osalys.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
          style={{ padding: "14px 28px", fontSize: "13px" }}
          onClick={() => { if (passationId) updateActionPost(passationId, "site").catch(() => {}); }}
        >
          Visiter le site Osalys
        </Link>

      </div>

      {/* Recommencer */}
      <div style={{ textAlign: "center", marginTop: "56px" }}>
        <button
          onClick={onNewDiagnostic}
          style={{
            background: "none",
            border: "none",
            fontSize: "12px",
            color: "rgba(255,255,255,0.28)",
            cursor: "pointer",
            letterSpacing: "0.06em",
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          Passer un autre diagnostic
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 6 19 12 13 18" />
          </svg>
        </button>
      </div>
    </div>
    </>
  );
}

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div style={{ position: "relative", width: "140px", height: "140px", flexShrink: 0 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 50ms linear" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
        }}
      >
        <span
          style={{
            fontFamily: "Sora, sans-serif",
            fontWeight: 700,
            fontSize: "32px",
            lineHeight: 1,
            color,
          }}
        >
          {score}
        </span>
        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.40)" }}>/ 100</span>
      </div>
    </div>
  );
}

function CategoryResults({ categoryScores, style }: { categoryScores: CategoryScore[]; style?: React.CSSProperties }) {
  const forces = categoryScores.filter((c) => c.score >= 60);
  const axes   = categoryScores.filter((c) => c.score < 40);
  const middle = categoryScores.filter((c) => c.score >= 40 && c.score < 60);

  return (
    <div style={style}>
      {/* Barres de compétences */}
      <div style={{
        padding: "clamp(20px, 3vh, 32px) clamp(20px, 3vw, 32px)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "16px",
        marginBottom: "24px",
      }}>
        <p style={{
          fontFamily: "Sora, sans-serif", fontSize: "11px", letterSpacing: "0.10em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginBottom: "20px",
        }}>
          Résultats par compétence
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {categoryScores.map((c) => {
            const isForce = c.score >= 60;
            const isAxe   = c.score < 40;
            const color   = isForce ? "#C9F1DF" : isAxe ? "rgba(232,106,51,0.80)" : "rgba(255,255,255,0.65)";
            return (
              <div key={c.category_id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontFamily: "Sora, sans-serif", fontWeight: 500 }}>
                    {c.label}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "Sora, sans-serif", color }}>
                      {c.score}%
                    </span>
                    {isForce && (
                      <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#C9F1DF", background: "rgba(201,241,223,0.10)", padding: "2px 8px", borderRadius: "999px" }}>
                        Force
                      </span>
                    )}
                    {isAxe && (
                      <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(232,106,51,0.90)", background: "rgba(232,106,51,0.08)", padding: "2px 8px", borderRadius: "999px" }}>
                        Axe de travail
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${c.score}%`, borderRadius: "999px",
                    background: color, transition: "width 800ms ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points de force + Axes côte à côte */}
      {(forces.length > 0 || axes.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: forces.length && axes.length ? "1fr 1fr" : "1fr", gap: "16px" }}>
          {forces.length > 0 && (
            <div style={{ padding: "clamp(18px, 3vh, 28px) clamp(18px, 3vw, 28px)", border: "1px solid rgba(201,241,223,0.15)", borderRadius: "16px", background: "rgba(201,241,223,0.03)" }}>
              <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", color: "#C9F1DF", marginBottom: "14px" }}>
                Vos points de force
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {forces.map((c) => (
                  <li key={c.category_id} style={{ display: "flex", gap: "10px", fontSize: "14px", lineHeight: 1.5, color: "rgba(255,255,255,0.72)" }}>
                    <span style={{ color: "#C9F1DF", flexShrink: 0 }}>—</span>
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {axes.length > 0 && (
            <div style={{ padding: "clamp(18px, 3vh, 28px) clamp(18px, 3vw, 28px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" }}>
              <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginBottom: "14px" }}>
                Axes de développement
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {axes.map((c) => (
                  <li key={c.category_id} style={{ display: "flex", gap: "10px", fontSize: "14px", lineHeight: 1.5, color: "rgba(255,255,255,0.72)" }}>
                    <span style={{ color: "rgba(232,106,51,0.80)", flexShrink: 0 }}>—</span>
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultBlock({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <div
      style={{
        padding: "clamp(20px, 3vh, 32px) clamp(20px, 3vw, 32px)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "16px",
      }}
    >
      <p
        style={{
          fontFamily: "Sora, sans-serif",
          fontSize: "11px",
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.40)",
          marginBottom: "16px",
        }}
      >
        {title}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: "10px",
              fontSize: "14px",
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.72)",
            }}
          >
            <span style={{ color: accent, flexShrink: 0, marginTop: "2px" }}>—</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
