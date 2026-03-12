/**
 * Web Audio API sound synthesis — SFX generated programmatically.
 * No external audio files needed.
 */

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3): void {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const vol = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  vol.gain.setValueAtTime(gain, ctx.currentTime)
  vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(vol)
  vol.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}

export function playSelect(): void {
  playTone(880, 0.08, 'sine', 0.15)
}

export function playConfirm(): void {
  playTone(523, 0.1, 'triangle', 0.2)
  setTimeout(() => playTone(659, 0.1, 'triangle', 0.2), 80)
}

export function playCpuMove(): void {
  playTone(330, 0.15, 'square', 0.1)
}

export function playWin(): void {
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.2), i * 120)
  })
}

export function playLose(): void {
  playTone(294, 0.3, 'sawtooth', 0.15)
  setTimeout(() => playTone(247, 0.4, 'sawtooth', 0.12), 200)
}

export function playClick(): void {
  playTone(1200, 0.04, 'sine', 0.1)
}
