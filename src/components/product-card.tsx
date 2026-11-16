import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { PackShot } from "@/components/pack-shot";
import { dimensionsLabel } from "@/lib/utils";

export type ProductCardData = {
  name: string;
  slug: string;
  application: string | null;
  category: { name: string; slug: string };
  variants: Array<{
    name: string;
    widthMm: number | null;
    heightMm: number | null;
    gussetMm: number | null;
    moq: number | null;
    uom: string;
  }>;
};

export function ProductCard({
  product,
  index = 0,
}: {
  product: ProductCardData;
  index?: number;
}) {
  const firstVariant = product.variants[0];
  const dimensions = firstVariant ? dimensionsLabel(firstVariant) : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[22px] border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-lift"
    >
      <PackShot
        name={product.name}
        categorySlug={product.category.slug}
        tone={index}
        className="aspect-[4/3] w-full transition duration-500 group-hover:scale-[1.015]"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
            {product.category.name}
          </p>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-ink-muted transition group-hover:border-ink group-hover:bg-ink group-hover:text-white">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
        <h3 className="mt-2.5 text-[17px] font-semibold leading-snug tracking-[-0.02em] text-ink">
          {product.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-ink-muted">
          {product.application ?? "Custom-engineered to your specification."}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
          <span className="text-[11px] text-ink-muted">
            {product.variants.length}{" "}
            {product.variants.length === 1 ? "format" : "formats"}
            {dimensions ? ` · ${dimensions.replace(" gusset", "")}` : ""}
          </span>
          <span className="text-[11px] font-semibold text-ink">
            Price on request
          </span>
        </div>
      </div>
    </Link>
  );
}
