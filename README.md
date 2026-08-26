# Web Based Textile & Garment Management System

A centralized web-based management platform designed to streamline the core operational processes of a textile and garment organization.

> **Academic Project**  
> SE2030 – Software Engineering  
> Sri Lanka Institute of Information Technology (SLIIT)  
> Year 2, Semester 1 – 2026  
> Group: `Y2-S1-MLB-B13G1-02`

---

## Overview

The **Web Based Textile & Garment Management System** is designed to replace manual records, spreadsheets, and disconnected workflows with a single centralized platform.

The system integrates the major activities of a garment manufacturing business, including:

- Supplier Management
- Garment Product Management
- Order Management
- Fabric Inventory Management
- Production Management
- Delivery Management

The objective is to improve operational efficiency, data accuracy, coordination between departments, visibility of business activities, and decision-making.

---

## Problem Statement

Many textile and garment organizations still depend on manual records, spreadsheets, and isolated systems.

This can lead to:

- Duplicate data entry
- Inaccurate or outdated records
- Difficulty tracking material availability
- Production delays
- Poor coordination between departments
- Limited visibility of order and delivery progress
- Difficulty accessing real-time operational information

This project addresses these issues by bringing the major operational processes into one web-based system.

---

## Project Objectives

The main objectives of the system are to:

- Develop a centralized platform for textile and garment operations
- Automate supplier and raw-material management
- Maintain accurate garment product information
- Simplify customer order processing
- Monitor fabric and raw-material stock levels
- Support production planning and progress tracking
- Manage delivery scheduling and delivery status
- Provide dashboards and reports for decision-making
- Support secure authentication and role-based access

---

## System Workflow

```text
Supplier
   │
   ▼
Raw Material / Fabric Supply
   │
   ▼
Fabric Inventory
   │
   ▼
Production
   │
   ▼
Garment Products
   │
   ▼
Customer Orders
   │
   ▼
Delivery
```

The modules are designed to work together rather than as isolated CRUD applications.

For example:

1. Suppliers provide raw-material information.
2. Inventory Managers maintain available fabric and material quantities.
3. Production Managers create production tasks using valid customer orders and available materials.
4. Sales Officers manage garment products and customer orders.
5. Completed orders are scheduled for delivery.
6. Customers can track their order and delivery progress.

---

# Core Modules

## 1. Garment Product Management

**Primary User:** Sales Officer

Manages garment products available to customers.

### Main Features

- Add garment products
- View garment product catalog
- Search products
- Update product information
- Remove or discontinue products
- Maintain:
  - Product name
  - Category
  - Size
  - Color
  - Price
  - Availability

### Expected Outcome

Maintains accurate product information and supports customer browsing and order processing.

---

## 2. Supplier Management

**Primary User:** Supplier  
**Supporting Users:** Inventory Manager, Administrator

Manages suppliers and the raw materials supplied to the organization.

### Main Features

- Maintain supplier profile
- Add supply information
- View supply records
- Update supply quantities
- Update prices
- Maintain delivery information
- Search supplier records

### Example Raw Materials

- Fabric
- Thread
- Buttons
- Zippers
- Labels

### Expected Outcome

Ensures accurate supplier information and supports uninterrupted material availability for production.

---

## 3. Fabric Inventory Management

**Primary User:** Inventory Manager

Maintains fabric and raw-material stock information.

### Main Features

- Add inventory records
- View inventory
- Search materials
- Update stock quantities
- Record received materials
- Record used materials
- Monitor stock levels
- Detect low-stock materials
- Display low-stock alerts

### Expected Outcome

Provides accurate inventory control and helps ensure required materials are available for production.

---

## 4. Order Management

**Primary User:** Sales Officer  
**Supporting Users:** Registered Customer, Administrator

Manages the customer order lifecycle.

### Main Features

- Create customer orders
- Select garment products
- Record:
  - Quantity
  - Size
  - Color
- Validate customer and product information
- View order details
- Update order status
- Track orders
- Prepare quotations
- Generate invoices / bills
- Record payment information

> Third-party online payment gateway integration is outside the current project scope.

### Expected Outcome

Improves order processing efficiency and provides accurate order tracking.

---

## 5. Production Management

**Primary User:** Production Manager

Manages garment production activities.

### Main Features

- Create production tasks
- Link production tasks to garment orders
- Assign production work
- Assign required raw materials
- Check material availability
- Track production progress
- Update production status
- View production records
- View completed production tasks

### Typical Production Statuses

```text
Pending → In Progress → Completed
```

### Expected Outcome

Improves production planning, progress monitoring, and timely completion of garment manufacturing activities.

---

## 6. Delivery Management

**Primary User:** Sales Officer  
**Supporting User:** Registered Customer

Handles delivery scheduling and tracking.

### Main Features

- Select completed customer orders
- Create delivery records
- Schedule delivery date and time
- Maintain delivery details
- Update delivery status
- Track delivery progress
- Allow customers to view delivery status

### Expected Outcome

Improves delivery coordination and provides accurate final-stage order tracking.

---

# Supporting Features

The system also contains several shared supporting functions.

### Authentication

- Login
- Logout
- Secure user access

### Account Recovery

- Password reset
- Account recovery

### Search

Users can search relevant system records including:

- Products
- Orders
- Suppliers
- Inventory
- Production records

### Notifications & Alerts

Examples include:

- Low-stock notifications
- Order updates
- Production updates
- Operational alerts

### User Profile

Users can manage their account and profile information.

### Dashboard & Reporting

The system can provide dashboards and reports for monitoring operational activities and supporting management decisions.

---

# User Roles

## Guest Customer

Can:

- Browse garment products
- Search products
- View product details
- Request quotations

---

## Registered Customer

Can:

- Log in
- Manage profile
- Browse products
- View product details
- Place orders
- View order history
- Track order status
- Track delivery status

