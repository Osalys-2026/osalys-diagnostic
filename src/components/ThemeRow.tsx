"use client";

import Link from "next/link";

type Theme = {
  id: string;
  title: string;
  subtitle: string;
  accroche: string;
  count: number;
};

export function ThemeRow({ theme, isLast }: { theme: Theme; isLast: boolean }) {
  return (
    <Link
      href={`/diagnostic?theme=${theme.id}`}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr auto",
        alignItems: "center",
        gap: "clamp(24px, 4vw, 64px)",
        padding: "clamp(28px, 4vh, 48px) 0",
        borderTop: "1px solid rgba(255,255,255,0.15)",
        borderBottom: isLast ? "1px solid rgba(255,255,255,0.15)" : "none",
        textDecoration: "none",
        color: "#fff",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        const arrow = e.currentTarget.querySelector<HTMLElement>(".row-arrow");
        if (arrow) {
          arrow.style.transform = "translate(4px, -4px)";
          arrow.style.color = "#C9F1DF";
        }
      }}
      onMouseLeave={(e) => {
        const arrow = e.currentTarget.querySelector<HTMLElement>(".row-arrow");
        if (arrow) {
          arrow.style.transform = "translate(0, 0)";
          arrow.style.color = "#fff";
        }
      }}
    >
      {/* Nom thématique */}
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
          {theme.title}
        </p>
        <p
          style={{
            fontFamily: "Sora, sans-serif",
            fontStyle: "italic",
            fontSize: "clamp(16px, 1.4vw, 22px)",
            color: "rgba(255,255,255,0.72)",
            marginTop: "4px",
          }}
        >
          {theme.subtitle}
        </p>
      </div>

      {/* Accroche */}
      <p
        style={{
          fontFamily: "Sora, sans-serif",
          fontSize: "clamp(15px, 1.2vw, 18px)",
          lineHeight: 1.45,
          color: "rgba(255,255,255,0.55)",
        }}
      >
        « {theme.accroche} »
      </p>

      {/* CTA flèche */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: "12px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.40)",
            whiteSpace: "nowrap",
          }}
        >
          {theme.count} diagnostic{theme.count > 1 ? "s" : ""}
        </span>
        <svg
          className="row-arrow"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition:
              "transform 200ms cubic-bezier(0.2,0.7,0.2,1), color 200ms",
            flexShrink: 0,
          }}
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </div>
    </Link>
  );
}
