// Imaginative station worlds, original illustrations, and small story prompts.
// These are playful postcards, not depictions of the real underground platforms.
const ORIGINAL_WORLDS = [
  { noun: 'firefly', plural: 'fireflies', icon: '✨', treasure: 'Firefly sparkle', mission: 'Light up our adventure!', hint: 'Tap each firefly to help it glow.', greeting: 'Hello, little fireflies!', colour: '#e3f1df', praise: 'You lit up the park!' },
  { noun: 'mango', plural: 'mangoes', icon: '🥭', treasure: 'Mango magic', mission: 'Pack a picnic for our train friends.', hint: 'Tap each mango to pack our picnic.', greeting: 'A colourful picnic stop!', colour: '#fae8cf', praise: 'Our picnic is ready!' },
  { noun: 'ticket', plural: 'tickets', icon: '🎟️', treasure: 'Golden ticket', mission: 'Help our friends hop aboard.', hint: 'Tap each ticket to give it a stamp.', greeting: 'Through the twinkly tunnel!', colour: '#e9e0f4', praise: 'All aboard, little friends!' },
  { noun: 'boat', plural: 'boats', icon: '⛵', treasure: 'River explorer', mission: 'Wave hello to the little river boats.', hint: 'Tap each boat to send it a wave.', greeting: 'Look! Boats on the river!', colour: '#dceef4', praise: 'The river boats say thank you!' },
  { noun: 'lantern', plural: 'lanterns', icon: '🏮', treasure: 'Lantern glow', mission: 'Make the lanterns glow.', hint: 'Tap each lantern to light it up.', greeting: 'A sky full of happy lanterns!', colour: '#f8e1df', praise: 'Look at those lovely lanterns!' },
  { noun: 'butterfly', plural: 'butterflies', icon: '🦋', treasure: 'Butterfly buddy', mission: 'Help our butterfly friends find the flowers.', hint: 'Tap each butterfly to say hello.', greeting: 'Butterfly friends are waiting!', colour: '#e4efdc', praise: 'You made the butterflies happy!' },
  { noun: 'shell', plural: 'shells', icon: '🐚', treasure: 'Seaside treasure', mission: 'Find treasures for our seaside picnic.', hint: 'Tap each shell to discover a treasure.', greeting: 'I can see the sea, Dhruva!', colour: '#d7eff0', praise: 'A pocket full of seaside treasures!' },
].map((world, scene) => ({ ...world, scene }));

