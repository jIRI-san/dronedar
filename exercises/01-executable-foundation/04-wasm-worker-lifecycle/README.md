# WASM worker lifecycle

## Goal

Observe serial command/tick scheduling and client-owned worker disposal.

## Prerequisites

Complete [Generated protocol contract](../03-generated-contract/README.md).

## Start

Run `npm run test:worker-scheduler` and `npm run test:worker-boundary`. Use VS Code task
**Web: browser tests** for the integrated path.

## Code map

Inspect `WorkerRuntime.dispatchRaw`, `WorkerRuntime.updateTimer`, `SimulationClient.dispose`, and their
Vitest files.

## Observe

Set a Chromium TypeScript breakpoint at the `setInterval` callback in `WorkerRuntime.updateTimer` and
at `SimulationClient.dispose`. Watch `timer`, `pending.size`, and the emitted response type.

## Guided actions

1. Predict the ordered `resume`, three `inject_tick`, `pause` command sequence, then run the scheduler test.
2. Temporarily use `200` as the test runtime interval and predict the same command count after matching time.
3. Restore `100`, then run the boundary test and watch disposal reject pending work.

## Expected result

Each callback queues one tick; delayed callbacks never manufacture catch-up ticks. Disposal terminates
the worker and late messages cannot restart the stopped client.

## Explanation

The TypeScript queue orders transport events, while Rust remains the sole simulation authority. This
simple timer intentionally trades wall-time fidelity for inspectable deterministic progression.

## Reset

Restore the temporary interval to `100` and rerun both worker test commands.