---

## Administrator

Responsible for:

- Managing user accounts
- Assigning roles and permissions
- Managing system records
- Monitoring system activities
- Maintaining security
- Generating reports

---

## Sales Officer

Responsible for:

- Managing garment products
- Processing customer orders
- Preparing quotations
- Generating invoices
- Updating order status
- Managing deliveries

---

## Supplier

Responsible for:

- Maintaining supplier information
- Providing raw-material details
- Updating quantity and price
- Maintaining supply delivery information

---

## Inventory Manager

Responsible for:

- Maintaining inventory records
- Updating material quantities
- Monitoring stock
- Identifying low-stock materials
- Ensuring material availability

---

## Production Manager

Responsible for:

- Creating production tasks
- Assigning production work
- Assigning required materials
- Monitoring production progress
- Updating production status
- Reviewing production records

---

# Functional Requirements

The system is expected to provide the following major capabilities:

1. Customer registration and profile management
2. Product catalog browsing
3. Order placement and order tracking
4. Fabric and raw-material inventory management
5. Production order creation and progress tracking
6. Invoice generation and payment recording
7. Delivery scheduling and status updates
8. Dashboard and reporting

---

# Non-Functional Requirements

## Performance

- Provide responsive access to products, orders, and records
- Support multiple users without significant delays

## Security

- Protect user and business information
- Support authentication
- Enforce role-based access control

## Usability

- Provide a simple and user-friendly interface
- Keep common tasks easy to understand and perform

## Scalability

- Support increasing numbers of users, records, and transactions
- Allow future modules and functionality to be added

## Reliability

- Maintain accurate records
- Reduce the risk of data loss
- Operate consistently

## Maintainability

- Support future bug fixes and improvements
- Keep modules sufficiently separated and reusable

## Availability

- Keep the system accessible whenever required
- Minimize operational downtime

---

# High-Level Architecture

The proposed system follows a web-based client/server architecture.

```text
┌─────────────────────────────────┐
│             Users               │
│                                 │
│ Guest Customer                  │
│ Registered Customer             │
│ Administrator                   │
│ Supplier                        │
│ Inventory Manager               │
│ Production Manager              │
│ Sales Officer                   │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│        Web Application UI       │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│        Application Server       │
│                                 │
│ Supplier Management             │
│ Garment Product Management      │
│ Order Management                │
│ Inventory Management            │
│ Production Management           │
│ Delivery Management             │
└────────────────┬────────────────┘
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
   Database   File     Email /
    Server    Storage  Notification
```

---

# Module Integration

The project should maintain a single source of truth for shared data.

```text
Garment Product Management
          │
          ▼
    Order Management
          │
          ▼
  Production Management ◄──── Fabric Inventory
          │                         ▲
          │                         │
          │                  Supplier Management
          ▼
   Delivery Management
```

### Integration Principles

- Orders should reference existing products rather than duplicate product data.
- Inventory should reference supplier/supply information using stable identifiers.
- Production should reference existing orders and inventory records.
- Delivery should reference valid completed orders.
- Historical records should remain valid even if current product or supplier information changes.

---

# Development Approach

The project follows an Agile/Scrum-oriented development process.

The implementation backlog is intentionally divided into small, dependency-aware tickets so development can be completed incrementally.

### Recommended Module Order

```text
Foundation
   ↓
Garment Product Management
   ↓
Supplier Management
   ↓
Fabric Inventory Management
   ↓
Order Management
   ↓
Production Management
   ↓
Delivery Management
   ↓
Final Integration & Testing
```

Each ticket should follow:

```text
Backlog
   ↓
Ready
   ↓
In Progress
   ↓
Code Review
   ↓
Testing / QA
   ↓
Done
```

---

# Definition of Done

A feature is ready for Code Review only when:

- [ ] Only the active ticket scope is implemented.
- [ ] Acceptance criteria, validation, backend permissions, errors, and contract changes are documented.
- [ ] Appropriate success, failure, and authorization tests are included.
- [ ] Database changes use reversible Liquibase migrations where applicable.
- [ ] `npm run verify` passes from the repository root.
- [ ] Manual QA and the pull-request checklist are completed.

The authoritative validation conventions, API error contract, test expectations, and
full Definition of Done are in [CONTRIBUTING.md](CONTRIBUTING.md).

---

# Current Repository Architecture

> TGMS-1 baseline inspected on 2026-08-22 at commit `d1cba2a` on branch `main`.

The original repository contained only this README. TGMS-1 through TGMS-6 established
the Spring Boot/React foundation, migration workflow, authentication, authorization,
shared UI shell, and quality gate. TGMS-10 through TGMS-16 add the garment catalog
schema and the scoped create, browse, search, detail, update, and discontinue workflows.
TGMS-20 adds the Supplier Management identity/contact schema boundary.
TGMS-21 adds the authenticated supplier-owned create and update workflow over that
existing boundary without adding supply or inventory behavior.
TGMS-22 adds the supplier-owned material supply schema boundary without adding supply
CRUD or Inventory behavior.
TGMS-23 adds Supplier-only material supply creation over that schema without adding
list, search, edit, discontinue, or Inventory behavior. TGMS-24 adds scoped read and
search behavior for Suppliers, Inventory Managers, and Administrators without adding
edit, discontinue, stock, or receiving behavior. TGMS-25 adds Supplier-owned updates
for quantity, price, and delivery details while preserving supply identity and status.
TGMS-26 completes Supplier Management CRUD with soft archival and publishes the stable
Supplier/Supply read contract for Inventory Management.

