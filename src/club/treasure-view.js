import { KEYS, ROCKS, DIRECTIONS, coordinate } from './treasure.js';
import { captainArt, parrotArt, keyArt, chestArt, landmarkArt, treasureSceneArt } from './treasure-art.js';

export { treasureSceneArt };
const directionArrow = { north: '↑', east: '→', south: '↓', west: '←' };
const keyFor = id => KEYS.find(key => key.id === id);

function keyRing(trail) {
  return `<div class="quest-keyring" aria-label="${Math.min(trail.completed, 3)} of 3 map pieces and shape keys found">${KEYS.map((key, i) => `<div class="quest-key-slot ${trail.completed > i ? 'collected' : ''}">${trail.completed > i ? keyArt(key) : '<span aria-hidden="true">?</span>'}<small>${trail.completed > i ? key.name : `Map piece ${i + 1}`}</small></div>`).join('')}</div>`;
}
function inventory(trail) {
  return `<div class="quest-inventory"><span aria-label="${trail.shells.size} of 5 sparkle shells"><span aria-hidden="true">🐚</span> <b>${trail.shells.size}/5</b> shells</span><span class="${trail.rescued ? 'rescued' : ''}"><span aria-hidden="true">🐢</span> ${trail.rescued ? 'Tilly rescued!' : 'Find Tilly'}</span><span><span aria-hidden="true">👣</span> ${trail.visited.size} ${trail.visited.size === 1 ? 'place' : 'places'}</span></div>`;
}
function missionTrail(trail) {
  return `<ol class="quest-stops" aria-label="Your voyage">${trail.missions.map((mission, i) => `<li class="${trail.completed > i ? 'done' : trail.completed === i ? 'current' : ''}"><span aria-hidden="true">${trail.completed > i ? '✓' : i + 1}</span><div><strong>${mission.name}</strong><small>${i < 3 ? `${KEYS[i].name} + map piece` : 'The lost Sunstone'}</small></div></li>`).join('')}</ol>`;
}
function nearbyHint(trail) {
  if (!trail.distance) return 'Treasure under your boots!';
  if (trail.distance <= 2) return 'So close! Follow your clue.';
  if (trail.distance <= 5) return 'Getting warmer, Captain!';
  return 'Adventure is this way!';
}
function board(trail, hint, walking) {
  let cells = '<span class="quest-grid-corner" aria-hidden="true">↗</span>' + 'ABCDE'.split('').map(letter => `<span class="quest-grid-heading">${letter}</span>`).join('');
  let hintCell = '';
  if (hint && trail.nextStep) {
    const [dx, dy] = DIRECTIONS[trail.nextStep];
    hintCell = coordinate(trail.x + dx, trail.y + dy);
  }
  for (let y = 0; y < 5; y++) {
    cells += `<span class="quest-grid-heading">${y + 1}</span>`;
    for (let x = 0; x < 5; x++) {
      const cell = coordinate(x, y), rock = ROCKS.includes(cell), here = trail.cell === cell;
      const visible = trail.isVisible(cell), visited = trail.visited.has(cell);
      const landmark = trail.missions.find(mission => mission.cell === cell);
      const shell = visible && trail.shellSpots.includes(cell) && !trail.shells.has(cell);
      const turtle = visible && cell === trail.turtleCell && !trail.rescued;
      const label = here ? ', Captain Dhruva is here' : rock ? ', mountain' : !visible ? ', unexplored' : landmark ? `, ${landmark.name}` : turtle ? ', Tilly the turtle' : shell ? ', sparkle shell' : visited ? ', explored' : ', island path';
      const contents = here ? captainArt() : rock ? '<span aria-hidden="true">⛰️</span>' : !visible ? '<span class="quest-fog" aria-hidden="true">?</span>' : landmark ? landmarkArt(landmark.kind) : turtle ? '<span class="quest-critter" aria-hidden="true">🐢</span>' : shell ? '<span class="quest-shell" aria-hidden="true">🐚</span>' : visited ? '<span class="quest-footprint" aria-hidden="true">•</span>' : (x + y) % 3 === 0 ? '<span class="quest-grass" aria-hidden="true">✦</span>' : '';
      cells += `<button type="button" class="quest-tile ${rock ? 'mountain' : ''} ${here ? 'captain' : ''} ${!visible && !rock ? 'unexplored' : ''} ${visited ? 'visited' : ''} ${hintCell === cell ? 'parrot-hint' : ''} ${visible && landmark ? 'landmark' : ''}" data-trail-cell="${cell}" aria-label="${cell}${label}" ${rock || walking ? 'disabled' : ''}>${contents}<small aria-hidden="true">${cell}</small>${hintCell === cell ? '<i class="quest-hint-arrow" aria-hidden="true">↓</i>' : ''}</button>`;
    }
  }
  return `<div class="quest-board" role="group" aria-label="Treasure island. Letters go across, numbers go down." aria-busy="${walking}">${cells}</div>`;
}

