import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getProfile,
  getProfileApiError,
  updateProfile,
} from "../api/profile";
import { useAuth } from "../auth/useAuth";
import { ProfileSettingsPage } from "./ProfileSettingsPage";

vi.mock("../api/profile", () => ({
  getProfile: vi.fn(),
  getProfileApiError: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("../auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedGetProfile = vi.mocked(getProfile);
const mockedUpdateProfile = vi.mocked(updateProfile);
const mockedGetProfileApiError = vi.mocked(getProfileApiError);
const mockedUseAuth = vi.mocked(useAuth);
const refreshUser = vi.fn();

const profile = {
  id: 42,
  fullName: "Registered Customer",
  email: "customer@example.com",
  role: "CUSTOMER" as const,
};

describe("ProfileSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: profile,
      isLoading: false,
      sessionError: null,
      login: vi.fn(),
      refreshUser,
      logout: vi.fn(),
    });
    mockedGetProfile.mockResolvedValue(profile);
    mockedGetProfileApiError.mockReturnValue({
      message: "Profile request failed.",
      fields: {},
    });
    refreshUser.mockResolvedValue(profile);
  });

  it("loads protected identity values and saves only the editable full name", async () => {
    const user = userEvent.setup();
    const updated = { ...profile, fullName: "Updated Customer" };
    mockedUpdateProfile.mockResolvedValue(updated);

    render(<ProfileSettingsPage />);

    expect(await screen.findByRole("heading", { name: "Profile settings" })).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("customer@example.com")).toBeInTheDocument();
    expect(screen.getByText("Customer")).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: /role/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();

    const fullName = screen.getByLabelText("Full name");
    await user.clear(fullName);
    await user.type(fullName, "  Updated    Customer  ");
    await user.click(screen.getByRole("button", { name: "Save profile settings" }));

    expect(mockedUpdateProfile).toHaveBeenCalledWith({ fullName: "Updated Customer" });
    expect(await screen.findByText("Profile settings updated successfully.")).toBeInTheDocument();
    expect(refreshUser).toHaveBeenCalledTimes(1);
  });

  it("validates an empty full name before calling the API", async () => {
    const user = userEvent.setup();
    render(<ProfileSettingsPage />);
    await screen.findByRole("heading", { name: "Profile settings" });

    await user.clear(screen.getByLabelText("Full name"));
    await user.click(screen.getByRole("button", { name: "Save profile settings" }));

    expect(screen.getByText("Full name is required.")).toBeInTheDocument();
    expect(mockedUpdateProfile).not.toHaveBeenCalled();
  });

  it("shows a safe API error and keeps the stored identity values visible", async () => {
    const user = userEvent.setup();
    mockedUpdateProfile.mockRejectedValue(new Error("failure"));
    mockedGetProfileApiError.mockReturnValue({
      code: "INTERNAL_ERROR",
      message: "The request could not be completed.",
      fields: {},
    });

    render(<ProfileSettingsPage />);
    await screen.findByRole("heading", { name: "Profile settings" });
    await user.click(screen.getByRole("button", { name: "Save profile settings" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The request could not be completed.");
    expect(screen.getByText("customer@example.com")).toBeInTheDocument();
    expect(screen.getByText("Customer")).toBeInTheDocument();
  });
});
