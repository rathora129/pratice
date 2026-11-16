import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Search } from "@/components/icons";
import { PackShot } from "@/components/pack-shot";
import { StatusBadge } from "@/components/status-badge";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
};

type SearchParams = Promise<{ q?: string; status?: string }>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePermission("products", "read");
  const canCreate = can(user.role, "products", "create");
  const canUpdate = can(user.role, "products", "update");
  const { q = "", status = "" } = await searchParams;
  const search = q.trim();

  const [products, totalCount, publishedCount, draftCount] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { code: { contains: search } },
                { variants: { some: { sku: { contains: search } } } },
              ],
            }
          : {}),
        ...(status ? { status } : {}),
      },
      include: {
        category: true,
        _count: { select: { variants: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.product.count(),
    prisma.product.count({ where: { status: "published" } }),
    prisma.product.count({ where: { status: "draft" } }),
  ]);

  const statuses = [
    { value: "", label: "All", count: totalCount },
    { value: "published", label: "Published", count: publishedCount },
    { value: "draft", label: "Draft", count: draftCount },
  ];

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-[-0.04em] text-ink">
            Product master
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-ink-muted">
            {totalCount} products · {publishedCount} live on the public website.
          </p>
        </div>
        {canCreate && (
          <Link href="/admin/products/new" className="btn-primary py-2.5">
            <Plus className="h-4 w-4" />
            New product
          </Link>
        )}
      </div>

      <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {statuses.map((item) => (
            <Link
              key={item.value || "all"}
              href={
                item.value
                  ? `/admin/products?status=${item.value}`
                  : "/admin/products"
              }
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-semibold transition ${
                status === item.value
                  ? "border-ink bg-ink text-white"
                  : "border-ink/10 bg-white text-ink-muted hover:border-ink/30 hover:text-ink"
              }`}
            >
              {item.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                  status === item.value ? "bg-white/15" : "bg-ink/5"
                }`}
              >
                {item.count}
              </span>
            </Link>
          ))}
        </div>

        <form method="get" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <label className="relative">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/35" />
            <input
              name="q"
              defaultValue={search}
              placeholder="Search name, code or SKU"
              className="input w-full pl-9 sm:w-[280px]"
            />
          </label>
          <button type="submit" className="btn-secondary py-2.5">
            Search
          </button>
        </form>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-ink">No products found.</p>
            <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-ink-muted">
              Clear the filters or create a new product record with at least one
              variant.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Link href="/admin/products" className="btn-secondary py-2 text-[11px]">
                Clear filters
              </Link>
              {canCreate && (
                <Link href="/admin/products/new" className="btn-primary py-2 text-[11px]">
                  New product
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="bg-[#faf9f6]">
                <tr>
                  <th className="admin-th">Product</th>
                  <th className="admin-th">Category</th>
                  <th className="admin-th">Code</th>
                  <th className="admin-th">Variants</th>
                  <th className="admin-th">Status</th>
                  <th className="admin-th">Updated</th>
                  <th className="admin-th text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-cream/50">
                    <td className="admin-td">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="flex items-center gap-3"
                      >
                        <PackShot
                          name={product.name}
                          categorySlug={product.category.slug}
                          className="h-10 w-10 shrink-0 rounded-lg border border-ink/10"
                        />
                        <span>
                          <span className="block text-[12px] font-semibold text-ink">
                            {product.name}
                          </span>
                          <span className="block max-w-[220px] truncate text-[10px] text-ink-muted">
                            /products/{product.slug}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="admin-td text-[11px] text-ink-muted">
                      {product.category.name}
                    </td>
                    <td className="admin-td font-mono text-[10px] text-ink-muted">
                      {product.code}
                    </td>
                    <td className="admin-td text-[11px] text-ink-muted">
                      {product._count.variants}
                    </td>
                    <td className="admin-td">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="admin-td whitespace-nowrap text-[10px] text-ink-muted">
                      {formatDateTime(product.updatedAt)}
                    </td>
                    <td className="admin-td text-right">
                      <div className="flex items-center justify-end gap-3">
                        {product.status === "published" && (
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="text-[10px] font-medium text-ink-muted hover:text-ink"
                          >
                            View
                          </Link>
                        )}
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-[11px] font-semibold text-brand-700"
                        >
                          {canUpdate ? "Edit" : "Open"}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-[10px] leading-5 text-ink-muted">
        Publishing requires at least one active variant. Archived products stay
        out of the public catalogue but remain available in admin.
      </p>
    </div>
  );
}
