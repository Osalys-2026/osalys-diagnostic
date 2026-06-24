import { requireAdmin } from "@/lib/auth";
import { getCoachProfile, saveCoachProfile } from "@/lib/actions/coach";
import { CoachForm } from "@/components/admin/CoachForm";

export const metadata = { title: "Paramètres — Osalys Admin" };

export default async function ParametresPage() {
  await requireAdmin();
  const profile = await getCoachProfile();

  async function handleSave(data: Parameters<typeof saveCoachProfile>[0]) {
    "use server";
    await saveCoachProfile(data);
  }

  return (
    <div style={{ maxWidth: "700px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(24px, 2.4vw, 36px)", letterSpacing: "-0.02em", textTransform: "uppercase", marginBottom: "6px" }}>
          Paramètres
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.40)" }}>
          Configurez le profil coach affiché sur les pages de résultat.
        </p>
      </div>

      <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.50)", marginBottom: "24px" }}>
        Profil coach
      </h2>

      <CoachForm initial={profile} onSave={handleSave} />
    </div>
  );
}