```text
Web-Based-Textile-Garment-Management-System/
├── backend/
│   ├── .mvn/wrapper/maven-wrapper.properties
│   ├── src/main/
│   │   ├── java/lk/ac/sliit/tgms/
│   │   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── authorization/
│   │   │   ├── config/
│   │   │   ├── product/
│   │   │   ├── supplier/
│   │   │   └── TgmsApplication.java
│   │   └── resources/application.properties
│   ├── src/test/java/lk/ac/sliit/tgms/
│   ├── .env.example
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
├── database/
│   └── migrations/
│       ├── changes/0000_baseline.sql
│       ├── changes/20260822181000_create_users.sql
│       ├── changes/20260823105000_create_garment_product_catalog.sql
│       ├── changes/20260823120500_create_supplier_profiles.sql
│       ├── changes/20260823123000_create_material_supplies.sql
│       ├── db.changelog-master.xml
│       └── README.md
├── frontend/
│   ├── src/
│   │   ├── test/setup.ts
│   │   ├── api/auth.ts
│   │   ├── api/materialSupplies.ts
│   │   ├── api/products.ts
│   │   ├── api/roleAccess.ts
│   │   ├── api/supplierProfile.ts
│   │   ├── auth/
│   │   ├── components/AppStates.tsx
│   │   ├── dashboard/DashboardPage.tsx
│   │   ├── layout/AppLayout.tsx
│   │   ├── navigation/navigation.ts
│   │   ├── pages/PublicHomePage.tsx
│   │   ├── products/AddProductPage.tsx
│   │   ├── products/EditProductPage.tsx
│   │   ├── products/ProductCatalogPage.tsx
│   │   ├── products/ProductDetailPage.tsx
│   │   ├── products/productForm.ts
│   │   ├── products/productTypes.ts
│   │   ├── suppliers/SupplierProfilePage.tsx
│   │   ├── suppliers/AddMaterialSupplyPage.tsx
│   │   ├── suppliers/MaterialSupplyListPage.tsx
│   │   ├── suppliers/EditMaterialSupplyPage.tsx
│   │   ├── suppliers/materialSupplyForm.ts
│   │   ├── App.test.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── scripts/
│   └── run-liquibase.mjs
├── .github/
│   ├── pull_request_template.md
│   └── workflows/quality.yml
├── .gitignore
├── CONTRIBUTING.md
├── eslint.config.js
├── package-lock.json
├── package.json
└── README.md
```

| Area | Current implementation |
|---|---|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS 4, React Router 7, and Axios |
| Backend/API | Java 17, Spring Boot 4.1.1, Spring MVC, Bean Validation, Maven Wrapper, CORS, and JSON request handling |
| Database | MySQL, Spring JDBC/HikariCP, Liquibase 5, versioned formatted-SQL changesets, and H2/MySQL-mode migration verification |
| Authentication and authorization | Spring Security resource-server validation, bcrypt password hashes, stateless HS256 JWT sessions in an HttpOnly `SameSite=Strict` cookie, reusable method-security role guards, and protected React routes |
| Package managers | npm workspace and lockfile for the frontend; Maven Wrapper and `pom.xml` for the backend |
| Environment | `backend/.env.example`; local secrets belong in ignored `backend/.env` |
| Tests | Vitest and React Testing Library for the UI; JUnit 5, Spring Test, MockMvc, and H2 migration verification for the backend |
| Quality | ESLint and TypeScript checks for React; Maven compile, test, and package checks for Spring Boot |

## Current Application Flow

```text
Browser at http://localhost:5173
        │
        ▼
React public page, shared application shell, role dashboard, /register, or /login
        │  Axios /api requests (credentials included)
        ▼
Vite development proxy
        │
        ▼
Spring Boot API at http://localhost:3000
        │
        ├── Liquibase applies pending changesets to MySQL at startup
        ├── AuthService validates accounts and bcrypt passwords
        └── Spring Security validates JWT session cookies for /api/auth/me
```

The public landing page and health check remain available without a session. Public
registration always creates a `CUSTOMER`; there is no client-selectable role. Login
sets a host-only `TGMS_SESSION` HttpOnly cookie and `/api/auth/me` restores the current
account after reload. Logout expires that cookie. Spring Boot returns one consistent
JSON error envelope for validation, authentication, and unknown API routes.

## Authentication API Contract

| Method and route | Access | Result |
|---|---|---|
| `POST /api/auth/register` | Public | Create one active `CUSTOMER`; returns `201` without starting a session |
| `POST /api/auth/login` | Public | Verify an active account and set `TGMS_SESSION`; returns `200` |
| `GET /api/auth/me` | Authenticated | Return the active account represented by the validated JWT subject |
| `POST /api/auth/logout` | Public/idempotent | Expire `TGMS_SESSION`; returns `200` |
| `GET /api/health` | Public | Return API availability |

The stable JWT claims are `iss`, `iat`, `exp`, `sub` (the decimal `users.id`), and
`role`. Clients must not parse the cookie or treat its claims as authorization. TGMS-4
uses the server-created `ROLE_<role>` authority for endpoint-level RBAC.

## Role-Based Access Contract

Spring method security is enabled globally. Later backend modules protect controllers
or service methods with the composed annotations in `RoleGuards`:

- `@AdministratorOnly`
- `@SupplierOnly`
- `@InventoryManagerOnly`
- `@ProductionManagerOnly`
- `@SalesOfficerOnly`

These checks are authoritative. React's `ProtectedRoute` provides early navigation to
safe 401/403 pages, but every protected API action must still use a server guard.
Missing or invalid authentication returns `401`; a valid session with the wrong role
returns `403` using the shared API error envelope.

The following minimal endpoints verify the foundation without implementing business
module features:

| Protected endpoint | Required role | Protected page |
|---|---|---|
| `GET /api/role-access/administrator` | `ADMINISTRATOR` | `/access/administrator` |
| `GET /api/role-access/supplier` | `SUPPLIER` | `/access/supplier` |
| `GET /api/role-access/inventory-manager` | `INVENTORY_MANAGER` | `/access/inventory-manager` |
| `GET /api/role-access/production-manager` | `PRODUCTION_MANAGER` | `/access/production-manager` |
| `GET /api/role-access/sales-officer` | `SALES_OFFICER` | `/access/sales-officer` |

