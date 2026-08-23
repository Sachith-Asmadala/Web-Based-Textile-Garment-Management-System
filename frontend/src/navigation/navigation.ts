import type { AuthUser, UserRole } from "../api/auth";
import {
  isInternalRole,
  roleAccessPagePaths,
} from "../api/roleAccess";

export interface NavigationItem {
  label: string;
  description: string;
  path: string;
}

export const roleLabels: Record<UserRole, string> = {
  ADMINISTRATOR: "Administrator",
  SUPPLIER: "Supplier",
  INVENTORY_MANAGER: "Inventory manager",
  PRODUCTION_MANAGER: "Production manager",
  SALES_OFFICER: "Sales officer",
  CUSTOMER: "Customer",
};

export const dashboardPagePaths: Record<UserRole, string> = {
  ADMINISTRATOR: "/dashboard/administrator",
  SUPPLIER: "/dashboard/supplier",
  INVENTORY_MANAGER: "/dashboard/inventory-manager",
  PRODUCTION_MANAGER: "/dashboard/production-manager",
  SALES_OFFICER: "/dashboard/sales-officer",
  CUSTOMER: "/dashboard/customer",
};

export const newProductPagePath = "/products/new";
export const productCatalogPagePath = "/products";
export const productDetailRoutePath = "/products/:productId";
export const editProductRoutePath = "/products/:productId/edit";

const positiveIntegerPattern = /^[1-9]\d*$/;

export function parseProductPageId(value: string | undefined) {
  if (!value || !positiveIntegerPattern.test(value)) {
    return null;
  }
  const productId = Number(value);
  return Number.isSafeInteger(productId) ? productId : null;
}

export function getProductDetailPagePath(productId: number) {
  return `/products/${productId}`;
}

export function getEditProductPagePath(productId: number) {
  return `/products/${productId}/edit`;
}

const publicHome: NavigationItem = {
  label: "Overview",
  description: "System introduction and availability",
  path: "/",
};

const productCatalog: NavigationItem = {
  label: "Garment catalog",
  description: "Browse currently available garments",
  path: productCatalogPagePath,
};

export function getNavigationItems(user: AuthUser | null): NavigationItem[] {
  if (!user) {
    return [
      publicHome,
      productCatalog,
      {
        label: "Sign in",
        description: "Access an existing account",
        path: "/login",
      },
      {
        label: "Customer registration",
        description: "Create a registered customer account",
        path: "/register",
      },
    ];
  }

  const roleLabel = roleLabels[user.role];
  const items: NavigationItem[] = [
    publicHome,
    productCatalog,
    {
      label: `${roleLabel} dashboard`,
      description: `Open the ${roleLabel.toLowerCase()} workspace`,
      path: dashboardPagePaths[user.role],
    },
  ];

  if (isInternalRole(user.role)) {
    items.push({
      label: "Authorization check",
      description: "Confirm this role with the protected API",
      path: roleAccessPagePaths[user.role],
    });
  }

  if (user.role === "SALES_OFFICER") {
    items.push({
      label: "Add garment product",
      description: "Create a product and its first variant",
      path: newProductPagePath,
    });
  }

  return items;
}