export function trailGame(trail, { feedback = '', hint = false, walking = false } = {}) {
  if (trail.phase === 'found') return discovery(trail);
  if (trail.phase === 'unlocking') return vault(trail, feedback);
  if (trail.phase === 'complete') return victory(trail);
  const mission = trail.mission;
  const text = feedback || (trail.distance ? 'Tap a square to walk there. What will you discover?' : 'X marks the spot. Time to dig!');
  return `<div class="quest-layout" id="game-board"><section class="quest-stage" aria-labelledby="quest-mission-title"><div class="quest-mission"><div class="quest-mission-icon">${landmarkArt(mission.kind)}</div><div><p>CHAPTER ${trail.completed + 1} · ${trail.completed === 3 ? 'THE FINAL TREASURE' : 'FIND A MAP PIECE'}</p><h2 id="quest-mission-title">${mission.name}</h2></div><div class="quest-coordinate"><small>GO TO</small><strong>${trail.target}</strong></div></div><div class="quest-ocean"><div class="quest-map-top"><span>🧭 N ↑</span><span class="quest-weather">SUNSTONE ISLAND</span><span>You: <b>${trail.cell}</b></span></div>${board(trail, hint, walking)}<div class="quest-heat"><span aria-hidden="true">${trail.distance ? '✦' : '✹'}</span>${walking ? 'Captain on the move…' : nearbyHint(trail)}<span class="quest-heat-dots" aria-hidden="true">${Array.from({ length: 5 }, (_, i) => `<i class="${i < Math.max(1, 5 - Math.floor(trail.distance / 2)) ? 'warm' : ''}"></i>`).join('')}</span></div></div><div class="quest-controls"><div class="quest-arrows" role="group" aria-label="Move one square">${Object.entries(directionArrow).map(([direction, arrow]) => `<button type="button" data-trail-direction="${direction}" aria-label="Move ${direction}" ${walking ? 'disabled' : ''}>${arrow}<small>${direction}</small></button>`).join('')}</div><button type="button" class="quest-dig" data-trail-action="dig" ${walking ? 'disabled' : ''}><span aria-hidden="true">⚒</span> ${trail.completed === 3 ? 'Uncover the vault' : 'Dig for treasure'}</button></div><p class="quest-feedback ${trail.lastEvent ? 'discovery' : ''}">${text}</p><div class="quest-small-tools"><button type="button" data-trail-action="hint" ${walking ? 'disabled' : ''}>🦜 Parrot, help!</button><button type="button" data-trail-action="repeat">♪ Hear the clue</button></div></section><aside class="quest-sidebar"><div class="quest-guide"><div class="quest-parrot">${parrotArt()}</div><div><p>PEPPER THE PARROT SAYS…</p><h3>${trail.completed === 3 ? 'The map is complete!' : 'Ahoy, Captain Dhruva!'}</h3><span>${mission.story}</span></div></div>${keyRing(trail)}<div class="quest-journal"><p class="eyebrow">OUR SECRET MAP</p>${missionTrail(trail)}</div><div class="quest-side-mission"><span aria-hidden="true">🐢</span><p>${trail.rescued ? '<strong>A friend for life!</strong>Tilly is safe in the sea, thanks to you.' : '<strong>A little side quest</strong>Tilly the turtle is lost. Explore the misty squares to find her and collect sparkle shells.'}</p></div></aside></div>${inventory(trail)}`;
}

