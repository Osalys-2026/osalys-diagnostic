"use client";

import { useState, useTransition } from "react";

interface Props {
  onConfirm: () => Promise<void>;
  label?: React.ReactNode;
  compact?: boolean;
}

export function DeleteConfirmButton({ onConfirm, label = "Supprimer", compact = false }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {!compact && (
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
            Confirmer ?
          </span>
        )}
        <button
          onClick={() => {
            startTransition(async () => {
              await onConfirm();
              setConfirming(false);
            });
          }}
          disabled={isPending}
          style={{
            padding: compact ? "6px 10px" : "7px 14px",
            borderRadius: "8px",
            border: "1px solid rgba(232,106,51,0.50)",
            background: "rgba(232,106,51,0.12)",
            color: "#E86A33",
            fontSize: "12px",
            fontFamily: "Sora, sans-serif",
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.5 : 1,
            whiteSpace: "nowrap" as const,
          }}
        >
          {isPending ? "…" : (compact ? "Oui" : "Oui, supprimer")}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          style={{
            padding: compact ? "6px 8px" : "7px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "none",
            color: "rgba(255,255,255,0.40)",
            fontSize: "12px",
            fontFamily: "Sora, sans-serif",
            cursor: "pointer",
          }}
        >
          Non
        </button>
      </div>
    );
  }

  const isIconOnly = compact && typeof label !== "string";

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isIconOnly ? "7px" : "8px 16px",
        borderRadius: "8px",
        border: "1px solid rgba(232,106,51,0.25)",
        color: "rgba(232,106,51,0.65)",
        fontSize: "12px",
        fontFamily: "Sora, sans-serif",
        background: "none",
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
      }}
    >
      {label}
    </button>
  );
}
