# Architecture Governance: 07-Scale-Aware AI Orchestration

> **Scope**: Repository-wide pattern for all app projects (30+ apps)
> **Authority**: Complements AGENTS.md and 01-build.instructions.md
> **Stability**: Mature pattern (implemented in tictactoe, ready for all projects)

---

## 1. The Pattern: Scale-Aware Async AI

### Problem
Games need efficient AI computation that:
- Doesn't block the UI for simple cases
- Gracefully scales to larger board sizes
- Maintains consistency across projects
- Provides fallback when advanced features unavailable

### Solution
**Three-tier decision tree** for CPU move computation:

```
┌─ Estimate board complexity (cells, game tree depth, etc.)
│
├─ SIMPLE (<10ms decision time)
│  └─ Use sync main-thread WASM (lowest overhead)
│     Fallback: JS implementation (guaranteed available)
│     Examples: 3×3 tic-tac-toe, 4×4 lights-out, simple match-3
│
├─ MEDIUM (10–100ms decision time)
│  └─ Use optional async via Web Worker (prevents UI jank)
│     Fallback: Sync main-thread (always correct)
│     Examples: 5×5 chess, 8×8 checkers, complex puzzle games
│
└─ COMPLEX (>100ms decision time)
   └─ Use required async (UI blocking unacceptable)
      Fallback: Simplified heuristic (quality trade-off)
      Examples: 19×19 Go, deep Minimax with lookahead
```

---

## 2. Implementation Structure

### Required Files (all projects)

#### `src/app/aiEngine.ts` (or `aiService.ts` for snake)
```typescript
// SYNC PATH (main-thread, WASM-accelerated)
export const computeAiMove = (
  board: Board,
  difficulty: Difficulty,
  cpuToken?: Token,
  humanToken?: Token,
): AiResult => {
  // WASM-first, JS fallback, always sync
  return { index: 0, engine: 'wasm' | 'js' }
}

// ASYNC PATH (worker-backed, optional)
export const computeAiMoveAsync = async (
  board: Board,
  difficulty: Difficulty,
  cpuToken?: Token,
  humanToken?: Token,
): Promise<AiResult> => {
  // Worker-first, sync fallback, prevents blocking
  return { index: 0, engine: 'wasm' | 'js' }
}

// LIFECYCLE
export const ensureWasmReady = (): Promise<void>
export const terminateAsyncAi = (): void
```

#### `src/workers/ai.worker.ts`
- Receives: `{ board, difficulty, ... }`
- Loads WASM on worker startup
- Sends back: `{ index, engine }`
- Has JS fallback for all difficulties

#### `src/app/useCpuPlayer.ts` (or equivalent hook)
```typescript
// Decision: Should async be used?
const USE_ASYNC = boardSize > 4 || searchDepth > 4

useEffect(() => {
  if (USE_ASYNC) {
    computeAiMoveAsync(...).then(onMove)
  } else {
    const result = computeAiMove(...)
    onMove(result)
  }
}, [board, difficulty])
```

### Testing Files

#### `src/app/aiEngine.test.ts`
Must validate:
- ✅ Sync path: all difficulties, all board states
- ✅ Async path: worker lifecycle, concurrent requests
- ✅ Equivalence: sync and async produce same move
- ✅ Performance: sync <100ms, async <500ms
- ✅ Fallback: both handle errors gracefully

---

## 3. Architecture Guidelines

### Decision Rules

| Item | Rule |
|------|------|
| **Default** | Use sync (computeAiMove) unless benchmarks show jank |
| **Benchmark** | If decision time > 10ms, profile to determine if async helps |
| **Thread** | WASM always preferred; JS as fallback only |
| **Worker** | Overhead: ~5–10ms; gain: prevents 100ms+ blocking |
| **Graceful Fallback** | Worker failure → sync (never crash) |

### Performance Targets

| Path | Target | Tic-Tac-Toe | Larger Games |
|------|--------|-------------|------|
| Sync | <100ms | 3×3 minimax: <1ms ✅ | N/A |
| Async | <500ms | Optional (unused) | 8×8+ minimax: 50–200ms |
| Worker init | <20ms | (one-time) | (one-time) |

---

## 4. Tic-Tac-Toe Reference Implementation

### File: `src/app/aiEngine.ts`

**Key features:**
- ✅ 4 WASM AI functions (easy/medium/hard/unbeatable)
- ✅ Sync path: main-thread, <1ms for 3×3
- ✅ Async path: optional worker, available for testing/future
- ✅ Fallback chain: WASM → JS (both work on main and worker)
- ✅ Comprehensive tests: 30+ test cases

**Architectural comments:**
```typescript
// ARCHITECTURE:
// - Sync mode (default): Main-thread WASM for small boards (<10ms decision time)
// - Async mode (optional): Worker-backed computation for complex scenarios
//
// TICTACTOE (3×3): Minimax completes in <1ms → sync mode is optimal
// LARGER BOARDS: Use async mode via `computeAiMoveAsync` to prevent UI blocking
```

---

## 5. Applying to Other Projects

### Minimal Adoption (Safe for All)
1. Keep existing AI sync path (e.g., `useGame()` or `computeAiMove()`)
2. Add async variant alongside (e.g., `computeAiMoveAsync()`)
3. Document decision: "Sync path suitable for X×X boards"
4. Add tests validating both paths (30–40 min effort)

