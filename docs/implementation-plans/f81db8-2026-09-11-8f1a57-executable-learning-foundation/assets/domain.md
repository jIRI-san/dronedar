# Domain Model

<!-- Confirmed planning context for plan 8f1a57. -->

## Terms and meanings

- **Simulation time:** logical time advanced only by fixed Rust clock ticks; it is independent of wall time
  and browser rendering cadence.
- **Render time:** browser animation timing used only to draw the latest immutable telemetry.
- **Command:** a versioned request to pause, resume, step once, reset, or read clock state.
- **Injected tick:** an explicit worker-scheduler event that asks Rust to advance exactly one fixed tick;
  deterministic replay includes these events alongside commands.
- **Telemetry:** a versioned immutable snapshot containing the authoritative tick and simulation time.
- **Protocol envelope:** tagged JSON carrying the protocol version, optional request correlation, payload,
  or a typed error.
- **Transport lifecycle:** starting, ready, failed, or stopped state owned by the TypeScript worker client
  and worker around the Rust protocol.
- **Generated declaration:** committed TypeScript types derived from Rust protocol definitions.

## Actors and boundaries

- **Learner/developer:** runs local setup, uses the browser controls, reads errors, and follows the experiment.
- **Browser UI:** renders a minimal Babylon.js scene and presentation state; it sends commands but does not
  own simulation state.
- **Module Web Worker:** owns one WASM instance and one no-catch-up timer, serializes commands and injected
  ticks, and emits ready/failed transport events.
- **Rust core:** owns deterministic clock state and valid state transitions.
- **Local verification tools:** prove Rust, protocol, worker, UI, browser, and documentation behavior without
  hosted CI.

## Interfaces and ownership

- `sim-protocol` owns command, telemetry, error, version, and correlation types plus TypeScript generation.
- `sim-core` owns the clock state machine and consumes/produces protocol values without browser dependencies.
- `sim-wasm` is a thin string/JSON ABI adapter around the platform-neutral crates.
- The worker transport owns WASM startup, the timer, message routing, and ready/failed events. The client
  owns starting/stopped state, disposal, pending-request rejection, and worker termination.
- The UI may derive display-only values from telemetry but cannot send them back as authoritative state.

## Invariants

- One fixed tick is the only unit of simulation progression.
- Initial and reset state are paused; pause and resume are idempotent; step while running returns a typed
  protocol error without changing state.
- Each worker timer callback queues exactly one injected tick. Delayed callbacks do not create catch-up
  ticks; simulated time may lag wall time.
- Commands and injected ticks execute serially in queue order. Pause cancels future callbacks and already
  queued events finish in order. Disposal terminates immediately and rejects pending work; it does not
  promise to drain the queue.
- `tick` and `tick_duration_us` are unsigned 64-bit integers; `simulation_time_us` is their checked product.
  Overflow returns a typed error and preserves the prior state.
- Wall time and render frames do not directly advance simulation time.
- Malformed, unsupported, or version-incompatible input does not mutate clock state.
- Rust owns application protocol values; TypeScript owns transport lifecycle and disposal. There is no
  implicit worker restart in this plan.
- Generated TypeScript declarations match Rust protocol definitions byte-for-byte after normalization.
- Rust core/protocol crates contain no browser, DOM, Babylon.js, or Web Worker dependencies.
- Local Windows and Chromium are the acceptance platform for this plan; no broader compatibility is implied.
