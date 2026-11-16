import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "@/components/icons";
import { ProductForm } from "@/components/admin/product-form";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New product",
};

export default async function NewProductPage() {
  await requirePermission("products", "create");

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-[900px]">
      <nav
        className="flex items-center gap-2 text-[11px] text-ink-muted"
        aria-label="Breadcrumb"
      >
        <Link href="/admin" className="hover:text-ink">
          Admin
        </Link>
        <span className="text-ink/25">/</span>
        <Link href="/admin/products" className="hover:text-ink">
          Products
        </Link>
        <span className="text-ink/25">/</span>
        <span className="font-medium text-ink">New</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-ink">
            Create a product
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-6 text-ink-muted">
            Start with the product record. You will add a variant on the next
            screen — a product cannot be published without one.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted hover:text-ink"
        >
          Back to list
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
