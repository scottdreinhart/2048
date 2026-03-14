import React, { ReactNode } from 'react'
import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error, info: { componentStack: string }) => void
}

interface ErrorBoundaryState {
  error: Error | null
  retryCount: number
}

/**
 * React Error Boundary component
 * Catches rendering errors from any component in the tree
 * Provides fallback UI and retry mechanism
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, retryCount: 0 }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to crash logger if provided
    if (this.props.onError) {
      this.props.onError(error, {
        componentStack: info.componentStack ?? '',
      })
    }
    // Also log to console for debugging
    console.error('ErrorBoundary caught:', error, info)
  }

  handleRetry = () => {
    this.setState((prev) => ({
      error: null,
      retryCount: prev.retryCount + 1,
    }))
  }

  render() {
    if (this.state.error) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }

      // Default fallback
      return (
        <div className={styles.errorContainer} role="alert">
          <h1>Something went wrong</h1>
          <p className={styles.message}>{this.state.error.message || 'An error occurred'}</p>
          <details className={styles.details}>
            <summary>Error details</summary>
            <pre>{this.state.error.stack || 'No stack trace available'}</pre>
          </details>
          <button className={styles.retryButton} onClick={this.handleRetry}>
            Try again
          </button>
          {this.state.retryCount > 0 && (
            <p className={styles.retryInfo}>Attempt {this.state.retryCount + 1}</p>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
