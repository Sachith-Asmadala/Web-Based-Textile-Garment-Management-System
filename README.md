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

A feature should be considered complete only when:

- [ ] Required functionality is implemented
- [ ] Acceptance criteria are satisfied
- [ ] Input validation is implemented
- [ ] Role permissions are enforced
- [ ] Error states are handled
- [ ] Database changes are documented
- [ ] Existing functionality is not broken
- [ ] Relevant tests pass
- [ ] Code has been reviewed
- [ ] Documentation is updated
- [ ] Feature is merged into the shared project branch

---

# Current Repository Architecture

> TGMS-1 baseline inspected on 2026-08-22 at commit `d1cba2a` on branch `main`.

The original repository contained only this README. Because no technical stack had
been committed, the approved frontend fallback and the requested Spring Boot backend
were used to establish a minimal runnable foundation without adding authentication,
database models, or business-module functionality.

```text
Web-Based-Textile-Garment-Management-System/
├── backend/
│   ├── .mvn/wrapper/maven-wrapper.properties
│   ├── src/main/
│   │   ├── java/lk/ac/sliit/tgms/
│   │   │   ├── api/
│   │   │   ├── config/
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
│       ├── db.changelog-master.xml
│       └── README.md
├── frontend/
│   ├── src/
│   │   ├── test/setup.ts
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
├── .gitignore
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
| Authentication | Spring Security with JWT in a secure HttpOnly cookie and bcrypt is the approved future direction; authentication is not implemented in TGMS-1 |
| Package managers | npm workspace and lockfile for the frontend; Maven Wrapper and `pom.xml` for the backend |
| Environment | `backend/.env.example`; local secrets belong in ignored `backend/.env` |
| Tests | Vitest and React Testing Library for the UI; JUnit 5, Spring Test, MockMvc, and H2 migration verification for the backend |
| Quality | ESLint and TypeScript checks for React; Maven compile, test, and package checks for Spring Boot |

## Current Application Flow

```text
Browser at http://localhost:5173
        │
        ▼
React foundation page
        │  Axios GET /api/health
        ▼
Vite development proxy
        │
        ▼
Spring Boot API at http://localhost:3000
        │
        ├── Liquibase applies pending changesets to MySQL at startup
        └── 200 { "status": "ok", "service": "tgms-api" }
```

The frontend displays checking, available, and unavailable API states. Spring Boot
exposes only the non-business health endpoint and returns a safe JSON `404` for unknown
API routes. Liquibase currently applies a reversible baseline that creates no domain
tables. The generic business diagrams above remain the target flow for future tickets.

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
npm install
```

The root npm workspace installs the frontend dependencies using the committed lockfile.
The backend dependencies are downloaded automatically by `backend/mvnw` when a backend
command first runs.

## 3. Configure Local Environment

```bash
cp backend/.env.example backend/.env
```

The checked-in values are development placeholders. Replace the database password and
JWT secret before their dependent tickets enable database access or authentication.
The `.env` file is ignored by Git and must never be committed.

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
npm run dev
```

- Frontend: `http://localhost:5173`
- API health check: `http://localhost:3000/api/health`

Stop both servers with `Ctrl+C`.

## Available Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Spring Boot API and Vite frontend together |
| `npm run dev:backend` | Start only the Spring Boot API |
| `npm run lint` | Lint the React workspace |
| `npm run typecheck` | Type-check React and compile the Spring backend |
| `npm test` | Run Vitest and Maven/JUnit tests |
| `npm run build` | Build Vite assets and the executable Spring Boot JAR |
| `npm run db:status` | Show applied and pending Liquibase changesets |
| `npm run db:migrate` | Apply pending changesets to the configured MySQL database |
| `npm run db:rollback:preview` | Preview rollback SQL for the latest changeset |
| `npm run db:rollback` | Guarded rollback of one changeset in development |
| `npm run db:verify` | Apply, roll back, and reapply migrations against an isolated test database |

Migration authoring, safety rules, and database conventions are documented in
[database/migrations/README.md](database/migrations/README.md).

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
| `npm test` | Pass: 2 frontend and 4 Spring backend tests |
| `npm run build` | Pass: Vite production assets and executable Spring Boot JAR |
| `npm run db:verify` | Pass: apply, rollback, reapply, and zero domain tables |
| `npm audit` | Pass: 0 known vulnerabilities |

---

# Testing

Tests are colocated with their application: React tests are under `frontend/src`, while
Spring tests are under `backend/src/test`. Future tickets should add unit, integration,
failure, and authorization coverage appropriate to their behavior.

## Important Integration Scenarios

- [ ] Create garment product
- [ ] Browse and search products
- [ ] Create supplier and supply information
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
