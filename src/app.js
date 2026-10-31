import { Journey } from './game.js';
import { ROUTE, LEVELS, JOURNEY_START, JOURNEY_END } from './route.js';
import { WORLDS, TRAIN_COLOURS, CountingHelper, activityQuestion, activityHint, objectArt, conductor, stationArt } from './adventure.js';
import { AudioGuide } from './audio.js';
import { loadPreferences, savePreferences } from './preferences.js';
import { shortcutAction } from './input.js';
import { recordCompletion } from './club/progress.js';

const $ = selector => document.querySelector(selector);
const preferences = loadPreferences();
const audio = new AudioGuide(preferences.sound);
let game = new Journey(preferences.level);
let pending = null;
let keyboardMode = false;
let feedback = '';
let counting = new CountingHelper();
let countableIds = new Set();
let tokenCursor = 0;
let sceneIndex = -1;
let bellTimer = null;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const soundIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>';
const mutedIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4zm5 4 5 6m0-6-5 6"/></svg>';
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';

function announce(text) { $('#announcement').textContent = text; }

function schedule(callback, delay) {
  clearTimeout(pending?.id);
  pending = { callback, remaining: delay, started: performance.now(), id: null };
  if (!$('#settings').open) {
    pending.id = setTimeout(() => {
      const run = pending.callback;
      pending = null;
      run();
    }, delay);
  }
}

function pause() {
  if (pending && pending.id !== null) {
    clearTimeout(pending.id);
    pending.remaining = Math.max(0, pending.remaining - (performance.now() - pending.started));
    pending.id = null;
  }
  audio.stop();
}

function resume() {
  if (pending) schedule(pending.callback, pending.remaining);
}

function renderSound() {
  const button = $('#sound');
  button.innerHTML = audio.enabled ? soundIcon : mutedIcon;
  button.setAttribute('aria-pressed', String(audio.enabled));
  button.setAttribute('aria-label', `Turn sound ${audio.enabled ? 'off' : 'on'}`);
  button.title = audio.enabled ? 'Sound on' : 'Sound off';
}

function renderRoute() {
  $('#route').innerHTML = ROUTE.map((station, i) => {
    const done = i < game.completed;
    const current = i === game.index && game.phase !== 'complete';
    return `<li class="${done ? 'done' : ''} ${current ? 'current' : ''}" ${current ? 'aria-current="step"' : ''}>
      <span class="route-node" aria-hidden="true">${done ? WORLDS[i].icon : current ? '●' : '?'}</span>
      <span class="route-code">${station.code}</span><span class="route-name">${station.name}<span class="sr-only">${done ? ', completed' : current ? ', current stop' : ', upcoming'}</span></span></li>`;
  }).join('');
  $('#route-progress').textContent = `${game.completed} of ${ROUTE.length} treasures discovered`;
  const recentTreasures = WORLDS.slice(0, game.completed).slice(-5).map(world => world.icon).join(' ');
  $('#stamp-count').textContent = game.completed ? `${recentTreasures}${game.completed > 5 ? ` +${game.completed - 5}` : ''}` : 'A surprise at every stop!';
  $('#stamp-count').setAttribute('aria-label', `${game.completed} of ${ROUTE.length} souvenirs collected`);
  // Follow the current stop inside the phone's passport without moving the page.
  const scroll = $('#route-scroll');
  const currentStop = $('#route [aria-current="step"]');
  if (currentStop && scroll.scrollHeight > scroll.clientHeight) {
    const top = currentStop.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop;
    scroll.scrollTop = Math.max(0, top - scroll.clientHeight / 2);
  }
}

function objects(number, crossed = false) {
  if (!number) return '<span class="zero-object">0</span>';
  return `<span class="object-group ${number > 5 ? 'compact' : ''} ${crossed ? 'subtracted' : ''}">${Array.from({ length: number }, () => {
    const id = tokenCursor++;
    if (crossed) return `<span class="crossed-token" aria-hidden="true">${objectArt(game.index)}</span>`;
    countableIds.add(id);
    const counted = counting.counted.has(id);
    return `<button type="button" class="count-token ${counted ? 'counted' : ''}" data-count-item="${id}" aria-label="Count ${WORLDS[game.index].noun} ${id + 1}" aria-pressed="${counted}" ${game.phase === 'celebrating' ? 'disabled' : ''}>${objectArt(game.index)}<span class="count-tick" aria-hidden="true">✓</span></button>`;
  }).join('')}</span>`;
}

