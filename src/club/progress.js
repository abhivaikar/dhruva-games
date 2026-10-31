import { GAMES } from './catalog.js';
const KEY = 'dhruva-discovery-club';

export function readClub(storage) {
  try {
    const saved = JSON.parse((storage || globalThis.localStorage).getItem(KEY)) || {};
    const completed = {};
    for (const { id } of GAMES) {
      const count = saved.completed?.[id];
      if (Number.isInteger(count) && count > 0) completed[id] = Math.min(count, 999);
    }
    return { sound: saved.sound !== false, completed };
  } catch { return { sound: true, completed: {} }; }
}

export function writeClub(state, storage) {
  try { (storage || globalThis.localStorage).setItem(KEY, JSON.stringify(state)); } catch { /* Optional local settings. */ }
}

export function recordCompletion(id, storage) {
  if (!GAMES.some(game => game.id === id)) return;
  const state = readClub(storage);
  state.completed[id] = Math.min((state.completed[id] || 0) + 1, 999);
  writeClub(state, storage);
}
