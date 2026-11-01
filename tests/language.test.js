import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { LANGUAGES, WORDS, PHRASES, WORLDS, audioPath, languageItem } from '../src/club/language-data.js';
import { MODES, lessonDeck, LanguageRound, SentenceBuilder, readLanguageProgress, saveLanguageProgress } from '../src/club/language-model.js';
import { LearningAudio, learningVoice } from '../src/club/language-audio.js';
import { PracticeRecording } from '../src/club/language-recording.js';
const memory=()=>{const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};};
const punctuation=text=>text.replace(/[\p{P}\s]/gu,'');

test('language restarts keep their deck and replayed questions cannot claim the same practice twice',()=>{
  for(const language of Object.keys(LANGUAGES))for(const mode of Object.keys(MODES)){
    const round=new LanguageRound(language,mode),deck=round.deck;
    assert.equal(round.claimPractice(),false);round.heardWord();
    if(['listen','read'].includes(mode))round.answer(round.current.item.id);else round.finishPractice();
    assert.equal(round.claimPractice(),true);assert.equal(round.claimPractice(),false);
    round.next();round.heardWord();round.restart();
    assert.equal(round.deck,deck);assert.equal(round.index,0);assert.equal(round.phase,'question');
    assert.equal(round.heard,false);assert.equal(round.tried.size,0);round.heardWord();
    if(['listen','read'].includes(mode))round.answer(round.current.item.id);else round.finishPractice();
    assert.equal(round.claimPractice(),false);round.next();round.heardWord();
    if(['listen','read'].includes(mode))round.answer(round.current.item.id);else round.finishPractice();
    assert.equal(round.claimPractice(),true);
  }
});

test('sentence resets keep the original tiles and undo reopens a completed sentence',()=>{
  const builder=new SentenceBuilder(['मला','पाणी','पाहिजे']),order=[...builder.order];
  assert.equal(builder.reset(),false);builder.choose(0);builder.choose(1);
  assert.equal(builder.reset(),true);assert.deepEqual(builder.picked,[]);assert.deepEqual(builder.order,order);
  [0,1,2].forEach(index=>builder.choose(index));assert.equal(builder.complete,true);
  builder.undo();assert.equal(builder.complete,false);assert.equal(builder.choose(2),'complete');
});

test('both dedicated language games have 84 distinct words and 40 complete phrases across ten worlds',()=>{
  assert.equal(WORDS.length,84);assert.equal(PHRASES.length,40);assert.equal(WORLDS.length,10);
  for(const source of [WORDS,PHRASES]){
    assert.equal(new Set(source.map(item=>item.id)).size,source.length);
    for(const language of Object.keys(LANGUAGES)){
      assert.equal(new Set(source.map(item=>item[language].text)).size,source.length);
      for(const item of source){assert.match(item.id,/^[a-z0-9-]+$/);assert.ok(item.en&&item.picture&&item[language].text&&item[language].roman);assert.ok(WORLDS.some(world=>world.id===item.world));assert.match(item[language].text,language==='chinese'?/\p{Script=Han}/u:/\p{Script=Devanagari}/u);}
    }
  }
  for(const world of WORLDS){assert.ok(WORDS.filter(item=>item.world===world.id).length>=8);assert.equal(PHRASES.filter(item=>item.world===world.id).length,4);}
  assert.equal(languageItem(WORDS.find(item=>item.id==='grandma'),'chinese').en,'Grandma (Dad’s mum)');
});

test('authored sentence tiles reproduce each actual Chinese or Marathi phrase without splitting vowel signs',()=>{
  for(const phrase of PHRASES)for(const language of Object.keys(LANGUAGES)){
    const item=phrase[language];assert.ok(item.chunks.length>=2);assert.ok(item.chunks.every(chunk=>chunk.length>0));
    assert.equal(punctuation(item.chunks.join('')),punctuation(item.text),`${language} ${phrase.id}`);
    if(language==='marathi')assert.ok(item.chunks.every(chunk=>!/^\p{M}/u.test(chunk)));
  }
});

test('every advertised word and phrase has a matching, substantial bundled audio file and source hash',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../assets/languages/manifest.json',import.meta.url),'utf8'));
  assert.equal(manifest.entries.length,248);
  const entries=new Map(manifest.entries.map(entry=>[entry.path,entry]));
  for(const language of Object.keys(LANGUAGES))for(const [kind,source] of [['word',WORDS],['phrase',PHRASES]])for(const item of source){
    const entry=entries.get(`${language}/${kind}-${item.id}.mp3`);assert.ok(entry);
    assert.equal(entry.text,item[language].text);assert.equal(entry.textHash,createHash('sha256').update(item[language].text).digest('hex'));
    const file=new URL(`../${audioPath(language,kind,item.id)}`,import.meta.url),size=(await stat(file)).size;
    assert.equal(size,entry.bytes);assert.ok(size>=1000);
    const data=await readFile(file);assert.ok(data.subarray(0,3).toString()==='ID3'||(data[0]===0xff&&(data[1]&0xe0)===0xe0));
  }
});

