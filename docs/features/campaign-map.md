# Feature 7 — Campaign map

## Acceptance criteria

- The flash-sale campaign has an accessible map reachable from the top navigation.
- Database overload is the only playable level and returns to the existing simulation shell when selected.
- Later levels are visibly and semantically locked, labeled “Coming soon”, and do not expose invented playable content.
- The map is responsive, keyboard reachable, dismissible, and uses a modal dialog with an accessible name.
- Opening the map moves focus to its close control; Escape closes it and restores focus to the opener; Tab and Shift+Tab remain within the modal controls.
- Feature 5 scenario persistence provides local “In progress” state, while Feature 8 stores validated Database overload completion separately.

## Assumptions and limits

Completion is persisted locally when the playable level's after-state has zero errors; malformed completion data is treated as incomplete. The map reports `COMPLETED` for Database overload, while saved scenario configuration alone remains “In progress”. Locked levels have no routes or gameplay until their content is implemented and are never unlocked by this feature.

## Files

- `src/game/level.ts`: campaign level metadata.
- `src/game/persistence.ts`: scenario and completion persistence.
- `src/ui/GameShell.tsx`: map navigation, dialog, locked states, and local progress/completion signals.
- `src/ui/styles.css`: responsive map presentation and focus states.
- `src/ui/GameShell.test.tsx`: map accessibility, focus lifecycle/trap, locked-level, saved-progress, and completion coverage.

## Checks

`npm test` and `npm run build`.
