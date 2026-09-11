# Intent

<!-- Preliminary epic intent. Confirm and replace during this child's /cip interview. -->

## Goal

Verify early that the flight-control core is genuinely portable to a Linux-class onboard computer rather
than merely written in a compilable language.

## Owned outcome

The same Rust controller used by WebAssembly builds and runs as a native process against recorded sensor
replay. A thin hardware-adapter skeleton, timing/resource measurements, and a portability report identify
what would still be required for a real small computer.

## Interface boundaries

- The native runner adapts replay or future hardware I/O into the existing sensor/actuator contract.
- The control core remains independent of operating-system, simulator, transport, and device-driver code.
- Actuator output is captured by a safe sink; no real motor interface is energized.

## Dependency rationale

Depends on `4b1ff9` because a meaningful portability check requires the first complete portable controller.
It intentionally runs in parallel with higher-level piloting, navigation, and vision work.

## Success signals

- Native and WASM builds execute the same controller tests and recorded scenarios within confirmed numeric
  tolerances.
- The native runner reports loop timing, missed deadlines, memory use, and invalid/stale input behavior.
- The adapter skeleton demonstrates replacement of replay with device I/O without importing simulator code.
- A learning chapter explains Rust target portability, timing versus determinism, process/device boundaries,
  and the gap between a Linux SBC prototype and certified flight hardware.

## Requirement candidates

- Record schema version, units, coordinate frames, timestamps, and configuration with each replay.
- Define acceptable numeric differences between native and WASM execution during `/cip`.
- Fail closed to a safe output sink on stale, malformed, or non-finite sensor data.
- Keep platform-specific code outside the controller crate and identify any accidental dependencies.

## Risks

- Native compilation alone can give false confidence if timing and I/O boundaries remain untested.
- Floating-point or scheduling differences may make replays diverge without clear tolerances.
- A hardware-adapter skeleton could be mistaken for flight-ready integration.

## Non-goals

- Physical sensors, motor actuation, flight testing, real-time certification, or electrical design.
- Microcontroller `no_std` support; this checkpoint targets a Linux-class small computer.

## Definition of done

- The controller runs natively against replay through the same contract, produces measured evidence about
  timing and portability, and cannot command physical motors.
