# INPUT CONTROLS IMPLEMENTATION DIRECTIVE

You are implementing and extending the project input system for a cross-platform game application that targets:

- Desktop
- Web
- Mobile
- TV

The codebase must treat input as an action-based, platform-aware abstraction layer, not as ad hoc device-specific event handling.

---

## 1. PRIMARY GOAL

Implement input so that users on each platform can operate the application in a way that feels native, expected, and unsurprising.

The system must be built around semantic actions, not raw keys or buttons.

Examples of semantic actions:

- moveUp
- moveDown
- moveLeft
- moveRight
- confirm
- cancel
- pause
- openMenu
- closeMenu
- primaryAction
- secondaryAction
- interact
- openChat
- sendChat
- cancelChat
- nextTab
- prevTab

All device-specific controls must map into this shared action model.

---

## 2. ARCHITECTURE RULES

### 2.1 Canonical action model
Use a canonical action registry as the single source of truth.

Do not hardcode platform logic directly into game logic.

Game logic, UI logic, and navigation logic must respond to actions, not to raw keyboard keys, remote buttons, touch events, or mouse buttons.

### 2.2 Hook responsibility
`useKeyboardControls` is a keyboard adapter, not the entire input system.

It should only translate keyboard-like input into semantic actions.

If broader input orchestration exists, place it in a higher-level hook such as:

- `useInputControls`
- `usePlatformInput`
- `useActionControls`

### 2.3 Context-aware behavior
The input system must support separate contexts, at minimum:

- gameplay
- menu
- chat
- modal
- disabled

The same physical key or button may produce different actions depending on the active context.

### 2.4 Input-safe behavior
When the user is focused in a text-entry context, gameplay input must not fire accidentally.

Chat and text entry must preserve expected text editing behavior unless a specific binding is explicitly allowed.

---

## 3. PLATFORM IMPLEMENTATION REQUIREMENTS

---

## 4. DESKTOP INPUT REQUIREMENTS

Desktop users expect a full keyboard-first experience, with optional mouse support where relevant.

### 4.1 Desktop movement and navigation
Desktop must support:
- WASD
- Arrow keys

These should map to:
- moveUp
- moveDown
- moveLeft
- moveRight

### 4.2 Desktop confirm/cancel behavior
Desktop must support:
- Enter
- NumpadEnter
- Space
- Escape

These should map as appropriate to:
- confirm
- primaryAction
- cancel
- pause

### 4.3 Desktop interaction keys
Desktop should support common expected keys when applicable:
- E = interact
- F = secondary interact
- R = reload/reset/restart
- Shift = sprint/modifier
- Ctrl or C = crouch/modifier
- Tab = cycle UI, scoreboard, or next focus target
- Shift+Tab = reverse UI traversal
- Digit1-Digit9 = quick slots or hotbar

### 4.4 Desktop chat behavior
Desktop chat must support:
- Enter = open chat or send chat depending on state
- T = open all chat
- Y = open team chat if supported
- Slash = open command chat if supported
- Escape = close/cancel chat
- Up/Down = chat history where appropriate
- Tab = autocomplete where appropriate

### 4.5 Desktop implementation constraints
Use `event.code` for game-style physical bindings such as:
- KeyW
- KeyA
- KeyS
- KeyD
- ArrowUp
- ArrowDown
- Space

Use `event.key` or semantic matching only when meaning matters more than physical layout.

Do not hijack normal text editing shortcuts while text input is focused.

---

## 5. WEB INPUT REQUIREMENTS

Web input should feel like desktop input where the game has focus, but it must still respect browser and accessibility conventions.

### 5.1 Web keyboard behavior
When the game or an owned focus region is active, web should support the same expected keyboard controls as desktop.

### 5.2 Browser-safe behavior
Do not override browser behavior unless the application clearly owns focus and the action is intentional.

Be cautious with:
- Tab
- Space
- Backspace
- Arrow keys
- Ctrl/Cmd shortcuts

### 5.3 Focus management
Web implementations must be focus-aware.

Keyboard control should only act aggressively when:
- the game surface is focused
- a menu region is active
- the application clearly owns keyboard interaction

### 5.4 Accessibility expectations
Web UI must still work with standard focus navigation where appropriate.

Do not break expected web interaction patterns in ordinary form fields, text boxes, buttons, or modal dialogs.

---

## 6. MOBILE INPUT REQUIREMENTS

Mobile is touch-first and must not be implemented as a hidden keyboard metaphor.

Mobile controls must be obvious, simple, and ergonomically reasonable.

### 6.1 Mobile primary interaction patterns
Support these touch patterns where relevant:
- tap = confirm / select / interact
- long press = secondary action / inspect / context action
- swipe = scroll / pan / directional movement only where appropriate
- drag = aiming / movement / repositioning only where natural

### 6.2 Mobile control philosophy
On mobile, fewer controls are better than cluttered controls.

Do not overload the screen with too many virtual buttons.

Use clear touch affordances such as:
- visible action buttons
- visible pause/menu button
- visible chat button
- on-screen joystick only when needed
- thumb-friendly layout zones

