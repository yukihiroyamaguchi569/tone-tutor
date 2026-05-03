import type { Pitch, Clef } from '../../types/index.js';
import { midiToPitch } from '../music/pitch.js';
import { loadLastWrong } from '../storage/statsStore.js';

export interface ReviewQueue {
  items: Array<{ pitch: Pitch; clef: Clef }>;
  index: number;
}

export function buildReviewQueue(clef: Clef): ReviewQueue {
  const wrong = loadLastWrong();
  return {
    items: wrong.map(m => ({ pitch: midiToPitch(m), clef })),
    index: 0,
  };
}

export function nextReview(queue: ReviewQueue): { pitch: Pitch; clef: Clef } | null {
  if (queue.index >= queue.items.length) return null;
  const item = queue.items[queue.index]!;
  queue.index++;
  return item;
}

export function hasMore(queue: ReviewQueue): boolean {
  return queue.index < queue.items.length;
}