const NORTHERN_WORLDS = [
  { scene: 6, sky: '#d6eaf6', noun: 'gull', plural: 'gulls', icon: '🕊️', treasure: 'Coastal wings', mission: 'Say hello to our coastal bird friends.', hint: 'Tap each gull to send it a wave.', greeting: 'Our big adventure starts by the coast!', colour: '#d6eaf6', praise: 'The coastal birds say hello!' },
  { scene: 3, sky: '#deedf0', noun: 'fish', plural: 'fish', icon: '🐟', treasure: 'Punggol fish', mission: 'Help our fish friends swim together.', hint: 'Tap each fish to help it swim.', greeting: 'A splashy surprise at Punggol!', colour: '#deedf0', praise: 'What a happy little shoal!' },
  { scene: 0, sky: '#e9edfa', noun: 'kite', plural: 'kites', icon: '🪁', treasure: 'Sengkang sky kite', mission: 'Let’s fly our colourful kites.', hint: 'Tap each kite to help it fly.', greeting: 'Look up! Our kites are waiting!', colour: '#e9edfa', praise: 'Your kites are flying high!' },
  { scene: 5, sky: '#f5eedc', noun: 'flower', plural: 'flowers', icon: '🌼', treasure: 'Buangkok blossom', mission: 'Make a little garden for Pip.', hint: 'Tap each flower to help it bloom.', greeting: 'A garden full of little surprises!', colour: '#f5eedc', praise: 'You grew a beautiful garden!' },
  { scene: 0, sky: '#dcefdc', noun: 'duck', plural: 'ducks', icon: '🦆', treasure: 'Hougang duckling', mission: 'Help the ducklings find their friends.', hint: 'Tap each duck to say quack!', greeting: 'Quack, quack! Hello, Hougang!', colour: '#dcefdc', praise: 'The ducklings are all together!' },
  { scene: 1, sky: '#f7e6d7', noun: 'orange', plural: 'oranges', icon: '🍊', treasure: 'Kovan picnic orange', mission: 'Pack a juicy snack for our journey.', hint: 'Tap each orange to pack our snack.', greeting: 'A tasty little picnic stop!', colour: '#f7e6d7', praise: 'Our snack basket is ready!' },
  { scene: 2, sky: '#3e3b58', noun: 'balloon', plural: 'balloons', icon: '🎈', treasure: 'Serangoon balloon', mission: 'Help Pip count the party balloons.', hint: 'Tap each balloon to give it a bob.', greeting: 'A little tunnel party at Serangoon!', colour: '#3e3b58', praise: 'What a lovely balloon party!' },
  { scene: 5, sky: '#dce9e1', noun: 'leaf', plural: 'leaves', icon: '🍃', treasure: 'Woodleigh wonder leaf', mission: 'Find the little leaves dancing in the breeze.', hint: 'Tap each leaf to make it dance.', greeting: 'A leafy hello from Woodleigh!', colour: '#dce9e1', praise: 'Your leaves are dancing!' },
  { scene: 1, sky: '#f3e2ec', noun: 'cupcake', plural: 'cupcakes', icon: '🧁', treasure: 'Potong Pasir cupcake', mission: 'Share little cupcakes with our train friends.', hint: 'Tap each cupcake to count our treats.', greeting: 'A sweet surprise at Potong Pasir!', colour: '#f3e2ec', praise: 'A little treat for everyone!' },
  { scene: 0, sky: '#e8e3f4', noun: 'star', plural: 'stars', icon: '⭐', treasure: 'Boon Keng wishing star', mission: 'Collect a little sparkle for our adventure.', hint: 'Tap each star to help it sparkle.', greeting: 'You’re a star, little explorer!', colour: '#e8e3f4', praise: 'You made our adventure sparkle!' },
];

export const WORLDS = Object.freeze([...NORTHERN_WORLDS, ...ORIGINAL_WORLDS].map(Object.freeze));

export const TRAIN_COLOURS = Object.freeze({
  purple: { name: 'Purple', colour: '#8956b8', accent: '#b690d2' },
  ocean: { name: 'Ocean blue', colour: '#317eac', accent: '#80c4d4' },
  sunshine: { name: 'Sunshine', colour: '#cf852e', accent: '#f5c46a' },
});

export function activityQuestion(question, index) {
  const world = WORLDS[index];
  if (question.kind === 'count') return `How many ${world.plural} can you count?`;
  return `What is ${question.a} ${question.kind === 'add' ? 'plus' : 'minus'} ${question.b}?`;
}

export function activityHint(question, index) {
  const world = WORLDS[index];
  if (question.kind === 'subtract') return `Some ${world.plural} are leaving. Count the ones that stay!`;
  if (question.kind === 'add') return `More ${world.plural} are joining. Count both groups!`;
  return world.hint;
}

// A fresh Set is kept for each question. Repeated taps never increase the count.
export class CountingHelper {
  constructor() { this.counted = new Set(); }
  tap(id, countable) {
    if (!countable.has(id) || this.counted.has(id)) return null;
    this.counted.add(id);
    return this.counted.size;
  }
}

