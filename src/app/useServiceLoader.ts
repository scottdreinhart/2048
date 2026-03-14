import { useCallback, useMemo, useState } from 'react'

export interface ServiceLoaderState {
  isReady: boolean
  isLoading: boolean
  error: string | null
}

export interface ServiceLoaderControls {
  beginLoad: () => void
  completeLoad: () => void
  failLoad: (error: unknown) => void
  reset: () => void
}

export interface ServiceLoaderResult {
  state: ServiceLoaderState
  controls: ServiceLoaderControls
}

export function useServiceLoader(initialReady = false): ServiceLoaderResult {
  const [isReady, setIsReady] = useState(initialReady)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const beginLoad = useCallback(() => {
    setIsLoading(true)
    setError(null)
  }, [])

  const completeLoad = useCallback(() => {
    setIsLoading(false)
    setIsReady(true)
    setError(null)
  }, [])

  const failLoad = useCallback((loadError: unknown) => {
    setIsLoading(false)
    setIsReady(false)
    setError(loadError instanceof Error ? loadError.message : String(loadError))
  }, [])

  const reset = useCallback(() => {
    setIsReady(false)
    setIsLoading(false)
    setError(null)
  }, [])

  const state = useMemo<ServiceLoaderState>(
    () => ({ isReady, isLoading, error }),
    [isReady, isLoading, error],
  )

  const controls = useMemo<ServiceLoaderControls>(
    () => ({ beginLoad, completeLoad, failLoad, reset }),
    [beginLoad, completeLoad, failLoad, reset],
  )

  return { state, controls }
}
