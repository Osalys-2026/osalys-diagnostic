"use client";

import { useState, useTransition } from "react";
import type { SkillCategory } from "@/lib/types";

interface Props {
  initialCategories: SkillCategory[];
  onCreate: (label: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CategoriesList({ initialCategories, onCreate, onDelete }: Props) {
  const [categories, setCategories] = useState<SkillCategory[]>(initialCategories);
  const [newLabel, setNewLabel] = useState("");
  const [, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    startTransition(async () => {
      const tempId = `temp-${Date.now()}`;
      setCategories((prev) => [...prev, { id: tempId, label, order: prev.length }]);
      setNewLabel("");
      await onCreate(label);
      // Refresh from server would happen via revalidatePath — for now optimistic UI is fine
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      await onDelete(id);
    });
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
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

  return (
    <div>
      {/* Ajouter */}
      <form onSubmit={handleCreate} style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
        <input
          style={inputStyle}
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Nom de la catégorie (ex : Communication, Leadership, Assertivité…)"
        />
        <button
          type="submit"
          disabled={!newLabel.trim()}
          style={{
            background: "#C9F1DF",
            color: "#0a0a0a",
            border: "none",
            borderRadius: "8px",
            fontFamily: "Sora, sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            padding: "10px 20px",
            cursor: newLabel.trim() ? "pointer" : "not-allowed",
            opacity: newLabel.trim() ? 1 : 0.45,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          + Ajouter
        </button>
      </form>

      {/* Liste */}
      {categories.length === 0 ? (
        <div style={{
          padding: "48px 24px", textAlign: "center",
          border: "1px dashed rgba(255,255,255,0.10)", borderRadius: "12px",
        }}>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.30)" }}>
            Aucune catégorie. Ajoutez-en pour commencer à taguer les questions de vos diagnostics.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "14px 18px",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <span style={{
                fontFamily: "Sora, sans-serif",
                fontWeight: 700,
                fontSize: "11px",
                color: "#C9F1DF",
                width: "20px",
                flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <span style={{
                flex: 1,
                fontFamily: "Sora, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
              }}>
                {cat.label}
              </span>
              <button
                onClick={() => handleDelete(cat.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(232,106,51,0.55)",
                  cursor: "pointer",
                  fontSize: "18px",
                  lineHeight: 1,
                  padding: "2px 6px",
                  transition: "color 150ms",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(232,106,51,1)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(232,106,51,0.55)"; }}
                title="Supprimer"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {categories.length > 0 && (
        <p style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.25)",
          marginTop: "20px",
          fontFamily: "Sora, sans-serif",
          lineHeight: 1.6,
        }}>
          {categories.length} catégorie{categories.length > 1 ? "s" : ""} — disponibles lors de la création de diagnostics.
          Attention : supprimer une catégorie retire le tag de toutes les questions associées.
        </p>
      )}
    </div>
  );
}
