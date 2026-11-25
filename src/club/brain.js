import { AudioGuide } from '../audio.js';
import { mountVoiceSettings } from '../voice-settings.js';
import { mountRestart } from '../restart-dialog.js';
import { mountAutoAdvance } from '../auto-advance.js';
import { GAMES } from './catalog.js';
import { readClub, writeClub, recordCompletion } from './progress.js';
import { turtleArt } from './brain-art.js';
import { WORD_THEMES, WORD_LEVELS, customWords } from './brain/word-data.js';
import { WordSearch, wordLine } from './brain/word-search.js';
import { FourGame, chooseFourColumn } from './brain/four.js';
import { PicnicMaze, MAZE_THEMES } from './brain/maze.js';
import { NOTES, TUNES, MUSIC_LEVELS, MelodyMemory, TunePlayer } from './brain/music.js';

const $=selector=>document.querySelector(selector),root=$('#brain-root');
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const ids=['turtle-words','canopy-four','picnic-maze','rainbow-rhythm'];
const requested=new URLSearchParams(location.search).get('game'),id=ids.includes(requested)?requested:ids[0];
const offering=GAMES.find(game=>game.id===id);
const audio=new AudioGuide(readClub().sound),aiClock=mountAutoAdvance();
let seed=Date.now()>>>0;const nextSeed=()=>seed=(seed+0x9e3779b9)>>>0;
let awarded=false;
const instructions={
  'turtle-words':'Help Tilly find her words! Look across or down. Drag from the first letter to the last, or tap the first and last letters. Tap a picture to hear its word. A little hint shows where a word begins.',
  'canopy-four':'Drop a leaf or flower into a column. Try to make four in a row, across, up and down, or diagonally. Take turns with Pip, or choose two players to play together. Undo takes back a turn.',
  'picnic-maze':'Help Tilly collect three picnic treats and reach the basket! Use the arrows, your keyboard, or tap a nearby path. Hedges block the way. Explore, go back, and try another path. There is no hurry!',
  'rainbow-rhythm':'Hear and watch Pip’s tune, then play the same notes. You can hear it again whenever you like. Choose Make music to create your own tune. The letter keys A, S, D, F, G, H, J and K play the piano too.',
};
$('#brain-title').textContent=offering.title;$('#brain-subtitle').textContent=offering.description;
document.title=`${offering.title} · Dhruva’s Discovery Club`;
$('#brain-eyebrow').textContent=offering.badge;
document.querySelectorAll('.brain-links a').forEach(link=>{if(new URL(link.href).searchParams.get('game')===id)link.setAttribute('aria-current','page');});
function announce(text,speak=false){$('#brain-announcement').textContent=text;if(speak)audio.speak(text);}
function reward(){if(!awarded){awarded=true;recordCompletion(id);audio.celebrate(true);}}
function status(text,success=false){return `<p class="brain-status ${success?'success':''}" role="status">${escape(text)}</p>`;}
function options(items,selected){return items.map(([value,label])=>`<option value="${value}" ${value===String(selected)?'selected':''}>${escape(label)}</option>`).join('');}
const resetButton=()=>'<button type="button" class="brain-secondary" data-action="restart">↺ Restart</button>';
function soundButton(){const button=$('#brain-sound');button.textContent=audio.enabled?'♪':'♫';button.setAttribute('aria-label',`Turn sound ${audio.enabled?'off':'on'}`);button.setAttribute('aria-pressed',String(audio.enabled));}

