# Intent

<!-- Preliminary epic intent. Confirm and replace during this child's /cip interview. -->

## Goal

Learn the control layers that keep an unstable quadrotor's angular rates and attitude near commanded
targets, while preserving a controller that can later run outside the simulator.

## Owned outcome

A portable Rust flight-control core implements rotor mixing, an angular-rate PID inner loop, an attitude
outer loop, saturation handling, anti-windup, and repeatable tuning/perturbation experiments that achieve
stable attitude-controlled flight under criteria confirmed by `/cip`.

## Interface boundaries

- A pure controller API consumes timestamped sensor frames, configuration, and pilot/test setpoints and
  returns bounded actuator commands plus controller telemetry.
- The controller imports no simulator, browser, Babylon.js, or WASM-specific modules.
- Mixer geometry and actuator ordering are explicit shared contracts, not implicit array positions.

## Dependency rationale

Depends on `b028f8` because the controller must operate from virtual hardware observations and actuator
limits rather than simulator truth.

## Success signals

- Scripted roll, pitch, and yaw disturbances produce stable, reproducible recovery under measurable criteria
  selected during `/cip`.
- Saturation, integral windup, derivative noise, and command timeout are visible in experiments.
- The same control-core tests run independently of the browser and simulation UI.
- A learning chapter rebuilds PID intuition, explains cascaded rate/attitude loops and mixer math, and
  provides beginner-oriented Rust explanations for the implementation patterns used.

## Requirement candidates

- Define controller startup, reset, arming, disarming, stale-sensor, and invalid-sample behavior.
- Clamp every actuator command and expose saturation status to anti-windup and telemetry.
- Keep gains, units, sample period, and derivative filtering explicit and validated.
- Prevent tests from reading truth state except to score an experiment after the controller acts.

## Risks

- A frame/sign mismatch can make tuning appear impossible or produce dangerous positive feedback.
- Simulator-perfect timing can hide sensitivity to jitter, delay, and sensor noise.
- Success criteria chosen only by visual inspection would not distinguish robust control from a lucky run.

## Non-goals

- Altitude hold, horizontal position control, route planning, and vision.
- Real-aircraft gain claims or physical motor output.

## Definition of done

- The sensor-only controller satisfies confirmed recovery and stability experiments, handles saturation and
  stale/invalid data explicitly, and is taught through derivation, diagrams, plots, and runnable tuning work.
