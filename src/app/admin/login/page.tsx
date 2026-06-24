import { loginAction } from "../actions";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Connexion — Osalys Admin" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-osalys.svg"
            alt="Osalys"
            width={140}
            height={74}
            style={{ display: "inline-block", marginBottom: "12px" }}
          />
          <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)" }}>
            Espace administrateur
          </p>
        </div>

        {/* Formulaire */}
        <form action={loginAction}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontFamily: "Sora, sans-serif",
                  fontSize: "11px",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: "10px",
                }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="delphine@osalys.fr"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontFamily: "Sora, sans-serif",
                  fontSize: "15px",
                  padding: "14px 16px",
                  outline: "none",
                  caretColor: "#C9F1DF",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontFamily: "Sora, sans-serif",
                  fontSize: "11px",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: "10px",
                }}
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontFamily: "Sora, sans-serif",
                  fontSize: "15px",
                  padding: "14px 16px",
                  outline: "none",
                  caretColor: "#C9F1DF",
                }}
              />
            </div>

            {error && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#E86A33",
                  padding: "12px 16px",
                  background: "rgba(232,106,51,0.08)",
                  borderRadius: "8px",
                  border: "1px solid rgba(232,106,51,0.20)",
                }}
              >
                {error}
              </p>
            )}

            <button type="submit" className="btn-solid" style={{ width: "100%", justifyContent: "center" }}>
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
