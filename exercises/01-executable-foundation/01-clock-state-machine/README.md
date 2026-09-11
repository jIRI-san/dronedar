# Clock state machine

## Goal

Observe that a paused clock advances only by exactly one fixed Rust step.

## Prerequisites

Complete the [learning chapter](../../../docs/learning/01-executable-foundation.md).

## Start

Run `npm run test:toy-clock-determinism` or VS Code task **Rust: test clock**. For breakpoints, use
**Debug Rust deterministic clock tests**.

## Code map

Inspect `sim-core::SimClock::execute`, `SimClock::advance`, and the
`tests::step_advances_exactly_one_tick_when_paused` test.

## Observe

Stop at the `Command::Step` arm in `SimClock::execute`. Watch `self.tick`, `self.paused`, and
`next_tick` immediately before `self.tick = next_tick`.

## Guided actions

1. Predict the initial tick and paused value, then run the focused test.
2. Step into `advance` and verify the checked addition and multiplication happen before mutation.
3. Temporarily change `DEFAULT_TICK_DURATION_US` to `200_000`, rerun, and predict the telemetry time.

## Expected result

The normal test reports tick `1`, simulation time `100000`, and `paused: true`. The temporary value
changes only the displayed duration/time, not the one-tick transition.

## Explanation

Rust’s `&mut self` makes this transition an exclusive mutable operation. Checked arithmetic produces
an error before assignment, preserving the old clock on overflow.

## Reset

Restore `DEFAULT_TICK_DURATION_US` to `100_000`; `git diff -- crates/sim-core/src/lib.rs` should be
empty before moving on.
