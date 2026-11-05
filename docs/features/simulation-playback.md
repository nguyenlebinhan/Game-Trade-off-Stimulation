# Feature 5 — Simulation playback and campaign persistence

## Acceptance criteria

- Run enters a visible `REQUESTS → DATA → QUEUE` animation state and publishes the deterministic after snapshot after 900ms.
- Pause cancels the pending publication and returns to ready state; Step publishes the same after snapshot immediately.
- Reset clears the displayed result and localStorage campaign configuration.
- Scenario configuration round-trips through localStorage; malformed data safely falls back to the baseline.
- The animation is presentation-only; `simulateScenario` remains the sole source of metrics.

## Assumptions

- Playback timing is a deterministic UI delay, not simulated wall-clock time or a benchmark.
- Campaign configuration is local to this browser and is intentionally not shared across users or devices.
- The current MVP uses one fixed playback speed (1x); a configurable speed control is deferred until campaign timing becomes gameplay data.

## Verification

```bash
npm test
npm run build
```

Tests cover run/pause, step, reset, animation state, and persistence round-trip/fallback/clear behavior.

## Status

Feature 5 is complete for the MVP playback and persistence slice. Remaining gaps include configurable campaign progression, backend/cloud saves, and a full accessibility/visual regression audit.
