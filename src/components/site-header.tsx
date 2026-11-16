import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ArrowUpRight, ChevronDown, Mail, Phone } from "@/components/icons";
import type { SiteContent } from "@/lib/content";

const navigation = [
  { label: "Products", href: "/products" },
  { label: "Industries", href: "/industries" },
  { label: "Quality", href: "/quality" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader({ content }: { content: SiteContent }) {
  return (
    <header className="sticky top-0 z-50">
      <div className="hidden border-b border-white/10 bg-ink text-white/70 md:block">
        <div className="container-page flex h-9 items-center justify-between text-[11px] tracking-wide">
          <p>Flexible packaging · Labels · Shrink sleeves · New Delhi, India</p>
          <div className="flex items-center gap-5">
            <a
              className="inline-flex items-center gap-1.5 transition hover:text-white"
              href={`tel:${content["contact.phone"].replace(/\s/g, "")}`}
            >
              <Phone className="h-3.5 w-3.5" />
              {content["contact.phone"]}
            </a>
            <a
              className="inline-flex items-center gap-1.5 transition hover:text-white"
              href={`mailto:${content["contact.email"]}`}
            >
              <Mail className="h-3.5 w-3.5" />
              {content["contact.email"]}
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-ink/10 bg-cream/90 backdrop-blur-xl">
        <div className="container-page flex h-[70px] items-center justify-between gap-5">
          <Link href="/" aria-label="Stark Packmate home">
            <BrandMark />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] font-medium text-ink-muted transition hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/request-a-quote" className="btn-primary hidden sm:inline-flex">
              Request a quote
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <details className="group relative lg:hidden">
              <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-ink/15 bg-white/60 text-ink [&::-webkit-details-marker]:hidden">
                <span className="sr-only">Open menu</span>
                <span className="flex flex-col gap-1">
                  <span className="h-[1.5px] w-4 bg-current" />
                  <span className="h-[1.5px] w-4 bg-current" />
                </span>
              </summary>
              <div className="absolute right-0 top-12 w-[258px] rounded-2xl border border-ink/10 bg-cream p-3 shadow-lift">
                <nav className="flex flex-col" aria-label="Mobile">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-white"
                    >
                      {item.label}
                      <ArrowUpRight className="h-4 w-4 text-ink/40" />
                    </Link>
                  ))}
                </nav>
                <Link href="/request-a-quote" className="btn-primary mt-2 w-full">
                  Request a quote
                </Link>
                <p className="mt-3 flex items-center justify-center gap-1.5 px-2 text-[11px] text-ink-muted">
                  <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                  {content["contact.phone"]}
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
