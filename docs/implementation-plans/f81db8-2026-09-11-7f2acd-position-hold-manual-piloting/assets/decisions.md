# Decisions

<!-- Preliminary inherited decisions. Confirm during this child's /cip interview. -->

- Add altitude and horizontal behavior as outer loops over the proven attitude/rate controller.
- Convert pilot input to bounded setpoints rather than direct motor commands.
- Keep estimates, controller telemetry, and simulator truth visibly distinct.
- Apply the epic's confirmed learning-first documentation invariant, including beginner Rust guidance.