test('all 88 language, mode and world combinations have non-repeating targets and valid distinct answer choices',()=>{
  for(const language of Object.keys(LANGUAGES))for(const mode of Object.keys(MODES))for(const world of ['all',...WORLDS.map(item=>item.id)]){
    const deck=lessonDeck(language,mode,world,()=>.3);assert.equal(deck.length,MODES[mode].rounds);assert.equal(new Set(deck.map(question=>question.item.id)).size,deck.length);
    for(const question of deck){assert.equal(question.choices.length,3);assert.equal(new Set(question.choices.map(choice=>choice.id)).size,3);assert.equal(question.choices.filter(choice=>choice.id===question.item.id).length,1);assert.ok(question.choices.every(choice=>choice.world===question.item.world));if(world!=='all')assert.equal(question.item.world,world);}
  }
  assert.throws(()=>lessonDeck('unknown','listen'),RangeError);assert.throws(()=>lessonDeck('marathi','listen','unknown'),RangeError);
});

test('listening requires a completed hearing; quiz retries and next actions cannot award the same discovery twice',()=>{
  for(const language of Object.keys(LANGUAGES))for(const mode of ['listen','read']){
    const round=new LanguageRound(language,mode);
    for(let i=0;i<round.deck.length;i++){
      const target=round.current.item.id,wrong=round.current.choices.find(choice=>choice.id!==target).id;
      if(mode==='listen')assert.equal(round.answer(target),'listen-first');
      assert.equal(round.next(),false);round.heardWord();assert.equal(round.answer(wrong),'retry');assert.equal(round.answer(wrong),'ignored');
      assert.equal(round.answer(target),'correct');assert.equal(round.answer(target),'ignored');assert.equal(round.next(),true);
    }
    assert.equal(round.phase,'complete');assert.equal(round.completed,6);assert.equal(round.next(),false);
  }
  const speaking=new LanguageRound('marathi','speak');assert.equal(speaking.finishPractice(),false);speaking.heardWord();assert.equal(speaking.finishPractice(),true);assert.equal(speaking.finishPractice(),false);
});

test('sentence puzzles allow retries, undo and either instance of an identical word tile',()=>{
  for(const phrase of PHRASES)for(const language of Object.keys(LANGUAGES)){
    const puzzle=new SentenceBuilder(phrase[language].chunks,()=>0);
    assert.ok(puzzle.order.some((index,i)=>index!==i));assert.equal(puzzle.choose(-1),'ignored');assert.equal(puzzle.choose(100),'ignored');
    for(let i=0;i<puzzle.chunks.length;i++)assert.equal(puzzle.choose(i),i===puzzle.chunks.length-1?'complete':'placed');
    assert.equal(puzzle.complete,true);assert.equal(puzzle.choose(0),'ignored');assert.equal(puzzle.undo(),true);assert.equal(puzzle.complete,false);
  }
  const repeated=new SentenceBuilder(['我','爱','我']);assert.equal(repeated.choose(2),'placed');assert.equal(repeated.choose(0),'retry');assert.equal(repeated.choose(1),'placed');assert.equal(repeated.choose(0),'complete');
});

test('Chinese and Marathi passports and sound-guide settings remain separate and invalid stored records are ignored',()=>{
  const storage=memory(),chinese=readLanguageProgress('chinese',storage),marathi=readLanguageProgress('marathi',storage);
  assert.equal(chinese.roman,true);assert.equal(marathi.roman,false);
  chinese.listen.train=1;chinese.build['food-1']=3;saveLanguageProgress('chinese',chinese,storage);
  marathi.speak['family-1']=1;saveLanguageProgress('marathi',marathi,storage);
  assert.equal(readLanguageProgress('chinese',storage).listen.train,1);assert.deepEqual(readLanguageProgress('chinese',storage).speak,{});
  assert.equal(readLanguageProgress('marathi',storage).speak['family-1'],1);assert.deepEqual(readLanguageProgress('marathi',storage).listen,{});
  storage.setItem('dhruva-language-progress-v1','{"marathi":{"listen":{"train":3000,"bad":2,"cat":-3},"roman":"true"}}');
  assert.deepEqual(readLanguageProgress('marathi',storage).listen,{train:999});assert.equal(readLanguageProgress('marathi',storage).roman,false);
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};assert.equal(saveLanguageProgress('marathi',marathi,blocked),false);assert.deepEqual(readLanguageProgress('marathi',blocked).speak,{});
});