// Turtle Word Hunt -----------------------------------------------------------
let wordTheme='animals',wordLevel='sprout',ownWords=null,words=new WordSearch({seed:nextSeed()});
let wordStatus='Drag across a word, or tap its first and last letters.',wordStart=null,wordHint=null,wordFocus=0,wordPointer=null,suppressWordClick=false;
const foundColours=['#f8d589','#afdfcb','#cbbbe9','#f3b9c4','#b5d9ee','#dddfa1','#e4c4aa','#b9e4e2'];
function newWords(){
  words=new WordSearch({theme:wordTheme,level:wordLevel,words:ownWords,seed:nextSeed()});
  awarded=false;wordStart=null;wordHint=null;wordFocus=0;wordPointer=null;wordStatus='A fresh word adventure! Look for the words beside the grid.';audio.stop();renderWords();
}
function renderWords(){
  const painted=new Map();let colourIndex=0;
  for(const path of words.found.values()){path.forEach(cell=>{if(!painted.has(cell))painted.set(cell,foundColours[colourIndex%foundColours.length]);});colourIndex++;}
  root.innerHTML=`<div class="brain-toolbar"><div class="brain-toolbar-group"><label>World<select name="word-theme" aria-label="Word hunt world">${options([...WORD_THEMES.map(theme=>[theme.id,`${theme.icon} ${theme.name}`]),...(ownWords?[['custom','⭐ Your words']]:[])],ownWords?'custom':wordTheme)}</select></label><label>Challenge<select name="word-level" aria-label="Word hunt challenge">${options(Object.entries(WORD_LEVELS).map(([key,value])=>[key,value.name]),wordLevel)}</select></label></div><div class="brain-toolbar-group"><button type="button" class="brain-primary" data-action="new-words">✦ New puzzle</button><button type="button" class="brain-secondary" data-action="custom-words">Your words</button>${resetButton()}</div></div><section class="brain-workspace"><div class="word-layout"><div class="word-board-wrap"><div class="word-grid" style="--grid:${words.size}" role="group" aria-label="Word search letters, ${words.size} rows and ${words.size} columns">${words.grid.map((letter,cell)=>`<button type="button" class="word-letter ${painted.has(cell)?'found':''} ${cell===wordHint?'hint':''}" ${painted.has(cell)?`style="--found:${painted.get(cell)}"`:''} data-word-cell="${cell}" tabindex="${cell===wordFocus?0:-1}" aria-label="${letter}, row ${Math.floor(cell/words.size)+1}, column ${cell%words.size+1}${painted.has(cell)?', in a found word':''}">${letter}</button>`).join('')}</div><p class="brain-note">${WORD_LEVELS[wordLevel].help}. Tap first + last, or drag. Arrow keys move; Enter chooses a letter.</p></div><aside class="word-sidebar"><div class="word-friend">${turtleArt(words.found.size/words.words.length)}<div><strong>${words.complete?'Tilly’s words are all found!':`Tilly’s word trail · ${words.found.size} / ${words.words.length}`}</strong><p>${ownWords?'Made with your very own words.':'A little letter hunt with a friend.'}</p><div class="word-progress"><span style="width:${words.found.size/words.words.length*100}%"></span></div></div></div><div class="word-clues" role="group" aria-label="Words to find">${words.words.map(({word,picture})=>`<button type="button" class="word-clue ${words.found.has(word)?'is-found':''}" data-hear-word="${word}" aria-label="Hear ${word.toLowerCase()}${words.found.has(word)?', found':''}"><span aria-hidden="true">${escape(picture)}</span><div><b>${word}</b><small>${words.found.has(word)?'✓ Found! · hear it':'♪ Hear this word'}</small></div></button>`).join('')}</div><div class="word-help"><button type="button" class="brain-secondary" data-action="word-hint" ${words.complete?'disabled':''}>✧ A little hint</button></div></aside></div>${status(wordStatus,words.complete)}</section>`;
}
function paintWordSelection(start=wordStart,end=start){
  const path=new Set(wordLine(start,end,words.size));root.querySelectorAll('[data-word-cell]').forEach(button=>button.classList.toggle('picking',path.has(Number(button.dataset.wordCell))));
}
function chooseWord(start,end){
  const result=words.find(start,end);wordStart=null;wordHint=null;
  if(result.status==='retry')wordStatus='Good exploring! Try a straight line from the first letter to the last.';
  else if(result.status==='already')wordStatus=`You’ve already found ${result.word}. Which word comes next?`;
  else{wordStatus=result.status==='complete'?'Every word found! Your puzzle stays here to enjoy. Choose New puzzle when you’re ready.':`You found ${result.word}! Tilly’s shell is getting brighter.`;audio.count();announce(`You found ${result.word.toLowerCase()}!`,true);if(words.complete)reward();}
  wordFocus=end;renderWords();
}
function hearWord(word){audio.unlock();audio.speak(`${word.toLowerCase()}. ${[...word].join(', ')}. ${word.toLowerCase()}.`);}
const customDialog=document.createElement('dialog');customDialog.className='word-custom';customDialog.setAttribute('aria-labelledby','custom-word-title');
customDialog.innerHTML='<form id="custom-word-form"><h2 id="custom-word-title">Make a word hunt</h2><p>Choose 2–8 words, with 2–10 English letters each. Separate them with commas or spaces. Longer lists get a bigger grid.</p><label for="custom-word-input">Your special words<textarea id="custom-word-input" maxlength="200" spellcheck="false">DHRUVA, TRAIN, MUM, DAD, HOME, PIP</textarea></label><p id="custom-word-error" role="alert"></p><div class="word-custom-actions"><button type="button" class="brain-secondary" data-close-custom>Keep playing</button><button type="submit" class="brain-primary">Make my puzzle →</button></div></form>';
document.body.append(customDialog);
customDialog.querySelector('[data-close-custom]').addEventListener('click',()=>customDialog.close());
customDialog.querySelector('form').addEventListener('submit',event=>{
  event.preventDefault();
  try{ownWords=customWords(customDialog.querySelector('textarea').value);newWords();customDialog.close();}
  catch(error){customDialog.querySelector('#custom-word-error').textContent=error.message;}
});

