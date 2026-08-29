# TGMS-85 Final Handover

## Release scope

TGMS is a web-only, single-branch Textile & Garment Management System. The release integrates six operational modules—Garment Product, Supplier, Fabric Inventory, Order, Production and Delivery—plus authentication/recovery, RBAC, profile settings, notifications, shared search, dashboards/reports, security review, cross-module integration testing, NFR verification, UAT assets and deployment/backup/recovery documentation.

TGMS-85 is a **feature freeze**. New product scope is not part of this ticket; only release-blocking defects should be changed after this point.

## Final implementation stack

| Layer | Final implementation |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, React Router, Axios |
| Backend | Java 17, Spring Boot 4.1.1, Spring MVC, Spring Security |
| Auth | bcrypt passwords; HS256 JWT in Secure/HttpOnly/SameSite cookie; persisted role/active-state checks |
| Persistence | Spring JDBC / HikariCP |
| Database | MySQL |
| Schema versioning | Liquibase formatted SQL/XML migrations |
| Email recovery | Spring Mail / configured SMTP |
| Tests | JUnit 5 + Spring Test/MockMvc/H2; Vitest + React Testing Library |
| Quality/security | ESLint, TypeScript checks, security scan, UAT/NFR/integration suites |

## Source-of-truth and module handoffs

| Owner module | Source records | Stable handoff |
|---|---|---|
| Product | `garment_products`, `garment_product_variants` | Orders reference `product_id` + `variant_id`; immutable order-time selection/price snapshots preserve history |
| Supplier | `supplier_profiles`, `material_supplies` | Inventory references `source_material_supply_id` |
| Inventory | `inventory_materials` | Production requirements/usage reference `inventory_material_id`; stock is deducted only by Inventory-owned logic |
| Order | `orders`, `order_items`, `order_status_history` | Production/Delivery reference `order_id` and synchronize through Order service contracts |
| Production | `production_tasks` and material/detail records | Completion moves the owning Order to `READY_FOR_DELIVERY` when the final required task finishes |
| Delivery | `deliveries` | Customer tracking is resolved by `order_id` plus authenticated customer ownership; delivered status completes the Order |

Supporting notifications, search and reports read those modules; they are not alternate business sources of truth.

## Core lifecycle

```text
Supplier supply ──► Inventory material ──► Production requirement/usage
                                             ▲
Product/variant ──► Customer Order ───────────┤
                                             ▼
PENDING → CONFIRMED → IN_PRODUCTION → READY_FOR_DELIVERY → COMPLETED
                                                │
                                                ▼
                                       Delivery scheduling/tracking
```

## Important API boundaries

- Public: `/api/health`, authentication/recovery endpoints, read-only public product catalogue.
- Authenticated self-service: `/api/profile`, `/api/notifications`, `/api/search`, role dashboard/report APIs.
- Administrator: `/api/admin/users/**`.
- Supplier-owned: `/api/supplier-profile`, permitted `/api/material-supplies/**` actions.
- Inventory Manager: `/api/inventory-materials/**` mutations and stock operations.
- Sales Officer: Product mutations, staff Order operations, quotations/billing where permitted, Delivery management.
- Production Manager: `/api/production/tasks/**` mutations.
- Customer: `/api/orders/mine/**` and customer Delivery tracking; ownership comes from authenticated `users.id`, not a client-supplied owner ID.

For the reviewed route/role matrix, use `docs/security/TGMS-80-role-endpoint-matrix.md`.

## Database and migration handover

The canonical Liquibase changelog is `database/migrations/db.changelog-master.xml`. Migrations must be applied in changelog order; production schema changes must not be performed manually. TGMS-85 adds **no application migration**.

Presentation data lives separately under `database/demo/`. It is deliberately not included by Liquibase and must never be treated as production seed data.

## Local setup

1. Install Java 17, Node/npm, MySQL and the MySQL CLI.
2. Copy `backend/.env.example` to the ignored `backend/.env` and configure local DB/JWT values.
3. Install npm dependencies with `npm ci`.
4. Create an empty MySQL database/user matching `DB_URL`, `DB_USERNAME` and `DB_PASSWORD`.
5. Run `npm run db:migrate`.
6. Optional presentation database: set `DEMO_DATA_ALLOWED=true` in the local environment and run `npm run demo:reset`.
7. Start the application with `npm run dev`.

The frontend is normally available at `http://localhost:5173` and the backend at `http://localhost:3000` in local development.

## Release verification index

| Purpose | Command / evidence |
|---|---|
| Full repository quality gate | `npm run verify` |
| Security scan | `npm run security:check` |
| Cross-module/UAT gate | `npm run test:uat` |
| NFR harness | `npm run test:nfr` |
| Deployment assets | `npm run deploy:verify` |
| Demo asset consistency | `npm run demo:assets:check` |
| Demo DB reset | `npm run demo:reset` |
| Demo DB state check | `npm run demo:verify` |
| Final handover static check | `npm run handover:verify` |

## Demo users

All demo accounts are non-sensitive and use the reserved `.example` domain. They exist only after the guarded demo reset.

| Role | Email |
|---|---|
| Administrator | `demo.admin@tgms.example` |
| Supplier | `demo.supplier@tgms.example` |
| Inventory Manager | `demo.inventory@tgms.example` |
| Production Manager | `demo.production@tgms.example` |
| Sales Officer | `demo.sales@tgms.example` |
| Registered Customer | `demo.customer@tgms.example` |

Shared presentation password: supply a runtime-only `DEMO_USER_PASSWORD` when resetting the demo database (demo/dev only; never production or source control).

## Final known limitations

- Web application only; no native mobile application.
- Single business branch only; no multi-branch tenancy or branch transfer model.
- Invoice and payment **recording** only; no third-party payment gateway or online card processing.
- No AI forecasting.
- No automated production optimization/scheduling engine.
- Reporting is descriptive aggregation of stored data; it does not predict demand or future performance.
- Password-reset email requires configured SMTP.
- TGMS-84 found no recorded team-approved cloud hosting provider; the platform-neutral deployment contract is ready, but public deployment still requires that team decision and credentials.
- Performance/NFR figures must be measured in the target environment; the project intentionally does not claim an unmeasured SLA.

## Handover checklist

- [ ] Configure a disposable demo database and run migrations.
- [ ] Run `npm run demo:reset` and `npm run demo:verify`.
- [ ] Run the presentation sequence in `docs/demo/TGMS-85-demo-presentation-runbook.md` once before presenting.
- [ ] Run `npm run handover:verify`.
- [ ] In an environment with dependencies available, run `npm run verify` and `npm run test:uat`.
- [ ] If deployed, run the TGMS-84 smoke test against the actual HTTPS URL.
- [ ] Capture UAT/demo evidence required by the academic submission.
- [ ] Freeze feature work; log any release blocker with reproduction evidence and regression coverage before changing final code.
