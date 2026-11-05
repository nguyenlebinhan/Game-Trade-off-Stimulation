# Game Trade-off Stimulation

The dominant play area is a full-viewport Three.js mesh world with floating HUD overlays. The left build palette adds distinctive role meshes by click or native drag/drop; selecting a mesh opens an inspector for capacity edits and removal. The inspector can create typed relationship edges, which are stored in app state and rendered as visible lines. Empty-ground pointer/touch drags orbit the world, while mesh taps select without hijacking the gesture. Native buttons, focus states, touch-action boundaries, and reduced-motion fallbacks preserve accessible keyboard and touch interaction.

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

The 3D mesh renderer is loaded with a dynamic import after the shell starts. The verified base build emitted one 821.31 kB initial JavaScript chunk (219.88 kB gzip); after code-splitting, the initial chunk is 260.93 kB (81.65 kB gzip) and the deferred `ThreeMeshWorld` chunk is 561.76 kB (138.89 kB gzip). The deferred chunk may still produce Vite's 500 kB chunk notice, but it is no longer part of initial load. The semantic CSS scene, keyboard controls, touch routing, and reduced-motion behavior render without WebGL; if WebGL is unavailable or initialization fails, the mesh layer is omitted and that fallback remains usable.

Feature 9 adds an optional prediction-before-run learning interaction. Predictions are presentation state only and are not part of the simulation configuration, results, or persisted campaign state.

## Development

```bash
npm install
npm run dev
npm test
npm run build
```
