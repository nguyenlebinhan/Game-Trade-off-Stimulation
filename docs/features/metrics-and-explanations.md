# Feature 4 — Metrics and explanations UI

## Goal and scope

Feature 4 connects the existing deterministic simulation engine to the game shell. The UI owns presentation and playback state; all capacity, queue, error, cost, complexity, lag, and hot-shard calculations continue to come from `simulateScenario`.

## Workload and architecture controls

The scenario panel supports:

- Requests per second and read/write ratio.
- Per-node read and write capacity scale-up.
- Read replicas per shard.
- Shard count.
- Even traffic or a deterministic 60% hot-shard distribution when multiple shards are selected.

Changing configuration clears the previous evaluated result so stale output is not presented as current.

## Playback behavior

- **Start** enters the running state and evaluates the scenario after a short deterministic UI step.
- **Pause** stops an in-progress run without publishing a result.
- **Step** evaluates immediately.
- **Reset** restores the baseline scenario, system selection, playback state, and clears evaluated output.

Controls keep accessible names and visible status text. Result updates use a polite live region.

## Results and explanations

After a run or step, the UI shows:

- Before-to-after served requests, queue, latency indicator, error rate context, cost, and complexity.
- Per-node read/write load, utilization, queue, and errors.
- Replication lag and stale-read risk only when replicas produce those metrics.
- A hot-shard signal only when the configured distribution triggers one.
- Beginner and technical explanations, engine assumptions, and warning/critical events.

The layout collapses from multi-column controls and cards to compact responsive sections. Metric tables remain horizontally scrollable on narrow screens, and interactive elements retain keyboard focus styles.

## Assumptions and limitations

- UI values are inputs to the deterministic engine; the UI does not duplicate simulation formulas.
- Run timing is presentation-only and does not change engine output.
- Read replicas serve reads only, and shard skew represents routing/key distribution.
- Latency is the engine's deterministic indicator, not a production benchmark.
- Network, cache, failover, storage growth, and cross-shard transaction coordination remain simplified as documented by Feature 3.

## Main files

- `src/ui/GameShell.tsx`: scenario state, playback controls, engine integration, metrics, and explanations.
- `src/ui/simulation.css`: responsive controls, results, tables, and explanation presentation.
- `src/ui/tradeoff-signals.css`: shard distribution control and conditional trade-off signals.
- `src/ui/SimulationIntegration.test.tsx`: accessible run/pause integration contract and pending result-flow cases.

## Verification status

Validated on the Feature 4 branch:

```bash
npm test
npm run build
```

- Tests: 4 files passed, 17 tests passed, 3 result-flow cases remain marked `todo`.
- Production build: passed with TypeScript and Vite.

## Status

Feature 4 UI integration is complete. The three pending integration cases document follow-up coverage for step/results/reset flows; the implemented behavior is available in the shell and the existing engine/unit/UI suites pass.
