# PR Review Checklist — Input Controls & Cross-Platform UX

## Input Directive Compliance

- [ ] Input changes follow `.github/instructions/08-input-controls.instructions.md`.
- [ ] Input handling remains semantic-action-driven (no raw device events in game/UI logic).
- [ ] `useKeyboardControls` is used as a keyboard adapter only (no orchestration creep).

## Context & Safety

- [ ] Context behavior is explicit (`gameplay`, `menu`, `chat`, `modal`, `disabled`).
- [ ] Text-entry safety is preserved (typing does not trigger gameplay actions).
- [ ] Chat/input behavior remains predictable (`Enter`, `Escape`, history/autocomplete where applicable).

## Keyboard Rules

- [ ] Game-style bindings prefer `event.code` (WASD, arrows, space, enter).
- [ ] Key phase and repeat behavior are intentional (`keydown`/`keyup`, repeat enabled/disabled per action).
- [ ] Desktop/Web mappings are unsurprising and consistent with existing game behavior.

## Mobile & TV

- [ ] Mobile interactions remain touch-native and map to semantic actions.
- [ ] TV/D-pad navigation is fully operable with Up/Down/Left/Right + OK + Back.
- [ ] Focus behavior is visible/predictable for TV and keyboard navigation paths.

## Governance & Consistency

- [ ] No ad-hoc per-component global key listeners were introduced.
- [ ] Shared app hooks/services were reused where available before adding new patterns.
- [ ] Any intentional deviation from baseline behavior is documented in repo instructions/PR notes.
