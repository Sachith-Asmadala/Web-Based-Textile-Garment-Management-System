import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { getNavigationItems, roleLabels } from "../navigation/navigation";
import { useAuth } from "../auth/useAuth";

function navigationClassName({ isActive }: { isActive: boolean }) {
  return [
    "group block rounded-2xl border px-4 py-3 transition",
    isActive
      ? "border-teal-400/40 bg-teal-400/10 text-white"
      : "border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white",
  ].join(" ");
}

export function AppLayout() {
  const { user, isLoading, logout } = useAuth();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const navigationItems = getNavigationItems(user);

  async function handleLogout() {
    setLogoutError(null);
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      setLogoutError("Sign out failed. Your session may still be active; please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="flex min-h-18 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-controls="primary-navigation"
              aria-expanded={isNavigationOpen}
              aria-label="Toggle navigation"
              className="rounded-xl border border-slate-700 p-2 text-slate-200 hover:border-teal-400 md:hidden"
              onClick={() => setIsNavigationOpen((open) => !open)}
              type="button"
            >
              <span aria-hidden="true" className="block text-lg leading-none">☰</span>
            </button>
            <NavLink className="flex min-w-0 items-center gap-3" to="/">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-300 font-black text-slate-950">
                TG
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-white sm:text-base">
                  Textile &amp; Garment
                </span>
                <span className="block truncate text-xs text-slate-400">Management System</span>
              </span>
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="text-sm text-slate-400">Checking session…</span>
            ) : user ? (
              <>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-white">{user.fullName}</p>
                  <p className="text-xs text-slate-400">{roleLabels[user.role]}</p>
                </div>
                <button
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-teal-400 hover:text-white disabled:cursor-wait disabled:opacity-60"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  type="button"
                >
                  {isLoggingOut ? "Signing out…" : "Sign out"}
                </button>
              </>
            ) : null}
          </div>
        </div>
        {logoutError ? (
          <p className="border-t border-rose-900/60 bg-rose-950/70 px-6 py-2 text-sm text-rose-200" role="alert">
            {logoutError}
          </p>
        ) : null}
      </header>

      <div className="mx-auto grid w-full max-w-[1600px] md:grid-cols-[17rem_minmax(0,1fr)]">
        <aside
          className={`${isNavigationOpen ? "block" : "hidden"} border-b border-slate-800 bg-slate-950 p-4 md:sticky md:top-18 md:block md:h-[calc(100vh-4.5rem)] md:border-b-0 md:border-r md:p-6`}
          id="primary-navigation"
        >
          <div className="mb-5 px-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {user ? "Your workspace" : "Public access"}
            </p>
          </div>
          <nav aria-label="Primary navigation" className="space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                className={navigationClassName}
                end={item.path === "/"}
                key={item.path}
                onClick={() => setIsNavigationOpen(false)}
                to={item.path}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500 group-hover:text-slate-400">
                  {item.description}
                </span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">
              Foundation
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Module links will be introduced only by their approved implementation tickets.
            </p>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
