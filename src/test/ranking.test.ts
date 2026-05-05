import { describe, it, expect } from 'vitest';
import { buildRankingPayload } from '../core/ranking/rankingStore.js';
import type { SessionResult } from '../types/index.js';

const makeResult = (overrides: Partial<SessionResult> = {}): SessionResult => ({
  id: 'test-1',
  startedAt: 0,
  mode: 'untimed',
  score: 3,
  answers: [
    { pitch: { midi: 60, step: 'C', octave: 4, accidental: 'natural' }, correct: true,  ms: 800 },
    { pitch: { midi: 62, step: 'D', octave: 4, accidental: 'natural' }, correct: false, ms: 1200 },
    { pitch: { midi: 64, step: 'E', octave: 4, accidental: 'natural' }, correct: true,  ms: 600 },
    { pitch: { midi: 65, step: 'F', octave: 4, accidental: 'natural' }, correct: true,  ms: 700 },
  ],
  ...overrides,
});

describe('buildRankingPayload', () => {
  it('正解数・問題数・スコアを正しく集計する', () => {
    const payload = buildRankingPayload('TestUser', 'beginner', makeResult());
    expect(payload.nickname).toBe('TestUser');
    expect(payload.level).toBe('beginner');
    expect(payload.total).toBe(4);
    expect(payload.correct).toBe(3);
    expect(payload.score).toBe(3);
    expect(payload.mode).toBe('untimed');
  });

  it('全問不正解の場合 correct = 0', () => {
    const result = makeResult({
      score: 0,
      answers: [
        { pitch: { midi: 60, step: 'C', octave: 4, accidental: 'natural' }, correct: false, ms: 999 },
      ],
    });
    const payload = buildRankingPayload('Ghost', 'player', result);
    expect(payload.correct).toBe(0);
    expect(payload.total).toBe(1);
    expect(payload.level).toBe('player');
  });

  it('streak モードのスコアはそのまま score に入る', () => {
    const result = makeResult({ mode: 'streak', score: 15 });
    const payload = buildRankingPayload('Streaker', 'reader', result);
    expect(payload.score).toBe(15);
    expect(payload.mode).toBe('streak');
    expect(payload.level).toBe('reader');
  });
});
