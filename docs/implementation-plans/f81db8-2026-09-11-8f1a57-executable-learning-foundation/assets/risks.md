# Risks

<!-- For uncertain or high-impact work, the mitigation names the concrete stop/escalation condition. -->

| ID | Risk | Likelihood | Impact | Mitigation | Steps |
|----|------|------------|--------|------------|-------|
| RISK-1 | Rust, WASM, npm, or browser tooling fails on the local Windows environment. | Medium | High | Record compatible resolved versions, validate from lockfiles, and document setup. Stop if success requires an undocumented machine-local workaround. | 1.1, 2.1, 3.1, 3.3 |
| RISK-2 | Rust-to-TypeScript generation cannot faithfully represent the tagged protocol and creates duplicate contract authorities. | Medium | High | Prove commands, telemetry, and errors before UI work; enforce deterministic generation drift. Stop and return to the protocol decision rather than hand-maintain duplicate types. | 1.2, 1.3, 3.3 |
| RISK-3 | Worker and UI races create stale updates, flaky tests, or a second clock authority. | Medium | High | Use request IDs and explicit lifecycle states; control readiness and ticks in tests. Stop when reliability requires longer fixed sleeps or UI-side state mutation. | 2.1, 2.2, 2.3, 3.3 |
| RISK-4 | The foundation over-engineers speculative high-rate telemetry. | Medium | Medium | Restrict protocol v1 to clock commands, lifecycle, telemetry, and errors; defer binary, transferable, and plugin abstractions until measured need. | 1.2, 2.2, 3.2 |
| RISK-5 | Generated declarations drift or reproducible WASM build output is committed accidentally. | Medium | Medium | Normalize and check generated declarations, ignore reproducible build output, and inspect repository state during local release validation. | 1.1, 1.3, 3.1, 3.3 |
| RISK-6 | Windows/Chromium-only evidence is mistaken for broader compatibility. | Low | Medium | State the acceptance boundary in the chapter and plan; defer other operating systems and Firefox/WebKit explicitly. | 2.3, 3.2, 3.3 |