// Canopy Four ---------------------------------------------------------------
let four=new FourGame(),fourMode='pip',fourLevel='gentle',fourStatus='Choose a column. Four leaves in a row make a lovely canopy!';
function queuePip(){
  if(id!=='canopy-four'||fourMode!=='pip'||four.turn!==2||four.winner||four.draw||aiClock.active)return;
  aiClock.schedule(()=>{const col=chooseFourColumn(four,{level:fourLevel});if(col!==null){four.drop(col);afterFourMove();}},650);
}
function afterFourMove(){
  audio.count();
  if(four.winner){fourStatus=four.winner===1?'Four leaves in a row! Lovely thinking.':fourMode==='pip'?'Pip made four flowers! Want another friendly game?':'Four flowers in a row! Lovely thinking.';reward();}
  else if(four.draw){fourStatus='The canopy is full—a draw! Both players did some lovely thinking.';reward();}
  else fourStatus=four.turn===1?'Your leaf turn. Which branch will you choose?':fourMode==='pip'?'Pip is thinking…':'The flower player’s turn. Choose a column.';
  renderFour();queuePip();
}
function renderFour(){
  const done=Boolean(four.winner||four.draw),locked=done||fourMode==='pip'&&four.turn===2;
  root.innerHTML=`<div class="brain-toolbar"><div class="brain-toolbar-group"><label>Play with<select name="four-mode" aria-label="Four in a row players">${options([['pip','🐦 Pip'],['together','Two players']],fourMode)}</select></label>${fourMode==='pip'?`<label>Pip’s style<select name="four-level" aria-label="Pip difficulty">${options([['gentle','Gentle Pip'],['thinking','Thinking Pip']],fourLevel)}</select></label>`:''}</div><div class="brain-toolbar-group"><button type="button" class="brain-secondary" data-action="four-undo" ${four.history.length?'':'disabled'}>↶ Undo turn</button>${resetButton()}</div></div><section class="brain-workspace"><div class="four-layout"><div><div class="four-board" role="group" aria-label="Four in a row board">${Array.from({length:7},(_,col)=>`<button type="button" class="four-column" data-four-col="${col}" aria-label="Drop ${four.turn===1?'leaf':'flower'} in column ${col+1}${four.board[col]?', column full':''}" ${locked||four.board[col]?'disabled':''}><span class="four-drop" aria-hidden="true">↓</span>${Array.from({length:6},(_,row)=>{const cell=row*7+col,token=four.board[cell];return `<span class="four-hole ${token===1?'leaf':token===2?'flower':''} ${four.line.includes(cell)?'winning':''}" aria-hidden="true">${token===1?'✿':token===2?'❀':''}</span>`;}).join('')}<small aria-hidden="true">${col+1}</small></button>`).join('')}</div><div class="four-legend"><span><i class="four-token">✿</i> ${fourMode==='pip'?'You':'Leaf player'}</span><span><i class="four-token pink">❀</i> ${fourMode==='pip'?'Pip':'Flower player'}</span></div></div><aside class="brain-companion"><span class="companion-icon" aria-hidden="true">${four.winner===1?'🌟':fourMode==='pip'?'🐦':'🌼'}</span><h2>${done?four.draw?'A full forest!':four.winner===1?'A leafy high-five!':'Flowers in the canopy!':four.turn===1?'Your little idea could grow!':fourMode==='pip'?'Pip’s turn':'Flower power!'}</h2><p>Make four in a line: across, up and down, or diagonally. Look for a line of your own—and watch the other player’s!</p>${done?'<button type="button" class="brain-primary" data-action="four-again">Another game →</button>':'<p class="brain-note">Tap any column. Keyboard: 1–7. No clock. Just a little friendly thinking.</p>'}</aside></div>${status(fourStatus,done)}</section>`;
}

