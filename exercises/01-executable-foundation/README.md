# Executable foundation exercises

Follow these five exercises in order. They inspect the working implementation first, then make small
reversible changes; no exercise copies the clock or protocol algorithm. Complete the
[learning chapter](../../docs/learning/01-executable-foundation.md) setup before beginning.

| Order | Exercise | Concepts |
|---|---|---|
| 1 | [Clock state machine](01-clock-state-machine/README.md) | ownership, fixed ticks, transitions |
| 2 | [Protocol errors](02-protocol-errors/README.md) | tagged JSON, correlation, state preservation |
| 3 | [Generated contract](03-generated-contract/README.md) | Rust-derived TypeScript declarations |
| 4 | [WASM worker lifecycle](04-wasm-worker-lifecycle/README.md) | serialization, queue, timer, disposal |
| 5 | [Browser control flow](05-browser-control-flow/README.md) | Chromium TypeScript debugging and presentation |

Install the recommended `rust-lang.rust-analyzer` and `vadimcn.vscode-lldb` extensions. The supported
debugger matrix is native Rust tests through **Debug Rust deterministic clock tests** and Chromium
main-thread/worker TypeScript through **Chromium: main thread and worker TypeScript**. Vite source maps
support TypeScript source inspection. Rust-in-WASM source breakpoints are unsupported for this pack.