`/unauthorized` and `/forbidden` are reusable safe client states. Hiding navigation is
only a usability measure; the protected Spring endpoints retain the role guards above.

## Shared Application Shell

`AppLayout` provides the common sticky header, responsive sidebar, account identity,
logout action, and nested page outlet. `getNavigationItems` is the single frontend
policy for visible navigation. Guests see only public overview/authentication links;
authenticated users see only their own dashboard, and internal users additionally see
their own server authorization-check link. It must not be used as a substitute for a
backend `RoleGuards` annotation.

The placeholder dashboard routes are:

| Role | Dashboard route |
|---|---|
| `ADMINISTRATOR` | `/dashboard/administrator` |
| `SUPPLIER` | `/dashboard/supplier` |
| `INVENTORY_MANAGER` | `/dashboard/inventory-manager` |
| `PRODUCTION_MANAGER` | `/dashboard/production-manager` |
| `SALES_OFFICER` | `/dashboard/sales-officer` |
| `CUSTOMER` | `/dashboard/customer` |

Every dashboard route is wrapped by `ProtectedRoute` with its exact role. The pages
deliberately show empty placeholders and do not invent module data. Later UI tickets
can reuse `LoadingState`, `EmptyState`, `ErrorState`, and `NotFoundPage` from
`components/AppStates.tsx` inside the shell.

## Add Garment Product Contract

TGMS-11 adds the Sales Officer-only `/products/new` form. The navigation link and
React route are role-filtered for usability, while `@SalesOfficerOnly` on the Spring
write and by-ID retrieval methods is the authoritative permission check.

| Method and route | Access | Result |
|---|---|---|
| `POST /api/products` | `SALES_OFFICER` | Atomically create an active product and its first size/color variant; returns `201` and a `Location` header |
| `GET /api/products/{productId}` | `SALES_OFFICER` | Retrieve the saved product, category, and variants by stable product ID |

The create request accepts `name`, `category`, `size`, `color`, `price`, and
`availability`. New availability is restricted to `AVAILABLE` or `UNAVAILABLE`; a new
product cannot be created as discontinued. Exact prices are validated with Java
`BigDecimal`, stored as `DECIMAL(12,2)`, and serialized to the frontend as strings.

Category input is normalized before use. An existing active category with a
case-insensitive matching name is referenced by ID; otherwise the service creates one
category record in the same transaction. An inactive category returns `409
CATEGORY_INACTIVE` and is never silently reactivated. Validation uses the shared
`VALIDATION_ERROR` envelope, missing products return `404 PRODUCT_NOT_FOUND`, and
authentication/role failures retain the shared `401`/`403` behavior.

## Public Garment Catalog Contract

TGMS-12 adds the public `/products` page and the dedicated product catalog query. The
route is linked for guests and every authenticated role. It reuses the shared loading,
empty, and error panels and offers an explicit Retry action after a failed request.

| Method and route | Access | Result |
|---|---|---|
| `GET /api/products` | Public, including guests | Return active products in active categories, with only `AVAILABLE` variants |

The server owns the visibility rule: an inactive or discontinued product, a product in
an inactive category, and every unavailable or discontinued variant are excluded from
the public response. A product with no remaining available variant is therefore also
excluded. Results are ordered by category name, product name, stable product ID, and
variant ID. The response uses the existing product/category/variant representation, so
later consumers can retain the stable IDs without creating duplicate catalog data.

Pagination was not added in this ticket because the current application has no shared
pagination contract and the catalog is still a foundation-stage dataset. The service
boundary permits pagination to be added backward-compatibly when measured catalog size
requires it.

TGMS-13 extends this endpoint with optional `search`, `category`, `size`, `color`, and
`availability` query parameters. Product-name search is a case-insensitive substring
match. Category, size, and color are normalized and matched case-insensitively as exact
values. Multiple parameters are combined with `AND`, and omitting all parameters
restores the complete permitted catalog.

Filter text uses the same schema lengths as its underlying field. Availability accepts
only `AVAILABLE`, `UNAVAILABLE`, or `DISCONTINUED`; invalid values return the shared
`400 VALIDATION_ERROR` response. TGMS-12 visibility is applied before every filter, so
requesting an unavailable or discontinued status cannot reveal a non-public variant.
The `/products` form submits these filters to the backend, supports clearing them, and
distinguishes an empty catalog from a filtered query with no matches.

TGMS-14 adds the public `/products/:productId` detail page and an additive visibility-
safe API:

| Method and route | Access | Result |
|---|---|---|
| `GET /api/products/catalog/{productId}` | Public, including guests | Return one publicly permitted product, its category, and available variants by stable ID |

This endpoint deliberately remains separate from the existing Sales Officer-only
`GET /api/products/{productId}` contract. Invalid and non-positive IDs return the shared
`400 VALIDATION_ERROR`; missing, inactive, discontinued, inactive-category, and
unavailable-only products return `404 PRODUCT_NOT_FOUND` without revealing lifecycle
details. The page displays the stored name, descriptions, category, stable product ID,
sizes, colors, exact decimal price strings, product status, and variant availability,
with navigation back to the catalog.

## Update Garment Product Contract

TGMS-15 adds the Sales Officer-only `/products/:productId/edit` page. It loads the
complete staff record through the existing protected by-ID endpoint, preloads the
stored product/category values and one explicitly selected variant, and reuses the
same client and service validation rules as product creation.

| Method and route | Access | Result |
|---|---|---|
| `PUT /api/products/{productId}` | `SALES_OFFICER` | Atomically update product name/category and one owned size/color/price/availability variant; returns `200` with refreshed details |

