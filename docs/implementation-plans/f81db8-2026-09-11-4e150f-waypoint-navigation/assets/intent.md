# Intent

<!-- Preliminary epic intent. Confirm and replace during this child's /cip interview. -->

## Goal

Teach the first autonomous mission layer by making the drone follow a finite route using estimates and
abstract obstacle observations rather than simulator truth.

## Owned outcome

A mission state machine performs takeoff, finite waypoint traversal, bounded obstacle-aware behavior,
landing, completion, and abort scenarios. Missions and outcomes are deterministic and inspectable.

## Interface boundaries

- Mission logic consumes navigation estimates, abstract obstacle observations, vehicle status, and an
  explicit mission definition.
- It emits high-level position/velocity setpoints to `7f2acd`; it cannot emit motor commands.
- World geometry and truth state remain outside mission code and are used only by the experiment harness.

## Dependency rationale

Depends on `7f2acd` for position setpoints and mode handling, and on `b028f8` for reproducible environment
scenarios and non-visual obstacle observations.

## Success signals

- A finite route completes, lands, and reports mission progress under confirmed tolerances.
- Blocked, unreachable, timed-out, aborted, and command-loss cases terminate predictably.
- Obstacle-aware exercises demonstrate bounded behavior without claiming general path planning.
- A learning chapter explains guidance versus control, the mission state machine, waypoint acceptance, and
  why navigation never consumes world truth.

## Requirement candidates

- Validate empty, duplicate, out-of-bounds, and unreachable waypoint sets before or during execution.
- Define waypoint radius, dwell, timeout, retry, abort, and landing semantics observably.
- Prevent mission commands from bypassing controller and actuator bounds.
- Record enough timestamped state to replay and explain mission decisions.

## Risks

- Hidden truth-state access can make navigation results meaningless.
- State-machine edge cases can loop forever or skip abort/landing behavior.
- Simplistic obstacle behavior can be mistaken for robust planning.

## Non-goals

- SLAM, mapping unknown worlds, globally optimal planning, swarm behavior, or arbitrary obstacle avoidance.
- Camera-based navigation; that belongs to `13074c`.

## Definition of done

- The drone completes and safely terminates bounded waypoint exercises from estimator and obstacle
  observations, with state transitions and failure cases documented and replayable.
