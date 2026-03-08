import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  /** Content to render when no error */
  children: ReactNode
  /** Optional custom fallback UI */
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * React Error Boundary — catches rendering errors in child components
 * and displays a fallback UI instead of crashing the entire app.
 *
 * Wrap at the organism level so a single atom/molecule crash doesn't
 * take down the whole game.
 *
 * Usage:
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <GameBoard />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div
          role="alert"
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#e0e0e0',
            background: '#1a1a2e',
            borderRadius: '12px',
            margin: '2rem auto',
            maxWidth: '400px',
          }}
        >
          <h2 style={{ marginBottom: '0.5rem', color: '#ff6b6b' }}>Something went wrong</h2>
          <p style={{ opacity: 0.7, marginBottom: '1rem' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '0.5rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: '#667eea',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
