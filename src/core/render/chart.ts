import type { SessionResult, NoteStat } from '../../types/index.js';
import { midiToPitch, displayName } from '../music/pitch.js';
import type { NotationStyle } from '../../types/index.js';

/** 折れ線グラフ共通描画 */
function renderLineChart(
  values: number[],
  maxValue: number,
  gridLabels: Array<{ ratio: number; text: string }>,
  color: string
): SVGSVGElement {
  const w = Math.max(300, values.length * 30);
  const h = 120;
  const padL = 36, padR = 16, padT = 12, padB = 28;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(w));
  svg.setAttribute('height', String(h));
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

  gridLabels.forEach(({ ratio, text }) => {
    const y = padT + chartH - ratio * chartH;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(padL)); line.setAttribute('x2', String(padL + chartW));
    line.setAttribute('y1', String(y));    line.setAttribute('y2', String(y));
    line.setAttribute('stroke', '#e2e8f0'); line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', String(padL - 4)); label.setAttribute('y', String(y + 4));
    label.setAttribute('text-anchor', 'end'); label.setAttribute('font-size', '9');
    label.setAttribute('fill', '#94a3b8');
    label.textContent = text;
    svg.appendChild(label);
  });

  if (values.length > 0 && maxValue > 0) {
    const pts = values.map((v, i) => {
      const x = padL + (values.length <= 1 ? chartW / 2 : (i / (values.length - 1)) * chartW);
      const y = padT + chartH - (v / maxValue) * chartH;
      return `${x},${y}`;
    });
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    poly.setAttribute('points', pts.join(' '));
    poly.setAttribute('fill', 'none');
    poly.setAttribute('stroke', color);
    poly.setAttribute('stroke-width', '2');
    poly.setAttribute('stroke-linejoin', 'round');
    poly.setAttribute('stroke-linecap', 'round');
    svg.appendChild(poly);

    values.forEach((v, i) => {
      const x = padL + (values.length <= 1 ? chartW / 2 : (i / (values.length - 1)) * chartW);
      const y = padT + chartH - (v / maxValue) * chartH;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(x)); circle.setAttribute('cy', String(y));
      circle.setAttribute('r', '4');        circle.setAttribute('fill', color);
      svg.appendChild(circle);
    });
  }

  return svg;
}

/** 直近 N セッションの正答率折れ線 SVG */
export function renderSessionChart(sessions: SessionResult[], maxSessions = 20): SVGSVGElement {
  const recent = sessions.slice(0, maxSessions).reverse();
  const rates = recent.map(s =>
    s.answers.length > 0 ? s.answers.filter(a => a.correct).length / s.answers.length : 0
  );
  return renderLineChart(rates, 1, [
    { ratio: 0, text: '0%' }, { ratio: 0.5, text: '50%' }, { ratio: 1, text: '100%' },
  ], '#2563eb');
}

/** 直近 N セッションの正答問数折れ線 SVG */
export function renderCorrectCountChart(sessions: SessionResult[], maxSessions = 20): SVGSVGElement {
  const recent = sessions.slice(0, maxSessions).reverse();
  const counts = recent.map(s => s.answers.filter(a => a.correct).length);
  const maxCount = Math.max(...counts, 1);
  const mid = Math.round(maxCount / 2);
  return renderLineChart(counts, maxCount, [
    { ratio: 0, text: '0' },
    { ratio: mid / maxCount, text: String(mid) },
    { ratio: 1, text: String(maxCount) },
  ], '#16a34a');
}

/** 音別ヒートマップ SVG */
export function renderHeatmap(perNote: NoteStat[], notation: NotationStyle): SVGSVGElement {
  if (perNote.length === 0) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '300'); svg.setAttribute('height', '40');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '12'); text.setAttribute('y', '24');
    text.setAttribute('font-size', '13'); text.setAttribute('fill', '#94a3b8');
    text.textContent = 'データなし';
    svg.appendChild(text);
    return svg;
  }

  const sorted = [...perNote].sort((a, b) => a.midi - b.midi);
  const cellW = 44, cellH = 36, pad = 8;
  const cols = Math.ceil(sorted.length / 2);
  const w = cols * cellW + pad * 2;
  const h = 2 * cellH + pad * 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(w));
  svg.setAttribute('height', String(h));

  sorted.forEach((stat, i) => {
    const row = i % 2;
    const col = Math.floor(i / 2);
    const x = pad + col * cellW;
    const y = pad + row * cellH;
    const rate = stat.total > 0 ? stat.correct / stat.total : 0;
    const lightness = Math.round(90 - rate * 50);
    const fill = stat.total === 0 ? '#f1f5f9' : `hsl(120,60%,${lightness}%)`;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(x + 1));
    rect.setAttribute('y', String(y + 1));
    rect.setAttribute('width', String(cellW - 2));
    rect.setAttribute('height', String(cellH - 2));
    rect.setAttribute('rx', '4');
    rect.setAttribute('fill', fill);
    svg.appendChild(rect);

    const pitch = midiToPitch(stat.midi);
    const name = displayName(pitch, notation);
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', String(x + cellW / 2));
    label.setAttribute('y', String(y + cellH / 2 + 1));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('font-size', '12');
    label.setAttribute('font-weight', '600');
    label.setAttribute('fill', rate > 0.5 ? '#166534' : '#1e293b');
    label.textContent = name;
    svg.appendChild(label);

    if (stat.total > 0) {
      const pct = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      pct.setAttribute('x', String(x + cellW / 2));
      pct.setAttribute('y', String(y + cellH - 5));
      pct.setAttribute('text-anchor', 'middle');
      pct.setAttribute('font-size', '8');
      pct.setAttribute('fill', '#64748b');
      pct.textContent = `${Math.round(rate * 100)}%`;
      svg.appendChild(pct);
    }
  });

  return svg;
}
