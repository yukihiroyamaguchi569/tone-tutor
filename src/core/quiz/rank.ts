import type { SessionResult } from '../../types/index.js';

const PREV_KEY = 'tt:rank:prev:v1';

/**
 * 段位テーブル。`min` は段位スコアの下限値で、昇順に並ぶ。
 * `calcRank` で算出したスコアを上から照合して所属段位を決定する。
 */
export const RANKS = [
  { name: '見習い', min: 0 },
  { name: '初伝',   min: 40 },
  { name: '中伝',   min: 65 },
  { name: '奥伝',   min: 90 },
  { name: '皆伝',   min: 115 },
] as const;

/**
 * `calcRank` の戻り値。UI 表示用に段位名・index・スコア・正答率・平均応答時間を含む。
 */
export interface RankResult {
  name: string;
  index: number;
  score: number;
  rate: number;
  avgMs: number;
}

/**
 * 直近10セッションの全 Answer から段位スコアを算出し、所属段位を返す。
 *
 * 段位スコア = 正答率(%) × clamp(1.5 - (avgMs - 600) / 2400, 0.5, 1.5)
 *
 * - avgMs 600ms で速度係数 1.5（commit 後の 300ms 強制ウェイトを差し引いた反射域）
 * - avgMs 3000ms で速度係数 0.5（choices 入力での初学者域上限）
 *
 * セッションが空の場合は最下位段位（見習い）をスコア 0 で返す。
 *
 * @param sessions 新しい順で渡されるセッション履歴（先頭10件のみ使用）
 */
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

/**
 * 前回保存した段位 index を localStorage から取得する。
 * 未保存・読み出し失敗時は `-1` を返し、初回判定では昇段バナーを抑止する。
 */
export function getPreviousRankIndex(): number {
  try {
    const raw = localStorage.getItem(PREV_KEY);
    if (raw === null) return -1;
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed >= RANKS.length) return -1;
    return parsed;
  } catch {
    return -1;
  }
}

/**
 * 現在の段位 index を localStorage に保存する。
 * 次回 ResultPage で前回値と比較し、index が上昇していれば昇段バナーを表示する。
 */
export function setPreviousRankIndex(index: number): void {
  try {
    localStorage.setItem(PREV_KEY, String(index));
  } catch { /* ignore */ }
}
