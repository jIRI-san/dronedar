# f81db8: Learning-first quadrotor simulator and flight control
<!-- epic-id: f81db8 -->
<!-- Folder naming: epics/<yyyy-mm-dd>-<6hex>-<slug> · epic-id is the canonical handle. New-Epic.ps1 fills these in. -->

## Goal

Build a learning-first path from an empty repository to a browser-based quadrotor simulator, a portable
Rust flight-control core, autonomous waypoint flight, and a bounded first vision-navigation experiment.
Each child must leave a runnable system and an explanatory chapter that teaches the relevant physics,
control theory, Rust concepts, architecture, and experimental observations. It must also leave a small,
progressive exercise pack that guides the learner through debugging and experimenting with the working
implementation.

## Child plans

<!-- child-plans:start -->
| Plan | Slug | Depends on |
|---|---|---|
| `13074c` | vision-navigation-sandbox | `201d65`, `4e150f` |
| `201d65` | 3d-learning-workbench | `8f1a57`, `59ca6c` |
| `4b1ff9` | rate-attitude-stabilization | `b028f8` |
| `4c4afc` | native-portability-checkpoint | `4b1ff9` |
| `4e150f` | waypoint-navigation | `7f2acd`, `b028f8` |
| `59ca6c` | transparent-quadrotor-dynamics | `8f1a57` |
| `7f2acd` | position-hold-manual-piloting | `4b1ff9` |
| `8f1a57` | executable-learning-foundation | — |
| `b028f8` | virtual-hardware-environment | `59ca6c`, `201d65` |
<!-- child-plans:end -->

Membership is the `<!-- epic: f81db8 -->` marker in each child `plan.md`; the table above is a generated
mirror that `New-Epic.ps1` rewrites. Run `Get-PlanState f81db8` for live rollup and the next unblocked
child plan.

## Decomposition notes

- The accepted foundation is a Rust simulation/control core running in a Web Worker through WebAssembly,
  with a TypeScript and Babylon.js visualization and learning UI.
- The simulator acts as virtual hardware: timestamped sensor frames cross into the controller and bounded
  actuator commands cross back. Simulator truth is reserved for visualization and experiment evaluation.
- Flight dynamics begin as an explicit custom 6-DoF model behind a narrow backend boundary. Rapier is a
  possible later backend, not a current dependency or an API to imitate.
- `8f1a57` through `4b1ff9` form the shortest path to stable attitude-controlled flight. `4c4afc` then
  checks native portability in parallel with the higher-level piloting and autonomy plans.
- Every child owns its detailed intent, requirements, risks, decisions, and references. The preliminary
  child assets record the accepted boundaries and edge cases; a later `/cip` interview confirms and
  replaces them before implementation.
- Repository-wide design choices follow
  [`simplicity-first.design.md`](../../../design-notes/project/simplicity-first.design.md): use the clearest
  good-enough solution by default, disclose meaningful alternatives and trade-offs, and require evidence
  before adding complexity.
- Every child follows
  [`learning-exercises.design.md`](../../../design-notes/project/learning-exercises.design.md): normally
  3–6 concept-focused exercises, never more than 10, ordered by prerequisite. Exercises first guide
  observation of working code, then small reversible changes; they name start commands, debug
  configurations, breakpoint locations, variables/logs to inspect, expected results, and reset steps.
- Cross-cutting candidates carried into the children are deterministic seeded experiments, explicit SI
  units and coordinate frames, simulation time independent of render time, bounded actuators, visible
  rejection of invalid or non-finite values, reproducible parameter sets, and beginner-friendly Rust
  guidance.
- Epic-wide non-goals are physical motor actuation or flight, safety certification, photorealism,
  production-grade aerodynamics or weather, complex contact physics, deep-learning training, and SLAM.
