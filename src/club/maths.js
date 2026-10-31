import { shuffle } from '../questions.js';

export const MATH_LEVELS = Object.freeze({
  lower: { label: 'Primary 1–2', title: 'Little builders', description: 'Addition, subtraction, number bonds & place value' },
  middle: { label: 'Primary 3–4', title: 'Clever creators', description: 'Times tables, division & simple fractions' },
  upper: { label: 'Primary 5–6', title: 'Big thinkers', description: 'Percentages, decimals & simple ratios' },
});

const pick = (items, random) => items[Math.min(items.length - 1, Math.floor(random() * items.length))];
const number = (min, max, random) => min + Math.min(max - min, Math.floor(random() * (max - min + 1)));
const gcd = (a, b) => b ? gcd(b, a % b) : a;
export function fraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  const n = numerator / divisor;
  const d = denominator / divisor;
  return d === 1 ? String(n) : `${n}/${d}`;
}
const decimal = cents => String(Number((cents / 100).toFixed(2)));

function spokenMath(m) {
  switch (m.operation) {
    case 'add': return `What is ${m.a} plus ${m.b}?`;
    case 'subtract': return `What is ${m.a} minus ${m.b}?`;
    case 'bond': return `What number can we add to ${m.a} to make ${m.total}?`;
    case 'place': return `What number has ${m.tens} ${m.tens === 1 ? 'ten' : 'tens'} and ${m.ones} ${m.ones === 1 ? 'one' : 'ones'}?`;
    case 'multiply': return `What is ${m.a} times ${m.b}?`;
    case 'divide': return `What is ${m.total} divided by ${m.divisor}?`;
    case 'fraction': return `What is ${m.a} over ${m.denominator}, plus ${m.b} over ${m.denominator}?`;
    case 'percent': return `What is ${m.percent} percent of ${m.whole}?`;
    case 'decimal': return `What is ${decimal(m.aCents)} plus ${decimal(m.bCents)}?`;
    case 'ratio': return `For every ${m.red} red beads, there are ${m.blue} blue beads. There are ${m.red * m.factor} red beads. How many blue beads are there?`;
  }
}

function choices(answer, alternatives, random) {
  const wrong = shuffle([...new Set(alternatives.map(String))].filter(value => value !== String(answer)), random).slice(0, 2);
  if (wrong.length !== 2) throw new RangeError('Need two distinct distractors');
  return shuffle([String(answer), ...wrong], random).map(value => ({ id: value, label: value }));
}

