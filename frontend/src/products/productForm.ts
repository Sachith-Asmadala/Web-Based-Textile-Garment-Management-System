import type { CreateProductInput } from "../api/products";

export type ProductField = keyof CreateProductInput;
export type ProductFieldErrors = Partial<Record<ProductField, string>>;

const pricePattern = /^\d{1,10}(\.\d{1,2})?$/;

const requiredTextFields: Array<[ProductField, string, number]> = [
  ["name", "Product name", 160],
  ["category", "Category", 100],
  ["size", "Size", 32],
  ["color", "Color", 64],
];

export function emptyProductForm(): CreateProductInput {
  return {
    name: "",
    category: "",
    size: "",
    color: "",
    price: "",
    availability: "AVAILABLE",
  };
}

export function normalizeProductForm(form: CreateProductInput): CreateProductInput {
  return {
    ...form,
    name: form.name.trim(),
    category: form.category.trim(),
    size: form.size.trim(),
    color: form.color.trim(),
    price: form.price.trim(),
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

  return errors;
}
