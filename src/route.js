// North-East Line, towards HarbourFront. NE2 is not an operational stop.
// Verified against https://www.sbstransit.com.sg/first-train-last-train
export const ROUTE = Object.freeze([
  { code: 'NE18', name: 'Punggol Coast', landmark: 'Our coast-to-harbour adventure begins!' },
  { code: 'NE17', name: 'Punggol', landmark: 'Wave goodbye to the coast. Here we go!' },
  { code: 'NE16', name: 'Sengkang', landmark: 'Our little train is heading south.' },
  { code: 'NE15', name: 'Buangkok', landmark: 'Another stop, another little discovery.' },
  { code: 'NE14', name: 'Hougang', landmark: 'Hello, Hougang! Let’s count together.' },
  { code: 'NE13', name: 'Kovan', landmark: 'Pip has a cheerful surprise for you.' },
  { code: 'NE12', name: 'Serangoon', landmark: 'Lots of adventures meet at Serangoon.' },
  { code: 'NE11', name: 'Woodleigh', landmark: 'A leafy little stop on our adventure.' },
  { code: 'NE10', name: 'Potong Pasir', landmark: 'Keep exploring, little train captain!' },
  { code: 'NE9', name: 'Boon Keng', landmark: 'The city is getting closer. Ding-dong!' },
  { code: 'NE8', name: 'Farrer Park', landmark: 'Hello, Farrer Park! Our city adventure continues.' },
  { code: 'NE7', name: 'Little India', landmark: 'Colourful shophouses, happy little streets.' },
  { code: 'NE6', name: 'Dhoby Ghaut', landmark: 'So many trains, so many adventures!' },
  { code: 'NE5', name: 'Clarke Quay', landmark: 'Wave hello to the Singapore River.' },
  { code: 'NE4', name: 'Chinatown', landmark: 'Look out for the colourful lanterns!' },
  { code: 'NE3', name: 'Outram Park', landmark: 'Our seaside stop is getting closer.' },
  { code: 'NE1', name: 'HarbourFront', landmark: 'Hello, harbour! We made it to the sea.' },
].map(Object.freeze));

export const JOURNEY_START = ROUTE[0];
export const JOURNEY_END = ROUTE[ROUTE.length - 1];

export const LEVELS = Object.freeze({
  beginner: { name: 'Beginner', max: 5, description: 'Counting & little sums to 5', icon: '🌱' },
  explorer: { name: 'Explorer', max: 10, description: 'Add & subtract within 10', icon: '🚂' },
  super: { name: 'Super Explorer', max: 20, description: 'Bigger adventures within 20', icon: '🚀' },
});
