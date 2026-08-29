# TGMS-80 Role / Endpoint Security Matrix

This matrix documents the server-side authorization contract reviewed by TGMS-80. `401` is expected when no valid session exists. `403` is expected when an authenticated role is outside the allowed set. Ownership-scoped reads deliberately return `404` for another user's record where revealing existence would leak information.

| Area / representative endpoint | Public | Administrator | Supplier | Inventory Manager | Production Manager | Sales Officer | Customer | Ownership / notes |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `GET /api/health` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Health only. |
| `GET /api/products` and `/api/products/catalog/{id}` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Public active catalog only. |
| Product create/internal read/update/discontinue | No | No | No | No | No | Yes | No | `@SalesOfficerOnly`. |
| Administrator user management `/api/admin/users/**` | No | Yes | No | No | No | No | No | Self-demotion/deactivation and last-admin protections remain server-side. |
| Supplier profile `/api/supplier-profile` | No | No | Yes | No | No | No | No | JWT user ID determines the Supplier profile. |
| Material-supply create/update/archive | No | No | Yes | No | No | No | No | Repository mutations include Supplier ownership. |
| Material-supply read | No | Yes | Yes | Yes | No | No | No | Supplier reads are restricted to own Supplier ID. |
| Inventory CRUD/low stock/consume | No | No | No | Yes | No | No | No | Inventory Manager only. |
| Inventory availability | No | No | No | Yes | Yes | No | No | Read-only availability contract for Production. |
| Staff Order read | No | Yes | No | No | No | Yes | No | Staff Order contract. |
| Order status / billing mutations | No | Yes | No | No | No | Yes | No | Controlled transitions and server-derived totals. |
| Customer Order history/detail/billing/tracking | No | No | No | No | No | No | Yes | `customer_id = authenticated user ID`. |
| Customer Order creation | No | No | No | No | No | No | Yes | Customer ID comes from JWT; client cannot choose owner. |
| Staff Order creation / quotations | No | No | No | No | No | Yes | No | Customer/product selections are server revalidated. |
| Order handoff | No | Yes | No | No | Yes | Yes | No | Read contract for Production/Delivery workflows. |
| Production task create / eligible Orders | No | No | No | No | Yes | No | No | Production Manager only. |
| Production records/detail/material/status/QC | No | Yes | No | No | Yes | No | No | `@ProductionTaskManageable`. |
| Delivery records/schedule/status | No | No | No | No | No | Yes | No | Sales Officer only. |
| Customer Delivery tracking | No | No | No | No | No | No | Yes | Order ownership proven before Delivery lookup. |
| Notifications `/api/notifications/**` | No | Yes | Yes | Yes | Yes | Yes | Yes | SQL list/update operations include `recipient_user_id`. |
| Profile `/api/profile` | No | Yes | Yes | Yes | Yes | Yes | Yes | Current JWT subject only; protected security fields are not editable. |
| Shared search `/api/search` | No | Yes | Yes | Yes | Yes | Yes | Yes | Service composes only role-permitted module searches; Customer Orders are ownership-scoped in SQL. |
| Dashboard report `/api/reports/dashboard` | No | Yes | Yes | Yes | Yes | Yes | Yes | Response sections are role-scoped; Customer Orders use ownership predicate. |
| Unknown/new `/api/**` route | No | Auth required | Auth required | Auth required | Auth required | Auth required | Auth required | TGMS-80 default-deny-for-anonymous safety net. |

## TGMS-80 hardening decisions

- The Spring Security filter chain explicitly lists the intentionally public API surface and requires authentication for every other `/api/**` request.
- Method-security role guards remain the authorization source for role-specific actions. The filter-chain default is defense in depth, not a replacement for role guards.
- Invalid path/query type conversion and missing required request parameters return structured `400 VALIDATION_ERROR` responses instead of reaching the generic `500` handler.
- CORS accepts credentials only from the configured exact frontend origin and only the headers required by the current JSON API (`Content-Type`, `Accept`).
- `prod` profile startup requires a Secure session cookie and one exact HTTPS `CLIENT_ORIGIN`.
- Public registration continues to create `CUSTOMER` accounts only. Staff/Admin provisioning remains Administrator-authorized.
- No access token, password hash, reset-token secret, DB password, JWT secret, or SMTP password is intentionally serialized to frontend API models.

## Ownership regression coverage reviewed

TGMS-80 reuses and preserves the real API ownership tests already present in the integrated repository:

- `MaterialSupplyApiIntegrationTests.supplierCannotPreloadOrUpdateAnotherSuppliersRecord` and `archiveOwnershipAndRolePermissionsAreEnforced` verify Supplier ownership on reads and mutations and use ownership-safe `404` responses.
- `OrderApiIntegrationTests` verifies `/api/orders/mine/{id}` and customer tracking cannot reveal another Customer's Order and that another Customer's ID is indistinguishable from an unknown ID.
- `CustomerDeliveryTrackingApiIntegrationTests.anotherCustomersOrderAndUnknownOrderUseSameOwnershipSafeNotFoundResult` verifies Delivery tracking first proves Order ownership.
- `SharedSearchApiIntegrationTests` verifies Customer search applies the authenticated `customer_id` before serialization.
- `DashboardReportApiIntegrationTests` verifies Customer report aggregates only the authenticated Customer's Orders.
- `NotificationApiIntegrationTests` verifies another user's notification cannot be listed or marked read.

## Input-validation review

The integrated services already validate the main controlled and numeric inputs at the server boundary: Product price/variant availability, Supply quantities/prices/lead time/status, Inventory quantities/threshold/status/type, Order item quantities/status/payment state, Production task/material/QC status, Delivery status/schedule, Admin roles, Notification filters, shared-search pagination, and report date ranges. TGMS-80 adds the missing framework-level conversion handling for malformed typed path/query parameters and missing required request parameters so these cases consistently return `400` instead of `500`.

## Sensitive configuration review

- Runtime `DB_PASSWORD`, `JWT_SECRET`, and SMTP credentials are environment-backed; the production application properties do not contain credential defaults.
- `JWT_SECRET` is required and must contain at least 32 UTF-8 bytes before the JWT key bean starts.
- `.gitignore` excludes `.env` and `.env.*` while allowing only example files.
- The production frontend source contains no server JWT secret, DB password, SMTP password, password hash, or reset-token storage logic.
- The committed test JWT secret is scoped to `backend/src/test/resources/application.properties` and is not a production credential.
