import Link from "next/link";
import { ArrowUpRight, Phone } from "@/components/icons";

export function QuoteBand({
  phone,
  title = "Have a pack in mind? Let’s cost it properly.",
  description = "Send dimensions, fill weight and artwork status. We will come back with a specification-led proposal, not a rough guess.",
}: {
  phone: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-[28px] bg-ink px-6 py-10 text-white sm:px-12 sm:py-14">
        <div className="absolute inset-0 bg-grid opacity-[0.12]" />
        <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-sand-300/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-300">
              Start a packaging brief
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-[1.06] tracking-[-0.04em] sm:text-4xl lg:text-[2.9rem]">
              {title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
              {description}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
            <Link
              href="/request-a-quote"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-ink transition hover:bg-brand-50"
            >
              Request a quote
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3.5 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              <Phone className="h-4 w-4" />
              {phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
