import { WORDS, PHRASES, LANGUAGES, languageItem } from './language-data.js';
export const MODES=Object.freeze({listen:{name:'Listen & find',icon:'👂',description:'Hear a word. Find its picture.',rounds:6},read:{name:'Word detective',icon:'🔎',description:'Match pictures to written words.',rounds:6},speak:{name:'My speaking turn',icon:'💬',description:'Try little phrases for real life.',rounds:3},build:{name:'Sentence puzzles',icon:'🧩',description:'Put the heard sentence together.',rounds:3}});
export function shuffled(items,random=Math.random){
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.max(0,Math.min(i,Math.floor(random()*(i+1))));[result[i],result[j]]=[result[j],result[i]];}
  if(result.length>1&&result.every((item,index)=>item===items[index]))result.push(result.shift());
  return result;
}
export function lessonDeck(language,mode,world='all',random=Math.random){
  if(!LANGUAGES[language]||!MODES[mode])throw new RangeError('Choose a language and activity.');
  const source=['speak','build'].includes(mode)?PHRASES:WORDS;
  const pool=source.filter(item=>world==='all'||item.world===world);
  if(!pool.length)throw new RangeError('Choose an available world.');
  return shuffled(pool,random).slice(0,MODES[mode].rounds).map(item=>{
    const choices=shuffled([item,...shuffled(source.filter(other=>other.world===item.world&&other.id!==item.id),random).slice(0,2)],random);
    return {item:languageItem(item,language),choices:choices.map(choice=>languageItem(choice,language))};
  });
}
export class LanguageRound {
  constructor(language,mode,world='all',random=Math.random){this.language=language;this.mode=mode;this.deck=lessonDeck(language,mode,world,random);this.index=0;this.phase='question';this.tried=new Set();this.heard=false;}
  get current(){return this.deck[this.index];}
  get completed(){return this.phase==='complete'?this.deck.length:this.index;}
  heardWord(){if(this.phase==='question')this.heard=true;}
  answer(id){
    if(!['listen','read'].includes(this.mode)||this.phase!=='question'||!this.current.choices.some(choice=>choice.id===id)||this.tried.has(id))return 'ignored';
    if(this.mode==='listen'&&!this.heard)return 'listen-first';
    if(id!==this.current.item.id){this.tried.add(id);return 'retry';}
    this.phase='feedback';return 'correct';
  }
  finishPractice(){if(!['speak','build'].includes(this.mode)||this.phase!=='question'||(this.mode==='speak'&&!this.heard))return false;this.phase='feedback';return true;}
  next(){if(this.phase!=='feedback')return false;if(this.index===this.deck.length-1)this.phase='complete';else{this.index++;this.phase='question';this.heard=false;this.tried.clear();}return true;}
}
export class SentenceBuilder {
  constructor(chunks,random=Math.random){this.chunks=[...chunks];this.order=shuffled(chunks.map((_,index)=>index),random);this.picked=[];}
  get complete(){return this.picked.length===this.chunks.length;}
  choose(index){
    if(this.complete||!Number.isInteger(index)||index<0||index>=this.chunks.length||this.picked.includes(index))return 'ignored';
    // Identical written words may be supplied by either identical tile.
    if(this.chunks[index]!==this.chunks[this.picked.length])return 'retry';
    this.picked.push(index);return this.complete?'complete':'placed';
  }
  undo(){return this.picked.pop()!==undefined;}
}
const PROGRESS_KEY='dhruva-language-progress-v1';
export function readLanguageProgress(language,storage){
  const result={listen:{},read:{},speak:{},build:{},roman:language==='chinese'};
  try{
    const saved=JSON.parse((storage||globalThis.localStorage)?.getItem(PROGRESS_KEY)||'null')?.[language];
    if(!saved)return result;
    if(typeof saved.roman==='boolean')result.roman=saved.roman;
    for(const mode of Object.keys(MODES))for(const [id,count] of Object.entries(saved[mode]||{})){
      const source=['listen','read'].includes(mode)?WORDS:PHRASES;
      if(source.some(item=>item.id===id)&&Number.isInteger(count)&&count>0)result[mode][id]=Math.min(count,999);
    }
  }catch{/* A fresh language passport still works without storage. */}
  return result;
}
export function saveLanguageProgress(language,progress,storage){
  if(!LANGUAGES[language])return false;
  try{const target=storage||globalThis.localStorage;const all=Object.fromEntries(Object.keys(LANGUAGES).map(id=>[id,readLanguageProgress(id,target)]));all[language]=progress;target.setItem(PROGRESS_KEY,JSON.stringify(all));return true;}catch{return false;}
}
