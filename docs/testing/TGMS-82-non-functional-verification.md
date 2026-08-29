# TGMS-82 — Performance, reliability and usability verification

## Objective and documented NFRs

TGMS-82 verifies the practical parts of the project's documented non-functional requirements without turning development/test observations into production guarantees.

The existing project README defines these relevant requirements:

- **Performance:** responsive access to products, orders and records; support multiple users without significant delays.
- **Usability:** simple/user-friendly interface; common tasks should be easy to understand and perform.
- **Reliability:** maintain accurate records, reduce data-loss risk and operate consistently.
- **Availability:** keep the system accessible and minimize downtime.

Security was comprehensively hardened/reviewed in TGMS-80 and cross-module functional correctness was covered in TGMS-81. TGMS-82 focuses on measurable performance observations, basic concurrency, retry integrity and usability review.

## Artifact-build environment limitation

The current artifact execution environment could not run Spring tests because Maven Wrapper could not download Apache Maven 3.9.16. Frontend typecheck/test/lint/build are also blocked because the uploaded project ZIP does not contain the npm dependency installation (`vite/client`, `vitest/globals`, `@testing-library/jest-dom`, `vitest`, `eslint`).

Therefore **no API/browser timing number is fabricated in this document**. TGMS-82 adds a deterministic test harness that records real observations when run on a normal development or CI machine.

## Performance observation harness

Test class:

`backend/src/test/java/lk/ac/sliit/tgms/nfr/NonFunctionalRequirementsIntegrationTests.java`

Each operation receives 2 warm-up requests followed by 12 measured requests:

1. Public Product catalogue — `GET /api/products`
2. Customer Order history — `GET /api/orders/mine`
3. Inventory record list — `GET /api/inventory-materials`
4. Administrator dashboard/report — `GET /api/reports/dashboard`
5. Role-aware shared Search — `GET /api/search?search=TGMS82&page=0&size=10`

The test records `min`, `p50`, `p95` and `max` milliseconds and requires every measured request to remain a successful `2xx` response. It deliberately has **no arbitrary latency threshold** because Spring MockMvc + H2 results are development/test observations, not production SLA evidence.

Generated result file after execution:

`backend/target/tgms82-latency-observations.json`

The same values are printed with the `TGMS82_LATENCY` prefix for CI logs.

Run only the NFR suite from the repository root:

```bash
npm run test:nfr
```

or from `backend/`:

```bash
./mvnw -Dtest=NonFunctionalRequirementsIntegrationTests test
```

## Multi-user / concurrent reliability check

The real Inventory API is used by two concurrent requests. Each tries to consume `7.000` from the same material containing `10.000`.

Required invariant:

- one request succeeds (`200`),
- one request receives the controlled insufficient-stock conflict (`409`),
- final quantity is exactly `3.000`,
- quantity never becomes negative.

This validates the existing Inventory source-of-truth contract under a meaningful write race. The repository uses one conditional SQL update (`current_quantity >= requested_quantity`) so correctness does not depend on a stale browser-side availability check.

Generated result:

`backend/target/tgms82-concurrency-observation.txt`

## Failure/retry integrity check

A material starts at `10.000`.

1. Consume `20.000` → expected `409`.
2. Verify persisted quantity remains `10.000`.
3. Retry with `3.000` → expected `200`.
4. Verify final quantity is exactly `7.000`.

This verifies that a common failed business request does not partially mutate stock and that a subsequent valid retry applies exactly once.

Generated result:

`backend/target/tgms82-retry-observation.txt`

## Usability review

Major pages were reviewed for navigation, input validation and feedback. The shared UI already provides loading/error/empty state patterns, and major mutation forms visibly surface validation/server errors and disable or relabel actions while requests are in progress.

One reproducible usability defect was fixed: the navigation still showed an obsolete **Foundation** note saying module links would be introduced later. All approved modules are already integrated, so that message could make users think the application was incomplete. It now explains that the workspace is **role-aware** and navigation exposes only the modules/supporting tools permitted for the current role. A frontend regression test verifies that the stale guidance no longer appears.

Reviewed areas:

- responsive primary navigation and role-specific links,
- login/registration/password-recovery feedback,
- Product browse/create/edit states,
- Supplier and Inventory validation/error states,
- Order creation/history/tracking feedback,
- Production material/start/progress/quality feedback,
- Delivery selection/scheduling/status/tracking feedback,
- Notifications loading/empty/error/read states,
- Shared Search loading/empty/error/pagination states,
- Dashboard filters/loading/empty/report-error states,
- Profile settings protected/read-only identity fields.

No other major usability blocker requiring business-flow redesign was reproducibly identified in the source/component review.

## Availability and scalability interpretation

The documented Availability/Scalability goals cannot be proven by a local MockMvc/H2 test. TGMS-82 therefore does not claim uptime percentages, maximum concurrent-user counts, transactions per second or production capacity. Those require an actual deployed environment, production-like MySQL/networking, monitoring and a separately approved load/availability test plan.

## Known limitations

- MockMvc/H2 timings do not include browser rendering, TLS, reverse proxy, production MySQL, network latency or deployment hardware.
- The concurrency test uses two simultaneous writers; it verifies a real race invariant but is not a load/capacity test.
- Source/component usability review is not a substitute for formal UAT with representative end users.
- No unmeasured SLA, uptime, throughput or maximum-user guarantee is made.
