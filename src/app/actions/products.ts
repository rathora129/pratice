"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import type { ProductFormState, VariantFormState } from "@/lib/form-state";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { slugify } from "@/lib/utils";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().max(500).nullable().optional(),
);

const optionalInt = z.preprocess(
  (value) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? Math.trunc(number) : value;
  },
  z.number().int().positive().nullable(),
);

const optionalMoney = z.preprocess(
  (value) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number * 100) : value;
  },
  z.number().int().nonnegative().nullable(),
);

const productSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(2, "Enter a product name."),
  code: z
    .string()
    .trim()
    .min(2, "Enter a product code.")
    .transform((value) => value.toUpperCase()),
  slug: z.string().trim().optional(),
  categoryId: z.string().trim().min(1, "Choose a category."),
  description: z
    .string()
    .trim()
    .min(10, "Write at least a short product description."),
  application: optionalText,
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean(),
  seoTitle: optionalText,
  seoDescription: optionalText,
});

const variantSchema = z.object({
  id: z.string().trim().optional(),
  productId: z.string().trim().min(1),
  sku: z
    .string()
    .trim()
    .min(3, "Enter a SKU.")
    .max(48, "Keep the SKU under 48 characters.")
    .regex(/^[A-Za-z0-9][A-Za-z0-9._/-]*$/, "Use letters, numbers, dot, slash or hyphen.")
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2, "Describe the variant."),
  widthMm: optionalInt,
  heightMm: optionalInt,
  gussetMm: optionalInt,
  thicknessMicron: optionalInt,
  material: optionalText,
  printingMethod: optionalText,
  colourCount: optionalInt,
  lamination: optionalText,
  finish: optionalText,
  closure: optionalText,
  moq: optionalInt,
  uom: z.string().trim().min(1).max(16),
  pricePaise: optionalMoney,
  status: z.enum(["active", "archived"]),
});

function fieldErrors(issues: z.ZodIssue[]) {
  const result: Record<string, string> = {};

  for (const issue of issues) {
    const field = String(issue.path[0] ?? "form");
    result[field] ??= issue.message;
  }

  return result;
}

async function refreshProduct(productId: string, slug: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}

