import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getInventoryMaterialApiError,
  getInventoryMaterials,
  type InventoryMaterial,
  type InventoryMaterialStatus,
  type InventoryMaterialType,
} from "../api/inventoryMaterials";
import { EmptyState, ErrorState, LoadingState } from "../components/AppStates";
import { newInventoryMaterialPagePath } from "../navigation/navigation";

function statusClassName(status: InventoryMaterialStatus) {
  return status === "ACTIVE"
    ? "bg-emerald-950 text-emerald-300"
    : status === "INACTIVE"
      ? "bg-amber-950 text-amber-300"
      : "bg-rose-950 text-rose-300";
}

function materialTypeLabel(type: InventoryMaterialType) {
  return type === "FABRIC" ? "Fabric" : "Raw material";
}

function optionalText(value: string | null) {
  return value ?? "Not provided";
}

function InventoryMaterialCard({ material }: { material: InventoryMaterial }) {
  return (
    <li className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 shadow-xl shadow-black/10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
            {material.materialCode}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">{material.materialName}</h2>
          <p className="mt-2 text-sm text-slate-400">
            Material ID {material.id} · {materialTypeLabel(material.materialType)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClassName(material.status)}`}>
          {material.status}
        </span>
      </div>
      <p className="mt-4 leading-6 text-slate-300">
        {optionalText(material.materialDescription)}
      </p>
      <dl className="mt-5 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Current quantity</dt>
          <dd className="mt-1 font-semibold text-slate-100">
            {material.currentQuantity} {material.unitOfMeasure}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Low-stock threshold</dt>
          <dd className="mt-1 font-semibold text-slate-100">
            {material.lowStockThreshold} {material.unitOfMeasure}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Source supply</dt>
          <dd className="mt-1 font-semibold text-slate-100">
            {material.sourceMaterialSupplyId ?? "None"}
          </dd>
        </div>
      </dl>
    </li>
  );
}

export function InventoryMaterialListPage() {
  const [materials, setMaterials] = useState<InventoryMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void getInventoryMaterials(controller.signal)
      .then((records) => {
        if (!controller.signal.aborted) setMaterials(records);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setErrorMessage(getInventoryMaterialApiError(
            error,
            "Inventory materials could not be loaded. Please try again.",
          ).message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [requestVersion]);

  function retry() {
    setErrorMessage(null);
    setIsLoading(true);
    setRequestVersion((current) => current + 1);
  }

  return (
    <section className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">
          Fabric Inventory Management
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Inventory materials
            </h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-400">
              Review the current fabric and raw-material stock records.
            </p>
          </div>
          <Link
            className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
            to={newInventoryMaterialPagePath}
          >
            Add inventory material
          </Link>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <LoadingState
              message="Fetching fabric and raw-material stock records."
              title="Loading inventory materials"
            />
          ) : errorMessage ? (
            <ErrorState
              action={(
                <button
                  className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
                  onClick={retry}
                  type="button"
                >
                  Retry
                </button>
              )}
              message={errorMessage}
              title="Inventory materials unavailable"
            />
          ) : materials.length === 0 ? (
            <EmptyState
              action={(
                <Link
                  className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
                  to={newInventoryMaterialPagePath}
                >
                  Add first material
                </Link>
              )}
              message="No fabric or raw-material stock records have been created yet."
              title="No inventory materials"
            />
          ) : (
            <>
              <p aria-live="polite" className="text-sm text-slate-400">
                {materials.length} {materials.length === 1 ? "material" : "materials"} found
              </p>
              <ul className="mt-5 grid gap-5 lg:grid-cols-2">
                {materials.map((material) => (
                  <InventoryMaterialCard key={material.id} material={material} />
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
