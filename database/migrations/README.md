# Database Migration Workflow and Conventions

This directory is the source of truth for TGMS database changes. The Spring Boot
application packages these files and Liquibase applies pending changesets in order.
Never make an application schema change with undocumented manual SQL.

## Technology and Current Schema

- Database: MySQL.
- Migration engine: Liquibase 5, managed by Spring Boot's dependency management.
- Runtime connection pool: Spring JDBC with HikariCP.
- Development commands: Liquibase Maven plugin through the repository's Maven Wrapper.
- Automated verification: H2 in MySQL compatibility mode.

TGMS-2's `0000_baseline` changeset establishes the reversible, auditable starting
point. TGMS-3 adds the shared `users` account table required by authentication.
TGMS-10 adds the garment catalog source of truth, TGMS-20 adds the supplier profile
source of truth, and TGMS-22 adds supplier-owned material supply records. Inventory,
order, production, and delivery tables do not exist yet. Liquibase also creates its own
`DATABASECHANGELOG` and `DATABASECHANGELOGLOCK` infrastructure tables; these are not
application tables.

```text
database/migrations/
├── changes/
│   ├── 0000_baseline.sql
│   ├── 20260822181000_create_users.sql
│   ├── 20260823105000_create_garment_product_catalog.sql
│   ├── 20260823120500_create_supplier_profiles.sql
│   └── 20260823123000_create_material_supplies.sql
├── db.changelog-master.xml
└── README.md
```

## Local Configuration

Create the ignored environment file from the example:

```bash
cp backend/.env.example backend/.env
```

Create an empty MySQL database and a least-privilege development account. Replace the
placeholder password and keep it consistent with `backend/.env`:

```sql
CREATE DATABASE tgms CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'tgms_user'@'localhost' IDENTIFIED BY '<local-password>';
GRANT ALL PRIVILEGES ON tgms.* TO 'tgms_user'@'localhost';
```

Database configuration uses `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_DRIVER`.
The committed JDBC URL sets the MySQL session time zone to UTC. Credentials and local
`.env` files must never be committed.

## Apply, Inspect, and Roll Back

Run all commands from the repository root:

| Command | Purpose |
|---|---|
| `npm run db:status` | Show applied and pending changesets |
| `npm run db:migrate` | Apply every pending changeset in order |
| `npm run db:rollback:preview` | Print SQL for rolling back the latest changeset without changing data |
| `npm run db:rollback` | Roll back the latest changeset in a disposable development database |
| `npm run db:verify` | Apply, roll back, and reapply all migrations against an isolated test database |

Rollback is deliberately guarded. Preview the SQL first, confirm the target is a
disposable local database, set `DB_ALLOW_ROLLBACK=true`, run the rollback, then restore
the setting to `false`. The command is not permission to roll back shared, staging, or
production data.

Spring Boot also applies pending changesets during application startup. A failed
migration prevents the API from starting instead of allowing the code and schema to
drift apart.

## Add a Migration

1. Update the branch and run `npm run db:migrate`.
2. Add one Liquibase formatted SQL file under `changes/` named
   `<UTC timestamp>_<short_action_in_snake_case>.sql`.
3. Give the changeset a unique immutable ID and author, for example
   `--changeset initials:20260822120000-add-example`.
4. Include the file once, in chronological order, from `db.changelog-master.xml`.
5. Add explicit `--rollback` SQL. Liquibase does not infer rollback for formatted SQL.
6. Run `npm run db:verify`, then verify against MySQL with `db:status`, `db:migrate`,
   `db:rollback:preview`, `db:rollback`, and `db:migrate` again.
7. Run the complete application regression suite.

Never edit, rename, reorder, or reuse the ID of a changeset that has been shared or
applied outside a disposable local database. Correct it with a new forward migration.
Keep one cohesive schema change per changeset and separate large data backfills from
schema changes.

## Naming Conventions

- Use lowercase `snake_case` for schemas, tables, columns, indexes, and constraints.
- Use plural nouns for tables, such as `users`.
- Use singular descriptive column names. Boolean columns read as predicates, such as
  `is_active`.
- Avoid SQL reserved words and quoted, case-sensitive identifiers.
- Use deterministic names: `pk_<table>`, `fk_<table>_<column>`,
  `uq_<table>_<columns>`, `ck_<table>_<rule>`, and `idx_<table>_<columns>`.

## Keys and Relationships

- Persisted entity tables use `id BIGINT AUTO_INCREMENT` as their primary key. Java
  code represents these IDs with `Long`.
- IDs are non-null, unique, stable, never reused, and never changed for business
  reasons.
- Foreign-key columns use `<referenced_entity>_id` and the same `BIGINT` type.
- Enforce relationships with named database foreign keys and index foreign-key
  columns used for joins or filtering.
