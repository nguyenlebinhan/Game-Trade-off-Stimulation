# Game Trade-off Stimulation

The dominant play area is a CSS-only isometric architecture scene: Client, App Server, Database, Replica, and Shard objects are selectable buttons, while decorative request/data packets communicate the current simulation phase. Its composition is a spacious dark playfield with centered system objects, a floating mission/task card, a left tool rail, top telemetry, bottom simulation controls, and a tactical-map minimap treatment. Replica and shard objects are presentation projections of the existing Database node, so selecting them opens the same deterministic database detail and does not create new simulation behavior. The scene uses CSS perspective rather than WebGL or a new rendering dependency. Native buttons, focus states, and the existing play/step/reset controls provide the accessible keyboard fallback; reduced-motion users keep the same topology without animation.

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
