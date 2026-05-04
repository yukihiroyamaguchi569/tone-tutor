import type { Pitch, Clef, UserSettings } from '../../types/index.js';
import type { NoteStat } from '../../types/index.js';
import { midiToPitch } from '../music/pitch.js';

export interface Question {
  pitch: Pitch;
  clef: Clef;
}

/** 重み付きランダム抽選 */
function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return items[i]!;
  }
  return items[items.length - 1]!;
}

export function generateQuestion(
  settings: UserSettings,
  perNote: NoteStat[],
  recentMidi: number[]
): Question {
  const clefs = settings.enabledClefs;
  const clef = clefs[Math.floor(Math.random() * clefs.length)]!;
  const range = settings.ranges[clef];

  // 直前の音から全音（±2半音）以内を除外
  const lastMidi = recentMidi.at(-1);
  const candidates: number[] = [];
  for (let m = range.minMidi; m <= range.maxMidi; m++) {
    if (lastMidi === undefined || Math.abs(m - lastMidi) > 2) candidates.push(m);
  }
  // 候補が空の場合は直前と同じ音だけ除く
  const pool = candidates.length > 0 ? candidates : (() => {
    const all: number[] = [];
    for (let m = range.minMidi; m <= range.maxMidi; m++) {
      if (m !== lastMidi) all.push(m);
    }
    return all.length > 0 ? all : [range.minMidi];
  })();

  const weights = pool.map(m => {
    const stat = perNote.find(s => s.midi === m && s.clef === clef);
    if (!stat || stat.total === 0) return 1.1;
    return 1 - stat.correct / stat.total + 0.1;
  });

  const midi = weightedPick(pool, weights);
  return { pitch: midiToPitch(midi), clef };
}
