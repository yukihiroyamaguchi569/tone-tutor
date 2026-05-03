import { describe, it, expect } from 'vitest';
import { midiToPitch, pitchToMidi, isNatural, displayName, toVexKey } from '../core/music/pitch.js';

describe('midiToPitch', () => {
  it('MIDI 60 は C4 (Middle C)', () => {
    const p = midiToPitch(60);
    expect(p.step).toBe('C');
    expect(p.octave).toBe(4);
    expect(p.accidental).toBe('natural');
    expect(p.midi).toBe(60);
  });

  it('MIDI 69 は A4', () => {
    const p = midiToPitch(69);
    expect(p.step).toBe('A');
    expect(p.octave).toBe(4);
    expect(p.accidental).toBe('natural');
  });

  it('MIDI 61 は C#4', () => {
    const p = midiToPitch(61);
    expect(p.step).toBe('C');
    expect(p.accidental).toBe('sharp');
    expect(p.octave).toBe(4);
  });

  it('MIDI 21 は A0 (ピアノ最低音)', () => {
    const p = midiToPitch(21);
    expect(p.step).toBe('A');
    expect(p.octave).toBe(0);
  });

  it('MIDI 108 は C8', () => {
    const p = midiToPitch(108);
    expect(p.step).toBe('C');
    expect(p.octave).toBe(8);
  });
});

describe('pitchToMidi', () => {
  it('C4 は 60', () => expect(pitchToMidi('C', 4)).toBe(60));
  it('A4 は 69', () => expect(pitchToMidi('A', 4)).toBe(69));
  it('C#4 は 61', () => expect(pitchToMidi('C', 4, 'sharp')).toBe(61));
  it('B3 は 59', () => expect(pitchToMidi('B', 3)).toBe(59));
  it('往復一致: MIDI → Pitch → MIDI', () => {
    for (let m = 24; m <= 96; m++) {
      const p = midiToPitch(m);
      if (p.accidental === 'natural') {
        expect(pitchToMidi(p.step, p.octave, p.accidental)).toBe(m);
      }
    }
  });
});

describe('isNatural', () => {
  it('C (60) は自然音', () => expect(isNatural(60)).toBe(true));
  it('C# (61) は自然音でない', () => expect(isNatural(61)).toBe(false));
  it('E (64) は自然音', () => expect(isNatural(64)).toBe(true));
});

describe('displayName', () => {
  it('letter 表記で C4 は "C"', () => {
    const p = midiToPitch(60);
    expect(displayName(p, 'letter')).toBe('C');
  });
  it('solfege 表記で C4 は "ド"', () => {
    const p = midiToPitch(60);
    expect(displayName(p, 'solfege')).toBe('ド');
  });
  it('solfege 表記で F#4 は "ファ♯"', () => {
    const p = midiToPitch(66);
    expect(displayName(p, 'solfege')).toBe('ファ♯');
  });
});

describe('toVexKey', () => {
  it('C4 → "c/4"', () => {
    const p = midiToPitch(60);
    expect(toVexKey(p)).toBe('c/4');
  });
  it('C#4 → "c#/4"', () => {
    const p = midiToPitch(61);
    expect(toVexKey(p)).toBe('c#/4');
  });
  it('A4 → "a/4"', () => {
    const p = midiToPitch(69);
    expect(toVexKey(p)).toBe('a/4');
  });
});
