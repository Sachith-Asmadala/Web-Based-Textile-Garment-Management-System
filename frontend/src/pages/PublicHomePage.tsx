import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import { dashboardPagePaths, roleLabels } from "../navigation/navigation";

type ApiState = "checking" | "available" | "unavailable";

export function PublicHomePage() {
  const [apiState, setApiState] = useState<ApiState>("checking");
  const { user, sessionError } = useAuth();

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get("/api/health", { signal: controller.signal })
      .then(() => setApiState("available"))
      .catch((error: unknown) => {
        if (!axios.isCancel(error)) {
          setApiState("unavailable");
        }
      });

    return () => controller.abort();
  }, []);

  const statusText = {
    checking: "Checking API connection…",
    available: "API connection available",
    unavailable: "API connection unavailable",
  }[apiState];

  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10 lg:p-12">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/20">
        <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">
              Shared application foundation
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Textile &amp; Garment Management System
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A centralized web workspace for the organization’s approved garment,
              supplier, inventory, order, production, and delivery modules.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link
                  className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
                  to={dashboardPagePaths[user.role]}
                >
                  Open {roleLabels[user.role].toLowerCase()} dashboard
                </Link>
              ) : (
                <>
                  <Link
                    className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
                    to="/login"
                  >
                    Sign in
                  </Link>
                  <Link
                    className="rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-teal-400"
                    to="/register"
                  >
                    Register as customer
                  </Link>
                </>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-700/80 bg-slate-950/60 p-6">
            <p className="text-sm font-semibold text-white">System status</p>
            <div className="mt-5 flex items-center gap-3" aria-live="polite">
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full ${
                  apiState === "available"
                    ? "bg-emerald-400"
                    : apiState === "unavailable"
                      ? "bg-rose-400"
                      : "animate-pulse bg-amber-300"
                }`}
              />
              <span className="text-sm text-slate-300">{statusText}</span>
            </div>
            {user ? (
              <div className="mt-6 border-t border-slate-800 pt-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Signed in
                </p>
                <p className="mt-2 font-semibold text-white">{user.fullName}</p>
                <p className="mt-1 text-sm text-teal-200">{roleLabels[user.role]}</p>
              </div>
            ) : (
              <p className="mt-6 border-t border-slate-800 pt-5 text-sm leading-6 text-slate-400">
                Guest browsing remains available without authentication.
              </p>
            )}
          </aside>
        </div>
      </section>

      {sessionError ? (
        <p className="mt-5 rounded-2xl border border-amber-700/40 bg-amber-950/40 px-5 py-4 text-sm text-amber-200">
          {sessionError}
        </p>
      ) : null}

      <section className="mt-6 grid gap-4 md:grid-cols-3" aria-label="Foundation qualities">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="font-semibold text-white">Role-aware</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Navigation is derived from the authenticated account role.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="font-semibold text-white">Server-enforced</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Protected API authorization remains enforced by Spring Security.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="font-semibold text-white">Module-ready</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Shared layout and states are ready for later approved tickets.
          </p>
        </article>
      </section>
    </div>
  );
}
