import Link from "next/link";
import type { Metadata } from "next";
import { Check, Clock, Mail, Phone } from "@/components/icons";
import { LeadForm } from "@/components/lead-form";
import { getSiteContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request a quote",
  description:
    "Send your packaging requirement to Stark Packmate. Share format, quantity, dimensions and artwork status for a specification-led quotation.",
};

type SearchParams = Promise<{ product?: string; type?: string }>;

export default async function RequestQuotePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { product, type } = await searchParams;
  const isSample = type === "sample";

  const [products, content] = await Promise.all([
    prisma.product.findMany({
      where: { status: "published" },
      select: { id: true, name: true, slug: true },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    }),
    getSiteContent(),
  ]);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="container-page relative py-10 sm:py-16">
        <nav
          className="flex items-center gap-2 text-[11px] text-ink-muted"
          aria-label="Breadcrumb"
        >
          <Link className="transition hover:text-ink" href="/">
            Home
          </Link>
          <span className="text-ink/25">/</span>
          <span className="font-medium text-ink">
            {isSample ? "Request a sample" : "Request a quote"}
          </span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div className="lg:pt-2">
            <p className="eyebrow">
              {isSample ? "Sample request" : "Start a packaging brief"}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-5xl">
              {isSample
                ? "Hold the pack before you commit."
                : "Tell us what needs to be packed."}
            </h1>
            <p className="lede mt-5 max-w-md">
              {isSample
                ? "Share the format and application. We will confirm whether a physical or printed sample is feasible, what it costs and how long it takes."
                : "A good quotation starts with a clear specification. Give us what you know — dimensions, fill weight, quantity and artwork status — and we will take it from there."}
            </p>

            <div className="mt-8 rounded-2xl border border-ink/10 bg-white/70 p-5 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/40">
                What happens next
              </p>
              <ol className="mt-4 space-y-4">
                {[
                  "We review the brief and flag any missing specification.",
                  "You receive a costed proposal with MOQ and lead-time assumptions.",
                  "Artwork and dielines are approved before production.",
                ].map((item, index) => (
                  <li key={item} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-[10px] font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-[12px] leading-5 text-ink-muted">
                      {item}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 space-y-3">
              <a
                href={`tel:${content["contact.phone"].replace(/\s/g, "")}`}
                className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3 transition hover:border-ink/25"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Phone className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-ink/40">
                    Call
                  </span>
                  <span className="text-[13px] font-semibold text-ink">
                    {content["contact.phone"]}
                  </span>
                </span>
              </a>
              <a
                href={`mailto:${content["contact.email"]}`}
                className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3 transition hover:border-ink/25"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <Mail className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-ink/40">
                    Email
                  </span>
                  <span className="text-[13px] font-semibold text-ink">
                    {content["contact.email"]}
                  </span>
                </span>
              </a>
            </div>

            <p className="mt-5 flex items-center gap-2 text-[10px] text-ink-muted">
              <Clock className="h-3.5 w-3.5" />
              {content["contact.hours"]}
            </p>
          </div>

          <div className="rounded-[26px] border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-ink/10 pb-5">
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">
                  {isSample ? "Sample request" : "Quotation request"}
                </h2>
                <p className="mt-1 text-[12px] text-ink-muted">
                  Fields marked * are required.
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                <Check className="h-3 w-3" />
                Goes to CRM
              </span>
            </div>

            <LeadForm
              products={products}
              defaultProductSlug={product}
              source={isSample ? "website · sample" : "website · quote"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
