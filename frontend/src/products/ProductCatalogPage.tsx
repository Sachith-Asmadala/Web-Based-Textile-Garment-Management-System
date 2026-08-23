import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import {
  getCatalogProducts,
  getProductApiError,
  type ProductCatalogFilters,
} from "../api/products";
import { EmptyState, ErrorState, LoadingState } from "../components/AppStates";
import { getProductDetailPagePath } from "../navigation/navigation";
import type { GarmentProductDetails, VariantStatus } from "./productTypes";

interface CatalogFilterForm {
  search: string;
  category: string;
  size: string;
  color: string;
  availability: "" | VariantStatus;
}

const emptyFilterForm: CatalogFilterForm = {
  search: "",
  category: "",
  size: "",
  color: "",
  availability: "",
};

const filterInputClassName =
  "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20";

function buildCatalogFilters(form: CatalogFilterForm): ProductCatalogFilters {
  const filters: ProductCatalogFilters = {};
  const search = form.search.trim();
  const category = form.category.trim();
  const size = form.size.trim();
  const color = form.color.trim();

  if (search) filters.search = search;
  if (category) filters.category = category;
  if (size) filters.size = size;
  if (color) filters.color = color;
  if (form.availability) filters.availability = form.availability;
  return filters;
}

function hasCatalogFilters(filters: ProductCatalogFilters) {
  return Object.keys(filters).length > 0;
}

function ProductCard({ product }: { product: GarmentProductDetails }) {
  return (
    <li className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/75 shadow-xl shadow-black/10">
      <div className="border-b border-slate-800 bg-gradient-to-br from-teal-400/10 to-slate-900 px-6 py-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
          {product.category.name}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          {product.name}
        </h2>
        {product.description ? (
          <p className="mt-3 leading-6 text-slate-300">{product.description}</p>
        ) : null}
      </div>

      <div className="px-6 py-6">
        <p className="text-sm font-semibold text-slate-200">
          Available size and color options
        </p>
        <ul aria-label={`${product.name} available variants`} className="mt-4 grid gap-3">
          {product.variants.map((variant) => (
            <li
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3"
              key={variant.id}
            >
              <span className="font-medium text-slate-200">
                {variant.size} · {variant.color}
              </span>
              <span className="text-sm font-semibold text-teal-300">
                Price {variant.price}
              </span>
            </li>
          ))}
        </ul>
        <Link
          className="mt-5 inline-flex rounded-full border border-teal-400/50 px-4 py-2 text-sm font-semibold text-teal-200 transition hover:border-teal-300 hover:text-white"
          to={getProductDetailPagePath(product.id)}
        >
          View product details
        </Link>
      </div>
    </li>
  );
}

export function ProductCatalogPage() {
  const [filterForm, setFilterForm] = useState<CatalogFilterForm>(emptyFilterForm);
  const [appliedFilters, setAppliedFilters] = useState<ProductCatalogFilters>({});
  const [products, setProducts] = useState<GarmentProductDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void getCatalogProducts(appliedFilters, controller.signal)
      .then((catalogProducts) => {
        if (!controller.signal.aborted) {
          setProducts(catalogProducts);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setErrorMessage(getProductApiError(
            error,
            "The garment catalog could not be loaded. Please try again.",
          ).message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [appliedFilters, requestVersion]);

  function updateFilter<Field extends keyof CatalogFilterForm>(
    field: Field,
    value: CatalogFilterForm[Field],
  ) {
    setFilterForm((current) => ({ ...current, [field]: value }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setAppliedFilters(buildCatalogFilters(filterForm));
  }

  function clearFilters() {
    setFilterForm(emptyFilterForm);
    setIsLoading(true);
    setErrorMessage(null);
    setAppliedFilters({});
  }

  function retryCatalog() {
    setIsLoading(true);
    setErrorMessage(null);
    setRequestVersion((current) => current + 1);
  }

  const filtersAreActive = hasCatalogFilters(appliedFilters);

  return (
    <section className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
          Garment Product Management
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Garment catalog
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-slate-400">
          Browse active garments with variants that are currently available. Prices are
          shown exactly as recorded by the organization.
        </p>

        <form
          className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6"
          onSubmit={applyFilters}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-sm font-medium text-slate-200" htmlFor="catalog-search">
              Product name
              <input
                className={filterInputClassName}
                id="catalog-search"
                maxLength={160}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="e.g. Classic Tee"
                type="search"
                value={filterForm.search}
              />
            </label>
            <label className="text-sm font-medium text-slate-200" htmlFor="catalog-category">
              Category
              <input
                className={filterInputClassName}
                id="catalog-category"
                maxLength={100}
                onChange={(event) => updateFilter("category", event.target.value)}
                placeholder="Exact category"
                value={filterForm.category}
              />
            </label>
            <label className="text-sm font-medium text-slate-200" htmlFor="catalog-size">
              Size
              <input
                className={filterInputClassName}
                id="catalog-size"
                maxLength={32}
                onChange={(event) => updateFilter("size", event.target.value)}
                placeholder="e.g. M"
                value={filterForm.size}
              />
            </label>
            <label className="text-sm font-medium text-slate-200" htmlFor="catalog-color">
              Color
              <input
                className={filterInputClassName}
                id="catalog-color"
                maxLength={64}
                onChange={(event) => updateFilter("color", event.target.value)}
                placeholder="e.g. Navy"
                value={filterForm.color}
              />
            </label>
            <label className="text-sm font-medium text-slate-200" htmlFor="catalog-availability">
              Availability
              <select
                className={filterInputClassName}
                id="catalog-availability"
                onChange={(event) => updateFilter(
                  "availability",
                  event.target.value as CatalogFilterForm["availability"],
                )}
                value={filterForm.availability}
              >
                <option value="">Any permitted status</option>
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </label>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Category, size, and color use exact case-insensitive matches. Public catalog
            permissions still hide unavailable and discontinued variants.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
              type="submit"
            >
              Search catalog
            </button>
            <button
              className="rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
              onClick={clearFilters}
              type="button"
            >
              Clear filters
            </button>
          </div>
        </form>

        <div className="mt-8">
          {isLoading ? (
            <LoadingState
              message="Fetching the garments and variants that match the current filters."
              title="Loading garment catalog"
            />
          ) : errorMessage ? (
            <ErrorState
              action={(
                <button
                  className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
                  onClick={retryCatalog}
                  type="button"
                >
                  Retry
                </button>
              )}
              message={errorMessage}
              title="Catalog unavailable"
            />
          ) : products.length === 0 ? (
            <EmptyState
              action={filtersAreActive ? (
                <button
                  className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
                  onClick={clearFilters}
                  type="button"
                >
                  Clear filters
                </button>
              ) : undefined}
              message={filtersAreActive
                ? "No publicly available garments match all of the selected filters."
                : "There are no active garments with available size and color options right now."}
              title={filtersAreActive ? "No matching garments" : "No garments available"}
            />
          ) : (
            <>
              <p aria-live="polite" className="text-sm text-slate-400">
                {products.length} {products.length === 1 ? "product" : "products"} found
              </p>
              <ul className="mt-5 grid gap-6 md:grid-cols-2">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