// Picnic Maze ---------------------------------------------------------------
let mazeSize=5,mazeTheme='garden',maze=new PicnicMaze({seed:nextSeed()}),mazeHint=null,mazeStatus='Collect three picnic treats on your way to the basket.';
function newMaze(){maze=new PicnicMaze({size:mazeSize,theme:mazeTheme,seed:nextSeed()});mazeHint=null;awarded=false;mazeStatus='A new path to explore! Find the picnic basket and collect the treats.';audio.stop();renderMaze();}
function renderMaze(){
  const n=maze.size,unit=500/n,walls=[];
  maze.walls.forEach((edges,cell)=>{
    const x=cell%n*unit,y=Math.floor(cell/n)*unit;
    if(edges[0])walls.push(`<path d="M${x} ${y}h${unit}"/>`);if(edges[3])walls.push(`<path d="M${x} ${y}v${unit}"/>`);
    if(cell%n===n-1&&edges[1])walls.push(`<path d="M${x+unit} ${y}v${unit}"/>`);if(Math.floor(cell/n)===n-1&&edges[2])walls.push(`<path d="M${x} ${y+unit}h${unit}"/>`);
  });
  root.innerHTML=`<div class="brain-toolbar"><div class="brain-toolbar-group"><label>World<select name="maze-theme" aria-label="Maze world">${options(MAZE_THEMES.map(theme=>[theme.id,`${theme.icon} ${theme.name}`]),mazeTheme)}</select></label><label>Challenge<select name="maze-size" aria-label="Maze challenge">${options([[5,'Little pathways'],[7,'Explorer paths'],[9,'Twisty trails']],mazeSize)}</select></label></div><div class="brain-toolbar-group"><button type="button" class="brain-primary" data-action="new-maze">✦ New maze</button>${resetButton()}</div></div><section class="brain-workspace"><div class="maze-layout"><div class="maze-board" style="--maze-bg:${maze.theme.colour}"><svg viewBox="-8 -8 516 516" role="group" aria-label="Picnic maze. Tilly is in row ${Math.floor(maze.cell/n)+1}, column ${maze.cell%n+1}">${maze.walls.map((_,cell)=>{const x=cell%n*unit,y=Math.floor(cell/n)*unit;return `<g class="maze-cell" data-maze-cell="${cell}" role="button" tabindex="${cell===maze.cell?0:-1}" aria-label="Path row ${Math.floor(cell/n)+1}, column ${cell%n+1}"><rect x="${x}" y="${y}" width="${unit}" height="${unit}" fill="${cell===mazeHint?'#ffe19a':maze.visited.has(cell)?'#fff9e4':'transparent'}"/>${maze.visited.has(cell)&&cell!==maze.cell?`<circle cx="${x+unit/2}" cy="${y+unit/2}" r="4" fill="#b4cc9f" pointer-events="none"/>`:''}</g>`;}).join('')}<g class="maze-wall" fill="none">${walls.join('')}</g>${maze.fruits.filter(cell=>!maze.collected.has(cell)).map(cell=>`<text x="${cell%n*unit+unit/2}" y="${Math.floor(cell/n)*unit+unit*.68}" text-anchor="middle" font-size="${unit*.5}" pointer-events="none">${maze.theme.fruit}</text>`).join('')}<text x="${maze.goal%n*unit+unit/2}" y="${Math.floor(maze.goal/n)*unit+unit*.7}" text-anchor="middle" font-size="${unit*.58}" pointer-events="none">🧺</text><text x="${maze.cell%n*unit+unit/2}" y="${Math.floor(maze.cell/n)*unit+unit*.7}" text-anchor="middle" font-size="${unit*.58}" pointer-events="none">🐢</text></svg></div><aside class="maze-side"><div class="brain-companion"><span class="companion-icon" aria-hidden="true">${maze.complete?'🧺':maze.theme.icon}</span><h2>${maze.complete?'A picnic with Tilly!':'Which way shall we go?'}</h2><p>${maze.complete?'You found the path and collected every treat. Enjoy your finished maze, or try a fresh adventure.':'Follow the open paths to the picnic basket. Hedges block the way. You can always go back and explore again.'}</p><div class="maze-counter"><span>${maze.theme.fruit} ${maze.collected.size} / ${maze.fruits.length} treats</span><span>👣 ${maze.steps} steps</span></div></div><div class="maze-pad" role="group" aria-label="Move Tilly">${[['up','↑'],['left','←'],['down','↓'],['right','→']].map(([direction,arrow])=>`<button type="button" class="brain-secondary" data-move="${direction}" aria-label="Move ${direction}" ${maze.complete?'disabled':''}>${arrow}</button>`).join('')}</div><div class="brain-toolbar-group"><button type="button" class="brain-secondary" data-action="maze-undo" ${maze.history.length?'':'disabled'}>↶ Undo step</button><button type="button" class="brain-secondary" data-action="maze-hint" ${maze.complete?'disabled':''}>✧ Glow next step</button></div><p class="brain-note">Arrow keys or WASD move Tilly. You can also tap an adjoining path.</p></aside></div>${status(mazeStatus,maze.complete)}</section>`;
}
function afterMazeMove(result){
  if(result==='ignored')return;
  mazeHint=null;
  if(result==='wall')mazeStatus='There’s a hedge that way. Look for an opening nearby.';
  else if(result==='far')mazeStatus='Try a neighbouring path, or use the arrows to explore.';
  else if(result==='complete'){mazeStatus='Picnic time! You collected every treat and found the basket.';reward();announce(mazeStatus,true);}
  else{mazeStatus=maze.fruits.includes(maze.cell)?'A tasty picnic treat! Keep exploring.':'A little step along your adventure.';audio.count();}
  renderMaze();
}

