# 8f1a57: Executable learning foundation
<!-- plan-id: 8f1a57 -->
<!-- cip-stage: drafted -->
<!-- planning-confirmed: sha256:18fca3ccbc7dc97713383c3d57f1716750a395a4fce45bde7938c9e7a798352a -->
<!-- epic: f81db8 -->
<!-- Folder naming: <epic-id|standalone>-<yyyy-mm-dd>-<6hex>-<slug> · plan-id is the canonical handle (date/slug/hash all resolve via Resolve-Plan). New-Plan.ps1 fills these in. -->
<!-- execution-mode: host-autopilot -->
<!-- scope: plan -->
<!-- evidence: required -->
<!-- phase-budget-points: 6 -->

## Assets

`plan.md` holds only the markers above, this index, and the phases/steps below. Everything else lives under `assets/` and is loaded on demand — never wholesale.

- Intent — [assets/intent.md](assets/intent.md)
- Domain model — [assets/domain.md](assets/domain.md)
- Approved design — [assets/design.md](assets/design.md)
- Requirements — [assets/requirements.md](assets/requirements.md)
- Risks — [assets/risks.md](assets/risks.md)
- Decisions — [assets/decisions.md](assets/decisions.md) (extended rationale in `assets/decisions/<topic>.md`)
- References — [assets/references.md](assets/references.md)
- Review results — advisory `assets/reviews/phase-<N>.md` and `assets/reviews/final.md`
- AI-credit ledger — `assets/ai-credits.json` (created by autonomous execution)

A subfolder is created only when a concern needs more than one file (`assets/decisions/`, `assets/logs/`); single-file concerns stay flat under `assets/`.

## Phase 1: Establish the typed Rust foundation
<!-- worktree: (recorded by /ci when worktree is created) -->

- [ ] 1.1 Scaffold the locally reproducible workspace (REQ-1, REQ-6, RISK-1, RISK-5) `M`
  <details><summary>Implementation contract</summary>

  **Outcome:** a Rust workspace and npm workspace install from committed manifests and lockfiles on the
  documented Windows development environment, with root commands reserved for formatting, linting, tests,
  protocol drift checks, and production builds.

  **Likely touchpoints:** `rust-toolchain.toml`, Cargo manifests and lockfile, root `package.json`,
  `package-lock.json`, `apps/web/`, `crates/sim-protocol/`, `crates/sim-core/`,
  `crates/sim-wasm/`, `.gitignore`, and local verification scripts.

  **Constraints:** resolve and record compatible tool versions rather than guessing them; do not add GitHub
  Actions or other CI configuration; keep generated WASM build output out of version control; keep the core
  and protocol crates free of browser imports.

  **Verify:** install from the lockfiles, run the initial root checks, and prove the native Rust crates plus
  empty Vite application build locally (`test:workspace-clean-build`).

  **Stop/escalate when:** the pinned Rust/WASM/npm tools cannot install or execute on the documented Windows
  environment without an undocumented machine-local workaround.

  </details>

- [ ] 1.2 Implement the deterministic clock and Rust-owned protocol (REQ-2, REQ-3, RISK-2, RISK-4) [after: 1.1] `M`
  <details><summary>Implementation contract</summary>

  **Outcome:** platform-neutral Rust state transitions implement pause, resume, one-tick step, reset, and
  telemetry through a protocol-v1 tagged JSON envelope with protocol version, optional correlation ID,
  success payloads, and typed errors.

  **Likely touchpoints:** `crates/sim-protocol/`, `crates/sim-core/`, Rust unit and integration tests, and
  protocol fixtures.

  **Constraints:** one configured fixed tick is the only unit of simulation progress; invalid JSON,
  versions, commands, and payloads preserve clock state; no browser, WASM, physics, sensor, or controller
  concepts enter the core.

  **Verify:** deterministic replay, pause/wall-time isolation, one-tick stepping, reset, correlation, and
  invalid-input tests pass (`test:toy-clock-determinism`, `test:protocol-invalid-input`).

  **Stop/escalate when:** the protocol requires browser-specific fields or clock results vary with wall time.

  </details>

- [ ] 1.3 Generate and check TypeScript protocol declarations (REQ-3, REQ-6, RISK-2, RISK-5) [after: 1.2] `S`
  <details><summary>Implementation contract</summary>

  **Outcome:** committed TypeScript declarations are generated from the Rust protocol definitions, and a
  local drift check fails whenever regenerated output differs.

  **Likely touchpoints:** Rust type-export tests or tools, `apps/web/src/generated/`, and root npm scripts.

  **Constraints:** do not create a second handwritten declaration of protocol fields; normalize generated
  output so identical Rust sources yield byte-identical files.

  **Verify:** generation is idempotent, the sync check passes, and an intentional temporary Rust schema
  change makes the check fail (`test:protocol-contract-sync`).

  **Stop/escalate when:** the selected generator cannot represent tagged commands, telemetry, and typed errors
  without handwritten duplicate types.

  </details>

## Phase 2: Complete the browser vertical slice
<!-- worktree: (recorded by /ci when worktree is created) -->

- [ ] 2.1 Expose the core through WASM in a lifecycle-aware worker (REQ-3, REQ-4, RISK-1, RISK-3) [after: 1.3] `M`
  <details><summary>Implementation contract</summary>

  **Outcome:** a thin `wasm-bindgen` adapter accepts and returns protocol JSON, while a module Web Worker
  owns the WASM instance and reports explicit starting, ready, failed, and stopped lifecycle states.

  **Likely touchpoints:** `crates/sim-wasm/`, generated WASM package integration, the TypeScript worker,
  worker client, and boundary tests.

  **Constraints:** exactly one worker instance owns authoritative clock state; UI callers correlate replies
  by request ID; initialization failures and pre-ready commands are explicit errors; no simulation state is
  mirrored as mutable UI authority.

  **Verify:** worker tests prove lifecycle transitions, request correlation, single authority, and preservation
  of state after malformed or unsupported requests (`test:worker-boundary`, `test:protocol-invalid-input`).

  **Stop/escalate when:** a correct implementation requires evaluating generated glue on the main thread or
  maintaining a second state machine outside Rust.

  </details>

