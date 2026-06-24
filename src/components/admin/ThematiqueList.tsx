"use client";

import { useState, useTransition } from "react";
import { hideThematique, unhideThematique } from "@/lib/actions/diagnostics";
import { ThematiqueCard } from "@/components/admin/ThematiqueCard";
import type { CustomThematique } from "@/lib/actions/thematiques";
import type { Thematique } from "@/lib/types";

interface Props {
  hiddenIds: string[];
  customThematiques: CustomThematique[];
  resolvedMockThematiques: Thematique[];
  onCreate: (data: { titre: string; subtitle: string; accroche: string }) => Promise<{ id: string }>;
  onDeleteCustom: (id: string) => Promise<void>;
  onUpdateCustom: (id: string, data: { titre: string; subtitle: string; accroche: string }) => Promise<void>;
  onUpdateMock: (id: string, data: { titre: string; subtitle: string; accroche: string }) => Promise<void>;
}

export function ThematiqueList({ hiddenIds, customThematiques, resolvedMockThematiques, onCreate, onDeleteCustom, onUpdateCustom, onUpdateMock }: Props) {
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [customList, setCustomList] = useState(customThematiques);
  const [showForm, setShowForm] = useState(false);

  const visibleMock = resolvedMockThematiques.filter((t) => !deletedIds.includes(t.id) && !hiddenIds.includes(t.id));
  const visibleCustom = customList.filter((t) => !deletedIds.includes(t.id));

  const totalVisible = visibleMock.length + visibleCustom.length;

  async function handleCreate(data: { titre: string; subtitle: string; accroche: string }) {
    const { id } = await onCreate(data);
    setCustomList((list) => [...list, { ...data, id, created_at: new Date().toISOString() }]);
    setShowForm(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Thématiques mock */}
      {visibleMock.map((theme, i) => (
        <ThematiqueCard
          key={theme.id}
          theme={theme}
          index={i}
          isHidden={hiddenIds.includes(theme.id)}
          onHide={async () => { await hideThematique(theme.id); }}
          onShow={async () => { await unhideThematique(theme.id); }}
          onDelete={() => setDeletedIds((ids) => [...ids, theme.id])}
          onUpdate={async (data) => { await onUpdateMock(theme.id, data); }}
        />
      ))}

      {/* Thématiques custom */}
      {visibleCustom.map((t, i) => {
        const asThematique: Thematique = { id: t.id, titre: t.titre, subtitle: t.subtitle, accroche: t.accroche, diagnostics: [] };
        return (
          <ThematiqueCard
            key={t.id}
            theme={asThematique}
            index={visibleMock.length + i}
            isHidden={hiddenIds.includes(t.id)}
            onHide={async () => { await hideThematique(t.id); }}
            onShow={async () => { await unhideThematique(t.id); }}
            onDeleteConfirm={async () => { await onDeleteCustom(t.id); }}
            onDelete={() => setDeletedIds((ids) => [...ids, t.id])}
            onUpdate={async (data) => {
              await onUpdateCustom(t.id, data);
              setCustomList((list) => list.map((c) => c.id === t.id ? { ...c, ...data } : c));
            }}
          />
        );
      })}

      {/* Bouton créer */}
      {showForm ? (
        <CreateThematiqueForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
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
            marginTop: totalVisible > 0 ? "4px" : "0",
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle thématique
        </button>
      )}
    </div>
  );
}

/* ─── Create form ─── */
function CreateThematiqueForm({ onSubmit, onCancel }: {
  onSubmit: (data: { titre: string; subtitle: string; accroche: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [titre, setTitre] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [accroche, setAccroche] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!titre.trim()) return;
    startTransition(async () => { await onSubmit({ titre, subtitle, accroche }); });
  }

  return (
    <div style={{
      border: "1px solid rgba(201,241,223,0.25)",
      borderRadius: "12px",
      background: "rgba(201,241,223,0.02)",
      padding: "20px",
      display: "flex", flexDirection: "column", gap: "14px",
    }}>
      <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.04em", color: "rgba(255,255,255,0.55)" }}>
        Nouvelle thématique
      </p>
      <Field label="Titre *">
        <input autoFocus type="text" placeholder="ex. GESTION DU STRESS" value={titre}
          onChange={(e) => setTitre(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} style={inputStyle} />
      </Field>
      <Field label="Subtitle (italique)">
        <input type="text" placeholder="ex. & résilience du dirigeant" value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)} style={inputStyle} />
      </Field>
      <Field label="Accroche">
        <input type="text" placeholder="ex. Comment gérez-vous la pression ?" value={accroche}
          onChange={(e) => setAccroche(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} style={inputStyle} />
      </Field>
      <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
        <button onClick={submit} disabled={!titre.trim() || isPending} className="btn-solid"
          style={{ padding: "10px 20px", fontSize: "13px", opacity: (!titre.trim() || isPending) ? 0.5 : 1 }}>
          {isPending ? "Création…" : "Créer la thématique"}
        </button>
        <button onClick={onCancel} disabled={isPending}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.40)", fontFamily: "Sora, sans-serif", fontSize: "13px", cursor: "pointer", padding: 0 }}>
          Annuler
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "8px", color: "#fff", fontFamily: "Sora, sans-serif", fontSize: "14px",
  padding: "10px 14px", outline: "none", caretColor: "#C9F1DF",
};
