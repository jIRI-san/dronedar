---
description: Repository-wide decision rule: prefer simple, clear, concise, good-enough solutions and state the trade-offs before adding complexity.
globs:
  - "**/*"
---

# Simplicity First

## Decision Rule

For every design or implementation choice:

1. Identify the simplest option that satisfies the confirmed requirements and evidence.
2. Mention a materially better but more complex option when it could matter to the decision.
3. Default to the simpler option and state what capability, flexibility, or optimization it gives up.
4. Add complexity only when a current requirement, measured limitation, or concrete risk justifies it.

“Good enough” means correct for the accepted scope, understandable, testable, and explicit about failures.
It does not mean unfinished, fragile, or silently incorrect.

## Design Decisions

| Concern | Default | Add complexity when |
|---|---|---|
| Architecture | Few components with narrow, direct boundaries | A confirmed requirement cannot fit without coupling or duplication |
| Abstraction | Implement the current use case directly | A second real use case or replacement need demonstrates a stable seam |
| Dependencies | Prefer the existing platform and small focused libraries | A dependency removes substantial proven work without obscuring the learning goal |
| Performance | Use the clearest correct implementation | Measurement shows an accepted scenario misses its target |
| Extensibility | Record likely future directions without implementing them | A current milestone requires the extension point |
| Documentation | Explain decisions and trade-offs briefly and concretely | Extra detail is needed to teach a domain concept or prevent a likely mistake |

## Constraints

- Do not build speculative frameworks, plugin systems, generic repositories, compatibility layers, or
  optimizations for hypothetical future needs.
- Prefer readable, explicit code over clever compression. Brevity must not hide behavior or failure modes.
- A simpler choice cannot bypass correctness, accepted requirements, explicit error handling, or evidence.
- When choosing a more complex option, record the concrete trigger, benefit, cost, and simpler alternative.
- Revisit a good-enough choice when measurements, repeated duplication, or a new confirmed requirement
  invalidates its original trade-off.
