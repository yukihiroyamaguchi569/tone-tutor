import { loadStats } from '../core/storage/statsStore.js';
import { loadSettings } from '../core/storage/settingsStore.js';
import { renderSessionChart, renderHeatmap } from '../core/render/chart.js';
import { navigate } from '../router.js';

export function ProgressPage(): HTMLElement {
  const page = document.createElement('div');
  page.className = 'page';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = '📊 進捗';

  const stats = loadStats();
  const settings = loadSettings();

  // セッション折れ線グラフ
  const chartSection = document.createElement('div');
  const chartLabel = document.createElement('p');
  chartLabel.className = 'label';
  chartLabel.textContent = '直近 20 セッション正答率';
  const chartWrap = document.createElement('div');
  chartWrap.className = 'chart-wrap card';
  chartWrap.appendChild(renderSessionChart(stats.sessions));
  chartSection.append(chartLabel, chartWrap);

  // サマリ
  const totalSessions = stats.sessions.length;
  const totalAnswers = stats.sessions.reduce((s, r) => s + r.answers.length, 0);
  const totalCorrect = stats.sessions.reduce((s, r) => s + r.answers.filter(a => a.correct).length, 0);
  const overallRate = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

  const summaryCard = document.createElement('div');
  summaryCard.className = 'card';
  summaryCard.style.cssText = 'display:flex;gap:24px;flex-wrap:wrap;';
  summaryCard.innerHTML = `
    <div><div style="font-size:1.6rem;font-weight:800">${totalSessions}</div><div class="label">セッション</div></div>
    <div><div style="font-size:1.6rem;font-weight:800">${totalAnswers}</div><div class="label">総問数</div></div>
    <div><div style="font-size:1.6rem;font-weight:800">${overallRate}%</div><div class="label">全体正答率</div></div>
  `;

  // 音別ヒートマップ
  const heatSection = document.createElement('div');
  const heatLabel = document.createElement('p');
  heatLabel.className = 'label';
  heatLabel.textContent = '音別正答率ヒートマップ';
  const heatWrap = document.createElement('div');
  heatWrap.className = 'chart-wrap card';
  heatWrap.appendChild(renderHeatmap(stats.perNote, settings.notation));
  heatSection.append(heatLabel, heatWrap);

  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-secondary';
  backBtn.textContent = '← 戻る';
  backBtn.addEventListener('click', () => navigate('/home'));

  page.append(title, summaryCard, chartSection, heatSection, backBtn);
  return page;
}
