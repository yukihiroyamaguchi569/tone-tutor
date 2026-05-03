import type { Clef, RangeConfig } from '../../types/index.js';

export interface ClefDef {
  id: Clef;
  label: string;
  vexClef: string;
  /** 加線なしの音域 (MIDI) */
  staffMinMidi: number;
  staffMaxMidi: number;
  /** デフォルト出題範囲 */
  defaultRange: { min: number; max: number };
}

export const CLEF_DEFS: Record<Clef, ClefDef> = {
  treble: {
    id: 'treble',
    label: 'ト音記号',
    vexClef: 'treble',
    staffMinMidi: 64, // E4
    staffMaxMidi: 81, // A5
    defaultRange: { min: 60, max: 84 }, // C4–C6
  },
  bass: {
    id: 'bass',
    label: 'ヘ音記号',
    vexClef: 'bass',
    staffMinMidi: 43, // G2
    staffMaxMidi: 60, // C4 (Middle C)
    defaultRange: { min: 36, max: 60 }, // C2–C4
  },
  alto: {
    id: 'alto',
    label: 'ハ音記号',
    vexClef: 'alto',
    staffMinMidi: 53, // F3
    staffMaxMidi: 70, // Bb4
    defaultRange: { min: 48, max: 72 }, // C3–C5
  },
};

export const ALL_CLEFS: Clef[] = ['treble', 'bass', 'alto'];

export function defaultRangeConfig(clef: Clef): RangeConfig {
  const def = CLEF_DEFS[clef];
  return {
    clef,
    minMidi: def.defaultRange.min,
    maxMidi: def.defaultRange.max,
  };
}
