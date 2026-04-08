export const playPopSound = () => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.15);
};

export type SoundType = 'BROWN' | 'RAIN' | 'FOREST' | 'CHEW';

let whiteNoiseSource: AudioBufferSourceNode | null = null;
let audioCtx: AudioContext | null = null;

export const toggleWhiteNoise = (active: boolean, type: SoundType = 'BROWN') => {
  if (active) {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    if (type === 'BROWN') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'RAIN') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.1;
      }
    } else if (type === 'FOREST') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.sin(i * 0.01) * 0.05 + (Math.random() * 2 - 1) * 0.02;
      }
    } else if (type === 'CHEW') {
      for (let i = 0; i < bufferSize; i++) {
        const pulse = Math.sin(i * 0.001) > 0.9 ? 1 : 0;
        output[i] = pulse * (Math.random() * 2 - 1) * 0.2;
      }
    }

    whiteNoiseSource = audioCtx.createBufferSource();
    whiteNoiseSource.buffer = noiseBuffer;
    whiteNoiseSource.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'BROWN' ? 400 : 2000;

    const gain = audioCtx.createGain();
    gain.gain.value = 0.05;

    whiteNoiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    whiteNoiseSource.start();
  } else {
    if (whiteNoiseSource) {
      whiteNoiseSource.stop();
      whiteNoiseSource = null;
    }
  }
};