function questionVisual(q) {
  tokenCursor = 0;
  countableIds = new Set();
  if (q.kind === 'count') return `<h2 class="count-equation">How many ${WORLDS[game.index].plural}?</h2><div class="objects" role="group" aria-label="Tap to count ${WORLDS[game.index].plural}">${objects(q.a)}</div>`;
  const subtraction = q.kind === 'subtract';
  // Subtraction starts with a stars in total; the crossed-out b stars are removed.
  const visual = subtraction ? `${objects(q.a - q.b)}${objects(q.b, true)}` : `${objects(q.a)}<span class="object-operator">+</span>${objects(q.b)}`;
  return `<h2 class="sr-only">${activityQuestion(q, game.index)}</h2><div class="equation" aria-hidden="true"><span>${q.a}</span><span class="math-symbol">${subtraction ? '−' : '+'}</span><span>${q.b}</span><span class="math-symbol">=</span><span class="question-mark">?</span></div><div class="objects" role="group" aria-label="${subtraction ? 'Count the ones that stay' : 'Count both groups'}">${visual}</div>`;
}

function renderQuestion() {
  const q = game.question;
  const success = game.phase === 'celebrating';
  const world = WORLDS[game.index];
  return `<p class="card-kicker"><span class="purple-dot"></span> ${success ? 'TREASURE DISCOVERED!' : `LITTLE MISSION ${game.index + 1} OF ${ROUTE.length}`}</p>
    <p class="mission-copy">${success ? world.praise : world.mission}</p>
    ${questionVisual(q)}
    <p class="count-help" id="count-help">${success ? 'Pip says: thank you, Captain!' : counting.counted.size ? `${counting.counted.size} counted${counting.counted.size === countableIds.size ? '! Which number matches?' : '… keep going!'}` : activityHint(q, game.index)}</p>
    <div class="answers" role="group" aria-label="Choose your answer">${q.choices.map((choice, i) => `<button type="button" class="answer ${success && choice === q.answer ? 'correct' : ''} ${keyboardMode && game.selected === i && !success ? 'keyboard-selected' : ''}" data-answer="${choice}" ${success || game.tried.has(i) ? 'disabled' : ''} aria-label="${choice}${game.tried.has(i) ? ', try another number' : ''}">${choice}</button>`).join('')}</div>
    <p class="feedback ${success ? 'success' : ''}">${success ? `${world.icon} ${world.treasure} is in your passport!` : feedback || 'Which number? Our train is waiting for you.'}</p>
    <button class="repeat-button" id="repeat" type="button" ${success ? 'disabled' : ''}>${soundIcon}<span>Hear it again</span></button>`;
}

function render() {
  const travelling = game.phase === 'travelling';
  const world = WORLDS[game.index];
  $('#scene').classList.toggle('travelling', travelling);
  $('#scene').classList.toggle('night-world', world.scene === 2 || world.scene === 4);
  $('#scene').classList.toggle('found-treasure', game.phase === 'celebrating');
  $('#scene').style.setProperty('--world-colour', world.colour);
  if (sceneIndex !== game.index) {
    $('#scenery').innerHTML = stationArt(game.index);
    sceneIndex = game.index;
  }
  $('#souvenir-peek').innerHTML = `<span aria-hidden="true">${world.icon}</span><small>${game.phase === 'celebrating' || game.phase === 'complete' ? 'FOUND IT!' : 'TODAY’S TREASURE'}</small>`;
  $('#souvenir-peek').setAttribute('aria-label', world.treasure);
  $('#station-code').textContent = game.station.code;
  $('#station-name').textContent = game.station.name;
  $('#station-prefix').textContent = game.phase === 'ready' ? 'YOUR ADVENTURE STARTS AT' : travelling ? 'NEXT STATION' : game.phase === 'complete' ? 'OUR HAPPY DESTINATION' : 'NOW AT';
  $('#scene-status').textContent = game.phase === 'ready' ? 'READY TO ROLL' : travelling ? 'ON OUR WAY' : game.phase === 'complete' ? 'WHAT AN ADVENTURE!' : 'HELLO, LITTLE EXPLORER';
  $('#scene-count').textContent = game.phase === 'ready' ? `${ROUTE.length} little worlds` : game.phase === 'complete' ? `${ROUTE.length} treasures found!` : `Stop ${game.index + 1} of ${ROUTE.length}`;
  $('#scene-caption').textContent = travelling ? world.greeting : game.phase === 'ready' ? 'Psst… tap your train for a ding-dong!' : game.station.landmark;
  $('#challenge').classList.toggle('is-complete', game.phase === 'complete');
  renderRoute();

  if (game.phase === 'ready') {
    $('#challenge').innerHTML = `<div class="conductor welcome-conductor">${conductor}<span class="conductor-hi">Hi, Dhruva!</span></div><p class="card-kicker">${ROUTE.length} STOPS. ${ROUTE.length} LITTLE SURPRISES.</p><h2>A treasure train adventure!</h2><p class="card-copy">I’m Pip, your train friend.<br>Let’s ride from ${JOURNEY_START.name} to ${JOURNEY_END.name}!</p><div class="train-picker" role="group" aria-label="Pick your train colour"><span>Pick your train</span>${Object.entries(TRAIN_COLOURS).map(([key, colour]) => `<button type="button" class="train-swatch" data-train-colour="${key}" style="--swatch:${colour.colour}" aria-label="${colour.name} train" aria-pressed="${preferences.train === key}"><span aria-hidden="true">${preferences.train === key ? '✓' : ''}</span></button>`).join('')}</div><button class="primary-button" id="start" type="button">All aboard! ${arrow}</button><p class="small-note">${LEVELS[game.level].name} <span>·</span> No rush. Just wonder.</p>`;
  } else if (travelling) {
    $('#challenge').innerHTML = `<div class="conductor travelling-conductor">${conductor}</div><p class="card-kicker">NEXT STOP</p><h2>${game.station.name}</h2><p class="card-copy">${world.greeting}</p><div class="mystery-treasure"><span aria-hidden="true">${world.icon}</span><small>A little treasure is waiting…</small></div><div class="travel-dots" aria-hidden="true"><i></i><i></i><i></i></div>`;
  } else if (game.phase === 'complete') {
    $('#challenge').innerHTML = `<div class="badge-medal" aria-hidden="true">🏅</div><p class="card-kicker">OFFICIAL NORTH-EAST EXPLORER</p><h2>You did it, Captain Dhruva!</h2><p class="card-copy">${ROUTE.length} little worlds. ${ROUTE.length} happy treasures.<br>Pip loved exploring with you!</p><div class="treasure-collection" aria-label="Your ${ROUTE.length} treasures">${WORLDS.map((item, i) => `<span class="treasure-sticker" role="img" aria-label="${item.treasure} from ${ROUTE[i].name}" style="--sticker-delay:${i * .1}s">${item.icon}</span>`).join('')}</div><div class="finish-ticket"><span>${JOURNEY_START.code}</span><span aria-hidden="true">→</span><strong>Dhruva’s explorer passport</strong><span aria-hidden="true">→</span><span>${JOURNEY_END.code}</span></div><button class="primary-button" id="again" type="button">Another adventure! ${arrow}</button>`;
  } else $('#challenge').innerHTML = renderQuestion();
}

