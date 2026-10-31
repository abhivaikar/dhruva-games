import { GAMES } from './catalog.js';
import { illustration, rocketArt } from './art.js';
import { readClub, writeClub, recordCompletion } from './progress.js';
import { RoundSession } from './rounds.js';
import { flagsDeck, transportDeck, worldDeck } from './decks.js';
import { mathsDeck, MATH_LEVELS } from './maths.js';
import { WORLD_PATHS } from './data/world-paths.js';
import { project } from './data/countries.js';
import { TreasureTrail, TREASURES, ROCKS, DIRECTIONS, coordinate } from './treasure.js';
import { ROUTE } from '../route.js';
import { AudioGuide } from '../audio.js';

const $ = selector => document.querySelector(selector);
const root = $('#play-root');
const id = new URLSearchParams(location.search).get('game');
const game = GAMES.find(item => item.id === id && id !== 'mrt-adventure');
const settings = readClub();
const audio = new AudioGuide(settings.sound);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let session = null;
let trail = null;
let mathLevel = 'lower';
let feedback = '';
let keyboardMode = false;
let recorded = false;

const DESCRIPTIONS = {
  transport: { symbol: '🚆', eyebrow: 'YOU’RE THE DISPATCHER', title: 'Let’s get Singapore moving!', text: 'Follow real station names, read the train display, and discover MRT lines and buses.', button: 'Start dispatching', finish: 'Brilliant dispatching!', reward: 'Eight little missions. Singapore’s rides are in good hands.' },
  maths: { symbol: '🚀', eyebrow: 'SMALL SUMS. BIG IDEAS.', title: 'Let’s build a rocket!', text: 'Each puzzle adds a little spark to your rocket. Choose a practice level and take your time.', button: 'Start building', finish: 'Ready for lift-off!', reward: 'Eight puzzles solved. A rocket full of brilliant ideas.' },
  'world-map': { symbol: '🌍', eyebrow: 'A LITTLE TRIP AROUND THE WORLD', title: 'Where shall we explore?', text: 'Find the country on a real world map. Tap a highlighted place or its A, B, C button.', button: 'Explore the world', finish: 'Wonderful world explorer!', reward: 'Eight countries discovered. There’s a whole world to wonder about.' },
  'treasure-map': { symbol: '🧭', eyebrow: 'YOUR COMPASS IS READY', title: 'An island full of treasure!', text: 'Find the square in your clue. Use the arrows to walk, then dig. Letters go across; numbers go down.', button: 'Explore the island', finish: 'Treasure trail complete!', reward: 'Four hidden treasures! Your compass and map led the way.' },
  flags: { symbol: '⚑', eyebrow: 'CALLING ALL FLAG DETECTIVES', title: 'Spot a little clue!', text: 'Look for colours, shapes and stars. Match flags and countries to collect eight little postcards.', button: 'Start discovering', finish: 'Fantastic flag detective!', reward: 'Eight flag postcards collected. What colourful discoveries!' },
};

function announce(text, speak = true) {
  $('#club-announcement').textContent = text;
  if (speak) audio.speak(text);
}

function soundButton() {
  const button = $('#club-sound');
  button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z"/>${audio.enabled ? '<path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>' : '<path d="m16 9 5 6m0-6-5 6"/>'}</svg>`;
  button.setAttribute('aria-label', `Turn sound ${audio.enabled ? 'off' : 'on'}`);
  button.setAttribute('aria-pressed', String(audio.enabled));
  button.title = audio.enabled ? 'Sound on' : 'Sound off';
}

function intro(status = 'A little adventure awaits') {
  return `<div class="play-intro"><div><p class="eyebrow">${game.badge}</p><h1>${game.title}</h1><p>${game.detail}</p></div><span class="round-status">${status}</span></div>`;
}

