import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { QuoteBand } from "@/components/quote-band";
import { getSiteContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product catalogue",
  description:
    "Browse stand-up pouches, centre-seal pouches, labels, shrink sleeves, courier bags and paper packaging. Request a specification-led quote.",
};

type SearchParams = Promise<{ q?: string; category?: string }>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "", category = "" } = await searchParams;
  const search = q.trim();

  const [categories, products, content] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        products: { where: { status: "published" }, select: { id: true } },
      },
    }),
    prisma.product.findMany({
      where: {
        status: "published",
        ...(category ? { category: { slug: category } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } },
                { application: { contains: search } },
                { variants: { some: { sku: { contains: search } } } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        variants: {
          where: { status: "active" },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    }),
    getSiteContent(),
  ]);

  const activeCategory = categories.find((item) => item.slug === category);
  const totalCount = categories.reduce(
    (sum, item) => sum + item.products.length,
    0,
  );

  function categoryHref(slug: string) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (slug) params.set("category", slug);
    const query = params.toString();
    return query ? `/products?${query}` : "/products";
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/10 bg-white">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container-page relative py-12 sm:py-16">
          <nav className="flex items-center gap-2 text-[11px] text-ink-muted" aria-label="Breadcrumb">
            <Link className="transition hover:text-ink" href="/">
              Home
            </Link>
            <span className="text-ink/25">/</span>
            <span className="font-medium text-ink">Products</span>
          </nav>

          <div className="mt-7 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">The catalogue</p>
              <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[3.6rem]">
                {activeCategory ? activeCategory.name : "Formats that earn shelf space."}
              </h1>
              <p className="lede mt-4">
                {activeCategory
                  ? activeCategory.description
                  : "Search by format or application. Every listing carries the specification we have verified — final structure, MOQ and pricing are confirmed during costing."}
              </p>
            </div>
            <div className="flex shrink-0 gap-6 border-t border-ink/10 pt-5 lg:border-0 lg:pt-0">
              <div>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-ink">
                  {products.length}
                </p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  matches
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-ink">
                  {totalCount}
                </p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  live products
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-9 sm:py-12">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <Link
                href={categoryHref("")}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-[11px] font-semibold transition",
                  !category
                    ? "border-ink bg-ink text-white"
                    : "border-ink/10 bg-white text-ink-muted hover:border-ink/30 hover:text-ink",
                )}
              >
                All formats
              </Link>
              {categories.map((item) => (
                <Link
                  key={item.id}
                  href={categoryHref(item.slug)}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-[11px] font-semibold transition",
                    category === item.slug
                      ? "border-ink bg-ink text-white"
                      : "border-ink/10 bg-white text-ink-muted hover:border-ink/30 hover:text-ink",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <form method="get" className="flex w-full gap-2 lg:w-[330px]">
              {category && <input type="hidden" name="category" value={category} />}
              <label className="relative flex-1">
                <span className="sr-only">Search products</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                <input
                  name="q"
                  defaultValue={search}
                  className="input pl-10"
                  placeholder="Search format, SKU, application…"
                />
              </label>
              <button type="submit" className="btn-primary px-4">
                Search
              </button>
            </form>
          </div>

          {(search || activeCategory) && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
              <span>Active filters:</span>
              {search && (
                <span className="chip">Search “{search}”</span>
              )}
              {activeCategory && (
                <span className="chip">{activeCategory.name}</span>
              )}
              <Link
                href="/products"
                className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4"
              >
                Reset
              </Link>
            </div>
          )}
        </div>

        {products.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-start rounded-2xl border border-dashed border-ink/20 bg-white/60 p-8 sm:p-12">
            <p className="eyebrow">No match yet</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">
              We may still be able to make it.
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-ink-muted">
              The public catalogue covers the formats we have verified so far.
              Send your requirement and we will confirm whether it fits an
              existing structure or needs a custom development.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products" className="btn-secondary">
                Clear filters
              </Link>
              <Link href="/request-a-quote" className="btn-primary">
                Send a requirement
              </Link>
            </div>
          </div>
        )}

        <p className="mt-8 max-w-2xl text-[11px] leading-5 text-ink-muted">
          Listing specifications are indicative and based on verified public
          catalogue data. Dimensions, film structure, print method and MOQ are
          confirmed against your artwork and filling line before a quotation is
          issued.
        </p>
      </section>

      <QuoteBand phone={content["contact.phone"]} />
    </>
  );
}
