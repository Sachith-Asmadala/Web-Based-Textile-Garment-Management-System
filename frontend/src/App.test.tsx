import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
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
  type UserRole,
} from "./api/auth";
import { getRoleAccess, type InternalRole } from "./api/roleAccess";
import {
  createProduct,
  discontinueProduct,
  getCatalogProduct,
  getCatalogProducts,
  getProduct,
  updateProduct,
  type CreateProductResponse,
  type DiscontinueProductResponse,
  type UpdateProductResponse,
} from "./api/products";
import {
  archiveMaterialSupply,
  createMaterialSupply,
  getMaterialSupply,
  getMaterialSupplies,
  updateMaterialSupply,
  type CreateMaterialSupplyResponse,
  type ArchiveMaterialSupplyResponse,
  type MaterialSupply,
  type MaterialSupplyListItem,
  type UpdateMaterialSupplyResponse,
} from "./api/materialSupplies";
import {
  getSupplierProfile,
  saveSupplierProfile,
  type SaveSupplierProfileResponse,
  type SupplierProfile,
} from "./api/supplierProfile";
import {
  dashboardPagePaths,
  getEditProductPagePath,
  getEditMaterialSupplyPagePath,
  newProductPagePath,
  productCatalogPagePath,
  getProductDetailPagePath,
  materialSupplyListPagePath,
  newMaterialSupplyPagePath,
  roleLabels,
  supplierProfilePagePath,
} from "./navigation/navigation";

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
vi.mock("./api/products", () => ({
  createProduct: vi.fn(),
  discontinueProduct: vi.fn(),
  getCatalogProduct: vi.fn(),
  getCatalogProducts: vi.fn(),
  getProduct: vi.fn(),
  updateProduct: vi.fn(),
  getProductApiError: (error: unknown, fallback: string) => {
    const details = typeof error === "object" && error !== null
      ? error as { code?: string; status?: number }
      : {};
    return {
      code: details.code,
      message: error instanceof Error ? error.message : fallback,
      fields: {},
      status: details.status,
    };
  },
}));
vi.mock("./api/materialSupplies", () => ({
  archiveMaterialSupply: vi.fn(),
  createMaterialSupply: vi.fn(),
  getMaterialSupply: vi.fn(),
  getMaterialSupplies: vi.fn(),
  updateMaterialSupply: vi.fn(),
  getMaterialSupplyApiError: (error: unknown, fallback: string) => {
    const details = typeof error === "object" && error !== null
      ? error as { code?: string; fields?: Record<string, string>; status?: number }
      : {};
    return {
      code: details.code,
      fields: details.fields ?? {},
      message: error instanceof Error ? error.message : fallback,
      status: details.status,
    };
  },
}));
vi.mock("./api/supplierProfile", () => ({
  getSupplierProfile: vi.fn(),
  saveSupplierProfile: vi.fn(),
  getSupplierProfileApiError: (error: unknown, fallback: string) => {
    const details = typeof error === "object" && error !== null
      ? error as { code?: string; fields?: Record<string, string>; status?: number }
      : {};
    return {
      code: details.code,
      fields: details.fields ?? {},
      message: error instanceof Error ? error.message : fallback,
      status: details.status,
    };
  },
}));

const mockedAxios = vi.mocked(axios, true);
const mockedGetCurrentUser = vi.mocked(getCurrentUser);
const mockedLoginUser = vi.mocked(loginUser);
const mockedLogoutUser = vi.mocked(logoutUser);
const mockedRegisterCustomer = vi.mocked(registerCustomer);
const mockedGetRoleAccess = vi.mocked(getRoleAccess);
const mockedCreateProduct = vi.mocked(createProduct);
const mockedDiscontinueProduct = vi.mocked(discontinueProduct);
const mockedGetCatalogProduct = vi.mocked(getCatalogProduct);
const mockedGetCatalogProducts = vi.mocked(getCatalogProducts);
const mockedGetProduct = vi.mocked(getProduct);
const mockedUpdateProduct = vi.mocked(updateProduct);
const mockedCreateMaterialSupply = vi.mocked(createMaterialSupply);
const mockedArchiveMaterialSupply = vi.mocked(archiveMaterialSupply);
const mockedGetMaterialSupply = vi.mocked(getMaterialSupply);
const mockedGetMaterialSupplies = vi.mocked(getMaterialSupplies);
const mockedUpdateMaterialSupply = vi.mocked(updateMaterialSupply);
const mockedGetSupplierProfile = vi.mocked(getSupplierProfile);
const mockedSaveSupplierProfile = vi.mocked(saveSupplierProfile);

const customer: AuthUser = {
  id: 1,
  fullName: "Registered Customer",
  email: "customer@example.com",
  role: "CUSTOMER",
};

const savedProductResponse: CreateProductResponse = {
  message: "Garment product created successfully.",
  product: {
    id: 41,
    categoryId: 12,
    name: "Oxford Shirt",
    description: null,
    status: "ACTIVE",
    createdAt: "2026-08-23T05:30:00Z",
    updatedAt: "2026-08-23T05:30:00Z",
    category: {
      id: 12,
      name: "Formal Wear",
      description: null,
      status: "ACTIVE",
      createdAt: "2026-08-23T05:30:00Z",
      updatedAt: "2026-08-23T05:30:00Z",
    },
    variants: [
      {
        id: 73,
        productId: 41,
        size: "L",
        color: "White",
        price: "3990.00",
        status: "UNAVAILABLE",
        createdAt: "2026-08-23T05:30:00Z",
        updatedAt: "2026-08-23T05:30:00Z",
      },
    ],
  },
};

const catalogProduct = {
  ...savedProductResponse.product,
  name: "Classic Crew Neck",
  description: "Soft cotton crew neck for everyday wear.",
  category: {
    ...savedProductResponse.product.category,
    description: "Smart and casual garments.",
  },
  variants: [
    {
      ...savedProductResponse.product.variants[0],
      size: "M",
      color: "Navy Blue",
      price: "2499.90",
      status: "AVAILABLE" as const,
    },
  ],
};

