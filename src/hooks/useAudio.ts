import { useRef, useCallback } from 'react';
import * as Tone from 'tone';

export function useAudio() {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const noiseRef = useRef<Tone.NoiseSynth | null>(null);
  const metalRef = useRef<Tone.MetalSynth | null>(null);
  const initialized = useRef(false);

  const init = useCallback(async () => {
    if (initialized.current) return;
    await Tone.start();

    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.5 },
      volume: -20,
    }).toDestination();

    noiseRef.current = new Tone.NoiseSynth({
      noise: { type: 'brown' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
      volume: -25,
    }).toDestination();

    metalRef.current = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.2, release: 0.1 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
      volume: -18,
    }).toDestination();

    initialized.current = true;
  }, []);

  const playWritingSound = useCallback(() => {
    if (!initialized.current || !noiseRef.current) return;
    noiseRef.current.triggerAttackRelease('16n');
  }, []);

  const playShredSound = useCallback(() => {
    if (!initialized.current || !metalRef.current) return;
    metalRef.current.triggerAttackRelease('C2', '8n');
    // Layer tearing sound
    const tearSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.2 },
      volume: -12,
    }).toDestination();
    tearSynth.triggerAttackRelease('4n');
  }, []);

  const playReleaseSound = useCallback(() => {
    if (!initialized.current || !synthRef.current) return;
    // Ethereal ascending chord
    const now = Tone.now();
    synthRef.current.triggerAttackRelease(['C4', 'E4', 'G4', 'B4'], '2n', now);
    synthRef.current.triggerAttackRelease(['E4', 'G4', 'B4', 'D5'], '2n', now + 0.3);
    synthRef.current.triggerAttackRelease(['G4', 'B4', 'D5', 'F#5'], '1n', now + 0.6);

    // Wind sound
    const wind = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 1, decay: 2, sustain: 0.3, release: 3 },
      volume: -22,
    }).toDestination();
    wind.triggerAttackRelease('2n', now + 0.5);
  }, []);

  const playSparkSound = useCallback(() => {
    if (!initialized.current || !metalRef.current) return;
    metalRef.current.triggerAttackRelease('C3', '32n');
  }, []);

  const playHoverSound = useCallback(() => {
    if (!initialized.current || !synthRef.current) return;
    synthRef.current.triggerAttackRelease(['C5'], '64n', Tone.now(), 0.05);
  }, []);

  return {
    init,
    playWritingSound,
    playShredSound,
    playReleaseSound,
    playSparkSound,
    playHoverSound,
  };
}
