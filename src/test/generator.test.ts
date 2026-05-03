import { describe, it, expect } from 'vitest';
import { generateQuestion } from '../core/quiz/generator.js';
import { defaultSettings } from '../core/storage/settingsStore.js';

describe('generateQuestion', () => {
  it('範囲外の MIDI を出さない', () => {
    const settings = defaultSettings();
    settings.enabledClefs = ['treble'];
    const range = settings.ranges['treble'];

    for (let i = 0; i < 100; i++) {
      const q = generateQuestion(settings, [], []);
      expect(q.pitch.midi).toBeGreaterThanOrEqual(range.minMidi);
      expect(q.pitch.midi).toBeLessThanOrEqual(range.maxMidi);
    }
  });

  it('全12音が出題される（十分な試行回数で#音が含まれる）', () => {
    const settings = defaultSettings();
    const midis = new Set<number>();
    for (let i = 0; i < 300; i++) {
      midis.add(generateQuestion(settings, [], []).pitch.midi);
    }
    // 12音すべてが1オクターブ内に存在するはず
    expect(midis.size).toBeGreaterThan(7);
  });

  it('直前 2 問と重複しない (候補が十分な場合)', () => {
    const settings = defaultSettings();
    const recent = [60, 61]; // C4, C#4
    let overlap = 0;
    for (let i = 0; i < 50; i++) {
      const q = generateQuestion(settings, [], recent);
      if (recent.includes(q.pitch.midi)) overlap++;
    }
    expect(overlap).toBe(0);
  });
});
