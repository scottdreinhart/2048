/**
 * AI Web Worker — off-main-thread computation for CPU moves.
 * Keeps UI at 60 FPS during complex AI calculations.
 */

self.onmessage = (_e: MessageEvent) => {
  // AI computation here
  self.postMessage({ move: -1 })
}

export {}
