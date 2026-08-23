import { Route, Routes } from "react-router-dom";

import type { UserRole } from "./api/auth";
import { LoginPage, RegistrationPage } from "./auth/AuthPages";
import { AuthProvider } from "./auth/AuthProvider";
import {
  AuthenticationRequiredPage,
  ForbiddenPage,
  ProtectedRoute,
  RoleAccessPage,
} from "./auth/AuthorizationPages";
import {
  roleAccessPagePaths,
  type InternalRole,
} from "./api/roleAccess";
import { NotFoundPage } from "./components/AppStates";
import { DashboardPage } from "./dashboard/DashboardPage";
import { AppLayout } from "./layout/AppLayout";
import {
  dashboardPagePaths,
  editMaterialSupplyRoutePath,
  editProductRoutePath,
  materialSupplyListPagePath,
  newProductPagePath,
  newMaterialSupplyPagePath,
  productCatalogPagePath,
  productDetailRoutePath,
  supplierProfilePagePath,
} from "./navigation/navigation";
import { PublicHomePage } from "./pages/PublicHomePage";
import { AddProductPage } from "./products/AddProductPage";
import { ProductCatalogPage } from "./products/ProductCatalogPage";
import { ProductDetailPage } from "./products/ProductDetailPage";
import { EditProductPage } from "./products/EditProductPage";
import { SupplierProfilePage } from "./suppliers/SupplierProfilePage";
import { AddMaterialSupplyPage } from "./suppliers/AddMaterialSupplyPage";
import { MaterialSupplyListPage } from "./suppliers/MaterialSupplyListPage";
import { EditMaterialSupplyPage } from "./suppliers/EditMaterialSupplyPage";

const protectedRoleRoutes: Array<{ role: InternalRole; path: string }> = [
  { role: "ADMINISTRATOR", path: roleAccessPagePaths.ADMINISTRATOR },
  { role: "SUPPLIER", path: roleAccessPagePaths.SUPPLIER },
  { role: "INVENTORY_MANAGER", path: roleAccessPagePaths.INVENTORY_MANAGER },
  { role: "PRODUCTION_MANAGER", path: roleAccessPagePaths.PRODUCTION_MANAGER },
  { role: "SALES_OFFICER", path: roleAccessPagePaths.SALES_OFFICER },
];

const dashboardRoutes: Array<{ role: UserRole; path: string }> = [
  { role: "ADMINISTRATOR", path: dashboardPagePaths.ADMINISTRATOR },
  { role: "SUPPLIER", path: dashboardPagePaths.SUPPLIER },
  { role: "INVENTORY_MANAGER", path: dashboardPagePaths.INVENTORY_MANAGER },
  { role: "PRODUCTION_MANAGER", path: dashboardPagePaths.PRODUCTION_MANAGER },
  { role: "SALES_OFFICER", path: dashboardPagePaths.SALES_OFFICER },
  { role: "CUSTOMER", path: dashboardPagePaths.CUSTOMER },
];

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/unauthorized" element={<AuthenticationRequiredPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<PublicHomePage />} />
          <Route path={productCatalogPagePath} element={<ProductCatalogPage />} />
          <Route path={productDetailRoutePath} element={<ProductDetailPage />} />
          {dashboardRoutes.map(({ role, path }) => (
            <Route
              element={
                <ProtectedRoute allowedRoles={[role]}>
                  <DashboardPage role={role} />
                </ProtectedRoute>
              }
              key={role}
              path={path}
            />
          ))}
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
          <Route
            element={
              <ProtectedRoute allowedRoles={["SALES_OFFICER"]}>
                <AddProductPage />
              </ProtectedRoute>
            }
            path={newProductPagePath}
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={["SALES_OFFICER"]}>
                <EditProductPage />
              </ProtectedRoute>
            }
            path={editProductRoutePath}
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={["SUPPLIER"]}>
                <SupplierProfilePage />
              </ProtectedRoute>
            }
            path={supplierProfilePagePath}
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={["SUPPLIER"]}>
                <AddMaterialSupplyPage />
              </ProtectedRoute>
            }
            path={newMaterialSupplyPagePath}
          />
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["SUPPLIER", "INVENTORY_MANAGER", "ADMINISTRATOR"]}
              >
                <MaterialSupplyListPage />
              </ProtectedRoute>
            }
            path={materialSupplyListPagePath}
          />
          <Route
            element={
              <ProtectedRoute allowedRoles={["SUPPLIER"]}>
                <EditMaterialSupplyPage />
              </ProtectedRoute>
            }
            path={editMaterialSupplyRoutePath}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
