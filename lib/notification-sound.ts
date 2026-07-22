/**
 * Play a notification chime via the Web Audio API (no asset required).
 *
 * @param long  when the admin tab is hidden/inactive, plays a longer, more
 *              attention-grabbing pattern (delivery-app style). AudioContext is
 *              scheduled up-front so it still plays reliably in a backgrounded
 *              (but not fully closed) tab.
 */
export function playNotificationSound(long = false): void {
  try {
    if (typeof window === "undefined" || typeof AudioContext === "undefined") {
      return;
    }
    const ctx = new AudioContext();
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

    const totalMs = (pattern.length * step + 0.3) * 1000;
    window.setTimeout(() => void ctx.close(), totalMs);
  } catch {
    // audio unavailable — ignore
  }
}
