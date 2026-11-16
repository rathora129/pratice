import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-cream">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="container-page relative flex flex-1 flex-col">
        <div className="py-6">
          <Link href="/" aria-label="Stark Packmate home">
            <BrandMark />
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center py-16">
          <p className="eyebrow">404 · Page not found</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-6xl">
            This pack is not on the shelf.
          </h1>
          <p className="lede mt-4 max-w-md">
            The page may have moved, the product may be unpublished, or the URL
            might be wrong. The catalogue is the best place to restart.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary">
              Browse the catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="btn-secondary">
              Back to home
            </Link>
          </div>
        </div>

        <p className="border-t border-ink/10 py-5 text-[10px] text-ink-muted">
          Stark Packmate · Mayapuri, New Delhi
        </p>
      </div>
    </div>
  );
}
