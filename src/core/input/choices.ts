import type { NoteName, Accidental, NotationStyle } from '../../types/index.js';

interface NoteChoice { step: NoteName; accidental: Accidental }

// 半音順、シャープ表記で12音
const ALL_NOTES: NoteChoice[] = [
  { step: 'C', accidental: 'natural' },
  { step: 'C', accidental: 'sharp' },
  { step: 'D', accidental: 'natural' },
  { step: 'D', accidental: 'sharp' },
  { step: 'E', accidental: 'natural' },
  { step: 'F', accidental: 'natural' },
  { step: 'F', accidental: 'sharp' },
  { step: 'G', accidental: 'natural' },
  { step: 'G', accidental: 'sharp' },
  { step: 'A', accidental: 'natural' },
  { step: 'A', accidental: 'sharp' },
  { step: 'B', accidental: 'natural' },
];

const SOLFEGE: Record<string, string> = {
  'C-natural': 'ド',   'C-sharp': 'ド♯',
  'D-natural': 'レ',   'D-sharp': 'レ♯',
  'E-natural': 'ミ',
  'F-natural': 'ファ', 'F-sharp': 'ファ♯',
  'G-natural': 'ソ',   'G-sharp': 'ソ♯',
  'A-natural': 'ラ',   'A-sharp': 'ラ♯',
  'B-natural': 'シ',
};

function noteLabel(note: NoteChoice, notation: NotationStyle): string {
  if (notation === 'solfege') return SOLFEGE[`${note.step}-${note.accidental}`] ?? note.step;
  return note.accidental === 'sharp' ? `${note.step}#` : note.step;
}

export function renderStepChoices(
  container: HTMLElement,
  notation: NotationStyle,
  onAnswer: (step: NoteName, accidental: Accidental) => void
): void {
  container.innerHTML = '';
  container.className = 'choices';

  for (const note of ALL_NOTES) {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = noteLabel(note, notation);
    btn.dataset['step'] = note.step;
    btn.dataset['acc'] = note.accidental;
    btn.addEventListener('click', () => onAnswer(note.step, note.accidental), { once: true });
    container.appendChild(btn);
  }
}

export function highlightStepChoice(
  container: HTMLElement,
  correctStep: NoteName,
  correctAcc: Accidental,
  answeredStep: NoteName,
  answeredAcc: Accidental
): void {
  container.querySelectorAll<HTMLButtonElement>('.choice-btn').forEach(btn => {
    btn.disabled = true;
    const s = btn.dataset['step'] as NoteName;
    const a = btn.dataset['acc'] as Accidental;
    if (s === correctStep && a === correctAcc) btn.classList.add('correct');
    else if (s === answeredStep && a === answeredAcc) btn.classList.add('wrong');
  });
}
