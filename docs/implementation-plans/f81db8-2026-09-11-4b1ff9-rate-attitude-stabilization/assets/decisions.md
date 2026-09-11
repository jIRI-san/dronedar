# Decisions

<!-- Preliminary inherited decisions. Confirm during this child's /cip interview. -->

- Implement the portable flight-control core in Rust behind the sensor/setpoint/actuator boundary.
- Teach stabilization with a cascaded attitude and angular-rate PID structure before higher-level control.
- Keep simulator, browser, WASM, and truth-state dependencies out of controller code.
- Apply the epic's confirmed learning-first documentation invariant, including refreshed PID foundations.
