import type { Pitch, NoteName, Accidental } from '../../types/index.js';

const NOTE_NAMES: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const SOLFEGE: Record<string, string> = {
  C: 'ド', D: 'レ', E: 'ミ', F: 'ファ', G: 'ソ', A: 'ラ', B: 'シ',
  'C#': 'ド♯', 'D#': 'レ♯', 'F#': 'ファ♯', 'G#': 'ソ♯', 'A#': 'ラ♯',
  'Db': 'レ♭', 'Eb': 'ミ♭', 'Gb': 'ソ♭', 'Ab': 'ラ♭', 'Bb': 'シ♭',
};

// MIDI 音番号内の半音位置 → (step, accidental)
// 自然音優先（#なし表記）
const MIDI_MOD_TO_PITCH: Array<{ step: NoteName; accidental: Accidental }> = [
  { step: 'C', accidental: 'natural' },  // 0
  { step: 'C', accidental: 'sharp' },    // 1
  { step: 'D', accidental: 'natural' },  // 2
  { step: 'D', accidental: 'sharp' },    // 3
  { step: 'E', accidental: 'natural' },  // 4
  { step: 'F', accidental: 'natural' },  // 5
  { step: 'F', accidental: 'sharp' },    // 6
  { step: 'G', accidental: 'natural' },  // 7
  { step: 'G', accidental: 'sharp' },    // 8
  { step: 'A', accidental: 'natural' },  // 9
  { step: 'A', accidental: 'sharp' },    // 10
  { step: 'B', accidental: 'natural' },  // 11
];

export function midiToPitch(midi: number): Pitch {
  const mod = ((midi % 12) + 12) % 12;
  const { step, accidental } = MIDI_MOD_TO_PITCH[mod]!;
  const octave = Math.floor(midi / 12) - 1;
  return { midi, step, octave, accidental };
}

export function pitchToMidi(step: NoteName, octave: number, accidental: Accidental = 'natural'): number {
  const base = NOTE_NAMES.indexOf(step);
  // 各音の自然音半音値
  const semitones = [0, 2, 4, 5, 7, 9, 11];
  const mod = semitones[base]! + (accidental === 'sharp' ? 1 : accidental === 'flat' ? -1 : 0);
  return (octave + 1) * 12 + mod;
}

export function isNatural(midi: number): boolean {
  const mod = ((midi % 12) + 12) % 12;
  return MIDI_MOD_TO_PITCH[mod]!.accidental === 'natural';
}

/** 音名の表示文字列を返す (notation: 'letter' | 'solfege') */
export function displayName(pitch: Pitch, notation: 'letter' | 'solfege'): string {
  if (notation === 'letter') {
    const acc = pitch.accidental === 'sharp' ? '#' : pitch.accidental === 'flat' ? '♭' : '';
    return `${pitch.step}${acc}`;
  }
  const key = pitch.accidental === 'natural'
    ? pitch.step
    : pitch.accidental === 'sharp'
      ? `${pitch.step}#`
      : `${pitch.step}b`;
  return SOLFEGE[key] ?? pitch.step;
}

/**
 * VexFlow の音符キーを返す ("C#/4" 形式)
 * treble の場合: C4 = Middle C
 */
export function toVexKey(pitch: Pitch): string {
  const acc = pitch.accidental === 'sharp' ? '#' : pitch.accidental === 'flat' ? 'b' : '';
  return `${pitch.step.toLowerCase()}${acc}/${pitch.octave}`;
}
