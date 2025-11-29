// Simple synthesizer for game sounds to avoid external asset dependencies

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

export const playSuccessSound = () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
  oscillator.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.1); // C6

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.3);
  
  // Little "ding" harmony
  setTimeout(() => {
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
    gain2.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc2.start();
    osc2.stop(audioCtx.currentTime + 0.4);
  }, 100);
};

export const playErrorSound = () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
  oscillator.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.3);
};

export const playWinMusic = () => {
   if (audioCtx.state === 'suspended') audioCtx.resume();
   // Just a small fanfare sequence
   const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
   notes.forEach((freq, index) => {
     setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
     }, index * 150);
   });
}