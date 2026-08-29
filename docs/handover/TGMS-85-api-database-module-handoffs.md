# TGMS-85 API, Database and Module Handoff Notes

## Canonical database boundaries

| Module | Canonical tables |
|---|---|
| Accounts/security | `users`, `password_reset_tokens` |
| Product | `garment_categories`, `garment_products`, `garment_product_variants` |
| Supplier | `supplier_profiles`, `material_supplies` |
| Inventory | `inventory_materials` |
| Order | `orders`, `order_items`, `order_status_history`, `quotations`, `quotation_items`, `order_invoices`, `order_payment_records` |
| Production | `production_tasks`, `production_task_details`, `production_task_material_requirements`, `production_task_material_usage` |
| Delivery | `deliveries` |
| Supporting notifications | `notifications` |

Search and reporting do not own copied business tables.

## Stable integration keys

- `orders.customer_id → users.id`
- `order_items.product_id → garment_products.id`
- `(order_items.product_id, order_items.variant_id) → garment_product_variants(product_id, id)`
- `supplier_profiles.user_id → users.id`
- `material_supplies.supplier_id → supplier_profiles.id`
- `inventory_materials.source_material_supply_id → material_supplies.id`
- `production_tasks.order_id → orders.id`
- `production_task_material_requirements.inventory_material_id → inventory_materials.id`
- `production_task_material_usage` references the same task/material requirement and records usage; stock remains Inventory-owned.
- `deliveries.order_id → orders.id`; active delivery uniqueness is enforced with `active_order_lock_id` while cancelled Delivery history is preserved.

## Controlled lifecycle values

- Order: `PENDING`, `CONFIRMED`, `IN_PRODUCTION`, `READY_FOR_DELIVERY`, `COMPLETED`, `CANCELLED`.
- Production: `PENDING`, `IN_PROGRESS`, `COMPLETED`.
- Production QC: `PENDING`, `PASSED`, `FAILED`.
- Delivery: `SCHEDULED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.
- Product: `ACTIVE`, `INACTIVE`, `DISCONTINUED`; Variant: `AVAILABLE`, `UNAVAILABLE`, `DISCONTINUED`.
- Supplier/Inventory records preserve history with controlled active/inactive/discontinued states instead of dependent hard deletion.

## Final API families

| Family | Representative paths | Ownership/security rule |
|---|---|---|
| Authentication | `/api/auth/**` | Registration is Customer-only provisioning; staff roles are never client-selectable |
| Admin users | `/api/admin/users/**` | Administrator only; self-admin protection and persisted RBAC |
| Product | `/api/products/**` | Public catalogue read; Sales Officer mutation |
| Supplier | `/api/supplier-profile`, `/api/material-supplies/**` | Supplier self-ownership; approved staff reads where defined |
| Inventory | `/api/inventory-materials/**` | Inventory Manager mutation; atomic stock deductions |
| Order | `/api/orders/**`, `/api/orders/mine/**` | Staff role policy; Customer ownership derived from JWT subject |
| Production | `/api/production/tasks/**` | Production Manager mutations; delegates Order/Inventory handoffs to owning services |
| Delivery | `/api/deliveries/**` | Sales Officer lifecycle; Customer tracking is ownership scoped |
| Profile | `/api/profile` | authenticated self-service; protected identity/security fields read-only |
| Notifications | `/api/notifications/**` | recipient scoped to authenticated user |
| Search | `/api/search` | role-aware; Customer Order search remains DB ownership scoped |
| Reports | `/api/reports/dashboard` | role-aware aggregates over real module tables |

## Historical-data rules

Product/Order financial and selection snapshots are intentionally immutable transaction history. They are not replacement Product master data. Archived/discontinued/cancelled records remain available where needed for audit/history; integration code should reference stable IDs and owning service contracts rather than copying current records into another module.

## Final integration regression evidence

Use `backend/src/test/java/lk/ac/sliit/tgms/integration/CrossModuleEndToEndIntegrationTests.java` and `docs/testing/TGMS-81-cross-module-integration.md` as the canonical automated evidence for the six-module chain. Role/ownership evidence is indexed by TGMS-80/TGMS-83.
