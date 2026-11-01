import { revealWorkspace } from '../auto-advance.js';
import { SCENES, PALETTE, STAMPS, getScene, artworkSVG, svgURL, escapeHTML } from './activity-scenes.js';
import { THEMES, DOT_COUNTS, PIECE_COUNTS, MysteryDeck } from './activity-library.js';
import { picturePicker, pickerResults } from './activity-picker.js';
import { dotBoard } from './dot-view.js';
import { DrawingSession, DotSession, PicturePuzzle, freshArtwork, piecePath, MAX_POINTS } from './activity-model.js';
import { readDraft, writeDraft, openArtwork } from './colouring-draft.js';
import { readClub, writeClub, recordCompletion } from './progress.js';
import { AudioGuide } from '../audio.js';
import { mountVoiceSettings } from '../voice-settings.js';

const $ = selector => document.querySelector(selector);
const root=$('#activity-root'),params=new URLSearchParams(location.search);
const game=['colouring','dots','puzzles'].includes(params.get('game'))?params.get('game'):'colouring';
if(params.get('game')!==game||params.has('art')){params.set('game',game);params.delete('art');history.replaceState(null,'',`${location.pathname}?${params}`);}
const audio=new AudioGuide(readClub().sound),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const names={colouring:'Colouring Studio',dots:'Mystery Dot-to-Dot',puzzles:'Picture Puzzle Factory'};
const subtitles={colouring:'A splash of colour. A sprinkle of you.',dots:'Follow the numbers. What could it be?',puzzles:'Little pieces. One brilliant picture.'};
const instructions={colouring:'Pick a colour. With the paint bucket, tap a shape to fill it. Or choose the brush and draw. Add stamps, undo anything, and download or print your picture.',dots:'Tap each numbered dot in order, starting at one. After the last number, tap one again to close your picture. Your drawing stays here until you choose another activity.',puzzles:'Pick a picture and choose how many pieces. Put any piece in any space. Tap or drag a placed piece to move it. Pieces can swap spaces, or go back in the tray. Keep arranging until your picture looks right. Undo, redo and reset can help you experiment!'};
let drawing=null,dirty=false,tool='fill',colour=PALETTE[0],brushSize=12,stampKind='star';
let stroke=null,strokeSVG=null,preview=null,cursor=[300,220],drag=null,suppressClick=false;
let dots=null,dotCount=DOT_COUNTS.includes(Number(params.get('count')))?Number(params.get('count')):10,dotHint=false,dotFeedback='',dotTheme='all',dotAwarded=false;
const mysteries=new MysteryDeck(),library={theme:'all',query:'',page:0};
let puzzle=null,puzzleSource=null,puzzleCount=4,puzzleFeedback='',showGuide=false,puzzleAwarded=false;
let toastTimer=null;
const colourNames=['Red','Orange','Yellow','Lime','Green','Turquoise','Blue','Indigo','Purple','Pink','Brown','White'];
function say(text,speak=false){$('#activity-announcement').textContent=text;if(speak)audio.speak(text);}
function toast(text){$('#activity-toast').textContent=text;$('#activity-toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#activity-toast').classList.remove('visible'),3600);}
function soundButton(){const button=$('#activity-sound');button.textContent=audio.enabled?'♪':'♫';button.setAttribute('aria-label',`Turn sound ${audio.enabled?'off':'on'}`);button.setAttribute('aria-pressed',String(audio.enabled));}
function celebrate(id){recordCompletion(id);audio.celebrate(true);if(reducedMotion.matches)return;$('#activity-confetti').innerHTML=Array.from({length:32},(_,i)=>`<i style="--left:${Math.random()*100}%;--delay:${Math.random()*.3}s;--colour:${PALETTE[i%10]}"></i>`).join('');}
function paper(art,coloured=false){return `<img src="${svgURL(artworkSVG(art,{coloured}))}" alt="${escapeHTML(getScene(art.pageId).name)}">`;}
function pickerOptions(){return {selected:game==='colouring'?drawing.art.pageId:puzzleSource?.art.pageId,attribute:game==='colouring'?'data-page':'data-puzzle-scene',coloured:game==='puzzles'};}
function renderLibraryResults(){root.querySelector('[data-library-results]').innerHTML=pickerResults(library,pickerOptions());}
function refreshLibrary(focus){root.querySelector('.picture-library').outerHTML=picturePicker(library,pickerOptions());if(focus)root.querySelector(focus)?.focus({preventScroll:true});}
function libraryDialog(){return `<dialog id="picture-library" class="picture-library-dialog" aria-labelledby="library-title"><div class="library-dialog-heading"><div><p class="eyebrow">SO MANY LITTLE ADVENTURES</p><h2 id="library-title">Pick a picture</h2></div><button type="button" class="round-button" data-action="close-library" aria-label="Close picture library">×</button></div>${picturePicker(library,pickerOptions())}</dialog>`;}
function changed(){if(!dirty)recordCompletion('colouring');dirty=true;writeDraft(drawing.art);renderColouring();}
function renderColouring(){
  document.body.classList.add('is-playing');
  const active=document.activeElement;
  const focusAttribute=root.contains(active)?['data-tool','data-colour','data-size','data-stamp','data-action','data-page'].find(name=>active.hasAttribute(name)):null;
  const focusSelector=focusAttribute?`[${focusAttribute}="${CSS.escape(active.getAttribute(focusAttribute))}"]`:null;
  const scene=getScene(drawing.art.pageId);
  root.innerHTML=`<div class="colouring-layout"><aside class="activity-sidebar"><div class="activity-side-heading"><span aria-hidden="true">🖍️</span><h2>Pick a picture</h2></div><div class="current-picture">${paper(freshArtwork(scene.id))}<div><strong>${scene.short}</strong><p>${SCENES.length} pictures to make your own</p><button type="button" class="activity-secondary" data-action="open-library">Browse pictures →</button></div></div><div class="activity-tip"><span aria-hidden="true">✦</span><p>Any colour is the right colour.<br>Make it yours!</p></div></aside><section class="activity-workbench" aria-label="Colouring workspace"><div class="workbench-top"><span class="paper-label">${scene.icon} ${scene.name}</span><button type="button" class="activity-secondary mobile-picture-change" data-action="open-library">Change picture</button><span class="activity-save-status">${dirty?'A masterpiece in the making':'YOUR COLOURING PAGE'}</span></div><div class="drawing-paper">${artworkSVG(drawing.art,{interactive:true})}<span class="paper-corner" aria-hidden="true"></span></div><div class="paint-tray"><div class="paint-tools" role="group" aria-label="Painting tools"><button type="button" data-tool="fill" aria-pressed="${tool==='fill'}">🪣<small>Fill</small></button><button type="button" data-tool="brush" aria-pressed="${tool==='brush'}">🖌️<small>Brush</small></button><button type="button" data-tool="stamp" aria-pressed="${tool==='stamp'}">✦<small>Stamps</small></button><span class="tool-divider"></span><button type="button" data-action="undo" aria-label="Undo last change" ${drawing.past.length?'':'disabled'}>↶<small>Undo</small></button><button type="button" data-action="redo" aria-label="Redo last change" ${drawing.future.length?'':'disabled'}>↷<small>Redo</small></button></div><div class="paint-palette" role="group" aria-label="Choose a paint colour">${PALETTE.map((value,i)=>`<button type="button" data-colour="${value}" style="--paint:${value}" aria-label="${colourNames[i]} paint" aria-pressed="${colour===value}"><span aria-hidden="true">${colour===value?'✓':''}</span></button>`).join('')}</div><div class="paint-options">${tool==='brush'?`<span>Brush size</span>${[[6,'Small'],[12,'Medium'],[24,'Big']].map(([size,label])=>`<button type="button" data-size="${size}" aria-pressed="${brushSize===size}" aria-label="${label} brush"><i style="width:${size}px;height:${size}px"></i></button>`).join('')}`:tool==='stamp'?`<span>Pick a stamp</span>${STAMPS.map((kind,i)=>`<button type="button" data-stamp="${kind}" aria-label="${kind} stamp" aria-pressed="${stampKind===kind}">${['★','♥','✿'][i]}</button>`).join('')}`:'<p>Pick a colour, then tap a shape. Try the background too!</p>'}</div></div><div class="activity-bottom-actions"><button type="button" class="club-primary" data-action="download-current">↓ Download</button><button type="button" class="activity-icon-action" data-action="print-current" aria-label="Print this picture">⎙</button><button type="button" class="activity-secondary" data-action="clear" aria-label="Reset page; you can undo this" ${Object.keys(drawing.art.fills).length||drawing.art.strokes.length||drawing.art.stamps.length?'':'disabled'}>↺ Reset page</button></div></section></div><div class="print-art">${artworkSVG(drawing.art)}</div>${libraryDialog()}`;
  const svg=root.querySelector('[data-drawing]');svg.classList.toggle('brush-mode',tool==='brush');svg.classList.toggle('stamp-mode',tool==='stamp');
  if(tool!=='fill'){svg.querySelectorAll('[data-region]').forEach(el=>el.setAttribute('tabindex','-1'));svg.setAttribute('tabindex','0');}
  if(focusSelector){const target=root.querySelector(focusSelector);(target?.disabled?root.querySelector('[data-action=undo]:not(:disabled),[data-action=redo]:not(:disabled)'):target)?.focus({preventScroll:true});}
}
function pickPage(pageId){drawing=new DrawingSession(freshArtwork(pageId));dirty=false;params.delete('art');params.set('page',pageId);history.replaceState(null,'',`${location.pathname}?${params}`);writeDraft(drawing.art);renderColouring();revealWorkspace(root.querySelector('.activity-workbench'));}
function startMystery(pageId){audio.stop();dotAwarded=false;dots=new DotSession(pageId||mysteries.next(dotTheme),dotCount);dotHint=false;dotFeedback='Start at 1. What will your picture be?';renderDots();revealWorkspace(root.querySelector('.dot-workspace'));say(`Find number 1. Join ${dotCount} dots, then come back to 1 to close your picture.`,true);}
function recoveryControls(session,kind){
  return `<div class="activity-recovery" role="group" aria-label="${kind==='puzzle'?'Puzzle':'Dot picture'} undo and reset controls"><button type="button" class="activity-secondary" data-action="${kind}-undo" ${session.past.length?'':'disabled'}>↶ Undo</button><button type="button" class="activity-secondary" data-action="${kind}-redo" ${session.future.length?'':'disabled'}>↷ Redo</button><button type="button" class="activity-secondary" data-action="${kind}-reset" ${(kind==='puzzle'?session.placed.size:session.connected)?'':'disabled'}>↺ Reset picture</button><small>Same picture. Fresh start. You can undo a reset too.</small></div>`;
}
function recoverActivity(kind,operation){
  const session=kind==='puzzle'?puzzle:dots;if(!session||!session[operation]())return;
  audio.stop();$('#activity-confetti').replaceChildren();
  const message=operation==='reset'?'A fresh start! Tap Undo to bring your work back.':operation==='undo'?'Last change taken back. Keep exploring!':'Your change is back in place.';
  if(kind==='puzzle'){puzzleFeedback=message;renderPuzzle();}else{dotHint=false;dotFeedback=message;renderDots();}
  say(message);toast(message);
  (root.querySelector(`[data-action="${kind}-${operation}"]:not(:disabled)`)||root.querySelector(`[data-action="${kind}-undo"]:not(:disabled),[data-action="${kind}-redo"]:not(:disabled)`))?.focus({preventScroll:true});
}
function renderDots(){
  document.body.classList.toggle('is-playing',Boolean(dots));
  if(!dots){root.innerHTML=`<section class="activity-welcome"><div class="mystery-preview" aria-hidden="true"><span>1</span><i></i><span>2</span><i></i><span>?</span><b>✏️</b></div><div><p class="eyebrow">A PICTURE HIDING IN PLAIN SIGHT</p><h2>A little line.<br>A big surprise!</h2><p>Connect the dots in order, then colour the picture you discover. <strong>${SCENES.length} mystery pictures. ${SCENES.length*DOT_COUNTS.length} dot challenges!</strong></p><label class="mystery-theme">Choose a world<select name="dot-theme"><option value="all" ${dotTheme==='all'?'selected':''}>🌈 Surprise me! All ${SCENES.length} pictures</option>${THEMES.map(theme=>`<option value="${theme.id}" ${dotTheme===theme.id?'selected':''}>${theme.icon} ${theme.name} · ${SCENES.filter(scene=>scene.theme===theme.id).length} pictures</option>`).join('')}</select></label><fieldset class="activity-levels"><legend>How many dots?</legend>${DOT_COUNTS.map(n=>`<label><input type="radio" name="dot-count" value="${n}" ${n===dotCount?'checked':''}><span>${n}<small>dots</small></span></label>`).join('')}</fieldset><button type="button" class="club-primary" data-action="start-dots">Find my mystery picture →</button><p class="activity-fineprint">Start with 10. A new picture every time until you’ve explored your whole world.</p></div></section>`;return;}
  const scene=getScene(dots.pageId),complete=dots.complete;
  const feedback=complete?`You drew the ${scene.short.toLowerCase()}! Take a look at the outline you made.`:dots.closing?'Nearly there! Join the last dot back to 1 to close your picture.':dotFeedback;
  root.innerHTML=`<section class="dot-workspace ${complete?'dot-finished':''}"><div class="dot-topline"><span class="mystery-chip">${complete?'★ PICTURE COMPLETE':'✏️ MYSTERY PICTURE'}</span><span class="next-dot">${complete?'You did it!':dots.closing?'Close at':'Find'} <strong>${complete?'✓':dots.next}</strong></span><label class="inline-level">Dots<select name="live-dot-count" aria-label="Number of dots">${DOT_COUNTS.map(n=>`<option value="${n}" ${n===dotCount?'selected':''}>${n}</option>`).join('')}</select></label><span>${dots.connected} / ${dots.points.length}</span></div><div class="dot-play-layout"><div class="dot-paper">${dotBoard(dots,{hint:dotHint})}</div><div class="dot-tools"><p class="activity-feedback" role="status" tabindex="-1">${escapeHTML(feedback)}</p><div class="dot-progress" aria-label="${dots.connected} of ${dots.points.length} dots connected; ${complete?'outline closed':dots.closing?'tap 1 to close the outline':'keep going'}"><span style="width:${(dots.connected+(complete?1:0))/(dots.points.length+1)*100}%"></span></div><div class="dot-actions">${complete?`<a class="club-primary" href="./activity.html?game=colouring&page=${scene.id}">🎨 Colour this picture</a><button type="button" class="activity-secondary" data-action="new-dots">Another picture →</button>`:`<button type="button" class="activity-secondary" data-action="dot-hint">✦ Show me the next dot</button>`}<button type="button" class="activity-text-button" data-action="choose-dot-level">Change world</button></div>${recoveryControls(dots,'dot')}</div></div></section>`;
}
function connectDot(number){
  const result=dots.connect(number);if(result==='ignored')return;
  if(result==='retry'){dotFeedback=`Good try! Look for ${dots.next} next.`;dotHint=true;renderDots();say(dotFeedback,true);return;}
  dotHint=false;
  if(result==='complete'){
    if(!dotAwarded){celebrate('dots');dotAwarded=true;}
    say(`You drew the ${getScene(dots.pageId).short.toLowerCase()}! Your picture is complete.`,true);
  }else if(result==='close')say('One last line! Tap 1 to close your picture.',true);
  else{dotFeedback=`Lovely line! Find ${dots.next} next.`;say(String(dots.next),true);}
  renderDots();
}
function sourceOptions(){return picturePicker(library,pickerOptions());}
function puzzlePiece(id,placed=false){const piece=puzzle.piece(id),{col,row,width,height,pad}=piece,path=piecePath(piece);const prefix=`${placed?'board':'tray'}-${id}`;return `<svg viewBox="${-pad} ${-pad} ${width+pad*2} ${height+pad*2}" aria-hidden="true" style="--piece-pad-x:${pad/width*100}%;--piece-pad-y:${pad/height*100}%"><defs><clipPath id="${prefix}"><path d="${path}"/></clipPath></defs><g clip-path="url(#${prefix})"><image href="${svgURL(artworkSVG(puzzleSource.art,{coloured:true}))}" x="${-col*width}" y="${-row*height}" width="600" height="440"/></g><path d="${path}" fill="none" stroke="#34345d" stroke-width="${placed?1.5:2.4}" stroke-linejoin="round"/></svg>`;}
function renderPuzzle(){
  document.body.classList.toggle('is-playing',Boolean(puzzle));
  if(!puzzle){root.innerHTML=`<section class="puzzle-setup"><div class="puzzle-setup-header"><div><p class="eyebrow">EVERY PICTURE HAS A LITTLE PUZZLE IN IT</p><h2>Tap a picture to play!</h2><p>${SCENES.length} pictures and four puzzle sizes to explore.</p></div><span aria-hidden="true">🧩</span></div><div class="puzzle-start-row"><fieldset class="activity-levels"><legend>How many pieces?</legend>${PIECE_COUNTS.map(n=>`<label><input type="radio" name="piece-count" value="${n}" ${n===puzzleCount?'checked':''}><span>${n}<small>pieces</small></span></label>`).join('')}</fieldset></div>${sourceOptions()}</section>`;return;}
  root.innerHTML=`<section class="puzzle-workspace"><div class="puzzle-game-top"><span class="mystery-chip">${puzzle.complete?'★ PICTURE COMPLETE':'🧩 '+getScene(puzzleSource.art.pageId).short.toUpperCase()}</span><strong>${puzzle.placed.size} / ${puzzle.count} on board</strong><label class="inline-level">Pieces<select name="live-piece-count" aria-label="Number of puzzle pieces">${PIECE_COUNTS.map(n=>`<option value="${n}" ${n===puzzle.count?'selected':''}>${n}</option>`).join('')}</select></label><button type="button" class="activity-secondary" data-action="puzzle-guide" aria-pressed="${showGuide}">${showGuide?'Hide':'Show'} the picture</button></div>${recoveryControls(puzzle,'puzzle')}<div class="puzzle-play-layout"><div><div class="puzzle-board ${showGuide?'show-guide':''}" style="--cols:${puzzle.columns};--rows:${puzzle.rows}" role="group" aria-label="Puzzle spaces">${showGuide?`<div class="puzzle-ghost-picture">${paper(puzzleSource.art,true)}</div>`:''}${Array.from({length:puzzle.count},(_,slot)=>{
    const piece=puzzle.pieceAt(slot),filled=piece!==null;
    return `<button type="button" data-slot="${slot}" ${filled?`data-board-piece="${piece}"`:''} class="puzzle-slot ${filled?'placed':''} ${filled&&puzzle.selected===piece?'selected':''}" aria-label="Space ${slot+1}${filled?', puzzle piece '+(piece+1):', empty'}" ${filled?`aria-pressed="${puzzle.selected===piece}"`:''}>${filled?puzzlePiece(piece,true):`<span aria-hidden="true">${slot+1}</span>`}</button>`;
  }).join('')}</div><p class="activity-feedback" role="status">${puzzleFeedback||(puzzle.complete?'You did it! Keep playing, or mix it up again.':'Try any piece in any space. You can move and swap them!')}</p></div><div class="puzzle-tray-wrap"><p class="eyebrow">YOUR LITTLE PIECES</p><div class="puzzle-tray ${puzzle.positionOf(puzzle.selected)!==null?'can-return':''}" data-puzzle-tray style="--tray-cols:${puzzle.count>6?3:2}" role="group" aria-label="Puzzle pieces. Drop a placed piece here to return it">${puzzle.tray.map(id=>`<button type="button" data-piece="${id}" class="puzzle-piece ${puzzle.selected===id?'selected':''}" aria-label="Puzzle piece ${id+1}" aria-pressed="${puzzle.selected===id}">${puzzlePiece(id)}</button>`).join('')}${puzzle.tray.length?'':'<p class="puzzle-tray-empty">All pieces are on the board.<br>You can move or swap them, or bring one back here.</p>'}</div><button type="button" class="activity-secondary puzzle-return" data-action="return-piece" ${puzzle.positionOf(puzzle.selected)===null?'disabled':''}>↩ Return selected piece to tray</button>${puzzle.complete?'<button type="button" class="club-primary puzzle-remix" data-action="remix-puzzle">🧩 Mix it up again</button>':''}<button type="button" class="activity-text-button" data-action="choose-puzzle">← Choose another picture</button></div></div></section>`;
}

