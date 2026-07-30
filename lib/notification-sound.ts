/**
 * Play a notification chime via the Web Audio API (no asset required).
 *
 * Browsers only let audio actually play once the page has received a user
 * gesture (click/keydown/touch) — an AudioContext created before that stays
 * "suspended" and produces no sound even though nothing throws. We keep one
 * shared AudioContext (instead of a fresh one per call, whose "suspended"
 * state a bare .resume() can't reliably clear without a gesture) and
 * prime/resume it on the very first interaction anywhere on the admin page
 * (see primeAudio(), wired up in AdminRealtime) — so a chime for an order
 * that arrives before the admin has clicked anything still has the best
 * chance of actually being audible.
 *
 * @param long  when the admin tab is hidden/inactive, plays a longer, more
 *              attention-grabbing pattern (delivery-app style).
 */
let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined" || typeof AudioContext === "undefined") {
    return null;
  }
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioContext();
  }
  return sharedCtx;
}

/** Call on the page's first user interaction to unlock audio ahead of time. */
export function primeAudio(): void {
  try {
    void getContext()?.resume();
  } catch {
    // ignore — best-effort only
  }
}

export function playNotificationSound(long = false): void {
  try {
    const ctx = getContext();
    if (!ctx) return;
    void ctx.resume();
    const now = ctx.currentTime;

    const pattern = long
      ? [880, 1320, 880, 1320, 880, 1320, 1760, 1320, 880, 1320]
      : [880, 1320];
    const step = long ? 0.28 : 0.12;
    const peak = long ? 0.18 : 0.12;

    pattern.forEach((freq, i) => {
      const t = now + i * step;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(peak, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + step * 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + step);
    });
  } catch {
    // audio unavailable — ignore
  }
}
