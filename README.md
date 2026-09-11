# Dronedar

Dronedar is a learning-first quadrotor simulator. The executable foundation keeps the deterministic
simulation clock in Rust, runs it in WebAssembly inside a Web Worker, and renders only immutable
telemetry in a vanilla TypeScript/Babylon.js browser shell.

See [local development](docs/local-development.md) for the supported Windows/Chromium setup and
commands.
