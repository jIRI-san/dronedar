# Approved Design

<!-- Confirmed during the /cip interview on 2026-09-11. -->

## Components and boundaries

- **Rust workspace**
  - `sim-protocol`: Serde-compatible tagged protocol v1 and Rust-derived TypeScript declarations.
  - `sim-core`: deterministic fixed-tick clock and command state transitions.
  - `sim-wasm`: thin `wasm-bindgen` adapter that exchanges JSON strings and owns no simulation policy.
- **Web workspace**
  - a module Web Worker initializes the WASM package, owns its sole stateful instance, routes correlated
    requests, and reports lifecycle failures;
  - a vanilla TypeScript worker client translates generated protocol types into an observable UI model;
  - Babylon.js owns a minimal live canvas, while standard DOM controls expose lifecycle, tick/time,
    pause/resume, step, reset, and errors.
- **Local quality gate**
  - root commands orchestrate Rust formatting/lint/tests, TypeScript type checks/tests, protocol drift
    checks, production build, and Playwright Chromium tests;
  - no GitHub Actions or hosted-runner configuration belongs to this plan.
- **Learning material**
  - one executable chapter explains the boundaries, tradeoffs, Rust concepts, diagrams, and expected
    pause/step/reset observations.

## Program flow

```mermaid
flowchart LR
    Learner[Learner] -->|Controls| UI[Vanilla TypeScript UI]
    UI -->|Versioned command| Worker[Module Web Worker]
    Worker -->|JSON string| Wasm[sim-wasm]
    Wasm --> Protocol[sim-protocol]
    Wasm --> Core[sim-core clock]
    Core -->|Authoritative state| Wasm
    Wasm -->|JSON response| Worker
    Worker -->|Typed telemetry or error| UI
    UI -->|Immutable snapshot| Scene[Babylon.js canvas]
    Generator[Type generator] -->|Committed declarations| Worker
    Protocol --> Generator
```

## Optional call stacks

The request sequence clarifies correlation, authority, and error behavior:

```mermaid
sequenceDiagram
    participant UI as Main-thread UI
    participant W as Module Worker
    participant A as Rust WASM adapter
    participant C as Rust clock core
    UI->>W: protocol-v1 command + request ID
    W->>A: serialized JSON
    A->>C: validated state transition
    alt valid command
        C-->>A: immutable clock state
        A-->>W: correlated telemetry JSON
        W-->>UI: typed telemetry
    else malformed or unsupported command
        A-->>W: typed error; state unchanged
        W-->>UI: visible correlated error
    end
```