function travel() {
  feedback = '';
  counting = new CountingHelper();
  keyboardMode = false;
  render();
  if (window.matchMedia('(max-width: 700px)').matches) {
    $('#scene').scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  const words = `Next station, ${game.station.name}!`;
  announce(words);
  audio.bell();
  audio.speak(words);
  schedule(() => {
    if (!game.arrive()) return;
    render();
    const question = `${game.station.name}! ${WORLDS[game.index].mission} ${activityQuestion(game.question, game.index)}`;
    announce(question);
    audio.speak(question);
  }, reducedMotion.matches ? 700 : 2100);
}

function confetti(final = false) {
  if (reducedMotion.matches) return;
  const colours = ['#b299cb', '#e5bb64', '#91bfa4', '#e5a4a0', '#8cb9c6'];
  $('#confetti').innerHTML = Array.from({ length: final ? 65 : 22 }, (_, i) => `<i style="--left:${Math.random() * 100}%;--delay:${Math.random() * .4}s;--color:${colours[i % colours.length]}"></i>`).join('');
}

function chooseAnswer(choice) {
  const result = game.answer(choice);
  if (result === 'ignored') return;
  if (result === 'retry') {
    feedback = 'Good try! Pip will help. Tap the pictures to count.';
    render();
    const hint = `${activityHint(game.question, game.index)} ${activityQuestion(game.question, game.index)}`;
    announce(hint);
    audio.speak(hint);
    if (keyboardMode) focusSelected();
    return;
  }
  render();
  announce(`Great job! You found ${WORLDS[game.index].treasure}!`);
  audio.celebrate();
  audio.speak(WORLDS[game.index].praise);
  confetti();
  schedule(() => {
    if (!game.advance()) return;
    if (game.phase === 'complete') {
      recordCompletion('mrt-adventure');
      render();
      confetti(true);
      audio.celebrate(true);
      const words = `We made it from ${JOURNEY_START.name} to ${JOURNEY_END.name}! ${ROUTE.length} treasures! You did it, Captain Dhruva! Thank you for riding with Pip!`;
      announce(words);
      audio.speak(words);
      $('#again').focus({ preventScroll: true });
    } else travel();
  }, 2800);
}

function focusSelected() {
  const buttons = [...document.querySelectorAll('.answer')];
  buttons.forEach((button, i) => button.classList.toggle('keyboard-selected', i === game.selected));
  buttons[game.selected]?.focus({ preventScroll: true });
}

$('#challenge').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  audio.unlock();
  if (button.hasAttribute('data-train-colour')) {
    preferences.train = button.dataset.trainColour;
    savePreferences(preferences);
    applyTrainColour();
    document.querySelectorAll('.train-swatch').forEach(swatch => {
      const selected = swatch.dataset.trainColour === preferences.train;
      swatch.setAttribute('aria-pressed', String(selected));
      swatch.querySelector('span').textContent = selected ? '✓' : '';
    });
    audio.bell();
    return;
  }
  if (button.hasAttribute('data-count-item')) {
    if (game.phase !== 'question') return;
    const count = counting.tap(Number(button.dataset.countItem), countableIds);
    if (count === null) return;
    button.classList.add('counted');
    button.setAttribute('aria-pressed', 'true');
    const finished = count === countableIds.size;
    $('#count-help').textContent = `${count} counted${finished ? '! Which number matches?' : '… keep going!'}`;
    announce(`${count}${finished ? '. Which number matches?' : ''}`);
    audio.count();
    audio.speak(String(count));
    return;
  }
  if (button.id === 'start') { if (game.start()) travel(); }
  else if (button.id === 'again') {
    game = new Journey(preferences.level);
    game.start();
    travel();
  } else if (button.id === 'repeat') {
    // A direct request to hear a question also turns sound back on.
    if (!audio.enabled) setSound(true);
    audio.speak(`${activityHint(game.question, game.index)} ${activityQuestion(game.question, game.index)}`);
  } else if (button.hasAttribute('data-answer')) chooseAnswer(Number(button.dataset.answer));
});

