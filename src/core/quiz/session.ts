import type { Answer, SessionResult, SessionMode } from '../../types/index.js';

export interface SessionState {
  mode: SessionMode;
  answers: Answer[];
  startedAt: number;
  timeAttackSec: number;
  /** タイムアタックの残時間 ms を返すコールバック */
  getRemainingMs: () => number;
  finished: boolean;
  streak: number;
  maxStreak: number;
}

export function createSession(mode: SessionMode, timeAttackSec: number): SessionState {
  const startedAt = performance.now();
  return {
    mode,
    answers: [],
    startedAt,
    timeAttackSec,
    getRemainingMs() {
      const elapsed = performance.now() - startedAt;
      return Math.max(0, timeAttackSec * 1000 - elapsed);
    },
    finished: false,
    streak: 0,
    maxStreak: 0,
  };
}

export function recordAnswer(state: SessionState, answer: Answer): void {
  state.answers.push(answer);
  if (answer.correct) {
    state.streak++;
    state.maxStreak = Math.max(state.maxStreak, state.streak);
  } else {
    if (state.mode === 'streak') state.finished = true;
    state.streak = 0;
  }
  if (state.mode === 'timeAttack' && state.getRemainingMs() <= 0) {
    state.finished = true;
  }
}

export function checkTimeUp(state: SessionState): void {
  if (state.mode === 'timeAttack' && state.getRemainingMs() <= 0) {
    state.finished = true;
  }
}

export function finalizeSession(state: SessionState): SessionResult {
  const correct = state.answers.filter(a => a.correct).length;
  const score = state.mode === 'streak' ? state.maxStreak : correct;
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    startedAt: Date.now() - (performance.now() - state.startedAt),
    mode: state.mode,
    answers: state.answers,
    score,
  };
}