const updatedProductResponse: UpdateProductResponse = {
  message: "Garment product updated successfully.",
  product: {
    ...catalogProduct,
    name: "Updated Crew Neck",
    variants: [
      {
        ...catalogProduct.variants[0],
        size: "L",
        color: "Forest Green",
        price: "2799.50",
        status: "UNAVAILABLE",
      },
    ],
  },
};

const discontinuedProductResponse: DiscontinueProductResponse = {
  message: "Garment product discontinued successfully.",
  product: {
    ...catalogProduct,
    status: "DISCONTINUED",
    variants: catalogProduct.variants.map((variant) => ({
      ...variant,
      status: "DISCONTINUED",
    })),
  },
};

const supplierProfile: SupplierProfile = {
  id: 91,
  userId: 1,
  businessName: "Lanka Textiles",
  contactPhone: "+94 77 123 4567",
  address: "12 Main Street, Colombo",
  createdAt: "2026-08-23T05:30:00Z",
  updatedAt: "2026-08-23T05:30:00Z",
};

const materialSupply: MaterialSupply = {
  id: 101,
  supplierId: supplierProfile.id,
  materialCode: "FAB-COT-001",
  materialName: "Cotton twill fabric",
  materialDescription: "Durable 240 GSM cotton twill",
  quantity: "1250.750",
  unitOfMeasure: "metre",
  unitPrice: "845.50",
  deliveryLeadTimeDays: 7,
  deliveryNotes: "Deliver to the main receiving bay",
  status: "ACTIVE",
  createdAt: "2026-08-23T07:00:00Z",
  updatedAt: "2026-08-23T07:00:00Z",
};

const listedMaterialSupply: MaterialSupplyListItem = {
  ...materialSupply,
  supplierBusinessName: supplierProfile.businessName,
};

const roleRoutes: Array<[InternalRole, string]> = [
  ["ADMINISTRATOR", "/access/administrator"],
  ["SUPPLIER", "/access/supplier"],
  ["INVENTORY_MANAGER", "/access/inventory-manager"],
  ["PRODUCTION_MANAGER", "/access/production-manager"],
  ["SALES_OFFICER", "/access/sales-officer"],
];

