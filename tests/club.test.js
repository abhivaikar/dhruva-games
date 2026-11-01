import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { GAMES } from '../src/club/catalog.js';
import { COUNTRIES } from '../src/club/data/countries.js';
import { WORLD_PATHS } from '../src/club/data/world-paths.js';
import { RoundSession } from '../src/club/rounds.js';
import { transportDeck, flagsDeck, worldDeck, LINES } from '../src/club/decks.js';
import { MATH_LEVELS, mathsDeck, mathsQuestion, fraction } from '../src/club/maths.js';
import { TreasureTrail, ROCKS, KEYS, DIRECTIONS, coordinate, position, islandPath } from '../src/club/treasure.js';
import { readClub, writeClub, recordCompletion } from '../src/club/progress.js';
import { ROUTE } from '../src/route.js';

function randomGenerator(seed = 311026) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
const valueOf = value => {
  const [top, bottom = '1'] = value.split('/');
  return Number(top) / Number(bottom);
};

test('all nine offerings have unique URLs and local entry points', async () => {
  assert.equal(GAMES.length, 9);
  assert.equal(new Set(GAMES.map(game => game.id)).size, 9);
  assert.equal(new Set(GAMES.map(game => game.href)).size, 9);
  for (const game of GAMES) await access(new URL(`../${game.href.split('?')[0]}`, import.meta.url));
  const mrt = await readFile(new URL('../mrt-adventure.html', import.meta.url), 'utf8');
  assert.ok(mrt.includes('src="./src/app.js"'));
  assert.ok(mrt.includes('Back to all games'));
  const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(home.includes('./src/club/hub.js'));
});

for (const level of Object.keys(MATH_LEVELS)) {
  test(`${level}: 3,000 primary questions have exact answers and non-equivalent distractors`, () => {
    const random = randomGenerator();
    const operations = new Set();
    for (let i = 0; i < 3000; i++) {
      const q = mathsQuestion(level, i, random);
      const m = q.meta;
      operations.add(m.operation);
      const expected = {
        add: () => m.a + m.b,
        subtract: () => m.a - m.b,
        bond: () => m.total - m.a,
        place: () => m.tens * 10 + m.ones,
        multiply: () => m.a * m.b,
        divide: () => m.total / m.divisor,
        fraction: () => (m.a + m.b) / m.denominator,
        percent: () => m.whole * m.percent / 100,
        decimal: () => (m.aCents + m.bCents) / 100,
        ratio: () => m.blue * m.factor,
      }[m.operation]();
      assert.ok(Math.abs(valueOf(q.answerId) - expected) < 1e-9);
      assert.equal(q.choices.length, 3);
      assert.equal(new Set(q.choices.map(choice => valueOf(choice.id))).size, 3);
      assert.equal(q.choices.filter(choice => choice.id === q.answerId).length, 1);
      assert.ok(q.choices.every(choice => Number.isFinite(valueOf(choice.id)) && valueOf(choice.id) >= 0));
      if (level === 'lower') {
        assert.ok(valueOf(q.answerId) <= 99);
        if (m.operation === 'subtract') assert.ok(m.a >= m.b);
      }
      if (m.operation === 'divide') assert.ok(Number.isInteger(expected));
      if (m.operation === 'fraction') assert.ok(expected <= 1);
      assert.ok(q.hint && q.explanation && q.spokenPrompt);
    }
    assert.equal(operations.size, level === 'lower' ? 4 : 3);
  });
}

test('fractions reduce to canonical answers', () => {
  assert.equal(fraction(2, 4), '1/2');
  assert.equal(fraction(4, 4), '1');
  assert.equal(fraction(0, 5), '0');
  assert.throws(() => mathsQuestion('unknown', 0), RangeError);
});

