# Intent

<!-- Preliminary epic intent. Confirm and replace during this child's /cip interview. -->

## Goal

Teach and implement the minimum transparent physics needed for a four-rotor vehicle to move and rotate in
three dimensions.

## Owned outcome

A deterministic fixed-step Rust model represents position, velocity, orientation, angular velocity, mass,
inertia, gravity, four motors, rotor thrust, reaction torque, motor lag, and simple ground contact. Analytic
experiments make the model's behavior and limitations inspectable.

## Interface boundaries

- A narrow dynamics-backend contract consumes bounded actuator values plus environmental inputs and exposes
  authoritative truth state.
- The custom 6-DoF implementation is the first backend; the contract must not copy Rapier concepts or expose
  integrator internals.
- Truth state may feed visualization and experiment assertions, but it is not a controller input.

## Dependency rationale

Depends on `8f1a57` for the Rust/WASM runtime, simulation clock, message envelope, and learning-document
conventions.

## Success signals

- Free-fall, hover-equilibrium, single-axis torque, and motor-lag experiments match documented expectations
  within tolerances confirmed by `/cip`.
- Frames, handedness, quaternion convention, signs, and SI units are explicit in code and documentation.
- Seeded runs from identical initial state and inputs produce identical trajectories.
- A learning chapter derives the forces and torques, illustrates frame transforms, and explains the chosen
  numerical integrator and its error.

## Requirement candidates

- Reject non-finite parameters and state before they contaminate a simulation run.
- Normalize or otherwise control quaternion drift and surface integration instability.
- Bound actuator inputs and define zero, minimum, and maximum rotor behavior.
- Represent crashes and simple ground contact deterministically without claiming realistic contact physics.

## Risks

- Sign, frame, or rotor-order mistakes can look plausible while invalidating every controller.
- Large timesteps can cause numerical divergence or contact tunneling.
- A premature backend abstraction can obscure the equations it is intended to teach.

## Non-goals

- Closed-loop control, noisy sensors, wind, obstacle fields, and complex collision geometry.
- Rapier integration or compatibility guarantees with a specific third-party physics engine.
- High-fidelity propeller aerodynamics, prop wash, battery sag, or structural flex.

## Definition of done

- The headless model passes the agreed analytic experiments, runs through the existing WASM seam, and has a
  learning chapter detailed enough to reproduce each derivation and observation.
