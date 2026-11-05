# Feature 7 — Campaign map

## Acceptance criteria

- The campaign **Cứu shop trước giờ flash sale** has an accessible map reachable from the top navigation.
- The first level, **Database overload**, is the only playable level and returns to the existing simulation shell when selected.
- Later levels are visibly and semantically locked, labeled “Coming soon”, and do not expose invented playable content.
- The map is responsive, keyboard reachable, dismissible, and uses a modal dialog with an accessible name.
- Existing Feature 5 scenario persistence is reused: a saved `architecture-run:scenario` is shown as local “In progress”; no second progress store is introduced.

## Assumptions and limits

Completion is not yet persisted by the MVP, so the map reports saved scenario configuration as “In progress” rather than claiming level completion. Progress remains local to the browser and the existing 28% campaign display is unchanged. Locked levels have no routes or gameplay until their content is implemented.

## Files

- `src/game/level.ts`: campaign level metadata.
- `src/ui/GameShell.tsx`: map navigation, dialog, locked states, and Feature 5 progress signal.
- `src/ui/styles.css`: responsive map presentation and focus states.
- `src/ui/GameShell.test.tsx`: map accessibility, locked-level, and saved-progress coverage.

## Checks

`npm test` and `npm run build`.
