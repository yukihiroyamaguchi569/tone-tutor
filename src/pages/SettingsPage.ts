import type { UserSettings, Clef, SessionMode, NotationStyle } from '../types/index.js';
import { loadSettings, saveSettings } from '../core/storage/settingsStore.js';
import { CLEF_DEFS, ALL_CLEFS, defaultRangeConfig } from '../core/music/clef.js';
import { navigate } from '../router.js';

export function SettingsPage(): HTMLElement {
  const page = document.createElement('div');
  page.className = 'page';

  const settings = loadSettings();

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = '⚙️ 設定';

  // --- 音名表記 ---
  const notationCard = makeCard('音名表記');
  const notationGroup = makeToggleGroup(
    [{ value: 'solfege', label: 'ドレミ' }, { value: 'letter', label: 'C/D/E' }],
    settings.notation,
    (v) => { settings.notation = v as NotationStyle; persist(); }
  );
  notationCard.appendChild(notationGroup);

  // --- モード ---
  const modeCard = makeCard('練習モード');
  const modeGroup = makeToggleGroup(
    [
      { value: 'timeAttack', label: 'タイムアタック' },
      { value: 'streak', label: '連続正解' },
      { value: 'untimed', label: '通常' },
    ],
    settings.mode,
    (v) => { settings.mode = v as SessionMode; persist(); }
  );
  modeCard.appendChild(modeGroup);

  // --- 時間 ---
  const timeCard = makeCard('タイムアタック時間');
  const timeGroup = makeToggleGroup(
    [
      { value: '30', label: '30秒' },
      { value: '60', label: '60秒' },
      { value: '120', label: '120秒' },
    ],
    String(settings.timeAttackSec),
    (v) => { settings.timeAttackSec = Number(v); persist(); }
  );
  timeCard.appendChild(timeGroup);

  // --- 記号選択 ---
  const clefCard = makeCard('出題記号');
  const clefGroup = document.createElement('div');
  clefGroup.className = 'toggle-group';
  ALL_CLEFS.forEach((clef: Clef) => {
    const btn = document.createElement('button');
    btn.className = `toggle-btn${settings.enabledClefs.includes(clef) ? ' active' : ''}`;
    btn.textContent = CLEF_DEFS[clef].label;
    btn.addEventListener('click', () => {
      const idx = settings.enabledClefs.indexOf(clef);
      if (idx >= 0 && settings.enabledClefs.length > 1) {
        settings.enabledClefs.splice(idx, 1);
        btn.classList.remove('active');
      } else if (idx < 0) {
        settings.enabledClefs.push(clef);
        btn.classList.add('active');
      }
      persist();
    });
    clefGroup.appendChild(btn);
  });
  clefCard.appendChild(clefGroup);

  // --- 出題範囲 ---
  const rangeCard = makeCard('出題範囲');
  ALL_CLEFS.forEach((clef: Clef) => {
    const row = document.createElement('div');
    row.className = 'settings-row';
    const def = CLEF_DEFS[clef];
    const range = settings.ranges[clef];

    row.innerHTML = `<span style="font-size:0.9rem">${def.label}</span>`;
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;gap:8px;align-items:center;font-size:0.85rem;';

    const minSelect = midiSelect(def.defaultRange.min - 24, def.defaultRange.max, range.minMidi);
    const maxSelect = midiSelect(def.defaultRange.min, def.defaultRange.max + 24, range.maxMidi);

    minSelect.addEventListener('change', () => {
      settings.ranges[clef].minMidi = Number(minSelect.value);
      persist();
    });
    maxSelect.addEventListener('change', () => {
      settings.ranges[clef].maxMidi = Number(maxSelect.value);
      persist();
    });

    controls.append(minSelect, document.createTextNode('〜'), maxSelect);
    row.appendChild(controls);
    rangeCard.appendChild(row);
  });

  // --- 入力方法 ---
  const inputCard = makeCard('入力方法');
  const methods: Array<{ key: keyof UserSettings['inputMethods']; label: string }> = [
    { key: 'choices', label: '多択ボタン' },
    { key: 'onscreen', label: '画面鍵盤' },
    { key: 'midi', label: 'MIDIキーボード' },
  ];
  methods.forEach(({ key, label }) => {
    const row = document.createElement('div');
    row.className = 'settings-row';
    row.innerHTML = `<span style="font-size:0.9rem">${label}</span>`;
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = settings.inputMethods[key];
    cb.style.cssText = 'width:18px;height:18px;cursor:pointer';
    cb.addEventListener('change', () => {
      const anyShouldBeTrue = methods.some(m => m.key !== key && settings.inputMethods[m.key]);
      if (!cb.checked && !anyShouldBeTrue) {
        cb.checked = true; // 少なくとも1つ有効
        return;
      }
      settings.inputMethods[key] = cb.checked;
      persist();
    });
    row.appendChild(cb);
    inputCard.appendChild(row);
  });

  // --- リセット ---
  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn btn-secondary';
  resetBtn.textContent = 'デフォルトに戻す';
  resetBtn.addEventListener('click', () => {
    const def = {
      notation: 'solfege' as NotationStyle,
      enabledClefs: ['treble'] as Clef[],
      ranges: {
        treble: defaultRangeConfig('treble'),
        bass: defaultRangeConfig('bass'),
        alto: defaultRangeConfig('alto'),
      },
      mode: 'timeAttack' as SessionMode,
      timeAttackSec: 60,
      inputMethods: { midi: false, onscreen: false, choices: true },
    } satisfies UserSettings;
    saveSettings(def);
    navigate('/settings');
  });

  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-primary';
  backBtn.textContent = '← 戻る';
  backBtn.addEventListener('click', () => navigate('/home'));

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;';
  btnRow.append(backBtn, resetBtn);

  page.append(title, notationCard, modeCard, timeCard, clefCard, rangeCard, inputCard, btnRow);

  function persist(): void {
    saveSettings(settings);
  }

  return page;
}

function makeCard(label: string): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.cssText = 'display:flex;flex-direction:column;gap:12px;';
  const h = document.createElement('p');
  h.className = 'label';
  h.textContent = label;
  card.appendChild(h);
  return card;
}

function makeToggleGroup(
  items: Array<{ value: string; label: string }>,
  current: string,
  onChange: (v: string) => void
): HTMLElement {
  const group = document.createElement('div');
  group.className = 'toggle-group';
  items.forEach(({ value, label }) => {
    const btn = document.createElement('button');
    btn.className = `toggle-btn${value === current ? ' active' : ''}`;
    btn.textContent = label;
    btn.addEventListener('click', () => {
      group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onChange(value);
    });
    group.appendChild(btn);
  });
  return group;
}

function midiSelect(min: number, max: number, current: number): HTMLSelectElement {
  const sel = document.createElement('select');
  sel.style.cssText = 'padding:4px;border-radius:4px;border:1px solid #e2e8f0;font-size:0.85rem;';
  const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  for (let m = Math.max(12, min); m <= Math.min(120, max); m++) {
    const mod = ((m % 12) + 12) % 12;
    const oct = Math.floor(m / 12) - 1;
    const opt = document.createElement('option');
    opt.value = String(m);
    opt.textContent = `${NOTE_NAMES[mod]}${oct}`;
    opt.selected = m === current;
    sel.appendChild(opt);
  }
  return sel;
}
