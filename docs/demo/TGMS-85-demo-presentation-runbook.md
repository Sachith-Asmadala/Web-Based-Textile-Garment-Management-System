# TGMS-85 Final Demonstration Runbook

## Goal

Repeat the same final demonstration from a known, non-sensitive database state and show that the six modules operate as one system. The demo uses real source tables and normal UI/API workflows; the seed only establishes the starting records.

## Before the presentation

1. Use a disposable local/demo MySQL database—never the production database.
2. Apply migrations with `npm run db:migrate`.
3. Set `DEMO_DATA_ALLOWED=true` and a 12–72 byte `DEMO_USER_PASSWORD` in your local shell. Do not commit either value.
4. Run `npm run demo:reset` and confirm with the documented prompt/argument.
5. Run `npm run demo:verify`; expected result is six roles, one linked supply, one inventory material, one product and `DEMO-ORD-001` in `PENDING`.
6. Start the system with `npm run dev`.
7. Open the app and confirm `/api/health` is healthy.

### Demo credentials

Every account uses the runtime-only `DEMO_USER_PASSWORD` supplied when the seed is run. Record it in an approved local password manager for the presentation; it is not stored in the repository.

| Actor | Email | Main demonstration responsibility |
|---|---|---|
| Administrator | `demo.admin@tgms.example` | RBAC, users, dashboard/reporting |
| Supplier | `demo.supplier@tgms.example` | Supplier profile and `DEMO-COTTON-001` |
| Inventory Manager | `demo.inventory@tgms.example` | `DEMO-FABRIC-001`, stock and low-stock behavior |
| Production Manager | `demo.production@tgms.example` | Production task, material usage, QC/completion |
| Sales Officer | `demo.sales@tgms.example` | Product/Order status and Delivery |
| Customer | `demo.customer@tgms.example` | Product browsing, Order history/tracking, Delivery tracking |

The `.example` email domain is reserved documentation data and cannot be mistaken for real customer/supplier mailboxes.

## Seeded starting state

| Record | Starting state |
|---|---|
| Product | `[DEMO] Essential Polo`, size `M`, Navy, price `3250.00`, available |
| Supplier supply | `DEMO-COTTON-001`, Premium Cotton Fabric |
| Inventory | `DEMO-FABRIC-001`, `50.000 metres`, low-stock threshold `30.000`, linked to the demo supply |
| Customer Order | `DEMO-ORD-001`, quantity `10`, status `PENDING`, references the demo Product/Variant |
| Production | none—create through the UI during the demo |
| Delivery | none—schedule through the UI only after Production makes the Order ready |

Recommended Production material requirement/usage during the demo: **25.000 metres**. This leaves Inventory at `25.000`, crossing the `30.000` threshold and allowing the low-stock supporting alert to be shown when notifications are enabled.

## Recommended 10–12 minute presentation sequence

### 1. Guest and Product Management — 1 minute

Open `/products` without signing in. Show `[DEMO] Essential Polo` and its variant. Explain that the catalogue is public read-only while Sales Officer mutations are protected by backend RBAC.

### 2. Customer / Product → Order — 1 minute

Sign in as the Customer and open **Order history**. Show `DEMO-ORD-001` in `PENDING` and the Product/Variant selection. Explain that the Order stores stable Product/Variant IDs plus immutable order-time snapshots for historical accuracy.

### 3. Supplier → Inventory — 1 minute

Sign in as Supplier. Open **My material supplies** and show `DEMO-COTTON-001`. Then sign in as Inventory Manager and open **Inventory materials**. Show `DEMO-FABRIC-001`, quantity `50.000`, and its link back to the Supplier supply. Explain that Inventory references the supply by stable ID instead of copying Supplier master data.

### 4. Sales Officer / confirm Order — 1 minute

Sign in as Sales Officer. Open **Customer orders**, find `DEMO-ORD-001`, and change `PENDING → CONFIRMED`. Show the Order detail/status history if visible. Production can now select the Order.

### 5. Production Manager / Inventory usage — 3 minutes

Sign in as Production Manager.

1. Open **Create production task** and select `DEMO-ORD-001`.
2. Create the task using clear presentation details, for example `Cut and stitch demo polo batch`, assignment `Line A`.
3. Assign `DEMO-FABRIC-001` with required quantity `25.000`.
4. Show material availability.
5. Start Production; explain that this synchronizes the Order to `IN_PRODUCTION` through the Order module contract.
6. Record material usage of `25.000` metres; Inventory should become `25.000`, not a copied Production stock value.
7. Record quality control `PASSED`.
8. Complete the Production task. For the final task, the Order should become `READY_FOR_DELIVERY`.

### 6. Inventory/Notifications checkpoint — 1 minute

Sign in as Inventory Manager. Show `DEMO-FABRIC-001 = 25.000`, now below/equal to the configured low-stock threshold. Open **Notifications** if notifications are enabled and the asynchronous alert has been persisted. Explain that notifications are supporting records; Inventory remains the stock source of truth.

### 7. Sales Officer / Delivery — 2 minutes

Sign in as Sales Officer.

1. Open **Prepare delivery** and select `DEMO-ORD-001`, which should now be eligible.
2. Schedule a Delivery using a presentation address and a future/local suitable date/time.
3. Open **Delivery records**.
4. Change `SCHEDULED → OUT_FOR_DELIVERY`.

Explain that Delivery cannot be created while the Order is not ready.

### 8. Customer tracking and completion — 1 minute

Sign in as Customer and open **Track an order** for `DEMO-ORD-001`; show Delivery progress. Return as Sales Officer and change the Delivery to `DELIVERED`. Then show that Customer tracking reports delivered and the Order lifecycle reaches `COMPLETED`.

### 9. Administrator/supporting features — 1 minute

Sign in as Administrator. Briefly show **User accounts**, **Dashboard**, **Search**, and role-specific protection. Mention password recovery, profile settings, notifications and reporting as supporting functions rather than separate operational sources of truth.

## Expected lifecycle checkpoints

```text
Order: PENDING
       ↓ Sales Officer confirms
       CONFIRMED
       ↓ Production starts
       IN_PRODUCTION
       ↓ final Production task completes with QC passed
       READY_FOR_DELIVERY
       ↓ Delivery becomes DELIVERED
       COMPLETED

Inventory: 50.000 metres
           ↓ Production records 25.000 metres usage
           25.000 metres (low stock against threshold 30.000)
```

## Reset after rehearsal or presentation

Run the guarded reset again:

```bash
npm run demo:reset
npm run demo:verify
```

The reset removes demo-derived Delivery, Production, Order history/billing, notifications and other dependent records in foreign-key-safe order, then recreates the exact starting state. It does not truncate business tables or alter non-demo records.

## Presentation fallback plan

If a live network/browser issue occurs, do not fabricate results. Use the seeded starting records and the documented automated evidence in TGMS-81/TGMS-83 to explain the handoffs, then record the environmental problem. If the database has been changed during rehearsal, reset it rather than manually forcing impossible statuses.

## Final scope statement for the presentation

State these limitations clearly:

- web only;
- one business branch;
- invoice/manual payment recording only—no third-party payment gateway;
- no AI forecasting;
- no automated production optimization;
- reports use stored historical/current data only;
- cloud platform selection/public deployment remains a team decision documented in TGMS-84.
