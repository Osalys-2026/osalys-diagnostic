"use client";

import { useState, useTransition, useRef } from "react";
import type { CoachProfile } from "@/lib/actions/coach";

interface Props {
  initial: CoachProfile;
  onSave: (data: CoachProfile) => Promise<void>;
}

export function CoachForm({ initial, onSave }: Props) {
  const [form, setForm] = useState<CoachProfile>(initial);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(key: keyof CoachProfile, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("La photo ne doit pas dépasser 2 Mo.");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      set("photo_url", reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await onSave(form);
      setSaved(true);
    });
  }

  const inputStyle: React.CSSProperties = {
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
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.40)",
    marginBottom: "8px",
    fontFamily: "Sora, sans-serif",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "600px" }}>

      {/* Photo upload */}
      <div>
        <label style={labelStyle}>Photo</label>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: "relative",
              width: "96px",
              height: "96px",
              borderRadius: "50%",
              border: "2px dashed rgba(255,255,255,0.20)",
              background: "rgba(255,255,255,0.03)",
              cursor: "pointer",
              overflow: "hidden",
              padding: 0,
              flexShrink: 0,
            }}
          >
            {form.photo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={form.photo_url}
                alt="Coach"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.30)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span style={{ fontSize: "10px", fontFamily: "Sora, sans-serif" }}>
                  {uploading ? "..." : "Importer"}
                </span>
              </span>
            )}
            {/* Hover overlay */}
            {form.photo_url && (
              <div style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.50)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0,
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
            )}
          </button>

          <div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.50)", fontFamily: "Sora, sans-serif", marginBottom: "4px" }}>
              Cliquez pour importer une photo
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: "Sora, sans-serif" }}>
              JPG, PNG — max 2 Mo
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      <div>
        <label style={labelStyle}>Nom complet</label>
        <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex : Delphine Martin" />
      </div>

      <div>
        <label style={labelStyle}>Titre / spécialité</label>
        <input style={inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex : Coach en leadership & développement professionnel" />
      </div>

      <div>
        <label style={labelStyle}>Description courte</label>
        <textarea
          style={{ ...inputStyle, minHeight: "100px", resize: "vertical", lineHeight: 1.6 }}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Ex : Delphine accompagne les dirigeants depuis 10 ans dans leurs transformations..."
        />
      </div>

      <div>
        <label style={labelStyle}>Lien Calendly</label>
        <input
          style={inputStyle}
          value={form.calendly_url}
          onChange={(e) => set("calendly_url", e.target.value)}
          placeholder="https://calendly.com/delphine-osalys/30min"
        />
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontFamily: "Sora, sans-serif", marginTop: "6px" }}>
          L'URL de votre agenda Calendly — affiché à la fin de chaque diagnostic.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          type="submit"
          style={{
            background: "#C9F1DF",
            color: "#0a0a0a",
            border: "none",
            borderRadius: "8px",
            fontFamily: "Sora, sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            padding: "12px 24px",
            cursor: "pointer",
            letterSpacing: "0.04em",
          }}
        >
          Enregistrer
        </button>
        {saved && (
          <span style={{ fontSize: "13px", color: "#C9F1DF", fontFamily: "Sora, sans-serif" }}>
            ✓ Enregistré
          </span>
        )}
      </div>
    </form>
  );
}
