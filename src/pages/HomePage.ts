import { navigate } from '../router.js';
import { loadSettings } from '../core/storage/settingsStore.js';
import { loadLastWrong, loadStats } from '../core/storage/statsStore.js';
import { calcRank } from '../core/quiz/rank.js';

export function HomePage(): HTMLElement {
  const page = document.createElement('div');
  page.className = 'page';

  const hero = document.createElement('div');
  hero.style.cssText = 'display:flex;flex-direction:column;gap:4px;';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.style.cssText = 'font-size:2.6rem;';
  title.textContent = 'Tone Tutor';

  const subtitle = document.createElement('p');
  subtitle.style.cssText = 'color:var(--text-2);font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;font-weight:500;';
  subtitle.textContent = '楽譜読譜トレーナー';

  hero.append(title, subtitle);

  const stats = loadStats();
  const rank = calcRank(stats.sessions);

  const rankCard = document.createElement('div');
  rankCard.className = 'card rank-card';
  rankCard.title = '直近10セッションの正答率×速度スコアで算出';
  rankCard.innerHTML = `
    <div class="rank-name">${rank.name}</div>
    <div class="rank-details">
      <span>スコア <strong>${rank.score.toFixed(1)}</strong></span>
      <span>正答率 <strong>${rank.rate > 0 ? Math.round(rank.rate * 100) : '—'}%</strong></span>
      <span>avgMs <strong>${rank.avgMs > 0 ? Math.round(rank.avgMs) : '—'}</strong></span>
    </div>
  `;

  const settings = loadSettings();
  const modeLabel = { timeAttack: 'タイムアタック', streak: '連続正解', untimed: '通常' }[settings.mode];
  const clefLabel = settings.enabledClefs
    .map(c => ({ treble: 'ト音', bass: 'ヘ音', alto: 'ハ音' }[c]))
    .join('・');

  const infoCard = document.createElement('div');
  infoCard.className = 'card';
  infoCard.style.cssText = 'display:flex;gap:20px;flex-wrap:wrap;font-size:0.88rem;align-items:center;';
  infoCard.innerHTML = `
    <span style="color:var(--text-2)">🎼 <span style="color:var(--text);font-weight:600">${clefLabel}記号</span></span>
    <span style="color:var(--text-2)">⚡ <span style="color:var(--text);font-weight:600">${modeLabel}</span></span>
    <span style="color:var(--text-2)">📝 <span style="color:var(--text);font-weight:600">${settings.notation === 'solfege' ? 'ドレミ' : 'CDE'}</span></span>
  `;

  const grid = document.createElement('div');
  grid.className = 'home-grid';

  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn-primary btn-full';
  startBtn.innerHTML = '▶ 練習開始';
  startBtn.addEventListener('click', () => {
    sessionStorage.removeItem('tt:lastResult');
    navigate('/practice');
  });

  const hasWrong = loadLastWrong().length > 0;
  const reviewBtn = document.createElement('button');
  reviewBtn.className = 'btn btn-secondary btn-full';
  reviewBtn.innerHTML = '🔁 誤答復習';
  reviewBtn.disabled = !hasWrong;
  reviewBtn.style.opacity = hasWrong ? '1' : '0.5';
  reviewBtn.addEventListener('click', () => navigate('/practice?review=1'));

  const progressBtn = document.createElement('button');
  progressBtn.className = 'btn btn-secondary btn-full';
  progressBtn.innerHTML = '📊 進捗';
  progressBtn.addEventListener('click', () => navigate('/progress'));

  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'btn btn-secondary btn-full';
  settingsBtn.innerHTML = '⚙️ 設定';
  settingsBtn.addEventListener('click', () => navigate('/settings'));

  const chartTreble = document.createElement('button');
  chartTreble.className = 'btn btn-secondary btn-full';
  chartTreble.innerHTML = '📖 参照チャート';
  chartTreble.addEventListener('click', () => navigate('/chart/treble'));

  grid.append(startBtn, reviewBtn, progressBtn, settingsBtn, chartTreble);

  page.append(hero, rankCard, infoCard, grid);
  return page;
}
