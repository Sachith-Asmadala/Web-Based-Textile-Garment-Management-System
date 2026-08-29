# LankaWear Apparel

## Web-Based Textile & Garment Management System

LankaWear Apparel is a full-stack operations platform for a Sri Lankan garment
business. It connects product cataloguing, suppliers, material inventory, customer
orders, quotations, billing, production, quality control, delivery, notifications,
reporting, and role-based administration through one source of truth.

<p align="center">
  <img src="frontend/public/brand/lankawear-lockup.png" alt="LankaWear Apparel" width="460">
</p>

## Contents

- [Core capabilities](#core-capabilities)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Database setup](#database-setup)
- [Environment configuration](#environment-configuration)
- [Demo data](#demo-data)
- [Development commands](#development-commands)
- [Testing and quality](#testing-and-quality)
- [Project structure](#project-structure)
- [Security model](#security-model)
- [Troubleshooting](#troubleshooting)
- [Deployment and supporting documentation](#deployment-and-supporting-documentation)

## Core capabilities

| Area | Capabilities |
| --- | --- |
| Authentication | Customer registration, login/logout, session recovery, password reset, secure cookies |
| Administration | Account provisioning, role assignment, account activation and deactivation |
| Product catalogue | Categories, products, variants, sizes, colours, prices, availability, product images |
| Supplier management | Supplier profiles, materials, quantities, prices, lead times and lifecycle status |
| Inventory | Linked supply records, stock quantities, low-stock thresholds, availability and consumption |
| Sales | Customer quotations, order creation, order status history, invoicing and payment recording |
| Production | Production tasks, material requirements, material usage and quality-control results |
| Delivery | Eligible-order selection, scheduling, lifecycle tracking and safe cancellation |
| Operations | Role-aware dashboards, shared search and in-system notifications |

The supported roles are `ADMINISTRATOR`, `SUPPLIER`, `INVENTORY_MANAGER`,
`PRODUCTION_MANAGER`, `SALES_OFFICER`, and `CUSTOMER`. The API enforces permissions;
hiding a route or navigation item in React is only an additional user-interface guard.

## Architecture

```text
Browser
  |
  |  React + Axios
  v
Vite development server :5173
  |
  |  /api proxy
  v
Spring Boot API :3000
  |
  |  services, transactions, validation and authorization
  v
Spring JDBC / HikariCP
  |
  v
MySQL 8+  <--- Liquibase migrations
```

The application follows a modular controller → service/domain → repository structure.
Each module owns its authoritative records, while cross-module workflows use stable
database identifiers and validated state transitions.

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript 6, Vite 8, React Router 7, Tailwind CSS 4, Axios |
| Backend | Java 17, Spring Boot 4, Spring Security, Spring JDBC, Jakarta Validation |
| Database | MySQL 8+, Liquibase 5, HikariCP |
| Testing | Vitest, Testing Library, JUnit, MockMvc, H2 in MySQL compatibility mode |
| Tooling | npm workspaces, Maven Wrapper, ESLint, GitHub Actions |

## Prerequisites

Install these tools before running the project:

- Node.js 20.19 or newer
- npm 11 or a compatible version
- Java Development Kit 17 or newer
- MySQL 8 or newer
- Git

Confirm the main tools:

```bash
node --version
npm --version
java -version
mysql --version
```

The repository includes Maven wrappers for both Unix (`backend/mvnw`) and Windows
(`backend/mvnw.cmd`), so a separate Maven installation is unnecessary.

## Quick start

### macOS or Linux

```bash
git clone https://github.com/IT24103430/Web-Based-Textile-Garment-Management-System.git
cd Web-Based-Textile-Garment-Management-System
chmod +x run.sh
./run.sh
```

### Windows

```bat
git clone https://github.com/IT24103430/Web-Based-Textile-Garment-Management-System.git
cd Web-Based-Textile-Garment-Management-System
run.bat
```

On the first launch, the script:

1. verifies Node.js, npm and Java;
2. creates `backend/.env` from `backend/.env.example` when it is missing;
3. asks you to configure the database password and JWT secret;
4. installs locked npm dependencies when they are missing;
5. starts the API and frontend together.

After configuring a newly created `backend/.env`, run the launcher again. Spring Boot
applies pending Liquibase migrations automatically during API startup.

Use validation-only mode to check a machine without starting servers:

```bash
./run.sh --check
```

```bat
run.bat --check
```

Application URLs:

| Service | URL |
| --- | --- |
| Public application | <http://localhost:5173> |
| Product catalogue | <http://localhost:5173/products> |
| Login | <http://localhost:5173/login> |
| Customer registration | <http://localhost:5173/register> |
| API health | <http://localhost:3000/api/health> |

Press `Ctrl+C` in the launcher terminal to stop both servers.

## Database setup

### 1. Start MySQL

macOS with Homebrew:

```bash
brew services start mysql
```

Ubuntu/Debian Linux:

```bash
sudo systemctl start mysql
```

Windows installations commonly use the `MySQL80` service name. Open an Administrator
Command Prompt and run:

```bat
net start MySQL80
```

If the service has a different name, open `services.msc`, locate the MySQL service,
and select **Start**.

### 2. Create the database and application account

Open MySQL as an administrative user:

```bash
mysql -u root -p
```

Run the following once, replacing the placeholder with a strong local password:

```sql
CREATE DATABASE tgms
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

CREATE USER 'tgms_user'@'localhost'
    IDENTIFIED BY '<local-password>';

GRANT ALL PRIVILEGES ON tgms.*
    TO 'tgms_user'@'localhost';
```

Use the same password for `DB_PASSWORD` in `backend/.env`. Do not rerun `CREATE USER`
when the account already exists.

### 3. Inspect and apply migrations

From the repository root:

```bash
npm run db:status
npm run db:migrate
```

Never create application tables manually. The migration source of truth is
`database/migrations/db.changelog-master.xml` and its ordered changesets.

## Environment configuration

Create the local configuration manually if the launcher has not already done so:

macOS/Linux:

```bash
cp backend/.env.example backend/.env
```

Windows:

```bat
copy backend\.env.example backend\.env
```

Important variables:

| Variable | Local purpose |
| --- | --- |
| `PORT` | Spring Boot port; defaults to `3000` |
| `CLIENT_ORIGIN` | Allowed browser origin; defaults to `http://localhost:5173` |
| `DB_URL` | JDBC connection to the `tgms` database |
| `DB_USERNAME` | MySQL application account |
| `DB_PASSWORD` | MySQL application password |
| `JWT_SECRET` | Random secret of at least 32 UTF-8 bytes |
| `JWT_SESSION_HOURS` | Authentication session lifetime |
| `COOKIE_SECURE` | `false` only for local HTTP; production must use secure cookies |
| `SMTP_ENABLED` | Enables password-reset email delivery when configured |
| `NOTIFICATIONS_ENABLED` | Enables operational in-system notifications |
| `DEMO_DATA_ALLOWED` | Explicit safety switch for disposable demo seeding |

Generate a suitable local JWT secret on macOS/Linux:

```bash
openssl rand -base64 48
```

Never commit `.env`, `backend/.env`, real credentials, password hashes, or tokens.

## Demo data

The project includes deterministic Sri Lankan demonstration data covering all six
roles and the complete operational lifecycle. It creates:

- Sri Lankan user identities and a supplier profile;
- material supplies and linked inventory;
- four garment products with local catalogue photography and variants;
- quotations, orders, status history, invoices and payments;
- production tasks, material requirements/usage and quality control;
- deliveries and notifications.

The seed is intentionally separate from Liquibase and must only run against a local,
disposable database. On macOS/Linux or Git Bash/WSL:

```bash
export DEMO_DATA_ALLOWED=true
read -s "DEMO_USER_PASSWORD?Demo login password: "
export DEMO_USER_PASSWORD
npm run demo:reset
npm run demo:verify
unset DEMO_USER_PASSWORD DEMO_DATA_ALLOWED
```

All demo accounts use the runtime password entered above. The password and its reusable
hash are not stored in source control. Account emails and detailed demo instructions
are documented in [the demo-data guide](database/demo/README.md).

## Development commands

Run commands from the repository root unless stated otherwise.

| Command | Purpose |
| --- | --- |
| `./run.sh` | Start frontend and backend on macOS/Linux |
| `run.bat` | Start frontend and backend on Windows |
| `npm run dev` | Start both development servers directly |
| `npm run dev:backend` | Start only Spring Boot |
| `npm run dev --workspace frontend` | Start only Vite |
| `npm run build` | Build frontend assets and backend JAR |
| `npm run lint` | Run ESLint checks |
| `npm run typecheck` | Type-check React and compile Java |
| `npm test` | Run frontend and backend tests |
| `npm run verify` | Run the complete local quality gate |
| `npm run db:status` | Show applied and pending Liquibase changesets |
| `npm run db:migrate` | Apply pending changesets |
| `npm run db:verify` | Verify migration apply/rollback/reapply using an isolated test DB |
| `npm run demo:verify` | Verify the disposable demo dataset |

Rollback commands are deliberately guarded. Read `database/migrations/README.md` and
preview rollback SQL before using them.

## Testing and quality

The same quality gate used by GitHub Actions is available locally:

```bash
npm ci
npm run verify
```

The gate performs security checks, linting, TypeScript/Java compilation, frontend and
backend tests, isolated migration verification, and production builds. For a focused
frontend run with limited worker resources:

```bash
npm run test --workspace frontend -- --maxWorkers=1 --fileParallelism=false
```

Contribution rules and the Definition of Done are maintained in
[CONTRIBUTING.md](CONTRIBUTING.md).

## Project structure

```text
.
├── backend/
│   ├── src/main/java/lk/ac/sliit/tgms/   Spring Boot modules
│   ├── src/main/resources/               Runtime configuration
│   ├── src/test/                          Backend and schema tests
│   ├── mvnw / mvnw.cmd                    Maven wrappers
│   └── pom.xml
├── database/
│   ├── migrations/                        Liquibase schema source of truth
│   └── demo/                              Disposable presentation data
├── frontend/
│   ├── public/                            Brand, video and product media
│   ├── src/api/                           Typed API clients
│   ├── src/                               React features, pages and components
│   └── vite.config.ts
├── docs/                                  Security, testing, deployment and handover
├── scripts/                               Database, demo, deployment and QA tools
├── run.sh                                 macOS/Linux launcher
├── run.bat                                Windows launcher
├── package.json                           Shared command surface
└── package-lock.json                      Reproducible npm dependency graph
```

Generated `node_modules`, `frontend/dist`, `backend/target`, coverage output and local
environment files are excluded from version control.

## Security model

- Authentication uses BCrypt password hashes and a signed session token in an HTTP-only cookie.
- Production configuration requires secure cookies and a strong secret supplied outside source control.
- API endpoints enforce role and ownership rules independently of frontend routing.
- Request DTOs and service rules validate input, identifiers, statuses and state transitions.
- SQL access uses prepared statements through Spring JDBC.
- Unexpected failures return a safe error envelope; internal stack traces are not exposed by the API.
- Password-reset tokens are time limited and stored independently from user credentials.
- MySQL must remain private and must never be exposed directly to the public internet.

The approved role-to-endpoint contract is documented in the
[role-to-endpoint matrix](docs/security/TGMS-80-role-endpoint-matrix.md).

## Troubleshooting

### The browser is blank after restarting Vite

Use a hard refresh:

- macOS Chrome: `Command + Shift + R`
- Windows/Linux Chrome: `Ctrl + Shift + R`

If necessary, clear the site data for `localhost:5173` in Chrome DevTools →
**Application** → **Storage**, then reload.

### Vite reports `ECONNREFUSED` for `/api/...`

The frontend started before the API became ready, or the backend failed during database
startup. Wait for `Started TgmsApplication`, then refresh. Check:

```bash
curl http://localhost:3000/api/health
```

### MySQL connection fails

Confirm that MySQL is running and the four `DB_*` values in `backend/.env` match the
database account:

```bash
mysql -u tgms_user -p tgms
npm run db:status
```

### Port 3000 or 5173 is already in use

Stop the older project terminal with `Ctrl+C`. To identify the process:

macOS/Linux:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:5173 -sTCP:LISTEN
```

Windows:

```bat
netstat -ano | findstr :3000
netstat -ano | findstr :5173
```

### `concurrently` or another npm command is missing

Reinstall the locked workspace dependencies:

```bash
npm ci
```

### Windows blocks `run.bat`

Open Command Prompt in the repository directory and run `run.bat` directly. The batch
launcher does not require PowerShell execution-policy changes.

## Deployment and supporting documentation

Production deployment requires TLS, secure cookies, externally supplied secrets, a
private MySQL service, backups, SPA fallback routing, and an `/api` reverse proxy.
Validate the production environment before building or deploying:

```bash
npm run deploy:env:check
npm run build
npm run deploy:verify
```

| Document | Purpose |
| --- | --- |
| [Database migration guide](database/migrations/README.md) | Database workflow, conventions and rollback safety |
| [Demo-data guide](database/demo/README.md) | Demo identities, reset controls and product media |
| [Role-to-endpoint matrix](docs/security/TGMS-80-role-endpoint-matrix.md) | Authorization contract |
| [Cross-module integration](docs/testing/TGMS-81-cross-module-integration.md) | Cross-module integration coverage |
| [Non-functional verification](docs/testing/TGMS-82-non-functional-verification.md) | Non-functional verification evidence |
| [User acceptance testing](docs/testing/TGMS-83-user-acceptance-testing.md) | UAT scenarios and outcomes |
| [Deployment, backup and recovery](docs/deployment/TGMS-84-deployment-backup-recovery.md) | Deployment, backup and recovery runbook |
| [Demo presentation runbook](docs/demo/TGMS-85-demo-presentation-runbook.md) | Demonstration workflow |
| [Final handover](docs/handover/TGMS-85-final-handover.md) | Final technical handover |

For development standards, testing expectations, API conventions, and review criteria,
see [CONTRIBUTING.md](CONTRIBUTING.md).
