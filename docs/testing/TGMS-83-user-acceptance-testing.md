# TGMS-83 User Acceptance Testing and Defect Backlog

## 1. Purpose

TGMS-83 validates the integrated Web Based Textile & Garment Management System against the approved major use cases for Product, Supplier, Fabric Inventory, Order, Production and Delivery Management. The UAT evidence intentionally uses the application's real HTTP/service workflows and existing source-of-truth module contracts; it does not create a separate UAT data model or force impossible database states.

This document is the release-facing UAT checklist. Automated evidence is provided by the listed integration/UI tests and can be executed as one gate with:

```bash
npm run test:uat
```

## 2. Repository and execution environment

Baseline for this UAT package: **TGMS-82 Final**.

Detected implementation stack:

- Frontend: React 19, Vite, TypeScript, Tailwind CSS, React Router
- Backend: Spring Boot 4.1.1 / Java 17 application source
- Security: Spring Security, JWT in secure HttpOnly cookie, BCrypt
- Persistence: Spring JDBC
- Database: MySQL; H2 in MySQL compatibility mode for integration tests
- Migrations: Liquibase
- Backend tests: JUnit / Spring Boot / MockMvc
- Frontend tests: Vitest / Testing Library

### Current sandbox execution status

The TGMS-83 baseline commands were attempted before adding this UAT package:

| Command | Current environment result |
|---|---|
| `npm run typecheck --workspace frontend` | **Blocked** - frontend dependencies/types are not installed (`vite/client`, `vitest/globals`, `@testing-library/jest-dom`) |
| `npm run test --workspace frontend -- --run` | **Blocked** - `vitest: not found` |
| `backend/./mvnw test` | **Blocked** - Maven Wrapper cannot fetch Apache Maven 3.9.16 from Maven Central |

Because the release tests cannot execute in this sandbox, no scenario below is falsely labelled **PASS** based only on source inspection. The checklist records **READY FOR EXECUTION** when the automated evidence exists but its runtime result is not observable here. CI/UAT operators should replace that status with PASS/FAIL after executing `npm run test:uat` and attach the generated test reports/screenshots as release evidence.

## 3. UAT status legend

| Status | Meaning |
|---|---|
| PASS | Scenario executed successfully in the target UAT/CI environment |
| FAIL | Scenario executed and produced a reproducible product defect |
| READY FOR EXECUTION | Scenario has mapped automated/manual evidence but could not be executed in the current sandbox |
| BLOCKED | Environment or external dependency prevents meaningful execution |
| NOT APPLICABLE | Approved scope intentionally excludes the behavior |

## 4. Product Management UAT

Primary actor: **Sales Officer**. Supporting actor: **Registered Customer / Guest** for catalog browsing.

| ID | Actor | Acceptance scenario | Expected result | Automated evidence | Current status |
|---|---|---|---|---|---|
| UAT-PROD-01 | Sales Officer | Create a garment product with valid product/variant data | Product persists with stable IDs and becomes available according to its status | `ProductApiIntegrationTests.salesOfficerCanCreateAndRetrieveProduct` | READY FOR EXECUTION |
| UAT-PROD-02 | Sales Officer | Submit incomplete/invalid product data | Request is rejected before persistence with safe validation feedback | `ProductApiIntegrationTests.invalidAndIncompleteValuesAreRejectedBeforePersistence` | READY FOR EXECUTION |
| UAT-PROD-03 | Guest / Customer | Browse/search public product catalog | Only active products and available variants are returned; filters behave predictably | `ProductApiIntegrationTests.publicCatalogShowsOnlyActiveProductsAndAvailableVariants`, `catalogSearchCombinedFiltersAndClearRequestArePredictable` | READY FOR EXECUTION |
| UAT-PROD-04 | Sales Officer | Update an existing variant | Mutable fields update while product/variant stable IDs remain unchanged | `ProductApiIntegrationTests.salesOfficerCanUpdateSelectedVariantWithoutChangingStableIds` | READY FOR EXECUTION |
| UAT-PROD-05 | Sales Officer | Discontinue a product referenced by business history | Record remains for history and is blocked from new Order selection instead of being hard-deleted | `ProductApiIntegrationTests.discontinuationPreservesHistoryAndBlocksNewOrderSelection` | READY FOR EXECUTION |
| UAT-PROD-06 | Wrong role / Guest | Attempt protected Product mutation | Unauthenticated request is 401; authenticated unauthorized role is 403 | `ProductApiIntegrationTests.productActionsRequireSalesOfficerRole`, `SecurityBoundaryIntegrationTests.protectedMajorActionsRequireAuthenticationAndEnforceRoleGuards` | READY FOR EXECUTION |

