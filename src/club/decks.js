import { ROUTE } from '../route.js';
import { shuffle } from '../questions.js';
import { COUNTRIES } from './data/countries.js';

export const LINES = Object.freeze([
  { id: 'NE', name: 'North East Line', colour: '#9255af', colourName: 'purple' },
  { id: 'NS', name: 'North-South Line', colour: '#c7474c', colourName: 'red' },
  { id: 'EW', name: 'East-West Line', colour: '#348a61', colourName: 'green' },
  { id: 'CC', name: 'Circle Line', colour: '#d79a31', colourName: 'orange' },
  { id: 'DT', name: 'Downtown Line', colour: '#3869af', colourName: 'blue' },
  { id: 'TE', name: 'Thomson-East Coast Line', colour: '#926951', colourName: 'brown' },
]);

function stationChoices(answer, random) {
  return shuffle([answer, ...shuffle(ROUTE.filter(station => station.code !== answer.code), random).slice(0, 2)], random)
    .map(station => ({ id: station.code, label: station.name, small: station.code }));
}

export function transportDeck(random = Math.random) {
  const starts = shuffle(Array.from({ length: ROUTE.length - 2 }, (_, i) => i + 1), random).slice(0, 4);
  const questions = starts.map((index, i) => {
    const direction = i % 2 === 0 ? 1 : -1;
    const start = ROUTE[index];
    const next = ROUTE[index + direction];
    const destination = direction === 1 ? ROUTE.at(-1).name : ROUTE[0].name;
    return { id: `station-${start.code}-${direction}`, kind: 'station', prompt: `After ${start.name}, what is the next stop towards ${destination}?`,
      answerId: next.code, choices: stationChoices(next, random), startIndex: index, direction, destination,
      hint: 'Follow the arrow on the route. The names on the map will help.',
      explanation: `${start.name} → ${next.name}. We’re heading towards ${destination}!` };
  });
  const chosenLines = shuffle(LINES, random).slice(0, 2);
  for (const line of chosenLines) questions.push({ id: `line-${line.id}`, kind: 'line', prompt: `Which MRT line uses ${line.colourName} on the map?`,
    answerId: line.id, line, choices: shuffle([line, ...shuffle(LINES.filter(item => item.id !== line.id), random).slice(0, 2)], random).map(item => ({ id: item.id, label: item.name, small: item.id })),
    hint: `The line code is ${line.id}. Match the letters to a line name.`, explanation: `${line.colourName[0].toUpperCase() + line.colourName.slice(1)} is the ${line.name}.` });
  questions.push({ id: 'direction', kind: 'direction', prompt: 'From Sengkang, which direction takes us to HarbourFront?', startIndex: 2, destination: 'HarbourFront', direction: 1,
    answerId: 'harbour', choices: [{ id: 'harbour', label: 'Towards HarbourFront', small: 'SOUTHBOUND ON THE NORTH EAST LINE' }, { id: 'coast', label: 'Towards Punggol Coast', small: 'THE OTHER DIRECTION' }, { id: 'stay', label: 'Stay at Sengkang', small: 'NO JOURNEY YET' }],
    hint: 'Look for the destination name on the train display.', explanation: 'Choose the train towards HarbourFront. Its destination is on the display!' });
  questions.push({ id: 'bus', kind: 'vehicle', prompt: 'Which public transport ride travels on roads?', answerId: 'bus',
    choices: [{ id: 'bus', label: 'Public bus', icon: '🚌' }, { id: 'mrt', label: 'MRT train', icon: '🚆' }, { id: 'lrt', label: 'LRT train', icon: '🚈' }],
    hint: 'One ride has tyres and stops beside the road.', explanation: 'Public buses travel on roads. MRT and LRT trains travel on tracks.' });
  return questions;
}

function countryOrder(random) {
  return [COUNTRIES[0], ...shuffle(COUNTRIES.slice(1), random).slice(0, 7)];
}

export function flagsDeck(random = Math.random) {
  return countryOrder(random).map((country, index) => {
    const mode = index % 2 === 0 ? 'name' : 'find';
    const options = shuffle([country, ...shuffle(COUNTRIES.filter(item => item.id !== country.id), random).slice(0, 2)], random);
    return { id: `flag-${country.id}`, kind: 'flag', mode, country,
      prompt: mode === 'name' ? 'Which country does this flag belong to?' : `Find the flag of ${country.name}.`,
      answerId: country.id, choices: options.map(item => ({ id: item.id, label: mode === 'name' ? item.name : item.description, flag: mode === 'find' ? item.id : null })),
      hint: country.description, explanation: `${country.name}! ${country.description}` };
  });
}

export function worldDeck(random = Math.random) {
  return countryOrder(random).map(country => {
    // Distinct regions keep the first map adventures approachable.
    const elsewhere = shuffle(COUNTRIES.filter(item => item.continent !== country.continent), random);
    const first = elsewhere[0];
    const second = elsewhere.find(item => item.continent !== first.continent) || elsewhere[1];
    const options = shuffle([country, first, second], random);
    return { id: `map-${country.id}`, kind: 'map', country, prompt: `Find ${country.name} on the map.`, answerId: country.id,
      choices: options.map((item, i) => ({ id: item.id, label: `Location ${String.fromCharCode(65 + i)}`, country: item })),
      hint: `${country.name} is in ${country.continent}. Look for its highlighted outline or locator dot.`,
      explanation: `You found ${country.name}, in ${country.continent}!` };
  });
}
