import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import type { Pitch, Clef } from '../../types/index.js';
import { toVexKey } from '../music/pitch.js';
import { CLEF_DEFS } from '../music/clef.js';

export function renderNote(container: HTMLElement, pitch: Pitch, clef: Clef): void {
  container.innerHTML = '';

  const width = 260;
  const height = 160;

  const renderer = new Renderer(container as HTMLDivElement, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const ctx = renderer.getContext();
  ctx.setFont('Arial', 10);

  const stave = new Stave(20, 30, 220);
  stave.addClef(CLEF_DEFS[clef].vexClef);
  stave.setContext(ctx).draw();

  const key = toVexKey(pitch);
  const note = new StaveNote({
    clef: CLEF_DEFS[clef].vexClef,
    keys: [key],
    duration: 'q',
  });

  if (pitch.accidental === 'sharp') {
    note.addModifier(new Accidental('#'), 0);
  } else if (pitch.accidental === 'flat') {
    note.addModifier(new Accidental('b'), 0);
  }

  const voice = new Voice({ num_beats: 1, beat_value: 4 });
  voice.setStrict(false);
  voice.addTickables([note]);

  new Formatter().joinVoices([voice]).format([voice], 160);
  voice.draw(ctx, stave);
}
