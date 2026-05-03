import { navigate } from '../router.js';
import { loadSettings } from '../core/storage/settingsStore.js';
import { loadLastWrong } from '../core/storage/statsStore.js';

export function HomePage(): HTMLElement {
  const page = document.createElement('div');
  page.className = 'page';

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = '🎵 Tone Tutor';

  const subtitle = document.createElement('p');
  subtitle.style.cssText = 'color:#64748b;font-size:0.95rem;';
  subtitle.textContent = '楽譜読譜トレーナー';

  const settings = loadSettings();
  const modeLabel = { timeAttack: 'タイムアタック', streak: '連続正解', untimed: '通常' }[settings.mode];
  const clefLabel = settings.enabledClefs
    .map(c => ({ treble: 'ト音', bass: 'ヘ音', alto: 'ハ音' }[c]))
    .join('・');

  const infoCard = document.createElement('div');
  infoCard.className = 'card';
  infoCard.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;font-size:0.9rem;';
  infoCard.innerHTML = `
    <span>🎼 <strong>${clefLabel}記号</strong></span>
    <span>⚡ <strong>${modeLabel}</strong></span>
    <span>📝 <strong>${settings.notation === 'solfege' ? 'ドレミ' : 'CDE'}</strong></span>
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

  page.append(title, subtitle, infoCard, grid);
  return page;
}
