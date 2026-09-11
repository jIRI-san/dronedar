# Decisions

<!-- Preliminary inherited decisions. Confirm during this child's /cip interview. -->

- Target a Linux-class small computer for the first portability checkpoint; defer microcontroller `no_std`.
- Reuse the controller contract through native replay and a thin adapter rather than simulator linkage.
- Prohibit physical motor actuation in this epic; outputs terminate in a safe test sink.
- Apply the epic's confirmed learning-first documentation invariant, including beginner Rust guidance.