- Define `ON DELETE` and `ON UPDATE` explicitly. Default to `RESTRICT` where history or
  dependent records exist; use cascading only for a clearly owned aggregate.
- Reference another module's source-of-truth row by ID. Do not copy its authoritative
  names, prices, ownership, roles, or statuses into another module as master data.

## Timestamps and Record History

- Persist timestamps as UTC with MySQL `TIMESTAMP(6)` and convert only at application
  boundaries.
- Mutable tables use non-null `created_at` and `updated_at`; use
  `CURRENT_TIMESTAMP(6)` defaults and update `updated_at` on modification.
- Other timestamp names describe their business event, such as `scheduled_at`.
- Add nullable `deleted_at` only when an approved requirement introduces soft delete.
- Preserve referenced business history with controlled active, discontinued,
  cancelled, or archived states instead of hard deletion.

## Safety Rules

- Add `NOT NULL`, unique, check, and foreign-key constraints for real invariants.
- Validate IDs, ownership, statuses, and numeric ranges at the API boundary and again
  in domain/service logic; database constraints provide the final integrity layer.
- Use Spring transactions when one operation must update multiple records atomically.
- Never trust client-supplied prices, totals, roles, ownership IDs, or status changes.
- Never put credentials, environment-specific hostnames, or business seed data in a
  migration.
- Review rollback SQL before execution and back up data before any destructive schema
  operation.

## Current Shared Account Table

`users` is the authentication source of truth. It uses the standard `BIGINT` primary
key and timestamps, a case-normalized unique email, a bcrypt `password_hash`, full
name, active flag, and one controlled role. Supported stored roles are
`ADMINISTRATOR`, `SUPPLIER`, `INVENTORY_MANAGER`, `PRODUCTION_MANAGER`,
`SALES_OFFICER`, and `CUSTOMER`.

Public registration is an application rule that always inserts `CUSTOMER`; internal
account provisioning belongs to a later approved administrator workflow. Never add
plaintext passwords, tokens, development users, or staff seed credentials to a
migration.

## Supplier Profile Contract

Supplier Management owns `supplier_profiles`. Its generated `id` is the stable
supplier identifier that later Supply and Inventory records must reference as
`supplier_id`. Each profile contains required `business_name`, `contact_phone`, and
`address` values plus the standard timestamps.

`supplier_profiles.user_id` is a required, unique foreign key to `users.id`, giving one
authenticated account at most one supplier profile. The relationship uses
`ON UPDATE RESTRICT ON DELETE RESTRICT` to preserve supplier history. Account-holder
name, login email, password hash, role, and active state remain in `users` and are not
duplicated in the supplier table.

The database guarantees account existence and one-to-one profile ownership. The
TGMS-21 Supplier service additionally verifies that the current linked account remains
active and has the controlled `SUPPLIER` role before reading or writing a profile;
SQL `CHECK` constraints cannot reference a different table. It derives the linked user
only from the authenticated session and never accepts ownership IDs from the client.
Deactivating an account does not delete its supplier identity or historical references.
No supplier seed data is included.

TGMS-21 adds no changeset: it uses the TGMS-20 table through the singular
`GET/PUT /api/supplier-profile` application contract. PUT creates at most one profile
for the authenticated supplier or updates that row without changing its stable `id`,
`user_id`, or `created_at`.

## Material Supply Contract

Supplier Management owns `material_supplies`. Its generated `id` is the stable supply
identifier that later Inventory records may reference as `material_supply_id`.
Every row has a required `supplier_id` foreign key to `supplier_profiles.id`; restrictive
update/delete behavior preserves the supplier relationship and future history.

| Field | Contract |
|---|---|
| `material_code` | Required supplier-scoped material identifier, maximum 64 characters |
| `material_name` / `material_description` | Required name and optional description, with 160/500-character limits |
| `quantity` / `unit_of_measure` | Non-negative `DECIMAL(14,3)` quantity and required unit label |
| `unit_price` | Non-negative exact `DECIMAL(12,2)` current unit price |
| `delivery_lead_time_days` / `delivery_notes` | Non-negative lead time and optional delivery information |
| `status` | Controlled `ACTIVE`, `INACTIVE`, or `DISCONTINUED` lifecycle value |
| `created_at` / `updated_at` | Required UTC-compatible `TIMESTAMP(6)` audit timestamps |

`(supplier_id, material_code)` is unique, allowing different suppliers to use the same
material code while preventing duplicate identifiers within one supplier catalog.
Quantity, price, and delivery lead time allow zero to represent an inactive or currently
unavailable offer, but reject all negative values. TGMS-23 applies the stronger rule
that newly created active records require positive quantity and unit price.