const shapes = {
  gull: '<path d="M3 21q4-16 14-6 11-11 17 0-9-4-13 7l-8 5Z" fill="#fff7e6" stroke="#8ca8b6"/><path d="m26 15 8 1-6 4" fill="#efb559"/><circle cx="25" cy="15" r="1.2" fill="#4e5a72"/><path d="m11 28-3 5m10-7-1 7" stroke="#d9ad66"/>',
  fish: '<path d="m8 19-7-8v17l7-6q16 17 27-2-12-19-27-1Z" fill="#8fc8d1" stroke="#5c94ac"/><circle cx="27" cy="18" r="2" fill="#44516b"/><path d="m16 13-3-5 10 2M16 25l-2 6 9-3" fill="#bda0cc"/>',
  kite: '<path d="m17 1 13 15-13 14L4 16Z" fill="#e9b276" stroke="#b17e83"/><path d="m17 1 0 29L4 16h26" fill="none" stroke="#fff2d7"/><path d="M17 30q-8 2 0 6" fill="none" stroke="#91769d"/><path d="m10 31 4 1-3 3" fill="#a6c8ae"/>',
  flower: '<path d="M18 18v18m0-5q-12-12-12-2 3 7 12 2" stroke="#7eaa7c" fill="#9bc493" stroke-width="2"/><g fill="#f3d28a" stroke="#d8ad63"><ellipse cx="18" cy="9" rx="6" ry="8"/><ellipse cx="9" cy="16" rx="8" ry="6"/><ellipse cx="27" cy="16" rx="8" ry="6"/><ellipse cx="13" cy="24" rx="6" ry="7"/><ellipse cx="23" cy="24" rx="6" ry="7"/></g><circle cx="18" cy="17" r="6" fill="#dca574"/>',
  duck: '<path d="M3 23q1 12 17 10 15-2 13-17-6-13-14-3v7q-8 7-16 3Z" fill="#f3d27a" stroke="#c7a459"/><path d="m27 18 9 2-8 4" fill="#e6a267"/><circle cx="26" cy="16" r="1.5" fill="#53596a"/><path d="M9 26q10 6 14-2" fill="none" stroke="#d4af66"/>',
  orange: '<circle cx="18" cy="21" r="14" fill="#edb26a" stroke="#cf8a4e"/><path d="M18 8q-1-8 12-7-1 10-12 7" fill="#8faf7c"/><path d="M9 16q-4 8 2 12" fill="none" stroke="#f9d29b" stroke-width="2"/>',
  balloon: '<ellipse cx="18" cy="13" rx="12" ry="13" fill="#dca1bb" stroke="#b5779c"/><path d="m18 26-3 4h6Z" fill="#bf85a8"/><path d="M18 30q-7 4 0 6" fill="none" stroke="#8c84a4"/><path d="M11 7q-3 5-1 8" fill="none" stroke="#fbe6e9" stroke-width="2"/>',
  leaf: '<path d="M4 31Q-1 5 33 2q5 33-29 29Z" fill="#a6c497" stroke="#7fa57c"/><path d="m1 35 26-26M12 24 9 13m12 3 8 2" stroke="#6e9872" fill="none" stroke-width="1.5"/>',
  cupcake: '<path d="m7 21 3 14h18l3-14Z" fill="#b9a4d2" stroke="#967db5"/><path d="M5 22q-5-7 4-10-1-9 9-8 10-1 10 8 11 4 4 10Z" fill="#f2c7bb" stroke="#c99b9b"/><circle cx="18" cy="4" r="3" fill="#d58e9e"/><path d="m14 25 1 7m8-7-1 7" stroke="#e4d9ef"/>',
  star: '<path d="m18 1 5 10 11 2-8 8 2 12-10-6-10 6 2-12-8-8 11-2Z" fill="#f2cf77" stroke="#d6a441"/>',
  firefly: '<ellipse cx="11" cy="12" rx="6" ry="4" fill="#b8dbdf" transform="rotate(-35 11 12)"/><ellipse cx="23" cy="12" rx="6" ry="4" fill="#b8dbdf" transform="rotate(35 23 12)"/><ellipse cx="17" cy="22" rx="6" ry="9" fill="#f6ca61" stroke="#b68d38"/><path d="m14 13-3-5m9 5 3-5" stroke="#536779" stroke-width="1.5"/><circle cx="15" cy="18" r="1" fill="#3e4658"/><circle cx="19" cy="18" r="1" fill="#3e4658"/>',
  mango: '<path d="M26 7C8-2 2 16 8 27c8 15 27-4 18-20Z" fill="#f3bd52" stroke="#c38632"/><path d="M23 8q-2-8 7-7-1 8-7 7" fill="#77a576"/><path d="M12 12q-5 6-1 12" stroke="#ffe2a0" stroke-width="2" fill="none"/>',
  ticket: '<path d="M3 8h28v7q-6 2 0 6v7H3v-7q6-2 0-6Z" fill="#f5ce7e" stroke="#c18a43"/><path d="M11 9v18" stroke="#cf9c53" stroke-dasharray="2 2"/><path d="m21 11 2 4 4 .6-3 3 .7 4-3.7-2-3.7 2 .7-4-3-3 4-.6Z" fill="#a578b7"/>',
  boat: '<path d="M3 24h28l-5 7H9Z" fill="#a786bc" stroke="#725a94"/><path d="M17 3v20" stroke="#596b7c" stroke-width="1.5"/><path d="m15 5-11 16h11Z" fill="#fff2d6" stroke="#d4b179"/><path d="m19 8 10 13H19Z" fill="#e7b57d"/><path d="M2 33q5-3 10 0t10 0 10 0" stroke="#6aaebc" fill="none"/>',
  lantern: '<path d="M17 0v6m0 24v5" stroke="#b08038" stroke-width="2"/><rect x="9" y="5" width="16" height="3" rx="1" fill="#d5a44d"/><ellipse cx="17" cy="18" rx="12" ry="11" fill="#e58f78" stroke="#bf655a"/><ellipse cx="17" cy="18" rx="6" ry="11" fill="#f4b18a"/><rect x="9" y="28" width="16" height="3" rx="1" fill="#d5a44d"/><path d="M14 33v3m6-3v3" stroke="#d5a44d"/>',
  butterfly: '<path d="M17 17C-4-8-4 26 15 22c-17 13 8 21 2-1" fill="#c39bd5" stroke="#9872b1"/><path d="M17 17C38-8 38 26 19 22c17 13-8 21-2-1" fill="#93c9cb" stroke="#669fa8"/><path d="M17 13v15m0-14-4-5m4 5 4-5" stroke="#5b6177" stroke-width="2" stroke-linecap="round"/>',
  shell: '<path d="M7 30C-14 4 12-9 17 4 27-9 48 6 27 30Z" fill="#f3c3b8" stroke="#c68e90"/><path d="M17 29V5M14 29 7 9m13 20 8-20M11 29 2 19m21 10 10-10" stroke="#d69d9c" stroke-width="1.2"/><rect x="9" y="29" width="17" height="4" rx="2" fill="#edb5a9"/>',
};

