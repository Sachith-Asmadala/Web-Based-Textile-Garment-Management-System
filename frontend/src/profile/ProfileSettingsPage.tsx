import { useEffect, useState } from "react";

import { ErrorState, LoadingState } from "../components/AppStates";
import {
  getProfile,
  getProfileApiError,
  updateProfile,
  type ProfileInput,
} from "../api/profile";
import type { AuthUser } from "../api/auth";
import { roleLabels } from "../navigation/navigation";
import { useAuth } from "../auth/useAuth";

type EditableField = keyof ProfileInput;
type FieldErrors = Partial<Record<EditableField, string>>;

function formFromProfile(profile: AuthUser): ProfileInput {
  return { fullName: profile.fullName };
}

function normalizeForm(form: ProfileInput): ProfileInput {
  return { fullName: form.fullName.trim().replace(/\s+/g, " ") };
}

function validateForm(form: ProfileInput): FieldErrors {
  const normalized = normalizeForm(form);
  const errors: FieldErrors = {};
  if (!normalized.fullName) {
    errors.fullName = "Full name is required.";
  } else if (normalized.fullName.length > 120) {
    errors.fullName = "Full name must not exceed 120 characters.";
  }
  return errors;
}

export function ProfileSettingsPage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<ProfileInput>({ fullName: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    void getProfile(controller.signal)
      .then((storedProfile) => {
        setProfile(storedProfile);
        setForm(formFromProfile(storedProfile));
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(getProfileApiError(
            error,
            "Your profile could not be loaded. Please try again.",
          ).message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [reloadKey]);

  function updateField(field: EditableField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSaveError(null);
    setSuccessMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateForm(form);
    setFieldErrors(errors);
    setSaveError(null);
    setSuccessMessage(null);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateProfile(normalizeForm(form));
      setProfile(updated);
      setForm(formFromProfile(updated));
      setSuccessMessage("Profile settings updated successfully.");
      await refreshUser().catch(() => null);
    } catch (error: unknown) {
      const apiError = getProfileApiError(
        error,
        "Your profile could not be saved. Please try again.",
      );
      setFieldErrors(apiError.fields as FieldErrors);
      setSaveError(apiError.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6 sm:p-10 lg:p-12">
        <LoadingState
          message="Loading the account information owned by your authenticated user ID."
          title="Loading profile settings…"
        />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="mx-auto max-w-4xl p-6 sm:p-10 lg:p-12">
        <ErrorState
          action={(
            <button
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              onClick={() => setReloadKey((key) => key + 1)}
              type="button"
            >
              Retry
            </button>
          )}
          message={loadError ?? "Your profile could not be loaded."}
          title="Profile settings unavailable"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10 lg:p-12">
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-2xl shadow-black/20 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Account settings
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Profile settings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Maintain the personal name shown across LankaWear Apparel. Sign-in identity, role, access status,
          password, and other security fields are protected and cannot be changed from this page.
        </p>

        <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-background/60 p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Account ID</p>
            <p className="mt-2 font-mono text-sm text-foreground">{profile.id}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Email</p>
            <p className="mt-2 break-all text-sm text-foreground">{profile.email}</p>
            <p className="mt-1 text-xs text-muted">Protected sign-in and recovery identity</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Role</p>
            <p className="mt-2 text-sm font-semibold text-foreground">{roleLabels[profile.role]}</p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-foreground-muted">
            Full name
            <input
              aria-invalid={Boolean(fieldErrors.fullName)}
              autoComplete="name"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
              maxLength={120}
              onChange={(event) => updateField("fullName", event.target.value)}
              value={form.fullName}
            />
            {fieldErrors.fullName ? (
              <span className="mt-2 block text-sm text-danger">{fieldErrors.fullName}</span>
            ) : null}
          </label>

          {saveError ? (
            <p className="rounded-2xl border border-danger-border bg-danger-soft p-4 text-sm text-danger" role="alert">
              {saveError}
            </p>
          ) : null}
          {successMessage ? (
            <p className="rounded-2xl border border-success-border bg-success-soft p-4 text-sm text-success" role="status">
              {successMessage}
            </p>
          ) : null}

          <button
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Saving profile…" : "Save profile settings"}
          </button>
        </form>
      </section>
    </div>
  );
}