$('#challenge').addEventListener('focusin', event => {
  const buttons = [...document.querySelectorAll('.answer')];
  const index = buttons.indexOf(event.target);
  if (index >= 0 && !game.tried.has(index)) game.selected = index;
});

document.addEventListener('pointerdown', () => {
  keyboardMode = false;
  document.querySelectorAll('.keyboard-selected').forEach(button => button.classList.remove('keyboard-selected'));
});

document.addEventListener('keydown', event => {
  const target = event.target;
  const allowed = !$('#settings').open && (target === document.body || target.classList.contains('answer'));
  if (allowed && event.repeat && ['ArrowLeft', 'ArrowRight', ' ', 'Spacebar'].includes(event.key)) {
    event.preventDefault();
    return;
  }
  const action = shortcutAction(event, game.phase, allowed);
  if (!action) return;
  event.preventDefault();
  keyboardMode = true;
  audio.unlock();
  if (action === 'answer') chooseAnswer(game.question.choices[game.selected]);
  else { game.select(action === 'previous' ? -1 : 1); focusSelected(); }
});

function setSound(enabled) {
  audio.enabled = enabled;
  preferences.sound = enabled;
  if (!enabled) audio.stop();
  else audio.unlock();
  savePreferences(preferences);
  renderSound();
}
$('#sound').addEventListener('click', () => setSound(!audio.enabled));

function applyTrainColour() {
  const selected = TRAIN_COLOURS[preferences.train];
  document.documentElement.style.setProperty('--train-colour', selected.colour);
  document.documentElement.style.setProperty('--train-accent', selected.accent);
}

$('#train').addEventListener('click', () => {
  audio.unlock();
  audio.bell();
  $('#train').classList.add('ding-dong');
  $('#train-greeting').textContent = 'Ding-dong! Hello, Captain!';
  $('#train-greeting').classList.add('visible');
  clearTimeout(bellTimer);
  bellTimer = setTimeout(() => {
    $('#train').classList.remove('ding-dong');
    $('#train-greeting').classList.remove('visible');
  }, 1400);
});

$('#difficulty-options').innerHTML = Object.entries(LEVELS).map(([value, level]) => `<label class="level-option"><input type="radio" name="difficulty" value="${value}" ${value === preferences.level ? 'checked' : ''}><span class="level-icon" aria-hidden="true">${level.icon}</span><span><strong>${level.name}</strong><small>${level.description}</small></span></label>`).join('');
$('#settings-open').addEventListener('click', () => {
  $('#settings').showModal();
  pause();
  $('#settings-note').textContent = game.phase === 'ready' || game.phase === 'complete' ? 'Choose the maths for your next adventure.' : 'Your train is waiting. A new level starts on your next journey.';
});
$('#settings').addEventListener('change', event => {
  if (event.target.name !== 'difficulty') return;
  preferences.level = event.target.value;
  savePreferences(preferences);
  if (game.phase === 'ready') { game = new Journey(preferences.level); render(); }
});
$('#settings').addEventListener('close', resume);
document.addEventListener('visibilitychange', () => { if (document.hidden) audio.stop(); });
window.addEventListener('pagehide', () => { pause(); clearTimeout(bellTimer); });
window.addEventListener('pageshow', event => {
  if (event.persisted && !$('#settings').open) resume();
});

applyTrainColour();
renderSound();
render();
