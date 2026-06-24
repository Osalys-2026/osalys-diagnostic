"use client";

interface Props {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: Props) {
  const pct = Math.round((current / total) * 100);

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        {label && (
          <span
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.40)",
            }}
          >
            {label}
          </span>
        )}
        <span
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: "12px",
            color: "rgba(255,255,255,0.40)",
            marginLeft: "auto",
          }}
        >
          {current} / {total}
        </span>
      </div>
      <div
        style={{
          height: "2px",
          background: "rgba(255,255,255,0.10)",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "#C9F1DF",
            borderRadius: "999px",
            transition: "width 300ms cubic-bezier(0.2,0.7,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}
