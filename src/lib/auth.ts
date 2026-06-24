import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "osalys_admin_session";
const SESSION_VALUE  = "authenticated";

export async function requireAdmin() {
  const store = await cookies();
  if (store.get(SESSION_COOKIE)?.value !== SESSION_VALUE) {
    redirect("/admin/login");
  }
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export async function login(email: string, password: string): Promise<boolean> {
  const ok =
    email === (process.env.ADMIN_EMAIL ?? "admin@osalys.fr") &&
    password === (process.env.ADMIN_PASSWORD ?? "osalys2025");
  return ok;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_COOKIE_VALUE = SESSION_VALUE;
