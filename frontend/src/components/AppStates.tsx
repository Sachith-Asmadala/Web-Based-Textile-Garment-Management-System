import { Link } from "react-router-dom";

interface StatePanelProps {
  eyebrow: string;
  title: string;
  message: string;
  tone?: "neutral" | "danger";
  action?: React.ReactNode;
}

function StatePanel({
  eyebrow,
  title,
  message,
  tone = "neutral",
  action,
}: StatePanelProps) {
  const accentClass = tone === "danger" ? "text-rose-300" : "text-teal-300";

  return (
    <section
      className="rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-xl shadow-black/10 sm:p-9"
    >
      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentClass}`}>
        {eyebrow}
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-300">{message}</p>
      {action ? <div className="mt-7">{action}</div> : null}
    </section>
  );
}

export function LoadingState({
  title = "Loading…",
  message = "Please wait while the requested information is prepared.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div aria-live="polite" role="status">
      <StatePanel eyebrow="Loading" message={message} title={title} />
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  message,
  action,
}: {
  title?: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <StatePanel
      action={action}
      eyebrow="Empty state"
      message={message}
      title={title}
    />
  );
}

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
}: {
  title?: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div role="alert">
      <StatePanel
        action={action}
        eyebrow="Error"
        message={message}
        title={title}
        tone="danger"
      />
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <StatePanel
        action={
          <Link
            className="inline-flex rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
            to="/"
          >
            Return to overview
          </Link>
        }
        eyebrow="404 · Not found"
        message="The requested page does not exist or may have moved. Use the navigation to continue safely."
        title="Page not found"
      />
    </div>
  );
}
