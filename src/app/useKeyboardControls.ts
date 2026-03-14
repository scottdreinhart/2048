import { useEffect, useMemo } from 'react'

type Enabled = boolean | (() => boolean)

export type KeyboardPhase = 'keydown' | 'keyup'

export interface KeyboardActionEvent {
  action: string
  phase: KeyboardPhase
  event: KeyboardEvent
}

export type KeyboardActionHandler = (input: KeyboardActionEvent) => void

export interface KeyboardActionBinding {
  action: string
  keys: string[]
  onTrigger: KeyboardActionHandler
  enabled?: Enabled
  preventDefault?: boolean
  allowRepeat?: boolean
  allowInInputs?: boolean
  phase?: KeyboardPhase
}

export interface UseKeyboardControlsOptions {
  enabled?: Enabled
  ignoreInputs?: boolean
  target?: Document | HTMLElement
}

const FORM_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

const isFormElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  return FORM_TAGS.has(target.tagName)
}

const isEnabled = (enabled: Enabled | undefined): boolean => {
  if (enabled === undefined) {
    return true
  }
  return typeof enabled === 'function' ? enabled() : enabled
}

const normalizeToken = (token: string): string =>
  token
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')

const buildEventTokens = (event: KeyboardEvent): string[] => {
  const modifiers: string[] = []

  if (event.ctrlKey || event.metaKey) {
    modifiers.push('ctrl')
  }
  if (event.altKey) {
    modifiers.push('alt')
  }
  if (event.shiftKey) {
    modifiers.push('shift')
  }

  const code = event.code.toLowerCase()
  const key = event.key.toLowerCase() === ' ' ? 'space' : event.key.toLowerCase()

  const tokens = new Set<string>()
  tokens.add(code)
  if (modifiers.length > 0) {
    tokens.add(`${modifiers.join('+')}+${code}`)
  }

  tokens.add(`key:${key}`)
  if (modifiers.length > 0) {
    tokens.add(`${modifiers.join('+')}+key:${key}`)
  }

  return [...tokens]
}

export function useKeyboardControls(
  bindings: KeyboardActionBinding[],
  {
    enabled = true,
    ignoreInputs = true,
    target,
  }: UseKeyboardControlsOptions = {},
): void {
  const host = target ?? document

  const bindingMap = useMemo(() => {
    const map = new Map<string, KeyboardActionBinding[]>()

    for (const binding of bindings) {
      for (const rawKey of binding.keys) {
        const token = normalizeToken(rawKey)
        const existing = map.get(token)
        if (existing) {
          existing.push(binding)
        } else {
          map.set(token, [binding])
        }
      }
    }

    return map
  }, [bindings])

  useEffect(() => {
    if (!isEnabled(enabled)) {
      return
    }

    const handleKeyboardEvent = (phase: KeyboardPhase) => (rawEvent: Event) => {
      if (!(rawEvent instanceof KeyboardEvent)) {
        return
      }

      const event = rawEvent
      if (ignoreInputs && isFormElement(event.target)) {
        const candidateBindings = buildEventTokens(event)
          .flatMap((token) => bindingMap.get(token) ?? [])
          .filter((binding) => binding.allowInInputs)

        for (const binding of candidateBindings) {
          if ((binding.phase ?? 'keydown') !== phase) {
            continue
          }
          if (!isEnabled(binding.enabled)) {
            continue
          }
          if (event.repeat && !binding.allowRepeat) {
            continue
          }
          if (binding.preventDefault ?? true) {
            event.preventDefault()
          }
          binding.onTrigger({ action: binding.action, phase, event })
          return
        }

        return
      }

      const candidates = buildEventTokens(event)

      for (const token of candidates) {
        const matches = bindingMap.get(token)
        if (!matches) {
          continue
        }

        for (const binding of matches) {
          if ((binding.phase ?? 'keydown') !== phase) {
            continue
          }
          if (!isEnabled(binding.enabled)) {
            continue
          }
          if (event.repeat && !binding.allowRepeat) {
            continue
          }

          if (binding.preventDefault ?? true) {
            event.preventDefault()
          }

          binding.onTrigger({
            action: binding.action,
            phase,
            event,
          })
          return
        }
      }
    }

    const onKeyDown = handleKeyboardEvent('keydown')
    const onKeyUp = handleKeyboardEvent('keyup')

    host.addEventListener('keydown', onKeyDown)
    host.addEventListener('keyup', onKeyUp)

    return () => {
      host.removeEventListener('keydown', onKeyDown)
      host.removeEventListener('keyup', onKeyUp)
    }
  }, [bindingMap, enabled, host, ignoreInputs])
}