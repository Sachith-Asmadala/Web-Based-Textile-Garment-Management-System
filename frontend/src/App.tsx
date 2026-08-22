import axios from "axios";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

type ApiState = "checking" | "available" | "unavailable";

function FoundationPage() {
  const [apiState, setApiState] = useState<ApiState>("checking");

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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/30 sm:p-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-teal-400">
          Foundation workspace
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Textile &amp; Garment Management System
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          The shared React and Spring Boot foundation is ready. Business modules will
          be added incrementally through their approved tickets.
        </p>
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
    <Routes>
      <Route path="*" element={<FoundationPage />} />
    </Routes>
  );
}
