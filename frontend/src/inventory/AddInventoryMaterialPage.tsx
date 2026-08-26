import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import {
  createInventoryMaterial,
  getInventoryMaterialApiError,
  type CreateInventoryMaterialInput,
  type InventoryMaterial,
  type InventoryMaterialType,
} from "../api/inventoryMaterials";
import { inventoryMaterialListPagePath } from "../navigation/navigation";
import {
  emptyInventoryMaterialForm,
  normalizeInventoryMaterialForm,
  validateInventoryMaterialForm,
  type InventoryMaterialField,
  type InventoryMaterialFieldErrors,
} from "./inventoryMaterialForm";

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 aria-invalid:border-rose-500";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span className="mt-2 block text-sm text-rose-300" id={id}>
      {message}
    </span>
  );
}

export function AddInventoryMaterialPage() {
  const [form, setForm] = useState<CreateInventoryMaterialInput>(
    emptyInventoryMaterialForm,
  );
  const [fieldErrors, setFieldErrors] = useState<InventoryMaterialFieldErrors>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [savedMaterial, setSavedMaterial] = useState<InventoryMaterial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Field extends InventoryMaterialField>(
    field: Field,
    value: CreateInventoryMaterialInput[Field],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionError(null);

    const errors = validateInventoryMaterialForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const result = await createInventoryMaterial(normalizeInventoryMaterialForm(form));
      setSavedMaterial(result.material);
    } catch (error: unknown) {
      const apiError = getInventoryMaterialApiError(
        error,
        "The inventory material could not be saved. Please try again.",
      );
      setSubmissionError(apiError.message);
      setFieldErrors(apiError.fields as InventoryMaterialFieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setForm(emptyInventoryMaterialForm());
    setFieldErrors({});
    setSubmissionError(null);
    setSavedMaterial(null);
  }

  if (savedMaterial) {
    return (
      <section className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-emerald-800/70 bg-emerald-950/30 p-7 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Inventory material saved
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">{savedMaterial.materialName}</h1>
          <p aria-live="polite" className="mt-3 text-emerald-100">
            The opening stock record is now available in inventory.
          </p>
          <dl className="mt-8 grid gap-4 rounded-2xl border border-emerald-900 bg-slate-950/60 p-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Material ID</dt>
              <dd className="mt-1 font-semibold text-white">{savedMaterial.id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Material code</dt>
              <dd className="mt-1 font-semibold text-white">{savedMaterial.materialCode}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Opening stock</dt>
              <dd className="mt-1 font-semibold text-white">
                {savedMaterial.currentQuantity} {savedMaterial.unitOfMeasure}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Low-stock threshold</dt>
              <dd className="mt-1 font-semibold text-white">
                {savedMaterial.lowStockThreshold} {savedMaterial.unitOfMeasure}
              </dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="rounded-xl bg-teal-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-teal-300"
              onClick={resetForm}
              type="button"
            >
              Add another material
            </button>
            <Link
              className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-100 transition hover:border-slate-500 hover:text-white"
              to={inventoryMaterialListPagePath}
            >
              View inventory list
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
          Fabric Inventory Management
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Add inventory material
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-400">
          Create the stock record used by production and inventory workflows.
        </p>

        <form
          className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-200" htmlFor="inventory-code">
              Material code
              <input
                aria-describedby={fieldErrors.materialCode ? "inventory-code-error" : undefined}
                aria-invalid={Boolean(fieldErrors.materialCode)}
                autoComplete="off"
                className={inputClassName}
                id="inventory-code"
                maxLength={64}
                onChange={(event) => updateField("materialCode", event.target.value)}
                value={form.materialCode}
              />
              <FieldError id="inventory-code-error" message={fieldErrors.materialCode} />
            </label>

            <label className="block text-sm font-medium text-slate-200" htmlFor="inventory-name">
              Material name
              <input
                aria-describedby={fieldErrors.materialName ? "inventory-name-error" : undefined}
                aria-invalid={Boolean(fieldErrors.materialName)}
                autoComplete="off"
                className={inputClassName}
                id="inventory-name"
                maxLength={160}
                onChange={(event) => updateField("materialName", event.target.value)}
                value={form.materialName}
              />
              <FieldError id="inventory-name-error" message={fieldErrors.materialName} />
            </label>

            <label className="block text-sm font-medium text-slate-200" htmlFor="inventory-type">
              Material type
              <select
                className={inputClassName}
                id="inventory-type"
                onChange={(event) => updateField(
                  "materialType",
                  event.target.value as InventoryMaterialType,
                )}
                value={form.materialType}
              >
                <option value="FABRIC">Fabric</option>
                <option value="RAW_MATERIAL">Raw material</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-200" htmlFor="inventory-unit">
              Unit of measure
              <input
                aria-describedby={fieldErrors.unitOfMeasure ? "inventory-unit-error" : undefined}
                aria-invalid={Boolean(fieldErrors.unitOfMeasure)}
                autoComplete="off"
                className={inputClassName}
                id="inventory-unit"
                maxLength={32}
                onChange={(event) => updateField("unitOfMeasure", event.target.value)}
                value={form.unitOfMeasure}
              />
              <FieldError id="inventory-unit-error" message={fieldErrors.unitOfMeasure} />
            </label>

            <label className="block text-sm font-medium text-slate-200" htmlFor="inventory-quantity">
              Opening quantity
              <input
                aria-describedby={fieldErrors.currentQuantity ? "inventory-quantity-error" : undefined}
                aria-invalid={Boolean(fieldErrors.currentQuantity)}
                className={inputClassName}
                id="inventory-quantity"
                inputMode="decimal"
                onChange={(event) => updateField("currentQuantity", event.target.value)}
                placeholder="0.000"
                value={form.currentQuantity}
              />
              <FieldError id="inventory-quantity-error" message={fieldErrors.currentQuantity} />
            </label>

            <label className="block text-sm font-medium text-slate-200" htmlFor="inventory-threshold">
              Low-stock threshold
              <input
                aria-describedby={fieldErrors.lowStockThreshold ? "inventory-threshold-error" : undefined}
                aria-invalid={Boolean(fieldErrors.lowStockThreshold)}
                className={inputClassName}
                id="inventory-threshold"
                inputMode="decimal"
                onChange={(event) => updateField("lowStockThreshold", event.target.value)}
                placeholder="0.000"
                value={form.lowStockThreshold}
              />
              <FieldError id="inventory-threshold-error" message={fieldErrors.lowStockThreshold} />
            </label>

            <label className="block text-sm font-medium text-slate-200 sm:col-span-2" htmlFor="inventory-source-supply">
              Source material supply ID (optional)
              <input
                aria-describedby={fieldErrors.sourceMaterialSupplyId ? "inventory-source-error" : undefined}
                aria-invalid={Boolean(fieldErrors.sourceMaterialSupplyId)}
                className={inputClassName}
                id="inventory-source-supply"
                inputMode="numeric"
                onChange={(event) => updateField("sourceMaterialSupplyId", event.target.value)}
                value={form.sourceMaterialSupplyId}
              />
              <FieldError
                id="inventory-source-error"
                message={fieldErrors.sourceMaterialSupplyId}
              />
            </label>

            <label className="block text-sm font-medium text-slate-200 sm:col-span-2" htmlFor="inventory-description">
              Material description (optional)
              <textarea
                aria-describedby={fieldErrors.materialDescription ? "inventory-description-error" : undefined}
                aria-invalid={Boolean(fieldErrors.materialDescription)}
                className={`${inputClassName} min-h-28 resize-y`}
                id="inventory-description"
                maxLength={500}
                onChange={(event) => updateField("materialDescription", event.target.value)}
                value={form.materialDescription}
              />
              <FieldError
                id="inventory-description-error"
                message={fieldErrors.materialDescription}
              />
            </label>
          </div>

          {submissionError ? (
            <p
              aria-live="polite"
              className="mt-6 rounded-xl border border-rose-900 bg-rose-950/60 p-4 text-sm text-rose-200"
              role="alert"
            >
              {submissionError}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              className="rounded-xl bg-teal-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-wait disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Saving material..." : "Save inventory material"}
            </button>
            <Link
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
              to={inventoryMaterialListPagePath}
            >
              Back to inventory list
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
