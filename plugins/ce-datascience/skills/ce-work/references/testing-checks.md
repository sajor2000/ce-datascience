# Testing Checks

Load this before writing tests for the first feature-bearing unit, and apply both checks to every feature-bearing unit thereafter.

## Test Scenario Completeness

Before writing tests for a feature-bearing unit, check whether the plan's `Test scenarios` cover every category that applies. If a category is missing or scenarios are vague (e.g., "validates correctly" without naming inputs and expected outcomes), supplement from the unit's own context:

| Category | When it applies | How to derive if missing |
|----------|----------------|------------------------|
| **Happy path** | Always for feature-bearing units | Read the unit's Goal and Approach for core input/output pairs |
| **Edge cases** | Meaningful boundaries (inputs, state, concurrency) | Identify boundary values, empty/nil inputs, and concurrent access patterns |
| **Error/failure paths** | Failure modes (validation, external calls, permissions) | Enumerate invalid inputs to reject, permission/auth denials to enforce, and downstream failures to handle |
| **Integration** | The unit crosses layers (callbacks, middleware, multi-service) | Identify the cross-layer chain and write a scenario that exercises it without mocks |

## System-Wide Test Check

Before marking a task done, answer:

| Question | What to do |
|----------|------------|
| **What fires when this runs?** Callbacks, middleware, observers, event handlers — two levels out. | Read the actual code (not docs) for callbacks on touched models, middleware in the request chain, `after_*` hooks. |
| **Do the tests exercise the real chain?** Fully mocked tests prove logic only in isolation. | Write at least one integration test using real objects through the full callback/middleware chain. |
| **Can failure leave orphaned state?** State persisted before an external call; retries creating duplicates. | Trace the failure path with real objects; test cleanup or idempotent retry. |
| **What other interfaces expose this?** Mixins, DSLs, alternative entry points. | Grep related classes; add parity now, not as a follow-up. |
| **Do error strategies align across layers?** Retry middleware, application fallback, framework handling. | List error classes per layer; verify rescue lists match what lower layers raise and nothing double-executes. |

**Skip** for leaf-node changes with no callbacks, persisted state, or parallel interfaces. It matters most for models with callbacks, error handling with fallback/retry, and behavior exposed through multiple interfaces.
