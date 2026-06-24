import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = { title: "Admin — Osalys Diagnostic" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#000",
      }}
    >
      <AdminSidebar />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "clamp(32px, 4vw, 56px)",
          overflowY: "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}
