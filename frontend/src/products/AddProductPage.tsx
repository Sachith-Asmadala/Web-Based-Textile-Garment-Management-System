import { useState, type FormEvent } from "react";

import {
  createProduct,
  getProductApiError,
  type CreateProductAvailability,
  type CreateProductInput,
} from "../api/products";
import {
  emptyProductForm,
  normalizeProductForm,
  validateProductForm,
  type ProductField,
  type ProductFieldErrors,
} from "./productForm";
import { ProductImage } from "./ProductImage";
import type { GarmentProductDetails } from "./productTypes";

const inputClassName =
  "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-danger-border";


function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <span className="mt-2 block text-sm text-danger" id={id}>
      {message}
    </span>
  );
}

export function AddProductPage() {
  const [form, setForm] = useState<CreateProductInput>(emptyProductForm);
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [savedProduct, setSavedProduct] = useState<GarmentProductDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Field extends ProductField>(field: Field, value: CreateProductInput[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionError(null);

    const errors = validateProductForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createProduct(normalizeProductForm(form));
      setSavedProduct(result.product);
    } catch (error: unknown) {
      const apiError = getProductApiError(
        error,
        "The garment product could not be saved. Please try again.",
      );
      setSubmissionError(apiError.message);
      setFieldErrors(apiError.fields as ProductFieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setForm(emptyProductForm());
    setFieldErrors({});
    setSubmissionError(null);
    setSavedProduct(null);
  }

  if (savedProduct) {
    const variant = savedProduct.variants[0];
    return (
      <section className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-success-border bg-success-soft p-7 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-success">
            Product saved
          </p>
          <h1 className="mt-3 text-3xl font-bold text-foreground">{savedProduct.name}</h1>
          <p aria-live="polite" className="mt-3 text-success">
            The garment product and its first variant were saved successfully.
          </p>
          <ProductImage
            alt={`${savedProduct.name} catalog presentation`}
            className="mt-7 aspect-square w-full rounded-2xl border border-success-border"
            loading="eager"
            productName={savedProduct.name}
            src={savedProduct.imageUrl}
          />
          <dl className="mt-8 grid gap-4 rounded-2xl border border-success-border bg-background/60 p-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Product ID</dt>
              <dd className="mt-1 font-semibold text-foreground">{savedProduct.id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Category</dt>
              <dd className="mt-1 font-semibold text-foreground">{savedProduct.category.name}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Variant</dt>
              <dd className="mt-1 font-semibold text-foreground">
                {variant.size} · {variant.color}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Price / availability</dt>
              <dd className="mt-1 font-semibold text-foreground">
                {variant.price} · {variant.status.toLowerCase()}
              </dd>
            </div>
          </dl>
          <button
            className="mt-8 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover"
            onClick={resetForm}
            type="button"
          >
            Add another product
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Garment Product Management
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Add garment product
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">
          Create the product and its first sellable size and color variant. Existing active
          category names are reused automatically.
        </p>

        <form
          className="mt-8 rounded-3xl border border-border bg-surface/70 p-6 sm:p-8"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-medium text-foreground" htmlFor="product-name">
              Product name
              <input
                aria-describedby={fieldErrors.name ? "product-name-error" : undefined}
                aria-invalid={Boolean(fieldErrors.name)}
                autoComplete="off"
                className={inputClassName}
                id="product-name"
                maxLength={160}
                onChange={(event) => updateField("name", event.target.value)}
                value={form.name}
              />
              <FieldError id="product-name-error" message={fieldErrors.name} />
            </label>

            <label className="block text-sm font-medium text-foreground" htmlFor="product-category">
              Category
              <input
                aria-label="Category"
                aria-describedby={fieldErrors.category ? "product-category-error" : "product-category-help"}
                aria-invalid={Boolean(fieldErrors.category)}
                autoComplete="off"
                className={inputClassName}
                id="product-category"
                maxLength={100}
                onChange={(event) => updateField("category", event.target.value)}
                value={form.category}
              />
              <span className="mt-2 block text-xs text-muted" id="product-category-help">
                Matching category names reuse the existing category record.
              </span>
              <FieldError id="product-category-error" message={fieldErrors.category} />
            </label>

            <label className="block text-sm font-medium text-foreground sm:col-span-2" htmlFor="product-image-url">
              Product image URL or path <span className="font-normal text-muted">(optional)</span>
              <input
                aria-describedby={fieldErrors.imageUrl ? "product-image-url-error" : "product-image-url-help"}
                aria-invalid={Boolean(fieldErrors.imageUrl)}
                autoComplete="off"
                className={inputClassName}
                id="product-image-url"
                inputMode="url"
                maxLength={500}
                onChange={(event) => updateField("imageUrl", event.target.value)}
                placeholder="https://… or /products/your-image.jpg"
                value={form.imageUrl ?? ""}
              />
              <span className="mt-2 block text-xs text-muted" id="product-image-url-help">
                Add an HTTPS image or a managed local product-media path. The value is stored with the product record.
              </span>
              <FieldError id="product-image-url-error" message={fieldErrors.imageUrl} />
            </label>

            <label className="block text-sm font-medium text-foreground" htmlFor="product-size">
              Size
              <input
                aria-describedby={fieldErrors.size ? "product-size-error" : undefined}
                aria-invalid={Boolean(fieldErrors.size)}
                autoComplete="off"
                className={inputClassName}
                id="product-size"
                maxLength={32}
                onChange={(event) => updateField("size", event.target.value)}
                value={form.size}
              />
              <FieldError id="product-size-error" message={fieldErrors.size} />
            </label>

            <label className="block text-sm font-medium text-foreground" htmlFor="product-color">
              Color
              <input
                aria-describedby={fieldErrors.color ? "product-color-error" : undefined}
                aria-invalid={Boolean(fieldErrors.color)}
                autoComplete="off"
                className={inputClassName}
                id="product-color"
                maxLength={64}
                onChange={(event) => updateField("color", event.target.value)}
                value={form.color}
              />
              <FieldError id="product-color-error" message={fieldErrors.color} />
            </label>

            <label className="block text-sm font-medium text-foreground" htmlFor="product-price">
              Price
              <input
                aria-label="Price"
                aria-describedby={fieldErrors.price ? "product-price-error" : "product-price-help"}
                aria-invalid={Boolean(fieldErrors.price)}
                className={inputClassName}
                id="product-price"
                inputMode="decimal"
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="0.00"
                value={form.price}
              />
              <span className="mt-2 block text-xs text-muted" id="product-price-help">
                Enter a positive amount with no more than two decimal places.
              </span>
              <FieldError id="product-price-error" message={fieldErrors.price} />
            </label>

            <label className="block text-sm font-medium text-foreground" htmlFor="product-availability">
              Availability
              <select
                className={inputClassName}
                id="product-availability"
                onChange={(event) => updateField(
                  "availability",
                  event.target.value as CreateProductAvailability,
                )}
                value={form.availability}
              >
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </label>
          </div>

          {submissionError ? (
            <p
              aria-live="polite"
              className="mt-6 rounded-xl border border-danger-border bg-danger-soft p-4 text-sm text-danger"
              role="alert"
            >
              {submissionError}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Saving product…" : "Save garment product"}
            </button>
            <p className="text-sm text-muted">All fields are required.</p>
          </div>
        </form>
      </div>
    </section>
  );
}
