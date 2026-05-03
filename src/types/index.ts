export type Clef = 'treble' | 'bass' | 'alto';
export type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Accidental = 'natural' | 'sharp' | 'flat';
export type NotationStyle = 'solfege' | 'letter';
export type SessionMode = 'timeAttack' | 'streak' | 'untimed';

export interface Pitch {
  midi: number;
  step: NoteName;
  octave: number;
  accidental: Accidental;
}

export interface RangeConfig {
  clef: Clef;
  minMidi: number;
  maxMidi: number;
}

export interface UserSettings {
  notation: NotationStyle;
  enabledClefs: Clef[];
  ranges: Record<Clef, RangeConfig>;
  mode: SessionMode;
  timeAttackSec: number;
  inputMethods: {
    midi: boolean;
    onscreen: boolean;
    choices: boolean;
  };
}

export interface Answer {
  pitch: Pitch;
  correct: boolean;
  ms: number;
}

export interface SessionResult {
  id: string;
  startedAt: number;
  mode: SessionMode;
  answers: Answer[];
  score: number;
}

export interface NoteStat {
  midi: number;
  clef: Clef;
  correct: number;
  total: number;
  avgMs: number;
}

export interface ProgressData {
  sessions: SessionResult[];
  perNote: NoteStat[];
}
