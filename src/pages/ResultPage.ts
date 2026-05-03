import type { SessionResult } from '../types/index.js';
import { navigate } from '../router.js';
import { loadSettings } from '../core/storage/settingsStore.js';
import { displayName, midiToPitch } from '../core/music/pitch.js';

export function ResultPage(): HTMLElement {
  const page = document.createElement('div');
  page.className = 'page';

  const raw = sessionStorage.getItem('tt:lastResult');
  if (!raw) {
    page.innerHTML = '<p>結果データがありません。</p>';
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = 'ホームへ';
    btn.addEventListener('click', () => navigate('/home'));
    page.appendChild(btn);
    return page;
  }

  const result = JSON.parse(raw) as SessionResult;
  const settings = loadSettings();
  const correct = result.answers.filter(a => a.correct).length;
  const total = result.answers.length;
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
  const modeLabel = { timeAttack: 'タイムアタック', streak: '連続正解', untimed: '通常' }[result.mode];

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = '結果';

  const modeTag = document.createElement('span');
  modeTag.className = 'label';
  modeTag.textContent = modeLabel;

  // スコア
  const statGrid = document.createElement('div');
  statGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;';

  function statCard(value: string, label: string): HTMLElement {
    const d = document.createElement('div');
    d.className = 'card result-stat';
    d.innerHTML = `<div class="value">${value}</div><div class="unit">${label}</div>`;
    return d;
  }

  if (result.mode === 'streak') {
    statGrid.appendChild(statCard(String(result.score), '最大連続'));
  } else {
    statGrid.append(
      statCard(`${rate}%`, '正答率'),
      statCard(String(correct), '正解数'),
      statCard(String(total), '問'),
    );
  }

  // 誤答リスト
  const wrongSection = document.createElement('div');
  wrongSection.innerHTML = '<p class="label">誤答した音</p>';
  const wrongMidis = [...new Set(result.answers.filter(a => !a.correct).map(a => a.pitch.midi))];
  if (wrongMidis.length === 0) {
    wrongSection.innerHTML += '<p style="color:#16a34a;font-weight:600">全問正解！</p>';
  } else {
    const ul = document.createElement('ul');
    ul.className = 'wrong-list';
    wrongMidis.forEach(m => {
      const li = document.createElement('li');
      li.className = 'wrong-badge';
      li.textContent = displayName(midiToPitch(m), settings.notation);
      ul.appendChild(li);
    });
    wrongSection.appendChild(ul);
  }

  // ボタン
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;';

  const homeBtn = document.createElement('button');
  homeBtn.className = 'btn btn-secondary';
  homeBtn.textContent = '🏠 ホーム';
  homeBtn.addEventListener('click', () => navigate('/home'));

  const retryBtn = document.createElement('button');
  retryBtn.className = 'btn btn-primary';
  retryBtn.textContent = '▶ もう一度';
  retryBtn.addEventListener('click', () => navigate('/practice'));

  const reviewBtn = document.createElement('button');
  reviewBtn.className = 'btn btn-secondary';
  reviewBtn.textContent = '🔁 誤答復習';
  reviewBtn.disabled = wrongMidis.length === 0;
  reviewBtn.addEventListener('click', () => navigate('/practice?review=1'));

  btnRow.append(homeBtn, retryBtn, reviewBtn);
  page.append(title, modeTag, statGrid, wrongSection, btnRow);
  return page;
}
