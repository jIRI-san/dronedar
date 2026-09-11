# Protocol errors

## Goal

Trace a correlated tagged JSON error that leaves the Rust clock unchanged.

## Prerequisites

Complete [Clock state machine](../01-clock-state-machine/README.md).

## Start

Run `npm run test:protocol-invalid-input`; use **Debug Rust deterministic clock tests** when stepping
through native Rust.

## Code map

Inspect `sim_protocol::parse_request`, `ResponseEnvelope::error`, `sim_wasm::Simulation::dispatch`,
and `tests::malformed_request_leaves_clock_unchanged`.

## Observe

Stop at `serde_json::from_str` in `parse_request` and inspect `request_id`. For an unknown command,
inspect the `ErrorCode::UnknownCommand` branch and compare before/after telemetry.

## Guided actions

1. Predict whether malformed JSON has a correlation ID, then run the test.
2. Change the test request command type from `spin` to another unsupported word and rerun.
3. Restore the original unsupported word.

## Expected result

Malformed JSON yields an uncorrelated `invalid_json`; a well-formed unknown command yields a correlated
`unknown_command`. The clock remains at tick zero in both cases.

## Explanation

The parser extracts a usable request ID only after JSON object parsing. Rust validates input before
the core transition, so protocol failures have no mutable clock effect.

## Reset

Restore the test command to `spin` and run `npm run test:protocol-invalid-input`.
