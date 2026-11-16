import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Check } from "@/components/icons";
import { PackShot } from "@/components/pack-shot";
import { QuoteBand } from "@/components/quote-band";
import { getSiteContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Stark Packmate is a New Delhi packaging manufacturer supplying flexible packaging, labels and shrink sleeves to food, FMCG and e-commerce brands.",
};

export default async function AboutPage() {
  const [content, categories] = await Promise.all([
    getSiteContent(),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/10 bg-white">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container-page relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow">About Stark Packmate</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[3.9rem]">
              Packaging, with a point of view.
            </h1>
            <p className="lede mt-5 max-w-xl">
              We make flexible packaging, labels and shrink sleeves for brands
              that care how they show up on shelf — and for teams that need a
              supplier who can explain the specification, not just quote a rate.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Explore the catalogue
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="btn-secondary">
                Contact the team
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <PackShot
                name="Stand-Up Pouch"
                categorySlug="stand-up-pouches"
                tone={0}
                className="aspect-[3/4] rounded-2xl border border-ink/10 shadow-soft"
              />
              <div className="grid gap-3 pt-8">
                <PackShot
                  name="Printed Labels"
                  categorySlug="printed-labels"
                  tone={4}
                  className="aspect-square rounded-2xl border border-ink/10 shadow-soft"
                />
                <PackShot
                  name="Courier Bag"
                  categorySlug="courier-bags"
                  tone={2}
                  className="aspect-square rounded-2xl border border-ink/10 shadow-soft"
                />
              </div>
            </div>
            <div className="absolute -bottom-4 left-5 rounded-xl border border-ink/10 bg-white px-4 py-3 shadow-lift">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-700">
                Based in
              </p>
              <p className="mt-0.5 text-[12px] font-semibold text-ink">
                Mayapuri, New Delhi
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="eyebrow">Company at a glance</p>
            <h2 className="section-title mt-2.5">Verified, not inflated.</h2>
            <p className="lede mt-3">
              These details come from public company records and the existing
              public catalogue. Certifications, capacity and client names are
              published only after verification.
            </p>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-2">
            {[
              ["Legal name", "Stark Packmate Pvt. Ltd."],
              ["CIN", "U21020DL2010PTC201878"],
              ["GSTIN", "07AAOCS1195D1Z8"],
              ["Base", "Mayapuri Industrial Area, New Delhi"],
              ["Public rating", `${content["stats.rating"]} marketplace rating`],
              ["Categories", `${categories.length} packaging formats`],
            ].map(([label, value]) => (
              <div key={label} className="bg-white p-5">
                <dt className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/40">
                  {label}
                </dt>
                <dd className="mt-1.5 text-[13px] font-medium leading-5 text-ink">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white">
        <div className="container-page py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <p className="eyebrow">What we make</p>
              <h2 className="section-title mt-2.5">
                One pack system, many formats.
              </h2>
              <p className="lede mt-3 max-w-lg">
                A pouch, a label and a mailer can carry the same brand — but they
                need to be specified together. Our range is organised so buyers
                can build a consistent pack family instead of buying each piece
                in isolation.
              </p>
            </div>
            <div className="flex flex-wrap content-start gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="rounded-full border border-ink/15 bg-cream px-4 py-2.5 text-[12px] font-medium text-ink transition hover:border-ink/40 hover:bg-white"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <p className="eyebrow">How we operate</p>
        <h2 className="section-title mt-2.5 max-w-2xl">
          Clarity over guesswork.
        </h2>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Specification before price",
              body: "Dimensions, film structure, print route and MOQ are confirmed before a number is put on paper. If something is unknown, we say so.",
            },
            {
              title: "One accountable record",
              body: "The product you see publicly is the same record used by admin, sales and costing — not a disconnected brochure page.",
            },
            {
              title: "A clear release gate",
              body: "Jobs move to dispatch only when the approved specification and quality checkpoints have been met.",
            },
          ].map((item, index) => (
            <div key={item.title} className="rounded-2xl border border-ink/10 bg-white p-6">
              <span className="text-[10px] font-semibold tracking-[0.16em] text-brand-700">
                0{index + 1}
              </span>
              <h3 className="mt-5 text-[16px] font-semibold tracking-[-0.02em] text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-ink-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-ink/10 bg-white px-5 py-4">
          {[
            "Public company details verified",
            "No invented certifications",
            "Specifications marked when indicative",
          ].map((item) => (
            <p key={item} className="flex items-center gap-2 text-[11px] text-ink-muted">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              {item}
            </p>
          ))}
        </div>
      </section>

      <QuoteBand phone={content["contact.phone"]} />
    </>
  );
}
