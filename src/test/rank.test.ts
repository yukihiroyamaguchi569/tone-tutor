import { describe, it, expect } from 'vitest';
import { calcRank, RANKS } from '../core/quiz/rank.js';
import type { SessionResult } from '../types/index.js';
import { midiToPitch } from '../core/music/pitch.js';

function makeSession(answers: { correct: boolean; ms: number }[]): SessionResult {
  return {
    id: 'test',
    startedAt: Date.now(),
    mode: 'untimed',
    answers: answers.map(a => ({ pitch: midiToPitch(60), ...a })),
    score: answers.filter(a => a.correct).length,
  };
}

describe('calcRank', () => {
  it('セッションなしは見習い / score 0', () => {
    const r = calcRank([]);
    expect(r.name).toBe('見習い');
    expect(r.score).toBe(0);
    expect(r.index).toBe(0);
  });

  it('全問正解 + avgMs 500ms → 皆伝', () => {
    const session = makeSession(Array.from({ length: 20 }, () => ({ correct: true, ms: 500 })));
    const r = calcRank([session]);
    expect(r.name).toBe('皆伝');
    expect(r.index).toBe(RANKS.length - 1);
  });

  it('正答率 50% + avgMs 2400ms → 見習い', () => {
    const answers = [
      ...Array.from({ length: 5 }, () => ({ correct: true,  ms: 2400 })),
      ...Array.from({ length: 5 }, () => ({ correct: false, ms: 2400 })),
    ];
    const r = calcRank([makeSession(answers)]);
    // rate=0.5, speedFactor= clamp(1.5-(2400-600)/2400) = clamp(0.75) = 0.75
    // score = 50 * 0.75 = 37.5 → 見習い (<40)
    expect(r.name).toBe('見習い');
  });

  it('直近10件のみ使う（11件目以降は無視）', () => {
    const bad = makeSession(Array.from({ length: 30 }, () => ({ correct: false, ms: 5000 })));
    const good = makeSession(Array.from({ length: 30 }, () => ({ correct: true, ms: 500 })));
    // 11 件: bad が11番目以降、good が直近10件 → 皆伝
    const sessions = [...Array(10).fill(good), bad];
    const r = calcRank(sessions);
    expect(r.name).toBe('皆伝');
  });

  it('rate と avgMs が正しく返る', () => {
    const answers = [
      { correct: true, ms: 1000 },
      { correct: true, ms: 2000 },
      { correct: false, ms: 3000 },
    ];
    const r = calcRank([makeSession(answers)]);
    expect(r.rate).toBeCloseTo(2 / 3);
    expect(r.avgMs).toBeCloseTo(2000);
  });
});