// Rainbow Rhythm ------------------------------------------------------------
let musicMode='echo',musicLevel='little',melody=new MelodyMemory(),freeNotes=[],musicStatus='Press Hear & watch, then echo Pip’s tune.',flashTimer=null;
const player=new TunePlayer({note(note){audio.unlock();audio.notes([NOTES[note].frequency],.12,.09);},light(note){root.querySelectorAll('[data-note]').forEach(button=>button.classList.toggle('lit',Number(button.dataset.note)===note));}});
function stopMusic(message=false){
  const wasPlaying=player.playing;player.stop();clearTimeout(flashTimer);
  if(melody.phase==='listening')melody.restart();
  if(wasPlaying&&message&&id==='rainbow-rhythm'){musicStatus='The tune stopped. Hear it again when you’re ready.';renderMusic();}
}
function renderMusic(){
  const echo=musicMode==='echo',listening=player.playing;
  root.innerHTML=`<div class="brain-toolbar"><div class="brain-toolbar-group"><label>Play<select name="music-mode" aria-label="Music activity">${options([['echo','Echo Pip'],['free','Make music']],musicMode)}</select></label>${echo?`<label>Challenge<select name="music-level" aria-label="Tune challenge">${options(Object.entries(MUSIC_LEVELS).map(([key,value])=>[key,value.name]),musicLevel)}</select></label>`:''}</div><div class="brain-toolbar-group">${echo?'<button type="button" class="brain-secondary" data-action="new-tune">✦ New tune</button>':'<button type="button" class="brain-secondary" data-action="undo-note" '+(!freeNotes.length?'disabled':'')+'>↶ Undo note</button>'}${resetButton()}</div></div><section class="brain-workspace music-workspace"><div class="music-banner"><span aria-hidden="true">${echo?'🐦':'🎼'}</span><div><h2>${echo?`${melody.tune.name} · tune ${melody.index+1} / ${TUNES.length}`:'Your very own melody'}</h2><p>${echo?'Listen, watch, and play the same little tune. No hurry—hear it again whenever you like.':'Play the rainbow keys. Then listen to the tune you made. Up to 32 notes, just for this visit.'}${!audio.enabled?' Sound is off: follow the colours, or turn sound on.':''}</p></div></div><div class="music-buttons"><button type="button" class="brain-primary" data-action="listen-tune" ${listening||!echo&&!freeNotes.length?'disabled':''}>${listening?'♫ Watch the keys…':echo?'▶ Hear & watch':'▶ Hear my tune'}</button><button type="button" class="brain-secondary" data-action="stop-tune" ${listening?'':'disabled'}>■ Stop</button></div>${echo?`<div class="music-progress" aria-label="${melody.cursor} of ${melody.notes.length} notes echoed">${melody.notes.map((_,i)=>`<span class="music-bead ${i<melody.cursor?'done':''}">${i<melody.cursor?'✓':i+1}</span>`).join('')}</div>`:`<div class="free-notes" aria-label="Your tune has ${freeNotes.length} notes">${freeNotes.map(note=>`<span style="--note:${NOTES[note].colour}">${NOTES[note].name}</span>`).join('')}</div>`}<div class="piano" role="group" aria-label="Rainbow piano">${NOTES.map((note,index)=>`<button type="button" class="piano-key" data-note="${index}" style="--note:${note.colour}" aria-label="Play ${note.name}, ${note.sol}" ${listening?'disabled':''}><b>${note.name==='C high'?'C↑':note.name}</b><span>${note.sol}</span><small>${note.key.toUpperCase()} key</small></button>`).join('')}</div>${status(musicStatus,echo&&melody.phase==='complete')}<p class="brain-note">Keyboard: A S D F G H J K. Hear & watch lights the keys too. 24 tunes at each of three challenges, plus free play.</p></section>`;
}
function listenTune(){
  stopMusic();audio.stop();audio.unlock();
  if(musicMode==='free'&&!freeNotes.length)return;
  if(musicMode==='echo')melody.listen();
  musicStatus='Watch the rainbow keys and listen…';
  player.play(musicMode==='echo'?melody.notes:[...freeNotes],()=>{if(musicMode==='echo'){melody.ready();musicStatus='Your turn! Play the same notes.';}else musicStatus='That was your tune! Add more notes, or start a new melody.';renderMusic();});renderMusic();
}
function tapNote(note){
  if(player.playing)return;
  audio.unlock();audio.notes([NOTES[note].frequency],.12,.09);
  if(musicMode==='free'){
    if(freeNotes.length<32){freeNotes.push(note);musicStatus=`Your melody has ${freeNotes.length} ${freeNotes.length===1?'note':'notes'}. Keep creating!`;if(freeNotes.length===4)reward();}
    else musicStatus='A whole 32-note tune! Hear it, undo a note, or restart to make another.';
  }else{
    const result=melody.press(note);
    if(result==='complete'){musicStatus='A perfect echo! Enjoy your tune, hear it again, or choose New tune.';reward();}
    else if(result==='retry')musicStatus='Let’s try from the first note. You can hear Pip’s tune again.';
    else if(result==='correct')musicStatus='Lovely! Which note comes next?';
    else musicStatus=melody.phase==='complete'?'That tune is complete! Choose New tune for another challenge.':'Press Hear & watch first, then echo the tune.';
  }
  renderMusic();root.querySelector(`[data-note="${note}"]`)?.classList.add('lit');clearTimeout(flashTimer);flashTimer=setTimeout(()=>root.querySelectorAll('.piano-key').forEach(button=>button.classList.remove('lit')),220);
}