function setup() {
  session = null;
  trail = null;
  feedback = '';
  keyboardMode = false;
  const description = DESCRIPTIONS[id];
  root.innerHTML = `${intro()}<div class="play-arena" id="game-board"><div class="play-scene">${illustration(game.art)}</div><section class="play-panel" aria-labelledby="setup-title"><div class="setup-symbol" aria-hidden="true">${description.symbol}</div><p class="eyebrow">${description.eyebrow}</p><h2 id="setup-title">${description.title}</h2><p class="panel-copy">${description.text}</p>${id === 'maths' ? `<fieldset class="level-picker"><legend>Choose a little challenge</legend>${Object.entries(MATH_LEVELS).map(([value, level]) => `<label class="level-choice"><input type="radio" name="math-level" value="${value}" ${mathLevel === value ? 'checked' : ''}><span><strong>${level.label} · ${level.title}</strong><small>${level.description}</small></span></label>`).join('')}</fieldset>` : ''}<button class="club-primary" type="button" data-action="start">${description.button} <span aria-hidden="true">→</span></button><p class="setup-note">No rush. Every try helps you learn.</p></section></div>`;
}

function start() {
  if (session || trail) return;
  recorded = false;
  feedback = '';
  keyboardMode = false;
  if (id === 'treasure-map') {
    trail = new TreasureTrail();
    renderTrail();
    announce(`Find the treasure at ${trail.target}. Letters go across the top. Numbers go down the side. Use the arrows to move, then dig here.`);
  } else {
    const decks = { transport: transportDeck, flags: flagsDeck, 'world-map': worldDeck, maths: () => mathsDeck(mathLevel) };
    session = new RoundSession(decks[id]());
    renderRound();
    speakQuestion();
  }
  scrollToBoard();
}

function scrollToBoard() {
  if (window.matchMedia('(max-width: 650px)').matches) $('#game-board')?.scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}

function speakQuestion() {
  announce(session.current.spokenPrompt || session.current.prompt);
}

