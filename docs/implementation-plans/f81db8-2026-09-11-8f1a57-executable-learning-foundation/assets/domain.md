# Domain Model

<!-- Confirmed planning context for plan 8f1a57. -->

## Terms and meanings

- **Simulation time:** logical time advanced only by fixed Rust clock ticks; it is independent of wall time
  and browser rendering cadence.
- **Render time:** browser animation timing used only to draw the latest immutable telemetry.
- **Command:** a versioned request to pause, resume, step once, reset, or read clock state.
- **Telemetry:** a versioned immutable snapshot containing the authoritative tick and simulation time.
- **Protocol envelope:** tagged JSON carrying the protocol version, optional request correlation, payload,
  or a typed error.
- **Worker lifecycle:** starting, ready, failed, or stopped state of the TypeScript module worker and its
  WASM instance.
- **Generated declaration:** committed TypeScript types derived from Rust protocol definitions.

## Actors and boundaries

- **Learner/developer:** runs local setup, uses the browser controls, reads errors, and follows the experiment.
- **Browser UI:** renders a minimal Babylon.js scene and presentation state; it sends commands but does not
  own simulation state.
- **Module Web Worker:** owns one WASM instance, sequences requests, and exposes lifecycle state.
- **Rust core:** owns deterministic clock state and valid state transitions.
- **Local verification tools:** prove Rust, protocol, worker, UI, browser, and documentation behavior without
  hosted CI.

## Interfaces and ownership

- `sim-protocol` owns command, telemetry, error, version, and correlation types plus TypeScript generation.
- `sim-core` owns the clock state machine and consumes/produces protocol values without browser dependencies.
- `sim-wasm` is a thin string/JSON ABI adapter around the platform-neutral crates.
- The worker owns WASM startup and message routing; the main thread communicates only through worker
  messages.
- The UI may derive display-only values from telemetry but cannot send them back as authoritative state.

## Invariants

- One fixed tick is the only unit of simulation progression.
- Wall time and render frames do not directly advance simulation time.
- Malformed, unsupported, or version-incompatible input does not mutate clock state.
- Generated TypeScript declarations match Rust protocol definitions byte-for-byte after normalization.
- Rust core/protocol crates contain no browser, DOM, Babylon.js, or Web Worker dependencies.
- Local Windows and Chromium are the acceptance platform for this plan; no broader compatibility is implied.
