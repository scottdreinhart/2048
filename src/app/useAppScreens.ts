import { useCallback, useState } from 'react'

export interface AppScreensState<TScreen extends string> {
  screen: TScreen
  previousScreen: TScreen | null
  setScreen: (next: TScreen) => void
  goBack: () => void
}

export function useAppScreens<TScreen extends string>(initialScreen: TScreen): AppScreensState<TScreen> {
  const [screen, setScreenState] = useState<TScreen>(initialScreen)
  const [previousScreen, setPreviousScreen] = useState<TScreen | null>(null)

  const setScreen = useCallback((next: TScreen) => {
    setPreviousScreen(screen)
    setScreenState(next)
  }, [screen])

  const goBack = useCallback(() => {
    if (previousScreen !== null) {
      const target = previousScreen
      setPreviousScreen(screen)
      setScreenState(target)
    }
  }, [previousScreen, screen])

  return {
    screen,
    previousScreen,
    setScreen,
    goBack,
  }
}
