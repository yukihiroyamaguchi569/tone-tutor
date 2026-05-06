import type { SessionMode } from '../types/index.js';
import { navigate } from '../router.js';
import { fetchTopRankings, LEVELS, type ExperienceLevel, type RankingRow } from '../core/ranking/rankingStore.js';

const MODES: { key: SessionMode; label: string }[] = [
  { key: 'timeAttack', label: 'タイムアタック' },
  { key: 'streak',     label: '連続正解' },
  { key: 'untimed',    label: '通常' },
];

/** モード × 経験レベル別のスコアランキングを表示するページ */
export function RankingPage(): HTMLElement {
  const page = document.createElement('div');
  page.className = 'page';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = '🏆 ランキング';

  // レベル行
  const levelRow = document.createElement('div');
  levelRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';

  // モード行
  const modeRow = document.createElement('div');
  modeRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;';

  const tableArea = document.createElement('div');

  let currentMode: SessionMode = 'timeAttack';
  const savedLevel = localStorage.getItem('tt:level');
  let currentLevel: ExperienceLevel = LEVELS.some(l => l.key === savedLevel) ? (savedLevel as ExperienceLevel) : 'beginner';

  function renderTable(rows: RankingRow[]): void {
    tableArea.innerHTML = '';
    if (rows.length === 0) {
      const msg = document.createElement('p');
      msg.style.cssText = 'color:var(--text-2);text-align:center;padding:24px;';
      msg.textContent = 'まだ記録がありません。';
      tableArea.appendChild(msg);
      return;
    }

    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;font-size:0.9rem;';
    table.innerHTML = `
      <thead>
        <tr style="border-bottom:2px solid var(--border,#e2e8f0);">
          <th style="text-align:left;padding:8px 6px;width:2.5em;">#</th>
          <th style="text-align:left;padding:8px 6px;">名前</th>
          <th style="text-align:right;padding:8px 6px;">スコア</th>
          <th style="text-align:right;padding:8px 6px;font-size:0.8rem;color:var(--text-2);">正答率</th>
          <th style="text-align:right;padding:8px 6px;font-size:0.8rem;color:var(--text-2);">日付</th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    rows.forEach((row, i) => {
      const rate = row.total > 0 ? Math.round((row.correct / row.total) * 100) + '%' : '—';
      const date = new Date(row.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
      const tr = document.createElement('tr');
      tr.style.cssText = 'border-bottom:1px solid var(--border,#e2e8f0);';
      tr.innerHTML = `
        <td style="padding:8px 6px;color:var(--text-2);">${i + 1}</td>
        <td style="padding:8px 6px;font-weight:${i < 3 ? '600' : '400'};"></td>
        <td style="padding:8px 6px;text-align:right;font-weight:700;">${row.score}</td>
        <td style="padding:8px 6px;text-align:right;color:var(--text-2);">${rate}</td>
        <td style="padding:8px 6px;text-align:right;color:var(--text-2);font-size:0.8rem;">${date}</td>
      `;
      tr.querySelectorAll('td')[1]!.textContent = row.nickname;
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableArea.appendChild(table);
  }

  let loadGen = 0;
  async function load(): Promise<void> {
    const gen = ++loadGen;
    tableArea.innerHTML = '<p style="text-align:center;padding:24px;color:var(--text-2);">読み込み中…</p>';
    try {
      const rows = await fetchTopRankings(currentMode, currentLevel);
      if (gen !== loadGen) return;
      renderTable(rows);
    } catch {
      if (gen !== loadGen) return;
      tableArea.innerHTML = '<p style="text-align:center;padding:24px;color:#ef4444;">取得に失敗しました。Supabase の設定を確認してください。</p>';
    }
  }

  function setActive(row: HTMLElement, activeBtn: HTMLButtonElement): void {
    row.querySelectorAll('button').forEach(b => {
      b.className = 'btn btn-secondary';
    });
    activeBtn.className = 'btn btn-primary';
  }

  LEVELS.forEach(({ key, label }) => {
    const btn = document.createElement('button');
    btn.className = currentLevel === key ? 'btn btn-primary' : 'btn btn-secondary';
    btn.textContent = label;
    btn.style.cssText = 'font-size:0.85rem;';
    btn.addEventListener('click', () => {
      currentLevel = key;
      localStorage.setItem('tt:level', key);
      setActive(levelRow, btn);
      load();
    });
    levelRow.appendChild(btn);
  });

  MODES.forEach(({ key, label }) => {
    const btn = document.createElement('button');
    btn.className = key === 'timeAttack' ? 'btn btn-primary' : 'btn btn-secondary';
    btn.textContent = label;
    btn.style.cssText = 'font-size:0.85rem;';
    btn.addEventListener('click', () => {
      currentMode = key;
      setActive(modeRow, btn);
      load();
    });
    modeRow.appendChild(btn);
  });

  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-secondary';
  backBtn.textContent = '← ホーム';
  backBtn.style.cssText = 'margin-top:8px;';
  backBtn.addEventListener('click', () => navigate('/home'));

  page.append(title, levelRow, modeRow, tableArea, backBtn);

  load();

  return page;
}