function startPuzzle(){puzzle=new PicturePuzzle(puzzleCount);puzzleFeedback='';puzzleAwarded=false;showGuide=false;renderPuzzle();revealWorkspace(root.querySelector('.puzzle-workspace'));say('Your pieces are ready! Put any piece in any space, then move or swap them to build your picture.',true);}
function selectPiece(piece){
  if(!puzzle.select(piece))return;
  puzzleFeedback=puzzle.positionOf(piece)===null?'Choose any space for this piece.':'Choose any space to move or swap this piece, or return it to the tray.';
  renderPuzzle();
}
function placePiece(slot){
  const result=puzzle.place(slot);
  if(result==='complete'){
    if(!puzzleAwarded){celebrate('puzzles');puzzleAwarded=true;}
    puzzleFeedback='You did it! The picture is complete. You can keep playing or mix it up again.';say(puzzleFeedback,true);
  }else if(result!=='ignored'){
    puzzleFeedback=puzzle.placed.size===puzzle.count?'All pieces are on the board. Move or swap them until your picture looks right.':result==='swapped'?'Pieces swapped! Keep exploring your picture.':'Piece placed! You can move it again whenever you like.';
    say(puzzleFeedback);
  }else puzzleFeedback='Tap a piece to choose it, then pick any space.';
  renderPuzzle();
}
function returnPiece(piece=puzzle.selected){
  const restoreFocus=root.contains(document.activeElement);
  if(!puzzle.returnToTray(piece))return;
  puzzleFeedback='Back in the tray. Try another arrangement!';say(puzzleFeedback);renderPuzzle();
  if(restoreFocus)root.querySelector(`[data-piece="${piece}"]`)?.focus({preventScroll:true});
}
async function downloadArt(art){
  let url;
  try{url=URL.createObjectURL(new Blob([artworkSVG(art)],{type:'image/svg+xml;charset=utf-8'}));const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=880;const context=canvas.getContext('2d');if(!context)throw Error('No canvas');context.drawImage(image,0,0,1200,880);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('No picture');const png=URL.createObjectURL(blob);const link=document.createElement('a');link.href=png;link.download=`dhruva-${getScene(art.pageId).id}.png`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(png),10000);toast('Your picture is ready to keep!');}catch{toast('The picture couldn’t download. Try Print to keep a copy.');}finally{if(url)URL.revokeObjectURL(url);}
}
function pointAt(event,svg){const matrix=svg.getScreenCTM();if(!matrix)return null;const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());return [Math.max(0,Math.min(600,point.x)),Math.max(0,Math.min(440,point.y))].map(v=>Math.round(v*10)/10);}
function stampAt(point){if(drawing.stamp({kind:stampKind,colour,x:point[0],y:point[1],size:28}))changed();else toast('So many lovely stamps! Undo one, or start a new page.');}
function action(name){
  if(name==='open-library')root.querySelector('#picture-library').showModal();
  else if(name==='close-library')root.querySelector('#picture-library').close();
  else if(name==='choose-dot-level'){$('#activity-confetti').replaceChildren();dots=null;renderDots();revealWorkspace(root.querySelector('.activity-welcome'));}
  else if(name==='undo'&&drawing.undo()){changed();}
  else if(name==='redo'&&drawing.redo()){changed();}
  else if(name==='clear'){if(!drawing.clear())return;changed();toast('A fresh page! Tap Undo to bring your colours back.');}
  else if(name==='download-current')void downloadArt(drawing.art);
  else if(name==='print-current')window.print();
  else if(name==='start-dots'||name==='new-dots'){$('#activity-confetti').replaceChildren();startMystery();}
  else if(/^(puzzle|dot)-(undo|redo|reset)$/.test(name)){const [kind,operation]=name.split('-');recoverActivity(kind,operation);}
  else if(name==='dot-hint'){dotHint=true;dotFeedback=`The glowing dot is ${dots.next}. Tap it!`;renderDots();say(dotFeedback,true);}
  else if(name==='start-puzzle'||name==='remix-puzzle'){$('#activity-confetti').replaceChildren();startPuzzle();}
  else if(name==='choose-puzzle'){$('#activity-confetti').replaceChildren();puzzle=null;renderPuzzle();revealWorkspace(root.querySelector('.puzzle-setup'));}
  else if(name==='return-piece')returnPiece();
  else if(name==='puzzle-guide'){showGuide=!showGuide;renderPuzzle();}
}
root.addEventListener('click',event=>{
  if(suppressClick){suppressClick=false;return;}audio.unlock();const button=event.target.closest('button,a,[data-region],[data-dot]');
  if(button?.disabled)return;
  if(game==='colouring'&&event.target.closest('[data-drawing]')){
    if(tool==='fill'){const region=event.target.closest('[data-region]');if(region&&drawing.fill(region.dataset.region,colour))changed();}
    else if(tool==='stamp'){const point=pointAt(event,event.target.closest('[data-drawing]'));if(point)stampAt(point);}return;
  }
  if(button?.hasAttribute('data-library-theme')){library.theme=button.dataset.libraryTheme;library.page=0;refreshLibrary(`[data-library-theme="${library.theme}"]`);}
  else if(button?.hasAttribute('data-library-move')){library.page+=Number(button.dataset.libraryMove);renderLibraryResults();root.querySelector('[data-library-results]')?.scrollIntoView({block:'nearest',behavior:'instant'});root.querySelector('[data-library-move]:not(:disabled)')?.focus({preventScroll:true});}
  else if(button?.hasAttribute('data-library-reset')){library.theme='all';library.query='';library.page=0;refreshLibrary('[data-library-search]');}
  else if(button?.hasAttribute('data-page'))pickPage(button.dataset.page);
  else if(button?.hasAttribute('data-tool')){tool=button.dataset.tool;renderColouring();}
  else if(button?.hasAttribute('data-colour')){colour=button.dataset.colour;renderColouring();}
  else if(button?.hasAttribute('data-size')){brushSize=Number(button.dataset.size);renderColouring();}
  else if(button?.hasAttribute('data-stamp')){stampKind=button.dataset.stamp;renderColouring();}
  else if(button?.hasAttribute('data-dot')){if(event.detail<2)connectDot(Number(button.dataset.dot));}
  else if(button?.hasAttribute('data-puzzle-scene')){puzzleSource={art:freshArtwork(button.dataset.puzzleScene)};startPuzzle();}
  else if(button?.hasAttribute('data-piece')){selectPiece(Number(button.dataset.piece));if(event.detail===0)root.querySelector('[data-slot]')?.focus({preventScroll:true});}
  else if(button?.hasAttribute('data-slot')){const slot=Number(button.dataset.slot);if(puzzle.selected===null){const piece=puzzle.pieceAt(slot);if(piece!==null)selectPiece(piece);else{puzzleFeedback='Choose a piece from the tray or the board first.';renderPuzzle();}if(event.detail===0)root.querySelector(`[data-slot="${slot}"]`)?.focus({preventScroll:true});}else{placePiece(slot);if(event.detail===0)root.querySelector(`[data-slot="${slot}"]`)?.focus({preventScroll:true});}}
  else if(button?.dataset.action)action(button.dataset.action);
});
root.addEventListener('input',event=>{if(event.target.hasAttribute('data-library-search')){library.query=event.target.value;library.page=0;renderLibraryResults();}});
root.addEventListener('change',event=>{if(event.target.name==='dot-theme'){dotTheme=event.target.value;startMystery();}if(event.target.name==='dot-count'){dotCount=Number(event.target.value);startMystery();}if(event.target.name==='live-dot-count'){dotCount=Number(event.target.value);dots=new DotSession(dots.pageId,dotCount);dotAwarded=false;dotHint=false;dotFeedback='Start at 1. Same picture, a new dot challenge!';renderDots();say(`Connect ${dotCount} dots. Start at 1.`);root.querySelector('[name=live-dot-count]')?.focus({preventScroll:true});}if(event.target.name==='live-piece-count'){puzzleCount=Number(event.target.value);startPuzzle();}if(event.target.name==='piece-count')puzzleCount=Number(event.target.value);});
root.addEventListener('keydown',event=>{
  const region=event.target.closest('[data-region]'),dot=event.target.closest('[data-dot]');
  if(['Enter',' '].includes(event.key)&&region&&tool==='fill'){event.preventDefault();if(drawing.fill(region.dataset.region,colour)){const id=region.dataset.region;changed();root.querySelector(`[data-region="${id}"]`)?.focus({preventScroll:true});}}
  else if(['Enter',' '].includes(event.key)&&dot){event.preventDefault();if(event.repeat)return;connectDot(Number(dot.dataset.dot));root.querySelector(dots.complete?'.activity-feedback':`[data-dot="${dots.next}"]`)?.focus({preventScroll:true});}
  else if(event.target.matches('[data-drawing]')&&tool!=='fill'){
    if(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].includes(event.key)){event.preventDefault();const before=[...cursor];const [dx,dy]={ArrowUp:[0,-15],ArrowRight:[15,0],ArrowDown:[0,15],ArrowLeft:[-15,0]}[event.key];cursor=[Math.max(0,Math.min(600,cursor[0]+dx)),Math.max(0,Math.min(440,cursor[1]+dy))];if(tool==='brush'&&event.shiftKey){drawing.brush({colour,size:brushSize,points:[before,cursor]});changed();root.querySelector('[data-drawing]').focus({preventScroll:true});}say(`Drawing position ${Math.round(cursor[0])}, ${Math.round(cursor[1])}.`);}
    else if(['Enter',' '].includes(event.key)){event.preventDefault();if(tool==='stamp')stampAt(cursor);else if(drawing.brush({colour,size:brushSize,points:[[...cursor]]}))changed();root.querySelector('[data-drawing]').focus({preventScroll:true});}
  }
});
root.addEventListener('pointerdown',event=>{
  const svg=event.target.closest('[data-drawing]'),piece=event.target.closest('[data-piece], [data-board-piece]');
  if(event.button!==0)return;
  if(svg&&tool==='brush'){
    const point=pointAt(event,svg);if(!point)return;audio.unlock();stroke={colour,size:brushSize,points:[point]};strokeSVG=svg;svg.setPointerCapture(event.pointerId);preview=document.createElementNS('http://www.w3.org/2000/svg','path');preview.setAttribute('fill','none');preview.setAttribute('stroke',colour);preview.setAttribute('stroke-width',brushSize);preview.setAttribute('stroke-linecap','round');preview.setAttribute('stroke-linejoin','round');preview.setAttribute('pointer-events','none');preview.setAttribute('d',`M${point.join(' ')}l.1 .1`);svg.append(preview);event.preventDefault();
  }else if(piece&&puzzle){drag={id:Number(piece.dataset.piece??piece.dataset.boardPiece),x:event.clientX,y:event.clientY,pointerId:event.pointerId,button:piece,ghost:null};piece.setPointerCapture(event.pointerId);}
});
root.addEventListener('pointermove',event=>{
  if(stroke&&strokeSVG){const point=pointAt(event,strokeSVG);if(!point||Math.hypot(point[0]-stroke.points.at(-1)[0],point[1]-stroke.points.at(-1)[1])<2)return;if(stroke.points.length>=MAX_POINTS)stroke.points=stroke.points.filter((_,i)=>i%2===0);stroke.points.push(point);preview.setAttribute('d',stroke.points.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' '));}
  if(drag&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>7){if(!drag.ghost){drag.ghost=drag.button.cloneNode(true);drag.ghost.className='puzzle-drag-ghost';drag.ghost.setAttribute('aria-hidden','true');document.body.append(drag.ghost);}drag.ghost.style.left=`${event.clientX}px`;drag.ghost.style.top=`${event.clientY}px`;}
});
function endPointer(event,cancel=false){
  if(stroke){const finished=stroke;stroke=null;strokeSVG=null;preview=null;if(!cancel&&drawing.brush(finished))changed();else{renderColouring();if(!cancel)toast('A page full of brushwork! Download it, or undo a stroke to add another.');}}
  if(drag){const current=drag;drag=null;if(current.ghost){current.ghost.remove();suppressClick=true;setTimeout(()=>{suppressClick=false;},0);if(!cancel){const slot=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-slot]');if(slot){puzzle.select(current.id);placePiece(Number(slot.dataset.slot));}else if(document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-puzzle-tray]'))returnPiece(current.id);else{puzzleFeedback='Drop on any board space, or return a placed piece to the tray.';renderPuzzle();}}}}
}
root.addEventListener('pointerup',event=>endPointer(event));root.addEventListener('pointercancel',event=>endPointer(event,true));
$('#activity-sound').addEventListener('click',()=>{audio.enabled=!audio.enabled;writeClub({...readClub(),sound:audio.enabled});if(audio.enabled)audio.unlock();else audio.stop();soundButton();});
$('#activity-hear').addEventListener('click',()=>{if(!audio.enabled){audio.enabled=true;writeClub({...readClub(),sound:true});soundButton();}audio.unlock();say(instructions[game],true);});
window.addEventListener('pagehide',()=>{audio.stop();if(drawing){writeDraft(drawing.art);}drag?.ghost?.remove();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.stop();});
$('#activity-title').textContent=names[game];$('#activity-subtitle').textContent=subtitles[game];document.title=`${names[game]} · Dhruva’s Discovery Club`;
document.querySelectorAll('.activity-nav a').forEach(link=>{if(new URL(link.href).searchParams.get('game')===game)link.setAttribute('aria-current','page');});
mountVoiceSettings(audio,{anchor:$('#activity-sound')});
soundButton();
if(game==='colouring'){
  const opened=openArtwork({draft:readDraft(),pageId:params.get('page')});
  drawing=new DrawingSession(opened.art);dirty=opened.dirty;renderColouring();revealWorkspace(root.querySelector('.activity-workbench'));
}else if(game==='dots'){if(params.get('setup')!=='1')startMystery(SCENES.some(scene=>scene.id===params.get('page'))?params.get('page'):null);else renderDots();}
else if(game==='puzzles'){puzzleSource={art:freshArtwork('train')};if(params.get('setup')!=='1')startPuzzle();else renderPuzzle();}
