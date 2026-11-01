export const VOICE_KEY = 'dhruva-narrator-v1';
export const DEFAULT_VOICE = Object.freeze({voiceURI:'',name:'',lang:'',pace:'natural'});
export const PACES = Object.freeze({natural:{label:'Lively & natural',rate:1},gentle:{label:'A little gentler',rate:.92}});
const novelty = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|fred|good news|hysterical|junior|organ|ralph|trinoids|whisper|zarvox|jester|superstar|wobble)\b/i;
export function narratorVoices(voices=[]){
  const seen=new Set();
  return voices.filter(voice=>/^en(?:[-_]|$)/i.test(voice.lang)&&!novelty.test(voice.name)).filter(voice=>{
    const key=voice.voiceURI||`${voice.name}|${voice.lang}`;
    if(seen.has(key))return false;seen.add(key);return true;
  }).sort((a,b)=>voiceScore(b)-voiceScore(a)||a.name.localeCompare(b.name));
}
export function voiceScore(voice){
  const name=voice.name||'';
  return (/premium|natural|neural/i.test(name)?120:/enhanced/i.test(name)?110:/google/i.test(name)?90:/samantha/i.test(name)?85:/ava|zoe|serena|karen|tessa|moira|aria|jenny|guy|alex|siri/i.test(name)?80:/daniel/i.test(name)?70:20)
    + (/^en[-_]SG$/i.test(voice.lang)?6:/^en[-_](GB|AU|US)$/i.test(voice.lang)?3:0);
}
export function chooseNarrator(voices,preference=DEFAULT_VOICE){
  const choices=narratorVoices(voices);
  return choices.find(voice=>preference.voiceURI&&voice.voiceURI===preference.voiceURI)
    ||choices.find(voice=>preference.name&&voice.name===preference.name&&voice.lang===preference.lang)
    ||choices[0]||null;
}
export function readVoice(storage){
  try{
    const value=JSON.parse((storage||globalThis.localStorage)?.getItem(VOICE_KEY)||'null');
    if(!value||typeof value!=='object')return {...DEFAULT_VOICE};
    return {voiceURI:typeof value.voiceURI==='string'?value.voiceURI.slice(0,500):'',name:typeof value.name==='string'?value.name.slice(0,200):'',lang:typeof value.lang==='string'?value.lang.slice(0,40):'',pace:Object.hasOwn(PACES,value.pace)?value.pace:'natural'};
  }catch{return {...DEFAULT_VOICE};}
}
export function writeVoice(value,storage){
  try{const target=storage||globalThis.localStorage;if(!target?.setItem)return false;target.setItem(VOICE_KEY,JSON.stringify(value));return true;}catch{return false;}
}
