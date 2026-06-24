"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { login, SESSION_COOKIE_NAME, SESSION_COOKIE_VALUE } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  const ok = await login(email, password);
  if (!ok) redirect("/admin/login?error=Identifiants+incorrects.");

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, SESSION_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 h
    path: "/",
  });

  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}