The request adds the required stable `variantId` to the existing `name`, `category`,
`size`, `color`, `price`, and `availability` fields. The service verifies that the
variant belongs to the path product before writing. Product and variant primary keys,
variant ownership, product description, and product lifecycle status remain unchanged;
both affected `updated_at` timestamps are advanced explicitly. A size/color collision
is returned through the shared field-level `400 VALIDATION_ERROR` contract, and all
writes roll back together.

Discontinued variants are deliberately excluded from this information-maintenance
form and rejected by the server because lifecycle transitions use the separate TGMS-16
action below. A successful response replaces the editor's local state. Catalog and
detail routes do not retain a product cache, so navigating to either route issues a
fresh permitted query and shows the saved values when the product remains public.

## Product Discontinuation and Order Handoff Contract

TGMS-16 completes the Product Management lifecycle with a safe, Sales Officer-only
discontinuation action. The edit page requires an explicit second confirmation before
calling the backend and shows retryable error feedback if the request fails.

| Method and route | Access | Result |
|---|---|---|
| `DELETE /api/products/{productId}` | `SALES_OFFICER` | Atomically mark the product and every owned variant `DISCONTINUED`; return `200` with the retained complete record |

This endpoint is intentionally a soft delete. It never deletes rows or changes product
or variant IDs, so future order foreign keys and historical records remain valid. The
operation is safe to repeat. Discontinued records stay available through the protected
staff by-ID endpoint, but the public catalog/list/detail queries continue to exclude
them.

Order Management must use the Product module as the product source of truth. Before a
new order line is saved, call:

```java
OrderProductSelection selection = productService.requireOrderSelectableVariant(
        productId, variantId);
```

The caller supplies the stable `garment_products.id` and
`garment_product_variants.id`. A successful `OrderProductSelection` contains:

| Field | Contract |
|---|---|
| `productId` / `variantId` | Stable catalog IDs; the variant is verified to belong to the product |
| `productName` | Current display name from Product Management |
| `categoryId` / `categoryName` | Current category identity and display name |
| `size` / `color` | Authoritative selected variant representation; do not accept client replacements |
| `currentPrice` | Authoritative `BigDecimal` price from the selected variant; do not trust a client-supplied price |
| `availability` | `AVAILABLE` on every successful result |

Selection succeeds only when the category and product are `ACTIVE` and the owned
variant is `AVAILABLE`. Missing, mismatched, unavailable, or discontinued selections
throw `ProductNotSelectableException`; the shared API mapping is `409
PRODUCT_NOT_SELECTABLE`. The future Order service should call this method immediately
before persisting its own order line in its transaction, reference the stable IDs, and
store any required historical price/name snapshot in Order-owned columns. It must not
duplicate live catalog source-of-truth fields or infer selectability from public UI
visibility alone.

No Order Management table, endpoint, or order-creation behavior is added by TGMS-16;
those remain owned by the later Order module. This handoff supplies its reusable
server-side validation boundary without inventing that module prematurely.

## Supplier Profile Contract

TGMS-20 introduces the Supplier Management profile boundary. TGMS-21 adds the
supplier-owned create/edit API and page over that schema. Neither ticket adds supply
records or Inventory Management behavior.

| Table/field | Contract |
|---|---|
| `supplier_profiles.id` | Stable generated `BIGINT` supplier ID for later cross-module references |
| `supplier_profiles.user_id` | Required unique foreign key to `users.id`; one account has at most one supplier profile |
| `business_name` | Required supplier business identity, maximum 160 characters |
| `contact_phone` | Required contact number, maximum 32 characters |
| `address` | Required supplier contact address, maximum 500 characters |
| `created_at` / `updated_at` | Required UTC-compatible `TIMESTAMP(6)` audit timestamps |

The foreign key uses restrictive update/delete behavior so authenticated accounts and
referenced supplier history cannot be detached. `users` remains the source of truth
for account-holder name, login email, password hash, role, and active state; none are
copied into `supplier_profiles`. The TGMS-21 service performs the necessary cross-table
role rule because a database check constraint cannot read another table. It derives
ownership only from the validated JWT `sub` claim, reloads the active account from
`users`, and requires its
stored role to remain `SUPPLIER`. The request never accepts `user_id` or `supplier_id`,
so a supplier cannot select or overwrite another profile.

| Method and route | Access | Result |
|---|---|---|
| `GET /api/supplier-profile` | `SUPPLIER` | Load the profile owned by the authenticated account; `404 SUPPLIER_PROFILE_NOT_FOUND` when none exists |
| `PUT /api/supplier-profile` | `SUPPLIER` | Create the caller's profile (`201`) or update that same profile in place (`200`) |

The PUT body contains only `businessName`, `contactPhone`, and `address`. All are
required, whitespace-normalized, and constrained to the schema maxima of 160, 32, and
500 characters. Validation failures use the shared `400 VALIDATION_ERROR` field-error
envelope. The stable supplier ID, linked user ID, and `createdAt` remain unchanged on
update; `updatedAt` advances. The Supplier-only page is
`http://localhost:5173/supplier/profile`, appears only in Supplier navigation, preloads
the current record, and provides loading, retryable error, create, edit, validation,
and success states.

Supply and Inventory modules must store `supplier_profiles.id` as `supplier_id` and
resolve current supplier identity/contact data through Supplier Management. They must
not duplicate `business_name`, `contact_phone`, or `address` as competing master data.

## Material Supply Schema Contract

TGMS-22 introduces `material_supplies` as Supplier Management's source of truth for
materials a supplier can provide. It adds schema and tests only—no form, API, supply
CRUD, inventory stock, receiving transaction, or demo data.

