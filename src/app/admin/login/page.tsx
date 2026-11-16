import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Check } from "@/components/icons";
import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getCurrentUser()) {
    redirect("/admin");
  }

  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-grid opacity-[0.12]" />
        <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-sand-300/10 blur-3xl" />

        <div className="relative">
          <BrandMark inverted />
        </div>

        <div className="relative max-w-lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-300">
            Stark Packmate operations
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-5xl">
            One workspace for the pack and the business behind it.
          </h1>
          <p className="mt-5 text-sm leading-7 text-white/55">
            Products published here appear on the public catalogue. Enquiries
            arrive in the lead inbox. Homepage content is edited in the same
            place.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Product master with variants and specifications",
              "Website content linked to the live public pages",
              "Website enquiries captured as trackable CRM leads",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-[12px] text-white/65"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-brand-300">
                  <Check className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[10px] text-white/30">
          Phase 3 build · Role-based access · CRM · Audit trail
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-[390px]">
          <div className="lg:hidden">
            <BrandMark />
          </div>

          <div className="mt-8 lg:mt-0">
            <p className="eyebrow">Admin access</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink">
              Sign in to the workspace.
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-ink-muted">
              Sign in with your work email. Each role sees only the modules it
              is allowed to use.
            </p>
          </div>

          <div className="mt-7 rounded-2xl border border-ink/10 bg-white p-6 shadow-soft sm:p-7">
            <LoginForm />
          </div>

          <div className="mt-5 rounded-xl border border-ink/10 bg-white/70 px-4 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink/40">
              Demo accounts
            </p>
            <ul className="mt-2 space-y-1 font-mono text-[10px] leading-4 text-ink-muted">
              <li>owner@starkpackmate.com · Business Owner</li>
              <li>website@starkpackmate.com · Website Manager</li>
              <li>sales@starkpackmate.com · Sales Executive</li>
              <li>accounts@starkpackmate.com · Accounts Manager</li>
            </ul>
            <p className="mt-2 text-[10px] leading-4 text-ink-muted">
              All demo accounts share the seeded password. Full list in
              README.md.
            </p>
          </div>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold text-ink-muted transition hover:text-ink"
          >
            Back to the public website
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-[10px] leading-5 text-amber-900">
              This build enforces permissions on the server, but MFA, SSO,
              rate limiting and session revocation are still Phase 3 security
              work. Do not expose it to the public internet yet.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
