"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { initialLoginState } from "@/lib/form-state";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    login,
    initialLoginState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="email">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="input py-3"
          placeholder="name@starkpackmate.com"
          autoComplete="username"
          autoFocus
          required
          aria-invalid={state.status === "error"}
        />
      </div>

      <div>
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="input py-3"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          aria-invalid={state.status === "error"}
        />
      </div>

      {state.status === "error" && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] text-red-800"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={isPending}>
        {isPending ? "Signing in…" : "Enter workspace"}
      </button>

      <p className="text-center text-[10px] leading-5 text-ink-muted">
        Access follows the role assigned to your account. Seeded demo accounts
        use the password{" "}
        <code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[10px]">
          Packmate@2026
        </code>{" "}
        unless DEMO_PASSWORD was set before seeding.
      </p>
    </form>
  );
}