| Table/field | Contract |
|---|---|
| `material_supplies.id` | Stable generated `BIGINT` supply ID for later Inventory references |
| `supplier_id` | Required foreign key to `supplier_profiles.id`, using restrictive update/delete behavior |
| `material_code` | Required supplier-scoped identifier; unique with `supplier_id` |
| `material_name` / `material_description` | Required name and optional descriptive information |
| `quantity` / `unit_of_measure` | Exact non-negative `DECIMAL(14,3)` amount and required unit label |
| `unit_price` | Exact non-negative `DECIMAL(12,2)` unit price |
| `delivery_lead_time_days` / `delivery_notes` | Non-negative delivery lead time and optional delivery information |
| `status` | Controlled `ACTIVE`, `INACTIVE`, or `DISCONTINUED` lifecycle status |
| `created_at` / `updated_at` | Required UTC-compatible `TIMESTAMP(6)` audit timestamps |

Zero quantity, price, or delivery lead time is representable, while negative values are
rejected by database checks. TGMS-23 requires positive quantity and unit price for each
new active offer while allowing a zero-day lead time. Inventory Management may
reference `material_supplies.id` as
`material_supply_id`; it must not establish a competing source of truth for supplier
ownership, current offer quantity/price, delivery information, or lifecycle status.

| Method and route | Access | Result |
|---|---|---|
| `POST /api/material-supplies` | `SUPPLIER` | Create an `ACTIVE` material supply owned by the authenticated supplier; returns `201` with the saved record |
| `GET /api/material-supplies` | `SUPPLIER`, `INVENTORY_MANAGER`, `ADMINISTRATOR` | Return only supplies permitted for the authenticated role, with optional `search` and `status` filters |
| `GET /api/material-supplies/{supplyId}` | `SUPPLIER`, `INVENTORY_MANAGER`, `ADMINISTRATOR` | Read one permitted stable supply ID; Supplier ownership remains scoped |
| `PUT /api/material-supplies/{supplyId}` | `SUPPLIER` | Update owned quantity, unit price, delivery lead time, and delivery notes; return the complete current record |
| `DELETE /api/material-supplies/{supplyId}` | `SUPPLIER` | Idempotently mark an owned supply `DISCONTINUED`, retain its row and stable ID, and return the archived record |

The POST body contains `materialCode`, `materialName`, optional
`materialDescription`, positive `quantity`, `unitOfMeasure`, positive `unitPrice`,
non-negative `deliveryLeadTimeDays`, and optional `deliveryNotes`. It never accepts an
ownership or status field. The service reloads the active account, requires its stored
role to remain `SUPPLIER`, resolves `supplier_profiles.id` by JWT `sub`, normalizes text,
and reads the inserted record back. A missing profile returns
`404 SUPPLIER_PROFILE_NOT_FOUND`; a duplicate supplier-scoped code returns
`409 MATERIAL_SUPPLY_CODE_EXISTS`; invalid fields return the shared
`400 VALIDATION_ERROR` envelope.

The Supplier-only form is `http://localhost:5173/supplier/supplies/new`. It confirms the
linked supplier identity before showing the form and provides loading, missing-profile,
retryable error, validation, submission error, and saved-record confirmation states.

The shared read page is `http://localhost:5173/supplies`. A Supplier receives records
only for the `supplier_profiles.id` resolved from the active authenticated account.
Inventory Managers and Administrators receive company-wide records enriched with the
owning supplier's current business name. The case-insensitive `search` parameter checks
material code, name, description, unit of measure, and delivery notes; `status` accepts
only `ACTIVE`, `INACTIVE`, or `DISCONTINUED`. Both filters combine with AND semantics.
The page exposes loading, retryable error, initial-empty, filtered-no-results, clear,
and role-appropriate navigation states.

The Supplier edit route is
`http://localhost:5173/supplier/supplies/{supplyId}/edit`. Its PUT body contains only
positive `quantity`, positive `unitPrice`, non-negative `deliveryLeadTimeDays`, and
optional `deliveryNotes`. The server resolves ownership from the active account and
uses both stable supply ID and supplier ID in the update predicate. It does not accept
changes to supplier ownership, material code/name/description, unit of measure, status,
or creation time. A successful update explicitly advances `updated_at`; the existing
company list query reads the committed values without a separate data copy. Missing or
unowned IDs both return `404 MATERIAL_SUPPLY_NOT_FOUND`.

Archival requires explicit UI confirmation. It never executes SQL `DELETE`; it changes
the owned row to `DISCONTINUED` and advances `updated_at`. Archived supplies remain
readable by their Supplier, Inventory Managers, and Administrators but cannot be edited
and are contractually ineligible for new Inventory selections. Repeating the archive
call safely returns the retained record. Attempts to update an archived row return
`409 MATERIAL_SUPPLY_ARCHIVED`.

## Inventory Handoff: Supplier and Supply Contract

Inventory Management must use these stable identities and must not copy Supplier
Management master data:

| Contract | Inventory usage |
|---|---|
| `supplier_profiles.id` | Stable Supplier identity; reference as `supplier_id` when the Inventory record directly identifies a Supplier |
| `material_supplies.id` | Stable supply-offer identity; reference as `material_supply_id` with restrictive update/delete behavior |
| `material_supplies.supplier_id` | Authoritative relationship from a supply to its Supplier profile |
| `material_code` | Supplier-scoped display/business code, not a globally stable foreign key |
| `quantity`, `unit_price`, delivery fields | Current Supplier offer information; read from Supplier Management rather than duplicating current master values |
| `status` | Only `ACTIVE` supplies may be chosen for new Inventory decisions; retained `DISCONTINUED` rows support historical references |

Inventory Manager and Administrator reads use `GET /api/material-supplies`, optionally
with `search` and `status=ACTIVE`, or `GET /api/material-supplies/{supplyId}` for an exact
stable ID. A future Inventory migration should reference the retained supply ID with
`ON UPDATE RESTRICT ON DELETE RESTRICT`. Inventory-specific facts such as actually
received quantity or transaction-time cost belong to Inventory transactions; they are
not competing copies of the Supplier's current offered quantity or price. TGMS-26 adds
no Inventory table, stock mutation, receipt workflow, or seed data.

