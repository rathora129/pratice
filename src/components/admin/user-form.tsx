"use client";

import { useActionState } from "react";
import { createUser } from "@/app/actions/users";
import { initialAdminFormState } from "@/lib/form-state";
import { roleKeys, roleLabel } from "@/lib/rbac";

export function UserForm() {
  const [state, formAction, isPending] = useActionState(
    createUser,
    initialAdminFormState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-800"
          role="alert"
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            name="name"
            className="input"
            placeholder="e.g. Ananya Rao"
            required
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="email">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            placeholder="name@starkpackmate.com"
            required
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="select"
            defaultValue="sales_executive"
            aria-invalid={Boolean(errors.role)}
          >
            {roleKeys.map((role) => (
              <option key={role} value={role}>
                {roleLabel(role)}
              </option>
            ))}
          </select>
          {errors.role && <p className="error-text">{errors.role}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="password">
            Temporary password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && <p className="error-text">{errors.password}</p>}
          <p className="hint">
            Share it securely. Password reset and MFA are later-phase work.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-brand" disabled={isPending}>
          {isPending ? "Creating…" : "Add team member"}
        </button>
      </div>
    </form>
  );
}
