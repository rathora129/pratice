"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveProduct } from "@/app/actions/products";
import { initialProductState } from "@/lib/form-state";

type CategoryOption = {
  id: string;
  name: string;
};

export type ProductFormInitial = {
  id: string;
  name: string;
  code: string;
  slug: string;
  categoryId: string;
  description: string;
  application: string | null;
  status: string;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
};

export function ProductForm({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product?: ProductFormInitial;
}) {
  const [state, formAction, isPending] = useActionState(
    saveProduct,
    initialProductState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      {state.status === "error" && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-800"
          role="alert"
        >
          {state.message}
        </div>
      )}

      <section className="admin-card">
        <div className="flex items-center justify-between border-b border-ink/10 pb-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Product basics</h2>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              This record powers the public page, catalogue cards and admin
              search.
            </p>
          </div>
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/30">
            Required
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="name">
              Product name
            </label>
            <input
              id="name"
              name="name"
              className="input"
              defaultValue={product?.name}
              placeholder="e.g. Stand-Up Pouch"
              required
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="code">
              Product code
            </label>
            <input
              id="code"
              name="code"
              className="input font-mono uppercase"
              defaultValue={product?.code}
              placeholder="SP-SUP-001"
              required
              aria-invalid={Boolean(errors.code)}
            />
            {errors.code && <p className="error-text">{errors.code}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="slug">
              URL slug
            </label>
            <input
              id="slug"
              name="slug"
              className="input font-mono"
              defaultValue={product?.slug}
              placeholder="auto-from-name"
            />
            <p className="hint">Leave blank to generate from the name.</p>
            {errors.slug && <p className="error-text">{errors.slug}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="categoryId">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className="select"
              defaultValue={product?.categoryId ?? ""}
              required
              aria-invalid={Boolean(errors.categoryId)}
            >
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="error-text">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="application">
              Application
            </label>
            <input
              id="application"
              name="application"
              className="input"
              defaultValue={product?.application ?? ""}
              placeholder="Food, spices, personal care…"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="textarea min-h-[128px]"
              defaultValue={product?.description}
              placeholder="What the format is for, what options exist, and what the buyer needs to share before costing."
              required
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && (
              <p className="error-text">{errors.description}</p>
            )}
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="border-b border-ink/10 pb-4">
          <h2 className="text-sm font-semibold text-ink">Publishing</h2>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            Draft stays private. Published appears on the public catalogue.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="select"
              defaultValue={product?.status ?? "draft"}
              key={product?.status ?? "draft"}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            {errors.status && <p className="error-text">{errors.status}</p>}
            <p className="hint">
              A product needs at least one active variant before it can be
              published.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 bg-cream p-4">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured}
              className="mt-0.5 h-4 w-4 rounded border-ink/25 accent-brand-600"
            />
            <span>
              <span className="block text-[12px] font-semibold text-ink">
                Feature on the homepage
              </span>
              <span className="mt-0.5 block text-[10px] leading-4 text-ink-muted">
                Featured products appear in the “Selected formats” grid.
              </span>
            </span>
          </label>
        </div>
      </section>

      <section className="admin-card">
        <div className="border-b border-ink/10 pb-4">
          <h2 className="text-sm font-semibold text-ink">SEO</h2>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            Optional. Falls back to the product name and description.
          </p>
        </div>
        <div className="mt-5 space-y-4">
          <div>
            <label className="field-label" htmlFor="seoTitle">
              SEO title
            </label>
            <input
              id="seoTitle"
              name="seoTitle"
              className="input"
              defaultValue={product?.seoTitle ?? ""}
              placeholder="Custom Stand-Up Pouches | Stark Packmate"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="seoDescription">
              SEO description
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              className="textarea min-h-[84px]"
              defaultValue={product?.seoDescription ?? ""}
              placeholder="One or two sentences for search results."
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/admin/products" className="btn-secondary">
          Cancel
        </Link>
        <button type="submit" className="btn-brand" disabled={isPending}>
          {isPending
            ? "Saving…"
            : product
              ? "Save product"
              : "Create product"}
        </button>
      </div>
    </form>
  );
}
