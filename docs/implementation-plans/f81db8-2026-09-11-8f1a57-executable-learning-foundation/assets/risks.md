# Risks

<!-- For uncertain or high-impact work, the mitigation names the concrete stop/escalation condition. -->

| ID | Risk | Likelihood | Impact | Mitigation | Steps |
|----|------|------------|--------|------------|-------|
| RISK-1 | Rust, WASM, npm, or browser tooling fails on the local Windows environment. | Medium | High | Record compatible resolved versions, validate from lockfiles, and document setup. Stop if success requires an undocumented machine-local workaround. | 1.1, 2.1, 4.1, 4.2 |
| RISK-2 | Rust-to-TypeScript generation cannot faithfully represent the tagged protocol and creates duplicate contract authorities. | Medium | High | Prove commands, telemetry, and errors before UI work; enforce deterministic generation drift. Stop and return to the protocol decision rather than hand-maintain duplicate types. | 1.2, 1.3, 4.2 |
| RISK-3 | Worker scheduling, lifecycle, and UI races create nondeterminism, leaked requests, flaky tests, or a second clock authority. | Medium | High | Separate Rust protocol from TypeScript transport lifecycle; serialize commands/ticks; use one no-catch-up timer, request IDs, explicit disposal, and controlled readiness. Stop when reliability requires longer fixed sleeps, implicit restart, or UI-side state mutation. | 2.1, 2.2, 2.3, 4.2 |
| RISK-4 | The foundation over-engineers speculative high-rate telemetry. | Medium | Medium | Restrict protocol v1 to clock commands, lifecycle, telemetry, and errors; defer binary, transferable, and plugin abstractions until measured need. | 1.2, 2.2, 3.1, 3.2 |
| RISK-5 | Generated declarations drift or reproducible WASM build output is committed accidentally. | Medium | Medium | Normalize and check generated declarations, ignore reproducible build output, and inspect repository state during local release validation. | 1.1, 1.3, 4.1, 4.2 |
| RISK-6 | Windows/Chromium-only evidence is mistaken for broader compatibility. | Low | Medium | State the acceptance boundary in the chapter and plan; defer other operating systems and Firefox/WebKit explicitly. | 2.3, 3.1, 4.2 |
| RISK-7 | Exercise sample code drifts from production or debugging instructions depend on unstable line numbers, unreliable Rust-in-WASM breakpoints, or user-local state. | Medium | Medium | Exercise real code through thin fixtures; use native Rust/CodeLLDB and Chromium TypeScript debugging; reference functions/tests and stopping statements; validate every start/reset path and the 3–6 pack range. Stop if an exercise requires duplicate logic or an undemonstrated debug workflow. | 3.2, 4.1, 4.2 |