---

# Developer Setup

## Prerequisites

- Node.js 20.19 or newer
- npm 11 or a compatible npm version
- Java 17 or newer
- MySQL 8 or newer
- Git

The Maven Wrapper downloads the required Maven version automatically.

## 1. Clone the Repository

```bash
git clone https://github.com/IT24103430/Web-Based-Textile-Garment-Management-System.git
cd Web-Based-Textile-Garment-Management-System
```

## 2. Install Dependencies

```bash
make install
```

This installs the Node.js workspace from the committed lockfile and downloads the
backend Maven dependencies. Run `npm ci` directly if `make` is unavailable; backend
dependencies will then download automatically when a Maven command first runs.

## 3. Configure Local Environment

```bash
cp backend/.env.example backend/.env
```

Replace `DB_PASSWORD` and `JWT_SECRET`; the JWT secret must be a random value of at
least 32 UTF-8 bytes. Keep `COOKIE_SECURE=false` only for local HTTP development and
set it to `true` when the application is served over HTTPS. `JWT_SESSION_HOURS`
defaults to `8`. The `.env` file is ignored by Git and must never be committed.

## 4. Create and Migrate the Database

Create the local `tgms` MySQL database and least-privilege user as documented in
[database/migrations/README.md](database/migrations/README.md), then run:

```bash
npm run db:status
npm run db:migrate
```

Do not create application tables manually. Spring Boot also applies pending Liquibase
changesets during startup.

## 5. Start the Development Servers

```bash
make run
```

- Frontend: `http://localhost:5173`
- API health check: `http://localhost:3000/api/health`
- Customer registration: `http://localhost:5173/register`
- Common login: `http://localhost:5173/login`
- Public garment catalog: `http://localhost:5173/products`
- Supplier profile (Supplier login required): `http://localhost:5173/supplier/profile`
- Add material supply (Supplier login required): `http://localhost:5173/supplier/supplies/new`
- View/search material supplies (Supplier, Inventory Manager, or Administrator): `http://localhost:5173/supplies`
- Edit owned material supply details (Supplier): `http://localhost:5173/supplier/supplies/{supplyId}/edit`

Stop both servers with `Ctrl+C`.

## Available Commands

| Command | Purpose |
|---|---|
| `make help` | List all available Make targets |
| `make install` | Install frontend and backend dependencies |
| `make install-frontend` | Install only Node.js/frontend dependencies |
| `make install-backend` | Download only Maven/backend dependencies |
| `make run` | Start the Spring Boot API and Vite frontend together |
| `make run-frontend` | Start only the Vite frontend |
| `make run-backend` | Start only the Spring Boot API |
| `make build` | Build the frontend and backend |
| `make test` | Run frontend and backend tests |
| `make clean` | Remove generated build and test output |
| `make uninstall` | Remove `node_modules` and all generated output |
| `make remove` | Alias for `make uninstall` |
| `npm run dev` | Start the Spring Boot API and Vite frontend together |
| `npm run dev:backend` | Start only the Spring Boot API |
| `npm run lint` | Lint the React workspace |
| `npm run typecheck` | Type-check React and compile the Spring backend |
| `npm test` | Run Vitest and Maven/JUnit tests |
| `npm run test:frontend` | Run only Vitest and React Testing Library tests |
| `npm run test:backend` | Run only Maven/JUnit/MockMvc tests |
| `npm run build` | Build Vite assets and the executable Spring Boot JAR |
| `npm run db:status` | Show applied and pending Liquibase changesets |
| `npm run db:migrate` | Apply pending changesets to the configured MySQL database |
| `npm run db:rollback:preview` | Preview rollback SQL for the latest changeset |
| `npm run db:rollback` | Guarded rollback of one changeset in development |
| `npm run db:verify` | Apply, roll back, and reapply migrations against an isolated test database |
| `npm run verify` | Run the complete lint, compile, test, migration, and build quality gate |

Migration authoring, safety rules, and database conventions are documented in
[database/migrations/README.md](database/migrations/README.md).

The committed VS Code workspace disables the Java extension's editor auto-build so it
cannot overwrite Maven output under `backend/target` while CLI checks are running.
Use `npm run typecheck` for the authoritative Java and TypeScript compile check.

## Pull-request quality gate

Run `npm run verify` before every handoff. GitHub Actions runs that same command for
pull requests and pushes to `main` using Node.js 24, npm 11.16.0, and Java 17. The
workflow needs no application secrets because migration verification uses the isolated
test database and the build does not start the application.

Every pull request receives the shared checklist from
[.github/pull_request_template.md](.github/pull_request_template.md). See
[CONTRIBUTING.md](CONTRIBUTING.md) for the API error envelope, Jakarta input-validation
rules, test expectations, source-of-truth conventions, and full Definition of Done.

# Baseline Verification

Pre-change baseline checks were performed on 2026-08-22 at commit `d1cba2a`.

| Check | Result |
|---|---|
| Repository inventory (`git ls-tree -r --name-only d1cba2a`) | Pass: `README.md` is the only tracked file |
| Build | Baseline unavailable: no source code, dependency manifest, or build script existed |
| Automated tests | Baseline unavailable: no test suite, test runner, or test script existed |
| Lint/static analysis | Baseline unavailable: no lint configuration or script existed |
| Database migrations | Not available: no database configuration or migrations exist |
| Application startup | Baseline unavailable: no frontend or backend entry point existed |

The absence of baseline commands was caused by the empty repository, not by a hidden
test failure.

## Current Verification Status

