import type { SessionResult } from '../../types/index.js';

const PREV_KEY = 'tt:rank:prev:v1';

export const RANKS = [
  { name: '見習い', min: 0 },
  { name: '初伝',   min: 40 },
  { name: '中伝',   min: 65 },
  { name: '奥伝',   min: 90 },
  { name: '皆伝',   min: 115 },
] as const;

export interface RankResult {
  name: string;
  index: number;
  score: number;
  rate: number;
  avgMs: number;
}

export function calcRank(sessions: SessionResult[]): RankResult {
  const recent = sessions.slice(0, 10);
  const answers = recent.flatMap(s => s.answers);

  if (answers.length === 0) {
    return { name: RANKS[0].name, index: 0, score: 0, rate: 0, avgMs: 0 };
  }

  const correct = answers.filter(a => a.correct).length;
  const rate = correct / answers.length;
  const avgMs = answers.reduce((s, a) => s + a.ms, 0) / answers.length;

  const speedFactor = Math.max(0.5, Math.min(1.5, 1.5 - (avgMs - 600) / 2400));
  const score = rate * 100 * speedFactor;

  let index = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (score >= RANKS[i].min) { index = i; break; }
  }

  return { name: RANKS[index].name, index, score, rate, avgMs };
}

export function getPreviousRankIndex(): number {
  try {
    const raw = localStorage.getItem(PREV_KEY);
    return raw !== null ? Number(raw) : -1;
  } catch {
    return -1;
  }
}

export function setPreviousRankIndex(index: number): void {
  try {
    localStorage.setItem(PREV_KEY, String(index));
  } catch { /* ignore */ }
}
