import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Pencil,
  Plus,
} from "@/components/icons";
import { ProductForm } from "@/components/admin/product-form";
import { VariantForm } from "@/components/admin/variant-form";
import { PackShot } from "@/components/pack-shot";
import { StatusBadge } from "@/components/status-badge";
import {
  toggleProductStatus,
  toggleVariantStatus,
} from "@/app/actions/products";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import {
  dimensionsLabel,
  formatDateTime,
  formatPrice,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    saved?: string;
    variantSaved?: string;
    error?: string;
    variant?: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true },
  });

  return { title: product ? `Edit ${product.name}` : "Edit product" };
}

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps) {
  const user = await requirePermission("products", "read");
  const canUpdate = can(user.role, "products", "update");
  const canPublish = can(user.role, "products", "publish");
  const canCreate = can(user.role, "products", "create");
  const canSeeLeads = can(user.role, "leads", "read");

  const [{ id }, query] = await Promise.all([params, searchParams]);

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  const activeVariants = product.variants.filter(
    (variant) => variant.status === "active",
  );
  const editingVariant = query.variant
    ? product.variants.find((variant) => variant.id === query.variant)
    : undefined;

  return (
    <div className="mx-auto max-w-[1180px]">
      <nav
        className="flex flex-wrap items-center gap-2 text-[11px] text-ink-muted"
        aria-label="Breadcrumb"
      >
        <Link href="/admin" className="hover:text-ink">
          Admin
        </Link>
        <span className="text-ink/25">/</span>
        <Link href="/admin/products" className="hover:text-ink">
          Products
        </Link>
        <span className="text-ink/25">/</span>
        <span className="truncate font-medium text-ink">{product.name}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-ink">
              {product.name}
            </h1>
            <StatusBadge status={product.status} />
          </div>
          <p className="mt-2 text-[12px] text-ink-muted">
            {product.category.name} · {product.variants.length} variants ·{" "}
            {product.code}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products" className="btn-secondary py-2.5">
            Back to list
          </Link>
          {product.status === "published" && (
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              className="btn-primary py-2.5"
            >
              View public page
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {(query.saved || query.variantSaved || query.error) && (
        <div className="mt-5 space-y-2">
          {query.saved && (
            <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-800">
              <Check className="h-4 w-4" />
              Product saved. Public pages were revalidated.
            </p>
          )}
          {query.variantSaved && (
            <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-800">
              <Check className="h-4 w-4" />
              Variant saved and product page revalidated.
            </p>
          )}
          {query.error === "variant-required" && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
              Add at least one active variant before publishing this product.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-5">
          {canUpdate ? (
            <ProductForm categories={categories} product={product} />
          ) : (
            <section className="admin-card">
              <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                <h2 className="text-sm font-semibold text-ink">
                  Product record
                </h2>
                <span className="rounded-full border border-ink/10 bg-cream px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  Read only
                </span>
              </div>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  ["Code", product.code],
                  ["Category", product.category.name],
                  ["Application", product.application ?? "Not specified"],
                  ["Status", product.status],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="field-label">{label}</dt>
                    <dd className="text-[12px] capitalize text-ink">{value}</dd>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <dt className="field-label">Description</dt>
                  <dd className="whitespace-pre-line text-[12px] leading-6 text-ink">
                    {product.description}
                  </dd>
                </div>
              </dl>
              <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[10px] leading-5 text-amber-900">
                Your role has read access to product specifications. Editing and
                publishing are restricted.
              </p>
            </section>
          )}

          <section className="admin-card">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 pb-4">
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  Variants · {product.variants.length}
                </h2>
                <p className="mt-0.5 text-[11px] text-ink-muted">
                  Customer-facing formats with their own SKU, dimensions and
                  price.
                </p>
              </div>
              <span className="rounded-full bg-cream px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                {activeVariants.length} active
              </span>
            </div>

            {product.variants.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-5">
                <p className="text-[12px] font-semibold text-amber-900">
                  No variants yet.
                </p>
                <p className="mt-1 text-[11px] leading-5 text-amber-800">
                  Add the first variant below. Publishing stays blocked until at
                  least one active variant exists.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-2.5">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="rounded-xl border border-ink/10 bg-cream/60 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[12px] font-semibold text-ink">
                            {variant.name}
                          </p>
                          <StatusBadge status={variant.status} />
                        </div>
                        <p className="mt-0.5 font-mono text-[9px] text-ink-muted">
                          {variant.sku}
                        </p>
                      </div>
                      {canUpdate && (
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/products/${product.id}?variant=${variant.id}#variant-form`}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-700"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Link>
                          <form action={toggleVariantStatus}>
                            <input type="hidden" name="id" value={variant.id} />
                            <input
                              type="hidden"
                              name="next"
                              value={
                                variant.status === "active" ? "archived" : "active"
                              }
                            />
                            <button
                              type="submit"
                              className="text-[10px] font-medium text-ink-muted hover:text-ink"
                            >
                              {variant.status === "active"
                                ? "Archive"
                                : "Restore"}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-ink/10 pt-3">
                      <span className="text-[10px] text-ink-muted">
                        {dimensionsLabel(variant) ?? "Dimensions on request"}
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        {variant.material ?? "Structure on request"}
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        MOQ{" "}
                        {variant.moq
                          ? `${variant.moq} ${variant.uom}`
                          : "on request"}
                      </span>
                      <span className="text-[10px] font-medium text-ink">
                        {formatPrice(variant.pricePaise)}
                        {variant.pricePaise ? ` / ${variant.uom}` : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {canUpdate && (
              <div id="variant-form" className="mt-5 scroll-mt-24">
                <VariantForm
                  key={editingVariant?.id ?? "new"}
                  productId={product.id}
                  variant={editingVariant}
                />
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
            <PackShot
              name={product.name}
              categorySlug={product.category.slug}
              className="h-[140px] w-full"
            />
            <div className="p-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                Publish state
              </p>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge status={product.status} />
                <span className="text-[10px] text-ink-muted">
                  {activeVariants.length} active variants
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {canPublish && product.status !== "published" && (
                  <form action={toggleProductStatus}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="next" value="published" />
                    <button
                      type="submit"
                      disabled={activeVariants.length === 0}
                      className="btn-brand w-full py-2.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Publish product
                    </button>
                  </form>
                )}
                {canPublish && product.status === "published" && (
                  <form action={toggleProductStatus}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="next" value="draft" />
                    <button
                      type="submit"
                      className="btn-secondary w-full py-2.5 text-[11px]"
                    >
                      Move back to draft
                    </button>
                  </form>
                )}
                {canPublish && product.status === "archived" && (
                  <form action={toggleProductStatus}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="next" value="draft" />
                    <button
                      type="submit"
                      className="btn-secondary w-full py-2.5 text-[11px]"
                    >
                      Restore as draft
                    </button>
                  </form>
                )}
                {canPublish && product.status !== "archived" && (
                  <form action={toggleProductStatus}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="next" value="archived" />
                    <button
                      type="submit"
                      className="w-full rounded-full px-4 py-2 text-[10px] font-medium text-ink-muted transition hover:bg-cream hover:text-ink"
                    >
                      Archive product
                    </button>
                  </form>
                )}
              </div>

              {canPublish &&
                activeVariants.length === 0 &&
                product.status !== "published" && (
                  <p className="mt-2 text-[10px] leading-5 text-amber-800">
                    Publishing is disabled until a variant is active.
                  </p>
                )}

              {product.status === "published" && (
                <Link
                  href={`/products/${product.slug}`}
                  target="_blank"
                  className="mt-3 flex items-center justify-between rounded-xl bg-cream px-3 py-2.5 text-[10px] font-medium text-ink"
                >
                  /products/{product.slug}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>

          <div className="admin-card">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/40">
              Publish checklist
            </p>
            <ul className="mt-3 space-y-2.5">
              {[
                {
                  done: activeVariants.length > 0,
                  label: "At least one active variant",
                },
                { done: product.description.length > 20, label: "Description" },
                { done: Boolean(product.seoTitle), label: "SEO title set" },
                { done: product.featured, label: "Featured on homepage" },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-3 text-[11px]"
                >
                  <span className="text-ink-muted">{item.label}</span>
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full ${
                      item.done
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-ink/5 text-ink/25"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="admin-card">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/40">
              Record
            </p>
            <dl className="mt-3 space-y-2.5 text-[11px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Code</dt>
                <dd className="font-mono text-[10px] text-ink">{product.code}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Created</dt>
                <dd className="text-ink">{formatDateTime(product.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Updated</dt>
                <dd className="text-ink">{formatDateTime(product.updatedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Category</dt>
                <dd className="text-right text-ink">{product.category.name}</dd>
              </div>
            </dl>
            {canCreate && (
              <Link
                href="/admin/products/new"
                className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold text-brand-700"
              >
                <Plus className="h-3 w-3" />
                Create another product
              </Link>
            )}
          </div>

          {canSeeLeads && (
            <Link
              href="/admin/leads"
              className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white p-4 text-[11px] font-medium text-ink shadow-soft"
            >
              Check the lead inbox
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