test('all quiz games complete once, allow retries, and lock repeated answers', () => {
  const decks = [transportDeck(), flagsDeck(), worldDeck(), ...Object.keys(MATH_LEVELS).map(level => mathsDeck(level))];
  for (const deck of decks) {
    const session = new RoundSession(deck);
    assert.equal(deck.length, 8);
    for (let i = 0; i < deck.length; i++) {
      assert.equal(session.index, i);
      assert.equal(session.advance(), false);
      assert.equal(session.answer('not-a-choice'), 'ignored');
      const wrong = session.current.choices.find(choice => choice.id !== session.current.answerId);
      assert.equal(session.answer(wrong.id), 'retry');
      assert.equal(session.completed, i);
      assert.equal(session.answer(wrong.id), 'ignored');
      assert.equal(session.answer(session.current.answerId), 'correct');
      for (let n = 0; n < 10; n++) assert.equal(session.answer(session.current.answerId), 'ignored');
      assert.equal(session.completed, i + 1);
      assert.equal(session.advance(), true);
      assert.equal(session.advance(), false);
    }
    assert.equal(session.phase, 'complete');
    assert.equal(session.completed, 8);
  }
  assert.throws(() => new RoundSession([]), RangeError);
  assert.throws(() => new RoundSession([{ choices: [{ id: 'a' }, { id: 'a' }], answerId: 'a' }]), RangeError);
  assert.throws(() => new RoundSession([{ choices: [{ id: 'a' }, { id: 'b' }], answerId: 'c' }]), RangeError);
});

test('choice navigation wraps and skips tried answers', () => {
  const session = new RoundSession(flagsDeck(() => 0));
  session.select(-1);
  assert.equal(session.selected, 2);
  session.select(1);
  assert.equal(session.selected, 0);
  for (const choice of session.current.choices.filter(item => item.id !== session.current.answerId)) session.answer(choice.id);
  for (const direction of [-1, 1, 1, -1]) {
    session.select(direction);
    assert.equal(session.current.choices[session.selected].id, session.current.answerId);
  }
});

test('transport missions use actual neighbouring stations and recognisable line colours', () => {
  const random = randomGenerator();
  for (let n = 0; n < 100; n++) {
    for (const q of transportDeck(random)) {
      if (q.kind === 'station') {
        assert.equal(q.answerId, ROUTE[q.startIndex + q.direction].code);
        assert.ok(q.choices.every(choice => choice.id !== 'NE2'));
        assert.equal(q.destination, q.direction === 1 ? 'HarbourFront' : 'Punggol Coast');
      }
      if (q.kind === 'line') assert.equal(q.answerId, LINES.find(line => line.colourName === q.line.colourName).id);
      if (q.kind === 'vehicle') assert.equal(q.answerId, 'bus');
    }
  }
  assert.deepEqual(LINES.map(line => line.id).sort(), ['CC', 'DT', 'EW', 'NE', 'NS', 'TE']);
});

test('flag and map decks do not repeat targets and keep exactly one target among three choices', () => {
  for (const make of [flagsDeck, worldDeck]) {
    for (const random of [randomGenerator(), () => 0, () => .99999]) {
      const deck = make(random);
      assert.equal(new Set(deck.map(q => q.country.id)).size, 8);
      assert.equal(deck[0].country.id, 'sg');
      for (const q of deck) {
        assert.equal(new Set(q.choices.map(choice => choice.id)).size, 3);
        assert.equal(q.answerId, q.country.id);
        assert.ok(q.choices.some(choice => choice.id === q.country.id));
        if (q.kind === 'map') assert.ok(q.choices.filter(choice => choice.id !== q.answerId).every(choice => choice.country.continent !== q.country.continent));
      }
    }
  }
  assert.deepEqual(flagsDeck().map(q => q.mode), ['name', 'find', 'name', 'find', 'name', 'find', 'name', 'find']);
});

