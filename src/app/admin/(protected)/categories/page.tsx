import { requireAdmin } from "@/lib/auth";
import { getSkillCategories, createSkillCategory, deleteSkillCategory } from "@/lib/actions/categories";
import { CategoriesList } from "@/components/admin/CategoriesList";

export const metadata = { title: "Catégories — Osalys Admin" };

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await getSkillCategories();

  async function handleCreate(label: string) {
    "use server";
    await createSkillCategory(label);
  }

  async function handleDelete(id: string) {
    "use server";
    await deleteSkillCategory(id);
  }

  return (
    <div style={{ maxWidth: "680px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{
          fontFamily: "Sora, sans-serif", fontWeight: 700,
          fontSize: "clamp(24px, 2.4vw, 36px)", letterSpacing: "-0.02em",
          textTransform: "uppercase", marginBottom: "6px",
        }}>
          Catégories de compétences
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.40)" }}>
          Définissez les catégories que Delphine attribuera à chaque question dans les diagnostics.
          Les résultats seront automatiquement générés selon les scores par catégorie.
        </p>
      </div>

      <CategoriesList
        initialCategories={categories}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />
    </div>
  );
}
