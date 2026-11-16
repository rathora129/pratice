import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Layers,
  Leaf,
  Shield,
  Sparkle,
} from "@/components/icons";
import { CategoryTile } from "@/components/category-tile";
import { PackShot } from "@/components/pack-shot";
import { ProductCard } from "@/components/product-card";
import { QuoteBand } from "@/components/quote-band";
import { SectionHeading } from "@/components/section-heading";
import { getSiteContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const capabilities = [
  {
    icon: Sparkle,
    title: "Short runs, without the compromise",
    body: "Digital print for launches and artwork changes, rotogravure for repeat runs where colour consistency and unit economics matter.",
  },
  {
    icon: Layers,
    title: "One partner across formats",
    body: "Pouches, labels, sleeves, rolls and mailers specified together — so your pack system feels considered, not assembled.",
  },
  {
    icon: Shield,
    title: "Specifications before print",
    body: "Dimensions, film structure, MOQ and artwork are confirmed and costed before a job is released to production.",
  },
];

const process = [
  {
    step: "01",
    title: "Share the brief",
    body: "Tell us the product, fill weight, pack format and quantity. Artwork can come later.",
  },
  {
    step: "02",
    title: "Spec & cost",
    body: "We confirm dimensions, structure and print route, then build a transparent per-unit cost.",
  },
  {
    step: "03",
    title: "Proof & approve",
    body: "Artwork, colour and dielines are signed off before production begins.",
  },
  {
    step: "04",
    title: "Produce & dispatch",
    body: "Jobs move through print, lamination, conversion and inspection with recorded checkpoints.",
  },
];

const industries = [
  "Food & FMCG",
  "Spices & dry fruits",
  "Pharma & wellness",
  "Personal care",
  "Beverages",
  "E-commerce",
];

export default async function HomePage() {
  const [content, categories, featured, publishedCount] = await Promise.all([
    getSiteContent(),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        products: { where: { status: "published" }, select: { id: true } },
      },
    }),
    prisma.product.findMany({
      where: { status: "published", featured: true },
      include: {
        category: true,
        variants: {
          where: { status: "active" },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 6,
    }),
    prisma.product.count({ where: { status: "published" } }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/10">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="absolute inset-0 bg-grid opacity-[0.35]" />
        <div className="container-page relative grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:py-24">
          <div className="animate-fade-up">
            <p className="eyebrow">{content["hero.eyebrow"]}</p>
            <h1 className="display-title mt-4">{content["hero.title"]}</h1>
            <p className="lede mt-6 max-w-xl">{content["hero.subtitle"]}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/request-a-quote" className="btn-primary">
                {content["hero.primary_label"]}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/products" className="btn-secondary">
                {content["hero.secondary_label"]}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-6 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Based in Mayapuri, New Delhi · Serving brands across India
            </p>

            <dl className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-6 border-t border-ink/10 pt-7 sm:grid-cols-4">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                  Years
                </dt>
                <dd className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-ink">
                  {content["stats.years"]}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                  Projects
                </dt>
                <dd className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-ink">
                  {content["stats.projects"]}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                  Marketplace
                </dt>
                <dd className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-ink">
                  {content["stats.rating"]}
                </dd>
                <p className="mt-0.5 text-[10px] text-ink-muted">
                  {content["stats.rating_label"]}
                </p>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                  Catalogue
                </dt>
                <dd className="mt-1.5 text-2xl font-semibold tracking-[-0.04em] text-ink">
                  {publishedCount}
                </dd>
                <p className="mt-0.5 text-[10px] text-ink-muted">live products</p>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[480px] lg:max-w-none">
            <div className="absolute -inset-3 rotate-[2.5deg] rounded-[34px] border border-ink/10 bg-sand-100/70" />
            <PackShot
              name="Stand-Up Pouch"
              categorySlug="stand-up-pouches"
              tone={0}
              className="relative aspect-[4/4.4] w-full rounded-[28px] border border-ink/10 shadow-lift"
            />

            <div className="absolute -left-3 bottom-6 w-[190px] rounded-2xl border border-ink/10 bg-white/95 p-4 shadow-lift backdrop-blur sm:-left-8 sm:bottom-10">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                Typical response
              </p>
              <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-ink">
                1 business day
              </p>
              <p className="mt-1 text-[10px] leading-4 text-ink-muted">
                with a specification-led next step
              </p>
            </div>

            <div className="absolute -right-2 top-6 flex items-center gap-2 rounded-full border border-ink/10 bg-ink px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-lift sm:-right-5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              Digital · Rotogravure
            </div>

            <div className="absolute -bottom-5 right-3 flex items-center gap-2 rounded-full border border-ink/10 bg-white/90 px-3 py-1.5 text-[10px] font-medium text-ink-muted shadow-soft backdrop-blur sm:right-6">
              <Check className="h-3 w-3 text-emerald-600" />
              Dieline-checked before print
            </div>
          </div>
        </div>

        <div className="border-t border-ink/10 bg-white/45">
          <div className="container-page flex flex-wrap items-center gap-x-7 gap-y-2 py-4">
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ink/35">
              Built for
            </span>
            {industries.map((industry) => (
              <span
                key={industry}
                className="text-[11px] font-medium text-ink-muted"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Catalogue"
          title="Formats for every shelf."
          description="A focused range of flexible packaging, labels and mailers — each one quoted against your actual specification."
          action={{ label: "View all products", href: "/products" }}
        />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <CategoryTile
              key={category.id}
              name={category.name}
              slug={category.slug}
              description={category.description}
              index={index}
              productCount={category.products.length}
            />
          ))}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white">
        <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Why Stark Packmate</p>
            <h2 className="section-title mt-3">{content["home.about_title"]}</h2>
            <p className="lede mt-4">{content["home.about_body"]}</p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-ink/10 bg-cream p-4">
                <p className="text-2xl font-semibold tracking-[-0.04em] text-ink">
                  {String(categories.length).padStart(2, "0")}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-ink-muted">
                  packaging categories under one roof
                </p>
              </div>
              <div className="rounded-2xl border border-ink/10 bg-cream p-4">
                <p className="text-2xl font-semibold tracking-[-0.04em] text-ink">
                  {content["stats.rating"]}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-ink-muted">
                  marketplace rating from public listings
                </p>
              </div>
            </div>

            <Link
              href="/about"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-brand-700"
            >
              More about the company
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3">
            {capabilities.map((capability, index) => {
              const Icon = capability.icon;

              return (
                <div
                  key={capability.title}
                  className="group flex gap-4 rounded-2xl border border-ink/10 bg-cream p-5 transition hover:border-ink/20 hover:bg-white sm:p-6"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
                        {capability.title}
                      </h3>
                      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/30">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-6 text-ink-muted">
                      {capability.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Selected formats"
          title="Start with a proven pack."
          description="These are the formats buyers ask for most often. Every product page carries the specs we have verified so far — and a direct route to costing."
          action={{ label: "Browse the catalogue", href: "/products" }}
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white">
        <div className="container-page py-16 sm:py-20">
          <SectionHeading
            eyebrow="How it works"
            title="A clear path from idea to dispatch."
            description="No black boxes. You know what is being quoted, what is being printed and what happens next."
          />
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((item) => (
              <div key={item.step} className="flex flex-col bg-cream p-6">
                <span className="text-[11px] font-semibold tracking-[0.14em] text-brand-700">
                  {item.step}
                </span>
                <h3 className="mt-5 text-[15px] font-semibold tracking-[-0.02em] text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-[12px] leading-5 text-ink-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-[28px] border border-ink/10 bg-sand-100 px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="eyebrow">Quality approach</p>
              <h2 className="section-title mt-3">
                Print consistency is a system, not a lucky run.
              </h2>
              <p className="lede mt-4 max-w-xl">
                Jobs are checked against the approved artwork and specification
                at incoming, in-process and final stages. The operating platform
                records each checkpoint so a batch can be traced back.
              </p>
              <Link
                href="/quality"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-brand-700"
              >
                See the quality approach
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3">
              {[
                "Incoming material and artwork check",
                "In-process print and seal inspection",
                "Final inspection before dispatch release",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white/75 px-4 py-3.5 text-[13px] font-medium text-ink shadow-sm"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </div>
              ))}
              <p className="mt-1 flex items-center gap-2 px-1 text-[10px] text-ink-muted">
                <Leaf className="h-3.5 w-3.5" />
                Certification and compliance documents available on request.
              </p>
            </div>
          </div>
        </div>
      </section>

      <QuoteBand phone={content["contact.phone"]} />
    </>
  );
}
