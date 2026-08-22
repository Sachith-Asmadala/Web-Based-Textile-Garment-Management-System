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
point. TGMS-3 adds only the shared `users` account table required by authentication;
no garment product, supplier, inventory, order, production, or delivery tables exist
yet. Liquibase also creates its own `DATABASECHANGELOG` and `DATABASECHANGELOGLOCK`
infrastructure tables; these are not application tables.

```text
database/migrations/
├── changes/
│   ├── 0000_baseline.sql
│   └── 20260822181000_create_users.sql
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
