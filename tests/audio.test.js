import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioGuide } from '../src/audio.js';
import { chooseNarrator, narratorVoices, readVoice, writeVoice, DEFAULT_VOICE, VOICE_KEY } from '../src/voice-preferences.js';
const voice=(name,lang='en-US',voiceURI=name)=>({name,lang,voiceURI});
const memory=()=>{const items=new Map();return {getItem:key=>items.get(key)||null,setItem:(key,value)=>items.set(key,value)};};

test('Google US English is the default narrator with ranked English fallbacks and no novelty voices',()=>{
  const voices=[voice('Albert'),voice('Plain regional voice','en-SG'),voice('Samantha'),voice('Microsoft Sonia Online (Natural)','en-GB'),voice('Google US English'),voice('Mei','zh-CN')];
  assert.equal(chooseNarrator(voices).name,'Google US English');
  assert.equal(chooseNarrator(voices.filter(voice=>voice.name!=='Google US English')).name,'Microsoft Sonia Online (Natural)');
  assert.deepEqual(narratorVoices(voices).map(voice=>voice.name),['Microsoft Sonia Online (Natural)','Google US English','Samantha','Plain regional voice']);
  assert.equal(chooseNarrator([voice('Albert'),voice('Samantha')]).name,'Samantha');
  assert.equal(chooseNarrator([voice('Albert'),voice('Mei','zh-CN')]),null);
  assert.equal(narratorVoices([voice('Samantha'),voice('Samantha')]).length,1);
});

test('explicit narrator choice wins, survives voice reordering and falls back safely on another device',()=>{
  const saved={voiceURI:'my-samantha',name:'Samantha',lang:'en-US',pace:'gentle'};
  const voices=[voice('Google US English'),voice('Samantha','en-US','my-samantha')];
  assert.equal(chooseNarrator(voices,saved).voiceURI,'my-samantha');
  assert.equal(chooseNarrator([...voices].reverse(),saved).voiceURI,'my-samantha');
  assert.equal(chooseNarrator([voice('Samantha','en-US','another-uri')],saved).name,'Samantha');
  assert.equal(chooseNarrator([voices[0]],saved).name,'Google US English');
  assert.equal(chooseNarrator([voice('Microsoft Sonia Online (Natural)','en-GB'),voices[0]],saved).name,'Google US English');
});

test('fresh and legacy automatic preferences use Google US English while preserving the saved pace',()=>{
  const storage=memory();
  assert.deepEqual(readVoice(storage),DEFAULT_VOICE);
  storage.setItem(VOICE_KEY,JSON.stringify({voiceURI:'',name:'',lang:'',pace:'gentle'}));
  assert.deepEqual(readVoice(storage),{...DEFAULT_VOICE,pace:'gentle'});
  assert.equal(chooseNarrator([voice('Google US English','en-US','device-specific-uri')],readVoice(storage)).voiceURI,'device-specific-uri');
});

test('voice preferences validate saved settings and tolerate corrupt or unavailable storage',()=>{
  const storage=memory(),value={voiceURI:'one',name:'Samantha',lang:'en-US',pace:'gentle'};
  assert.equal(writeVoice(value,storage),true);assert.deepEqual(readVoice(storage),value);
  storage.setItem(VOICE_KEY,'{"voiceURI":7,"pace":"impossibly-fast"}');assert.deepEqual(readVoice(storage),DEFAULT_VOICE);
  storage.setItem(VOICE_KEY,'bad json');assert.deepEqual(readVoice(storage),DEFAULT_VOICE);
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  assert.deepEqual(readVoice(blocked),DEFAULT_VOICE);assert.equal(writeVoice(value,blocked),false);
});

function withSpeech(run){
  const oldWindow=globalThis.window,oldStorage=globalThis.localStorage;
  let voices=[],spoken=[],cancelled=0;const listeners=new Set();
  const synth={getVoices:()=>voices,speak:words=>spoken.push(words),cancel:()=>cancelled++,addEventListener:(name,fn)=>listeners.add(fn),removeEventListener:(name,fn)=>listeners.delete(fn)};
  try{
    globalThis.window={speechSynthesis:synth,SpeechSynthesisUtterance:class {constructor(text){this.text=text;}}};globalThis.localStorage=memory();
    run({audio:new AudioGuide(),spoken,load(list){voices=list;for(const listener of [...listeners])listener();},get cancelled(){return cancelled;},listeners});
  }finally{globalThis.window=oldWindow;globalThis.localStorage=oldStorage;}
}

test('fresh spoken prompts use Google US English even when a natural voice is available',()=>withSpeech(({audio,spoken,load})=>{
  load([voice('Microsoft Sonia Online (Natural)','en-GB'),voice('Google US English','en-US','browser-google-voice')]);
  audio.speak('Hello, Dhruva!');
  assert.equal(spoken[0].voice.voiceURI,'browser-google-voice');
  assert.equal(spoken[0].lang,'en-US');
}));

test('spoken prompts use the selected voice, its language and a natural default pace',()=>withSpeech(({audio,spoken,load})=>{
  load([voice('Albert'),voice('Samantha')]);
  audio.speak('Let’s go!');assert.equal(spoken.length,1);assert.equal(spoken[0].voice.name,'Samantha');assert.equal(spoken[0].lang,'en-US');assert.equal(spoken[0].rate,1);assert.equal(spoken[0].pitch,1);
  writeVoice({voiceURI:'Samantha',name:'Samantha',lang:'en-US',pace:'gentle'});
  audio.speak('Take your time.');assert.equal(spoken[1].rate,.92);
}));

test('late voice loading uses the better narrator, and stopped or replaced prompts cannot play later',()=>withSpeech(({audio,spoken,load,listeners})=>{
  audio.speak('Old prompt');assert.equal(spoken.length,0);assert.equal(listeners.size,1);
  audio.speak('Latest prompt');assert.equal(listeners.size,1);
  load([voice('Samantha')]);assert.equal(spoken.length,1);assert.equal(spoken[0].text,'Latest prompt');assert.equal(listeners.size,0);
  load([]);audio.speak('Never play this');audio.stop();load([voice('Samantha')]);assert.equal(spoken.length,1);assert.equal(listeners.size,0);
}));

test('a requested preview works while games are muted, without changing the mute preference',()=>withSpeech(({audio,spoken,load})=>{
  load([voice('Samantha')]);audio.enabled=false;audio.speak('Muted');assert.equal(spoken.length,0);
  const statuses=[];audio.speak('Preview',{preview:true,onStatus:status=>statuses.push(status)});assert.equal(spoken.length,1);assert.equal(audio.enabled,false);
  spoken[0].onstart();spoken[0].onend();assert.deepEqual(statuses,['speaking','finished']);
  audio.speak('Bad preview',{preview:true,onStatus:status=>statuses.push(status)});spoken[1].onerror({error:'synthesis-failed'});assert.equal(statuses.at(-1),'error');
}));
