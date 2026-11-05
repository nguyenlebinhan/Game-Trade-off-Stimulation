# Feature 5 persistence shape validation

## Symptom

Valid JSON such as `{}` was accepted as a saved scenario. On application startup, the partial object replaced the baseline configuration and could make `simulateScenario` throw while reading missing fields.

## Root cause

`loadScenario` only checked that parsed JSON was an object; it did not validate required numeric fields, capacities, ranges, or shard distribution.

## Fix and regression coverage

The persistence seam now validates the complete `ScenarioConfiguration` shape and returns the baseline fallback for malformed JSON shapes, while preserving valid saved configurations. Regression tests cover `{}`, partial configurations, invalid ratios, malformed JSON, round-trip persistence, and clearing saved state.
