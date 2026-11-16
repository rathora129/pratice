"use client";

import { useActionState } from "react";
import { saveVariant } from "@/app/actions/products";
import { initialVariantState } from "@/lib/form-state";

export type VariantFormInitial = {
  id: string;
  sku: string;
  name: string;
  widthMm: number | null;
  heightMm: number | null;
  gussetMm: number | null;
  thicknessMicron: number | null;
  material: string | null;
  printingMethod: string | null;
  colourCount: number | null;
  lamination: string | null;
  finish: string | null;
  closure: string | null;
  moq: number | null;
  uom: string;
  pricePaise: number | null;
  status: string;
};

export function VariantForm({
  productId,
  variant,
}: {
  productId: string;
  variant?: VariantFormInitial;
}) {
  const [state, formAction, isPending] = useActionState(
    saveVariant,
    initialVariantState,
  );
  const errors = state.fieldErrors ?? {};
  const editing = Boolean(variant);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-ink/10 bg-cream p-5 sm:p-6"
    >
      <input type="hidden" name="productId" value={productId} />
      {variant && <input type="hidden" name="id" value={variant.id} />}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-ink">
            {editing ? `Edit ${variant?.name}` : "Add a variant"}
          </h3>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            Each variant carries its own SKU, dimensions, MOQ and price.
          </p>
        </div>
        {editing && (
          <a
            href={`/admin/products/${productId}`}
            className="text-[11px] font-semibold text-brand-700 hover:underline"
          >
            + New variant instead
          </a>
        )}
      </div>

      {state.status === "error" && (
        <p
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] text-red-800"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="field-label" htmlFor="variant-name">
            Variant name
          </label>
          <input
            id="variant-name"
            name="name"
            className="input"
            defaultValue={variant?.name}
            placeholder="240 × 320 + 120 mm"
            required
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="variant-sku">
            SKU
          </label>
          <input
            id="variant-sku"
            name="sku"
            className="input font-mono uppercase"
            defaultValue={variant?.sku}
            placeholder="SP-SUP-240320"
            required
            aria-invalid={Boolean(errors.sku)}
          />
          {errors.sku && <p className="error-text">{errors.sku}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="variant-status">
            Status
          </label>
          <select
            id="variant-status"
            name="status"
            className="select"
            defaultValue={variant?.status ?? "active"}
            key={variant?.status ?? "active"}
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="widthMm">
            Width (mm)
          </label>
          <input
            id="widthMm"
            name="widthMm"
            type="number"
            min="1"
            className="input"
            defaultValue={variant?.widthMm ?? ""}
            placeholder="240"
          />
          {errors.widthMm && <p className="error-text">{errors.widthMm}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="heightMm">
            Height (mm)
          </label>
          <input
            id="heightMm"
            name="heightMm"
            type="number"
            min="1"
            className="input"
            defaultValue={variant?.heightMm ?? ""}
            placeholder="320"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="gussetMm">
            Gusset (mm)
          </label>
          <input
            id="gussetMm"
            name="gussetMm"
            type="number"
            min="1"
            className="input"
            defaultValue={variant?.gussetMm ?? ""}
            placeholder="120"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="thicknessMicron">
            Thickness (micron)
          </label>
          <input
            id="thicknessMicron"
            name="thicknessMicron"
            type="number"
            min="1"
            className="input"
            defaultValue={variant?.thicknessMicron ?? ""}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="material">
            Material / structure
          </label>
          <input
            id="material"
            name="material"
            className="input"
            defaultValue={variant?.material ?? ""}
            placeholder="Structure on request"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="printingMethod">
            Printing method
          </label>
          <input
            id="printingMethod"
            name="printingMethod"
            className="input"
            defaultValue={variant?.printingMethod ?? ""}
            placeholder="Digital / rotogravure"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="colourCount">
            Colour count
          </label>
          <input
            id="colourCount"
            name="colourCount"
            type="number"
            min="1"
            className="input"
            defaultValue={variant?.colourCount ?? ""}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="lamination">
            Lamination
          </label>
          <input
            id="lamination"
            name="lamination"
            className="input"
            defaultValue={variant?.lamination ?? ""}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="finish">
            Finish
          </label>
          <input
            id="finish"
            name="finish"
            className="input"
            defaultValue={variant?.finish ?? ""}
            placeholder="Matte / gloss"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="closure">
            Closure
          </label>
          <input
            id="closure"
            name="closure"
            className="input"
            defaultValue={variant?.closure ?? ""}
            placeholder="Zipper / centre seal"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="moq">
            MOQ
          </label>
          <input
            id="moq"
            name="moq"
            type="number"
            min="1"
            className="input"
            defaultValue={variant?.moq ?? ""}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="uom">
            Unit
          </label>
          <select
            id="uom"
            name="uom"
            className="select"
            defaultValue={variant?.uom ?? "Piece"}
          >
            <option value="Piece">Piece</option>
            <option value="Kg">Kg</option>
            <option value="Meter">Meter</option>
            <option value="Roll">Roll</option>
            <option value="Sheet">Sheet</option>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="price">
            Price (₹ per unit)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            className="input"
            defaultValue={
              variant?.pricePaise ? (variant.pricePaise / 100).toFixed(2) : ""
            }
            placeholder="Leave blank for on request"
          />
          <p className="hint">Stored as paise; blank shows “On request”.</p>
          {errors.pricePaise && (
            <p className="error-text">{errors.pricePaise}</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button type="submit" className="btn-brand" disabled={isPending}>
          {isPending
            ? "Saving…"
            : editing
              ? "Save variant"
              : "Add variant"}
        </button>
      </div>
    </form>
  );
}
