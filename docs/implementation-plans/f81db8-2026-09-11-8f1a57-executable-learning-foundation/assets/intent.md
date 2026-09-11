# Intent

<!-- Confirmed during the /cip interview on 2026-09-11. -->

## Goal

Create the smallest end-to-end application skeleton that proves Rust, WebAssembly, a Web Worker,
TypeScript, and Babylon.js can cooperate without coupling simulation time to rendering.

## Desired outcome

A reproducible local Windows workspace launches a browser application, advances a deterministic toy
simulation clock in Rust, and exchanges versioned commands, telemetry, and explicit errors with a
TypeScript UI. The repository also establishes the learning-chapter structure used by every later
milestone.

## Interface boundaries

- Rust owns simulation/control packages and the authoritative simulation clock.
- A Web Worker isolates core execution from rendering and UI event handling.
- Cross-language messages carry a schema version, simulation timestamp, command or telemetry payload, and
  explicit error response.
- TypeScript and Babylon.js own presentation only; no physical state or control policy lives in the UI.

## Dependency rationale

This is the root plan. Every later child depends on its build, runtime, message, and documentation seams.

## Success signals

- A clean checkout can run the documented local Windows setup and open the application in Chromium.
- A pause, step, reset, and toy-state round trip demonstrates deterministic simulation time.
- Invalid protocol versions and malformed values fail visibly rather than being silently accepted.
- A first learning chapter explains the architecture, WebAssembly boundary, worker model, and foundational
  Rust ownership/borrowing concepts used by the code.

## Requirement candidates

- Record the resolved Rust and npm tool versions plus dependency lockfiles for reproducible local setup.
- Keep simulation progression independent of browser render cadence.
- Make protocol and worker failures observable in both the UI and developer diagnostics.
- Apply the confirmed learning-first documentation invariant to this and every later child.

## Risks

- WASM and worker tooling may create a debugging burden before domain learning begins.
- A message contract designed too broadly may become premature framework code; one designed too narrowly
  may leak browser concerns into Rust.

## Non-goals

- Quadrotor physics, virtual sensors, flight control, and autonomous behavior.
- A polished visual scene or production deployment pipeline.
- Selecting a future real-drone communication protocol.
- GitHub Actions or other CI configuration, hosted-runner validation, Linux/macOS validation, and
  Firefox/WebKit acceptance.

## Definition of done

- The integration seam is runnable on the documented local Windows/Chromium baseline, deterministic at the
  toy-clock level, visibly handles invalid input, passes local quality gates, and is taught by a
  beginner-oriented chapter with a repeatable experiment.
