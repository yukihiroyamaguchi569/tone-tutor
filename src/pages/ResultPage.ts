import type { SessionResult } from '../types/index.js';
import { navigate } from '../router.js';
import { submitRanking, LEVELS, type ExperienceLevel } from '../core/ranking/rankingStore.js';
import { loadSettings } from '../core/storage/settingsStore.js';
import { displayName, midiToPitch } from '../core/music/pitch.js';
import { loadStats } from '../core/storage/statsStore.js';
import { calcRank, getPreviousRankIndex, setPreviousRankIndex, RANKS } from '../core/quiz/rank.js';

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

  const stats = loadStats();
  const rank = calcRank(stats.sessions);
  const prevIndex = getPreviousRankIndex();
  setPreviousRankIndex(rank.index);

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

  // 昇段バナー（前回より段位が上がった場合のみ）
  const isRankUp = prevIndex >= 0 && rank.index > prevIndex;
  if (isRankUp) {
    const banner = document.createElement('div');
    banner.className = 'rank-up-banner';
    banner.innerHTML = `🏅 昇段！ <span class="from">${RANKS[prevIndex].name}</span> → <span class="to">${rank.name}</span>`;
    page.appendChild(banner);
  }

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
    wrongSection.innerHTML += '<p style="color:var(--correct);font-weight:600">全問正解！🎉</p>';
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

  // ランキング登録フォーム
  const rankSection = document.createElement('div');
  rankSection.className = 'card';
  rankSection.style.cssText = 'display:flex;flex-direction:column;gap:10px;';

  const rankLabel = document.createElement('p');
  rankLabel.style.cssText = 'font-weight:600;margin:0;';
  rankLabel.textContent = '🏆 ランキングに登録';

  // レベル選択
  let selectedLevel = (localStorage.getItem('tt:level') ?? 'beginner') as ExperienceLevel;
  const levelRow = document.createElement('div');
  levelRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';
  LEVELS.forEach(({ key, label }) => {
    const btn = document.createElement('button');
    btn.className = selectedLevel === key ? 'btn btn-primary' : 'btn btn-secondary';
    btn.textContent = label;
    btn.style.cssText = 'font-size:0.8rem;padding:4px 10px;';
    btn.addEventListener('click', () => {
      selectedLevel = key;
      levelRow.querySelectorAll('button').forEach(b => { b.className = 'btn btn-secondary'; (b as HTMLButtonElement).style.cssText = 'font-size:0.8rem;padding:4px 10px;'; });
      btn.className = 'btn btn-primary';
      btn.style.cssText = 'font-size:0.8rem;padding:4px 10px;';
    });
    levelRow.appendChild(btn);
  });

  const nicknameRow = document.createElement('div');
  nicknameRow.style.cssText = 'display:flex;gap:8px;';

  const nicknameInput = document.createElement('input');
  nicknameInput.type = 'text';
  nicknameInput.placeholder = 'ニックネーム（20文字以内）';
  nicknameInput.maxLength = 20;
  nicknameInput.value = localStorage.getItem('tt:nickname') ?? '';
  nicknameInput.style.cssText = 'flex:1;padding:8px 10px;border:1px solid var(--border,#e2e8f0);border-radius:6px;font-size:0.9rem;';

  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = '送信';

  const statusEl = document.createElement('p');
  statusEl.style.cssText = 'font-size:0.85rem;margin:0;color:var(--text-2);';

  submitBtn.addEventListener('click', async () => {
    const nickname = nicknameInput.value.trim();
    if (!nickname) { statusEl.textContent = 'ニックネームを入力してください'; return; }
    submitBtn.disabled = true;
    statusEl.textContent = '送信中…';
    try {
      await submitRanking(nickname, selectedLevel, result);
      localStorage.setItem('tt:nickname', nickname);
      localStorage.setItem('tt:level', selectedLevel);
      navigate('/ranking');
    } catch {
      statusEl.textContent = '送信に失敗しました。時間をおいて再試行してください。';
      submitBtn.disabled = false;
    }
  });

  nicknameRow.append(nicknameInput, submitBtn);
  rankSection.append(rankLabel, levelRow, nicknameRow, statusEl);

  page.append(title, modeTag, statGrid, wrongSection, btnRow, rankSection);
  return page;
}
