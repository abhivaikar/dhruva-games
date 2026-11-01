export const GAMES = Object.freeze([
  { id: 'mrt-adventure', title: 'MRT Adventure', category: 'transport', badge: 'COUNT & RIDE', detail: 'Punggol Coast → HarbourFront', description: 'Ride with Pip. Count little treasures at all 17 stations.', href: './mrt-adventure.html', colour: '#6935d3', art: 'train' },
  { id: 'transport', title: 'Transport Dispatcher', category: 'transport', badge: 'SINGAPORE TRANSPORT', detail: 'Stations, lines & little journeys', description: 'Read the route, pick a direction, and send the right ride.', href: './play.html?game=transport', colour: '#087a62', art: 'transport' },
  { id: 'maths', title: 'Maths Workshop', category: 'maths', badge: 'PRIMARY 1–6', detail: 'Numbers, fractions & more', description: 'Solve a little puzzle. Build a rocket. Reach for the stars!', href: './play.html?game=maths', colour: '#ce3c16', art: 'maths' },
  { id: 'world-map', title: 'World Explorer', category: 'maps', badge: 'AROUND THE WORLD', detail: 'Real countries. Big discoveries.', description: 'Follow the clues and find countries on a world map.', href: './play.html?game=world-map', colour: '#1769be', art: 'world' },
  { id: 'treasure-map', title: 'Treasure Trails', category: 'maps', badge: 'PIRATE MAP QUEST', detail: 'Secret maps, shape keys & surprises', description: 'Captain Dhruva, find the lost Sunstone! An island of secrets awaits.', href: './play.html?game=treasure-map', colour: '#47720a', art: 'treasure' },
  { id: 'flags', title: 'Flag Detective', category: 'flags', badge: 'COLOURS OF THE WORLD', detail: '20 countries to discover', description: 'Look for colours, shapes, and stars. Whose flag is it?', href: './play.html?game=flags', colour: '#bd256d', art: 'flags' },
  { id: 'colouring', title: 'Colouring Studio', category: 'activities', badge: 'LITTLE ARTISTS', detail: '36 pictures · 6 colourful worlds', description: 'Give Pip rainbow windows. Paint a pink dinosaur. Make it yours!', href: './activity.html?game=colouring', colour: '#bd316f', art: 'colouring' },
  { id: 'dots', title: 'Mystery Dot-to-Dot', category: 'activities', badge: 'JOIN THE DOTS', detail: '108 challenges · 10, 15 or 20 dots', description: 'Follow the numbers. Reveal a surprise. Then bring it to life with colour.', href: './activity.html?game=dots', colour: '#8d4ac0', art: 'dots' },
  { id: 'puzzles', title: 'Picture Puzzle Factory', category: 'activities', badge: 'PIECE BY LITTLE PIECE', detail: '144 puzzles · 4 to 12 pieces', description: 'Put a picture together — even one you coloured yourself!', href: './activity.html?game=puzzles', colour: '#177caa', art: 'puzzles' },
  { id: 'chinese', title: 'Pip’s Chinese Adventure', category: 'languages', badge: '你好 · LITTLE LANGUAGE EXPLORERS', detail: '84 words · 40 phrases · included audio', description: 'Listen, find pictures and try Mandarin with Lulu the panda. Little words, big discoveries!', href: './language.html?lang=chinese', colour: '#cc3e54', art: 'chinese' },
  { id: 'marathi', title: 'Pip’s Marathi Adventure', category: 'languages', badge: 'नमस्कार · LET’S TALK & DISCOVER', detail: '84 words · 40 phrases · included audio', description: 'Talk, listen and explore Marathi with Mithu. Discover words for your everyday adventures!', href: './language.html?lang=marathi', colour: '#087d68', art: 'marathi' },
].map(Object.freeze));

export const CATEGORIES = Object.freeze([
  { id: 'all', label: 'All adventures', icon: '✦' },
  { id: 'transport', label: 'Transport', icon: '🚆' },
  { id: 'maths', label: 'Maths', icon: '＋' },
  { id: 'maps', label: 'Maps', icon: '🌍' },
  { id: 'flags', label: 'Flags', icon: '⚑' },
  { id: 'activities', label: 'Activity Book', icon: '🎨' },
  { id: 'languages', label: 'Languages', icon: '💬' },
]);
