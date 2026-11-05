# Feature 9 — Prediction review

## Goal

Before running the Database overload simulation, a learner may predict whether latency, errors, cost, and complexity will become better, stay the same, or become worse. After the deterministic simulation publishes its result, the game compares each prediction with the actual before-to-after direction.

## Acceptance criteria

- The prediction interaction is optional and can be enabled without changing the scenario controls.
- When enabled, four keyboard-accessible controls are available with stable accessible names: Prediction for Latency, Prediction for Errors, Prediction for Cost, and Prediction for Complexity. Each offers Better, Same, and Worse.
- Predictions are collected before Run or Step and remain separate from `ScenarioConfiguration` and `SimulationResult`.
- Run and Step use the existing deterministic simulation. Actual direction is derived only from the corresponding before/after values; lower latency, errors, cost, or complexity is “better.”
- After a result, the review identifies the learner’s prediction and actual direction for all four metrics.
- The review includes a concise explanation that architecture choices involve workload- and constraint-dependent trade-offs; it must not declare one architecture universally correct.
- Predictions are not written to localStorage and do not affect campaign completion, scenario persistence, or simulation output. Reset clears the optional interaction along with the evaluated result.
- The review remains understandable to keyboard and assistive-technology users through a labelled fieldset, labels, native controls, and text content that does not rely on color alone.

## Contract with UI tests

The production UI owns the interaction state. Tests should locate the opt-in control by its visible label, then locate each prediction select by `Prediction for <metric>`. Result assertions should check the `PREDICTION REVIEW` heading and the textual predicted/actual directions, rather than relying on CSS classes or visual color.

## Persistence and limitations

Only scenario configuration and level completion remain persisted as defined by Features 5 and 8. Predictions are intentionally ephemeral: they are a learning prompt for the current evaluation, not campaign progress. Direction is a coarse comparison of deterministic indicators, not a production benchmark or a claim about every workload.

## Verification

```bash
npm test
npm run build
```
