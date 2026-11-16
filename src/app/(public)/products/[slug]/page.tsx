import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Phone,
  Shield,
} from "@/components/icons";
import { PackShot } from "@/components/pack-shot";
import { ProductCard } from "@/components/product-card";
import { QuoteBand } from "@/components/quote-band";
import { getSiteContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { cn, dimensionsLabel, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
};

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        where: { status: "active" },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: {
      absolute:
        product.seoTitle ?? `${product.name} · ${product.category.name}`,
    },
    description:
      product.seoDescription ??
      product.description.slice(0, 160),
    openGraph: {
      title: product.seoTitle ?? product.name,
      description: product.seoDescription ?? product.description.slice(0, 160),
      type: "website",
    },
  };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const [{ slug }, { variant: variantId }] = await Promise.all([
    params,
    searchParams,
  ]);

  const [product, content] = await Promise.all([
    getProduct(slug),
    getSiteContent(),
  ]);

  if (!product || product.status !== "published") {
    notFound();
  }

  const selectedVariant =
    product.variants.find((variant) => variant.id === variantId) ??
    product.variants[0];

  const related = await prisma.product.findMany({
    where: {
      status: "published",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: {
      category: true,
      variants: {
        where: { status: "active" },
        orderBy: { createdAt: "asc" },
      },
    },
    take: 3,
  });

  const specRows = selectedVariant
    ? [
        ["Format", product.category.name],
        [
          "Dimensions",
          dimensionsLabel(selectedVariant) ?? "Confirmed at costing",
        ],
        ["Material / structure", selectedVariant.material ?? "On request"],
        [
          "Thickness",
          selectedVariant.thicknessMicron
            ? `${selectedVariant.thicknessMicron} micron`
            : "Confirmed at costing",
        ],
        ["Printing", selectedVariant.printingMethod ?? "On request"],
        [
          "Colours",
          selectedVariant.colourCount
            ? `${selectedVariant.colourCount} colours`
            : "Artwork dependent",
        ],
        ["Lamination", selectedVariant.lamination ?? "Structure dependent"],
        ["Finish", selectedVariant.finish ?? "On request"],
        ["Closure", selectedVariant.closure ?? "On request"],
        ["MOQ", selectedVariant.moq ? `${selectedVariant.moq} ${selectedVariant.uom}` : "On request"],
        ["Unit", selectedVariant.uom],
        ["Price", formatPrice(selectedVariant.pricePaise)],
        ["SKU", selectedVariant.sku],
      ]
    : [];

  const quoteHref = `/request-a-quote?product=${product.slug}`;
  const sampleHref = `/request-a-quote?product=${product.slug}&type=sample`;

  return (
    <>
      <section className="border-b border-ink/10 bg-white">
        <div className="container-page py-8 sm:py-12">
          <nav
            className="flex flex-wrap items-center gap-2 text-[11px] text-ink-muted"
            aria-label="Breadcrumb"
          >
            <Link className="transition hover:text-ink" href="/">
              Home
            </Link>
            <span className="text-ink/25">/</span>
            <Link className="transition hover:text-ink" href="/products">
              Products
            </Link>
            <span className="text-ink/25">/</span>
            <Link
              className="transition hover:text-ink"
              href={`/products?category=${product.category.slug}`}
            >
              {product.category.name}
            </Link>
            <span className="text-ink/25">/</span>
            <span className="font-medium text-ink">{product.name}</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <PackShot
                name={product.name}
                categorySlug={product.category.slug}
                className="aspect-square w-full rounded-[26px] border border-ink/10 shadow-soft"
              />
              <div className="mt-3 flex items-start justify-between gap-4 rounded-2xl border border-ink/10 bg-cream px-4 py-3">
                <p className="text-[11px] leading-5 text-ink-muted">
                  Visual representation only. Print, material and finish are
                  confirmed through an approved artwork proof.
                </p>
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="shrink-0 text-[11px] font-semibold text-brand-700"
                >
                  Category
                </Link>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-700">
                  {product.category.name}
                </span>
                {product.featured && (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                    Popular format
                  </span>
                )}
              </div>

              <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.03] tracking-[-0.045em] text-ink sm:text-5xl">
                {product.name}
              </h1>
              {product.application && (
                <p className="mt-3 text-sm font-medium text-ink-muted">
                  For {product.application.toLowerCase()}
                </p>
              )}
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-ink-muted">
                {product.description}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-ink/10 py-5">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                    Pricing
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-ink">
                    {selectedVariant
                      ? formatPrice(selectedVariant.pricePaise)
                      : "On request"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                    MOQ
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-ink">
                    {selectedVariant?.moq
                      ? `${selectedVariant.moq} ${selectedVariant.uom}`
                      : "On request"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                    Formats
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-ink">
                    {product.variants.length}
                  </p>
                </div>
              </div>

              {product.variants.length > 1 && (
                <div className="mt-6">
                  <p className="field-label">Choose a format</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <Link
                        key={variant.id}
                        href={`/products/${product.slug}?variant=${variant.id}#specifications`}
                        className={cn(
                          "rounded-xl border px-3.5 py-2.5 text-[12px] font-medium transition",
                          selectedVariant?.id === variant.id
                            ? "border-ink bg-ink text-white"
                            : "border-ink/15 bg-white text-ink-muted hover:border-ink/40 hover:text-ink",
                        )}
                      >
                        {variant.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {selectedVariant && (
                <div className="mt-6 grid gap-3 rounded-2xl border border-ink/10 bg-cream p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                      Selected
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-ink">
                      {selectedVariant.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                      Dimensions
                    </p>
                    <p className="mt-1 text-[12px] text-ink">
                      {dimensionsLabel(selectedVariant) ?? "On request"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                      SKU
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-ink">
                      {selectedVariant.sku}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href={quoteHref} className="btn-primary flex-1">
                  Request a quote
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href={sampleHref} className="btn-secondary flex-1">
                  Request a sample
                </Link>
              </div>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
                {[
                  "Spec confirmed before print",
                  "Artwork proof approval",
                  "Batch-level dispatch records",
                ].map((item) => (
                  <p
                    key={item}
                    className="flex items-start gap-2 text-[10px] leading-4 text-ink-muted"
                  >
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                    {item}
                  </p>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3">
                <Phone className="h-4 w-4 text-brand-600" />
                <p className="text-[12px] text-ink-muted">
                  Need help specifying?{" "}
                  <a
                    href={`tel:${content["contact.phone"].replace(/\s/g, "")}`}
                    className="font-semibold text-ink"
                  >
                    {content["contact.phone"]}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="specifications" className="container-page py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
          <div>
            <p className="eyebrow">Specifications</p>
            <h2 className="section-title mt-2.5">
              The detail behind the pack.
            </h2>
            <p className="lede mt-3 max-w-xl">
              Values marked “on request” or “confirmed at costing” are deliberate
              — they depend on the film structure, artwork and filling line, and
              are not guessed here.
            </p>

            <div className="mt-7 overflow-hidden rounded-2xl border border-ink/10 bg-white">
              <dl className="divide-y divide-ink/10">
                {specRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[0.9fr_1.1fr] gap-4 px-5 py-3.5"
                  >
                    <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-muted">
                      {label}
                    </dt>
                    <dd className="text-[13px] font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-ink/10 bg-ink p-6 text-white">
              <Shield className="h-5 w-5 text-brand-300" />
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em]">
                What we need to quote
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  "Pack format and approximate quantity",
                  "Fill weight, dimensions or existing sample",
                  "Artwork status (ready / needs adaptation)",
                  "Delivery city and required date",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[12px] leading-5 text-white/65"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={quoteHref}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[12px] font-semibold text-ink transition hover:bg-brand-50"
              >
                Send the brief
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-white p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                Product master
              </p>
              <p className="mt-2 text-[12px] leading-5 text-ink-muted">
                This page is rendered from the same product master used by the
                admin, quotation and catalogue workflows. Publishing a change in
                admin updates this URL.
              </p>
              <Link
                href="/admin/login"
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-700"
              >
                Admin sign in
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-y border-ink/10 bg-white">
          <div className="container-page py-14 sm:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Related formats</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink sm:text-3xl">
                  Keep the pack system consistent.
                </h2>
              </div>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink"
              >
                See all {product.category.name.toLowerCase()}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <ProductCard key={item.id} product={item} index={index + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      <QuoteBand
        phone={content["contact.phone"]}
        title={`Need ${product.name.toLowerCase()} in a specific size?`}
        description="Share your dimensions, fill weight and artwork status. We will confirm the feasible structure, MOQ and per-unit cost."
      />
    </>
  );
}