export function mathsQuestion(level, index, random = Math.random) {
  if (!MATH_LEVELS[level]) throw new RangeError('Unknown primary level');
  let prompt, answer, alternatives, hint, explanation, meta;
  const type = index % (level === 'lower' ? 4 : 3);
  if (level === 'lower') {
    if (type === 0) {
      const a = number(1, 10, random), b = number(1, 10, random);
      answer = a + b; prompt = `${a} + ${b} = ?`; meta = { operation: 'add', a, b };
      hint = `Start with ${a}. Count on ${b} more.`; explanation = `${a} plus ${b} makes ${answer}.`;
    } else if (type === 1) {
      const a = number(3, 20, random), b = number(1, a, random);
      answer = a - b; prompt = `${a} − ${b} = ?`; meta = { operation: 'subtract', a, b };
      hint = `Start with ${a}. Take away ${b}.`; explanation = `${a} take away ${b} leaves ${answer}.`;
    } else if (type === 2) {
      const a = number(1, 9, random), b = number(1, 10, random);
      answer = b; prompt = `${a} + ? = ${a + b}`; meta = { operation: 'bond', a, total: a + b };
      hint = `How many more does ${a} need to reach ${a + b}?`; explanation = `${a} and ${b} are the two parts of ${a + b}.`;
    } else {
      const tens = number(1, 9, random), ones = number(0, 9, random);
      answer = tens * 10 + ones; prompt = `${tens} ${tens === 1 ? 'ten' : 'tens'} and ${ones} ${ones === 1 ? 'one' : 'ones'} = ?`; meta = { operation: 'place', tens, ones };
      hint = 'Each bundle of ten is worth 10. Add the single ones.'; explanation = `${tens * 10} plus ${ones} makes ${answer}.`;
    }
    alternatives = [answer + 1, answer + 2, answer + 10, answer - 1, answer - 2].filter(value => value >= 0 && value <= 100);
  } else if (level === 'middle') {
    if (type < 2) {
      const a = number(2, 12, random), b = number(2, 12, random);
      if (type === 0) {
        answer = a * b; prompt = `${a} × ${b} = ?`; meta = { operation: 'multiply', a, b };
        hint = `Think of ${a} equal groups of ${b}.`; explanation = `${a} groups of ${b} make ${answer}.`;
      } else {
        answer = a; prompt = `${a * b} ÷ ${b} = ?`; meta = { operation: 'divide', total: a * b, divisor: b };
        hint = `Which number times ${b} makes ${a * b}?`; explanation = `${a * b} shared into ${b} equal groups gives ${a} in each.`;
      }
      alternatives = [answer + 1, answer + 2, answer + b, Math.max(0, answer - 1), answer + 3];
    } else {
      const denominator = number(3, 10, random), a = number(1, denominator - 1, random), b = number(1, denominator - a, random);
      answer = fraction(a + b, denominator); prompt = `${a}/${denominator} + ${b}/${denominator} = ?`;
      meta = { operation: 'fraction', a, b, denominator };
      alternatives = Array.from({ length: denominator + 2 }, (_, n) => fraction(n, denominator));
      hint = 'The pieces are the same size. Add the top numbers and keep the denominator.';
      const raw = `${a + b}/${denominator}`;
      explanation = raw === answer ? `${answer} of the whole.` : `${raw} is ${answer} of the whole.`;
    }
  } else if (type === 0) {
    const percent = pick([10, 20, 25, 50, 75], random), whole = number(1, 10, random) * 20;
    answer = whole * percent / 100; prompt = `${percent}% of ${whole} = ?`; meta = { operation: 'percent', percent, whole };
    alternatives = [answer + 5, answer + 10, answer + 20, Math.max(0, answer - 5)];
    hint = 'Percent means out of 100. Multiply the whole by the percentage, then divide by 100.';
    explanation = `${whole} × ${percent} ÷ 100 = ${answer}.`;
  } else if (type === 1) {
    const a = number(1, 90, random) * 10, b = number(1, 90, random) * 10;
    answer = decimal(a + b); prompt = `${decimal(a)} + ${decimal(b)} = ?`; meta = { operation: 'decimal', aCents: a, bCents: b };
    alternatives = [decimal(a + b + 10), decimal(a + b + 100), decimal(a + b - 10), decimal(a + b + 50)];
    hint = 'Line up the decimal points. Add tenths to tenths and ones to ones.';
    explanation = `${decimal(a)} plus ${decimal(b)} makes ${answer}.`;
  } else {
    const red = number(2, 5, random), blue = number(2, 5, random), factor = number(2, 7, random);
    answer = blue * factor; prompt = `Red : blue = ${red} : ${blue}. There are ${red * factor} red beads. How many blue beads?`;
    meta = { operation: 'ratio', red, blue, factor };
    alternatives = [answer + 1, answer + blue, answer + factor, answer + 2];
    hint = `The red beads grew by a factor of ${factor}. Multiply the blue part by the same factor.`;
    explanation = `Both parts grow ${factor} times. ${blue} × ${factor} = ${answer} blue beads.`;
  }
  return { id: `maths-${level}-${index}`, kind: 'maths', prompt, answerId: String(answer), choices: choices(answer, alternatives, random), hint, explanation, meta,
    spokenPrompt: spokenMath(meta) };
}

export const mathsDeck = (level = 'lower', random = Math.random) => Array.from({ length: 8 }, (_, index) => mathsQuestion(level, index, random));