test('every country has a local flag and a map outline or Singapore locator', async () => {
  assert.equal(COUNTRIES.length, 20);
  const ids = new Set(WORLD_PATHS.map(country => country.id));
  for (const country of COUNTRIES) {
    const svg = await readFile(new URL(`../assets/flags/${country.id}.svg`, import.meta.url), 'utf8');
    assert.ok(svg.includes('<svg'));
    assert.ok(!svg.includes('<script'));
    assert.ok(country.description);
    assert.ok(ids.has(country.mapId) || country.id === 'sg');
    assert.ok(country.lon >= -180 && country.lon <= 180);
    assert.ok(country.lat >= -60 && country.lat <= 85);
  }
  await access(new URL('../assets/flags/LICENSE.txt', import.meta.url));
  assert.ok(WORLD_PATHS.length > 150);
  assert.ok(WORLD_PATHS.every(country => country.path.startsWith('M') && !country.path.includes('NaN')));
});

function routeBetween(start, goal) {
  const queue = [{ cell: start, steps: [] }];
  const visited = new Set([start]);
  while (queue.length) {
    const current = queue.shift();
    if (current.cell === goal) return current.steps;
    const { x, y } = position(current.cell);
    for (const [direction, [dx, dy]] of Object.entries(DIRECTIONS)) {
      const nx = x + dx, ny = y + dy, cell = coordinate(nx, ny);
      if (nx < 0 || ny < 0 || nx >= 5 || ny >= 5 || ROCKS.includes(cell) || visited.has(cell)) continue;
      visited.add(cell);
      queue.push({ cell, steps: [...current.steps, direction] });
    }
  }
  return null;
}

test('pirate quests have reachable, separated hiding places and require all three keys before victory', () => {
  const routes = new Set();
  for (let seed = 1; seed <= 500; seed++) {
    const trail = new TreasureTrail(randomGenerator(seed));
    assert.equal(trail.cell, 'A5');
    assert.equal(trail.move('west'), 'edge');
    assert.equal(trail.move('south'), 'edge');
    assert.equal(trail.move('unknown'), 'ignored');
    assert.equal(trail.dig(), 'retry');
    assert.equal(trail.turnKey('star'), 'ignored');
    assert.equal(trail.completed, 0);
    routes.add(trail.missions.map(mission => mission.cell).join(','));
    assert.equal(new Set(trail.missions.map(mission => mission.cell)).size, 4);
    for (let i = 0; i < 4; i++) {
      // Independent BFS checks generation and the routes used by the parrot and tap-to-walk.
      const route = routeBetween(trail.cell, trail.target);
      assert.ok(route.length >= 3);
      assert.equal(islandPath(trail.cell, trail.target).length, route.length);
      assert.equal(trail.distance, route.length);
      assert.ok(DIRECTIONS[trail.nextStep]);
      assert.equal(trail.advance(), false);
      for (const direction of route) assert.equal(trail.move(direction), 'moved');
      assert.equal(trail.distance, 0);
      assert.equal(trail.nextStep, null);
      assert.equal(trail.dig(), i === 3 ? 'vault' : 'found');
      assert.equal(trail.dig(), 'ignored');
      assert.equal(trail.move('east'), 'ignored');
      assert.equal(trail.completed, i === 3 ? 3 : i + 1);
      if (i < 3) {
        assert.equal(trail.ownedKeys.length, i + 1);
        assert.equal(trail.advance(), true);
        assert.equal(trail.advance(), false);
      }
    }
    assert.equal(trail.phase, 'unlocking');
    assert.equal(trail.advance(), false);
    assert.equal(trail.turnKey('unknown'), 'ignored');
    for (let i = 0; i < 3; i++) {
      const wrong = KEYS.find(key => key.id !== trail.lockOrder[i]).id;
      assert.equal(trail.turnKey(wrong), 'retry');
      assert.equal(trail.unlocked, i);
      assert.equal(trail.turnKey(trail.lockOrder[i]), i === 2 ? 'complete' : 'unlocked');
      assert.equal(trail.unlocked, i + 1);
    }
    assert.equal(trail.phase, 'complete');
    assert.equal(trail.completed, 4);
    assert.equal(trail.turnKey(trail.lockOrder[2]), 'ignored');
    assert.equal(trail.dig(), 'ignored');
  }
  assert.ok(routes.size > 450, 'Voyages should have varied hiding places');
});

