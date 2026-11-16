import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { PackShot } from "@/components/pack-shot";

export function CategoryTile({
  name,
  slug,
  description,
  index,
  productCount,
}: {
  name: string;
  slug: string;
  description: string;
  index: number;
  productCount: number;
}) {
  return (
    <Link
      href={`/products?category=${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <PackShot
        name={name}
        categorySlug={slug}
        tone={index}
        className="h-[120px] w-full transition duration-500 group-hover:scale-[1.02]"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.02em] text-ink">
            {name}
          </h3>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-ink/35 transition group-hover:text-ink" />
        </div>
        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-ink-muted">
          {description}
        </p>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40">
          {productCount} {productCount === 1 ? "product" : "products"}
        </p>
      </div>
    </Link>
  );
}