export async function saveProduct(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const user = await requireUser();
  const isCreate = !String(formData.get("id") ?? "").trim();

  if (!can(user.role, "products", isCreate ? "create" : "update")) {
    return {
      status: "error",
      message: "Your role does not include product editing.",
    };
  }

  const parsed = productSchema.safeParse({
    id: String(formData.get("id") ?? "").trim() || undefined,
    name: formData.get("name"),
    code: formData.get("code"),
    slug: formData.get("slug") ?? "",
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    application: formData.get("application") ?? "",
    status: formData.get("status") ?? "draft",
    featured: formData.get("featured") === "on",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.name);

  if (!slug) {
    return {
      status: "error",
      message: "Give the product a URL slug.",
      fieldErrors: { slug: "Use letters or numbers." },
    };
  }

  let savedId = data.id ?? "";
  let savedSlug = slug;
  let previousStatus: string | null = null;

  try {
    if (data.id) {
      const existing = await prisma.product.findUnique({
        where: { id: data.id },
        include: { variants: { where: { status: "active" } } },
      });

      if (!existing) {
        return { status: "error", message: "This product no longer exists." };
      }

      previousStatus = existing.status;

      if (
        data.status !== existing.status &&
        !can(user.role, "products", "publish")
      ) {
        return {
          status: "error",
          message: "Your role cannot change a product's publishing status.",
          fieldErrors: { status: "Publishing is restricted for your role." },
        };
      }

      if (data.status === "published" && existing.variants.length === 0) {
        return {
          status: "error",
          message:
            "Add at least one active variant before publishing this product.",
          fieldErrors: { status: "A published product needs an active variant." },
        };
      }

      const saved = await prisma.product.update({
        where: { id: data.id },
        data: {
          name: data.name,
          code: data.code,
          slug,
          categoryId: data.categoryId,
          description: data.description,
          application: data.application ?? null,
          status: data.status,
          featured: data.featured,
          seoTitle: data.seoTitle ?? null,
          seoDescription: data.seoDescription ?? null,
        },
      });

      savedId = saved.id;
      savedSlug = saved.slug;
    } else {
      const saved = await prisma.product.create({
        data: {
          name: data.name,
          code: data.code,
          slug,
          categoryId: data.categoryId,
          description: data.description,
          application: data.application ?? null,
          status: data.status === "published" ? "draft" : data.status,
          featured: data.featured,
          seoTitle: data.seoTitle ?? null,
          seoDescription: data.seoDescription ?? null,
        },
      });

      savedId = saved.id;
      savedSlug = saved.slug;
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = String(error.meta?.target ?? "");
      return {
        status: "error",
        message:
          target.includes("code")
            ? "That product code is already in use."
            : "That URL slug is already in use.",
        fieldErrors: target.includes("code")
          ? { code: "Already used by another product." }
          : { slug: "Already used by another product." },
      };
    }

    console.error("Failed to save product", error);
    return {
      status: "error",
      message: "The product could not be saved. Please try again.",
    };
  }

  const statusChanged = previousStatus !== null && previousStatus !== data.status;
  const action = isCreate
    ? "product.create"
    : statusChanged
      ? `product.${data.status}`
      : "product.update";

  await recordAudit({
    actor: user,
    action,
    entityType: "product",
    entityId: savedId,
    summary: isCreate
      ? `Created product ${data.code} — ${data.name}`
      : statusChanged
        ? `Changed ${data.code} status from ${previousStatus} to ${data.status}`
        : `Updated product ${data.code} — ${data.name}`,
    metadata: { status: data.status, previousStatus },
  });

  await refreshProduct(savedId, savedSlug);
  redirect(`/admin/products/${savedId}?saved=1`);
}

export async function saveVariant(
  _previousState: VariantFormState,
  formData: FormData,
): Promise<VariantFormState> {
  const user = await requireUser();

  if (!can(user.role, "products", "update")) {
    return {
      status: "error",
      message: "Your role does not include product editing.",
    };
  }

  const parsed = variantSchema.safeParse({
    id: String(formData.get("id") ?? "").trim() || undefined,
    productId: formData.get("productId"),
    sku: formData.get("sku"),
    name: formData.get("name"),
    widthMm: formData.get("widthMm") ?? "",
    heightMm: formData.get("heightMm") ?? "",
    gussetMm: formData.get("gussetMm") ?? "",
    thicknessMicron: formData.get("thicknessMicron") ?? "",
    material: formData.get("material") ?? "",
    printingMethod: formData.get("printingMethod") ?? "",
    colourCount: formData.get("colourCount") ?? "",
    lamination: formData.get("lamination") ?? "",
    finish: formData.get("finish") ?? "",
    closure: formData.get("closure") ?? "",
    moq: formData.get("moq") ?? "",
    uom: formData.get("uom") || "Piece",
    pricePaise: formData.get("price") ?? "",
    status: formData.get("status") || "active",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted variant fields.",
      fieldErrors: fieldErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;

  try {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return { status: "error", message: "This product no longer exists." };
    }

    if (data.id) {
      await prisma.variant.update({
        where: { id: data.id },
        data: {
          sku: data.sku,
          name: data.name,
          widthMm: data.widthMm ?? null,
          heightMm: data.heightMm ?? null,
          gussetMm: data.gussetMm ?? null,
          thicknessMicron: data.thicknessMicron ?? null,
          material: data.material ?? null,
          printingMethod: data.printingMethod ?? null,
          colourCount: data.colourCount ?? null,
          lamination: data.lamination ?? null,
          finish: data.finish ?? null,
          closure: data.closure ?? null,
          moq: data.moq ?? null,
          uom: data.uom,
          pricePaise: data.pricePaise ?? null,
          status: data.status,
        },
      });
    } else {
      await prisma.variant.create({
        data: {
          productId: data.productId,
          sku: data.sku,
          name: data.name,
          widthMm: data.widthMm ?? null,
          heightMm: data.heightMm ?? null,
          gussetMm: data.gussetMm ?? null,
          thicknessMicron: data.thicknessMicron ?? null,
          material: data.material ?? null,
          printingMethod: data.printingMethod ?? null,
          colourCount: data.colourCount ?? null,
          lamination: data.lamination ?? null,
          finish: data.finish ?? null,
          closure: data.closure ?? null,
          moq: data.moq ?? null,
          uom: data.uom,
          pricePaise: data.pricePaise ?? null,
          status: data.status,
        },
      });
    }

    await recordAudit({
      actor: user,
      action: data.id ? "variant.update" : "variant.create",
      entityType: "variant",
      entityId: data.id ?? null,
      summary: `${data.id ? "Updated" : "Added"} variant ${data.sku} on ${product.code}`,
      metadata: { productId: product.id, status: data.status },
    });

    await refreshProduct(product.id, product.slug);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        status: "error",
        message: "That SKU is already in use.",
        fieldErrors: { sku: "Use a unique SKU." },
      };
    }

    console.error("Failed to save variant", error);
    return {
      status: "error",
      message: "The variant could not be saved. Please try again.",
    };
  }

  redirect(`/admin/products/${data.productId}?variantSaved=1`);
}

export async function toggleProductStatus(formData: FormData) {
  const user = await requireUser();

  if (!can(user.role, "products", "publish")) {
    redirect("/admin?denied=products:publish");
  }

  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!id || !["draft", "published", "archived"].includes(next)) {
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: { where: { status: "active" } } },
  });

  if (!product) return;

  if (next === "published" && product.variants.length === 0) {
    redirect(`/admin/products/${id}?error=variant-required`);
  }

  await prisma.product.update({
    where: { id },
    data: { status: next },
  });

  await recordAudit({
    actor: user,
    action: `product.${next}`,
    entityType: "product",
    entityId: product.id,
    summary: `Moved ${product.code} from ${product.status} to ${next}`,
    metadata: { previousStatus: product.status, status: next },
  });

  await refreshProduct(product.id, product.slug);
}

export async function toggleVariantStatus(formData: FormData) {
  const user = await requireUser();

  if (!can(user.role, "products", "update")) {
    redirect("/admin?denied=products:update");
  }

  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!id || !["active", "archived"].includes(next)) return;

  const variant = await prisma.variant.update({
    where: { id },
    data: { status: next },
    include: { product: true },
  });

  await recordAudit({
    actor: user,
    action: next === "archived" ? "variant.archive" : "variant.restore",
    entityType: "variant",
    entityId: variant.id,
    summary: `${next === "archived" ? "Archived" : "Restored"} variant ${variant.sku} on ${variant.product.code}`,
    metadata: { productId: variant.productId, status: next },
  });

  await refreshProduct(variant.product.id, variant.product.slug);
}
