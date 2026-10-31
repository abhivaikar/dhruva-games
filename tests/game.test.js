import test from 'node:test';
import assert from 'node:assert/strict';
import { Journey } from '../src/game.js';
import { ROUTE, LEVELS } from '../src/route.js';
import { makeQuestion, makeChoices, spokenQuestion } from '../src/questions.js';
import { shortcutAction } from '../src/input.js';
import { AudioGuide } from '../src/audio.js';
import { loadPreferences, savePreferences } from '../src/preferences.js';
import { WORLDS, TRAIN_COLOURS, CountingHelper, activityQuestion, activityHint, objectArt, stationArt } from '../src/adventure.js';

function seededRandom(seed = 802) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

for (const [level, config] of Object.entries(LEVELS)) {
  test(`${level}: 2,000 questions have valid maths, bounds, and three unique answers`, () => {
    const random = seededRandom();
    const history = [];
    const kinds = new Set();
    for (let i = 0; i < 2000; i++) {
      const q = makeQuestion(level, history, random);
      assert.ok(!history.slice(-12).includes(q.id), 'Avoids recent questions, including reversed addition');
      history.push(q.id);
      assert.equal(q.choices.length, 3);
      assert.equal(new Set(q.choices).size, 3);
      assert.equal(q.choices.filter(n => n === q.answer).length, 1);
      assert.ok(q.choices.every(n => Number.isInteger(n) && n >= 0 && n <= config.max));
      assert.ok(q.a >= 0 && q.a <= config.max);
      assert.ok(q.b >= 0 && q.b <= config.max);
      assert.ok(q.answer >= 0 && q.answer <= config.max);
      assert.equal(q.answer, q.kind === 'add' ? q.a + q.b : q.kind === 'subtract' ? q.a - q.b : q.a);
      assert.ok(spokenQuestion(q).endsWith('?'));
      kinds.add(q.kind);
    }
    assert.ok(kinds.has('add'));
    assert.ok(kinds.has(level === 'beginner' ? 'count' : 'subtract'));
    if (level === 'beginner') assert.ok(!kinds.has('subtract'));
  });
}

test('distractors stay valid at both boundaries with deterministic randomness', () => {
  for (const max of [5, 10, 20]) {
    for (let answer = 0; answer <= max; answer++) {
      for (const random of [() => 0, () => .999999]) {
        const choices = makeChoices(answer, max, random);
        assert.equal(new Set(choices).size, 3);
        assert.ok(choices.includes(answer));
        assert.ok(choices.every(n => n >= 0 && n <= max));
      }
    }
  }
});

test('full line follows all 17 operational stops and skips unserved NE2', () => {
  assert.deepEqual(ROUTE.map(s => [s.code, s.name]), [
    ['NE18', 'Punggol Coast'], ['NE17', 'Punggol'], ['NE16', 'Sengkang'],
    ['NE15', 'Buangkok'], ['NE14', 'Hougang'], ['NE13', 'Kovan'],
    ['NE12', 'Serangoon'], ['NE11', 'Woodleigh'], ['NE10', 'Potong Pasir'], ['NE9', 'Boon Keng'],
    ['NE8', 'Farrer Park'], ['NE7', 'Little India'], ['NE6', 'Dhoby Ghaut'],
    ['NE5', 'Clarke Quay'], ['NE4', 'Chinatown'], ['NE3', 'Outram Park'], ['NE1', 'HarbourFront'],
  ]);
  assert.ok(Object.isFrozen(ROUTE));
  assert.ok(Object.isFrozen(ROUTE[0]));
});

