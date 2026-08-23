import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getCatalogProduct, getProductApiError } from "../api/products";
import { useAuth } from "../auth/useAuth";
import { EmptyState, ErrorState, LoadingState } from "../components/AppStates";
import {
  getEditProductPagePath,
  parseProductPageId,
  productCatalogPagePath,
} from "../navigation/navigation";
import type { GarmentProductDetails } from "./productTypes";

function BackToCatalogLink() {
  return (
    <Link
      className="inline-flex rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-teal-400 hover:text-white"
      to={productCatalogPagePath}
    >
      Back to garment catalog
    </Link>
  );
}

function ProductNotFoundState() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <EmptyState
        action={<BackToCatalogLink />}
        message="This product does not exist or is not currently available in the public catalog."
        title="Product not found"
      />
    </div>
  );
}

function ProductDetailContent({ productId }: { productId: number }) {
  const { user } = useAuth();
  const [product, setProduct] = useState<GarmentProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void getCatalogProduct(productId, controller.signal)
      .then((catalogProduct) => {
        if (!controller.signal.aborted) {
          setProduct(catalogProduct);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          const apiError = getProductApiError(
            error,
            "The product details could not be loaded. Please try again.",
          );
          if (apiError.status === 404 || apiError.code === "PRODUCT_NOT_FOUND") {
            setIsNotFound(true);
          } else {
            setErrorMessage(apiError.message);
          }
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [productId, requestVersion]);

  function retryProduct() {
    setIsLoading(true);
    setErrorMessage(null);
    setIsNotFound(false);
    setRequestVersion((current) => current + 1);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <LoadingState
          message="Fetching the selected garment and its available variants."
          title="Loading product details"
        />
      </div>
    );
  }

  if (isNotFound || !product) {
    if (isNotFound) {
      return <ProductNotFoundState />;
    }
    return (
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <ErrorState
          action={(
            <button
              className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
              onClick={retryProduct}
              type="button"
            >
              Retry
            </button>
          )}
          message={errorMessage ?? "The product details could not be loaded."}
          title="Product details unavailable"
        />
      </div>
    );
  }

  return (
    <section className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <BackToCatalogLink />

        <article className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/75 shadow-xl shadow-black/10">
          <header className="border-b border-slate-800 bg-gradient-to-br from-teal-400/10 to-slate-900 p-7 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
              {product.category.name}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-300">
              {product.description ?? "No additional product description is available."}
            </p>
          </header>

          <div className="p-7 sm:p-10">
            <dl className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Product ID</dt>
                <dd className="mt-1 font-semibold text-white">{product.id}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Category</dt>
                <dd className="mt-1 font-semibold text-white">{product.category.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Product status</dt>
                <dd className="mt-1 font-semibold text-emerald-300">
                  {product.status.toLowerCase()}
                </dd>
              </div>
            </dl>

            {product.category.description ? (
              <p className="mt-5 text-sm leading-6 text-slate-400">
                {product.category.description}
              </p>
            ) : null}

            <h2 className="mt-9 text-2xl font-bold text-white">Available options</h2>
            <p className="mt-2 text-slate-400">
              Compare the recorded size, color, price, and availability for each option.
            </p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {product.variants.map((variant) => (
                <li
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                  key={variant.id}
                >
                  <h3 className="text-lg font-semibold text-white">
                    {variant.size} · {variant.color}
                  </h3>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-slate-500">Price</dt>
                      <dd className="mt-1 font-semibold text-teal-300">{variant.price}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Availability</dt>
                      <dd className="mt-1 font-semibold text-emerald-300">
                        {variant.status.toLowerCase()}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <BackToCatalogLink />
              {user?.role === "SALES_OFFICER" ? (
                <Link
                  className="inline-flex rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
                  to={getEditProductPagePath(product.id)}
                >
                  Edit product
                </Link>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export function ProductDetailPage() {
  const { productId: productIdParameter } = useParams();
  const productId = parseProductPageId(productIdParameter);

  if (productId === null) {
    return <ProductNotFoundState />;
  }
  return <ProductDetailContent key={productId} productId={productId} />;
}
