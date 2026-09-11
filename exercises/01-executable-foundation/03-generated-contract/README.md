# Generated protocol contract

## Goal

See how Rust protocol definitions become the committed TypeScript contract.

## Prerequisites

Complete [Protocol errors](../02-protocol-errors/README.md).

## Start

Run `npm run test:protocol-contract-sync`. Use VS Code task **Web: build WASM** before opening the app.

## Code map

Inspect `sim_protocol::typescript_declarations`, `generate-types`, and
`apps/web/src/generated/protocol.ts`.

## Observe

Compare `Telemetry` in Rust with its generated TypeScript declaration. Notice that Rust `u64` values
become JSON/TypeScript strings to preserve precision.

## Guided actions

1. Predict the declaration after adding a temporary `label: String` telemetry field in Rust.
2. Run `npm run protocol:generate`, inspect the generated diff, then run the sync test.
3. Remove the temporary field and regenerate.

## Expected result

The generated file changes only after its Rust source changes. The sync command exits successfully
once the generated file matches its committed source.

## Explanation

`ts-rs` derives declarations from the same Rust types that Serde serializes. This gives the protocol
one authoritative definition instead of parallel handwritten schemas.

## Reset

Remove the temporary field, run `npm run protocol:generate`, and confirm
`git diff -- apps/web/src/generated/protocol.ts` is empty.
