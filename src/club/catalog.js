export const GAMES = Object.freeze([
  { id: 'mrt-adventure', title: 'MRT Adventure', category: 'transport', badge: 'COUNT & RIDE', detail: 'Punggol Coast → HarbourFront', description: 'Ride with Pip. Count little treasures at all 17 stations.', href: './mrt-adventure.html', colour: '#6935d3', art: 'train' },
  { id: 'transport', title: 'Transport Dispatcher', category: 'transport', badge: 'SINGAPORE TRANSPORT', detail: 'Stations, lines & little journeys', description: 'Read the route, pick a direction, and send the right ride.', href: './play.html?game=transport', colour: '#087a62', art: 'transport' },
  { id: 'maths', title: 'Maths Workshop', category: 'maths', badge: 'PRIMARY 1–6', detail: 'Numbers, fractions & more', description: 'Solve a little puzzle. Build a rocket. Reach for the stars!', href: './play.html?game=maths', colour: '#ce3c16', art: 'maths' },
  { id: 'world-map', title: 'World Explorer', category: 'maps', badge: 'AROUND THE WORLD', detail: 'Real countries. Big discoveries.', description: 'Follow the clues and find countries on a world map.', href: './play.html?game=world-map', colour: '#1769be', art: 'world' },
  { id: 'treasure-map', title: 'Treasure Trails', category: 'maps', badge: 'PIRATE MAP QUEST', detail: 'Secret maps, shape keys & surprises', description: 'Captain Dhruva, find the lost Sunstone! An island of secrets awaits.', href: './play.html?game=treasure-map', colour: '#47720a', art: 'treasure' },
  { id: 'flags', title: 'Flag Detective', category: 'flags', badge: 'COLOURS OF THE WORLD', detail: '20 countries to discover', description: 'Look for colours, shapes, and stars. Whose flag is it?', href: './play.html?game=flags', colour: '#bd256d', art: 'flags' },
].map(Object.freeze));

export const CATEGORIES = Object.freeze([
  { id: 'all', label: 'All adventures', icon: '✦' },
  { id: 'transport', label: 'Transport', icon: '🚆' },
  { id: 'maths', label: 'Maths', icon: '＋' },
  { id: 'maps', label: 'Maps', icon: '🌍' },
  { id: 'flags', label: 'Flags', icon: '⚑' },
]);