test('language audio falls back only to Marathi or Mandarin voices, never Hindi, Cantonese or English',async()=>{
  const voices=[{name:'Samantha',lang:'en-US'},{name:'Lekha',lang:'hi-IN'},{name:'Sinji',lang:'zh-HK'},{name:'Tingting',lang:'zh-CN'},{name:'Aarohi Natural',lang:'mr-IN'}];
  assert.equal(learningVoice('marathi',voices).name,'Aarohi Natural');assert.equal(learningVoice('chinese',voices).name,'Tingting');assert.equal(learningVoice('marathi',voices.slice(0,4)),null);
  assert.equal(learningVoice('chinese',[{name:'Mandarin',lang:'zh-Hans-CN'}]).name,'Mandarin');
  assert.equal(learningVoice('chinese',[{name:'Cantonese',lang:'zh-Hant-HK'}]),null);
  const spoken=[],states=[];const audio=new LearningAudio({mediaFactory:()=>({pause(){},play:()=>Promise.reject(Error('offline'))}),synth:{getVoices:()=>voices,speak:words=>spoken.push(words),cancel(){}},Utterance:class {constructor(text){this.text=text;}}});
  audio.play('marathi','word',{id:'water',text:'पाणी'},{onState:state=>states.push(state)});await Promise.resolve();assert.equal(spoken[0].voice.lang,'mr-IN');assert.equal(spoken[0].text,'पाणी');spoken[0].onend();assert.equal(states.at(-1),'ended');audio.stop();
});

test('stale audio completion cannot unlock a new question and replay supports a slower pitch-preserving pace',()=>{
  const media=[],states=[];const audio=new LearningAudio({mediaFactory:src=>{const item={src,pause(){},play(){this.onplay();return Promise.resolve();}};media.push(item);return item;}});
  audio.play('chinese','word',{id:'train',text:'地铁'},{onState:state=>states.push(state)});const oldEnd=media[0].onended;
  audio.play('marathi','word',{id:'water',text:'पाणी'},{slow:true,onState:state=>states.push('new-'+state)});oldEnd();assert.ok(!states.includes('ended'));assert.equal(media[1].playbackRate,.8);assert.equal(media[1].preservesPitch,true);media[1].onended();assert.equal(states.at(-1),'new-ended');audio.stop();
});

test('optional practice recordings stop tracks, revoke playback URLs and discard a permission result after leaving',async()=>{
  let stopped=0,ready=0;const revoked=[],track={stop:()=>stopped++},stream={getTracks:()=>[track]};
  class Recorder {static isTypeSupported(){return true;}constructor(){this.state='inactive';this.mimeType='audio/webm';}start(){this.state='recording';}stop(){this.state='inactive';this.ondataavailable({data:new Blob(['test practice'])});this.onstop();}}
  const recording=new PracticeRecording({devices:{getUserMedia:async()=>stream},Recorder,urls:{createObjectURL:()=> 'blob:practice',revokeObjectURL:url=>revoked.push(url)}});
  await recording.start(()=>ready++,()=>assert.fail('unexpected recording error'));assert.equal(recording.recorder.state,'recording');recording.stop();assert.equal(recording.url,'blob:practice');assert.equal(ready,1);assert.ok(stopped>0);recording.dispose();assert.deepEqual(revoked,['blob:practice']);
  let resolve;const pending=new PracticeRecording({devices:{getUserMedia:()=>new Promise(done=>{resolve=done;})},Recorder});const work=pending.start(()=>assert.fail('stale recording'),()=>assert.fail('stale error'));pending.dispose();resolve(stream);await work;assert.equal(pending.recorder,null);assert.ok(stopped>=2);
});

test('a late stop event from an old recording cannot clear a newer microphone stream',async()=>{
  const stopped=[],pending=[];let request=0;
  const streams=[0,1].map(id=>({getTracks:()=>[{stop:()=>stopped.push(id)}]}));
  class Recorder {constructor(){this.state='inactive';}start(){this.state='recording';}stop(){this.state='inactive';pending.push(()=>this.onstop());}}
  const recording=new PracticeRecording({devices:{getUserMedia:async()=>streams[request++]},Recorder});
  await recording.start(()=>assert.fail('old recording kept'),()=>assert.fail('unexpected error'));
  recording.dispose();await recording.start(()=>assert.fail('discarded recording kept'),()=>assert.fail('unexpected error'));
  pending.shift()();assert.equal(recording.stream,streams[1]);assert.equal(recording.recorder.state,'recording');
  recording.dispose();pending.shift()();assert.equal(recording.stream,null);assert.ok(stopped.includes(0)&&stopped.includes(1));
});
