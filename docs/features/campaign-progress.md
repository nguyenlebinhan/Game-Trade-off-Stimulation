# Feature 8 — Campaign completion persistence

## Acceptance criteria

- Database overload is marked `COMPLETED` only after Step or Run produces an after-state with zero errors (`after.summary.errorRps === 0`).
- Completion is stored locally under a separate validated key and restores after reload.
- Missing, malformed, or non-boolean completion data safely means incomplete.
- Reset clears scenario and completion state, providing a clear local reset path.
- Cache storm and Queue backlog remain locked; completion never unlocks future levels.

## Scope and verification

Completion is intentionally local to this browser. A saved scenario alone remains `IN PROGRESS`.

```bash
npm test
npm run build
```
