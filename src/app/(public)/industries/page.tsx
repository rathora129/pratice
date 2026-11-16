import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "@/components/icons";
import { PackShot } from "@/components/pack-shot";
import { QuoteBand } from "@/components/quote-band";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Packaging formats for food and FMCG, spices, dry fruits, wellness, personal care, beverages and e-commerce brands.",
};

const industries = [
  {
    name: "Food & snacks",
    slug: "stand-up-pouches",
    body: "High-impact pouches and pillow packs for namkeen, snacks, coffee and ready-to-eat formats, with barrier options confirmed against shelf life.",
    formats: [
      { label: "Stand-up pouches", category: "stand-up-pouches" },
      { label: "Pillow pouches", category: "centre-seal-pouches" },
      { label: "Laminated rolls", category: "laminated-rolls" },
    ],
    tone: 0,
  },
  {
    name: "Spices & masala",
    slug: "centre-seal-pouches",
    body: "Centre-seal and stand-up formats that hold strong colour, handle fine powders and keep the pack rigid on shelf.",
    formats: [
      { label: "Centre-seal pouches", category: "centre-seal-pouches" },
      { label: "Stand-up pouches", category: "stand-up-pouches" },
      { label: "Three-side seal", category: "three-side-seal-pouches" },
    ],
    tone: 4,
  },
  {
    name: "Dry fruits & nuts",
    slug: "stand-up-pouches",
    body: "Window and zip formats for premium dry fruit packs, paired with labels that keep the range family consistent.",
    formats: [
      { label: "Stand-up pouches", category: "stand-up-pouches" },
      { label: "Printed labels", category: "printed-labels" },
      { label: "Paper pouches", category: "paper-packaging" },
    ],
    tone: 1,
  },
  {
    name: "Pharma & wellness",
    slug: "three-side-seal-pouches",
    body: "Compact sachets, labels and sealed formats with documented specification and batch traceability for regulated categories.",
    formats: [
      { label: "Three-side seal", category: "three-side-seal-pouches" },
      { label: "Printed labels", category: "printed-labels" },
      { label: "Shrink sleeves", category: "shrink-sleeves" },
    ],
    tone: 2,
  },
  {
    name: "Personal care",
    slug: "printed-labels",
    body: "Labels and sleeves that make small bottles and jars feel considered, with short digital runs for range launches and testing.",
    formats: [
      { label: "Printed labels", category: "printed-labels" },
      { label: "Shrink sleeves", category: "shrink-sleeves" },
      { label: "Stand-up pouches", category: "stand-up-pouches" },
    ],
    tone: 3,
  },
  {
    name: "E-commerce",
    slug: "courier-bags",
    body: "Tamper-proof mailers and branded packaging that protect the product and carry the brand through the last mile.",
    formats: [
      { label: "Courier bags", category: "courier-bags" },
      { label: "Printed labels", category: "printed-labels" },
      { label: "Corrugated", category: "corrugated-packaging" },
    ],
    tone: 5,
  },
];

export default async function IndustriesPage() {
  const content = await getSiteContent();

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/10 bg-white">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container-page relative py-12 sm:py-16">
          <p className="eyebrow">Industries</p>
          <div className="mt-3 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[3.8rem]">
              The pack has to work where the product lives.
            </h1>
            <p className="lede max-w-xl">
              Shelf, kitchen, bathroom or last-mile mailer — the right format
              changes with the category. Start with the application, then specify
              the structure.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry, index) => (
            <article
              key={industry.name}
              className="group flex flex-col overflow-hidden rounded-[22px] border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <PackShot
                name={industry.name}
                categorySlug={industry.slug}
                tone={industry.tone ?? index}
                className="h-[150px] w-full"
              />
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
                  {industry.name}
                </h2>
                <p className="mt-2 text-[12px] leading-6 text-ink-muted">
                  {industry.body}
                </p>
                <div className="mt-5 space-y-2 border-t border-ink/10 pt-4">
                  {industry.formats.map((format) => (
                    <Link
                      key={format.label}
                      href={`/products?category=${format.category}`}
                      className="flex items-center justify-between text-[11px] font-medium text-ink-muted transition hover:text-ink"
                    >
                      {format.label}
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-[11px] leading-6 text-ink-muted">
          Not sure which format fits? Send the product, fill weight and how it
          will be sold. We will recommend a shortlist and flag what needs testing
          before a full production run.
        </p>
      </section>

      <QuoteBand
        phone={content["contact.phone"]}
        title="Tell us how the product is sold."
        description="Retail shelf, e-commerce mailer or food-service pack — the channel changes the specification. Share the use case and we will narrow the format."
      />
    </>
  );
}