Manual evidence to capture during UAT: Product create form, successful Product detail, catalog search result, discontinued Product state, validation message.

## 5. Supplier Management UAT

Primary actor: **Supplier**. Supporting actors: **Inventory Manager, Administrator**.

| ID | Actor | Acceptance scenario | Expected result | Automated evidence | Current status |
|---|---|---|---|---|---|
| UAT-SUP-01 | Supplier | Create/load/update own Supplier profile | Profile persists against authenticated user and stable ID remains unchanged | `SupplierProfileApiIntegrationTests.supplierCanCreateLoadAndUpdateOwnProfileWithoutChangingStableIds` | READY FOR EXECUTION |
| UAT-SUP-02 | Supplier | Create material supply | Supply is normalized, active and linked to authenticated Supplier profile | `MaterialSupplyApiIntegrationTests.supplierCreatesNormalizedActiveSupplyAndReceivesSavedRecord` | READY FOR EXECUTION |
| UAT-SUP-03 | Supplier | Forge ownership fields or access another Supplier's supply | Server ignores forged ownership; another Supplier's record cannot be read/updated/archived | `serverIgnoresForgedOwnershipFieldsAndUsesAuthenticatedSupplierProfile`, `supplierCannotPreloadOrUpdateAnotherSuppliersRecord`, `archiveOwnershipAndRolePermissionsAreEnforced` | READY FOR EXECUTION |
| UAT-SUP-04 | Supplier | Update mutable supply data with invalid numeric values | Invalid values are rejected and stored data remains unchanged | `MaterialSupplyApiIntegrationTests.invalidNumericUpdatesAreRejectedWithoutChangingStoredData` | READY FOR EXECUTION |
| UAT-SUP-05 | Supplier | Archive own supply | Historical supply is preserved, remains readable, and cannot be edited as active data | `supplierArchivesOwnSupplyWithoutDeletingHistoricalRecord`, `archivedSupplyCannotBeEditedButRemainsReadableByOwner` | READY FOR EXECUTION |
| UAT-SUP-06 | Inventory Manager / Administrator | Search company supplies | Authorized supporting roles can read/search current Supplier data without changing ownership | `inventoryManagerAndAdministratorCanReadAndSearchCompanySupplies`, `authorizedCompanyListReadsLatestSupplierUpdate` | READY FOR EXECUTION |

Manual evidence to capture: Supplier profile page, material-supply create/edit screen, own-supply list/search, archived state, unauthorized-access response.

## 6. Fabric Inventory Management UAT

Primary actor: **Inventory Manager**. Supporting actor: **Production Manager** for availability checks.

