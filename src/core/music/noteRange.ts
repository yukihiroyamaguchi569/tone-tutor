import type { Pitch } from '../../types/index.js';
import { midiToPitch, isNatural } from './pitch.js';

/** 範囲内の自然音 MIDI 番号の配列を返す (半音は含まない) */
export function naturalMidiInRange(minMidi: number, maxMidi: number): number[] {
  const result: number[] = [];
  for (let m = minMidi; m <= maxMidi; m++) {
    if (isNatural(m)) result.push(m);
  }
  return result;
}

/** 範囲内の全音 MIDI 番号 (半音含む) */
export function allMidiInRange(minMidi: number, maxMidi: number): number[] {
  const result: number[] = [];
  for (let m = minMidi; m <= maxMidi; m++) result.push(m);
  return result;
}

export function midiListToPitches(midis: number[]): Pitch[] {
  return midis.map(midiToPitch);
}
