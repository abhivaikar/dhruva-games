import { audioPath } from './language-data.js';
export function learningVoice(language,voices=[]){
  const accepted=language==='marathi'?/^mr(?:[-_]|$)/i:/^zh(?:[-_](?:Hans|Hant))?(?:[-_](?:CN|SG|TW))?$/i;
  return [...voices].filter(voice=>accepted.test(voice.lang)).sort((a,b)=>Number(/natural|neural|premium|enhanced/i.test(b.name))-Number(/natural|neural|premium|enhanced/i.test(a.name)))[0]||null;
}
export class LearningAudio {
  constructor({mediaFactory=src=>new Audio(src),synth=globalThis.window?.speechSynthesis,Utterance=globalThis.window?.SpeechSynthesisUtterance}={}){this.mediaFactory=mediaFactory;this.synth=synth;this.Utterance=Utterance;this.version=0;this.media=null;this.speaking=false;}
  stop(){this.version++;if(this.media){this.media.onplay=this.media.onended=this.media.onerror=null;this.media.pause();this.media=null;}if(this.speaking){this.synth?.cancel();this.speaking=false;}}
  play(language,kind,item,{slow=false,onState=()=>{}}={}){
    this.stop();const version=this.version,active=()=>version===this.version;let usedFallback=false;
    const fallback=()=>{
      if(!active()||usedFallback)return;usedFallback=true;
      try{
        if(this.media){this.media.onplay=this.media.onended=this.media.onerror=null;this.media.pause();this.media=null;}
        const voice=learningVoice(language,this.synth?.getVoices()||[]);
        if(!voice||!this.Utterance){onState('error');return;}
        const words=new this.Utterance(item.text);words.voice=voice;words.lang=voice.lang;words.rate=slow?0.8:1;
        words.onstart=()=>{if(active())onState('playing');};words.onend=()=>{if(active()){this.speaking=false;onState('ended');}};words.onerror=()=>{if(active()){this.speaking=false;onState('error');}};
        this.speaking=true;this.synth.speak(words);
      }catch{if(active())onState('error');}
    };
    try{
      const media=this.mediaFactory(audioPath(language,kind,item.id));this.media=media;media.playbackRate=slow?0.8:1;media.preservesPitch=true;
      media.onplay=()=>{if(active())onState('playing');};media.onended=()=>{if(active())onState('ended');};media.onerror=fallback;
      onState('loading');const started=media.play();started?.catch(fallback);
    }catch{fallback();}
  }
}