| ID | Actor | Acceptance scenario | Expected result | Automated evidence | Current status |
|---|---|---|---|---|---|
| UAT-INV-01 | Inventory Manager | Add Inventory material sourced from valid Supplier supply | Inventory record persists and references the real `material_supplies.id` | `InventoryMaterialApiIntegrationTests.inventoryManagerCreatesNormalizedMaterialAndSeesItInList`, TGMS-81 E2E | READY FOR EXECUTION |
| UAT-INV-02 | Inventory Manager | Search/filter Inventory and low-stock view | Server-side stored-field filters return correct records; threshold boundary is respected | `inventoryManagerSearchesAndFiltersInventoryUsingStoredFields`, `lowStockEndpointIncludesBelowAndExactThresholdButExcludesAbove` | READY FOR EXECUTION |
| UAT-INV-03 | Inventory Manager | Consume available material | Quantity reduces exactly once and updated Inventory is returned | `validMaterialUsageReducesStockAndReturnsUpdatedMaterial` | READY FOR EXECUTION |
| UAT-INV-04 | Inventory Manager | Consume more stock than available / invalid quantity | Controlled error; quantity does not partially change | `insufficientStockIsRejectedWithoutPartiallyChangingQuantity`, `nonPositiveUsageIsRejectedWithoutChangingStock` | READY FOR EXECUTION |
| UAT-INV-05 | Inventory Manager | Archive material | History is preserved; future edit/consumption is blocked and low-stock monitoring excludes archived material | `archivePreservesInventoryHistoryAndBlocksFurtherEditOrConsumption`, `archivedLowStockMaterialIsRemovedFromReplenishmentMonitoring` | READY FOR EXECUTION |
| UAT-INV-06 | Production Manager | Check material availability without Inventory mutation permission | Availability uses Inventory source of truth; Production Manager cannot edit stock | `productionManagerCanCheckExactMaterialAvailabilityButCannotEditInventory` | READY FOR EXECUTION |
| UAT-INV-07 | Two Inventory Managers | Concurrently consume limited stock | Exactly one conflicting consumption wins where both cannot be satisfied; stock never goes negative | `NonFunctionalRequirementsIntegrationTests` TGMS-82 concurrency case | READY FOR EXECUTION |

Manual evidence: Inventory create form, Inventory list/search, low-stock state, quantity before/after consumption, archive state, insufficient-stock feedback.

## 7. Order Management UAT

Primary actors: **Registered Customer, Sales Officer**.

| ID | Actor | Acceptance scenario | Expected result | Automated evidence | Current status |
|---|---|---|---|---|---|
| UAT-ORD-01 | Customer | Place own order selecting valid Product/Variant | Customer identity is derived from authenticated session; order/item snapshots persist | `OrderApiIntegrationTests.registeredCustomerPlacesOwnOrderUsingAuthenticatedIdentity`, TGMS-81 E2E | READY FOR EXECUTION |
| UAT-ORD-02 | Sales Officer | Create order for a selected active Customer | Customer/Product data are validated server-side and historical item totals are stored | `salesOfficerCreatesOrderWithValidatedCustomerAndProductSnapshots` | READY FOR EXECUTION |
| UAT-ORD-03 | Customer | Attempt unavailable Product or invalid quantity | Entire Order creation fails atomically; no partial order/items | `registeredCustomerOrderRejectsUnavailableProductAndInvalidQuantityAtomically` | READY FOR EXECUTION |
| UAT-ORD-04 | Sales Officer | Search/open Orders and transition a valid status | Current Order and audited history persist; Customer tracking sees latest status | `staffCanSearchOrdersAndInspectStoredItemsAndHistoricalTotals`, `authorizedStaffCanAdvanceStatusAndCustomerTrackingSeesLatestAuditedState` | READY FOR EXECUTION |
| UAT-ORD-05 | Sales Officer | Attempt invalid/terminal status transition | Transition is rejected without history or partial status mutation | `invalidStatusAndInvalidTransitionsAreRejectedWithoutHistoryOrPartialUpdate`, `completedAndCancelledOrdersAreTerminalAndUnauthorizedRolesCannotUpdateStatus` | READY FOR EXECUTION |
| UAT-ORD-06 | Customer A | Read Customer B's Order/history | Ownership-safe result prevents cross-customer disclosure | `customerHistoryAndDetailAreStrictlyScopedToAuthenticatedCustomer`, `customerTrackingIsOwnershipScopedAndReturnsSafeOrderProgress` | READY FOR EXECUTION |

Manual evidence: Customer Product selection, order-confirmation screen, Order history/tracking, Sales Order detail/status update, validation/ownership-safe error.

## 8. Production Management UAT

Primary actor: **Production Manager**. Administrator support is limited to the existing approved Production permissions.

