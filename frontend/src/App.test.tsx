import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerCustomer,
  type AuthUser,
} from "./api/auth";
import { getRoleAccess, type InternalRole } from "./api/roleAccess";

vi.mock("axios");
vi.mock("./api/auth", () => ({
  getCurrentUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  registerCustomer: vi.fn(),
  getApiErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback,
}));
vi.mock("./api/roleAccess", () => ({
  getRoleAccess: vi.fn(),
  isCanceledRequest: () => false,
  isInternalRole: (role: string) => role !== "CUSTOMER",
  roleAccessPagePaths: {
    ADMINISTRATOR: "/access/administrator",
    SUPPLIER: "/access/supplier",
    INVENTORY_MANAGER: "/access/inventory-manager",
    PRODUCTION_MANAGER: "/access/production-manager",
    SALES_OFFICER: "/access/sales-officer",
  },
}));

const mockedAxios = vi.mocked(axios, true);
const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const mockedLoginUser = vi.mocked(loginUser);
const mockedLogoutUser = vi.mocked(logoutUser);
const mockedRegisterCustomer = vi.mocked(registerCustomer);
const mockedGetRoleAccess = vi.mocked(getRoleAccess);

const customer: AuthUser = {
  id: 1,
  fullName: "Registered Customer",
  email: "customer@example.com",
  role: "CUSTOMER",
};

const roleRoutes: Array<[InternalRole, string]> = [
  ["ADMINISTRATOR", "/access/administrator"],
  ["SUPPLIER", "/access/supplier"],
  ["INVENTORY_MANAGER", "/access/inventory-manager"],
  ["PRODUCTION_MANAGER", "/access/production-manager"],
  ["SALES_OFFICER", "/access/sales-officer"],
];

function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App authentication", () => {
  beforeEach(() => {
    mockedGetCurrentUser.mockResolvedValue(null);
    mockedAxios.get.mockResolvedValue({ data: { status: "ok" } });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("keeps the public home page available to guests", async () => {
    renderApp();

    expect(
      screen.getByRole("heading", { name: /textile & garment management system/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText("API connection available")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows a clear unavailable state when the API cannot be reached", async () => {
    mockedAxios.get.mockRejectedValue(new Error("network unavailable"));
    mockedAxios.isCancel.mockReturnValue(false);
    renderApp();

    expect(await screen.findByText("API connection unavailable")).toBeInTheDocument();
  });

  it("registers a customer without sending a selectable role", async () => {
    mockedRegisterCustomer.mockResolvedValue({
      message: "Account created successfully.",
      user: customer,
    });
    const user = userEvent.setup();
    renderApp("/register");

    await user.type(screen.getByLabelText("Full name"), customer.fullName);
    await user.type(screen.getByLabelText("Email address"), customer.email);
    await user.type(
      screen.getByLabelText(/^Password/),
      "secure-pass-123",
    );
    await user.type(screen.getByLabelText("Confirm password"), "secure-pass-123");
    await user.click(screen.getByRole("button", { name: "Create customer account" }));

    expect(
      await screen.findByRole("heading", { name: "Registration complete" }),
    ).toBeInTheDocument();
    expect(mockedRegisterCustomer).toHaveBeenCalledWith({
      fullName: customer.fullName,
      email: customer.email,
      password: "secure-pass-123",
    });
  });

  it("logs in a valid user and restores the public landing page", async () => {
    mockedLoginUser.mockResolvedValue({ message: "Login successful.", user: customer });
    const user = userEvent.setup();
    renderApp("/login");

    await user.type(screen.getByLabelText("Email address"), customer.email);
    await user.type(screen.getByLabelText("Password"), "secure-pass-123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText(/Registered Customer · CUSTOMER/i)).toBeInTheDocument();
    expect(mockedLoginUser).toHaveBeenCalledWith({
      email: customer.email,
      password: "secure-pass-123",
    });
  });

  it("shows the server login error without exposing account details", async () => {
    mockedLoginUser.mockRejectedValue(new Error("Invalid email or password."));
    const user = userEvent.setup();
    renderApp("/login");

    await user.type(screen.getByLabelText("Email address"), "missing@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
  });

  it("logs out an authenticated user and returns to guest actions", async () => {
    mockedGetCurrentUser.mockResolvedValue(customer);
    mockedLogoutUser.mockResolvedValue();
    const user = userEvent.setup();
    renderApp();

    await user.click(await screen.findByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(mockedLogoutUser).toHaveBeenCalledOnce());
    expect(await screen.findByRole("link", { name: "Sign in" })).toBeInTheDocument();
  });

  it.each(roleRoutes)("allows %s to open its protected page", async (role, path) => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role });
    mockedGetRoleAccess.mockResolvedValue({ role, message: "Role access confirmed." });
    renderApp(path);

    expect(await screen.findByText("Role access confirmed.")).toBeInTheDocument();
    expect(screen.getByText(`The server authorized ${role.replaceAll("_", " ")}.`))
      .toBeInTheDocument();
    expect(mockedGetRoleAccess).toHaveBeenCalledWith(role, expect.any(AbortSignal));
  });

  it.each(roleRoutes)("denies CUSTOMER access to the %s page", async (_role, path) => {
    mockedGetCurrentUser.mockResolvedValue(customer);
    renderApp(path);

    expect(await screen.findByRole("heading", { name: "Access forbidden" }))
      .toBeInTheDocument();
    expect(mockedGetRoleAccess).not.toHaveBeenCalled();
  });

  it("shows an authentication-required state for a guest protected-route request", async () => {
    renderApp("/access/administrator");

    expect(await screen.findByRole("heading", { name: "Authentication required" }))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(mockedGetRoleAccess).not.toHaveBeenCalled();
  });
});
