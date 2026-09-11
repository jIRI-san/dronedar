# Decisions

<!-- Preliminary inherited decisions. Confirm during this child's /cip interview. -->

- Implement an educational custom 6-DoF model rather than delegating initial flight integration to Rapier.
- Hide the implementation behind a narrow dynamics-backend boundary without copying a third-party API.
- Use explicit SI units, documented frames, quaternions, and deterministic fixed-step integration.
- Apply the epic's confirmed learning-first documentation invariant, including beginner Rust guidance.
