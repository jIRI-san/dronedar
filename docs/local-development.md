# Local development

The executable foundation is accepted on **Windows with current Chromium**. It requires the Visual
Studio 2022 Build Tools **Desktop development with C++** workload, Rust `1.97.0` (installed with
rustup), Node `22.16.0`, and npm `10.9.2`. `wasm-pack` is installed by the setup command below;
no global JavaScript package is required.

```powershell
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
cargo install wasm-pack --version 0.15.0 --locked
npm ci
npx playwright install chromium
npm run quality
```

Use `npm run dev` to start the browser application. The quality command is non-interactive and
includes native Rust checks, generated-contract drift, TypeScript checks, the production bundle,
and local Playwright Chromium acceptance. Other operating systems and Firefox/WebKit are deferred
compatibility work, not acceptance targets for this foundation.
