import { LEVELS } from './route.js';

const integer = (max, random) => Math.min(max, Math.floor(random() * (max + 1)));

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = integer(i, random);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function makeChoices(answer, max, random = Math.random) {
  const nearby = [];
  for (let n = Math.max(0, answer - 3); n <= Math.min(max, answer + 3); n++) {
    if (n !== answer) nearby.push(n);
  }
  return shuffle([answer, ...shuffle(nearby, random).slice(0, 2)], random);
}

// Select from a finite pool: no retry loops, even with a deterministic RNG.
export function makeQuestion(level = 'beginner', history = [], random = Math.random, kind = null) {
  if (!LEVELS[level]) throw new RangeError('Unknown difficulty');
  const max = LEVELS[level].max;
  const pool = [];
  if (level === 'beginner') {
    for (let a = 1; a <= max; a++) pool.push({ kind: 'count', a, b: 0, answer: a, id: `count:${a}` });
  }
  for (let a = 0; a <= max; a++) {
    for (let b = 1; b <= max; b++) {
      if (a + b <= max) pool.push({ kind: 'add', a, b, answer: a + b, id: `add:${Math.min(a, b)}:${Math.max(a, b)}` });
      if (level !== 'beginner' && a >= b) pool.push({ kind: 'subtract', a, b, answer: a - b, id: `subtract:${a}:${b}` });
    }
  }
  const matching = kind ? pool.filter(q => q.kind === kind) : pool;
  if (!matching.length) throw new RangeError('Unsupported question kind');
  const recent = new Set(history.slice(-12));
  const available = matching.filter(q => !recent.has(q.id));
  // A full-line beginner ride has more counting stops than numbers to five.
  // When that small pool is exhausted, revisit the least recently seen number.
  let candidates = available;
  if (!candidates.length) {
    const oldest = Math.min(...matching.map(q => history.lastIndexOf(q.id)));
    candidates = matching.filter(q => history.lastIndexOf(q.id) === oldest);
  }
  const question = candidates[integer(candidates.length - 1, random)];
  return { ...question, choices: makeChoices(question.answer, max, random) };
}

export function spokenQuestion(q) {
  if (q.kind === 'count') return 'How many stars can you count?';
  return `What is ${q.a} ${q.kind === 'add' ? 'plus' : 'minus'} ${q.b}?`;
}