test('island exploration reveals nearby places, collects each shell once, and rescues Tilly once', () => {
  const trail = new TreasureTrail(randomGenerator());
  assert.equal(trail.isVisible('A5'), true);
  assert.equal(trail.isVisible('A4'), true);
  assert.equal(trail.isVisible('B5'), true);
  assert.equal(trail.isVisible('B4'), false);
  const special = [...trail.missions.map(mission => mission.cell), ...trail.shellSpots, trail.turtleCell, 'A5', ...ROCKS];
  assert.equal(new Set(special).size, special.length);
  assert.equal(trail.shellSpots.length, 5);
  for (const goal of [...trail.shellSpots, trail.turtleCell]) {
    for (const direction of routeBetween(trail.cell, goal)) trail.move(direction);
    assert.ok(trail.visited.has(goal));
    assert.ok(trail.isVisible(goal));
  }
  assert.equal(trail.shells.size, 5);
  assert.equal(trail.rescued, true);
  for (const direction of routeBetween(trail.cell, 'A5')) trail.move(direction);
  for (const goal of [...trail.shellSpots, trail.turtleCell]) {
    for (const direction of routeBetween(trail.cell, goal)) trail.move(direction);
    assert.equal(trail.lastEvent, null);
  }
  assert.equal(trail.shells.size, 5);
  assert.equal(trail.rescued, true);
  assert.ok(trail.visited.size <= 21);
  assert.ok(trail.steps >= trail.visited.size - 1);
});

test('automatic island routes reject invalid destinations and never cross rocks or edges', () => {
  assert.equal(islandPath('A5', 'A5').length, 0);
  for (const cell of ['A0', 'A6', 'F3', 'B2', '', 'A11']) assert.equal(islandPath('A5', cell), null);
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
    const goal = coordinate(x, y);
    if (ROCKS.includes(goal)) continue;
    const trail = new TreasureTrail(() => 0);
    for (const direction of islandPath('A5', goal)) assert.equal(trail.move(direction), 'moved');
    assert.equal(trail.cell, goal);
  }
  const constantVoyages = [() => 0, () => .99999].map(random => new TreasureTrail(random));
  assert.notDeepEqual(constantVoyages[0].missions, constantVoyages[1].missions);
});

test('mountains block movement without moving or penalising the explorer', () => {
  const trail = new TreasureTrail();
  for (const direction of routeBetween(trail.cell, 'B3')) trail.move(direction);
  assert.equal(trail.move('north'), 'rock');
  assert.equal(trail.cell, 'B3');
  assert.equal(trail.completed, 0);
  for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) assert.deepEqual(position(coordinate(x, y)), { x, y });
});

test('club progress is local, bounded, validated, and safe with blocked storage', () => {
  let text = null;
  const storage = { getItem: () => text, setItem: (_, value) => { text = value; } };
  assert.deepEqual(readClub(storage), { sound: true, completed: {} });
  recordCompletion('flags', storage);
  recordCompletion('flags', storage);
  assert.equal(readClub(storage).completed.flags, 2);
  recordCompletion('unknown', storage);
  assert.equal(Object.keys(readClub(storage).completed).length, 1);
  text = '{"sound":false,"completed":{"flags":10000,"maths":-3,"transport":"bad","unknown":1}}';
  assert.deepEqual(readClub(storage), { sound: false, completed: { flags: 999 } });
  text = '{corrupt';
  assert.deepEqual(readClub(storage), { sound: true, completed: {} });
  const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  assert.deepEqual(readClub(blocked), { sound: true, completed: {} });
  assert.doesNotThrow(() => writeClub({ sound: false, completed: {} }, blocked));
  assert.doesNotThrow(() => recordCompletion('maths', blocked));
});