function discovery(trail) {
  const mission = trail.missions[trail.completed - 1], key = KEYS[trail.completed - 1];
  return `<section class="quest-discovery" id="game-board" aria-labelledby="discovery-title"><div class="quest-discovery-art"><span class="quest-spark s1" aria-hidden="true">✦</span><span class="quest-spark s2" aria-hidden="true">✦</span><div class="quest-found-key">${keyArt(key)}</div><div class="quest-map-fragment" aria-hidden="true"><span>SECRET MAP</span><b>${trail.completed} / 3</b><i>✕ · · · ✕</i></div><div class="quest-discovery-captain">${captainArt()}</div></div><div class="quest-discovery-copy"><p class="eyebrow">DISCOVERY AT ${mission.name.toUpperCase()}</p><h2 id="discovery-title">You found the ${key.name.toLowerCase()}!</h2><p>${mission.found}</p><p>${key.message}</p>${keyRing(trail)}<button class="club-primary" type="button" data-trail-action="continue">${trail.completed === 3 ? 'Reveal the vault’s location' : 'Keep my key & sail on'} <span aria-hidden="true">→</span></button></div></section>${inventory(trail)}`;
}
function vault(trail, feedback) {
  const order = trail.lockOrder.map(keyFor);
  return `<section class="quest-vault" id="game-board" aria-labelledby="vault-title"><div class="quest-vault-art"><div class="quest-vault-glow"></div>${chestArt()}<div class="quest-locks" aria-label="${trail.unlocked} of 3 locks open">${order.map((key, i) => `<span class="${i < trail.unlocked ? 'open' : i === trail.unlocked ? 'next-lock' : ''}" aria-label="${key.name}: ${i < trail.unlocked ? 'open' : 'locked'}">${i < trail.unlocked ? '✓' : '🔒'}</span>`).join('')}</div></div><div class="quest-vault-copy"><p class="eyebrow">ONE LAST SECRET…</p><h2 id="vault-title">Unlock the Sunstone!</h2><p>Your map shows the order.<br>Tap the matching shape keys from left to right.</p><div class="quest-lock-code" aria-label="Key order: ${order.map(key => key.name).join(', ')}">${order.map((key, i) => `<span class="${i < trail.unlocked ? 'used' : i === trail.unlocked ? 'next-code' : ''}" style="--key-colour:${key.colour}"><b aria-hidden="true">${key.symbol}</b><small>${key.name.split(' ')[0]}</small></span>`).join('<i aria-hidden="true">→</i>')}</div><div class="quest-key-buttons" role="group" aria-label="Choose a shape key">${KEYS.map(key => `<button type="button" data-trail-key="${key.id}" aria-label="Use ${key.name.toLowerCase()}" ${trail.lockOrder.slice(0, trail.unlocked).includes(key.id) ? 'disabled' : ''}>${keyArt(key)}<span>${key.name}</span></button>`).join('')}</div><p class="quest-feedback">${feedback || 'Which key comes first on your secret map?'}</p><button class="soft-button" type="button" data-trail-action="repeat">♪ Hear the secret</button></div></section>${inventory(trail)}`;
}
function victory(trail) {
  return `<section class="quest-victory" id="game-board" aria-labelledby="victory-title"><div class="quest-victory-art">${chestArt(true)}<div class="quest-victory-captain">${captainArt()}</div><div class="quest-victory-parrot">${parrotArt()}</div><span class="quest-spark s1" aria-hidden="true">✦</span><span class="quest-spark s2" aria-hidden="true">✦</span></div><div class="quest-victory-copy"><p class="eyebrow">THE LEGEND OF CAPTAIN DHRUVA</p><h2 id="victory-title">The Sunstone is yours!</h2><p>Three map pieces. Three magical keys.<br>One brilliant captain. What an adventure!</p><div class="quest-victory-badges"><span>🏅 Sunstone Captain</span><span>🐚 ${trail.shells.size} sparkle ${trail.shells.size === 1 ? 'shell' : 'shells'}</span>${trail.rescued ? '<span>🐢 Tilly’s hero</span>' : ''}</div><button class="club-primary" type="button" data-action="replay">Set sail again <span aria-hidden="true">→</span></button><p class="quest-replay-note">New hiding places on every voyage.</p><a class="back-link" href="./">Choose another adventure ↗</a></div></section>`;
}

export function trailClue(trail) {
  if (trail.phase === 'complete') return 'You found the lost Sunstone, Captain Dhruva!';
  if (trail.phase === 'found') return `You found the ${KEYS[trail.completed - 1].name}. ${KEYS[trail.completed - 1].message}`;
  if (trail.phase === 'unlocking') return `Use your keys in this order: ${trail.lockOrder.map(id => keyFor(id).name).join(', ')}. Next is the ${keyFor(trail.lockOrder[trail.unlocked]).name}.`;
  return `${trail.mission.story} Go to ${trail.target[0]} ${trail.target[1]}. Letters go across, numbers go down. You are at ${trail.cell}. Tap a square to walk there, then dig.`;
}