| ID | Actor | Acceptance scenario | Expected result | Automated evidence | Current status |
|---|---|---|---|---|---|
| UAT-PRD-01 | Production Manager | View Production-eligible Orders and create task | Only real Order handoff records in eligible status are selectable; task references stable `order_id` | `ProductionTaskApiIntegrationTests.productionManagerCanQueryOnlyProductionReadyOrdersThroughOrderHandoff`, `eligibleOrderCreatesPendingTaskLinkedToCorrectOrder` | READY FOR EXECUTION |
| UAT-PRD-02 | Production Manager | Save task details/material requirements | Required details persist; material IDs reference Inventory source of truth | `productionManagerCanSaveAndEditRequiredTaskDetails`, `productionManagerCanSaveCompleteMaterialRequirementsAndSeeAvailability` | READY FOR EXECUTION |
| UAT-PRD-03 | Production Manager | Start Production with sufficient material | Inventory availability is checked; Order synchronizes `CONFIRMED -> IN_PRODUCTION` | `productionStartIsBlockedByShortageAndSucceedsWhenQuantityExactlyMatchesStock`, TGMS-81 E2E | READY FOR EXECUTION |
| UAT-PRD-04 | Production Manager | Start Production with material shortage | Controlled conflict; task, Order and Inventory remain unchanged | TGMS-81 `productionShortageBlocksStartWithoutChangingOrderOrInventory` | READY FOR EXECUTION |
| UAT-PRD-05 | Production Manager | Record material usage | Inventory is deducted through Inventory contract exactly once and usage history persists | `productionMaterialUsageDeductsApprovedRequirementsExactlyOnceAndStoresHistory` | READY FOR EXECUTION |
| UAT-PRD-06 | Production Manager | Complete final task after required usage/quality state | Production completes and Order becomes `READY_FOR_DELIVERY`; multiple tasks keep Order in production until all complete | `productionCompletionRequiresRecordedUsageAndSynchronizesOrderWhenLastTaskCompletes`, `orderStaysInProductionUntilEveryTaskForTheOrderIsCompleted` | READY FOR EXECUTION |
| UAT-PRD-07 | Wrong role | Attempt Production mutation | Unauthorized role is rejected by server-side role guard | `productionTaskEndpointsRequireProductionManager`, `invalidProductionStatusAndInvalidTransitionsAreRejectedAndAuthorizedRolesAreEnforced` | READY FOR EXECUTION |

Manual evidence: eligible Orders, task creation/details, material availability, start action, usage screen/history, quality status, completed task and linked Order progress.

## 9. Delivery Management UAT

Primary actor: **Sales Officer**. Supporting actor: **Registered Customer** for tracking.

| ID | Actor | Acceptance scenario | Expected result | Automated evidence | Current status |
|---|---|---|---|---|---|
| UAT-DEL-01 | Sales Officer | Select Order ready for Delivery | Only `READY_FOR_DELIVERY` Orders without conflicting active Delivery are selectable | `DeliverySelectionApiIntegrationTests.salesOfficerSeesOnlyReadyOrdersWithoutExistingDeliveryAndCanSearchCustomerFields` | READY FOR EXECUTION |
| UAT-DEL-02 | Sales Officer | Schedule Delivery | Delivery persists against stable Order ID with validated schedule/details | `DeliveryScheduleApiIntegrationTests.salesOfficerSchedulesReadyOrderAndSavedRecordMatchesRequest` | READY FOR EXECUTION |
| UAT-DEL-03 | Sales Officer | Attempt premature/duplicate/invalid schedule | Server revalidates readiness and conflicts; failure creates no invalid Delivery | `saveRevalidatesMissingNotReadyAndDuplicateOrders`, TGMS-81 premature-Delivery failure case | READY FOR EXECUTION |
| UAT-DEL-04 | Sales Officer | Progress Delivery to delivered | Valid lifecycle persists; final Delivery synchronizes linked Order to `COMPLETED` | `deliveryLifecyclePersistsAndDeliveredSynchronizesOrderToCompleted` | READY FOR EXECUTION |
| UAT-DEL-05 | Sales Officer | Cancel scheduled Delivery and create corrected replacement | Cancellation preserves history; replacement can be scheduled under safe rules | `DeliveryRecordsApiIntegrationTests.scheduledDeliveryCanBeSafelyCancelledAndReplacementCanBeScheduledWithoutDeletingHistory` | READY FOR EXECUTION |
| UAT-DEL-06 | Customer | Track own Delivery | Customer sees live Delivery linked to own Order and latest replacement where applicable | `CustomerDeliveryTrackingApiIntegrationTests.customerReadsOnlyTheRealDeliveryLinkedToOwnOrder`, `customerTrackingPrefersCurrentReplacementOverCancelledHistory` | READY FOR EXECUTION |
| UAT-DEL-07 | Customer A / Wrong role | Track another Customer's Delivery / use wrong role | Cross-customer Order is ownership-safe; wrong role and Guest are rejected | `anotherCustomersOrderAndUnknownOrderUseSameOwnershipSafeNotFoundResult`, `customerDeliveryTrackingRejectsWrongRoleAndGuest` | READY FOR EXECUTION |

