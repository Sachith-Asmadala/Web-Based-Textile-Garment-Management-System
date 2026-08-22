import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { getApiErrorMessage, registerCustomer } from "../api/auth";
import { useAuth } from "./useAuth";

function AuthCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/30">
        <Link className="text-sm font-medium text-teal-400 hover:text-teal-300" to="/">
          ← Public home
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-teal-400">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
        {children}
      </section>
    </main>
  );
}

const fieldClassName =
  "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20";

const buttonClassName =
  "mt-6 w-full rounded-xl bg-teal-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60";

export function LoginPage() {
  const { user, isLoading: isSessionLoading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isSessionLoading && user) {
    return <Navigate replace to="/" />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (loginError: unknown) {
      setError(getApiErrorMessage(loginError, "Login failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard eyebrow="Secure access" title="Sign in">
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium" htmlFor="login-email">
          Email address
          <input
            autoComplete="email"
            className={fieldClassName}
            id="login-email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block text-sm font-medium" htmlFor="login-password">
          Password
          <input
            autoComplete="current-password"
            className={fieldClassName}
            id="login-password"
            minLength={8}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error ? (
          <p aria-live="polite" className="rounded-xl bg-rose-950/60 p-3 text-sm text-rose-200" role="alert">
            {error}
          </p>
        ) : null}
        <button className={buttonClassName} disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        New customer?{" "}
        <Link className="font-medium text-teal-400 hover:text-teal-300" to="/register">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}

export function RegistrationPage() {
  const { user, isLoading: isSessionLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  if (!isSessionLoading && user) {
    return <Navigate replace to="/" />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerCustomer({ fullName, email, password });
      setIsComplete(true);
    } catch (registrationError: unknown) {
      setError(getApiErrorMessage(registrationError, "Account creation failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isComplete) {
    return (
      <AuthCard eyebrow="Account created" title="Registration complete">
        <p aria-live="polite" className="mt-6 rounded-xl bg-emerald-950/60 p-4 text-emerald-200">
          Your customer account is ready. Sign in with your email and password.
        </p>
        <Link className={`${buttonClassName} block text-center`} to="/login">
          Continue to sign in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard eyebrow="Customer registration" title="Create an account">
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium" htmlFor="register-name">
          Full name
          <input
            autoComplete="name"
            className={fieldClassName}
            id="register-name"
            maxLength={120}
            name="fullName"
            onChange={(event) => setFullName(event.target.value)}
            required
            value={fullName}
          />
        </label>
        <label className="block text-sm font-medium" htmlFor="register-email">
          Email address
          <input
            autoComplete="email"
            className={fieldClassName}
            id="register-email"
            maxLength={254}
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block text-sm font-medium" htmlFor="register-password">
          Password
          <input
            aria-describedby="password-help"
            autoComplete="new-password"
            className={fieldClassName}
            id="register-password"
            maxLength={72}
            minLength={8}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <span className="mt-2 block text-xs text-slate-400" id="password-help">
            Use 8–72 characters.
          </span>
        </label>
        <label className="block text-sm font-medium" htmlFor="register-confirmation">
          Confirm password
          <input
            autoComplete="new-password"
            className={fieldClassName}
            id="register-confirmation"
            maxLength={72}
            minLength={8}
            name="passwordConfirmation"
            onChange={(event) => setConfirmation(event.target.value)}
            required
            type="password"
            value={confirmation}
          />
        </label>
        {error ? (
          <p aria-live="polite" className="rounded-xl bg-rose-950/60 p-3 text-sm text-rose-200" role="alert">
            {error}
          </p>
        ) : null}
        <button className={buttonClassName} disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account…" : "Create customer account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already registered?{" "}
        <Link className="font-medium text-teal-400 hover:text-teal-300" to="/login">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
