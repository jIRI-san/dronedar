# Intent

<!-- Preliminary epic intent. Confirm and replace during this child's /cip interview. -->

## Goal

Extend stabilized attitude control into understandable altitude and horizontal motion control that a learner
can command safely in the simulator.

## Owned outcome

Basic state estimation and cascaded altitude/horizontal controllers support repeatable hover, ascent,
descent, and translation exercises. Keyboard or equivalent pilot input becomes bounded setpoints, while
arming and command-loss behavior remain explicit.

## Interface boundaries

- Pilot input is translated into mode and setpoint messages; it never writes motor values directly.
- Estimation consumes virtual sensors and publishes estimates with validity/age metadata.
- Outer loops emit attitude, rate, and thrust setpoints into the controller interfaces from `4b1ff9`.

## Dependency rationale

Depends on `4b1ff9`; altitude and position loops require stable inner rate and attitude control.

## Success signals

- Hover, bounded altitude changes, and horizontal translations satisfy criteria confirmed during `/cip`.
- Estimator error and controller error are plotted separately from simulator truth.
- Loss of pilot commands or invalid estimates leads to a documented deterministic response.
- A learning chapter explains cascaded control, the selected estimator, mode transitions, and the relevant
  Rust state-modeling patterns.

## Requirement candidates

- Define arming preconditions and deterministic transitions among disarmed, active, degraded, and landed.
- Bound pilot setpoints and rate-limit discontinuous commands.
- Carry timestamps and validity through estimation and control.
- Score exercises from truth only outside the controller and estimator.

## Risks

- A simplistic estimator may work only because simulator sensors are too ideal.
- Coupled outer loops can destabilize the proven inner loops through saturation.
- Ambiguous mode transitions can retain stale integrator state or setpoints.

## Non-goals

- Autonomous waypoint missions, obstacle avoidance, vision, SLAM, and physical transmitter integration.
- A safety claim for real-world arming or failsafe behavior.

## Definition of done

- A learner can arm, hover, translate, and land through bounded setpoints with observable estimation/control
  behavior, explicit command-loss handling, and repeatable guided experiments.
