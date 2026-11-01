export class RoundSession {
  constructor(questions) {
    if (!questions.length) throw new RangeError('A game needs questions');
    for (const question of questions) {
      const ids = question.choices.map(choice => choice.id);
      if (ids.length < 2 || new Set(ids).size !== ids.length || !ids.includes(question.answerId)) {
        throw new RangeError('Each question needs unique choices and exactly one correct answer');
      }
    }
    this.questions = questions;
    this.index = 0;
    this.completed = 0;
    this.phase = 'question';
    this.tried = new Set();
    this.selected = 0;
  }
  get current() { return this.questions[this.index]; }
  restart() { this.index=0;this.completed=0;this.phase='question';this.tried.clear();this.selected=0; }
  answer(id) {
    if (this.phase !== 'question' || !this.current.choices.some(choice => choice.id === id) || this.tried.has(id)) return 'ignored';
    if (id !== this.current.answerId) { this.tried.add(id); return 'retry'; }
    this.phase = 'feedback';
    this.completed++;
    return 'correct';
  }
  advance() {
    if (this.phase !== 'feedback') return false;
    if (this.completed === this.questions.length) this.phase = 'complete';
    else { this.index++; this.phase = 'question'; this.tried = new Set(); this.selected = 0; }
    return true;
  }
  select(direction) {
    if (this.phase !== 'question') return;
    const indices = this.current.choices.map((_, i) => i).filter(i => !this.tried.has(this.current.choices[i].id));
    const at = indices.indexOf(this.selected);
    this.selected = indices[(at + direction + indices.length) % indices.length];
  }
}