function mapScene(q) {
  const colours = ['#ba86ac', '#e3b04f', '#6eaba8'];
  return `<h3>A LITTLE WORLD. SO MUCH TO EXPLORE.</h3><svg class="world-map" viewBox="0 0 720 290" aria-label="World map with three highlighted locations" role="group">${WORLD_PATHS.map(country => `<path class="land-outline" d="${country.path}"/>`).join('')}${q.choices.map((choice, i) => {
    const [x, y] = project(choice.country.lon, choice.country.lat);
    const outline = WORLD_PATHS.find(item => item.id === choice.country.mapId);
    const disabled = session.phase !== 'question' || session.tried.has(choice.id);
    return `<g class="map-location ${session.phase === 'feedback' && choice.id === q.answerId ? 'is-correct' : ''}" role="button" tabindex="${disabled ? '-1' : '0'}" data-map-answer="${choice.id}" aria-disabled="${disabled}" aria-label="Choose ${choice.label}" style="--map-colour:${colours[i]}">${outline ? `<path class="map-highlight" d="${outline.path}"/>` : ''}<circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y + 5}" text-anchor="middle">${String.fromCharCode(65 + i)}</text></g>`;
  }).join('')}</svg><p class="map-note">Tap a highlighted place, or choose A, B, C.<br>Small countries, including Singapore, use locator dots.</p>`;
}

function transportScene(q) {
  if (q.kind === 'line') return `<div class="line-display"><div class="line-disc" style="--line-colour:${q.line.colour}">${q.line.id}</div><span class="line-colour-name">The ${q.line.colourName} line</span><p class="map-note">Line colours help us find our way.</p></div>`;
  if (q.kind === 'vehicle') return `<div class="transport-art">${illustration('transport')}</div><p class="scene-eyebrow">ROADS OR RAILS?</p><p class="map-note">A little clue: look for wheels and tyres.</p>`;
  const current = ROUTE[q.startIndex];
  const from = Math.max(0, Math.min(ROUTE.length - 5, q.startIndex - 2));
  return `<div class="departure-board"><small>YOUR TRAIN’S DESTINATION DISPLAY</small><strong>${q.direction === 1 ? '→' : '←'} ${q.destination}</strong><span>Now at ${current.name} · ${current.code}</span></div><div class="mini-route" aria-label="Nearby stations in North East Line order">${ROUTE.slice(from, from + 5).map(station => `<div class="mini-stop ${station.code === current.code ? 'here' : ''}">${station.name}<small>${station.code}${station.code === current.code ? ' · YOU ARE HERE' : ''}</small></div>`).join('')}</div><div class="transport-art">${illustration('train')}</div>`;
}

function mathsVisual(q) {
  const m = q.meta;
  if (['add', 'subtract'].includes(m.operation)) {
    const dots = Array.from({ length: m.operation === 'add' ? m.a + m.b : m.a }, (_, i) => `<i class="math-dot ${m.operation === 'add' && i >= m.a ? 'second' : ''} ${m.operation === 'subtract' && i >= m.a - m.b ? 'removed' : ''}"></i>`).join('');
    return `<div class="math-visual"><p>${m.operation === 'add' ? 'Two groups join together.' : 'Count the dots that stay.'}</p><div class="math-dots" aria-hidden="true">${dots}</div></div>`;
  }
  if (m.operation === 'fraction') return `<div class="math-visual"><p>Same-size pieces. Two colours to help.</p><div class="fraction-strip" aria-hidden="true">${Array.from({ length: m.denominator }, (_, i) => `<i class="${i < m.a ? 'part-a' : i < m.a + m.b ? 'part-b' : ''}"></i>`).join('')}</div></div>`;
  return `<div class="math-visual"><p>${session.completed} of 8 rocket sparks collected</p><span aria-hidden="true">${'✦ '.repeat(session.completed)}${'· '.repeat(8 - session.completed)}</span></div>`;
}

function scene(q) {
  if (id === 'world-map') return `<section class="play-scene world-scene" aria-label="World map">${mapScene(q)}</section>`;
  if (id === 'maths') return `<section class="play-scene maths-scene" aria-label="Your rocket workshop">${rocketArt(session.completed)}${mathsVisual(q)}</section>`;
  if (id === 'transport') return `<section class="play-scene transport-display" aria-label="Your transport mission">${transportScene(q)}</section>`;
  return `<section class="play-scene flag-display" aria-label="Your flag discovery">${q.mode === 'name' ? `<img src="./assets/flags/${q.country.id}.svg" alt="${q.country.description}"><p class="scene-eyebrow">A POSTCARD FROM SOMEWHERE WONDERFUL</p>` : `<div class="setup-symbol" aria-hidden="true">🌍</div><p class="country-postcard">${q.country.name}</p><p class="panel-copy">Which flag shall we pack?</p>`}</section>`;
}

function progress(completed, total, label) {
  return `<section class="progress-shelf" aria-label="Adventure progress"><p>${label}</p><div class="progress-dots" aria-label="${completed} of ${total} discoveries">${Array.from({ length: total }, (_, i) => `<span class="progress-dot ${i < completed ? 'done' : ''} ${i === completed ? 'current' : ''}" aria-hidden="true">${i < completed ? '★' : '·'}</span>`).join('')}</div></section>`;
}

function renderRound() {
  if (session.phase === 'complete') { finish(); return; }
  const q = session.current;
  const correct = session.phase === 'feedback';
  const choicesClass = id === 'maths' || id === 'world-map' ? 'numeric-choices' : id === 'flags' && q.mode === 'find' ? 'flag-choices' : '';
  root.innerHTML = `${intro(`Discovery ${session.index + 1} of ${session.questions.length}`)}<div class="play-arena" id="game-board">${scene(q)}<section class="play-panel" aria-labelledby="question-title"><p class="eyebrow">${correct ? 'YOU DID IT, EXPLORER!' : id === 'maths' ? MATH_LEVELS[mathLevel].label.toUpperCase() : 'A LITTLE CLUE. A LITTLE DISCOVERY.'}</p><h2 id="question-title" class="${id === 'maths' ? `maths-prompt ${q.prompt.length < 25 ? 'short' : 'long'}` : ''}">${q.prompt}</h2><div class="choice-list ${choicesClass}" role="group" aria-label="Choose your answer">${q.choices.map((choice, i) => `<button class="choice-button ${correct && choice.id === q.answerId ? 'correct' : ''} ${keyboardMode && session.selected === i && !correct ? 'keyboard-selected' : ''}" type="button" data-choice="${choice.id}" ${id === 'world-map' ? `aria-label="${choice.label}"` : ''} ${correct || session.tried.has(choice.id) ? 'disabled' : ''}>${choice.flag ? `<img src="./assets/flags/${choice.flag}.svg" alt="${choice.label}"><span class="flag-option-label">Option ${i + 1}</span>` : `${choice.icon ? `<span class="choice-icon" aria-hidden="true">${choice.icon}</span>` : ''}<span>${id === 'world-map' ? `${choice.label.replace('Location ', '')}<small>LOCATION</small>` : choice.label}${choice.small ? `<small>${choice.small}</small>` : ''}</span>`}</button>`).join('')}</div><p class="round-feedback ${correct ? 'success' : ''}">${correct ? `★ ${q.explanation}` : feedback || (id === 'world-map' ? 'Follow the clue. Choose location A, B or C.' : 'Take your time. You can try again.')}</p>${correct ? `<button type="button" class="club-primary" data-action="next">${session.completed === session.questions.length ? 'See my discoveries' : 'Next discovery'} <span aria-hidden="true">→</span></button>` : '<div class="next-placeholder">A little thinking space. No rush.</div>'}${!correct ? '<div class="play-tools"><button type="button" class="soft-button" data-action="repeat">♪ Hear again</button><button type="button" class="soft-button" data-action="hint">✧ A little clue</button></div>' : ''}</section></div>${progress(session.completed, session.questions.length, id === 'maths' ? 'Every puzzle adds a rocket spark.' : 'A little discovery at every step.')}`;
}

function answer(choice) {
  const result = session.answer(choice);
  if (result === 'ignored') return;
  if (result === 'retry') {
    feedback = 'Good try! Have another look. A little clue can help.';
    session.select(1);
    renderRound();
    announce(feedback);
    if (keyboardMode) focusChoice();
  } else {
    renderRound();
    audio.celebrate();
    announce(`Great exploring! ${session.current.explanation}`);
    confetti(false);
    if (keyboardMode) $('[data-action="next"]').focus({ preventScroll: true });
  }
}

function focusChoice() {
  const buttons = [...root.querySelectorAll('[data-choice]')];
  buttons.forEach((button, i) => button.classList.toggle('keyboard-selected', i === session.selected));
  buttons[session.selected]?.focus({ preventScroll: true });
}

function islandGrid() {
  const found = TREASURES.slice(0, trail.completed);
  const treasureFound = trail.phase === 'found';
  const clue = treasureFound ? TREASURES[trail.completed - 1] : trail.target;
  let cells = '<span></span>' + Array.from({ length: 5 }, (_, x) => `<span class="grid-heading">${String.fromCharCode(65 + x)}</span>`).join('');
  for (let y = 0; y < 5; y++) {
    cells += `<span class="grid-heading">${y + 1}</span>`;
    for (let x = 0; x < 5; x++) {
      const cell = coordinate(x, y);
      const rock = ROCKS.includes(cell);
      const here = trail.cell === cell;
      const collected = found.includes(cell);
      cells += `<button type="button" class="island-cell ${rock ? 'rock' : ''} ${here ? 'player' : ''} ${collected ? 'found' : ''}" data-cell="${cell}" aria-label="${cell}${here ? ', you are here' : rock ? ', rock' : collected ? ', treasure found' : ''}" ${rock || trail.phase !== 'exploring' ? 'disabled' : ''}><span aria-hidden="true">${here ? '🧭' : rock ? '⛰' : collected ? '🪙' : (x + y) % 4 === 0 ? '🌴' : ''}</span><span class="cell-code" aria-hidden="true">${cell}</span></button>`;
    }
  }
  return `<div class="island-mobile-status"><span>${treasureFound ? 'FOUND IT!' : 'FIND THE TREASURE'}</span><strong>${clue}</strong><span>You are at <b>${trail.cell}</b></span></div><div class="compass-label">↑ NORTH · LETTERS ACROSS · NUMBERS DOWN</div><div class="island-grid" role="group" aria-label="Treasure island coordinates">${cells}</div><div class="island-mobile-ui">${treasureFound ? '' : `<div class="island-arrow-row" role="group" aria-label="Move your explorer">${[['north','↑'],['east','→'],['south','↓'],['west','←']].map(([direction, arrow]) => `<button type="button" data-direction="${direction}" aria-label="Move ${direction}">${arrow}<small>${direction}</small></button>`).join('')}</div>`}<p class="round-feedback ${treasureFound ? 'success' : ''}">${treasureFound ? '★ You found a little treasure!' : feedback || 'Tap a neighbouring square, or use the arrows.'}</p><button type="button" class="club-primary" data-action="${treasureFound ? 'next-treasure' : 'dig'}">${treasureFound ? trail.completed === 4 ? 'See my treasures' : 'Next treasure' : 'Dig here'} <span aria-hidden="true">${treasureFound ? '→' : '✦'}</span></button><button type="button" class="soft-button" data-action="repeat">♪ Hear my clue</button></div><p class="map-note">Walk one square at a time.<br>Mountains are rocks to walk around.</p>`;
}

function renderTrail() {
  if (trail.phase === 'complete') { finish(); return; }
  const found = trail.phase === 'found';
  const clue = found ? TREASURES[trail.completed - 1] : trail.target;
  root.innerHTML = `${intro(`Treasure ${Math.min(trail.completed + (found ? 0 : 1), TREASURES.length)} of 4`)}<div class="play-arena" id="game-board"><section class="play-scene island-scene" aria-label="Your treasure island">${islandGrid()}</section><section class="play-panel trail-panel" aria-labelledby="trail-title"><p class="eyebrow">${found ? 'TREASURE DISCOVERED!' : 'YOUR LITTLE MAP CLUE'}</p><h2 id="trail-title">${found ? 'You found it, navigator!' : 'Find the treasure at…'}</h2><div class="coordinate-clue">${clue}</div><p class="position-label">You are at <strong>${trail.cell}</strong></p>${found ? '' : `<div class="compass-controls" role="group" aria-label="Move your explorer"><button class="north" type="button" data-direction="north" aria-label="Move north">↑<small>NORTH</small></button><button class="west" type="button" data-direction="west" aria-label="Move west">←<small>WEST</small></button><span class="compass-centre" aria-hidden="true">✧</span><button class="east" type="button" data-direction="east" aria-label="Move east">→<small>EAST</small></button><button class="south" type="button" data-direction="south" aria-label="Move south">↓<small>SOUTH</small></button></div>`}<p class="round-feedback ${found ? 'success' : ''}">${found ? '★ A little treasure for your explorer’s pocket!' : feedback || 'Match the letter and number. Then dig!'}</p><button type="button" class="club-primary" data-action="${found ? 'next-treasure' : 'dig'}">${found ? trail.completed === 4 ? 'See my treasures' : 'Next treasure' : 'Dig here'} <span aria-hidden="true">${found ? '→' : '✦'}</span></button><p class="treasure-hint">Letters A–E go from left to right.<br>Numbers 1–5 go from top to bottom.</p><div class="play-tools"><button type="button" class="soft-button" data-action="repeat">♪ Hear my clue</button></div></section></div>${progress(trail.completed, 4, 'Four little treasures are waiting.')}`;
}

function move(direction) {
  const result = trail.move(direction);
  if (result === 'ignored') return;
  feedback = result === 'edge' ? 'That’s the edge of our island. Try another direction.' : result === 'rock' ? 'A mountain is in the way. Let’s go around it.' : `You’re at ${trail.cell}. Ready to explore!`;
  renderTrail();
  announce(result === 'moved' ? trail.cell : feedback);
  if (keyboardMode) [...root.querySelectorAll('[data-action="dig"]')].find(button => button.getClientRects().length)?.focus({ preventScroll: true });
}

function finish() {
  if (!recorded) { recordCompletion(id); recorded = true; confetti(true); audio.celebrate(true); announce(DESCRIPTIONS[id].finish); }
  const countries = session?.questions.filter(q => q.country).map(q => q.country) || [];
  root.innerHTML = `${intro('Adventure complete!')}<section class="completion-arena" id="game-board"><div class="completion-art">${id === 'maths' ? rocketArt(8) : illustration(game.art)}</div><div class="completion-copy"><div class="big-medal" aria-hidden="true">🏅</div><p class="eyebrow">A LOVELY LITTLE “I DID IT!”</p><h2>${DESCRIPTIONS[id].finish}</h2><p>${DESCRIPTIONS[id].reward}</p>${countries.length ? `<div class="collected-flags" aria-label="Your discoveries">${countries.map(country => `<img src="./assets/flags/${country.id}.svg" alt="${country.name}" title="${country.name}">`).join('')}</div>` : `<p aria-label="${id === 'treasure-map' ? 'Four' : 'Eight'} discoveries">${'⭐ '.repeat(id === 'treasure-map' ? 4 : 8)}</p>`}<button class="club-primary" type="button" data-action="replay">Play again <span aria-hidden="true">→</span></button><a class="back-link" href="./">Choose another adventure ↗</a></div></section>`;
}

function confetti(final) {
  if (reducedMotion.matches) return;
  const colours = ['#b8a0ce', '#edc773', '#9fbea2', '#d5a0ad', '#8db8c9'];
  $('#club-confetti').innerHTML = Array.from({ length: final ? 50 : 15 }, (_, i) => `<i style="--left:${Math.random() * 100}%;--delay:${Math.random() * .35}s;--colour:${colours[i % colours.length]}"></i>`).join('');
}

root.addEventListener('change', event => {
  if (event.target.name === 'math-level' && MATH_LEVELS[event.target.value]) mathLevel = event.target.value;
});

root.addEventListener('click', event => {
  const button = event.target.closest('button, [data-map-answer]');
  if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
  audio.unlock();
  if (button.hasAttribute('data-choice')) { answer(button.dataset.choice); return; }
  if (button.hasAttribute('data-map-answer')) { answer(button.dataset.mapAnswer); return; }
  if (button.hasAttribute('data-direction')) { move(button.dataset.direction); return; }
  if (button.hasAttribute('data-cell')) {
    if (!trail || trail.phase !== 'exploring') return;
    const cell = button.dataset.cell;
    const dx = cell.charCodeAt(0) - 65 - trail.x, dy = Number(cell[1]) - 1 - trail.y;
    const entry = Object.entries(DIRECTIONS).find(([, [x, y]]) => x === dx && y === dy);
    if (entry) move(entry[0]);
    else { feedback = 'One square at a time. Use the compass arrows to walk.'; renderTrail(); announce(feedback); }
    return;
  }
  const action = button.dataset.action;
  if (action === 'start') start();
  else if (action === 'replay') { setup(); scrollToBoard(); }
  else if (action === 'next' && session.advance()) { feedback = ''; keyboardMode = false; renderRound(); if (session.phase === 'question') speakQuestion(); scrollToBoard(); }
  else if (action === 'next-treasure' && trail.advance()) { feedback = ''; renderTrail(); if (trail.phase === 'exploring') announce(`Find the treasure at ${trail.target}.`); scrollToBoard(); }
  else if (action === 'repeat') {
    if (!audio.enabled) { audio.enabled = true; settings.sound = true; writeClub({ ...readClub(), sound: true }); audio.unlock(); soundButton(); }
    if (trail) announce(trail.phase === 'found' ? `You found the treasure at ${trail.cell}!` : `Find the treasure at ${trail.target}. You are at ${trail.cell}.`);
    else speakQuestion();
  } else if (action === 'hint' && session?.phase === 'question') {
    feedback = session.current.hint; renderRound(); announce(feedback);
  } else if (action === 'dig') {
    const result = trail.dig();
    if (result === 'ignored') return;
    if (result === 'found') { feedback = ''; renderTrail(); confetti(false); audio.celebrate(); announce(`You found the treasure at ${trail.cell}!`); }
    else { feedback = `Not quite yet. Your clue says ${trail.target}. You are at ${trail.cell}. Keep exploring!`; renderTrail(); announce(feedback); }
  }
});

root.addEventListener('focusin', event => {
  const button = event.target.closest('[data-choice]');
  if (button && session?.phase === 'question') session.selected = session.current.choices.findIndex(choice => choice.id === button.dataset.choice);
});
document.addEventListener('pointerdown', () => { keyboardMode = false; document.querySelectorAll('.keyboard-selected').forEach(button => button.classList.remove('keyboard-selected')); });
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || !game) return;
  const mapButton = event.target.closest('[data-map-answer]');
  if (mapButton && ['Enter', ' '].includes(event.key)) {
    event.preventDefault();
    if (!event.repeat && mapButton.getAttribute('aria-disabled') !== 'true') {
      audio.unlock();
      answer(mapButton.dataset.mapAnswer);
    }
    return;
  }
  const allowed = event.target === document.body || root.contains(event.target) && !event.target.matches('input, a');
  if (!allowed) return;
  if (trail?.phase === 'exploring' && ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(event.key)) {
    event.preventDefault(); if (!event.repeat) { keyboardMode = true; audio.unlock(); move({ ArrowUp: 'north', ArrowRight: 'east', ArrowDown: 'south', ArrowLeft: 'west' }[event.key]); } return;
  }
  if (session?.phase !== 'question') return;
  const answerFocus = event.target === document.body || event.target.closest('[data-choice]');
  if (!answerFocus || !['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) return;
  event.preventDefault(); if (event.repeat) return;
  keyboardMode = true; audio.unlock();
  if (event.key === ' ') answer(session.current.choices[session.selected].id);
  else { session.select(event.key === 'ArrowLeft' ? -1 : 1); focusChoice(); }
});

$('#club-sound').addEventListener('click', () => {
  audio.enabled = !audio.enabled;
  writeClub({ ...readClub(), sound: audio.enabled });
  if (audio.enabled) audio.unlock(); else audio.stop();
  soundButton();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) audio.stop(); });
window.addEventListener('pagehide', () => audio.stop());

soundButton();
if (game) {
  document.title = `${game.title} · Dhruva’s Discovery Club`;
  document.documentElement.style.setProperty('--accent', game.colour);
  document.documentElement.style.setProperty('--soft', { transport: '#e1ece5', maths: '#f0e5d8', 'world-map': '#e1edf4', 'treasure-map': '#e7eddc', flags: '#f1e4e9' }[id]);
  setup();
} else {
  root.innerHTML = '<section class="play-panel" style="margin:35px 0"><div class="setup-symbol" aria-hidden="true">🧭</div><h1>Let’s find an adventure</h1><p class="panel-copy">Choose a game from the Discovery Club.</p><a class="club-primary" href="./">See all games →</a></section>';
}
