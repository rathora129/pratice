import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "@/components/icons";
import type { SiteContent } from "@/lib/content";

const columns = [
  {
    title: "Catalogue",
    links: [
      { label: "All products", href: "/products" },
      { label: "Stand-up pouches", href: "/products?category=stand-up-pouches" },
      { label: "Printed labels", href: "/products?category=printed-labels" },
      { label: "Shrink sleeves", href: "/products?category=shrink-sleeves" },
      { label: "Courier bags", href: "/products?category=courier-bags" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Stark Packmate", href: "/about" },
      { label: "Industries", href: "/industries" },
      { label: "Quality approach", href: "/quality" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Start a project",
    links: [
      { label: "Request a quote", href: "/request-a-quote" },
      { label: "Request a sample", href: "/request-a-quote?type=sample" },
      { label: "Admin sign in", href: "/admin/login" },
    ],
  },
];

export function SiteFooter({ content }: { content: SiteContent }) {
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 bg-grid opacity-[0.09]" />
      <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />

      <div className="container-page relative py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <BrandMark inverted />
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              Flexible packaging, labels and sleeves for brands that care how
              they show up on shelf. Based in Mayapuri, New Delhi.
            </p>
            <Link
              href="/request-a-quote"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-brand-50"
            >
              Start a packaging brief
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-white/70 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href={`tel:${content["contact.phone"].replace(/\s/g, "")}`}
            className="flex items-start gap-3 text-sm text-white/65 transition hover:text-white"
          >
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
            {content["contact.phone"]}
          </a>
          <a
            href={`mailto:${content["contact.email"]}`}
            className="flex items-start gap-3 text-sm text-white/65 transition hover:text-white"
          >
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
            {content["contact.email"]}
          </a>
          <p className="flex items-start gap-3 text-sm leading-6 text-white/65">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
            {content["contact.address"]}
          </p>
          <p className="flex items-start gap-3 text-sm text-white/65">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
            {content["contact.hours"]}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Stark Packmate Pvt. Ltd. All rights
            reserved.
          </p>
          <p>
            Specifications, MOQ and pricing are confirmed against your approved
            artwork and film structure.
          </p>
        </div>
      </div>
    </footer>
  );
}
