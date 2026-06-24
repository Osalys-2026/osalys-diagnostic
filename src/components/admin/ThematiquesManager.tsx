"use client";

import { useState, useTransition } from "react";
import { THEMATIQUES } from "@/lib/mock-data";
import { hideThematique, unhideThematique } from "@/lib/actions/diagnostics";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import type { Thematique } from "@/lib/types";

export function ThematiquesManager({ hiddenIds }: { hiddenIds: string[] }) {
  const [themes] = useState(THEMATIQUES);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        {themes.map((theme, i) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            index={i}
            initiallyHidden={hiddenIds.includes(theme.id)}
          />
        ))}
      </div>

      <button
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
        + Nouvelle thématique
      </button>
    </div>
  );
}

function ThemeCard({
  theme, index, initiallyHidden,
}: {
  theme: Thematique;
  index: number;
  initiallyHidden: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [hidden, setHidden] = useState(initiallyHidden);
  const [isPending, startTransition] = useTransition();

  const [titre, setTitre]       = useState(theme.titre);
  const [subtitle, setSubtitle] = useState(theme.subtitle);
  const [accroche, setAccroche] = useState(theme.accroche);

  function toggle() {
    const next = !hidden;
    setHidden(next);
    startTransition(async () => {
      if (next) {
        await hideThematique(theme.id);
      } else {
        await unhideThematique(theme.id);
      }
    });
  }

  const active = !hidden;

  return (
    <div
      style={{
        border: `1px solid ${isEditing ? "rgba(201,241,223,0.25)" : "rgba(255,255,255,0.09)"}`,
        borderRadius: "12px",
        overflow: "hidden",
        background: isEditing ? "rgba(201,241,223,0.02)" : "rgba(255,255,255,0.02)",
        transition: "border-color 200ms",
        opacity: hidden ? 0.45 : 1,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px" }}>
        <span
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Sora, sans-serif",
            fontSize: "12px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.40)",
            flexShrink: 0,
          }}
        >
          {index + 1}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "14px", textTransform: "uppercase", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {titre}
            <span style={{ fontStyle: "italic", fontWeight: 400, color: "rgba(255,255,255,0.45)", marginLeft: "8px" }}>
              {subtitle}
            </span>
          </p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {accroche}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          {/* Toggle actif/masqué */}
          <button
            onClick={toggle}
            disabled={isPending}
            style={{
              width: "36px",
              height: "20px",
              borderRadius: "999px",
              border: "none",
              background: active ? "#C9F1DF" : "rgba(255,255,255,0.15)",
              cursor: isPending ? "not-allowed" : "pointer",
              position: "relative",
              transition: "background 200ms",
              opacity: isPending ? 0.6 : 1,
            }}
            title={active ? "Masquer la thématique" : "Afficher la thématique"}
          >
            <div
              style={{
                position: "absolute",
                top: "3px",
                left: active ? "19px" : "3px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: active ? "#000" : "rgba(255,255,255,0.60)",
                transition: "left 200ms",
              }}
            />
          </button>

          <DeleteConfirmButton
            label="Supprimer"
            onConfirm={async () => {
              await hideThematique(theme.id);
              setHidden(true);
            }}
          />

          <button
            onClick={() => setIsEditing((v) => !v)}
            style={{
              background: "none",
              border: `1px solid ${isEditing ? "rgba(201,241,223,0.40)" : "rgba(255,255,255,0.15)"}`,
              borderRadius: "7px",
              color: isEditing ? "#C9F1DF" : "rgba(255,255,255,0.50)",
              fontFamily: "Sora, sans-serif",
              fontSize: "12px",
              padding: "5px 12px",
              cursor: "pointer",
              transition: "all 150ms",
            }}
          >
            {isEditing ? "Fermer" : "Modifier"}
          </button>
        </div>
      </div>

      {/* Formulaire d'édition */}
      {isEditing && (
        <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ paddingTop: "16px" }} />
          <AdminField label="Titre">
            <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} style={adminInputStyle} />
          </AdminField>
          <AdminField label="Subtitle (italique)">
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={adminInputStyle} />
          </AdminField>
          <AdminField label="Accroche (affiché sur le site)">
            <input type="text" value={accroche} onChange={(e) => setAccroche(e.target.value)} style={adminInputStyle} />
          </AdminField>
          <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
            <button className="btn-solid" style={{ padding: "10px 20px", fontSize: "13px" }}>
              Enregistrer
            </button>
            <button
              onClick={() => setIsEditing(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.40)", fontFamily: "Sora, sans-serif", fontSize: "13px", cursor: "pointer", padding: 0 }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const adminInputStyle: React.CSSProperties = {
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
};
