import { useEffect } from 'react'

interface PerformanceMetrics {
  lcp?: number // Largest Contentful Paint
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
}

declare global {
  interface Window {
    webVitals?: PerformanceMetrics
  }
}

/**
 * Monitors Core Web Vitals (LCP, CLS, FCP) and stores metrics on window object
 * Call logWebVitals() at app root to enable automatic logging on page unload
 */
export const usePerformanceMetrics = () => {
  useEffect(() => {
    if (!window.webVitals) {
      window.webVitals = {}
    }

    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      window.webVitals!.lcp = (lastEntry as any).renderTime || (lastEntry as any).loadTime
    })
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch {
      // Browser doesn't support LCP
    }

    // CLS (Cumulative Layout Shift)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
          window.webVitals!.cls = clsValue
        }
      }
    })
    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch {
      // Browser doesn't support CLS
    }

    // FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      if (entries.length > 0) {
        window.webVitals!.fcp = entries[0].startTime
      }
    })
    try {
      fcpObserver.observe({ entryTypes: ['paint'] })
    } catch {
      // Browser doesn't support FCP
    }

    return () => {
      lcpObserver.disconnect()
      clsObserver.disconnect()
      fcpObserver.disconnect()
    }
  }, [])

  return window.webVitals || {}
}

/**
 * Logs all captured Web Vitals metrics to console before page unload
 * Call this at app root (usually in useEffect)
 */
export const logWebVitals = () => {
  if (typeof window === 'undefined') {return}

  window.addEventListener('beforeunload', () => {
    const metrics = window.webVitals || {}
    console.warn('Web Vitals:', {
      lcp: metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : 'not captured',
      cls: metrics.cls ? metrics.cls.toFixed(3) : 'not captured',
      fcp: metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : 'not captured',
    })
  })
}
