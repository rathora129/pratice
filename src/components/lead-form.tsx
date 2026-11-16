"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Check, Shield } from "@/components/icons";
import { submitLead } from "@/app/actions/leads";
import { initialLeadState } from "@/lib/form-state";

type ProductOption = {
  id: string;
  name: string;
  slug: string;
};

type LeadFormProps = {
  products: ProductOption[];
  source?: string;
  defaultProductSlug?: string;
  mode?: "quote" | "contact";
};

export function LeadForm({
  products,
  source = "website · quote",
  defaultProductSlug,
  mode = "quote",
}: LeadFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitLead,
    initialLeadState,
  );

  const defaultProduct = products.find(
    (product) => product.slug === defaultProductSlug,
  );

  if (state.status === "success") {
    return (
      <div
        className="flex flex-col items-start rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8"
        role="status"
        aria-live="polite"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-600 text-white">
          <Check className="h-5 w-5" />
        </span>
        <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-ink">
          Brief received
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
          {state.message}
        </p>
        {state.reference && (
          <p className="mt-4 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-800">
            Reference · {state.reference}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/products" className="btn-secondary">
            Continue browsing
          </Link>
          <a
            href="tel:+919717023662"
            className="btn-ghost text-sm font-semibold text-emerald-800"
          >
            Call the team
          </a>
        </div>
        <p className="mt-6 text-[11px] leading-5 text-ink-muted">
          The reference above is stored in the admin lead inbox. In this preview,
          it can be viewed at{" "}
          <Link className="link-underline font-medium" href="/admin/leads">
            /admin/leads
          </Link>
          .
        </p>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="source" value={source} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
      />

      {errors.form && <p className="error-text">{errors.form}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="contactName">
            Your name <span className="text-brand-600">*</span>
          </label>
          <input
            id="contactName"
            name="contactName"
            className="input"
            placeholder="Full name"
            autoComplete="name"
            required
            minLength={2}
            aria-invalid={Boolean(errors.contactName)}
          />
          {errors.contactName && <p className="error-text">{errors.contactName}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="company">
            Company <span className="text-brand-600">*</span>
          </label>
          <input
            id="company"
            name="company"
            className="input"
            placeholder="Brand or company"
            autoComplete="organization"
            required
            minLength={2}
            aria-invalid={Boolean(errors.company)}
          />
          {errors.company && <p className="error-text">{errors.company}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="phone">
            Phone <span className="text-brand-600">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="input"
            placeholder="+91"
            autoComplete="tel"
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
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="productInterest">
            {mode === "contact" ? "What is this about?" : "Product of interest"}
          </label>
          <select
            id="productInterest"
            name="productInterest"
            className="select"
            defaultValue={defaultProduct?.name ?? ""}
          >
            <option value="">General enquiry / not sure yet</option>
            {products.map((product) => (
              <option key={product.id} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="quantity">
            Estimated quantity
          </label>
          <input
            id="quantity"
            name="quantity"
            className="input"
            placeholder="e.g. 50,000 pouches"
          />
          <p className="hint">Approximate is fine — we will confirm MOQ.</p>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="message">
          {mode === "contact" ? "Your message" : "Tell us about the pack"}
        </label>
        <textarea
          id="message"
          name="message"
          className="textarea"
          placeholder={
            mode === "contact"
              ? "How can the Stark Packmate team help?"
              : "Fill weight, dimensions, material preference, artwork status, delivery city — anything you know so far."
          }
          maxLength={2000}
        />
      </div>

      {state.status === "error" && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-4 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex max-w-xs items-start gap-2 text-[11px] leading-5 text-ink-muted">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
          Your details are used only to respond to this enquiry.
        </p>
        <button type="submit" className="btn-brand" disabled={isPending}>
          {isPending ? "Sending brief…" : "Send brief"}
        </button>
      </div>
    </form>
  );
}
