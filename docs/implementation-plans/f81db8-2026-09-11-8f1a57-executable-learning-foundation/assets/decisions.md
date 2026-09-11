# Decisions

<!-- Confirmed during the /cip interview on 2026-09-11. -->

- Use a Rust workspace with platform-neutral `sim-protocol` and `sim-core` crates plus a thin `sim-wasm`
  adapter crate.
- Compile the adapter with `wasm-bindgen`/`wasm-pack` and host its sole stateful instance in a TypeScript
  module Web Worker.
- Use vanilla TypeScript, Vite, and Babylon.js; do not introduce React or a Babylon.js scene wrapper.
- Use a versioned Serde JSON envelope for low-volume commands, telemetry, lifecycle, and errors. Binary and
  transferable payloads require later performance evidence.
- Keep Rust as protocol authority and generate committed TypeScript declarations with a deterministic drift
  check; intentional schema changes update Rust and generated output together.
- Use request IDs for correlation. An input that cannot provide a valid request ID receives an explicitly
  uncorrelated typed error, and invalid input never changes clock state.
- Separate simulation time from render time. UI code reads immutable telemetry and may derive presentation-
  only values that never return as authoritative state.
- Use npm with committed package-manager metadata and a lockfile for web dependencies and root local
  orchestration; resolve exact compatible tool versions during implementation.
- Accept the documented local Windows environment and current Playwright Chromium as this plan's platform
  evidence. Keep code standards-based, but defer Linux/macOS and Firefox/WebKit acceptance.
- Run all validation locally. Do not add or modify GitHub Actions or other CI configuration because hosted-
  runner budget is intentionally outside this plan.
- Apply the epic's confirmed learning-first documentation invariant, including beginner Rust guidance.
