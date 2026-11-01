import { LANGUAGES, WORLDS, WORDS, PHRASES, languageItem } from './language-data.js';
import { MODES, LanguageRound, SentenceBuilder, readLanguageProgress, saveLanguageProgress } from './language-model.js';
import { LearningAudio } from './language-audio.js';
import { PracticeRecording } from './language-recording.js';
import { mascot, picture } from './language-art.js';
import { escapeHTML as esc } from './activity-scenes.js';
import { AudioGuide } from '../audio.js';
import { mountVoiceSettings } from '../voice-settings.js';
import { readClub, writeClub, recordCompletion } from './progress.js';

const $=selector=>document.querySelector(selector),root=$('#language-root');
const language=LANGUAGES[new URLSearchParams(location.search).get('lang')]||LANGUAGES.chinese,id=language.id;
const audio=new AudioGuide(readClub().sound),speaker=new LearningAudio(),recording=new PracticeRecording();
let progress=readLanguageProgress(id),view='setup',world='all',mode='listen',round=null,builder=null;
let feedback='',audioState='',playTicket=0,bookQuery='',bookPage=0,showModel=true,awarded=false,storageOK=true,recordState='idle',introducing=false;
const native=text=>`<span class="native-text" lang="${language.locale}">${esc(text)}</span>`;
const roman=text=>progress.roman?`<span class="roman-help">${esc(text)}</span>`:'';
const worldName=worldId=>WORLDS.find(item=>item.id===worldId)?.name||'All worlds';
function scrollLesson(){if(matchMedia('(max-width:650px)').matches)root.querySelector('.language-lesson,.language-reward')?.scrollIntoView({block:'start',behavior:'instant'});}
const announce=text=>{$('#language-announcement').textContent=text;};
function save(){storageOK=saveLanguageProgress(id,progress);}
function pauseOwn(){root.querySelectorAll('.own-recording audio').forEach(element=>element.pause());}
function stop(){playTicket++;speaker.stop();audio.stop();audioState='';updateAudio();}
function leave(){pauseOwn();stop();recording.dispose();recordState='idle';feedback='';$('#language-confetti').replaceChildren();}
function soundButton(){const button=$('#language-sound');button.textContent=audio.enabled?'♪':'♫';button.setAttribute('aria-label',`Turn sound ${audio.enabled?'off':'on'}`);button.setAttribute('aria-pressed',String(audio.enabled));}
function enableSound(){if(!audio.enabled){audio.enabled=true;writeClub({...readClub(),sound:true});soundButton();}audio.unlock();}
function soundStatus(){return ({loading:'Getting your word ready…',playing:'Have a listen…',ended:round?.mode==='speak'?'Now it’s your speaking turn!':'Ready when you are.',error:'Audio couldn’t play. Tap Hear again to retry, or explore the word book.'})[audioState]||'Tap the speaker whenever you need a little help.';}
function updateAudio(){
  const status=$('#learning-audio-status');if(status)status.textContent=soundStatus();
  if(view==='lesson'&&round){root.querySelectorAll('[data-answer]').forEach(button=>{button.disabled=round.phase!=='question'||round.tried.has(button.dataset.answer)||(mode==='listen'&&!round.heard);});const practice=root.querySelector('[data-action="practice"]');if(practice)practice.disabled=!round.heard||round.phase!=='question';}
  const ready=root.querySelector('[data-action="ready"]');if(ready)ready.disabled=!round.heard;
}
function play(item,kind,slow=false,{requested=true}={}){
  if(requested)enableSound();else if(!audio.enabled){updateAudio();return;}
  pauseOwn();if(recording.recorder)recording.stop();audio.stop();const ticket=++playTicket;
  speaker.play(id,kind,item,{slow,onState:state=>{if(ticket!==playTicket)return;audioState=state;if(state==='ended'&&view==='lesson'&&round?.current.item.id===item.id)round.heardWord();updateAudio();}});
}
function celebration(){audio.celebrate(true);if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;$('#language-confetti').innerHTML=Array.from({length:24},(_,i)=>`<i style="--left:${Math.random()*100}%;--delay:${Math.random()*.3}s;--colour:${['#ef789d','#ffcc5d','#87cfb1','#a18bd7'][i%4]}"></i>`).join('');}
function worldButtons(){const choices=[{id:'all',name:'Surprise me!',icon:'🌈'},...WORLDS];return `<div class="language-worlds" role="group" aria-label="Choose a word world">${choices.map(item=>`<button type="button" data-world="${item.id}" aria-pressed="${world===item.id}"><span aria-hidden="true">${item.icon}</span>${item.name}</button>`).join('')}</div><label class="mobile-world-label">Choose a word world<select data-world-select>${choices.map(item=>`<option value="${item.id}" ${world===item.id?'selected':''}>${item.icon} ${item.name}</option>`).join('')}</select></label>`;}
function supportControl(){return `<label class="language-support"><input type="checkbox" data-roman ${progress.roman?'checked':''}> ${language.romanLabel}</label>`;}
function setView(next){leave();view=next;bookPage=0;bookQuery='';render();}
function render(){
  document.querySelectorAll('.language-tabs [data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view||(view==='lesson'&&button.dataset.view==='setup'))));
  if(view==='setup')renderSetup();else if(view==='lesson')renderLesson();else if(view==='passport')renderPassport();else renderBook();
}
function renderSetup(){
  root.innerHTML=`<section class="language-hero"><div><p class="eyebrow">${language.greeting} HELLO, LITTLE EXPLORER!</p><h2>A little word.<br>A big new world.</h2><p>Ride with Pip and ${language.friend}. Listen, point, speak and play — one happy discovery at a time.</p><div class="language-content-counts"><span><strong>${WORDS.length}</strong> picture words</span><span><strong>${PHRASES.length}</strong> useful phrases</span><span><strong>${WORLDS.length}</strong> little worlds</span></div><p class="included-audio">♪ Learning audio is included. No microphone needed.</p></div><div class="language-hero-friend">${mascot(language.mascot)}<span class="friend-name">${language.friend}’s ready. Are you?</span></div></section><section class="language-setup"><div class="language-section-heading"><div><p class="eyebrow">WHERE SHALL WE GO?</p><h2>Pick a little world</h2></div><span>Favourites are lovely to revisit.</span></div>${worldButtons()}<div class="language-section-heading"><div><p class="eyebrow">HOW SHALL WE PLAY?</p><h2>Your next discovery</h2></div></div><div class="language-mode-grid">${Object.entries(MODES).map(([key,item])=>`<button type="button" data-mode="${key}" aria-pressed="${mode===key}"><span class="mode-symbol" aria-hidden="true">${item.icon}</span><strong>${item.name}</strong><small>${item.description}</small><i>${key==='listen'?'START HERE':key==='speak'?'TRY IT ALOUD':'OPTIONAL READING'}</i></button>`).join('')}</div><div class="language-start-row"><p>${worldName(world)} · ${MODES[mode].rounds} little ${['listen','read'].includes(mode)?'words':'turns'}<br><small>No timers. No lost lives. Lots of little tries.</small></p><button type="button" class="club-primary" data-action="start">Let’s play ${MODES[mode].icon} →</button></div></section>`;
}
function startLesson(onlyPhrase=null){
  leave();round=new LanguageRound(id,mode,world);if(onlyPhrase)round.deck=[{item:languageItem(onlyPhrase,id),choices:[]}];
  builder=mode==='build'?new SentenceBuilder(round.current.item.chunks):null;introducing=mode==='listen'&&!progress.listen[round.current.item.id];view='lesson';awarded=false;render();scrollLesson();if(mode!=='read')play(round.current.item,['speak','build'].includes(mode)?'phrase':'word',false,{requested:false});
}
function audioButtons(kind){return `<div class="learning-audio-buttons"><button type="button" class="main-audio" data-action="hear"><span aria-hidden="true">▶</span> Hear ${kind}</button><button type="button" class="slow-audio" data-action="slow" aria-label="Hear ${kind} slowly">🐢 Slowly</button></div><p id="learning-audio-status" class="learning-audio-status" role="status">${soundStatus()}</p>`;}
function currentTop(){return `<div class="lesson-topline"><button type="button" class="language-back" data-view="setup">← Choose an adventure</button><span>${MODES[mode].icon} ${MODES[mode].name}</span><strong>${round.index+1} / ${round.deck.length}</strong></div><div class="language-tickets" aria-label="${round.index} of ${round.deck.length} discoveries completed">${round.deck.map((_,index)=>`<span class="${index<round.index?'done':index===round.index?'current':''}" aria-hidden="true">${index<round.index?'★':index+1}</span>`).join('')}<i aria-hidden="true">🚆</i></div>`;}
function renderLesson(){
  if(round.phase==='complete'){renderComplete();return;}
  const item=round.current.item,solved=round.phase==='feedback',phrase=['speak','build'].includes(mode);
  let body;
  if(introducing){
    body=`<div class="new-word-introduction"><p class="eyebrow">A NEW LITTLE WORD TO MEET</p><h2>Look, listen and say hello!</h2><div class="new-word-picture">${picture(item)}</div>${native(item.text)}${roman(item.roman)}<p class="new-word-meaning">${esc(item.en)}</p>${audioButtons('the word')}<button type="button" class="club-primary" data-action="ready" ${round.heard?'':'disabled'}>I’m ready to find it →</button><p class="introduction-note">Have a little go at saying it. Then we’ll find its picture!</p></div>`;
  }else if(mode==='listen'||mode==='read'){
    body=`<div class="lesson-question"><p class="eyebrow">${worldName(item.world).toUpperCase()}</p><h2>${mode==='listen'?`What did ${language.friend} say?`:'Find the matching word.'}</h2>${mode==='read'?`<div class="reading-picture" role="img" aria-label="${esc(item.en)}">${picture(item)}</div>`:'<span class="listening-spark" aria-hidden="true">👂 ✦</span>'}${audioButtons('the word')}<div class="language-choice-grid ${mode==='read'?'reading-choices':''}" role="group" aria-label="Choose an answer">${round.current.choices.map(choice=>`<button type="button" class="language-choice ${solved&&choice.id===item.id?'correct':''} ${round.tried.has(choice.id)?'tried':''}" data-answer="${choice.id}" aria-label="${esc(mode==='listen'?'Choose '+choice.en:'Choose '+choice.text)}" ${solved||round.tried.has(choice.id)||(mode==='listen'&&!round.heard)?'disabled':''}>${mode==='listen'?`<div class="choice-picture">${picture(choice)}</div><strong>${esc(choice.en)}</strong>`:`${native(choice.text)}${roman(choice.roman)}`}<span class="choice-sticker" aria-hidden="true">${solved&&choice.id===item.id?'✓':''}</span></button>`).join('')}</div></div>`;
  }else if(mode==='speak'){
    body=`<div class="speaking-scene"><span class="phrase-picture" aria-hidden="true">${item.picture}</span><div><p class="eyebrow">A LITTLE PHRASE FOR REAL LIFE</p><h2>${esc(item.en)}</h2><div class="phrase-model">${native(item.text)}${roman(item.roman)}</div></div></div>${audioButtons('the phrase')}<section class="speaking-turn"><div><span aria-hidden="true">💬</span><div><h3>Now you have a go!</h3><p>Say it to ${language.friend}, or to someone beside you.</p></div></div><div id="record-controls"></div><button type="button" class="club-primary" data-action="practice" ${!round.heard||solved?'disabled':''}>I tried saying it! ★</button><p class="speaking-kind-note">A brave little try counts. This is practice, with no pronunciation score.</p></section>`;
  }else{
    body=`<div class="builder-heading"><span class="phrase-picture" aria-hidden="true">${item.picture}</span><div><p class="eyebrow">PIECE BY LITTLE PIECE</p><h2>${esc(item.en)}</h2><button type="button" class="model-toggle" data-action="model" aria-pressed="${showModel}">${showModel?'Hide':'Show'} the model</button></div></div>${showModel?`<div class="builder-model">${native(item.text)}${roman(item.roman)}</div>`:'<p class="builder-listen-tip">Hear the phrase, then put its words in order. You can show the model at any time.</p>'}${audioButtons('the phrase')}<div class="sentence-slots" role="group" aria-label="Your sentence">${item.chunks.map((text,index)=>`<span class="${index<builder.picked.length?'filled':''}">${index<builder.picked.length?native(text):`<i aria-hidden="true">${index+1}</i>`}</span>`).join('')}</div><div class="sentence-tiles" role="group" aria-label="Word tiles">${builder.order.map(index=>`<button type="button" data-tile="${index}" aria-label="Add ${esc(item.chunks[index])}" ${builder.picked.includes(index)||solved?'disabled':''}>${native(item.chunks[index])}</button>`).join('')}</div><button type="button" class="language-back" data-action="undo-tile" ${!builder.picked.length||solved?'disabled':''}>↶ Take back a word</button>`;
  }
  root.innerHTML=`<section class="language-lesson">${currentTop()}<div class="lesson-main"><div class="lesson-workspace">${body}<p class="language-feedback ${solved?'positive':''}" role="status">${feedback|| (mode==='listen'&&!round.heard?'Listen first. Then pick a picture.':'Take your time. You can hear it again.')}</p>${solved?`<div class="discovered-word"><span aria-hidden="true">★</span><div>${native(item.text)}${roman(item.roman)}<p>${esc(item.en)}</p></div></div><button type="button" class="club-primary lesson-next" data-action="next">${round.index===round.deck.length-1?'Open my little reward':'Next discovery'} →</button>`:''}</div><aside class="lesson-friend">${mascot(language.mascot,solved)}<p>${solved?'A lovely little discovery!':mode==='speak'?'I’d love to hear you!':'I’m right here with you.'}</p>${supportControl()}<small>${language.name} adventure · ${worldName(item.world)}</small></aside></div></section>`;
  if(mode==='speak')renderRecording();
}
function renderRecording(){
  const controls=$('#record-controls');if(!controls)return;
  controls.innerHTML=recording.url?`<div class="own-recording"><p>That’s your voice! Have a listen.</p><audio controls src="${recording.url}" aria-label="My practice recording"></audio><button type="button" class="language-back" data-action="delete-recording">Clear my recording</button></div>`:`<button type="button" class="record-button" data-action="${recordState==='recording'?'stop-recording':'record'}" ${!recording.supported||recordState==='asking'?'disabled':''}>${recordState==='recording'?'■ Stop recording':recordState==='asking'?'Waiting for microphone…':'● Record my turn (optional)'}</button><p class="record-note">${recordState==='error'?'The microphone couldn’t start. You can still practise aloud.':!recording.supported?'Recording isn’t available here. Say your phrase aloud instead.':'A short recording stays here and is cleared when you change activity.'}</p>`;
}
function markPractice(){const item=round.current.item;progress[mode][item.id]=Math.min((progress[mode][item.id]||0)+1,999);save();}
function answer(answerId){const result=round.answer(answerId);if(result==='correct'){stop();markPractice();feedback='You found it! Say the word with your friend.';announce(feedback);audio.celebrate();renderLesson();play(round.current.item,'word',false,{requested:false});}else if(result==='retry'){feedback='A little clue: hear the word again, then try another picture or word.';renderLesson();announce(feedback);}else if(result==='listen-first'){feedback='Have a listen first. Then choose a picture.';renderLesson();}}
function chooseTile(index){const result=builder.choose(index);if(result==='retry'){feedback='Try a different word to match the model. You can hear the phrase again.';renderLesson();}else if(result==='placed'){feedback='A lovely fit. Which word comes next?';renderLesson();}else if(result==='complete'){round.finishPractice();markPractice();feedback='You put the whole phrase together! Have a go at saying it.';audio.celebrate();renderLesson();play(round.current.item,'phrase',false,{requested:false});}}
function next(){leave();if(!round.next())return;feedback='';introducing=mode==='listen'&&round.phase!=='complete'&&!progress.listen[round.current.item.id];if(round.phase!=='complete')builder=mode==='build'?new SentenceBuilder(round.current.item.chunks):null;render();scrollLesson();if(round.phase!=='complete'&&mode!=='read')play(round.current.item,['speak','build'].includes(mode)?'phrase':'word',false,{requested:false});}
function renderComplete(){
  if(!awarded){awarded=true;recordCompletion(id);celebration();announce(`Lovely discovering! Your ${language.name} passport has grown.`);}
  const count=round.deck.length,verb=mode==='speak'?'phrases tried aloud':mode==='build'?'sentence puzzles solved':mode==='read'?'written words matched':'words found by listening';
  root.innerHTML=`<section class="language-reward"><div class="reward-friend">${mascot(language.mascot,true)}<span class="reward-sticker">A LITTLE BRAVER ★</span></div><div><p class="eyebrow">LOOK HOW FAR YOUR WORDS HAVE TAKEN YOU</p><h2>High-five,<br>little explorer!</h2><p>${count} ${verb}. ${language.friend} loved discovering with you.</p><div class="reward-words">${round.deck.map(({item})=>native(item.text)).join('')}</div><button type="button" class="club-primary" data-action="again">Another little adventure →</button><button type="button" class="language-secondary" data-view="passport">🎟️ See my language passport</button><button type="button" class="language-back" data-view="setup">Choose another world</button></div></section>`;
}
function fold(text){return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function bookResults(){
  const source=view==='words'?WORDS:PHRASES,query=fold(bookQuery).trim().split(/\s+/).filter(Boolean),matches=source.map(item=>languageItem(item,id)).filter(item=>(world==='all'||item.world===world)&&query.every(word=>fold(`${item.en} ${item.text} ${item.roman} ${item.id}`).includes(word)));
  const pages=Math.max(1,Math.ceil(matches.length/12));bookPage=Math.max(0,Math.min(bookPage,pages-1));
  return `<p class="book-result-count" role="status">${matches.length?`${bookPage*12+1}–${Math.min(bookPage*12+12,matches.length)} of ${matches.length} ${view==='words'?(matches.length===1?'word':'words'):(matches.length===1?'phrase':'phrases')}`:'No matches. Try another word or world.'}</p><div class="language-book-grid ${view==='phrases'?'phrase-book-grid':''}">${matches.slice(bookPage*12,bookPage*12+12).map(item=>`<article class="language-book-card"><button type="button" ${view==='words'?'data-word':'data-phrase'}="${item.id}" aria-label="Hear ${esc(item.en)} in ${language.name}"><div class="book-word-picture">${view==='words'?picture(item):`<span class="word-emoji" aria-hidden="true">${item.picture}</span>`}</div>${native(item.text)}${roman(item.roman)}<strong>${esc(item.en)}</strong><span class="book-hear">♪ Hear ${view==='words'?'word':'phrase'}</span></button>${view==='words'&&item.scene?`<a class="colour-and-talk" href="./activity.html?game=colouring&page=${item.scene}">🖍️ Colour & say ${native(item.text)}</a>`:view==='phrases'?`<button type="button" class="phrase-practice" data-practise="${item.id}">Try saying it →</button>`:''}</article>`).join('')}</div>${pages>1?`<nav class="language-pagination" aria-label="Library pages"><button type="button" class="language-secondary" data-page-step="-1" ${bookPage===0?'disabled':''}>← Previous</button><span>${bookPage+1} / ${pages}</span><button type="button" class="language-secondary" data-page-step="1" ${bookPage===pages-1?'disabled':''}>Next discoveries →</button></nav>`:''}`;
}
function renderBook(){root.innerHTML=`<section class="language-library"><div class="language-section-heading"><div><p class="eyebrow">${view==='words'?'EVERY LITTLE WORD HAS A PICTURE':'LITTLE PHRASES. REAL-LIFE ADVENTURES.'}</p><h2>${view==='words'?`${WORDS.length} words to wonder about`:`${PHRASES.length} things you can say`}</h2><p>${view==='words'?'Tap a picture to hear its word. Try saying it too!':'Hear a phrase, then give it a little try yourself.'}</p></div>${supportControl()}</div>${worldButtons()}<label class="language-search">Find a ${view==='words'?'word':'phrase'}<input type="search" data-book-search placeholder="Try ${id==='chinese'?'train or 地铁':'water or पाणी'}…" value="${esc(bookQuery)}"></label><p id="learning-audio-status" class="learning-audio-status" role="status">${soundStatus()}</p><div id="language-book-results">${bookResults()}</div></section>`;}
function renderPassport(){
  const stats=[['listen','Words found by listening',WORDS.length],['read','Words matched in print',WORDS.length],['speak','Phrases tried aloud',PHRASES.length],['build','Sentences put together',PHRASES.length]];
  root.innerHTML=`<section class="language-passport"><div class="passport-heading"><div><p class="eyebrow">MY ${language.name.toUpperCase()} DISCOVERIES</p><h2>Little steps.<br>Look at them grow.</h2><p>Your Chinese and Marathi adventures each have their own passport.</p></div>${mascot(language.mascot,true)}</div><div class="passport-stats">${stats.map(([key,label,total])=>{const count=Object.keys(progress[key]).length;return `<div><span aria-hidden="true">${MODES[key].icon}</span><strong>${count}<small> / ${total}</small></strong><p>${label}</p><div class="passport-bar"><i style="width:${count/total*100}%"></i></div></div>`;}).join('')}</div><div class="passport-worlds">${WORLDS.map(item=>{const found=WORDS.filter(word=>word.world===item.id&&(progress.listen[word.id]||progress.read[word.id])).length;return `<div class="${found?'visited':''}"><span aria-hidden="true">${item.icon}</span><strong>${item.name}</strong><small>${found} picture words explored</small></div>`;}).join('')}</div><p class="passport-note">These are activities you practised. Speaking stars celebrate having a go.${!storageOK?' Your passport couldn’t be saved in this browser this time.':''}</p><button type="button" class="club-primary" data-view="setup">Off on another adventure →</button></section>`;
}

document.addEventListener('click',event=>{
  const button=event.target.closest('[data-view]');if(button&&!button.disabled)setView(button.dataset.view);
});
root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||button.disabled)return;audio.unlock();
  if(button.dataset.world){stop();world=button.dataset.world;bookPage=0;feedback='';render();return;}
  if(button.dataset.mode){mode=button.dataset.mode;renderSetup();return;}
  if(button.dataset.answer){answer(button.dataset.answer);if(event.detail===0)root.querySelector('[data-action=next], [data-answer]:not(:disabled)')?.focus({preventScroll:true});root.querySelector('.lesson-next')?.scrollIntoView({block:'nearest',behavior:'instant'});return;}
  if(button.hasAttribute('data-tile')){chooseTile(Number(button.dataset.tile));if(event.detail===0)root.querySelector('[data-action=next], [data-tile]:not(:disabled)')?.focus({preventScroll:true});root.querySelector('.lesson-next')?.scrollIntoView({block:'nearest',behavior:'instant'});return;}
  if(button.dataset.word){play(languageItem(WORDS.find(item=>item.id===button.dataset.word),id),'word');return;}
  if(button.dataset.phrase){play(languageItem(PHRASES.find(item=>item.id===button.dataset.phrase),id),'phrase');return;}
  if(button.dataset.practise){mode='speak';startLesson(PHRASES.find(item=>item.id===button.dataset.practise));return;}
  if(button.dataset.pageStep){stop();bookPage+=Number(button.dataset.pageStep);$('#language-book-results').innerHTML=bookResults();$('#language-book-results').scrollIntoView({block:'start',behavior:'instant'});return;}
  const action=button.dataset.action;
  if(action==='start'||action==='again')startLesson();
  else if(action==='ready'&&round.heard){introducing=false;feedback='Now find the picture for the word you just met.';renderLesson();scrollLesson();play(round.current.item,'word',false,{requested:false});}
  else if(action==='hear'||action==='slow')play(round.current.item,['speak','build'].includes(mode)?'phrase':'word',action==='slow');
  else if(action==='next')next();
  else if(action==='practice'&&round.heard&&round.finishPractice()){recording.stop();markPractice();feedback='A brave little speaking turn. Try this phrase with someone today!';announce(feedback);audio.celebrate();renderLesson();root.querySelector('.lesson-next')?.scrollIntoView({block:'nearest',behavior:'instant'});}
  else if(action==='model'){showModel=!showModel;renderLesson();}
  else if(action==='undo-tile'&&builder.undo()){feedback='Try another little word.';renderLesson();}
  else if(action==='record'){
    stop();recordState='asking';renderRecording();const current=round.current.item.id;
    void recording.start(()=>{if(view==='lesson'&&round.current.item.id===current){recordState='ready';renderRecording();}},()=>{recordState='error';renderRecording();}).then(()=>{if(recording.recorder){recordState='recording';renderRecording();}});
  }else if(action==='stop-recording')recording.stop();
  else if(action==='delete-recording'){pauseOwn();recording.dispose();recordState='idle';renderRecording();}
});
root.addEventListener('input',event=>{if(event.target.hasAttribute('data-book-search')){bookQuery=event.target.value;bookPage=0;$('#language-book-results').innerHTML=bookResults();}});
root.addEventListener('change',event=>{if(event.target.hasAttribute('data-roman')){progress.roman=event.target.checked;save();render();root.querySelector('[data-roman]')?.focus({preventScroll:true});}else if(event.target.hasAttribute('data-world-select')){stop();world=event.target.value;bookPage=0;render();}});
root.addEventListener('play',event=>{if(event.target.matches('.own-recording audio'))stop();},true);
$('#language-sound').addEventListener('click',()=>{audio.enabled=!audio.enabled;writeClub({...readClub(),sound:audio.enabled});if(!audio.enabled)stop();soundButton();});
$('#language-help').addEventListener('click',()=>{
  pauseOwn();stop();recording.dispose();recordState='idle';renderRecording();enableSound();
  const guides={listen:introducing?'Look at the picture and hear its new word. Have a go at saying it. Then tap I’m ready to find it.':'Hear the word, then find its picture. You can hear it again or try another picture. Take your time!',read:'Look at the picture and find its written word. Tap the speaker if you need a little clue.',speak:'Hear the phrase, then try saying it aloud. You can record your turn, or just say it. Tap I tried saying it when you have had a go.',build:'Hear the phrase, then put the word tiles in order. You can show the model or take back a word whenever you like.'};
  const text=view==='lesson'&&round?.phase!=='complete'?guides[mode]:view==='words'?'Tap a picture to hear its word. Try saying it too. You can choose a world or search for a favourite word.':view==='phrases'?'Tap a phrase to hear it. Then choose Try saying it to have your own speaking turn.':view==='passport'?'Here are the words and phrases you have practised. Keep exploring to watch your passport grow!':'Choose a little world and how you want to play. Start with Listen and find. Then tap Let’s play. Your friend will help you discover new words.';
  announce(text);audio.speak(text);
});
$('#language-grownups').addEventListener('click',()=>{pauseOwn();stop();recording.dispose();recordState='idle';renderRecording();$('#language-parent-dialog').showModal();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseOwn();stop();recording.dispose();recordState='idle';renderRecording();}});
window.addEventListener('pagehide',leave);
mountVoiceSettings(audio,{anchor:$('#language-sound'),onOpen:()=>{pauseOwn();stop();recording.dispose();recordState='idle';renderRecording();},description:`This changes the English guide. The ${language.name} learning clips have their own included voice.`});
document.documentElement.style.setProperty('--language-colour',language.colour);document.documentElement.style.setProperty('--language-soft',language.soft);document.body.dataset.language=id;
$('#language-title').textContent=language.title;$('#language-subtitle').textContent=id==='chinese'?'你好！ Listen, speak and discover Mandarin.':'नमस्कार! Little Marathi words for everyday adventures.';
document.title=`${language.title} · Dhruva’s Discovery Club`;
document.querySelectorAll('.language-links a').forEach(link=>{if(new URL(link.href).searchParams.get('lang')===id)link.setAttribute('aria-current','page');});
soundButton();render();
