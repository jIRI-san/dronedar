# Decisions

<!-- Confirmed during the /cip interview on 2026-09-11. -->

- Use a Rust workspace with platform-neutral `sim-protocol` and `sim-core` crates plus a thin `sim-wasm`
  adapter crate.
- Compile the adapter with `wasm-bindgen`/`wasm-pack` and host its sole stateful instance in a TypeScript
  module Web Worker.
- Use vanilla TypeScript, Vite, and Babylon.js; do not introduce React or a Babylon.js scene wrapper.
- Use a versioned Serde JSON envelope for low-volume application commands, injected ticks, telemetry, and
  protocol errors. TypeScript transport lifecycle stays outside the Rust schema. Binary and transferable
  payloads require later performance evidence.
- Keep Rust as protocol authority and generate committed TypeScript declarations with a deterministic drift
  check; intentional schema changes update Rust and generated output together.
- Use request IDs for correlation. An input that cannot provide a valid request ID receives an explicitly
  uncorrelated typed error, and invalid input never changes clock state.
- Separate simulation time from render time. UI code reads immutable telemetry and may derive presentation-
  only values that never return as authoritative state.
- The TypeScript worker owns one no-catch-up timer: each callback queues exactly one explicit Rust tick.
  Initial/reset state is paused; pause/resume are idempotent; step while running and checked integer overflow
  return typed errors without mutation. `tick` and `tick_duration_us` are `u64`; `simulation_time_us` is
  their checked product. Deterministic replay includes commands plus injected ticks.
- The worker client owns starting/stopped and disposal; the worker emits ready/failed. Disposal rejects
  pending requests without draining queued work, removes handlers, terminates the worker/timer, ignores late
  replies, and does not restart. Pause only cancels future timer callbacks; queued events retain their order.
- Use npm with committed package-manager metadata and a lockfile for web dependencies and root local
  orchestration; resolve exact compatible tool versions during implementation.
- Accept the documented local Windows environment and current Playwright Chromium as this plan's platform
  evidence. Keep code standards-based, but defer Linux/macOS and Firefox/WebKit acceptance.
- Run all validation locally. Do not add or modify GitHub Actions or other CI configuration because hosted-
  runner budget is intentionally outside this plan.
- Apply the epic's confirmed learning-first documentation invariant, including beginner Rust guidance.
- Pair the learning chapter with 3–6 concept-focused exercises in `exercises/01-executable-foundation/`.
  Exercises use working production code, then small reversible changes; they do not duplicate algorithms.
- Commit VS Code extension recommendations and named launch/task configurations. Support native Rust tests
  with rust-analyzer/CodeLLDB and Chromium main-thread/worker TypeScript debugging; defer Rust-in-WASM source
  breakpoints unless demonstrated. Document breakpoint functions, stopping statements, variables, and logs
  because actual line breakpoints are user state.
- Keep the primary UI simple and put the intentionally invalid raw-envelope action in a collapsed learner
  diagnostics panel that also shows the typed response and unchanged clock state.
