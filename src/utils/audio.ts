// Synthesizes a subtle, pleasant notification chime using Web Audio API
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Friendly chime: F5 -> A5 -> C6 chord progression
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(698.46, now); // F5
    osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.1); // A5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.2); // C6

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch {
    // Audio context may be blocked by browser policy until user gesture
  }
}