- [ ] 2.2 Build the minimal Babylon.js control surface (REQ-4, REQ-5, RISK-3, RISK-4) [after: 2.1] `M`
  <details><summary>Implementation contract</summary>

  **Outcome:** a vanilla TypeScript/Vite page displays a live Babylon.js canvas, worker lifecycle,
  simulation tick/time, visible errors, and pause/resume/step/reset controls backed only by worker messages.

  **Likely touchpoints:** `apps/web/src/`, page styles and accessible markup, Babylon.js scene setup, worker
  client integration, and browser test fixtures.

  **Constraints:** Babylon.js renders a deliberately minimal scene; UI-derived presentation state never
  crosses back as clock authority; controls expose disabled/loading/error states and do not use arbitrary
  sleeps to sequence readiness.

  **Verify:** Playwright Chromium proves startup, pause, exact one-tick step, resume, reset, and a visible
  protocol-error scenario (`test:foundation-browser-flow`).

  </details>

- [ ] 2.3 Harden deterministic browser and boundary behavior (REQ-2, REQ-3, REQ-4, REQ-5, RISK-3, RISK-6) [after: 2.2] `M`
  <details><summary>Implementation contract</summary>

  **Outcome:** focused unit and browser scenarios cover replay determinism, rapid command sequences,
  pre-ready interaction, malformed and unsupported messages, worker startup failure, and stable UI recovery.

  **Likely touchpoints:** Rust fixtures, TypeScript/Vitest tests, Playwright tests, and worker test seams.

  **Constraints:** tests control worker readiness and simulation ticks instead of extending timeouts; Chromium
  on the local Windows environment is the only browser acceptance target for this plan.

  **Verify:** all boundary and Chromium scenarios pass repeatedly without timing sleeps beyond framework
  polling (`test:toy-clock-determinism`, `test:worker-boundary`, `test:foundation-browser-flow`).

  **Stop/escalate when:** a scenario is only reliable by increasing fixed sleeps or allowing UI-side state
  mutation.

  </details>

## Phase 3: Teach and verify the foundation
<!-- worktree: (recorded by /ci when worktree is created) -->

- [ ] 3.1 Establish the complete local quality gate (REQ-1, REQ-3, REQ-6, RISK-1, RISK-5) [after: 2.3] `M`
  <details><summary>Implementation contract</summary>

  **Outcome:** documented root commands run Rust formatting, linting, tests, TypeScript type checking and
  unit tests, declaration drift checks, production build, and Playwright Chromium tests locally.

  **Likely touchpoints:** root npm scripts, Rust and TypeScript configuration, Playwright configuration,
  local verification scripts, and setup documentation.

  **Constraints:** commands are non-interactive and Windows-compatible; no GitHub Actions or other hosted CI
  configuration is added; failures remain visible and preserve the failing tool's exit status.

  **Verify:** the aggregate local verification command passes from lockfile-installed dependencies and each
  constituent gate can be invoked separately (`test:workspace-clean-build`, `test:quality-gates`).

  **Stop/escalate when:** validation depends on unrecorded global tools, secrets, or hosted runners.

  </details>

- [ ] 3.2 Write the executable foundation learning chapter (REQ-7, RISK-4, RISK-6) [after: 2.3] `M`
  <details><summary>Implementation contract</summary>

  **Outcome:** the first learning chapter explains the architecture and chosen tradeoffs, teaches the Rust
  and browser concepts actually used, and guides the reader through a repeatable pause/step/reset experiment
  with expected observations and troubleshooting.

  **Likely touchpoints:** `docs/learning/01-executable-foundation.md` and diagrams embedded in the chapter.

  **Constraints:** include architecture and request-sequence diagrams; explain ownership/borrowing, crate
  boundaries, JSON/WASM serialization, worker concurrency, and render time versus simulation time; state
  Windows/Chromium acceptance limits and deferred compatibility work; do not imply physical-drone readiness.

  **Verify:** execute the chapter from its setup instructions, compare the observed tick/error behavior with
  its predictions, and review it against the confirmed learning-first invariant
  (`file:docs/learning/01-executable-foundation.md#exists`,
  `file:docs/learning/01-executable-foundation.md#contains:## Run the experiment`, `review:cr`).

  </details>

- [ ] 3.3 Perform the local release-readiness pass (REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6, REQ-7, RISK-1, RISK-2, RISK-3, RISK-5, RISK-6) [after: 3.1, 3.2] `M`
  <details><summary>Implementation contract</summary>

  **Outcome:** the foundation is reproducible from documented local setup, all automated evidence passes,
  committed generated declarations match Rust, and the chapter's experiment matches the browser behavior.

  **Likely touchpoints:** the complete change set; only defects discovered by validation should require edits.

  **Constraints:** run validation locally on the documented Windows/Chromium baseline; do not add CI as a
  substitute; do not weaken criteria to accommodate failures.

  **Verify:** run the aggregate quality gate, production build, Chromium flow, generation-drift check, and
  chapter experiment; inspect the repository for unintended generated WASM output
  (`test:quality-gates`, `test:foundation-browser-flow`, `test:protocol-contract-sync`).

  **Stop/escalate when:** any accepted requirement lacks passing evidence, the clean local setup requires an
  undocumented prerequisite, or fixing validation would change a confirmed protocol/boundary decision.

  </details>