export function objectArt(index) {
  return `<svg viewBox="-1 -1 37 38" aria-hidden="true">${shapes[WORLDS[index].noun]}</svg>`;
}

export const conductor = `<svg viewBox="0 0 90 90" aria-hidden="true"><rect x="16" y="14" width="58" height="61" rx="20" fill="#fffaf0" stroke="#d3c0e5" stroke-width="2"/><rect x="22" y="23" width="46" height="24" rx="9" fill="#c4e0e5"/><circle cx="33" cy="36" r="3" fill="#414960"/><circle cx="57" cy="36" r="3" fill="#414960"/><path d="M37 57q8 9 16 0" fill="none" stroke="#685180" stroke-width="3" stroke-linecap="round"/><circle cx="29" cy="55" r="4" fill="#f2bf9b"/><circle cx="61" cy="55" r="4" fill="#f2bf9b"/><path d="M22 67h46" stroke="var(--train-colour,#8956b8)" stroke-width="7"/><path d="m27 77-5 6m41-6 5 6" stroke="#69587d" stroke-width="4" stroke-linecap="round"/><path d="M26 15v-5h38v5" fill="#8b64b7"/><path d="m10 44-6-4m76 4 6-4" stroke="#ab8bc5" stroke-width="4" stroke-linecap="round"/></svg>`;

function tree(x, y, colour = '#8bb59b') {
  return `<g transform="translate(${x} ${y})"><path d="M0 0v60" stroke="#97a481" stroke-width="7"/><g fill="${colour}"><circle cx="0" cy="-10" r="28"/><circle cx="-17" cy="8" r="21"/><circle cx="19" cy="9" r="23"/></g></g>`;
}

function houses() {
  return ['#dab799', '#eabda5', '#a9c4bb', '#c5afd0', '#e4ca8f', '#cba9ab', '#98b8c3'].map((colour, i) => `<g transform="translate(${40 + i * 104} 161)"><rect width="94" height="142" rx="5" fill="${colour}"/><path d="m-3 4 50-29 50 29" fill="${colour}" stroke="#fff4dc" stroke-width="5"/><rect x="15" y="28" width="24" height="37" rx="10" fill="#fff4dc"/><rect x="55" y="28" width="24" height="37" rx="10" fill="#fff4dc"/><path d="M0 85h94" stroke="#fff4dc" stroke-width="7"/><path d="M18 142v-38q28-24 58 0v38" fill="#738e8b"/><path d="M0 80h94" stroke="#b99781" stroke-width="3"/></g>`).join('');
}

