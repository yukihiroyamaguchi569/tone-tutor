import type { UserSettings, Answer, NoteName, Accidental } from '../types/index.js';
import type { Question } from '../core/quiz/generator.js';
import { generateQuestion } from '../core/quiz/generator.js';
import { createSession, recordAnswer, checkTimeUp, finalizeSession } from '../core/quiz/session.js';
import { loadStats, saveSession } from '../core/storage/statsStore.js';
import { renderNote } from '../core/render/score.js';
import { renderStepChoices, highlightStepChoice } from '../core/input/choices.js';
import { renderKeyboard, highlightKey } from '../core/input/keyboard.js';
import { onMidiNote, offMidiNote } from '../core/input/midi.js';
import { navigate } from '../router.js';

export function PracticePage(settings: UserSettings): HTMLElement {
  const page = document.createElement('div');
  page.className = 'page';

  const stats = loadStats();
  const session = createSession(settings.mode, settings.timeAttackSec);
  let currentQuestion: Question | null = null;
  const recentMidi: number[] = [];
  let questionStart = 0;
  let timerHandle = 0;

  // --- UI 要素 ---
  const scoreBar = document.createElement('div');
  scoreBar.className = 'score-bar';
  const timerEl = document.createElement('span');
  timerEl.className = 'timer';
  const streakEl = document.createElement('span');
  streakEl.className = 'streak';
  scoreBar.appendChild(timerEl);
  scoreBar.appendChild(streakEl);

  const scoreContainer = document.createElement('div');
  scoreContainer.className = 'score-container';

  const inputArea = document.createElement('div');

  const choicesEl = document.createElement('div');
  const keyboardEl = document.createElement('div');

  page.append(scoreBar, scoreContainer, inputArea);

  // --- 入力系ルーティング ---
  function buildInputUI(): void {
    inputArea.innerHTML = '';
    if (settings.inputMethods.choices) {
      inputArea.appendChild(choicesEl);
    }
    if (settings.inputMethods.onscreen) {
      const clef = currentQuestion!.clef;
      const range = settings.ranges[clef];
      renderKeyboard(keyboardEl, range.minMidi, range.maxMidi, submitAnswer);
      inputArea.appendChild(keyboardEl);
    }
    if (settings.inputMethods.midi) {
      onMidiNote(submitAnswer);
    }
  }

  function nextQuestion(): void {
    checkTimeUp(session);
    if (session.finished) {
      finish();
      return;
    }

    currentQuestion = generateQuestion(settings, stats.perNote, recentMidi);
    recentMidi.push(currentQuestion.pitch.midi);
    questionStart = performance.now();

    renderNote(scoreContainer, currentQuestion.pitch, currentQuestion.clef);

    if (settings.inputMethods.choices) {
      renderStepChoices(choicesEl, settings.notation, (step, acc) => submitAnswerByStep(step, acc));
    }
    buildInputUI();

    updateHUD();
  }

  // 選択肢ボタン（12音）からの回答
  function submitAnswerByStep(step: NoteName, accidental: Accidental): void {
    if (!currentQuestion || session.finished) return;
    const q = currentQuestion.pitch;
    const correct = step === q.step && accidental === q.accidental;
    const ms = performance.now() - questionStart;
    if (settings.inputMethods.choices) {
      highlightStepChoice(choicesEl, q.step, q.accidental, step, accidental);
    }
    commit({ pitch: q, correct, ms });
  }

  // MIDI / 画面鍵盤からの回答
  function submitAnswer(midi: number): void {
    if (!currentQuestion || session.finished) return;
    const correct = midi === currentQuestion.pitch.midi;
    const ms = performance.now() - questionStart;
    if (settings.inputMethods.onscreen) {
      highlightKey(keyboardEl, midi, correct);
    }
    commit({ pitch: currentQuestion.pitch, correct, ms });
  }

  function commit(answer: Answer): void {
    recordAnswer(session, answer);
    updateHUD();

    if (session.finished) {
      setTimeout(finish, 600);
      return;
    }
    setTimeout(nextQuestion, answer.correct ? 300 : 700);
  }

  function updateHUD(): void {
    if (settings.mode === 'timeAttack') {
      const sec = Math.ceil(session.getRemainingMs() / 1000);
      timerEl.textContent = `⏱ ${sec}s`;
      timerEl.classList.toggle('warn',   sec <= 10 && sec > 5);
      timerEl.classList.toggle('danger', sec <= 5);
      streakEl.textContent = `${session.answers.filter(a => a.correct).length} 正解`;
    } else if (settings.mode === 'streak') {
      timerEl.textContent = '';
      streakEl.textContent = `🔥 ${session.streak} 連続`;
    } else {
      timerEl.textContent = '';
      streakEl.textContent = `${session.answers.filter(a => a.correct).length} / ${session.answers.length}`;
    }
  }

  function finish(): void {
    clearInterval(timerHandle);
    offMidiNote();
    const result = finalizeSession(session);
    const clef = currentQuestion?.clef ?? settings.enabledClefs[0]!;
    saveSession(result, clef);

    // 結果画面へ
    sessionStorage.setItem('tt:lastResult', JSON.stringify(result));
    navigate('/result');
  }

  // タイマーアタック: 毎秒 HUD 更新 & 終了チェック
  if (settings.mode === 'timeAttack') {
    timerHandle = setInterval(() => {
      checkTimeUp(session);
      updateHUD();
      if (session.finished) {
        clearInterval(timerHandle);
        offMidiNote();
        const result = finalizeSession(session);
        const clef = currentQuestion?.clef ?? settings.enabledClefs[0]!;
        saveSession(result, clef);
        sessionStorage.setItem('tt:lastResult', JSON.stringify(result));
        navigate('/result');
      }
    }, 500) as unknown as number;
  }

  // MIDI 接続通知
  if (settings.inputMethods.midi) {
    const notice = document.createElement('p');
    notice.style.cssText = 'font-size:0.8rem;color:#64748b;text-align:center';
    notice.textContent = 'MIDIキーボードを弾いて回答してください';
    page.appendChild(notice);
  }

  nextQuestion();

  return page;
}
