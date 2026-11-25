// Original story, with no timers or fail states. Progress changes only on interaction.
export const CHAPTERS = Object.freeze([
  { name: 'Where the wildflowers grow', place: 'THE MEADOW', mode: 'walk', theme: 'meadow', sky: ['#759eab','#f6d6a0'], hills: ['#a5b596','#748f79','#476959'], ground: '#59794e', story: 'A letter has arrived! Grandma is waiting beyond the hills. Dhruva packs a bag. His little dog, Chiku, is coming too.', end: 'A flower, a friend, and a lovely road ahead. Let’s follow the river.', objects: [
    ['flower', 560, 'Pick a wildflower', 'A little gold flower for Grandma. Chiku gives it a careful sniff.'],
    ['dog', 1120, 'Give Chiku a cuddle', 'Chiku leans in. Every journey is better with a friend.'],
    ['sign', 1700, 'Read the riverside sign', '“The river is just around the bend.” A canoe is waiting for you!'],
  ] },
  { name: 'A river full of sky', place: 'THE QUIET RIVER', mode: 'canoe', theme: 'river', sky: ['#80aab1','#f5d4a1'], hills: ['#a0b9af','#5f9290','#3b6969'], ground: '#638f90', story: 'The canoe rocks like a cradle. Chiku watches the ripples. There is nowhere to rush to, and so much to notice.', end: 'The river carries you to a little bamboo landing. What could be beyond it?', objects: [
    ['duck', 560, 'Say hello to the ducks', 'Three ducks paddle alongside. Chiku remembers to use his quiet voice.'],
    ['lily', 1120, 'Look at the water lilies', 'A dragonfly lands on a lily. Even the smallest things have somewhere to rest.'],
    ['bell', 1700, 'Ring the landing bell', 'Ting! A tiny bell welcomes you ashore. You tie the canoe safely to the landing.'],
  ] },
  { name: 'The bamboo whisper', place: 'THE BAMBOO GARDEN', mode: 'walk', theme: 'bamboo', sky: ['#789b8f','#dce3ad'], hills: ['#a4bda1','#719582','#3e7164'], ground: '#4b7762', story: 'Tall bamboo leaves whisper overhead. A small fox peeks out. A friendly gardener has left a little watering can.', end: 'A soft breeze shakes the leaves. Warm lanterns glow on the path ahead.', objects: [
    ['fox', 560, 'Sit quietly with the fox', 'You sit very still. The little fox comes closer, then curls up in a patch of sun.'],
    ['plant', 1120, 'Water the little seedling', 'A splash for the roots. One day this tiny shoot will be as tall as the others.'],
    ['chime', 1700, 'Listen to the wind chimes', 'The chimes sing a tiny song. Chiku tilts his head, listening to every note.'],
  ] },
  { name: 'A thousand little lights', place: 'THE LANTERN VILLAGE', mode: 'walk', theme: 'village', sky: ['#303857','#cf8b88'], hills: ['#847d92','#646b80','#3c5364'], ground: '#666259', story: 'Evening settles on a village of little bridges. Lanterns float like stars. Someone has left a paper boat beside the stream.', end: 'Your lantern joins the others. At the station, a little train waits for morning.', objects: [
    ['boat', 560, 'Float the paper boat', 'Your paper boat turns once, then drifts under the bridge. Bon voyage, little boat!'],
    ['cat', 1120, 'Greet the sleepy cat', 'The cat stretches and purrs. Chiku sits politely. They become very quiet friends.'],
    ['lantern', 1700, 'Light the last lantern', 'A warm little light. You wish for lovely journeys for everyone far from home.'],
  ] },
  { name: 'The little coastal railway', place: 'THE COAST LINE', mode: 'train', theme: 'coast', sky: ['#8baebe','#f6dfb9'], hills: ['#afc6be','#7ba29a','#477d7c'], ground: '#62826c', story: 'All aboard! The train follows the sea. Chiku has a window seat. The world rolls past like pages in a picture book.', end: 'The conductor waves goodbye. A path leads from the station into golden trees.', objects: [
    ['ticket', 560, 'Show your little ticket', 'The conductor stamps a star on your ticket. “A splendid day for a journey!”'],
    ['shell', 1120, 'Listen to a seashell', 'The conductor lends you a shell. You hear a soft whoosh, like the sea saying hello.'],
    ['lighthouse', 1700, 'Wave to the lighthouse', 'A little light blinks across the bay. You wave. Maybe someone is waving back.'],
  ] },
  { name: 'The golden-leaf path', place: 'AUTUMN WOODS', mode: 'walk', theme: 'autumn', sky: ['#a4b9b0','#f4d8a3'], hills: ['#d0bc83','#b69768','#7d8056'], ground: '#9b8758', story: 'Crunch, crunch. The path is covered in little golden leaves. A squirrel has dropped its acorn. Chiku knows just where it went.', end: 'Beyond the trees, a balloon is ready to rise. Grandma’s valley is on the other side!', objects: [
    ['acorn', 560, 'Return the squirrel’s acorn', 'The squirrel holds the acorn in both paws. A small kindness makes a big difference.'],
    ['leaf', 1120, 'Catch a golden leaf', 'A leaf floats into your hand. A little piece of autumn for your journey book.'],
    ['basket', 1700, 'Share a picnic with Chiku', 'An apple for Dhruva, a dog biscuit for Chiku. You leave the woodland just as you found it.'],
  ] },
  { name: 'Above the sleeping hills', place: 'THE CLOUD GARDEN', mode: 'balloon', theme: 'clouds', sky: ['#8795b6','#f4b8a0'], hills: ['#bdacc0','#918baf','#6a7797'], ground: '#888caa', story: 'Up, up, gently up. The balloon rises into a peach-coloured sky. Far below, rivers curl like ribbons. Hold on, Chiku!', end: 'There it is: Grandma’s cottage, with a golden window and a garden gate.', objects: [
    ['bird', 560, 'Wave to the swallows', 'Two swallows fly beside you. Their wings draw little smiles across the sky.'],
    ['cloud', 1120, 'Spot a cloud shaped like Chiku', '“That cloud has your ears!” Chiku looks very pleased about this.'],
    ['star', 1700, 'Find the first evening star', 'One star, shining before the others. You make a wish: may we always find our way home.'],
  ] },
  { name: 'A light in the window', place: 'GRANDMA’S GARDEN', mode: 'walk', theme: 'home', sky: ['#344760','#d18c89'], hills: ['#8e8b9c','#627a86','#3b626b'], ground: '#456958', story: 'A familiar gate. A warm little window. Grandma has seen you coming, and there is room by the fire for a very good dog.', end: '“You’re home!” says Grandma. “Tell me everything.” And you do. Every small, wonderful thing.', objects: [
    ['flower', 560, 'Give Grandma the wildflower', 'Grandma puts the flower in a tiny vase. “My favourite colour,” she says.'],
    ['dog', 1120, 'Make Chiku a cosy bed', 'A soft blanket by the fire. Chiku turns around three times and settles with a sigh.'],
    ['house', 1700, 'Knock on the cottage door', 'Knock, knock. A warm hug. The best part of going a long way is coming home.'],
  ] },
].map(chapter => Object.freeze({ ...chapter, objects: Object.freeze(chapter.objects.map(([kind,x,label,text]) => Object.freeze({kind,x,label,text}))) })));

