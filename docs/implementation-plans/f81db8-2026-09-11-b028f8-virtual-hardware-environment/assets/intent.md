# Intent

<!-- Preliminary epic intent. Confirm and replace during this child's /cip interview. -->

## Goal

Turn the dynamics model into a virtual drone and world whose controller-facing behavior resembles hardware
without pretending to be a high-fidelity aircraft or weather simulator.

## Owned outcome

The simulator emits timestamped, multi-rate inertial and altitude observations in configurable ideal and
noisy modes; accepts bounded motor commands; applies reproducible wind; represents simple terrain and
obstacle primitives; and defines explicit crash, reset, and out-of-bounds behavior.

## Interface boundaries

- Virtual hardware converts truth state into sensor frames with documented rate, latency, bias, noise, and
  saturation behavior.
- The controller can consume sensor frames and send actuator commands but cannot access truth state,
  collision geometry, or wind configuration.
- Environment models feed the dynamics backend; Babylon.js mirrors them for display but does not own them.

## Dependency rationale

Depends on `59ca6c` for physical state and its environmental input seam, and on `201d65` so disturbances,
obstacles, sensor values, and crashes can be inspected during experiments.

## Success signals

- Ideal-mode sensor output matches derived truth-state expectations at documented sample times.
- Seeded noisy-mode runs reproduce bias/noise sequences and distinguish sample time from delivery time.
- Wind and obstacle experiments create visible, measurable effects and terminate crashes consistently.
- A learning chapter explains each virtual sensor, noise model, sampling schedule, wind simplification, and
  the difference between truth and observation.

## Requirement candidates

- Define behavior for sensor saturation, dropout, delayed samples, command timeout, and non-finite inputs.
- Keep sensor clocks and simulation clocks explicit when rates do not divide evenly.
- Use reproducible environment and noise seeds.
- Prevent simple collision handling from tunneling silently at supported timesteps.

## Risks

- Unrealistically clean or synchronized sensors can make weak controllers look correct.
- Noise and latency choices can imply fidelity the model has not earned.
- Disagreement between rendered and physical obstacle geometry can invalidate demonstrations.

## Non-goals

- Camera, lidar, GPS-grade navigation, detailed atmosphere, gust-field validation, or material deformation.
- Realistic crash damage, complex contact manifolds, prop wash, and battery or motor thermal models.

## Definition of done

- A controller-shaped client can fly only from timestamped sensor frames and actuator commands while seeded
  wind, terrain, obstacles, and failure behavior remain reproducible and explained.
