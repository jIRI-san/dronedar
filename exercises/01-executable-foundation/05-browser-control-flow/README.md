# Browser control flow

## Goal

Debug the real Chromium page without treating UI state as clock authority.

## Prerequisites

Complete [WASM worker lifecycle](../04-wasm-worker-lifecycle/README.md).

## Start

Run `npm run dev`, then use **Chromium: main thread and worker TypeScript**. The named VS Code task
**Web: dev server** is the launch configuration’s pre-launch task.

## Code map

Inspect `sendCommand`, `renderTelemetry`, the diagnostics click handler in `main.ts`, and
`simulation.worker.ts` startup.

## Observe

Stop at `sendCommand` after a response arrives. Watch `response.type`, `response.telemetry`, and
`latestTelemetry`; in the worker, stop at `runtime.dispatchRaw`. Keep the diagnostics panel closed
until the final action.

## Guided actions

1. Predict tick one after **Step once**, then resume and pause.
2. Reset and predict tick/time zero.
3. Expand diagnostics, send the unsupported envelope, and predict `unknown_command`, the request ID,
   and equal before/after ticks.

## Expected result

The live Babylon canvas remains visible while only worker telemetry changes the clock display. The
diagnostic is correlated and the rejected request does not change simulation time.

## Explanation

The main thread renders immutable snapshots and controls transport only. Its render cadence cannot
advance or reset the Rust clock.

## Reset

Use **Reset** in the page, stop the debug session, and run `npm run test:foundation-browser-flow`.