test('complete journeys require exactly one correct answer per stop at all levels', () => {
  for (const level of Object.keys(LEVELS)) {
    const game = new Journey(level, seededRandom());
    assert.equal(game.start(), true);
    assert.equal(game.start(), false);
    for (let i = 0; i < ROUTE.length; i++) {
      assert.equal(game.index, i);
      assert.equal(game.station.code, ROUTE[i].code);
      assert.equal(game.phase, 'travelling');
      assert.equal(game.answer(0), 'ignored');
      assert.equal(game.advance(), false);
      assert.equal(game.arrive(), true);
      assert.equal(game.arrive(), false);
      const wrong = game.question.choices.find(n => n !== game.question.answer);
      assert.equal(game.answer(wrong), 'retry');
      assert.equal(game.completed, i);
      assert.equal(game.index, i);
      assert.equal(game.phase, 'question');
      assert.equal(game.answer(wrong), 'ignored');
      assert.equal(game.answer(999), 'ignored');
      assert.equal(game.answer(game.question.answer), 'correct');
      assert.equal(game.completed, i + 1);
      for (let n = 0; n < 25; n++) assert.equal(game.answer(game.question.answer), 'ignored');
      assert.equal(game.completed, i + 1, 'Rapid taps do not duplicate stars');
      assert.equal(game.advance(), true);
      assert.equal(game.advance(), false, 'Repeated advancement cannot skip a station');
    }
    assert.equal(game.phase, 'complete');
    assert.equal(game.completed, 17);
    assert.equal(game.index, 16);
    assert.equal(game.answer(0), 'ignored');
    assert.equal(game.start(), false);
    assert.equal(game.select(1), false);
    assert.equal(new Journey(level).phase, 'ready', 'A fresh journey starts cleanly');
  }
});

test('selection wraps and skips tried answers', () => {
  const game = new Journey('explorer', seededRandom());
  assert.equal(game.select(1), false);
  game.start();
  game.arrive();
  game.select(-1);
  assert.equal(game.selected, 2);
  game.select(1);
  assert.equal(game.selected, 0);
  for (const answer of game.question.choices.filter(n => n !== game.question.answer)) {
    game.answer(answer);
    assert.ok(!game.tried.has(game.selected));
  }
  for (let i = 0; i < 10; i++) {
    game.select(i % 2 ? 1 : -1);
    assert.equal(game.question.choices[game.selected], game.question.answer);
  }
});

test('only deliberate answer shortcuts during a question are handled', () => {
  const key = key => ({ key, repeat: false });
  assert.equal(shortcutAction(key('ArrowLeft'), 'question'), 'previous');
  assert.equal(shortcutAction(key('ArrowRight'), 'question'), 'next');
  assert.equal(shortcutAction(key(' '), 'question'), 'answer');
  for (const phase of ['ready', 'travelling', 'celebrating', 'complete']) assert.equal(shortcutAction(key(' '), phase), null);
  assert.equal(shortcutAction({ key: ' ', repeat: true }, 'question'), null);
  assert.equal(shortcutAction({ key: 'ArrowLeft', metaKey: true }, 'question'), null);
  assert.equal(shortcutAction(key(' '), 'question', false), null);
  assert.equal(shortcutAction(key('Escape'), 'question'), null);
});

test('question generation always terminates and rejects unknown levels', () => {
  const q = makeQuestion('beginner', [], () => 0);
  assert.equal(makeQuestion('beginner', [q.id], () => 0).id === q.id, false);
  assert.throws(() => makeQuestion('invalid'), RangeError);
  assert.throws(() => new Journey('invalid'), RangeError);
});

test('audio tolerates missing browser APIs and a muted environment', () => {
  const previous = globalThis.window;
  try {
    globalThis.window = {};
    const audio = new AudioGuide(true);
    assert.doesNotThrow(() => { audio.unlock(); audio.speak('Hello!'); audio.celebrate(); audio.stop(); });
    audio.enabled = false;
    assert.doesNotThrow(() => { audio.unlock(); audio.speak('Hello!'); audio.celebrate(true); });
  } finally { globalThis.window = previous; }
});

test('preferences handle invalid, unavailable, or blocked storage', () => {
  const previous = globalThis.localStorage;
  try {
    globalThis.localStorage = { getItem: () => '{invalid' };
    assert.deepEqual(loadPreferences(), { sound: true, level: 'beginner', train: 'purple' });
    globalThis.localStorage = { getItem: () => '{"level":"impossible","sound":false}' };
    assert.deepEqual(loadPreferences(), { sound: false, level: 'beginner', train: 'purple' });
    globalThis.localStorage = { getItem: () => '{"level":"super","sound":true}', setItem: () => { throw new Error('blocked'); } };
    assert.deepEqual(loadPreferences(), { sound: true, level: 'super', train: 'purple' });
    assert.doesNotThrow(() => savePreferences({ level: 'beginner', sound: true }));
  } finally { globalThis.localStorage = previous; }
});

