# Decisions

<!-- Preliminary inherited decisions. Confirm during this child's /cip interview. -->

- Model the simulator as virtual hardware that publishes sensor frames and consumes motor commands.
- Keep truth state unavailable to controller code.
- Begin with explicit, reproducible sensor, wind, terrain, and obstacle simplifications rather than fidelity
  claims.
- Apply the epic's confirmed learning-first documentation invariant, including beginner Rust guidance.
