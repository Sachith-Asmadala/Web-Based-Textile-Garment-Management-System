import axios from "axios";
import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";

import { LoginPage, RegistrationPage } from "./auth/AuthPages";
import { AuthProvider } from "./auth/AuthProvider";
import {
  AuthenticationRequiredPage,
  ForbiddenPage,
  ProtectedRoute,
  RoleAccessPage,
} from "./auth/AuthorizationPages";
import { useAuth } from "./auth/useAuth";
import {
  isInternalRole,
  roleAccessPagePaths,
  type InternalRole,
} from "./api/roleAccess";

type ApiState = "checking" | "available" | "unavailable";

const protectedRoleRoutes: Array<{ role: InternalRole; path: string }> = [
  { role: "ADMINISTRATOR", path: roleAccessPagePaths.ADMINISTRATOR },
  { role: "SUPPLIER", path: roleAccessPagePaths.SUPPLIER },
  { role: "INVENTORY_MANAGER", path: roleAccessPagePaths.INVENTORY_MANAGER },
  { role: "PRODUCTION_MANAGER", path: roleAccessPagePaths.PRODUCTION_MANAGER },
  { role: "SALES_OFFICER", path: roleAccessPagePaths.SALES_OFFICER },
];

function FoundationPage() {
  const [apiState, setApiState] = useState<ApiState>("checking");
  const { user, isLoading: isSessionLoading, sessionError, logout } = useAuth();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
  const protectedPagePath = user && isInternalRole(user.role)
    ? roleAccessPagePaths[user.role]
    : null;

  async function handleLogout() {
    setLogoutError(null);
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      setLogoutError("Logout failed. Your session may still be active; please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/30 sm:p-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-teal-400">
          Foundation workspace
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Textile &amp; Garment Management System
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Guests can continue to browse public content. Registered customers and
          internal users can securely access their accounts.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {isSessionLoading ? (
            <span className="text-sm text-slate-400">Checking session…</span>
          ) : user ? (
            <>
              <span className="rounded-full bg-teal-400/10 px-4 py-2 text-sm text-teal-200">
                {user.fullName} · {user.role.replaceAll("_", " ")}
              </span>
              <button
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium hover:border-teal-400 disabled:opacity-60"
                disabled={isLoggingOut}
                onClick={handleLogout}
                type="button"
              >
                {isLoggingOut ? "Signing out…" : "Sign out"}
              </button>
              {protectedPagePath ? (
                <Link
                  className="rounded-full border border-teal-700 px-4 py-2 text-sm font-medium text-teal-200 hover:border-teal-400"
                  to={protectedPagePath}
                >
                  Open protected function
                </Link>
              ) : null}
            </>
          ) : (
            <>
              <Link className="rounded-full bg-teal-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-300" to="/login">
                Sign in
              </Link>
              <Link className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold hover:border-teal-400" to="/register">
                Register as customer
              </Link>
            </>
          )}
        </div>
        {sessionError ? <p className="mt-4 text-sm text-amber-200">{sessionError}</p> : null}
        {logoutError ? <p className="mt-4 text-sm text-rose-200" role="alert">{logoutError}</p> : null}
        <div
          aria-live="polite"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-200"
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              apiState === "available"
                ? "bg-emerald-400"
                : apiState === "unavailable"
                  ? "bg-rose-400"
                  : "animate-pulse bg-amber-300"
            }`}
          />
          {statusText}
        </div>
      </section>
    </main>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<FoundationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/unauthorized" element={<AuthenticationRequiredPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        {protectedRoleRoutes.map(({ role, path }) => (
          <Route
            element={
              <ProtectedRoute allowedRoles={[role]}>
                <RoleAccessPage role={role} />
              </ProtectedRoute>
            }
            key={role}
            path={path}
          />
        ))}
        <Route path="*" element={<FoundationPage />} />
      </Routes>
    </AuthProvider>
  );
}
