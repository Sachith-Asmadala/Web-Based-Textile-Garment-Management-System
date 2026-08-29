import type { CreateProductInput } from "../api/products";

export type ProductField = keyof CreateProductInput;
export type ProductFieldErrors = Partial<Record<ProductField, string>>;
type RequiredTextField = "name" | "category" | "size" | "color";

const pricePattern = /^\d{1,10}(\.\d{1,2})?$/;
const localProductImagePattern = /^\/products\/(?!.*\.\.)[A-Za-z0-9/_\-.]+$/;

const requiredTextFields: Array<[RequiredTextField, string, number]> = [
  ["name", "Product name", 160],
  ["category", "Category", 100],
  ["size", "Size", 32],
  ["color", "Color", 64],
];

export function emptyProductForm(): CreateProductInput {
  return {
    name: "",
    category: "",
    imageUrl: "",
    size: "",
    color: "",
    price: "",
    availability: "AVAILABLE",
  };
}

export function normalizeProductForm(form: CreateProductInput): CreateProductInput {
  const imageUrl = form.imageUrl?.trim();
  return {
    name: form.name.trim(),
    category: form.category.trim(),
    size: form.size.trim(),
    color: form.color.trim(),
    price: form.price.trim(),
    availability: form.availability,
    ...(imageUrl ? { imageUrl } : {}),
  };
}

export function validateProductForm(form: CreateProductInput): ProductFieldErrors {
  const errors: ProductFieldErrors = {};

  for (const [field, label, maximumLength] of requiredTextFields) {
    const value = form[field].trim();
    if (!value) {
      errors[field] = `${label} is required.`;
    } else if (value.length > maximumLength) {
      errors[field] = `${label} must not exceed ${maximumLength} characters.`;
    }
  }

  if (!pricePattern.test(form.price.trim()) || Number(form.price) <= 0) {
    errors.price = "Price must be positive with at most 10 digits and 2 decimals.";
  }

  const imageUrl = form.imageUrl?.trim() ?? "";
  if (imageUrl.length > 500) {
    errors.imageUrl = "Product image URL must not exceed 500 characters.";
  } else if (imageUrl && !localProductImagePattern.test(imageUrl)) {
    try {
      const parsed = new URL(imageUrl);
      if (parsed.protocol !== "https:") {
        errors.imageUrl = "Use an HTTPS image URL or a local /products/ image path.";
      }
    } catch {
      errors.imageUrl = "Use an HTTPS image URL or a local /products/ image path.";
    }
  }

  return errors;
}
