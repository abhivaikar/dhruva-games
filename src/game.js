import { ROUTE, LEVELS } from './route.js';
import { makeQuestion } from './questions.js';

export class Journey {
  constructor(level = 'beginner', random = Math.random) {
    if (!LEVELS[level]) throw new RangeError('Unknown difficulty');
    this.level = level;
    this.random = random;
    this.phase = 'ready';
    this.index = 0;
    this.completed = 0;
    this.question = null;
    this.history = [];
    this.selected = 0;
    this.tried = new Set();
  }

  get station() { return ROUTE[this.index]; }

  start() {
    if (this.phase !== 'ready') return false;
    this.phase = 'travelling';
    return true;
  }

  arrive() {
    if (this.phase !== 'travelling') return false;
    const kind = this.level === 'beginner'
      ? (this.index % 2 === 0 ? 'count' : 'add')
      : (this.index % 2 === 0 ? 'add' : 'subtract');
    this.question = makeQuestion(this.level, this.history, this.random, kind);
    this.history.push(this.question.id);
    this.selected = 0;
    this.tried = new Set();
    this.phase = 'question';
    return true;
  }

  select(direction) {
    if (this.phase !== 'question') return false;
    const available = this.question.choices.map((_, i) => i).filter(i => !this.tried.has(i));
    const current = available.indexOf(this.selected);
    this.selected = available[(current + direction + available.length) % available.length];
    return true;
  }

  answer(choice) {
    if (this.phase !== 'question' || !this.question.choices.includes(choice)) return 'ignored';
    const choiceIndex = this.question.choices.indexOf(choice);
    if (this.tried.has(choiceIndex)) return 'ignored';
    if (choice !== this.question.answer) {
      this.tried.add(choiceIndex);
      this.select(1);
      return 'retry';
    }
    this.completed++;
    this.phase = 'celebrating';
    return 'correct';
  }

  advance() {
    if (this.phase !== 'celebrating') return false;
    if (this.completed === ROUTE.length) {
      this.phase = 'complete';
    } else {
      this.index++;
      this.phase = 'travelling';
    }
    return true;
  }
}