const dashboardRoutes: Array<[UserRole, string]> = [
  ["ADMINISTRATOR", dashboardPagePaths.ADMINISTRATOR],
  ["SUPPLIER", dashboardPagePaths.SUPPLIER],
  ["INVENTORY_MANAGER", dashboardPagePaths.INVENTORY_MANAGER],
  ["PRODUCTION_MANAGER", dashboardPagePaths.PRODUCTION_MANAGER],
  ["SALES_OFFICER", dashboardPagePaths.SALES_OFFICER],
  ["CUSTOMER", dashboardPagePaths.CUSTOMER],
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
    mockedGetCatalogProduct.mockResolvedValue(catalogProduct);
    mockedGetCatalogProducts.mockResolvedValue([]);
    mockedGetProduct.mockResolvedValue(catalogProduct);
    mockedGetSupplierProfile.mockRejectedValue(Object.assign(
      new Error("No supplier profile exists for this account."),
      { code: "SUPPLIER_PROFILE_NOT_FOUND", status: 404 },
    ));
    mockedSaveSupplierProfile.mockRejectedValue(new Error("Unexpected supplier save."));
    mockedCreateMaterialSupply.mockRejectedValue(new Error("Unexpected material supply save."));
    mockedArchiveMaterialSupply.mockRejectedValue(new Error("Unexpected material supply archive."));
    mockedGetMaterialSupply.mockRejectedValue(new Error("Unexpected material supply load."));
    mockedGetMaterialSupplies.mockResolvedValue([]);
    mockedUpdateMaterialSupply.mockRejectedValue(new Error("Unexpected material supply update."));
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

    const navigation = await screen.findByRole("navigation", {
      name: "Primary navigation",
    });
    expect(within(navigation).getByRole("link", { name: /customer dashboard/i }))
      .toBeInTheDocument();
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

  it.each(dashboardRoutes)(
    "shows only the %s dashboard navigation for that role",
    async (role) => {
      mockedGetCurrentUser.mockResolvedValue({ ...customer, role });
      renderApp();

      const navigation = await screen.findByRole("navigation", {
        name: "Primary navigation",
      });
      expect(
        within(navigation).getByRole("link", {
          name: new RegExp(`${roleLabels[role]} dashboard`, "i"),
        }),
      ).toBeInTheDocument();

      for (const [otherRole] of dashboardRoutes) {
        if (otherRole !== role) {
          expect(
            within(navigation).queryByRole("link", {
              name: new RegExp(`${roleLabels[otherRole]} dashboard`, "i"),
            }),
          ).not.toBeInTheDocument();
        }
      }

      if (role === "CUSTOMER") {
        expect(
          within(navigation).queryByRole("link", { name: /authorization check/i }),
        ).not.toBeInTheDocument();
      } else {
        expect(
          within(navigation).getByRole("link", { name: /authorization check/i }),
        ).toBeInTheDocument();
      }
    },
  );

  it.each(dashboardRoutes)("allows %s to open its dashboard", async (role, path) => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role });
    renderApp(path);

    expect(
      await screen.findByRole("heading", {
        name: `${roleLabels[role]} dashboard`,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No dashboard activity yet" }))
      .toBeInTheDocument();
  });

  it("denies direct access to another role dashboard", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    renderApp(dashboardPagePaths.ADMINISTRATOR);

    expect(await screen.findByRole("heading", { name: "Access forbidden" }))
      .toBeInTheDocument();
  });

  it("lets a Sales Officer save a valid garment product", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SALES_OFFICER" });
    mockedCreateProduct.mockResolvedValue(savedProductResponse);
    const user = userEvent.setup();
    renderApp(newProductPagePath);

    await user.type(await screen.findByLabelText("Product name"), "Oxford Shirt");
    await user.type(screen.getByLabelText("Category"), "Formal Wear");
    await user.type(screen.getByLabelText("Size"), "L");
    await user.type(screen.getByLabelText("Color"), "White");
    await user.type(screen.getByLabelText("Price"), "3990.00");
    await user.selectOptions(screen.getByLabelText("Availability"), "UNAVAILABLE");
    await user.click(screen.getByRole("button", { name: "Save garment product" }));

    expect(await screen.findByText("Product saved")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Oxford Shirt" })).toBeInTheDocument();
    expect(mockedCreateProduct).toHaveBeenCalledWith({
      name: "Oxford Shirt",
      category: "Formal Wear",
      size: "L",
      color: "White",
      price: "3990.00",
      availability: "UNAVAILABLE",
    });
  });

  it("blocks incomplete and invalid product values before calling the API", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SALES_OFFICER" });
    const user = userEvent.setup();
    renderApp(newProductPagePath);

    await user.type(await screen.findByLabelText("Product name"), "   ");
    await user.type(screen.getByLabelText("Price"), "0");
    await user.click(screen.getByRole("button", { name: "Save garment product" }));

    expect(await screen.findByText("Product name is required.")).toBeInTheDocument();
    expect(screen.getByText("Category is required.")).toBeInTheDocument();
    expect(screen.getByText("Size is required.")).toBeInTheDocument();
    expect(screen.getByText("Color is required.")).toBeInTheDocument();
    expect(screen.getByText(/Price must be positive/)).toBeInTheDocument();
    expect(mockedCreateProduct).not.toHaveBeenCalled();
  });

  it("shows a clear product API error and keeps the form available", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SALES_OFFICER" });
    mockedCreateProduct.mockRejectedValue(
      new Error("The selected category is inactive and cannot receive new products."),
    );
    const user = userEvent.setup();
    renderApp(newProductPagePath);

    await user.type(await screen.findByLabelText("Product name"), "Oxford Shirt");
    await user.type(screen.getByLabelText("Category"), "Archived Range");
    await user.type(screen.getByLabelText("Size"), "L");
    await user.type(screen.getByLabelText("Color"), "White");
    await user.type(screen.getByLabelText("Price"), "3990.00");
    await user.click(screen.getByRole("button", { name: "Save garment product" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The selected category is inactive and cannot receive new products.",
    );
    expect(screen.getByRole("button", { name: "Save garment product" })).toBeEnabled();
  });

  it("shows product creation navigation only to the Sales Officer", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SALES_OFFICER" });
    const salesOfficerView = renderApp();

    const salesNavigation = await screen.findByRole("navigation", {
      name: "Primary navigation",
    });
    expect(within(salesNavigation).getByRole("link", { name: /add garment product/i }))
      .toHaveAttribute("href", newProductPagePath);

    salesOfficerView.unmount();
    mockedGetCurrentUser.mockResolvedValue(customer);
    const customerView = renderApp();
    const customerNavigation = await screen.findByRole("navigation", {
      name: "Primary navigation",
    });
    expect(within(customerNavigation).queryByRole("link", { name: /add garment product/i }))
      .not.toBeInTheDocument();

    customerView.unmount();
    renderApp(newProductPagePath);
    expect(await screen.findByRole("heading", { name: "Access forbidden" }))
      .toBeInTheDocument();
  });

  it("preloads and updates a product while preserving its stable IDs", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SALES_OFFICER" });
    mockedUpdateProduct.mockResolvedValue(updatedProductResponse);
    const user = userEvent.setup();
    renderApp(getEditProductPagePath(catalogProduct.id));

    expect(await screen.findByRole("heading", { name: "Edit garment product" }))
      .toBeInTheDocument();
    expect(screen.getByLabelText("Product name")).toHaveValue(catalogProduct.name);
    expect(screen.getByLabelText("Category")).toHaveValue(catalogProduct.category.name);
    expect(screen.getByLabelText("Size")).toHaveValue("M");
    expect(screen.getByLabelText("Color")).toHaveValue("Navy Blue");
    expect(screen.getByLabelText("Price")).toHaveValue("2499.90");

    await user.clear(screen.getByLabelText("Product name"));
    await user.type(screen.getByLabelText("Product name"), " Updated Crew Neck ");
    await user.clear(screen.getByLabelText("Size"));
    await user.type(screen.getByLabelText("Size"), " L ");
    await user.clear(screen.getByLabelText("Color"));
    await user.type(screen.getByLabelText("Color"), " Forest Green ");
    await user.clear(screen.getByLabelText("Price"));
    await user.type(screen.getByLabelText("Price"), "2799.50");
    await user.selectOptions(screen.getByLabelText("Availability"), "UNAVAILABLE");
    await user.click(screen.getByRole("button", { name: "Update garment product" }));

    expect(await screen.findByText(/Garment product updated successfully/))
      .toHaveTextContent(`Product ID ${catalogProduct.id}`);
    expect(screen.getByText(/Garment product updated successfully/))
      .toHaveTextContent(`variant ID ${catalogProduct.variants[0].id}`);
    expect(mockedGetProduct).toHaveBeenCalledWith(
      catalogProduct.id,
      expect.any(AbortSignal),
    );
    expect(mockedUpdateProduct).toHaveBeenCalledWith(catalogProduct.id, {
      variantId: catalogProduct.variants[0].id,
      name: "Updated Crew Neck",
      category: catalogProduct.category.name,
      size: "L",
      color: "Forest Green",
      price: "2799.50",
      availability: "UNAVAILABLE",
    });
    expect(screen.getByLabelText("Product name")).toHaveValue("Updated Crew Neck");
  });

  it("reuses create validation and blocks an invalid product update", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SALES_OFFICER" });
    const user = userEvent.setup();
    renderApp(getEditProductPagePath(catalogProduct.id));

    await screen.findByRole("heading", { name: "Edit garment product" });
    await user.clear(screen.getByLabelText("Product name"));
    await user.clear(screen.getByLabelText("Price"));
    await user.type(screen.getByLabelText("Price"), "0");
    await user.click(screen.getByRole("button", { name: "Update garment product" }));

    expect(screen.getByText("Product name is required.")).toBeInTheDocument();
    expect(screen.getByText(/Price must be positive/)).toBeInTheDocument();
    expect(mockedUpdateProduct).not.toHaveBeenCalled();
  });

  it("protects the product editor from non-Sales-Officer users", async () => {
    mockedGetCurrentUser.mockResolvedValue(customer);
    renderApp(getEditProductPagePath(catalogProduct.id));

    expect(await screen.findByRole("heading", { name: "Access forbidden" }))
      .toBeInTheDocument();
    expect(mockedGetProduct).not.toHaveBeenCalled();
  });

  it("requires confirmation before discontinuing and preserves the product record", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SALES_OFFICER" });
    mockedDiscontinueProduct.mockResolvedValue(discontinuedProductResponse);
    const user = userEvent.setup();
    renderApp(getEditProductPagePath(catalogProduct.id));

    await screen.findByRole("heading", { name: "Edit garment product" });
    await user.click(screen.getByRole("button", { name: "Discontinue product" }));

    expect(mockedDiscontinueProduct).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog", { name: "Confirm product discontinuation" }))
      .toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Keep product active" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Discontinue product" }));
    await user.click(screen.getByRole("button", { name: "Confirm discontinuation" }));

    expect(await screen.findByRole("heading", { name: "Product discontinued" }))
      .toBeInTheDocument();
    expect(screen.getByText(/historical references/i))
      .toHaveTextContent(`Product ID ${catalogProduct.id}`);
    expect(mockedDiscontinueProduct).toHaveBeenCalledWith(catalogProduct.id);
  });

  it("keeps confirmation available when discontinuation fails", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SALES_OFFICER" });
    mockedDiscontinueProduct.mockRejectedValue(new Error("Lifecycle service unavailable."));
    const user = userEvent.setup();
    renderApp(getEditProductPagePath(catalogProduct.id));

    await screen.findByRole("heading", { name: "Edit garment product" });
    await user.click(screen.getByRole("button", { name: "Discontinue product" }));
    await user.click(screen.getByRole("button", { name: "Confirm discontinuation" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Lifecycle service unavailable.",
    );
    expect(screen.getByRole("alertdialog", { name: "Confirm product discontinuation" }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm discontinuation" })).toBeEnabled();
  });

  it("shows the reusable loading state while the public catalog is fetched", () => {
    mockedGetCatalogProducts.mockReturnValue(new Promise(() => undefined));
    renderApp(productCatalogPagePath);

    expect(screen.getByRole("status")).toHaveTextContent("Loading garment catalog");
  });

  it("lets a guest browse available product summaries", async () => {
    mockedGetCatalogProducts.mockResolvedValue([catalogProduct]);
    renderApp(productCatalogPagePath);

    expect(await screen.findByRole("heading", { name: "Garment catalog" }))
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Classic Crew Neck" }))
      .toBeInTheDocument();
    expect(screen.getByText("Formal Wear")).toBeInTheDocument();
    expect(screen.getByText("M · Navy Blue")).toBeInTheDocument();
    expect(screen.getByText("Price 2499.90")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View product details" }))
      .toHaveAttribute("href", getProductDetailPagePath(catalogProduct.id));

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(within(navigation).getByRole("link", { name: /garment catalog/i }))
      .toHaveAttribute("href", productCatalogPagePath);
    expect(mockedGetCatalogProducts).toHaveBeenCalledWith(
      {},
      expect.any(AbortSignal),
    );
  });

  it("lets a registered customer open the same public catalog", async () => {
    mockedGetCurrentUser.mockResolvedValue(customer);
    mockedGetCatalogProducts.mockResolvedValue([catalogProduct]);
    renderApp(productCatalogPagePath);

    expect(await screen.findByRole("heading", { name: "Classic Crew Neck" }))
      .toBeInTheDocument();
    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(within(navigation).getByRole("link", { name: /garment catalog/i }))
      .toBeInTheDocument();
  });

  it("shows a clear empty state when no products are publicly available", async () => {
    renderApp(productCatalogPagePath);

    expect(await screen.findByRole("heading", { name: "No garments available" }))
      .toBeInTheDocument();
    expect(screen.getByText(/no active garments with available size and color/i))
      .toBeInTheDocument();
  });

  it("shows a catalog error and retries the query", async () => {
    mockedGetCatalogProducts
      .mockRejectedValueOnce(new Error("Catalog service unavailable."))
      .mockResolvedValueOnce([catalogProduct]);
    const user = userEvent.setup();
    renderApp(productCatalogPagePath);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Catalog service unavailable.",
    );
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByRole("heading", { name: "Classic Crew Neck" }))
      .toBeInTheDocument();
    expect(mockedGetCatalogProducts).toHaveBeenCalledTimes(2);
  });

  it("submits normalized combined catalog filters to the API", async () => {
    mockedGetCatalogProducts.mockResolvedValue([catalogProduct]);
    const user = userEvent.setup();
    renderApp(productCatalogPagePath);

    expect(await screen.findByRole("heading", { name: "Classic Crew Neck" }))
      .toBeInTheDocument();
    await user.type(screen.getByLabelText("Product name"), "  Classic  ");
    await user.type(screen.getByLabelText("Category"), "  Formal Wear  ");
    await user.type(screen.getByLabelText("Size"), " M ");
    await user.type(screen.getByLabelText("Color"), " Navy Blue ");
    await user.selectOptions(screen.getByLabelText("Availability"), "AVAILABLE");
    await user.click(screen.getByRole("button", { name: "Search catalog" }));

    await waitFor(() => expect(mockedGetCatalogProducts).toHaveBeenLastCalledWith(
      {
        search: "Classic",
        category: "Formal Wear",
        size: "M",
        color: "Navy Blue",
        availability: "AVAILABLE",
      },
      expect.any(AbortSignal),
    ));
  });

  it("shows no results and clearing filters restores the permitted catalog", async () => {
    mockedGetCatalogProducts
      .mockResolvedValueOnce([catalogProduct])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([catalogProduct]);
    const user = userEvent.setup();
    renderApp(productCatalogPagePath);

    expect(await screen.findByRole("heading", { name: "Classic Crew Neck" }))
      .toBeInTheDocument();
    await user.type(screen.getByLabelText("Product name"), "Missing product");
    await user.click(screen.getByRole("button", { name: "Search catalog" }));

    expect(await screen.findByRole("heading", { name: "No matching garments" }))
      .toBeInTheDocument();
    expect(screen.getByText(/match all of the selected filters/i)).toBeInTheDocument();
    const clearButtons = screen.getAllByRole("button", { name: "Clear filters" });
    await user.click(clearButtons.at(-1)!);

    expect(await screen.findByRole("heading", { name: "Classic Crew Neck" }))
      .toBeInTheDocument();
    expect(screen.getByLabelText("Product name")).toHaveValue("");
    expect(mockedGetCatalogProducts).toHaveBeenLastCalledWith(
      {},
      expect.any(AbortSignal),
    );
  });

  it("shows a loading state while product details are fetched", () => {
    mockedGetCatalogProduct.mockReturnValue(new Promise(() => undefined));
    renderApp(getProductDetailPagePath(catalogProduct.id));

    expect(screen.getByRole("status")).toHaveTextContent("Loading product details");
  });

  it("opens a public product detail page with stored variant data", async () => {
    renderApp(getProductDetailPagePath(catalogProduct.id));

    expect(await screen.findByRole("heading", { name: "Classic Crew Neck" }))
      .toBeInTheDocument();
    expect(screen.getByText("Soft cotton crew neck for everyday wear."))
      .toBeInTheDocument();
    expect(screen.getByText("Smart and casual garments.")).toBeInTheDocument();
    expect(screen.getByText(String(catalogProduct.id))).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "M · Navy Blue" })).toBeInTheDocument();
    expect(screen.getByText("2499.90")).toBeInTheDocument();
    expect(screen.getAllByText("available").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Back to garment catalog" })[0])
      .toHaveAttribute("href", productCatalogPagePath);
    expect(mockedGetCatalogProduct).toHaveBeenCalledWith(
      catalogProduct.id,
      expect.any(AbortSignal),
    );
  });

  it("handles an invalid product route without calling the API", async () => {
    renderApp("/products/not-a-valid-id");

    expect(await screen.findByRole("heading", { name: "Product not found" }))
      .toBeInTheDocument();
    expect(mockedGetCatalogProduct).not.toHaveBeenCalled();
  });

  it("shows a safe product-not-found state for a missing public product", async () => {
    mockedGetCatalogProduct.mockRejectedValue(Object.assign(
      new Error("The requested garment product was not found."),
      { code: "PRODUCT_NOT_FOUND", status: 404 },
    ));
    renderApp("/products/999999");

    expect(await screen.findByRole("heading", { name: "Product not found" }))
      .toBeInTheDocument();
    expect(screen.getByText(/does not exist or is not currently available/i))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to garment catalog" }))
      .toBeInTheDocument();
  });

  it("shows a product detail error and retries safely", async () => {
    mockedGetCatalogProduct
      .mockRejectedValueOnce(new Error("Product service unavailable."))
      .mockResolvedValueOnce(catalogProduct);
    const user = userEvent.setup();
    renderApp(getProductDetailPagePath(catalogProduct.id));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Product service unavailable.",
    );
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByRole("heading", { name: "Classic Crew Neck" }))
      .toBeInTheDocument();
    expect(mockedGetCatalogProduct).toHaveBeenCalledTimes(2);
  });

  it("creates the logged-in supplier's profile without sending an owner ID", async () => {
    const createdResponse: SaveSupplierProfileResponse = {
      message: "Supplier profile created successfully.",
      profile: supplierProfile,
    };
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    mockedSaveSupplierProfile.mockResolvedValue(createdResponse);
    const user = userEvent.setup();
    renderApp(supplierProfilePagePath);

    expect(await screen.findByRole("heading", { name: "Create supplier profile" }))
      .toBeInTheDocument();
    expect(screen.getByText(/no supplier profile exists yet/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Business name"), "  Lanka   Textiles  ");
    await user.type(screen.getByLabelText("Contact phone"), "  +94 77 123 4567  ");
    await user.type(screen.getByLabelText("Address"), "  12 Main Street,   Colombo  ");
    await user.click(screen.getByRole("button", { name: "Create supplier profile" }));

    expect(mockedSaveSupplierProfile).toHaveBeenCalledWith({
      businessName: "Lanka Textiles",
      contactPhone: "+94 77 123 4567",
      address: "12 Main Street, Colombo",
    });
    expect(await screen.findByText(/supplier profile created successfully/i))
      .toHaveTextContent("Supplier ID 91");
    expect(screen.getByRole("heading", { name: "Edit supplier profile" }))
      .toBeInTheDocument();
  });

  it("preloads and updates the logged-in supplier's existing profile", async () => {
    const updatedProfile = {
      ...supplierProfile,
      businessName: "Lanka Sustainable Textiles",
      updatedAt: "2026-08-23T06:30:00Z",
    };
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    mockedGetSupplierProfile.mockResolvedValue(supplierProfile);
    mockedSaveSupplierProfile.mockResolvedValue({
      message: "Supplier profile updated successfully.",
      profile: updatedProfile,
    });
    const user = userEvent.setup();
    renderApp(supplierProfilePagePath);

    expect(await screen.findByRole("heading", { name: "Edit supplier profile" }))
      .toBeInTheDocument();
    const businessName = screen.getByLabelText("Business name");
    expect(businessName).toHaveValue("Lanka Textiles");
    expect(screen.getByLabelText("Contact phone")).toHaveValue(supplierProfile.contactPhone);
    expect(screen.getByLabelText("Address")).toHaveValue(supplierProfile.address);

    await user.clear(businessName);
    await user.type(businessName, updatedProfile.businessName);
    await user.click(screen.getByRole("button", { name: "Update supplier profile" }));

    expect(mockedSaveSupplierProfile).toHaveBeenCalledWith({
      businessName: updatedProfile.businessName,
      contactPhone: supplierProfile.contactPhone,
      address: supplierProfile.address,
    });
    expect(await screen.findByText(/supplier profile updated successfully/i))
      .toHaveTextContent("Supplier ID 91");
    expect(businessName).toHaveValue(updatedProfile.businessName);
  });

  it("rejects incomplete supplier profile values before calling the API", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    const user = userEvent.setup();
    renderApp(supplierProfilePagePath);

    await screen.findByRole("heading", { name: "Create supplier profile" });
    await user.click(screen.getByRole("button", { name: "Create supplier profile" }));

    expect(screen.getByText("Business name is required.")).toBeInTheDocument();
    expect(screen.getByText("Contact phone is required.")).toBeInTheDocument();
    expect(screen.getByText("Address is required.")).toBeInTheDocument();
    expect(mockedSaveSupplierProfile).not.toHaveBeenCalled();
  });

  it("protects the supplier profile route and hides its navigation from customers", async () => {
    mockedGetCurrentUser.mockResolvedValue(customer);
    renderApp(supplierProfilePagePath);

    expect(await screen.findByRole("heading", { name: "Access forbidden" }))
      .toBeInTheDocument();
    expect(mockedGetSupplierProfile).not.toHaveBeenCalled();

    cleanup();
    renderApp();
    const navigation = await screen.findByRole("navigation", {
      name: "Primary navigation",
    });
    expect(within(navigation).queryByRole("link", { name: "Supplier profile" }))
      .not.toBeInTheDocument();
  });

  it("shows a supplier profile load error and retries", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    mockedGetSupplierProfile
      .mockRejectedValueOnce(new Error("Supplier service unavailable."))
      .mockResolvedValueOnce(supplierProfile);
    const user = userEvent.setup();
    renderApp(supplierProfilePagePath);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Supplier service unavailable.",
    );
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByRole("heading", { name: "Edit supplier profile" }))
      .toBeInTheDocument();
    expect(mockedGetSupplierProfile).toHaveBeenCalledTimes(2);
  });

  it("creates a material supply under the logged-in supplier and shows the saved record", async () => {
    const createdResponse: CreateMaterialSupplyResponse = {
      message: "Material supply created successfully.",
      supply: materialSupply,
    };
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    mockedGetSupplierProfile.mockResolvedValue(supplierProfile);
    mockedCreateMaterialSupply.mockResolvedValue(createdResponse);
    const user = userEvent.setup();
    renderApp(newMaterialSupplyPagePath);

    expect(await screen.findByRole("heading", { name: "Add material supply" }))
      .toBeInTheDocument();
    expect(screen.getByText(supplierProfile.businessName)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Material code"), "  FAB-COT-001  ");
    await user.type(screen.getByLabelText("Material name"), "  Cotton   twill fabric  ");
    await user.type(
      screen.getByLabelText("Material description (optional)"),
      "  Durable  240 GSM cotton twill  ",
    );
    await user.type(screen.getByLabelText("Quantity"), "1250.750");
    await user.type(screen.getByLabelText("Unit of measure"), " metre ");
    await user.type(screen.getByLabelText("Unit price"), "845.50");
    await user.type(screen.getByLabelText("Delivery lead time (days)"), "7");
    await user.type(
      screen.getByLabelText("Delivery notes (optional)"),
      " Deliver to the main receiving bay ",
    );
    await user.click(screen.getByRole("button", { name: "Save material supply" }));

    expect(mockedCreateMaterialSupply).toHaveBeenCalledWith({
      materialCode: "FAB-COT-001",
      materialName: "Cotton twill fabric",
      materialDescription: "Durable 240 GSM cotton twill",
      quantity: "1250.750",
      unitOfMeasure: "metre",
      unitPrice: "845.50",
      deliveryLeadTimeDays: "7",
      deliveryNotes: "Deliver to the main receiving bay",
    });
    expect(await screen.findByRole("heading", { name: materialSupply.materialName }))
      .toBeInTheDocument();
    expect(screen.getByText(/material supply created successfully/i))
      .toHaveTextContent(supplierProfile.businessName);
    expect(screen.getByText(String(materialSupply.id))).toBeInTheDocument();
  });

  it("blocks invalid material supply values before calling the API", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    mockedGetSupplierProfile.mockResolvedValue(supplierProfile);
    const user = userEvent.setup();
    renderApp(newMaterialSupplyPagePath);

    await screen.findByRole("heading", { name: "Add material supply" });
    await user.type(screen.getByLabelText("Quantity"), "-1");
    await user.type(screen.getByLabelText("Unit price"), "0");
    await user.type(screen.getByLabelText("Delivery lead time (days)"), "1.5");
    await user.click(screen.getByRole("button", { name: "Save material supply" }));

    expect(screen.getByText("Material code is required.")).toBeInTheDocument();
    expect(screen.getByText("Material name is required.")).toBeInTheDocument();
    expect(screen.getByText("Unit of measure is required.")).toBeInTheDocument();
    expect(screen.getByText(/quantity must be positive/i)).toBeInTheDocument();
    expect(screen.getByText(/unit price must be positive/i)).toBeInTheDocument();
    expect(screen.getByText(/delivery lead time must be a non-negative whole number/i))
      .toBeInTheDocument();
    expect(mockedCreateMaterialSupply).not.toHaveBeenCalled();
  });

  it("requires the supplier profile before showing the material supply form", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    renderApp(newMaterialSupplyPagePath);

    expect(await screen.findByRole("heading", { name: "Supplier profile required" }))
      .toBeInTheDocument();
    expect(screen.getByText(/create your supplier profile before adding/i))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create supplier profile" }))
      .toHaveAttribute("href", supplierProfilePagePath);
    expect(mockedCreateMaterialSupply).not.toHaveBeenCalled();
  });

  it("protects material supply creation and hides its navigation from customers", async () => {
    mockedGetCurrentUser.mockResolvedValue(customer);
    renderApp(newMaterialSupplyPagePath);

    expect(await screen.findByRole("heading", { name: "Access forbidden" }))
      .toBeInTheDocument();
    expect(mockedGetSupplierProfile).not.toHaveBeenCalled();
    expect(mockedCreateMaterialSupply).not.toHaveBeenCalled();

    cleanup();
    renderApp();
    const navigation = await screen.findByRole("navigation", {
      name: "Primary navigation",
    });
    expect(within(navigation).queryByRole("link", { name: "Add material supply" }))
      .not.toBeInTheDocument();
  });

  it("shows only the supplier-scoped supply response and applies combined filters", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    mockedGetMaterialSupplies
      .mockResolvedValueOnce([listedMaterialSupply])
      .mockResolvedValueOnce([listedMaterialSupply]);
    const user = userEvent.setup();
    renderApp(materialSupplyListPagePath);

    expect(await screen.findByRole("heading", { name: "My material supplies" }))
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: listedMaterialSupply.materialName }))
      .toBeInTheDocument();
    expect(screen.queryByText(/supplier id/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add material supply" }))
      .toHaveAttribute("href", newMaterialSupplyPagePath);
    expect(screen.getByRole("link", { name: "Edit supply details" }))
      .toHaveAttribute("href", getEditMaterialSupplyPagePath(listedMaterialSupply.id));

    await user.type(screen.getByLabelText("Search supply records"), " cotton ");
    await user.selectOptions(screen.getByLabelText("Status"), "ACTIVE");
    await user.click(screen.getByRole("button", { name: "Search supplies" }));

    await waitFor(() => expect(mockedGetMaterialSupplies).toHaveBeenLastCalledWith(
      { search: "cotton", status: "ACTIVE" },
      expect.any(AbortSignal),
    ));

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(mockedGetMaterialSupplies).toHaveBeenLastCalledWith(
      {},
      expect.any(AbortSignal),
    ));
    expect(screen.getByLabelText("Search supply records")).toHaveValue("");
    expect(screen.getByLabelText("Status")).toHaveValue("");
  });

  it("shows supplier identity to authorized Inventory Managers and Administrators", async () => {
    for (const role of ["INVENTORY_MANAGER", "ADMINISTRATOR"] as const) {
      mockedGetCurrentUser.mockResolvedValue({ ...customer, role });
      mockedGetMaterialSupplies.mockResolvedValue([listedMaterialSupply]);
      renderApp(materialSupplyListPagePath);

      expect(await screen.findByRole("heading", { name: "Material supplies" }))
        .toBeInTheDocument();
      expect(await screen.findByText(new RegExp(listedMaterialSupply.supplierBusinessName)))
        .toHaveTextContent(`Supplier ID ${listedMaterialSupply.supplierId}`);
      expect(screen.queryByRole("link", { name: "Add material supply" }))
        .not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Edit supply details" }))
        .not.toBeInTheDocument();

      cleanup();
    }
  });

  it("shows clear no-results and load-error states for material supplies", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    const user = userEvent.setup();
    renderApp(materialSupplyListPagePath);

    expect(await screen.findByRole("heading", { name: "No material supplies" }))
      .toBeInTheDocument();
    await user.type(screen.getByLabelText("Search supply records"), "missing");
    await user.click(screen.getByRole("button", { name: "Search supplies" }));
    expect(await screen.findByRole("heading", { name: "No matching supplies" }))
      .toBeInTheDocument();

    cleanup();
    mockedGetMaterialSupplies.mockRejectedValue(new Error("Supply query unavailable."));
    renderApp(materialSupplyListPagePath);
    expect(await screen.findByRole("alert")).toHaveTextContent("Supply query unavailable.");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("protects material supply records from unapproved roles and navigation", async () => {
    mockedGetCurrentUser.mockResolvedValue(customer);
    renderApp(materialSupplyListPagePath);

    expect(await screen.findByRole("heading", { name: "Access forbidden" }))
      .toBeInTheDocument();
    expect(mockedGetMaterialSupplies).not.toHaveBeenCalled();

    cleanup();
    renderApp();
    const navigation = await screen.findByRole("navigation", {
      name: "Primary navigation",
    });
    expect(within(navigation).queryByRole("link", { name: "Material supplies" }))
      .not.toBeInTheDocument();
    expect(within(navigation).queryByRole("link", { name: "My material supplies" }))
      .not.toBeInTheDocument();
  });

  it("preloads and updates only the approved material supply details", async () => {
    const updatedSupply: MaterialSupply = {
      ...materialSupply,
      quantity: "900.250",
      unitPrice: "910.75",
      deliveryLeadTimeDays: 5,
      deliveryNotes: "Revised receiving window",
      updatedAt: "2026-08-23T08:30:00Z",
    };
    const updateResponse: UpdateMaterialSupplyResponse = {
      message: "Material supply updated successfully.",
      supply: updatedSupply,
    };
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    mockedGetMaterialSupply.mockResolvedValue(materialSupply);
    mockedUpdateMaterialSupply.mockResolvedValue(updateResponse);
    const user = userEvent.setup();
    renderApp(getEditMaterialSupplyPagePath(materialSupply.id));

    expect(await screen.findByRole("heading", { name: "Edit material supply" }))
      .toBeInTheDocument();
    expect(screen.getByText(materialSupply.materialCode)).toBeInTheDocument();
    expect(screen.getByText(materialSupply.unitOfMeasure)).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toHaveValue(materialSupply.quantity);
    expect(screen.getByLabelText("Unit price")).toHaveValue(materialSupply.unitPrice);
    expect(screen.getByLabelText("Delivery lead time (days)"))
      .toHaveValue(String(materialSupply.deliveryLeadTimeDays));

    await user.clear(screen.getByLabelText("Quantity"));
    await user.type(screen.getByLabelText("Quantity"), "900.250");
    await user.clear(screen.getByLabelText("Unit price"));
    await user.type(screen.getByLabelText("Unit price"), "910.75");
    await user.clear(screen.getByLabelText("Delivery lead time (days)"));
    await user.type(screen.getByLabelText("Delivery lead time (days)"), "5");
    await user.clear(screen.getByLabelText("Delivery notes (optional)"));
    await user.type(
      screen.getByLabelText("Delivery notes (optional)"),
      " Revised   receiving window ",
    );
    await user.click(screen.getByRole("button", { name: "Update supply details" }));

    expect(mockedUpdateMaterialSupply).toHaveBeenCalledWith(materialSupply.id, {
      quantity: "900.250",
      unitPrice: "910.75",
      deliveryLeadTimeDays: "5",
      deliveryNotes: "Revised receiving window",
    });
    expect(await screen.findByText(/material supply updated successfully/i))
      .toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toHaveValue(updatedSupply.quantity);
    expect(screen.getByRole("link", { name: "Back to my supplies" }))
      .toHaveAttribute("href", materialSupplyListPagePath);
  });

  it("blocks invalid material supply numeric updates before the API call", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    mockedGetMaterialSupply.mockResolvedValue(materialSupply);
    const user = userEvent.setup();
    renderApp(getEditMaterialSupplyPagePath(materialSupply.id));

    await screen.findByRole("heading", { name: "Edit material supply" });
    await user.clear(screen.getByLabelText("Quantity"));
    await user.type(screen.getByLabelText("Quantity"), "-1");
    await user.clear(screen.getByLabelText("Unit price"));
    await user.type(screen.getByLabelText("Unit price"), "0");
    await user.clear(screen.getByLabelText("Delivery lead time (days)"));
    await user.type(screen.getByLabelText("Delivery lead time (days)"), "1.5");
    await user.click(screen.getByRole("button", { name: "Update supply details" }));

    expect(screen.getByText(/quantity must be positive/i)).toBeInTheDocument();
    expect(screen.getByText(/unit price must be positive/i)).toBeInTheDocument();
    expect(screen.getByText(/delivery lead time must be a non-negative whole number/i))
      .toBeInTheDocument();
    expect(mockedUpdateMaterialSupply).not.toHaveBeenCalled();
  });

  it("handles missing supply IDs safely and protects the edit route", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    renderApp("/supplier/supplies/not-a-number/edit");

    expect(await screen.findByRole("heading", { name: "Material supply not found" }))
      .toBeInTheDocument();
    expect(mockedGetMaterialSupply).not.toHaveBeenCalled();

    cleanup();
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "ADMINISTRATOR" });
    renderApp(getEditMaterialSupplyPagePath(materialSupply.id));
    expect(await screen.findByRole("heading", { name: "Access forbidden" }))
      .toBeInTheDocument();
    expect(mockedGetMaterialSupply).not.toHaveBeenCalled();
  });

  it("shows a safe not-found state when an owned supply cannot be loaded", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    mockedGetMaterialSupply.mockRejectedValue(Object.assign(
      new Error("The requested material supply was not found."),
      { code: "MATERIAL_SUPPLY_NOT_FOUND", status: 404 },
    ));
    renderApp(getEditMaterialSupplyPagePath(materialSupply.id));

    expect(await screen.findByRole("heading", { name: "Material supply not found" }))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to my supplies" }))
      .toHaveAttribute("href", materialSupplyListPagePath);
  });

  it("requires confirmation and archives a supply while retaining its stable ID", async () => {
    const archivedSupply: MaterialSupply = {
      ...materialSupply,
      status: "DISCONTINUED",
      updatedAt: "2026-08-23T09:00:00Z",
    };
    const archiveResponse: ArchiveMaterialSupplyResponse = {
      message: "Material supply archived successfully.",
      supply: archivedSupply,
    };
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    mockedGetMaterialSupply.mockResolvedValue(materialSupply);
    mockedArchiveMaterialSupply.mockResolvedValue(archiveResponse);
    const user = userEvent.setup();
    renderApp(getEditMaterialSupplyPagePath(materialSupply.id));

    await screen.findByRole("heading", { name: "Edit material supply" });
    await user.click(screen.getByRole("button", { name: "Archive supply" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "No database record or stable ID will be deleted.",
    );
    expect(mockedArchiveMaterialSupply).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Keep supply active" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Archive supply" }));
    await user.click(screen.getByRole("button", { name: "Confirm archive" }));

    expect(mockedArchiveMaterialSupply).toHaveBeenCalledWith(materialSupply.id);
    expect(await screen.findByRole("heading", { name: "Material supply archived" }))
      .toBeInTheDocument();
    expect(screen.getByText("Material supply archived successfully.", { exact: false }))
      .toBeInTheDocument();
    expect(screen.getByText(String(materialSupply.id))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to my supplies" }))
      .toHaveAttribute("href", materialSupplyListPagePath);
  });

  it("shows retained archived supplies without editable controls", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    mockedGetMaterialSupply.mockResolvedValue({
      ...materialSupply,
      status: "DISCONTINUED",
    });
    renderApp(getEditMaterialSupplyPagePath(materialSupply.id));

    expect(await screen.findByRole("heading", { name: "Material supply archived" }))
      .toBeInTheDocument();
    expect(screen.getByText(/stable ID and complete record remain available/i))
      .toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Update supply details" }))
      .not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Archive supply" }))
      .not.toBeInTheDocument();
  });

  it("keeps archive confirmation open when the server rejects archival", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "SUPPLIER" });
    mockedGetMaterialSupply.mockResolvedValue(materialSupply);
    mockedArchiveMaterialSupply.mockRejectedValue(new Error("Archive service unavailable."));
    const user = userEvent.setup();
    renderApp(getEditMaterialSupplyPagePath(materialSupply.id));

    await screen.findByRole("heading", { name: "Edit material supply" });
    await user.click(screen.getByRole("button", { name: "Archive supply" }));
    await user.click(screen.getByRole("button", { name: "Confirm archive" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Archive service unavailable.");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("shows the reusable not-found page for an unknown route", async () => {
    renderApp("/not-a-real-page");

    expect(await screen.findByRole("heading", { name: "Page not found" }))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to overview" })).toBeInTheDocument();
  });

  it("shows the reusable loading state while a protected session is restored", () => {
    mockedGetCurrentUser.mockReturnValue(new Promise(() => undefined));
    renderApp(dashboardPagePaths.ADMINISTRATOR);

    expect(screen.getByRole("status")).toHaveTextContent("Checking access…");
  });

  it("shows the reusable error state when server authorization cannot be confirmed", async () => {
    mockedGetCurrentUser.mockResolvedValue({ ...customer, role: "ADMINISTRATOR" });
    mockedGetRoleAccess.mockRejectedValue(new Error("Authorization service unavailable."));
    renderApp("/access/administrator");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Authorization service unavailable.",
    );
    expect(screen.getByRole("heading", { name: "Authorization check failed" }))
      .toBeInTheDocument();
  });

  it("exposes an accessible responsive navigation toggle", async () => {
    const user = userEvent.setup();
    renderApp();

    const toggle = await screen.findByRole("button", { name: "Toggle navigation" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
