import type { Clef } from '../types/index.js';
import { CLEF_DEFS, ALL_CLEFS, staffLineMidis, staffSpaceMidis } from '../core/music/clef.js';
import { naturalMidiInRange, midiListToPitches } from '../core/music/noteRange.js';
import { displayName } from '../core/music/pitch.js';
import { loadSettings } from '../core/storage/settingsStore.js';
import { renderNote } from '../core/render/score.js';
import { navigate } from '../router.js';

type ViewMode = 'all' | 'lines' | 'spaces';

export function ChartRefPage(params: Record<string, string>): HTMLElement {
  const page = document.createElement('div');
  page.className = 'page';

  const clef = (params['clef'] ?? 'treble') as Clef;
  const settings = loadSettings();
  const def = CLEF_DEFS[clef];
  const range = settings.ranges[clef];

  const title = document.createElement('h1');
  title.className = 'page-title';
  title.textContent = `📖 参照チャート — ${def.label}`;

  // 記号切替
  const tabGroup = document.createElement('div');
  tabGroup.className = 'toggle-group';
  ALL_CLEFS.forEach(c => {
    const btn = document.createElement('button');
    btn.className = `toggle-btn${c === clef ? ' active' : ''}`;
    btn.textContent = CLEF_DEFS[c].label;
    btn.addEventListener('click', () => navigate(`/chart/${c}`));
    tabGroup.appendChild(btn);
  });

  // ビューモード切替
  let view: ViewMode = 'all';
  const viewTabGroup = document.createElement('div');
  viewTabGroup.className = 'toggle-group';
  viewTabGroup.style.marginTop = '8px';

  const viewDefs: Array<{ mode: ViewMode; label: string }> = [
    { mode: 'all', label: '単音' },
    { mode: 'lines', label: '5線上' },
    { mode: 'spaces', label: '5線間' },
  ];

  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;';

  function renderGrid() {
    grid.innerHTML = '';
    let midis: number[];
    if (view === 'lines') {
      midis = staffLineMidis(clef);
    } else if (view === 'spaces') {
      midis = staffSpaceMidis(clef);
    } else {
      midis = naturalMidiInRange(range.minMidi, range.maxMidi);
    }
    const pitches = midiListToPitches(midis);

    pitches.forEach(pitch => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 8px;';

      const scoreDiv = document.createElement('div');
      scoreDiv.className = 'score-container';
      scoreDiv.style.cssText = 'width:120px;height:120px;';
      renderNote(scoreDiv, pitch, clef);

      const label = document.createElement('p');
      label.style.cssText = 'font-size:1.1rem;font-weight:700;';
      label.textContent = displayName(pitch, settings.notation);

      const octave = document.createElement('p');
      octave.style.cssText = 'font-size:0.75rem;color:#94a3b8;';
      octave.textContent = `MIDI ${pitch.midi}`;

      card.append(scoreDiv, label, octave);
      grid.appendChild(card);
    });
  }

  viewDefs.forEach(({ mode, label }) => {
    const btn = document.createElement('button');
    btn.className = `toggle-btn${mode === view ? ' active' : ''}`;
    btn.textContent = label;
    btn.addEventListener('click', () => {
      view = mode;
      viewTabGroup.querySelectorAll('.toggle-btn').forEach((b, i) => {
        b.classList.toggle('active', viewDefs[i]!.mode === view);
      });
      renderGrid();
    });
    viewTabGroup.appendChild(btn);
  });

  renderGrid();

  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-secondary';
  backBtn.textContent = '← 戻る';
  backBtn.addEventListener('click', () => navigate('/home'));

  page.append(title, tabGroup, viewTabGroup, grid, backBtn);
  return page;
}
