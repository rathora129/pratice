export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatPrice(paise: number | null) {
  if (paise === null) return "On request";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function dimensionsLabel(variant: {
  widthMm: number | null;
  heightMm: number | null;
  gussetMm: number | null;
}) {
  if (!variant.widthMm || !variant.heightMm) return null;

  const base = `${variant.widthMm} × ${variant.heightMm}`;
  return variant.gussetMm
    ? `${base} + ${variant.gussetMm} mm gusset`
    : `${base} mm`;
}

export function statusTone(status: string) {
  if (status === "published" || status === "active" || status === "won") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "draft" || status === "new") {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }

  if (status === "archived" || status === "lost") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  return "bg-slate-50 text-slate-600 border-slate-200";
}

export function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}