### 6.3 Mobile semantic mappings
Mobile touch input must map into the same semantic actions used by keyboard and TV.

Examples:
- tap focused button -> confirm
- tap action button -> primaryAction
- long press interactable -> secondaryAction or interact
- tap pause icon -> pause
- tap chat icon -> openChat

### 6.4 Mobile chat behavior
Mobile chat must use explicit visible chat entry.

Do not rely on invisible gestures for chat.

Opening chat should focus the text field and bring up the system keyboard.

---

## 7. TV INPUT REQUIREMENTS

TV is remote-first and focus-driven.

TV is not a mouse environment and must be implemented around directional navigation.

### 7.1 TV baseline controls
Assume only these universal remote controls are guaranteed:
- D-pad Up
- D-pad Down
- D-pad Left
- D-pad Right
- Center / OK / Select
- Back / Return

These must be sufficient to operate the application.

### 7.2 TV required semantic mapping
Map TV controls to:
- Up -> moveUp or focusUp
- Down -> moveDown or focusDown
- Left -> moveLeft or focusLeft
- Right -> moveRight or focusRight
- OK -> confirm
- Back -> cancel / back / closeMenu

Optional buttons such as Menu or Play/Pause may map to:
- pause
- openMenu

But they must never be required for essential navigation.

### 7.3 TV focus requirements
TV interfaces must be fully focus-driven.

Requirements:
- there must always be a visible focused element
- focus must never be lost
- every interactive element must be reachable by D-pad navigation
- Back must always behave predictably
- lists and grids must scroll automatically as focus moves

### 7.4 TV implementation guidance
Treat remote-like keyboard events such as arrows and enter as TV-compatible input when appropriate.

Do not require hover, drag, cursor precision, or tiny hit targets.

Do not design TV controls around free cursor movement.

### 7.5 TV chat behavior
TV chat should be simplified.

Prefer one of:
- on-screen keyboard
- quick chat phrases
- explicit chat screen

Do not assume long-form typing is comfortable on TV.

---

## 8. SHARED DEVICE RULES

### 8.1 Support redundancy where expected
Multiple natural inputs may map to the same action.

Examples:
- confirm = Enter, Space, tap, OK button
- cancel = Escape, Back, visible close button
- moveUp = KeyW, ArrowUp, D-pad Up, swipe up where appropriate

### 8.2 Never bind in surprising ways
Default bindings must align with common user expectations.

Do not assign obscure or unintuitive keys to essential actions by default.

### 8.3 Preserve chat safety
When chat is open or text input is focused:
- typing keys should type
- movement keys should not move the character
- space should insert spaces
- enter should send or insert newline according to chat design
- escape should close or cancel chat if appropriate

### 8.4 Prefer semantic action dispatch
All platform adapters must dispatch canonical actions.

Do not let gameplay components depend directly on raw device events.

---

## 9. KEYBOARD ADAPTER RULES

When implementing `useKeyboardControls`, follow these rules:

### 9.1 Purpose
The hook must translate keyboard input into semantic action triggers.

### 9.2 Supported keyboard contexts
The hook must support:
- gameplay
- menu
- chat
- modal

### 9.3 Key matching
Prefer `event.code` for physical game controls.

Examples:
- KeyW
- KeyA
- KeyS
- KeyD
- ArrowUp
- ArrowDown
- ArrowLeft
- ArrowRight
- Space
- Enter

Use `event.key` or semantic tokens only where needed for meaning-sensitive shortcuts.

### 9.4 Input guards
The hook must ignore normal gameplay bindings when form fields, textareas, selects, or contenteditable elements are focused, unless a binding explicitly opts into text-input contexts.

### 9.5 Key phases
The hook should support both:
- keydown
- keyup

This is necessary for held movement, release behavior, and proper game control flow.

### 9.6 Repeat handling
Bindings must be able to control whether repeated keydown events are allowed.

Examples:
- movement may allow repeat or track held state
- confirm usually should not repeat
- openChat should not repeat
- chat history may allow repeat

---

## 10. IMPLEMENTATION OUTCOME

The final system must allow each platform to feel natural without changing the game’s core action model.

Expected result:

- Desktop feels like a proper keyboard game/app
- Web respects browser expectations while supporting game focus
- Mobile feels touch-native and uncluttered
- TV works fully with D-pad, OK, and Back
- Chat behaves safely and predictably
- Core logic remains action-driven and platform-agnostic

---

## 11. CODING STYLE REQUIREMENTS

- Keep the input system modular
- Keep platform mapping separate from gameplay logic
- Use clear type-safe action names
- Avoid monolithic switch statements when possible
- Keep adapters composable
- Prefer deterministic, auditable mappings
- Design for future extension to mouse, touch, gamepad, and remote without rewriting the action model

---

## 12. DELIVERABLE EXPECTATION

Implement or refactor the input system so that:
- platform-specific device inputs are mapped cleanly to semantic actions
- `useKeyboardControls` serves as the keyboard adapter
- text input and chat are handled safely
- TV D-pad navigation is treated as a first-class requirement
- all platform behaviors remain unsurprising and conventional