function render(){({'turtle-words':renderWords,'canopy-four':renderFour,'picnic-maze':renderMaze,'rainbow-rhythm':renderMusic})[id]();}
const restart=mountRestart({title:id==='turtle-words'?'Start this word hunt again?':id==='canopy-four'?'Start a fresh forest game?':id==='picnic-maze'?'Return to the maze entrance?':'Start this tune again?',detail:id==='turtle-words'?'Keep this grid and its words. Clear the found words and try again.':id==='picnic-maze'?'Keep this maze. Put Tilly and all the picnic treats back at the start.':id==='rainbow-rhythm'?'Start the current echo again, or clear the melody you made.':'Clear the board and start with the leaf player. Your discoveries stay saved.',onOpen(){aiClock.block('restart',true);stopMusic(true);},onCancel(){aiClock.block('restart',false);queuePip();},onRestart(){
  aiClock.cancel();aiClock.block('restart',false);audio.stop();
  if(id==='turtle-words'){words.restart();wordStart=null;wordHint=null;wordStatus='Same puzzle, a fresh start. Find your words again!';}
  if(id==='canopy-four'){four.restart();fourStatus='A fresh canopy! The leaf player goes first.';awarded=false;}
  if(id==='picnic-maze'){maze.restart();mazeHint=null;mazeStatus='Back at the entrance. Same maze, another little adventure.';}
  if(id==='rainbow-rhythm'){stopMusic();melody.restart();freeNotes=[];musicStatus='A fresh musical start! Hear the tune, or make your own.';}
  render();
}});
mountVoiceSettings(audio,{anchor:$('#brain-sound'),onOpen(){aiClock.block('voice',true);stopMusic(true);},onClose(){aiClock.block('voice',false);queuePip();}});
$('#brain-sound').addEventListener('click',()=>{audio.enabled=!audio.enabled;writeClub({...readClub(),sound:audio.enabled});if(audio.enabled)audio.unlock();else audio.stop();soundButton();if(id==='rainbow-rhythm'){stopMusic();renderMusic();}});
$('#brain-hear').addEventListener('click',()=>{stopMusic(true);audio.unlock();audio.speak(instructions[id],{preview:true});});
root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||button.disabled)return;
  audio.unlock();
  if(button.hasAttribute('data-word-cell')){
    if(suppressWordClick)return;const cell=Number(button.dataset.wordCell);wordFocus=cell;
    if(wordStart===null){wordStart=cell;paintWordSelection();announce('Now choose the last letter of the word.');}
    else if(wordStart===cell){wordStart=null;paintWordSelection();}
    else chooseWord(wordStart,cell);
    if(event.detail===0)root.querySelector(`[data-word-cell="${cell}"]`)?.focus({preventScroll:true});return;
  }
  if(button.dataset.hearWord){hearWord(button.dataset.hearWord);return;}
  if(button.hasAttribute('data-four-col')){
    if(fourMode==='pip'&&four.turn===2)return;
    const result=four.drop(Number(button.dataset.fourCol));if(result.status!=='ignored')afterFourMove();return;
  }
  if(button.dataset.move){afterMazeMove(maze.move(button.dataset.move));return;}
  if(button.hasAttribute('data-note')){const note=Number(button.dataset.note);tapNote(note);if(event.detail===0)root.querySelector(`[data-note="${note}"]`)?.focus({preventScroll:true});return;}
  const action=button.dataset.action;
  if(action==='restart')restart.open();
  if(action==='new-words')newWords();
  if(action==='custom-words'){$('#custom-word-error').textContent='';customDialog.showModal();}
  if(action==='word-hint'){const hint=words.hint();if(hint){wordHint=hint.cell;wordStart=null;wordStatus=`Find ${hint.word}. Its first letter is glowing.`;renderWords();hearWord(hint.word);}}
  if(action==='four-undo'){aiClock.cancel();four.undo();if(fourMode==='pip'&&four.turn===2)four.undo();fourStatus='Your last turn is back. Try a different little idea!';renderFour();queuePip();}
  if(action==='four-again'){aiClock.cancel();four.restart();awarded=false;fourStatus='Another friendly forest game! Leaves go first.';renderFour();}
  if(action==='new-maze')newMaze();
  if(action==='maze-undo'){maze.undo();mazeHint=null;mazeStatus='One step back. Keep exploring!';renderMaze();}
  if(action==='maze-hint'){mazeHint=maze.hint();mazeStatus='The glowing square is one step along the path to the basket.';renderMaze();}
  if(action==='listen-tune')listenTune();
  if(action==='stop-tune'){stopMusic();musicStatus='Tune stopped. Hear it again whenever you’re ready.';renderMusic();}
  if(action==='new-tune'){stopMusic();melody=new MelodyMemory({level:musicLevel,index:melody.index+1});awarded=false;musicStatus='A fresh little tune. Hear & watch when you’re ready.';renderMusic();}
  if(action==='undo-note'){stopMusic();freeNotes.pop();musicStatus='Last note taken back. Keep making music!';renderMusic();}
});
root.addEventListener('change',event=>{
  const {name,value}=event.target;
  if(name==='word-theme'){if(value!=='custom'){wordTheme=value;ownWords=null;}newWords();}
  if(name==='word-level'){wordLevel=value;newWords();}
  if(name==='four-mode'){aiClock.cancel();fourMode=value;fourStatus=four.turn===1?'Leaf player’s turn.':'Flower player’s turn.';renderFour();queuePip();}
  if(name==='four-level'){aiClock.cancel();fourLevel=value;renderFour();queuePip();}
  if(name==='maze-theme'){mazeTheme=value;newMaze();}
  if(name==='maze-size'){mazeSize=Number(value);newMaze();}
  if(name==='music-mode'){stopMusic();musicMode=value;musicStatus=value==='free'?'Play the rainbow keys and make a tune!':'Hear & watch, then echo Pip’s tune.';renderMusic();}
  if(name==='music-level'){stopMusic();musicLevel=value;melody=new MelodyMemory({level:value,index:melody.index});awarded=false;musicStatus='A new musical challenge. Hear & watch to begin.';renderMusic();}
});
root.addEventListener('pointerdown',event=>{
  const button=event.target.closest('[data-word-cell]');if(!button||event.button!==0)return;
  const cell=Number(button.dataset.wordCell);wordPointer={id:event.pointerId,start:cell,end:cell,moved:false};button.setPointerCapture(event.pointerId);paintWordSelection(cell,cell);
});
root.addEventListener('pointermove',event=>{
  if(!wordPointer||event.pointerId!==wordPointer.id)return;
  const cell=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-word-cell]');if(!cell)return;
  const end=Number(cell.dataset.wordCell);if(end!==wordPointer.start)wordPointer.moved=true;wordPointer.end=end;paintWordSelection(wordPointer.start,end);
});
root.addEventListener('pointerup',event=>{
  if(!wordPointer||event.pointerId!==wordPointer.id)return;
  const pointer=wordPointer;wordPointer=null;
  if(pointer.moved){suppressWordClick=true;setTimeout(()=>suppressWordClick=false,0);chooseWord(pointer.start,pointer.end);}
});
root.addEventListener('pointercancel',()=>{wordPointer=null;wordStart=null;paintWordSelection(null,null);});
document.addEventListener('keydown',event=>{
  if(document.querySelector('dialog[open]')||event.altKey||event.ctrlKey||event.metaKey||event.target.matches('input,textarea,select'))return;
  if(id==='turtle-words'&&event.target.matches('[data-word-cell]')&&event.key.startsWith('Arrow')){
    event.preventDefault();const n=words.size,cell=Number(event.target.dataset.wordCell),r=Math.floor(cell/n),c=cell%n;
    const [dr,dc]={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[event.key]||[0,0];
    wordFocus=Math.max(0,Math.min(n-1,r+dr))*n+Math.max(0,Math.min(n-1,c+dc));
    root.querySelectorAll('[data-word-cell]').forEach(button=>button.tabIndex=Number(button.dataset.wordCell)===wordFocus?0:-1);root.querySelector(`[data-word-cell="${wordFocus}"]`)?.focus({preventScroll:true});
  }
  if(id==='canopy-four'&&/^[1-7]$/.test(event.key)&&!event.repeat){event.preventDefault();const button=root.querySelector(`[data-four-col="${Number(event.key)-1}"]`);if(button&&!button.disabled)button.click();}
  if(id==='picnic-maze'){
    const direction={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'}[event.key];
    if(direction){event.preventDefault();afterMazeMove(maze.move(direction));}
    if(['Enter',' '].includes(event.key)&&event.target.matches('[data-maze-cell]')){event.preventDefault();afterMazeMove(maze.moveTo(Number(event.target.dataset.mazeCell)));}
  }
  if(id==='rainbow-rhythm'&&!event.repeat){const note=NOTES.findIndex(item=>item.key===event.key.toLowerCase());if(note>=0){event.preventDefault();tapNote(note);}}
});
// Maze cell targets are SVG groups rather than native buttons.
root.addEventListener('click',event=>{const cell=event.target.closest('[data-maze-cell]');if(cell)afterMazeMove(maze.moveTo(Number(cell.dataset.mazeCell)));});
const pauseMusic=()=>{if(document.hidden||document.querySelector('dialog[open]'))stopMusic(true);};
document.addEventListener('visibilitychange',()=>{pauseMusic();if(document.hidden)audio.stop();});
new MutationObserver(pauseMusic).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
window.addEventListener('pagehide',()=>{player.stop();clearTimeout(flashTimer);audio.stop();});
soundButton();render();
