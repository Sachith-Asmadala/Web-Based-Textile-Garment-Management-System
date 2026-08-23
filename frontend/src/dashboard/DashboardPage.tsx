import { Link } from "react-router-dom";

import type { UserRole } from "../api/auth";
import { isInternalRole, roleAccessPagePaths } from "../api/roleAccess";
import { EmptyState } from "../components/AppStates";
import { roleLabels } from "../navigation/navigation";

const dashboardDescriptions: Record<UserRole, string> = {
  ADMINISTRATOR: "A shared starting point for system administration and oversight.",
  SUPPLIER: "A shared starting point for future supplier operations.",
  INVENTORY_MANAGER: "A shared starting point for future fabric inventory operations.",
  PRODUCTION_MANAGER: "A shared starting point for future production operations.",
  SALES_OFFICER: "A shared starting point for future sales and order operations.",
  CUSTOMER: "A shared starting point for future registered-customer services.",
};

export function DashboardPage({ role }: { role: UserRole }) {
  const roleLabel = roleLabels[role];

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10 lg:p-12">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/40 p-7 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">
          Role dashboard
        </p>
        <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {roleLabel} dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              {dashboardDescriptions[role]}
            </p>
          </div>
          <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
            Foundation ready
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-sm text-slate-400">Access scope</p>
          <p className="mt-2 font-semibold text-white">{roleLabel}</p>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-sm text-slate-400">Business branch</p>
          <p className="mt-2 font-semibold text-white">Single branch</p>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-sm text-slate-400">Module data</p>
          <p className="mt-2 font-semibold text-white">Awaiting approved tickets</p>
        </section>
      </div>

      <div className="mt-6">
        <EmptyState
          action={
            isInternalRole(role) ? (
              <Link
                className="inline-flex rounded-full border border-teal-500/50 px-5 py-2.5 text-sm font-semibold text-teal-200 transition hover:border-teal-300 hover:text-white"
                to={roleAccessPagePaths[role]}
              >
                Verify server authorization
              </Link>
            ) : undefined
          }
          message="Business activity will appear here when the relevant module tickets are implemented. No placeholder records are being invented."
          title="No dashboard activity yet"
        />
      </div>
    </div>
  );
}
