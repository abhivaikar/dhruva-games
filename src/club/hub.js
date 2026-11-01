import { AudioGuide } from '../audio.js';
import { mountVoiceSettings } from '../voice-settings.js';
import { GAMES, CATEGORIES } from './catalog.js';
import { illustration, heroArt, clubMark } from './art.js';
import { readClub } from './progress.js';
import { readBook } from './activity-book.js';

const $ = selector => document.querySelector(selector);
$('#club-mark').innerHTML = clubMark;
$('#hero-art').innerHTML = heroArt();
let category = 'all';

function renderGames() {
  const { completed } = readClub();
  $('#hero-game-total').textContent = `${GAMES.length} adventures`;
  $('#hub-book-count').textContent = readBook().length;
  const games = GAMES.filter(game => category === 'all' || game.category === category);
  $('#game-grid').innerHTML = games.map(game => `<a class="game-card" href="${game.href}" style="--game-colour:${game.colour}"><div class="game-card-art">${illustration(game.art)}<span class="adventure-number" aria-hidden="true">${String(GAMES.indexOf(game) + 1).padStart(2, '0')}</span>${completed[game.id] ? '<span class="played-badge">★ Explored</span>' : ''}</div><div class="game-card-copy"><p class="eyebrow">${game.badge}</p><h3>${game.title}</h3><p>${game.description}</p><div class="card-foot"><span>${game.detail}</span><span class="play-arrow">Play <span aria-hidden="true">→</span></span></div></div></a>`).join('');
  $('#game-count').textContent = `${games.length} ${games.length === 1 ? 'adventure' : 'adventures'} to play`;
  document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
}

$('#categories').innerHTML = CATEGORIES.map(item => `<button type="button" data-category="${item.id}" aria-pressed="${item.id === category}"><span aria-hidden="true">${item.icon}</span>${item.label}</button>`).join('');
$('#categories').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  category = button.dataset.category;
  renderGames();
});
$('#grownups-open').addEventListener('click', () => $('#grownups').showModal());
window.addEventListener('pageshow', renderGames);
renderGames();

const narrator=new AudioGuide(readClub().sound);
mountVoiceSettings(narrator,{anchor:$('#grownups-open')});
window.addEventListener('pagehide',()=>narrator.stop());
