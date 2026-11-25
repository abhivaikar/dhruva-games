const theme=(id,name,icon,entries)=>({id,name,icon,words:entries.map(([word,picture])=>({word,picture}))});
export const WORD_THEMES=Object.freeze([
  theme('animals','Animal friends','🐱',[['CAT','🐱'],['DOG','🐶'],['HEN','🐔'],['PIG','🐷'],['COW','🐮'],['FOX','🦊'],['OWL','🦉'],['ANT','🐜'],['BEAR','🐻'],['LION','🦁'],['TIGER','🐯'],['RABBIT','🐰'],['TURTLE','🐢'],['MONKEY','🐵']]),
  theme('transport','Things that go','🚆',[['BUS','🚌'],['CAR','🚗'],['VAN','🚐'],['JET','✈️'],['SHIP','🚢'],['BOAT','⛵'],['BIKE','🚲'],['TRAM','🚋'],['TAXI','🚕'],['ROAD','🛣️'],['TRAIN','🚆'],['TRUCK','🚚'],['ROCKET','🚀'],['SCOOTER','🛴']]),
  theme('sea','Ocean explorers','🐬',[['FISH','🐟'],['CRAB','🦀'],['SEAL','🦭'],['CLAM','🐚'],['REEF','🪸'],['SWIM','🏊'],['WAVE','🌊'],['DIVE','🤿'],['SAND','🏖️'],['SURF','🏄'],['WHALE','🐋'],['SHARK','🦈'],['SHELL','🐚'],['DOLPHIN','🐬']]),
  theme('food','Picnic basket','🍎',[['RICE','🍚'],['CAKE','🍰'],['PEAR','🍐'],['MILK','🥛'],['EGG','🥚'],['CORN','🌽'],['SOUP','🍲'],['BEAN','🫘'],['PLUM','🟣'],['KIWI','🥝'],['APPLE','🍎'],['BREAD','🍞'],['BANANA','🍌'],['CARROT','🥕']]),
  theme('home','Cosy home','🏠',[['BED','🛏️'],['DOOR','🚪'],['LAMP','💡'],['SOFA','🛋️'],['MUG','☕'],['CUP','🥤'],['MAT','🟫'],['SOAP','🧼'],['BATH','🛁'],['ROOM','🏠'],['CHAIR','🪑'],['TABLE','🪑'],['CLOCK','🕰️'],['WINDOW','🪟']]),
  theme('garden','Garden discoveries','🌱',[['TREE','🌳'],['LEAF','🍃'],['SEED','🌱'],['ROSE','🌹'],['BEE','🐝'],['BUG','🐛'],['SOIL','🟫'],['POND','🪷'],['FROG','🐸'],['ROOT','🌱'],['SNAIL','🐌'],['FLOWER','🌼'],['SPIDER','🕷️'],['BUTTERFLY','🦋']]),
  theme('space','Space explorers','🪐',[['STAR','⭐'],['MOON','🌙'],['MARS','🔴'],['SHIP','🚀'],['SUIT','🧑‍🚀'],['ROCK','🪨'],['DUST','✨'],['NOVA','🌟'],['SUN','☀️'],['SKY','🌌'],['ORBIT','🪐'],['COMET','☄️'],['ROCKET','🚀'],['PLANET','🌍']]),
  theme('school','School days','🎒',[['BOOK','📕'],['PEN','🖊️'],['DESK','🏫'],['BAG','🎒'],['GLUE','🧴'],['BELL','🔔'],['READ','📖'],['DRAW','🖍️'],['SUM','➕'],['LINE','📏'],['RULER','📏'],['PAPER','📄'],['PENCIL','✏️'],['SCHOOL','🏫']]),
  theme('body','Amazing me','🖐️',[['HAND','🖐️'],['FOOT','🦶'],['NOSE','👃'],['EYE','👁️'],['EAR','👂'],['ARM','💪'],['LEG','🦵'],['TOE','🦶'],['HEAD','🙂'],['HAIR','🧑'],['KNEE','🦵'],['ELBOW','💪'],['FINGER','☝️'],['SMILE','😄']]),
  theme('weather','Weather watchers','🌈',[['SUN','☀️'],['RAIN','🌧️'],['SNOW','❄️'],['WIND','💨'],['FOG','🌫️'],['ICE','🧊'],['SKY','🌤️'],['HOT','🥵'],['COLD','🥶'],['WARM','🌞'],['STORM','⛈️'],['CLOUD','☁️'],['RAINBOW','🌈'],['THUNDER','🌩️']]),
  theme('actions','Let’s move','🤸',[['RUN','🏃'],['HOP','🐇'],['SIT','🪑'],['EAT','🍽️'],['DIG','🪏'],['NOD','🙂'],['CLAP','👏'],['WAVE','👋'],['READ','📖'],['SING','🎤'],['SKIP','🤸'],['DRAW','🖍️'],['JUMP','🦘'],['DANCE','💃']]),
  theme('colours','Rainbow words','🎨',[['RED','🟥'],['BLUE','🟦'],['PINK','🌸'],['GOLD','🟨'],['LIME','🟩'],['TEAL','🟦'],['GREY','⬜'],['MINT','🍃'],['ROSE','🌹'],['TAN','🟫'],['NAVY','🔵'],['GREEN','🟩'],['ORANGE','🟧'],['PURPLE','🟪'],['YELLOW','🟨'],['WHITE','⬜'],['BLACK','⬛']]),
]);
export const WORD_LEVELS=Object.freeze({
  sprout:{name:'Little words',size:6,count:4,max:4,directions:[[0,1],[1,0]],help:'Look across → and down ↓'},
  explorer:{name:'Word explorer',size:8,count:6,max:8,directions:[[0,1],[1,0],[1,1],[-1,1]],help:'Across, down and diagonally'},
  detective:{name:'Word detective',size:10,count:8,max:10,directions:[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]],help:'Every direction—even backwards!'},
});
export function customWords(text){
  const words=[...new Set(String(text).toUpperCase().split(/[\s,;]+/).filter(Boolean))];
  if(words.length<2||words.length>8||words.some(word=>! /^[A-Z]{2,10}$/.test(word)))throw new RangeError('Use 2–8 words, each with 2–10 English letters. Separate them with commas or spaces.');
  return words.map(word=>({word,picture:'⭐'}));
}
