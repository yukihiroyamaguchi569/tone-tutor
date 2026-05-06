import { createClient } from '@supabase/supabase-js';
import type { SessionResult, SessionMode } from '../../types/index.js';

/** ユーザーの楽器・読譜経験レベル */
export type ExperienceLevel = 'reader' | 'player' | 'beginner';

/** ランキング表示用のレベル定義一覧 */
export const LEVELS: { key: ExperienceLevel; label: string }[] = [
  { key: 'reader',   label: '音符が読める' },
  { key: 'player',   label: '楽器経験あり' },
  { key: 'beginner', label: '楽器経験なし' },
];

/** Supabase rankings テーブルの1行 */
export interface RankingRow {
  id: string;
  nickname: string;
  score: number;
  mode: SessionMode;
  level: ExperienceLevel;
  total: number;
  correct: number;
  created_at: string;
}

let _client: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (!_client) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase 環境変数が未設定です (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
    _client = createClient(url, key);
  }
  return _client;
}

/**
 * セッション結果から rankings テーブルへの INSERT ペイロードを組み立てる。
 * @param nickname 表示名（1〜20文字）
 * @param level ユーザーの経験レベル
 * @param result 完了したセッションの結果
 */
export function buildRankingPayload(nickname: string, level: ExperienceLevel, result: SessionResult) {
  const correct = result.answers.filter(a => a.correct).length;
  return {
    nickname,
    level,
    score: result.score,
    mode: result.mode,
    total: result.answers.length,
    correct,
  };
}

/**
 * スコアを Supabase rankings テーブルに登録する。
 * @throws ニックネームが範囲外、または DB エラーの場合
 */
export async function submitRanking(nickname: string, level: ExperienceLevel, result: SessionResult): Promise<void> {
  const trimmed = nickname.trim();
  if (trimmed.length === 0 || trimmed.length > 20) throw new Error('ニックネームは1〜20文字で入力してください');
  nickname = trimmed;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await getClient().from('rankings').insert(buildRankingPayload(nickname, level, result) as any);
  if (error) throw new Error(error.message);
}

/**
 * 指定モード・レベルの上位ランキングを取得する。
 * @param mode セッションモード
 * @param level 経験レベル
 * @param limit 取得件数（デフォルト 20）
 */
export async function fetchTopRankings(mode: SessionMode, level: ExperienceLevel, limit = 20): Promise<RankingRow[]> {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const { data, error } = await getClient()
    .from('rankings')
    .select('*')
    .eq('mode', mode)
    .eq('level', level)
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(safeLimit);
  if (error) throw new Error(error.message);
  return (data ?? []) as RankingRow[];
}
