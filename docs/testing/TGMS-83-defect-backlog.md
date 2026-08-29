# TGMS-83 UAT Defect Backlog

## Status

No reproducible **product** defect has been confirmed while preparing the TGMS-83 UAT package from the TGMS-82 baseline.

The automated UAT evidence cannot be executed in the current sandbox because the required test/build dependencies are unavailable. That is tracked below as an **execution blocker**, not as an application defect.

## Open product defects

| Defect ID | UAT Case | Severity | Module | Summary | Reproduction | Regression test | Fix status | Retest status |
|---|---|---|---|---|---|---|---|---|
| _None confirmed_ | - | - | - | No reproducible application failure confirmed during static/evidence review | - | - | - | - |

## UAT execution blockers

| Blocker ID | Type | Description | Impact | Resolution required |
|---|---|---|---|---|
| TGMS-UAT-BLK-001 | Environment | Maven Wrapper cannot download Apache Maven 3.9.16 from Maven Central in the current sandbox | Backend JUnit/MockMvc UAT suites cannot execute here | Run `npm run test:uat` on development/CI environment with Maven dependencies available |
| TGMS-UAT-BLK-002 | Environment | Frontend npm dependencies are not installed; `vitest` and Vite/testing type definitions are unavailable | Frontend UAT regression tests cannot execute here | Run `npm ci` in a network/cache-enabled development/CI environment before `npm run test:uat` |

These blockers do not authorize changing a UAT case to PASS. Runtime PASS/FAIL must be recorded from the release/UAT environment.

## Defect template

Copy this row for every reproducible failure:

| Defect ID | UAT Case | Severity | Module | Summary | Reproduction | Regression test | Fix status | Retest status |
|---|---|---|---|---|---|---|---|---|
| TGMS-UAT-001 | UAT-... | Critical/High/Medium/Low | Product/Supplier/Inventory/Order/Production/Delivery | Concise observed defect | Exact reachable steps + expected/actual | Test class.method | Open / Fixed - Pending Retest | Pending / PASS / FAIL |

## Closure rules

A defect is not closed merely because production code was edited. Closure requires:

1. reproducible failure captured;
2. regression test added or extended;
3. owning-module fix implemented;
4. targeted test passes;
5. affected module regression suite passes;
6. TGMS-81 cross-module integration remains green when the change touches a module boundary;
7. TGMS-80 security tests remain green when the change touches authentication/authorization/input handling;
8. original UAT scenario is repeated and recorded as PASS.