Manual evidence: Delivery-eligible Order selector, schedule form/result, Delivery record/status progression, Customer tracking page, cancellation/replacement history.

## 10. Full cross-module acceptance journey

The release gate must include `CrossModuleEndToEndIntegrationTests.completeGarmentWorkflowUsesStableModuleHandoffsAndFinishesWithCustomerTracking`.

The test creates business records through their real APIs and verifies the same stable IDs across:

1. Product -> Order (`product_id`, `variant_id`)
2. Supplier -> Inventory (`source_material_supply_id`)
3. Inventory -> Production (`inventory_material_id`)
4. Order -> Production (`order_id` and Order service status synchronization)
5. Production completion -> Delivery eligibility (`READY_FOR_DELIVERY`)
6. Delivery -> Customer tracking (`order_id` + ownership)
7. Delivery completion -> Order `COMPLETED`

Expected Order history:

`PENDING -> CONFIRMED -> IN_PRODUCTION -> READY_FOR_DELIVERY -> COMPLETED`

This is the principal evidence that the six member-built modules function as one garment-management system without copied master records.

## 11. Role/security acceptance gate

UAT must also execute `SecurityBoundaryIntegrationTests` so UI-level acceptance is not mistaken for authorization proof.

Required release behavior:

- Missing/invalid authenticated session for protected API -> **401**
- Authenticated actor without the required role -> **403**
- Customer/Supplier ownership violations -> ownership-safe 404/403 behavior defined by the owning module
- Public Product catalog remains intentionally public
- Business mutation APIs remain protected server-side

See `docs/security/TGMS-80-role-endpoint-matrix.md` for the complete endpoint matrix.

## 12. Defect recording and retest procedure

A UAT failure is only a product defect when it is reproducible in a valid reachable workflow. Do not create defects by manually forcing impossible database states.

For every FAIL:

1. Assign the next defect ID `TGMS-UAT-###`.
2. Record UAT case ID, actor, environment, exact steps, expected result, actual result and evidence.
3. Classify severity: Critical, High, Medium or Low.
4. Link the owning module and affected stable record IDs where useful; do not copy business data into the defect itself beyond reproducibility needs.
5. Add or update an automated regression test that reproduces the failure before changing production code.
6. Implement the smallest fix in the owning module/service.
7. Run the targeted regression test, affected module suite, TGMS-81 cross-module suite and TGMS-80 security suite.
8. Mark the defect **Resolved - Pending UAT Retest**.
9. The original UAT actor repeats the scenario and attaches evidence.
10. Close only after retest is PASS.

The current defect ledger is maintained in `docs/testing/TGMS-83-defect-backlog.md`.

## 13. Evidence package for lecturer/release review

For a formal UAT session, retain:

- this checklist with PASS/FAIL filled in
- test command output from `npm run test:uat`
- `backend/target/surefire-reports/` results
- frontend Vitest output
- screenshots for the manual evidence items listed per module
- database/application log excerpt only when needed for diagnosis, with secrets/tokens removed
- defect backlog with retest evidence

## 14. Release decision rule

TGMS-83 can move to **Done** only when:

- all Must/critical UAT scenarios have executed;
- no open Critical/High product defect remains;
- all six module boundaries pass the full-system acceptance journey;
- ownership/security cases pass;
- any failed case has a defect ID, regression test, fix and successful retest;
- the normal full regression/build checks are also green in the release environment.

In this sandbox the correct ticket state is **Ready for UAT / CI Execution**, because the test dependencies cannot execute here. This is an environment limitation, not a claim that the UAT scenarios failed.
