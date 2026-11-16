"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveCustomer } from "@/app/actions/customers";
import { initialAdminFormState } from "@/lib/form-state";

type OwnerOption = {
  id: string;
  name: string;
};

export type CustomerFormInitial = {
  id: string;
  code: string;
  company: string;
  contactName: string;
  phone: string;
  email: string | null;
  gstin: string | null;
  billingAddress: string | null;
  shippingAddress: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  paymentTerms: string | null;
  creditLimitPaise: number | null;
  status: string;
  ownerId: string | null;
};

export function CustomerForm({
  customer,
  owners,
  canAssignOwner,
}: {
  customer?: CustomerFormInitial;
  owners: OwnerOption[];
  canAssignOwner: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    saveCustomer,
    initialAdminFormState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {customer && <input type="hidden" name="id" value={customer.id} />}

      {state.status === "error" && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-800"
          role="alert"
        >
          {state.message}
        </div>
      )}

      <section className="admin-card">
        <div className="border-b border-ink/10 pb-4">
          <h2 className="text-sm font-semibold text-ink">Company</h2>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            The legal buying entity. Duplicate company + phone pairs are
            rejected on create.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="company">
              Company name
            </label>
            <input
              id="company"
              name="company"
              className="input"
              defaultValue={customer?.company}
              placeholder="e.g. Meridian Foods Pvt Ltd"
              required
              aria-invalid={Boolean(errors.company)}
            />
            {errors.company && <p className="error-text">{errors.company}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="contactName">
              Primary contact
            </label>
            <input
              id="contactName"
              name="contactName"
              className="input"
              defaultValue={customer?.contactName}
              required
              aria-invalid={Boolean(errors.contactName)}
            />
            {errors.contactName && (
              <p className="error-text">{errors.contactName}</p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              className="input"
              defaultValue={customer?.phone}
              placeholder="+91 98765 43210"
              required
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              defaultValue={customer?.email ?? ""}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="gstin">
              GSTIN
            </label>
            <input
              id="gstin"
              name="gstin"
              className="input font-mono uppercase"
              defaultValue={customer?.gstin ?? ""}
              maxLength={15}
              placeholder="27ABCDE1234F1Z5"
              aria-invalid={Boolean(errors.gstin)}
            />
            {errors.gstin && <p className="error-text">{errors.gstin}</p>}
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="border-b border-ink/10 pb-4">
          <h2 className="text-sm font-semibold text-ink">Address & billing</h2>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            Used on quotations and invoices once those modules are built.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="billingAddress">
              Billing address
            </label>
            <textarea
              id="billingAddress"
              name="billingAddress"
              className="textarea min-h-[92px]"
              defaultValue={customer?.billingAddress ?? ""}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="shippingAddress">
              Shipping address
            </label>
            <textarea
              id="shippingAddress"
              name="shippingAddress"
              className="textarea min-h-[92px]"
              defaultValue={customer?.shippingAddress ?? ""}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="city">
              City
            </label>
            <input
              id="city"
              name="city"
              className="input"
              defaultValue={customer?.city ?? ""}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="state">
              State
            </label>
            <input
              id="state"
              name="state"
              className="input"
              defaultValue={customer?.state ?? ""}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="pincode">
              Pincode
            </label>
            <input
              id="pincode"
              name="pincode"
              className="input"
              defaultValue={customer?.pincode ?? ""}
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="paymentTerms">
              Payment terms
            </label>
            <input
              id="paymentTerms"
              name="paymentTerms"
              className="input"
              defaultValue={customer?.paymentTerms ?? ""}
              placeholder="e.g. 50% advance, 50% before dispatch"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="creditLimit">
              Credit limit (₹)
            </label>
            <input
              id="creditLimit"
              name="creditLimit"
              className="input"
              type="number"
              min="0"
              step="0.01"
              defaultValue={
                customer?.creditLimitPaise
                  ? customer.creditLimitPaise / 100
                  : ""
              }
              aria-invalid={Boolean(errors.creditLimitPaise)}
            />
            <p className="hint">Leave blank when no limit is agreed.</p>
          </div>

          <div>
            <label className="field-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="select"
              defaultValue={customer?.status ?? "active"}
              key={customer?.status ?? "active"}
            >
              <option value="active">Active</option>
              <option value="on_hold">On hold</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {canAssignOwner && (
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="ownerId">
                Account owner
              </label>
              <select
                id="ownerId"
                name="ownerId"
                className="select"
                defaultValue={customer?.ownerId ?? ""}
              >
                <option value="">Unassigned</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
              <p className="hint">
                Only CRM roles can be account owners.
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={customer ? `/admin/customers/${customer.id}` : "/admin/customers"}
          className="btn-secondary"
        >
          Cancel
        </Link>
        <button type="submit" className="btn-brand" disabled={isPending}>
          {isPending
            ? "Saving…"
            : customer
              ? "Save customer"
              : "Create customer"}
        </button>
      </div>
    </form>
  );
}
