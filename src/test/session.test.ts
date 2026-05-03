import { describe, it, expect } from 'vitest';
import { createSession, recordAnswer, finalizeSession } from '../core/quiz/session.js';
import { midiToPitch } from '../core/music/pitch.js';

function makeAnswer(correct: boolean, ms = 500) {
  return { pitch: midiToPitch(60), correct, ms };
}

describe('session (timeAttack)', () => {
  it('初期状態は finished=false', () => {
    const s = createSession('timeAttack', 60);
    expect(s.finished).toBe(false);
  });

  it('getRemainingMs は 60 秒以下', () => {
    const s = createSession('timeAttack', 60);
    expect(s.getRemainingMs()).toBeLessThanOrEqual(60_000);
    expect(s.getRemainingMs()).toBeGreaterThan(0);
  });

  it('正解で streak が増える', () => {
    const s = createSession('timeAttack', 60);
    recordAnswer(s, makeAnswer(true));
    expect(s.streak).toBe(1);
    recordAnswer(s, makeAnswer(true));
    expect(s.streak).toBe(2);
  });

  it('誤答で streak がリセットされる', () => {
    const s = createSession('timeAttack', 60);
    recordAnswer(s, makeAnswer(true));
    recordAnswer(s, makeAnswer(false));
    expect(s.streak).toBe(0);
  });

  it('finalizeSession でスコアは正解数', () => {
    const s = createSession('timeAttack', 60);
    recordAnswer(s, makeAnswer(true));
    recordAnswer(s, makeAnswer(false));
    recordAnswer(s, makeAnswer(true));
    const result = finalizeSession(s);
    expect(result.score).toBe(2);
    expect(result.answers).toHaveLength(3);
  });
});

describe('session (streak)', () => {
  it('誤答で finished になる', () => {
    const s = createSession('streak', 60);
    recordAnswer(s, makeAnswer(true));
    expect(s.finished).toBe(false);
    recordAnswer(s, makeAnswer(false));
    expect(s.finished).toBe(true);
  });

  it('finalizeSession でスコアは最大連続数', () => {
    const s = createSession('streak', 60);
    recordAnswer(s, makeAnswer(true));
    recordAnswer(s, makeAnswer(true));
    recordAnswer(s, makeAnswer(true));
    recordAnswer(s, makeAnswer(false));
    const result = finalizeSession(s);
    expect(result.score).toBe(3);
  });
});