export const HOME_KEY = 'dhruva-long-way-home-v1';
export const WORLD_WIDTH = 2100;
export class HomeJourney {
  constructor(saved = {}) {
    // Completed chapters form one continuous prefix; forged/partial records cannot unlock later ones.
    this.completed = new Set();
    if (Array.isArray(saved.completed)) for (let i=0;i<CHAPTERS.length && saved.completed.includes(i);i++) this.completed.add(i);
    this.chapter = Number.isInteger(saved.chapter) && saved.chapter >= 0 && saved.chapter <= Math.min(this.completed.size,CHAPTERS.length-1) ? saved.chapter : Math.min(this.completed.size,CHAPTERS.length-1);
    const discovered = this.chapter === saved.chapter && Array.isArray(saved.found) ? saved.found : [];
    this.found = new Set(discovered.filter(i=>Number.isInteger(i)&&i>=0&&i<3));
    this.x = this.chapter === saved.chapter && Number.isFinite(saved.x) ? Math.max(100,Math.min(WORLD_WIDTH-100,saved.x)) : 150;
    this.finished = saved.finished === true && this.completed.size === CHAPTERS.length;
  }
  get scene() { return CHAPTERS[this.chapter]; }
  get ready() { return this.found.size === 3; }
  get target() { return this.scene.objects.find((_,i)=>!this.found.has(i)) || null; }
  get nearby() { return this.scene.objects.findIndex((object,i)=>!this.found.has(i)&&Math.abs(object.x-this.x)<=125); }
  move(amount) { if(Number.isFinite(amount)) this.x=Math.max(100,Math.min(WORLD_WIDTH-100,this.x+amount)); }
  interact() {
    const index=this.nearby;
    if(index<0 || this.finished)return null;
    this.found.add(index);
    return this.scene.objects[index];
  }
  advance() {
    if(!this.ready || this.finished)return false;
    this.completed.add(this.chapter);
    if(this.chapter === CHAPTERS.length-1) {this.finished=true;return true;}
    this.chapter++;this.found.clear();this.x=150;return true;
  }
  visit(chapter) {
    if(!Number.isInteger(chapter)||chapter<0||chapter>Math.min(this.completed.size,CHAPTERS.length-1))return false;
    this.chapter=chapter;this.found.clear();this.x=150;this.finished=false;return true;
  }
  snapshot() { return {chapter:this.chapter,x:Math.round(this.x),found:[...this.found],completed:[...this.completed],finished:this.finished}; }
}
export function loadJourney(storage) {try{return new HomeJourney(JSON.parse(storage.getItem(HOME_KEY))||{});}catch{return new HomeJourney();}}
export function saveJourney(journey,storage) {try{storage.setItem(HOME_KEY,JSON.stringify(journey.snapshot()));return true;}catch{return false;}}
