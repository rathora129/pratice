"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  createSessionToken,
  getCurrentUser,
  sessionMaxAge,
  verifyPassword,
} from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import type { LoginFormState } from "@/lib/form-state";

export async function login(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", message: "Enter your work email and password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.status !== "active" || !verifyPassword(password, user.passwordHash)) {
    return {
      status: "error",
      message: "Those credentials do not match an active account.",
    };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAge,
  });

  await recordAudit({
    actor: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    action: "auth.sign_in",
    entityType: "session",
    entityId: user.id,
    summary: `${user.name} signed in`,
  });

  redirect("/admin");
}

export async function logout() {
  const user = await getCurrentUser();

  if (user) {
    await recordAudit({
      actor: user,
      action: "auth.sign_out",
      entityType: "session",
      entityId: user.id,
      summary: `${user.name} signed out`,
    });
  }

  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
