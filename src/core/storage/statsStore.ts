import type { ProgressData, SessionResult, NoteStat, Answer, Clef } from '../../types/index.js';

const STATS_KEY = 'tt:stats:v1';
const WRONG_KEY = 'tt:lastWrong:v1';
const MAX_SESSIONS = 50;

export function loadStats(): ProgressData {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { sessions: [], perNote: [] };
    return JSON.parse(raw) as ProgressData;
  } catch {
    return { sessions: [], perNote: [] };
  }
}

export function saveSession(result: SessionResult, clef: Clef): void {
  const data = loadStats();

  // セッション追加 + trim
  data.sessions = [result, ...data.sessions].slice(0, MAX_SESSIONS);

  // perNote 更新
  for (const ans of result.answers) {
    updateNoteStat(data.perNote, ans, clef);
  }

  // 誤答保存
  const wrong = result.answers.filter(a => !a.correct).map(a => a.pitch.midi);
  localStorage.setItem(WRONG_KEY, JSON.stringify(wrong));

  localStorage.setItem(STATS_KEY, JSON.stringify(data));
}

function updateNoteStat(perNote: NoteStat[], ans: Answer, clef: Clef): void {
  let stat = perNote.find(s => s.midi === ans.pitch.midi && s.clef === clef);
  if (!stat) {
    stat = { midi: ans.pitch.midi, clef, correct: 0, total: 0, avgMs: 0 };
    perNote.push(stat);
  }
  stat.total++;
  if (ans.correct) stat.correct++;
  stat.avgMs = (stat.avgMs * (stat.total - 1) + ans.ms) / stat.total;
}

export function loadLastWrong(): number[] {
  try {
    const raw = localStorage.getItem(WRONG_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}
