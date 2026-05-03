/** 画面鍵盤 (2〜3 オクターブ) */
const BLACK_POSITIONS = new Set([1, 3, 6, 8, 10]);

export function renderKeyboard(
  container: HTMLElement,
  minMidi: number,
  maxMidi: number,
  onNote: (midi: number) => void
): void {
  container.innerHTML = '';
  container.className = 'keyboard';

  for (let m = minMidi; m <= maxMidi; m++) {
    const mod = ((m % 12) + 12) % 12;
    const isBlack = BLACK_POSITIONS.has(mod);
    const btn = document.createElement('button');
    btn.className = `key${isBlack ? ' black' : ''}`;
    btn.dataset['midi'] = String(m);
    btn.title = `MIDI ${m}`;
    btn.addEventListener('click', () => onNote(m));
    container.appendChild(btn);
  }
}

export function highlightKey(container: HTMLElement, midi: number, correct: boolean): void {
  const btn = container.querySelector<HTMLButtonElement>(`[data-midi="${midi}"]`);
  if (!btn) return;
  btn.classList.add('active');
  setTimeout(() => btn.classList.remove('active'), 400);
  // 正誤フラッシュ
  const cls = correct ? 'correct-flash' : 'wrong-flash';
  btn.classList.add(cls);
  setTimeout(() => btn.classList.remove(cls), 400);
}
