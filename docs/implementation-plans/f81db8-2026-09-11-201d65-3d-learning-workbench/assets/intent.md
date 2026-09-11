# Intent

<!-- Preliminary epic intent. Confirm and replace during this child's /cip interview. -->

## Goal

Make the verified simulation state visible and experimentally useful without turning rendering into a
second simulation.

## Owned outcome

A Babylon.js scene displays the quadrotor, terrain or ground reference, camera views, simulation controls,
telemetry plots, and optional coordinate-frame and force/torque overlays. A learner can pause, single-step,
reset, and compare what the model says with what the scene shows.

## Interface boundaries

- The workbench consumes immutable, timestamped truth snapshots and sends explicit simulation commands.
- Rendering interpolation may smooth display only; it never feeds interpolated state back into physics.
- Plotting and instructional overlays remain UI concerns, separate from sensor data available to control.

## Dependency rationale

Depends on `8f1a57` for the browser/worker seam and `59ca6c` for authoritative, testable state to visualize.

## Success signals

- Position and orientation in the scene agree with known headless dynamics experiments.
- Pause, step, reset, camera, plot, and overlay controls remain coherent at different render rates.
- Frame axes, rotor directions, force vectors, units, and simulation time are legible.
- A learning chapter explains Babylon.js scene concepts, render versus simulation time, and the Rust-to-
  TypeScript data flow.

## Requirement candidates

- Do not allow frame drops or UI input bursts to change physics results.
- Distinguish simulator truth from future virtual-sensor telemetry in labels and visual styling.
- Surface stale snapshots, worker failure, and invalid telemetry rather than freezing silently.
- Provide an accessible baseline that does not depend on color alone for key state.

## Risks

- Babylon.js coordinate conventions can be confused with the simulation convention.
- Large telemetry histories or overlays can degrade browser responsiveness.
- Visual smoothing can hide unstable or discontinuous simulated behavior.

## Non-goals

- Photorealistic assets, a general-purpose world editor, multiplayer, or game mechanics.
- Implementing control logic, sensor estimation, or collision authority in TypeScript.

## Definition of done

- Verified physics scenarios are accurately observable and controllable in the browser, with the render/time
  separation demonstrated by a repeatable learning experiment.
