# Game Trade-off Stimulation

## Documents

- [Feature 1: Game shell](features/game-shell.md)
- [Feature 2: System model state](features/system-model.md)
- [Feature 3: Deterministic simulation engine](features/simulation-engine.md)
- [Feature 4: Metrics and explanations UI](features/metrics-and-explanations.md)
- [Feature 5: Simulation playback and campaign persistence](features/simulation-playback.md)
- [Feature 7: Campaign map](features/campaign-map.md)
- [Feature 8: Campaign completion persistence](features/campaign-progress.md)
- [Feature 9: Prediction review](features/prediction-review.md)

## Status

The MVP uses React, TypeScript, and Vite. It includes a responsive game shell, an accessible campaign map for the flash-sale campaign, a playable Database overload level, deterministic simulation, architecture actions, playback controls, metrics, explanations, and validated localStorage persistence for scenario configuration and level completion. Completion is recorded only when the playable level's after-state has zero errors; future levels remain locked.

Feature 9 adds an optional prediction-before-run learning interaction. Predictions are presentation state only and are not part of the simulation configuration, results, or persisted campaign state.

## Development

```bash
npm install
npm run dev
npm test
npm run build
```