test('every journey alternates activities instead of leaving variety to chance', () => {
  for (const level of Object.keys(LEVELS)) {
    const game = new Journey(level, () => 0);
    const kinds = [];
    const ids = [];
    game.start();
    for (let i = 0; i < ROUTE.length; i++) {
      game.arrive();
      kinds.push(game.question.kind);
      ids.push(game.question.id);
      game.answer(game.question.answer);
      game.advance();
    }
    assert.deepEqual(kinds, Array.from({ length: ROUTE.length }, (_, i) => level === 'beginner'
      ? (i % 2 === 0 ? 'count' : 'add')
      : (i % 2 === 0 ? 'add' : 'subtract')));
    if (level === 'beginner') {
      const counts = ids.filter(id => id.startsWith('count:'));
      for (let i = 0; i < counts.length; i++) {
        assert.ok(!counts.slice(Math.max(0, i - 4), i).includes(counts[i]), 'Exhausted counting pool revisits the oldest number');
      }
    } else {
      for (let i = 0; i < ids.length; i++) {
        assert.ok(!ids.slice(Math.max(0, i - 12), i).includes(ids[i]), 'Recent arithmetic questions are not repeated');
      }
    }
  }
  assert.throws(() => makeQuestion('beginner', [], Math.random, 'subtract'), RangeError);
});

test('counting helper counts each available object once, in any order', () => {
  const helper = new CountingHelper();
  const countable = new Set([0, 1, 2]);
  assert.equal(helper.tap(2, countable), 1);
  assert.equal(helper.tap(2, countable), null);
  assert.equal(helper.tap(50, countable), null, 'Removed objects cannot be counted');
  assert.equal(helper.tap(0, countable), 2);
  assert.equal(helper.tap(1, countable), 3);
  assert.equal(helper.counted.size, 3);
  assert.equal(new CountingHelper().counted.size, 0, 'Next question starts with a clean slate');
});

test('all 17 stations have distinct souvenirs, counting pictures, and scenery', () => {
  assert.equal(WORLDS.length, ROUTE.length);
  assert.equal(new Set(WORLDS.map(world => world.treasure)).size, 17);
  assert.equal(new Set(WORLDS.map((_, i) => stationArt(i))).size, 17);
  for (let i = 0; i < WORLDS.length; i++) {
    assert.ok(objectArt(i).startsWith('<svg'));
    assert.ok(!objectArt(i).includes('undefined'));
    assert.ok(stationArt(i).startsWith('<svg'));
    assert.ok(!stationArt(i).includes('<script'));
    assert.ok(activityQuestion({ kind: 'count' }, i).includes(WORLDS[i].plural));
    assert.ok(activityHint({ kind: 'subtract' }, i).includes('stay'));
    assert.ok(activityQuestion({ kind: 'subtract', a: 8, b: 3 }, i).includes('8 minus 3'));
  }
  assert.equal(Object.keys(TRAIN_COLOURS).length, 3);
  assert.equal(WORLDS[0].treasure, 'Coastal wings');
  assert.equal(WORLDS[10].treasure, 'Firefly sparkle');
  assert.equal(WORLDS[14].treasure, 'Lantern glow');
  assert.equal(WORLDS[16].treasure, 'Seaside treasure');
});

test('train colour preferences validate and preserve existing saved settings', () => {
  const previous = globalThis.localStorage;
  try {
    globalThis.localStorage = { getItem: () => '{"train":"ocean","sound":false,"level":"explorer"}' };
    assert.deepEqual(loadPreferences(), { train: 'ocean', sound: false, level: 'explorer' });
    globalThis.localStorage = { getItem: () => '{"train":"invalid"}' };
    assert.equal(loadPreferences().train, 'purple');
  } finally { globalThis.localStorage = previous; }
});