Inventory Management must reference the stable supply `id`; it must not duplicate
Supplier Management's material offer, supplier ownership, current price, delivery lead
time, or lifecycle status as competing master data. No Inventory table, API, seed data,
or supply CRUD behavior is added by TGMS-22.

## Garment Product Catalog Contract

Garment Product Management owns the catalog tables and their stable IDs:

- `garment_categories` owns category name, description, and active/inactive status.
- `garment_products` owns the product name, description, category relationship, and
  `ACTIVE`, `INACTIVE`, or `DISCONTINUED` lifecycle status.
- `garment_product_variants` owns each sellable size/color combination, its exact
  `DECIMAL(12,2)` price, and `AVAILABLE`, `UNAVAILABLE`, or `DISCONTINUED` status.

The variant unique constraint prevents duplicate size/color combinations within one
product. Foreign keys use `RESTRICT` so referenced catalog history cannot be deleted.
Later modules must reference these records by ID and must not copy them as competing
master data. An Order item may reference a variant ID, but it must also snapshot the
accepted selling price so later catalog price changes cannot rewrite order history.

Catalog selection for a new order requires an active category, active product, and
available variant. Inactive, unavailable, and discontinued rows remain readable for
historical references. No demo seed data is included because this repository has no
existing seed workflow.

TGMS-11 creates a product and its first variant in one Spring transaction. Its category
name is normalized and matched case-insensitively against this source of truth. A
matching active category is reused by ID; a missing category is created in the same
transaction; an inactive category is rejected rather than silently reactivated. The
server fixes new product status to `ACTIVE` and only accepts `AVAILABLE` or
`UNAVAILABLE` as initial variant availability.

TGMS-12 exposes the public catalog through an application query over these existing
tables; it adds no schema or seed data. Public visibility requires an `ACTIVE` category,
an `ACTIVE` product, and an `AVAILABLE` variant. Other lifecycle rows remain stored for
staff workflows and historical references but are not returned by the public catalog.

TGMS-13 adds parameterized application queries for product-name search and category,
size, color, and availability filters. It adds no schema change: the existing product
name and relationship/status indexes support the foundation-stage catalog. Filters
always narrow the TGMS-12 public row set and never bypass its lifecycle visibility rule.

TGMS-14 reads a single product by its stable `garment_products.id` through the same
public visibility predicate. It adds no table or index. The public detail response
includes only active category/product rows with at least one available variant, while
the existing staff retrieval contract remains available for authorized lifecycle work.

## TGMS-2 Verification

| Acceptance check | Result |
|---|---|
| Repeatable workflow | Implemented with versioned Liquibase changesets and root apply/status/rollback/verify commands |
| Business-module schema | None added; the baseline changeset creates no application tables |
| Conventions | Keys, relationships, timestamps, naming, history, and safety rules documented above |

## TGMS-3 Verification

| Acceptance check | Result |
|---|---|
| Minimum shared schema | Only `users` added; no business-module table added |
| Repeatable migration | Automated H2/MySQL-mode test applies, rolls back, and reapplies both changesets |
| Account integrity | Unique email, controlled role check, non-null bcrypt hash/name/active state, and standard timestamps enforced |

## TGMS-10 Verification

| Acceptance check | Result |
|---|---|
| Schema applies successfully | Catalog changeset is covered by automated apply, rollback, and reapply verification |
| Required fields represented | Category, product name, size, color, exact price, controlled status/availability, and timestamps are represented |
| Stable IDs | Every catalog table has an auto-generated `BIGINT` primary key and later modules reference parent records through foreign keys |

## TGMS-20 Verification

| Acceptance check | Result |
|---|---|
| Stable supplier ID | `supplier_profiles.id` is an auto-generated `BIGINT` primary key |
| Authenticated relationship | Required unique `user_id` references `users.id` with restrictive update/delete behavior |
| Contact/profile integrity | Business name, contact phone, address, and both timestamps are required; blank-value checks are enforced |
| Credential ownership | Email, password hash, role, active state, and account-holder name remain exclusively in `users` |
| Repeatable migration | Automated tests apply, roll back, and reapply all four changesets |

## TGMS-21 Verification

| Acceptance check | Result |
|---|---|
| Own profile save | Supplier-only service creates or updates by authenticated `users.id` |
| Ownership | Request contract contains no owner ID; unique `user_id` and server-side lookup prevent cross-account edits |
| Invalid values | Required and maximum-length rules are enforced by API validation and service normalization |
| Schema impact | No migration added; automated schema verification remains at four reversible changesets |

## TGMS-22 Verification

