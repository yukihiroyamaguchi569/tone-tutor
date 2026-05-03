import type { UserSettings } from '../../types/index.js';
import { defaultRangeConfig } from '../music/clef.js';

const KEY = 'tt:settings:v1';

export function defaultSettings(): UserSettings {
  return {
    notation: 'solfege',
    enabledClefs: ['treble'],
    ranges: {
      treble: defaultRangeConfig('treble'),
      bass: defaultRangeConfig('bass'),
      alto: defaultRangeConfig('alto'),
    },
    mode: 'timeAttack',
    timeAttackSec: 60,
    inputMethods: { midi: false, onscreen: false, choices: true },
  };
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSettings();
    return { ...defaultSettings(), ...JSON.parse(raw) as Partial<UserSettings> };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(s: UserSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
