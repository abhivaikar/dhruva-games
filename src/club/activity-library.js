import { SCENES } from './activity-scenes.js';

export const THEMES=Object.freeze([
  {id:'transport',name:'On the move',icon:'🚆'},
  {id:'animals',name:'Animal friends',icon:'🦁'},
  {id:'ocean',name:'Under the sea',icon:'🐢'},
  {id:'garden',name:'In the garden',icon:'🦋'},
  {id:'fantasy',name:'Space & make-believe',icon:'🚀'},
  {id:'happy',name:'Happy days',icon:'🎈'},
]);
export const LIBRARY_PAGE_SIZE=12;
export const DOT_COUNTS=Object.freeze([10,15,20]);
export const PIECE_COUNTS=Object.freeze([4,6,9,12]);
export function libraryPage({theme='all',query='',page=0}={}){
  const words=String(query).trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches=SCENES.filter(scene=>{
    const label=[scene.name,scene.short,THEMES.find(theme=>theme.id===scene.theme)?.name].join(' ').toLowerCase();
    return (theme==='all'||scene.theme===theme)&&words.every(word=>label.includes(word));
  });
  const pages=Math.max(1,Math.ceil(matches.length/LIBRARY_PAGE_SIZE));
  const current=Math.max(0,Math.min(pages-1,Number.isInteger(page)?page:0));
  return {scenes:matches.slice(current*LIBRARY_PAGE_SIZE,(current+1)*LIBRARY_PAGE_SIZE),total:matches.length,page:current,pages};
}

// Separate shuffled bags let a child explore every mystery in a theme before a repeat.
export class MysteryDeck {
  constructor(random=Math.random){this.random=random;this.bags=new Map();this.last=null;}
  next(theme='all'){
    const candidates=SCENES.filter(scene=>theme==='all'||scene.theme===theme).map(scene=>scene.id);
    if(!candidates.length)throw new RangeError('Choose a picture theme.');
    let bag=this.bags.get(theme);
    if(!bag?.length){
      bag=[...candidates];
      for(let i=bag.length-1;i>0;i--){const j=Math.max(0,Math.min(i,Math.floor(this.random()*(i+1))));[bag[i],bag[j]]=[bag[j],bag[i]];}
      this.bags.set(theme,bag);
    }
    // Switching themes and starting a new bag must not repeat the immediate picture.
    if(bag.length===1&&bag[0]===this.last&&candidates.length>1){bag.pop();return this.next(theme);}
    if(bag.at(-1)===this.last&&bag.length>1)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];
    this.last=bag.pop();return this.last;
  }
}
