// Lightweight WebAudio helper for UI sounds
export const playClick = (() => {
  let ctx: AudioContext | null = null;
  const ensure = () => { if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); return ctx; };

  return (volume = 0.15, frequency = 520) => {
    const c = ensure();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = frequency;
    g.gain.value = volume;
    o.connect(g);
    g.connect(c.destination);
    o.start();
    const now = c.currentTime;
    g.gain.setValueAtTime(volume, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    o.stop(now + 0.13);
  };
})();

export const playSuccess = (() => {
  let ctx: AudioContext | null = null;
  const ensure = () => { if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); return ctx; };
  return () => {
    const c = ensure();
    const now = c.currentTime;
    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    const g = c.createGain();
    o1.type = 'sine'; o2.type = 'sine';
    o1.frequency.value = 520; o2.frequency.value = 660;
    g.gain.value = 0.12;
    o1.connect(g); o2.connect(g); g.connect(c.destination);
    o1.start(now); o2.start(now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    o1.stop(now + 0.3); o2.stop(now + 0.3);
  };
})();

export default { playClick, playSuccess };
