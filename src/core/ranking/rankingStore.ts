import { createClient } from '@supabase/supabase-js';
import type { SessionResult, SessionMode } from '../../types/index.js';

export type ExperienceLevel = 'reader' | 'player' | 'beginner';

export const LEVELS: { key: ExperienceLevel; label: string }[] = [
  { key: 'reader',   label: '音符が読める' },
  { key: 'player',   label: '楽器経験あり' },
  { key: 'beginner', label: '楽器経験なし' },
];

export interface RankingRow {
  id: string;
  nickname: string;
  score: number;
  mode: string;
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

export async function submitRanking(nickname: string, level: ExperienceLevel, result: SessionResult): Promise<void> {
  if (nickname.length === 0 || nickname.length > 20) throw new Error('ニックネームは1〜20文字で入力してください');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await getClient().from('rankings').insert(buildRankingPayload(nickname, level, result) as any);
  if (error) throw new Error(error.message);
}

export async function fetchTopRankings(mode: SessionMode, level: ExperienceLevel, limit = 20): Promise<RankingRow[]> {
  const { data, error } = await getClient()
    .from('rankings')
    .select('*')
    .eq('mode', mode)
    .eq('level', level)
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as RankingRow[];
}
