import { HomeJourney, CHAPTERS, loadJourney, saveJourney, HOME_KEY } from './home-model.js';
import { HomePainter } from './home-art.js';
import { HomeAmbience } from './home-sound.js';
import { AudioGuide } from '../audio.js';
import { mountVoiceSettings } from '../voice-settings.js';
import { readClub, writeClub, recordCompletion } from './progress.js';
const $=id=>document.getElementById(id),canvas=$('landscape');
let storage;try{storage=localStorage;}catch{}
let journey=loadJourney(storage),started=false,paused=false,target=null,direction=0,lastTime=0,lastSave=0,raf=0,lastNearby=-2;
const keys=new Set(),motion=matchMedia('(prefers-reduced-motion: reduce)'),audio=new AudioGuide(readClub().sound),ambience=new HomeAmbience(audio),painter=new HomePainter(canvas);
const chapterIcons=['✿','≈','竹','🏮','🚂','🍂','🎈','⌂'];
let currentStory=journey.scene.story;
const hasSaved=()=>{try{return Boolean(storage.getItem(HOME_KEY));}catch{return false;}};
$('begin').textContent=hasSaved()?'Continue our journey':'Let’s wander';
function save(){saveJourney(journey,storage);}
function blocked(){return !started||paused||document.hidden||Boolean(document.querySelector('dialog[open]'))||journey.finished;}
function clearMovement(){keys.clear();direction=0;target=null;}
function stop(){clearMovement();audio.stop();ambience.stop();}
function tell(text,label='YOUR LITTLE ADVENTURE',speak=true){currentStory=text;$('story').textContent=text;$('story-label').textContent=label;if(speak)audio.speak(text);}
function soundLabel(){$('sound').textContent=audio.enabled?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(audio.enabled));}
function updateControls(){
  const near=journey.nearby;
  if(near!==lastNearby){lastNearby=near;$('interact').disabled=near<0;$('interact').textContent=near<0?'Find a golden circle':journey.scene.objects[near].label;}
  $('interact').hidden=journey.ready;$('next').hidden=!journey.ready;
  $('next').textContent=journey.chapter===CHAPTERS.length-1?'Come home':'Next chapter';
}
function renderScene(speak=true){
  lastNearby=-2;$('place').textContent=journey.scene.place;$('chapter-title').textContent=journey.scene.name;
  $('chapter-count').textContent=`Chapter ${journey.chapter+1} of ${CHAPTERS.length} · ${({walk:'On foot',canoe:'By canoe',train:'By train',balloon:'By balloon'})[journey.scene.mode]}`;
  const verbs=journey.scene.mode==='walk'?'walk':'travel';$('control-hint').textContent=`Tap the landscape to ${verbs} · ← → to move · Space to explore`;
  $('discoveries').innerHTML=journey.scene.objects.map((object,i)=>`<button type="button" data-discovery="${i}" class="${journey.found.has(i)?'found':''}" aria-label="${journey.found.has(i)?'Revisit':'Travel to'}: ${object.label}" title="${object.label}"><span class="discovery-dot" aria-hidden="true">${journey.found.has(i)?'✓':i+1}</span><span class="discovery-name">${['First wonder','Second wonder','Third wonder'][i]}</span></button>`).join('');
  tell(journey.ready?journey.scene.end:journey.scene.story,journey.ready?'A LITTLE FURTHER ALONG':'YOUR LITTLE ADVENTURE',speak);updateControls();save();draw();
}
function draw(){painter.draw(journey,motion.matches?0:performance.now(),false,motion.matches);}
function showEnding(speak=true){
  $('ending').hidden=false;$('ending-story').textContent=CHAPTERS.at(-1).end;$('scene-footer').hidden=true;$('story-panel').hidden=true;clearMovement();ambience.stop();audio.stop();if(speak)audio.speak(CHAPTERS.at(-1).end);draw();
}
function start(){
  started=true;paused=false;document.body.classList.add('playing');$('intro').hidden=true;$('pause-overlay').hidden=true;$('scene-footer').hidden=false;$('story-panel').hidden=false;
  audio.unlock();renderScene(false);
  if(journey.finished)showEnding();else{ambience.start(journey.chapter);tell(journey.ready?journey.scene.end:journey.scene.story);}
  $('story-panel').focus({preventScroll:true});
}
function explore(){
  if(blocked())return;
  const discovery=journey.interact();if(!discovery)return;
  clearMovement();audio.notes([392,493.88,587.33],.16,.035);renderScene(false);tell(discovery.text,journey.ready?'THREE LITTLE WONDERS FOUND':'A LITTLE MOMENT TO REMEMBER');save();$('story-panel').focus({preventScroll:true});
}
function advance(){
  if(blocked())return;
  const alreadyComplete=journey.completed.size===CHAPTERS.length;
  if(!journey.advance())return;clearMovement();audio.stop();ambience.stop();
  if(journey.finished){if(!alreadyComplete)recordCompletion('long-way-home');save();showEnding();$('read-book').focus({preventScroll:true});}
  else{renderScene();ambience.start(journey.chapter);$('story-panel').focus({preventScroll:true});}
}
function openDialog(id){stop();$(id).showModal();}
function showBook(){
  $('book-pages').innerHTML=CHAPTERS.map((scene,i)=>{const available=i<=Math.min(journey.completed.size,CHAPTERS.length-1),completed=journey.completed.has(i);return `<button class="book-page" data-chapter="${i}" ${available?'':'disabled'}><span aria-hidden="true">${available?chapterIcons[i]:'·'}</span><span><b>${scene.name}</b><small>${completed?'✓ A page full of memories':available?'Your next little adventure':'Waiting further along the way'}</small></span></button>`;}).join('');openDialog('book');
}
$('begin').addEventListener('click',start);$('interact').addEventListener('click',explore);$('next').addEventListener('click',advance);
$('hear').addEventListener('click',()=>{audio.unlock();audio.speak(currentStory,{preview:true});});
$('pet').addEventListener('click',()=>{if(blocked())return;clearMovement();tell('Chiku leans against your knee. A warm nose, a wagging tail. There’s always time for a little cuddle.','A MOMENT WITH YOUR BEST FRIEND');});
$('sound').addEventListener('click',()=>{audio.enabled=!audio.enabled;const club=readClub();club.sound=audio.enabled;writeClub(club);soundLabel();if(audio.enabled&&!blocked())ambience.start(journey.chapter);else{audio.stop();ambience.stop();}});
$('chapters').addEventListener('click',showBook);$('read-book').addEventListener('click',showBook);$('help').addEventListener('click',()=>openDialog('help-dialog'));
$('pause').addEventListener('click',()=>{paused=true;stop();$('pause-overlay').hidden=false;$('resume').focus({preventScroll:true});});
$('resume').addEventListener('click',()=>{paused=false;$('pause-overlay').hidden=true;if(!blocked())ambience.start(journey.chapter);$('story-panel').focus({preventScroll:true});});
$('restart').addEventListener('click',()=>{$('book').close();openDialog('restart-dialog');});
$('again').addEventListener('click',()=>openDialog('restart-dialog'));
$('confirm-restart').addEventListener('click',()=>{journey=new HomeJourney();$('ending').hidden=true;$('restart-dialog').close();save();start();});
$('book-pages').addEventListener('click',event=>{const button=event.target.closest('[data-chapter]');if(!button||button.disabled)return;if(journey.visit(Number(button.dataset.chapter))){$('ending').hidden=true;$('book').close();save();start();}});
$('discoveries').addEventListener('click',event=>{const button=event.target.closest('[data-discovery]');if(!button||blocked())return;target=journey.scene.objects[Number(button.dataset.discovery)].x;direction=0;$('story-panel').focus({preventScroll:true});});
for(const button of document.querySelectorAll('[data-close]'))button.addEventListener('click',()=>$(button.dataset.close).close());
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('close',()=>{if(!blocked())ambience.start(journey.chapter);});
mountVoiceSettings(audio,{anchor:$('help'),onOpen:stop,onClose:()=>{if(!blocked())ambience.start(journey.chapter);}});
// The shared voice picker may open its own dialog: pause audio and travel immediately.
const dialogObserver=new MutationObserver(()=>{if(document.querySelector('dialog[open]'))stop();});dialogObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
canvas.addEventListener('click',event=>{if(blocked())return;const rect=canvas.getBoundingClientRect();target=Math.max(100,Math.min(2000,(event.clientX-rect.left)/rect.width*painter.width+painter.camera));direction=0;audio.unlock();$('story-panel').focus({preventScroll:true});});
for(const button of document.querySelectorAll('[data-move]')){
  button.addEventListener('pointerdown',event=>{if(blocked())return;event.preventDefault();direction=Number(button.dataset.move);target=null;button.setPointerCapture(event.pointerId);audio.unlock();});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,()=>{direction=0;save();});
  // Enter/Space activation gives keyboard and assistive technology a useful single step.
  button.addEventListener('click',event=>{if(event.detail===0&&!blocked()){journey.move(Number(button.dataset.move)*100);updateControls();save();draw();}});
}
window.addEventListener('keydown',event=>{
  if(blocked()||event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,select,textarea,[contenteditable]'))return;
  if([' ','Enter'].includes(event.key)&&event.target.closest('button,a'))return;
  if(['ArrowLeft','ArrowRight','a','d','A','D'].includes(event.key)){event.preventDefault();keys.add(event.key);target=null;$('story-panel').focus({preventScroll:true});}
  if([' ','Enter'].includes(event.key)&&!event.repeat){event.preventDefault();explore();}
});
window.addEventListener('keyup',event=>{keys.delete(event.key);if(!keys.size)save();});
window.addEventListener('blur',()=>{stop();save();});
window.addEventListener('focus',()=>{if(!blocked())ambience.start(journey.chapter);});
document.addEventListener('visibilitychange',()=>{stop();save();if(!document.hidden){lastTime=0;if(!blocked())ambience.start(journey.chapter);loop(performance.now());}else{cancelAnimationFrame(raf);raf=0;}});
window.addEventListener('pagehide',()=>{stop();save();cancelAnimationFrame(raf);dialogObserver.disconnect();});
window.addEventListener('pageshow',event=>{if(event.persisted){lastTime=0;loop(performance.now());}});
const resizeObserver=new ResizeObserver(()=>{painter.resize();draw();});resizeObserver.observe(canvas);
function loop(time){
  cancelAnimationFrame(raf);const delta=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;
  let moving=false;
  if(!blocked()){
    let dir=direction+(keys.has('ArrowRight')||keys.has('d')||keys.has('D')?1:0)-(keys.has('ArrowLeft')||keys.has('a')||keys.has('A')?1:0);
    const speed=journey.scene.mode==='train'?250:journey.scene.mode==='balloon'?185:210;
    if(target!==null){const difference=target-journey.x;if(Math.abs(difference)<speed*delta+1){journey.x=target;target=null;}else dir=Math.sign(difference);}
    if(dir){const before=journey.x;journey.move(Math.sign(dir)*speed*delta);moving=journey.x!==before;painter.facing=Math.sign(dir);}
    updateControls();if(moving&&time-lastSave>1000){save();lastSave=time;}
  }
  painter.draw(journey,motion.matches?0:time,moving,motion.matches);
  if(!document.hidden)raf=requestAnimationFrame(loop);
}
painter.resize();soundLabel();loop(performance.now());