**Projects ready:**
- Snake (already has `aiService` with workers)
- Lights-out, Minesweeper (simple heuristics, no worker needed)
- Battleship, Farkle, Connect-four (have worker scaffolding)

### Advanced Adoption (Recommended)
1. Refactor AI into `src/app/aiEngine.ts` (consistent naming)
2. Implement three-tier decision tree
3. Move AI logic to domain layer (pure functions)
4. Benchmark on target devices (mobile, older machines)
5. Use async when board complexity changes

---

## 6. Common Patterns

### Pattern A: Fixed Complexity (Tic-Tac-Toe)
```typescript
// Complexity is known constant (3×3)
// Profiling shows: minimax always <1ms
// Decision: Always sync (no worker waste)

export const computeAiMove = (...): AiResult => {
  return { index: minimax(...), engine: 'wasm' }
}

export const computeAiMoveAsync = (...): Promise<AiResult> => {
  // For testing/documentation, but dispatch to sync for 3×3
  return computeAiMove(...)
}
```

### Pattern B: Variable Complexity (Checkers, Battleship)
```typescript
// Complexity depends on game state (board fill, pieces remaining, etc.)
// Profile: early game fast, endgame slow
// Decision: Use dynamic detection

const shouldUseAsync = (board: Board, gameState: GameState): boolean => {
  const emptyCells = board.filter(c => c === null).length
  const expectedTime = minimax(emptyCells) // heuristic
  return expectedTime > 10 // switch at 10ms
}

export const computeAiMove = (...): AiResult => {
  return { index: fastHeuristic(...), engine: 'js' }
}

export const computeAiMoveAsync = (...): Promise<AiResult> => {
  if (shouldUseAsync) {
    return workerCompute(...) // Full search tree
  }
  return computeAiMove(...) // Quick heuristic
}
```

### Pattern C: Always Async (Deep Learning, MCTS)
```typescript
// AI is inherently slow (neural net inference, MCTS sims)
// Sync path would always block
// Decision: Async required, sync fallback is degraded

export const computeAiMove = (...): AiResult => {
  return { index: randomMove(...), engine: 'js' } // Degenerate
}

export const computeAiMoveAsync = (...): Promise<AiResult> => {
  return workerCompute(...) // Real AI, must await
}
```

---

## 7. Testing Checklist

### For Every Project

- [ ] `computeAiMove` returns valid move for all difficulties
- [ ] `computeAiMoveAsync` returns valid move for all difficulties
- [ ] Sync completes in <100ms for expected use case
- [ ] Async completes in <500ms for expected use case
- [ ] Worker errors gracefully fall back to sync
- [ ] WASM and JS implementations produce same behavior
- [ ] No jank on main thread during async computation
- [ ] Performance is acceptable on target devices (profile!)

### Test Template
See `src/app/aiEngine.test.ts` in tictactoe for comprehensive suite.

---

## 8. Governance Rules (AGENTS.md Amendment)

Add to principal rules:

> **AI Orchestration Rule**
> 
> Every app project must implement both `computeAiMove` (sync) and `computeAiMoveAsync` (async):
> - Sync path must complete in <100ms
> - Async path must complete in <500ms
> - Both must produce identical results for deterministic AI
> - Random AI (easy mode) seed independently
> - All paths WASM-accelerated when feasible
> - Fallback chain: WASM → JS, never crash
> - Tests must validate both paths separately and equivalently

---

## 9. Migration Path (for existing projects)

### Week 1: Documentation
- [ ] Add architecture comment to `src/app/*Service.ts` or `useGame.ts`
- [ ] Create this governance file in `.github/instructions/`

### Week 2: Async Implementation
- [ ] Create `computeAiMoveAsync` that dispatches to worker
- [ ] Export from `src/app/index.ts`
- [ ] Verify worker loads without errors

### Week 3: Testing
- [ ] Add `*AI.test.ts` or `*AI.integration.test.ts`
- [ ] Verify both paths tested
- [ ] Run `pnpm check` and `pnpm test` locally

### Week 4: Review & Rollout
- [ ] Code review for architecture clarity
- [ ] Verify no performance regression
- [ ] Document in project README if AI is interesting

---

## 10. References

- [Web Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [WASM Performance Tips](https://developer.chrome.com/blog/wasm-high-performance/)
- [AssemblyScript Docs](https://www.assemblyscript.org)
- [React useCallback Docs](https://react.dev/reference/react/useCallback)

---

## Q&A

**Q: Why both sync and async if we always use one per game?**
A: Documentation, testability, and future-proofing. If game rules expand (larger board), code is ready without refactoring.

**Q: What if WASM fails to load?**
A: Falls back to JS minimax/heuristics. Always correct, sometimes slower. Platform availability is not critical.

**Q: How do I benchmark my AI?**
A: Use `performance.now()` in tests. Profile actual gameplay on target device (mobile is often the bottleneck).

**Q: Should I use worker for <10ms AI?**
A: No. Worker overhead (5–10ms startup + postMessage) exceeds computation time. Use sync.

**Q: Can I share worker across multiple games?**
A: Not recommended. Each game has different AI, board format, and message protocol. Pooling adds complexity for minimal benefit.
