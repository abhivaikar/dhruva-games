import { seeded, shuffled } from './random.js';
import { WORD_LEVELS, WORD_THEMES } from './word-data.js';
export function wordLine(start,end,size){
  if(![start,end].every(n=>Number.isInteger(n)&&n>=0&&n<size*size))return [];
  const r=Math.floor(start/size),c=start%size,dr=Math.floor(end/size)-r,dc=end%size-c;
  if(dr&&dc&&Math.abs(dr)!==Math.abs(dc))return [];
  return Array.from({length:Math.max(Math.abs(dr),Math.abs(dc))+1},(_,i)=>(r+Math.sign(dr)*i)*size+c+Math.sign(dc)*i);
}
export class WordSearch {
  constructor({theme='animals',level='sprout',words=null,seed=Date.now()}={}){
    if(!WORD_LEVELS[level])throw new RangeError('Unknown word level.');
    this.level=level;this.theme=WORD_THEMES.find(item=>item.id===theme)||WORD_THEMES[0];this.seed=seed;
    const spec=WORD_LEVELS[level],random=seeded(seed);
    if(words&&(!Array.isArray(words)||words.length<2||words.length>8||new Set(words.map(item=>item.word)).size!==words.length||words.some(item=>! /^[A-Z]{2,10}$/.test(item.word))))throw new RangeError('Invalid custom words.');
    this.words=words?words.map(item=>({...item})):shuffled(this.theme.words.filter(item=>item.word.length<=spec.max),random).slice(0,spec.count);
    this.size=Math.max(spec.size,...this.words.map(item=>item.word.length),this.words.length);
    this.found=new Map();this.routes=new Map();
    // Try crossings first, but always retain a bounded, guaranteed row layout.
    for(let attempt=0;attempt<20;attempt++){
      this.grid=Array(this.size*this.size).fill('');this.routes.clear();
      for(const {word} of [...this.words].sort((a,b)=>b.word.length-a.word.length)){
        const candidates=[];
        for(let r=0;r<this.size;r++)for(let c=0;c<this.size;c++)for(const [dr,dc] of spec.directions){
          const er=r+dr*(word.length-1),ec=c+dc*(word.length-1);
          if(er<0||er>=this.size||ec<0||ec>=this.size)continue;
          const path=Array.from({length:word.length},(_,i)=>(r+dr*i)*this.size+c+dc*i);
          if(path.every((cell,i)=>!this.grid[cell]||this.grid[cell]===word[i]))candidates.push({path,score:path.filter(cell=>this.grid[cell]).length+random()});
        }
        candidates.sort((a,b)=>b.score-a.score);
        if(!candidates.length)break;
        const path=candidates[0].path;path.forEach((cell,i)=>this.grid[cell]=word[i]);this.routes.set(word,path);
      }
      if(this.routes.size===this.words.length)break;
    }
    if(this.routes.size!==this.words.length){
      this.grid=Array(this.size*this.size).fill('');this.routes.clear();
      const rows=shuffled(Array.from({length:this.size},(_,i)=>i),random);
      this.words.forEach(({word},i)=>{const path=Array.from({length:word.length},(_,n)=>rows[i]*this.size+n);path.forEach((cell,n)=>this.grid[cell]=word[n]);this.routes.set(word,path);});
    }
    this.grid=this.grid.map(letter=>letter||'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(random()*26)]);
  }
  get complete(){return this.found.size===this.words.length;}
  find(start,end){
    const path=wordLine(start,end,this.size),text=path.map(cell=>this.grid[cell]).join('');
    const target=this.words.find(({word})=>word===text||word===[...text].reverse().join(''));
    if(!target)return {status:'retry',path};
    if(this.found.has(target.word))return {status:'already',word:target.word,path};
    this.found.set(target.word,path);return {status:this.complete?'complete':'found',word:target.word,path};
  }
  restart(){this.found.clear();}
  hint(){const target=this.words.find(({word})=>!this.found.has(word));return target?{...target,cell:this.routes.get(target.word)[0]}:null;}
}
