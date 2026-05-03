import './styles/main.css';
import { addRoute, startRouter } from './router.js';
import { HomePage } from './pages/HomePage.js';
import { PracticePage } from './pages/PracticePage.js';
import { ResultPage } from './pages/ResultPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { ProgressPage } from './pages/ProgressPage.js';
import { ChartRefPage } from './pages/ChartRefPage.js';
import { loadSettings } from './core/storage/settingsStore.js';
import { requestMidi } from './core/input/midi.js';

// ルート登録
addRoute('/home', () => HomePage());
addRoute('/practice', () => {
  const settings = loadSettings();
  return PracticePage(settings);
});
addRoute('/result', () => ResultPage());
addRoute('/settings', () => SettingsPage());
addRoute('/progress', () => ProgressPage());
addRoute('/chart/:clef', (params) => ChartRefPage(params));

// アプリ起動
const root = document.getElementById('app')!;
startRouter(root);

// MIDI: 設定で有効な場合は起動時に接続試行
if (loadSettings().inputMethods.midi) {
  requestMidi();
}