| Command | Result |
|---|---|
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm test` | Pass: 75 frontend and 69 Spring backend tests |
| `npm run build` | Pass: Vite production assets and executable Spring Boot JAR |
| `npm run db:verify` | Pass: apply, rollback, and reapply all five changesets including material supplies |
| `npm run verify` | Pass: complete local pull-request quality gate |
| `npm audit` | Pass: 0 known vulnerabilities |

---

# Testing

Tests are colocated with their application: React tests are under `frontend/src`, while
Spring tests are under `backend/src/test`. Future tickets should add unit, integration,
failure, and authorization coverage appropriate to their behavior.

## Important Integration Scenarios

- [x] Create garment product
- [x] Browse products
- [x] Search products
- [x] View product details
- [x] Update product information without changing stable IDs
- [x] Discontinue products while retaining stable IDs and blocking new-order selection
- [x] Define stable supplier profile schema and authenticated-account relationship
- [x] Create and edit the authenticated supplier's own profile
- [x] Define supplier-owned material supply schema and Inventory reference contract
- [x] Create supplier-owned material supply information
- [x] View and search role-permitted material supply information
- [x] Update owned material supply quantity, price, and delivery details
- [x] Archive supplies safely and complete the Supplier-to-Inventory handoff
- [ ] Add supplied material to inventory
- [ ] Update received/used inventory quantity
- [ ] Detect low stock
- [ ] Create customer order using a valid product
- [ ] Validate unavailable or invalid product
- [ ] Create production task from valid order
- [ ] Validate production material availability
- [ ] Update production progress
- [ ] Complete production
- [ ] Schedule delivery for completed order
- [ ] Update delivery status
- [ ] Customer tracks order and delivery
- [ ] Test unauthorized access for every protected role

---

# Project Scope

The current project includes:

- Supplier Management
- Garment Product Management
- Order Management
- Fabric Inventory Management
- Production Management
- Delivery Management
- Authentication
- Role-based access
- Notifications
- Search
- Reporting

---

# Current Limitations

The current version intentionally does **not** include:

- Native mobile application
- Multi-branch management
- Third-party online payment gateway integration
- AI-based demand forecasting
- AI-based production forecasting
- Automated production optimization
- Full enterprise ERP functionality

These may be considered as future enhancements.

---

# Future Enhancements

Possible future extensions include:

- Multi-branch support
- Mobile application
- Online payment integration
- Advanced analytics
- Demand forecasting
- Production forecasting
- Automated reorder recommendations
- Barcode / QR-based stock handling
- Customer notification integrations
- Advanced audit logging
- Multi-warehouse inventory
- Role-specific dashboards

---

# Team

| Team Member | IT Number | Major Function | Scrum Role |
|---|---|---|---|
| Nimsara V.G.P | IT25101310 | Order Management | Product Owner |
| Basnagoda B.L.K | IT25102148 | Fabric Inventory Management | Scrum Master |
| Gunarathna P.G.S.C | IT25103068 | Delivery Management | Developer |
| Ketipearachchi R.P | IT25100244 | Supplier Management | Developer |
| Gunathilaka N.T.D.S | IT25102427 | Garment Product Management | Developer |
| Dilwan A.W.W.A.S | IT24100351 | Production Management | Developer |

---

# Team Responsibilities

## Product Owner

**Nimsara V.G.P**

Responsible for representing business and customer requirements, maintaining product priorities, and ensuring that the system provides value to the textile and garment organization.

## Scrum Master

**Basnagoda B.L.K**

Responsible for facilitating Scrum activities, supporting the development team, removing obstacles, and encouraging proper Agile practices.

## Development Team

- Gunarathna P.G.S.C
- Ketipearachchi R.P
- Gunathilaka N.T.D.S
- Dilwan A.W.W.A.S

Responsible for designing, developing, testing, integrating, and maintaining the system modules.

---

# Project Timeline

| Period | Main Activity |
|---|---|
| Week 3 | Requirement gathering and proposal presentation |
| Weeks 4–5 | System architecture and database design |
| Weeks 6–9 | Core module development |
| Weeks 10–11 | System integration and testing |
| Week 12 | Documentation and User Acceptance Testing |
| Weeks 13–14 | Deployment and final presentation |

---

# Documentation

Project documentation includes:

- Project report
- System architecture diagram
- Functional requirements
- Non-functional requirements
- Stakeholder definitions
- Use-case diagram
- Detailed use-case scenarios
- User stories
- Product backlog
- Sprint planning
- Member-wise implementation backlog
- AI/Codex implementation prompts

---

# Contribution Workflow

For team development:

1. Pull the latest shared branch.
2. Select one approved backlog ticket.
3. Create a feature branch.

```bash
git checkout -b feature/TGMS-XX-short-description
```

4. Implement only the selected ticket.
5. Test the feature.
6. Commit using the ticket ID.

```bash
git commit -m "TGMS-XX: implement short description"
```

7. Push the branch.
8. Open a Pull Request.
9. Complete code review and testing.
10. Merge only after the acceptance criteria are satisfied.

---

# Security Guidelines

- Never store plain-text passwords.
- Never commit credentials or environment secrets.
- Enforce authorization on the server side.
- Validate all incoming data.
- Restrict users to their permitted operations.
- Ensure customers can access only their own private records.
- Use safe database queries.
- Keep production configuration outside the repository.
- Review role permissions before deployment.

---

# Academic Purpose

This project is developed as part of the **SE2030 – Software Engineering** module at the **Sri Lanka Institute of Information Technology (SLIIT)**.

The project demonstrates practical application of:

- Requirements Engineering
- Use-Case Modeling
- Agile / Scrum
- Product Backlog Management
- Software Architecture
- Database Design
- Modular Development
- Role-Based Access Control
- System Integration
- Software Testing
- Documentation
- Team Collaboration

---

# License

This repository is currently intended for academic and educational use by the project team.

A formal software license can be added if the project is later published or distributed publicly.

---

## Project Status

**In Development**

The team is implementing the project incrementally using a dependency-aware backlog and shared integration workflow.