function boat(x, y, scale = 1) {
  return `<g class="bobbing" style="--drift:${x % 3}s" transform="translate(${x} ${y}) scale(${scale})"><path d="M0 0h75L60 17H14Z" fill="#a682b5"/><path d="M37-65v60" stroke="#7a8791" stroke-width="3"/><path d="M32-61 2-8h30Z" fill="#ffefca"/><path d="m42-48 26 40H42Z" fill="#ecc084"/></g>`;
}

function lantern(x, y, colour = '#e99377') {
  return `<g class="swaying" style="--drift:${x % 4}s" transform="translate(${x} ${y})"><path d="M0-30v25" stroke="#f0d4a1" stroke-width="2"/><ellipse cy="12" rx="21" ry="27" fill="${colour}"/><ellipse cy="12" rx="10" ry="27" fill="#ffd28e" opacity=".7"/><path d="M-12-14h24m-24 52h24M0 40v15" stroke="#d5a54e" stroke-width="4"/></g>`;
}

export function stationArt(stationIndex) {
  const world = WORLDS[stationIndex];
  const index = world.scene;
  const sky = world.sky || ['#e0efe4', '#f9e8d0', '#353550', '#e4edf0', '#45425f', '#e9efda', '#d6eff0'][index];
  const clouds = '<g class="clouds" fill="#fffdf4" opacity=".85"><path d="M54 73q-4-19 15-20 13-25 31-3 23-4 23 16 15 0 15 12H54z"/><path d="M390 42q0-14 15-14 16-24 31-2 22-7 24 14 15-1 15 10h-85z"/></g>';
  let art;
  if (index === 0) {
    art = `<circle cx="641" cy="76" r="36" fill="#f6d488"/>${clouds}<path d="M0 242q155-80 300-5 180-87 480 0v90H0" fill="#b8d1b4"/><path d="M0 280q210-74 440-18 200-55 340-12v70H0" fill="#9ebeaa"/>${tree(105, 204)}${tree(605, 208)}${tree(706, 241, '#b3c89f')}<g class="twinkles" fill="#fff2aa"><circle cx="273" cy="180" r="4"/><circle cx="410" cy="211" r="5"/><circle cx="533" cy="160" r="4"/><circle cx="190" cy="260" r="3"/></g><g fill="#efc7a6"><circle cx="323" cy="278" r="7"/><circle cx="339" cy="274" r="6"/><circle cx="350" cy="282" r="7"/></g>`;
  } else if (index === 1) {
    art = `${clouds}<circle cx="646" cy="71" r="33" fill="#f5d18c"/>${houses()}<path d="M70 125q320 95 640 0" stroke="#b79891" fill="none"/>${Array.from({ length: 13 }, (_, i) => `<path d="m${90 + i * 47} ${132 + Math.sin(i / 12 * Math.PI) * 49} 16 3-10 17Z" fill="${['#b193c9', '#d7ab58', '#85b5a4'][i % 3]}"/>`).join('')}`;
  } else if (index === 2) {
    art = `<path d="M0 310V160Q390-110 780 160v150" fill="#55516e"/><path d="M0 160Q390-85 780 160" stroke="#77718b" stroke-width="18" fill="none"/><path d="M0 200q390-200 780 0" stroke="#77718b" stroke-width="8" fill="none"/>${[70, 225, 390, 555, 710].map(x => `<rect x="${x}" y="172" width="8" height="133" rx="3" fill="#8b829c"/><rect x="${x - 27}" y="159" width="62" height="7" rx="3" fill="#fbe5af"/>`).join('')}<rect x="288" y="207" width="206" height="61" rx="10" fill="#302d47"/><text x="391" y="245" text-anchor="middle" font-family="sans-serif" font-size="18" letter-spacing="3" fill="#fbe5af">LET’S EXPLORE</text><g class="twinkles" fill="#ffe7aa"><circle cx="260" cy="130" r="3"/><circle cx="510" cy="126" r="3"/></g>`;
  } else if (index === 3) {
    art = `${clouds}<g opacity=".8">${houses()}</g><path d="M0 245h780v66H0" fill="#9ac8ce"/><g stroke="#d0e6df" stroke-width="3" fill="none"><path d="M0 267h150m70 9h190m60-13h230M90 297h170m190 0h200"/></g>${boat(120, 277, .8)}${boat(545, 291, .65)}<path d="M280 302V267q100-95 200 0v35" stroke="#dfc4ad" stroke-width="13" fill="none"/><path d="M265 266h230" stroke="#f3e2c6" stroke-width="6"/>`;
  } else if (index === 4) {
    art = `<g fill="#fcdda1" class="twinkles"><circle cx="630" cy="61" r="23"/><circle cx="538" cy="93" r="2"/><circle cx="353" cy="119" r="2"/><circle cx="700" cy="135" r="2"/></g><g opacity=".6">${houses()}</g><path d="M0 122q390 110 780 0M0 175q390 115 780 0" stroke="#dbc6b9" fill="none" stroke-width="2"/>${[100, 250, 405, 560, 705].map((x, i) => lantern(x, 138 + Math.sin(i / 4 * Math.PI) * 50)).join('')}${[175, 330, 485, 640].map((x, i) => lantern(x, 200 + Math.sin(i / 3 * Math.PI) * 34, '#d8b77d')).join('')}`;
  } else if (index === 5) {
    art = `${clouds}<circle cx="647" cy="68" r="31" fill="#f3d998"/><path d="M0 253q155-81 330-13 180-63 450 0v80H0" fill="#b6cfab"/>${tree(131, 217)}${tree(629, 200, '#a2bda0')}<path d="M170 304q110-100 280-43t240 38" stroke="#f1e3bd" stroke-width="31" fill="none"/>${[225, 335, 493, 570].map((x, i) => `<g class="swaying" transform="translate(${x} ${186 + i % 2 * 38})"><ellipse cx="-9" cy="-3" rx="10" ry="15" fill="#b493cb" transform="rotate(-30)"/><ellipse cx="9" cy="-3" rx="10" ry="15" fill="#e5b37a" transform="rotate(30)"/><path d="M0-4v15" stroke="#637477" stroke-width="3"/></g>`).join('')}<g fill="#e2a3a6"><circle cx="200" cy="293" r="8"/><circle cx="480" cy="294" r="7"/><circle cx="530" cy="285" r="8"/></g>`;
  } else {
    art = `${clouds}<circle cx="641" cy="76" r="36" fill="#f6d488"/><path d="M0 196q150-25 300 0t300 0 180 0v120H0" fill="#8dc5cd"/><path d="M0 228q90-12 180 0t180 0 180 0 240 0m-700 27q90-12 180 0t180 0 180 0" fill="none" stroke="#c1e4e4" stroke-width="4"/>${boat(250, 254, 1.1)}${boat(535, 235, .65)}<path d="M50 299 65 156h39l15 143" fill="#fff1d9"/><path d="M60 200h48m-52 52h57" stroke="#d89b8e" stroke-width="19"/><path d="M58 155h54l-8-14H66Z" fill="#a77b95"/><rect x="75" y="161" width="18" height="24" fill="#f3d383"/><path d="M0 294q320-33 780 0v35H0" fill="#ead9b4"/><g stroke="#7a9ca5" stroke-width="2" fill="none"><path class="bird" d="M395 109q10-12 20 0 10-12 20 0m69-27q8-10 16 0 8-10 16 0"/></g>`;
  }
  return `<svg class="city world-art" viewBox="0 0 780 390" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><path fill="${sky}" d="M0 0h780v390H0z"/>${art}<path fill="${index === 2 || index === 4 ? '#a39aaf' : '#e3ddc5'}" d="M0 310h780v80H0z"/><path fill="#f5ecd6" d="M0 310h780v10H0z"/><path stroke="#b1b09f" stroke-width="4" d="M0 340h780M0 356h780"/><path stroke="#b1b09f" stroke-width="8" stroke-dasharray="9 23" d="M0 348h780"/></svg>`;
}
