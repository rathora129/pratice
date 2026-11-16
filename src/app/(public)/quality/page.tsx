import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Check, Shield } from "@/components/icons";
import { QuoteBand } from "@/components/quote-band";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Quality approach",
  description:
    "How Stark Packmate approaches quality control: incoming checks, in-process inspection, final inspection and dispatch release.",
};

export const dynamic = "force-dynamic";

const gates = [
  {
    step: "01",
    title: "Incoming material check",
    body: "Film, substrate and purchased components are checked against the approved specification before a job is released to production.",
    checks: ["Material reference", "Width and core", "Artwork version"],
  },
  {
    step: "02",
    title: "In-process inspection",
    body: "Print, lamination and conversion checkpoints catch drift while the job is running, not after the full quantity is complete.",
    checks: ["Colour against proof", "Registration", "Seal integrity"],
  },
  {
    step: "03",
    title: "Final inspection",
    body: "The finished pack is checked for dimensions, print defects, seal strength and count before packing.",
    checks: ["Dimensional check", "Defect classification", "Packing count"],
  },
  {
    step: "04",
    title: "Dispatch release",
    body: "A job moves to dispatch only after the quality gate is cleared and the approved quantity is reconciled.",
    checks: ["Batch record", "Release approval", "Dispatch documentation"],
  },
];

export default async function QualityPage() {
  const content = await getSiteContent();

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/10 bg-white">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container-page relative py-12 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="eyebrow">Quality approach</p>
              <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[3.8rem]">
                Quality is a release gate, not a promise.
              </h1>
              <p className="lede mt-5 max-w-xl">
                Packaging failures rarely announce themselves. We build checks
                into the route so a defect is caught at the next gate — and the
                record of what was checked stays attached to the job.
              </p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-cream p-5">
              <Shield className="h-5 w-5 text-brand-700" />
              <p className="mt-3 text-[13px] font-semibold text-ink">
                Dispatch is blocked when quality is open.
              </p>
              <p className="mt-1.5 text-[12px] leading-5 text-ink-muted">
                In the operating platform, an unresolved inspection holds the
                dispatch step until an authorised resolution is recorded.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <div className="grid gap-px overflow-hidden rounded-[24px] border border-ink/10 bg-ink/10 md:grid-cols-2">
          {gates.map((gate) => (
            <article key={gate.step} className="bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                  Gate {gate.step}
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-[10px] font-semibold text-ink-muted">
                  {gate.step}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-ink">
                {gate.title}
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-ink-muted">
                {gate.body}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {gate.checks.map((check) => (
                  <li
                    key={check}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-cream px-3 py-1.5 text-[10px] font-medium text-ink-muted"
                  >
                    <Check className="h-3 w-3 text-emerald-600" />
                    {check}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="eyebrow">Traceability</p>
            <h2 className="section-title mt-2.5">
              What gets recorded with the job.
            </h2>
            <p className="lede mt-3">
              A batch is only useful if you can trace it. The production record
              links the approved specification, material consumed, inspection
              results and dispatch documents for the order.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-brand-700"
            >
              Ask about a specific requirement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white p-6">
            {[
              "Approved artwork and dieline version",
              "Material and batch references",
              "In-process and final inspection results",
              "Packing count and dispatch documents",
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-center justify-between gap-4 border-b border-ink/10 py-3.5 last:border-0"
              >
                <p className="text-[12px] text-ink-muted">{item}</p>
                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/30">
                  0{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-[11px] leading-5 text-amber-900">
            Certification and compliance documents are not reproduced on this
            website. If your category requires a specific certificate, ask the
            team for the current verified copy before placing an order.
          </p>
        </div>
      </section>

      <QuoteBand
        phone={content["contact.phone"]}
        title="Have a quality requirement to match?"
        description="Share the standard, test method or customer specification. We will confirm what can be checked in-process and what needs to be agreed before production."
      />
    </>
  );
}
