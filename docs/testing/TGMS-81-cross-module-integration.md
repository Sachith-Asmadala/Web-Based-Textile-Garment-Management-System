# TGMS-81 Cross-module end-to-end integration

## Purpose

TGMS-81 verifies that the six independently implemented business modules operate as one system without introducing copied master-data tables or bypassing module-owned service contracts.

## Executed workflow

The automated `CrossModuleEndToEndIntegrationTests` scenario follows the real reachable HTTP workflow:

1. **Garment Product Management** — Sales Officer creates an active garment product and variant.
2. **Order Management** — Customer places an order using the Product-owned `productId` and `variantId`; Order preserves stable IDs and its historical price/size/color snapshots.
3. **Supplier Management** — Supplier creates its own profile and an active material supply.
4. **Fabric Inventory Management** — Inventory Manager creates Inventory stock using `sourceMaterialSupplyId`, preserving the Supplier record as the source reference rather than copying Supplier master data.
5. **Production Management** — Production Manager selects the Inventory-owned material by `inventoryMaterialId`, checks availability, starts Production, and records approved usage through `InventoryMaterialService`.
6. **Order/Production synchronization** — Production start advances `CONFIRMED -> IN_PRODUCTION`; completion after usage and PASSED quality control advances `IN_PRODUCTION -> READY_FOR_DELIVERY` through `OrderService`.
7. **Delivery Management** — Sales Officer selects the now-eligible Order by stable `orderId`, schedules the Delivery, dispatches it, and marks it delivered.
8. **Customer tracking** — Customer reads only their own Delivery progress. Delivery completion advances the source Order to `COMPLETED` through `OrderService`.

The test asserts the complete Order audit trail:

`PENDING -> CONFIRMED -> IN_PRODUCTION -> READY_FOR_DELIVERY -> COMPLETED`

## Boundary and failure regression coverage

TGMS-81 also verifies real negative paths:

- Production material shortage rejects task start with `PRODUCTION_MATERIAL_SHORTAGE` while leaving Production `PENDING`, Order `CONFIRMED`, Inventory quantity unchanged, and no usage rows recorded.
- Delivery scheduling before the source Order reaches `READY_FOR_DELIVERY` is rejected with `ORDER_NOT_READY_FOR_DELIVERY` and creates no Delivery row.
- Customer Delivery tracking uses Order ownership and returns the same `ORDER_NOT_FOUND` boundary for another customer's Order.

## Source-of-truth handoffs

| Boundary | Stable reference used | Authoritative module |
| --- | --- | --- |
| Product -> Order | `product_id`, `variant_id` | Garment Product Management |
| Supplier -> Inventory | `source_material_supply_id` | Supplier Management |
| Inventory -> Production | `inventory_material_id` | Fabric Inventory Management |
| Order -> Production | `order_id` + `OrderService` handoff | Order Management |
| Production -> Delivery | Order status `READY_FOR_DELIVERY` through `OrderService` | Order Management / Production Management |
| Delivery -> Customer tracking | `delivery.order_id` + authenticated customer ownership | Delivery / Order Management |

Order line snapshots are intentionally historical transaction data, not copied master data used for integration.

## Security

TGMS-81 relies on the TGMS-80 role/endpoint security matrix and adds ownership verification to the cross-module path. All mutations continue through existing server-side role guards; the test does not use frontend hiding as an authorization control.

## Database changes

None. TGMS-81 is an integration/quality ticket and introduces no production table or migration.
