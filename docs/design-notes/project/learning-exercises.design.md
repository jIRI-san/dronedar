---
description: Repository-wide format for progressive, debugger-guided exercise packs that accompany each implemented epic plan.
globs:
  - "**/*"
---

# Learning Exercises

## Learning Model

Each implemented epic plan delivers two complementary artifacts:

| Artifact | Purpose | Avoid |
|---|---|---|
| Learning chapter | Explain concepts, design decisions, algorithms, data structures, and trade-offs | Repeating step-by-step debugger instructions |
| Exercise pack | Guide interactive observation and small reversible experiments against working code | Duplicating production logic in a tutorial codebase |

Exercises start by observing known-good code, then introduce small parameter or local code changes. Every
change includes an explicit reset or restoration path.

## Pack Structure

Use this structure:

```text
exercises/<plan-order>-<plan-topic>/
  README.md
  01-<concept>/README.md
  02-<concept>/README.md
  ...
```

The pack README lists the learning path. Each concept directory owns one exercise README and only the
smallest fixtures, sample inputs, or entry points required for that exercise.

Each plan normally provides 3–6 concept-focused exercises. Use fewer when the plan introduces fewer
distinct concepts. More than six requires a stated learning reason; ten is the maximum.

Each exercise records:

| Section | Required content |
|---|---|
| Goal | One observable concept or behavior |
| Prerequisites | Links to required earlier exercises, chapters, or plans |
| Start | Exact local command and named VS Code launch/task when available |
| Code map | Small set of relevant files, types, functions, and algorithms |
| Observe | Breakpoint locations, variables, watches, logs, plots, or UI state |
| Guided actions | Ordered interactions, predictions, and optional small reversible changes |
| Expected result | Concrete state transitions, values, messages, or visual behavior |
| Explanation | Why the observation follows from the implementation |
| Reset | Exact restoration or cleanup instructions |

## Debugging Support

Commit repository-level `.vscode/extensions.json`, `.vscode/launch.json`, and `.vscode/tasks.json` entries
as debugging capabilities become available. Recommend only extensions actually used by the exercises and
include any required pre-launch build task.

VS Code line breakpoints are user state and are not treated as portable repository configuration.
Exercise instructions identify stable functions or test names and the intended stopping statement, plus
useful variables and expressions to watch. Prefer observable state and structured logs over inserting
debug-only behavior into production code.

State the tested debugger matrix. Prefer native Rust tests for Rust breakpoints and Chromium's JavaScript
debugger plus source maps for main-thread and worker TypeScript. Do not promise Rust-in-WASM source
breakpoints unless that exact workflow has been demonstrated on the supported local environment.

## Constraints

- Exercises use the real implementation or thin fixtures around it; do not maintain parallel copies of
  production algorithms.
- Keep numbering stable and validate the required sections, prerequisite references, and ten-exercise cap
  with a lightweight local repository check.
- Keep each exercise focused enough to complete and understand independently.
- State expected observations before explaining them so the learner can predict and investigate.
- Reference prerequisite concepts rather than re-teaching them.
- Do not require hosted services, CI, secrets, physical hardware, or undocumented global tools.
- Debug instrumentation must not change release behavior or become a second source of application state.