| Acceptance check | Result |
|---|---|
| Stable supply and supplier IDs | Generated `material_supplies.id` and required restrictive `supplier_id` foreign key |
| Numeric integrity | Database checks reject negative quantity, unit price, and delivery lead time |
| Inventory readiness | Stable supply ID and documented `material_supply_id` reference contract |
| Repeatable migration | Automated tests apply, roll back, and reapply all five changesets |

## TGMS-23 Application Contract

TGMS-23 adds no migration. `POST /api/material-supplies` inserts into the TGMS-22 table
only after resolving `supplier_profiles.id` from the authenticated Supplier account.
The request contains no `supplier_id` or status, and every new row is database-defaulted
to `ACTIVE`. The service returns the saved stable ID and complete record, rejects
duplicate supplier-scoped material codes, and revalidates required text, decimal
precision, positive quantity/price, and non-negative delivery lead time.

| Acceptance check | Result |
|---|---|
| Valid record save | Transactional Supplier service inserts and reads back the complete active supply |
| Ownership | JWT user ID resolves the unique Supplier profile; client ownership fields are ignored |
| Invalid values | Jakarta request validation, service validation, and TGMS-22 database checks provide layered rejection |
| Schema impact | No changeset added; the five-change migration chain remains reversible |

## TGMS-24 Read Contract

TGMS-24 adds no migration. `GET /api/material-supplies` queries the TGMS-22 table and
joins `supplier_profiles` only to resolve the current supplier business name. Supplier
accounts are always constrained by the server-resolved `supplier_profiles.id`.
Inventory Manager and Administrator accounts may read company-wide supply rows.
Customer and other internal roles are denied by reusable server-side authorization.

The optional case-insensitive `search` filter covers material code, name, description,
unit of measure, and delivery notes. The optional `status` filter accepts only
`ACTIVE`, `INACTIVE`, or `DISCONTINUED`; combined filters use AND semantics.

| Acceptance check | Result |
|---|---|
| Supplier visibility | Repository query receives only the authenticated Supplier's stable profile ID |
| Company read access | Inventory Managers and Administrators receive required supply and supplier display data |
| Search | Parameterized text search and controlled status filter are applied in the repository query layer |
| Schema impact | No changeset added; all five existing changesets remain reversible |

## TGMS-25 Update Contract

TGMS-25 adds no migration. Supplier-owned updates use the existing quantity, unit
price, delivery lead time, delivery notes, and `updated_at` columns. The update SQL
matches both stable supply ID and the Supplier profile ID resolved from the active
authenticated user, then explicitly sets `updated_at = CURRENT_TIMESTAMP(6)`.

Material code/name/description, unit of measure, supplier ownership, lifecycle status,
stable ID, and creation timestamp are not mutable through this contract. Quantity and
unit price must remain positive for a current offer, while delivery lead time remains a
non-negative integer. Inventory Manager and Administrator list reads use the same row
and therefore observe committed updates without duplicated master data.

| Acceptance check | Result |
|---|---|
| Own update | Supplier identity is server-resolved and included in the SQL update predicate |
| Numeric validation | Create and update share positive decimal and non-negative delivery validation |
| Company visibility | Existing authorized list query reads the updated source row immediately |
| Audit metadata | Successful update explicitly advances `updated_at` |
| Schema impact | No changeset added; all five existing changesets remain reversible |

## TGMS-26 Archive and Inventory Handoff Contract

TGMS-26 adds no migration and never physically deletes a supply. Supplier-owned
`DELETE /api/material-supplies/{supplyId}` updates the retained row to
`DISCONTINUED` and advances `updated_at`. The operation is idempotent. Archived rows
remain readable by the owner, Inventory Managers, and Administrators, while further
detail updates are rejected.

Inventory migrations must reference `material_supplies.id` as `material_supply_id`
with restrictive update/delete behavior. New Inventory decisions must resolve an
`ACTIVE` supply through Supplier Management; `DISCONTINUED` rows remain valid for
historical foreign-key references. `supplier_profiles.id` remains the stable Supplier
identity and `material_code` remains only a Supplier-scoped business code.

Current offered quantity, unit price, delivery information, status, and Supplier
ownership remain Supplier Management master data. Inventory may store its own
transaction facts—such as quantity actually received or transaction-time cost—but must
not maintain a competing current-offer record.

| Acceptance check | Result |
|---|---|
| CRUD completion | Profile create/update and supply create/read/search/update/archive contracts are implemented |
| Historical safety | Archive retains the row, stable IDs, timestamps, and authorized read access |
| Permissions | Only the owning Supplier archives; company roles are read-only and unrelated roles are denied |
| Inventory handoff | Stable IDs, active-selection rule, restrictive FK rule, and read endpoints are documented |
| Schema impact | No changeset added; all five existing changesets remain reversible |
