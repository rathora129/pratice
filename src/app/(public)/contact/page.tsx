import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "@/components/icons";
import { LeadForm } from "@/components/lead-form";
import { getSiteContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to Stark Packmate about flexible packaging, labels and shrink sleeves. Based in Mayapuri, New Delhi.",
};

export default async function ContactPage() {
  const [content, products] = await Promise.all([
    getSiteContent(),
    prisma.product.findMany({
      where: { status: "published" },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink/10">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container-page relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <p className="eyebrow">Contact</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-5xl">
              Talk to the people who will run your job.
            </h1>
            <p className="lede mt-5 max-w-md">
              Share a requirement, ask a specification question or request a
              sample. We will route it to the right person and respond with a
              clear next step.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <a
                href={`tel:${content["contact.phone"].replace(/\s/g, "")}`}
                className="rounded-2xl border border-ink/10 bg-white p-4 transition hover:border-ink/25"
              >
                <Phone className="h-4 w-4 text-brand-600" />
                <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-ink/40">
                  Phone
                </p>
                <p className="mt-1 text-[13px] font-semibold text-ink">
                  {content["contact.phone"]}
                </p>
              </a>
              <a
                href={`mailto:${content["contact.email"]}`}
                className="rounded-2xl border border-ink/10 bg-white p-4 transition hover:border-ink/25"
              >
                <Mail className="h-4 w-4 text-brand-600" />
                <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-ink/40">
                  Email
                </p>
                <p className="mt-1 break-all text-[13px] font-semibold text-ink">
                  {content["contact.email"]}
                </p>
              </a>
            </div>

            <div className="mt-3 rounded-2xl border border-ink/10 bg-white p-4">
              <MapPin className="h-4 w-4 text-brand-600" />
              <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-ink/40">
                Works
              </p>
              <p className="mt-1 text-[13px] leading-6 text-ink">
                {content["contact.address"]}
              </p>
              <p className="mt-2 flex items-center gap-2 text-[11px] text-ink-muted">
                <Clock className="h-3.5 w-3.5" />
                {content["contact.hours"]}
              </p>
            </div>

            <div className="relative mt-5 h-48 overflow-hidden rounded-2xl border border-ink/10 bg-[#e9ede9]">
              <div className="absolute inset-0 bg-grid opacity-70" />
              <div className="absolute left-[18%] top-0 h-full w-[2px] bg-white/80" />
              <div className="absolute left-0 top-[38%] h-[3px] w-full bg-white/80" />
              <div className="absolute right-[22%] top-0 h-full w-[2px] bg-white/60" />
              <div className="absolute right-[8%] top-[22%] h-16 w-20 rounded bg-[#d8dfd8]" />
              <div className="absolute left-[28%] top-[55%] h-14 w-24 rounded bg-[#dde3dd]" />
              <div className="absolute left-[44%] top-[30%] flex -translate-x-1/2 flex-col items-center">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white shadow-lift">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="mt-2 rounded-full border border-ink/10 bg-white px-3 py-1 text-[10px] font-semibold text-ink shadow-sm">
                  Mayapuri · New Delhi
                </span>
              </div>
              <p className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.14em] text-ink/35">
                Illustrative location map
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
            <div className="mb-6 border-b border-ink/10 pb-5">
              <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">
                Send a message
              </h2>
              <p className="mt-1 text-[12px] text-ink-muted">
                Every message becomes a trackable lead in the admin CRM.
              </p>
            </div>
            <LeadForm
              products={products}
              mode="contact"
              source="website · contact"
            />
          </div>
        </div>
      </section>

      <section className="container-page py-12 sm:py-16">
        <div className="rounded-[26px] border border-ink/10 bg-sand-100 p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="eyebrow">Visiting the works</p>
              <h2 className="section-title mt-2 text-2xl sm:text-3xl">
                Plan the visit before you travel.
              </h2>
              <p className="lede mt-3 max-w-lg">
                Works visits are by appointment so the right production and
                quality team members are available. Call or email first and we
                will confirm availability and any safety requirements.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Address", content["contact.address"]],
                ["Hours", content["contact.hours"]],
                ["Phone", content["contact.phone"]],
                ["Email", content["contact.email"]],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-ink/10 bg-white/80 p-4"
                >
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-[12px] leading-5 text-ink">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
