import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENES, artworkSVG } from '../src/club/activity-scenes.js';
import { THEMES, libraryPage, MysteryDeck, DOT_COUNTS, PIECE_COUNTS } from '../src/club/activity-library.js';
import { picturePicker, pickerResults } from '../src/club/activity-picker.js';
import { DrawingSession, DotSession, dotPoints, PicturePuzzle, piecePath, normaliseArtwork, freshArtwork, MAX_STROKES, MAX_POINTS, MAX_STAMPS } from '../src/club/activity-model.js';
import { readBook, savePage, removePage, restorePage, writeDraft, readDraft, BOOK_LIMIT, openArtwork } from '../src/club/activity-book.js';
const memory=()=>{const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};};

test('36 distinct activity pictures have named, unique colourable regions and complete SVG documents',()=>{
  assert.equal(SCENES.length,36);
  assert.equal(new Set(SCENES.map(scene=>scene.id)).size,36);
  assert.equal(new Set(SCENES.map(scene=>scene.name)).size,36);
  assert.equal(new Set(SCENES.map(scene=>JSON.stringify(scene.shapes))).size,36);
  for(const scene of SCENES){
    assert.equal(new Set(scene.shapes.map(shape=>shape.id)).size,scene.shapes.length);
    assert.ok(scene.shapes.length>=9);
    assert.ok(scene.shapes.every(shape=>shape.label&&shape.colour&&shape.attrs));
    const svg=artworkSVG(freshArtwork(scene.id),{interactive:true});
    assert.ok(svg.startsWith('<svg xmlns='));assert.ok(svg.endsWith('</svg>'));
    assert.ok(!/https?:\/\/(?!www.w3.org\/2000\/svg)/.test(svg));
    assert.ok(!svg.includes('<script'));
  }
});

test('each of six worlds has six genuine drawings with all 108 dot and 144 puzzle challenges available',()=>{
  assert.equal(THEMES.length,6);
  for(const theme of THEMES)assert.equal(SCENES.filter(scene=>scene.theme===theme.id).length,6,theme.id);
  assert.ok(SCENES.every(scene=>THEMES.some(theme=>theme.id===scene.theme)));
  assert.equal(SCENES.length*DOT_COUNTS.length,108);
  assert.equal(SCENES.length*PIECE_COUNTS.length,144);
  assert.equal(new Set(SCENES.map(scene=>JSON.stringify(scene.dots))).size,36);
});

test('the picture library browses every page without omissions, filters by theme and searches names',()=>{
  const all=Array.from({length:3},(_,page)=>libraryPage({page}));
  assert.deepEqual(all.map(result=>result.scenes.length),[12,12,12]);
  assert.equal(new Set(all.flatMap(result=>result.scenes.map(scene=>scene.id))).size,36);
  assert.equal(libraryPage({page:999}).page,2);
  assert.equal(libraryPage({page:-1}).page,0);
  for(const theme of THEMES){const result=libraryPage({theme:theme.id});assert.equal(result.total,6);assert.equal(result.pages,1);assert.ok(result.scenes.every(scene=>scene.theme===theme.id));}
  assert.deepEqual(libraryPage({query:'  DOUBLE-decker  '}).scenes.map(scene=>scene.id),['bus']);
  assert.deepEqual(libraryPage({theme:'fantasy',query:'dragon'}).scenes.map(scene=>scene.id),['dragon']);
  assert.equal(libraryPage({theme:'ocean',query:'dragon'}).total,0);
  assert.equal(libraryPage({query:'no such picture',page:9}).page,0);
});

test('mysteries explore every picture before repeating, including across shuffled bag boundaries',()=>{
  for(const random of [()=>0,()=>.99999,Math.random])for(const theme of ['all',...THEMES.map(theme=>theme.id)]){
    const deck=new MysteryDeck(random),size=theme==='all'?36:6;
    let previous=null;
    for(let cycle=0;cycle<3;cycle++){
      const ids=[];
      for(let i=0;i<size;i++){const id=deck.next(theme);assert.notEqual(id,previous);ids.push(id);previous=id;}
      assert.equal(new Set(ids).size,size);
      if(theme!=='all')assert.ok(ids.every(id=>SCENES.find(scene=>scene.id===id).theme===theme));
    }
  }
  assert.throws(()=>new MysteryDeck().next('unknown'),RangeError);
  const switching=new MysteryDeck(()=>0),themes=['all',...THEMES.map(theme=>theme.id)];
  let last=null;
  for(let i=0;i<1000;i++){const theme=themes[Math.floor(i/3)%themes.length],id=switching.next(theme);assert.notEqual(id,last);last=id;}
});

test('picture picking safely renders search text, empty results and a child’s artwork as a puzzle source',()=>{
  const options={selected:'dragon',attribute:'data-page',ownPages:[]};
  const markup=picturePicker({theme:'fantasy',query:'"<script>',page:0},options);
  assert.ok(markup.includes('&quot;&lt;script&gt;'));assert.ok(!markup.includes('<script>'));
  assert.ok(markup.includes('No pictures found'));
  const drawings=[{id:'art-one',art:freshArtwork('dragon')}];
  const own=pickerResults({theme:'book',query:'dragon',page:0},{...options,selected:'art-one',ownPages:drawings});
  assert.ok(own.includes('data-puzzle-art="art-one"'));assert.ok(own.includes('My dragon picture'));assert.ok(own.includes('aria-pressed="true"'));
  assert.ok(!own.includes('data-page="dragon"'));
});

test('colour fills, brush drawing and stamps support true undo/redo and clearing can be undone',()=>{
  const session=new DrawingSession(freshArtwork('train'));
  assert.equal(session.fill('carriage','#ff0000'),true);
  assert.equal(session.fill('carriage','#ff0000'),false);
  assert.equal(session.fill('no-such-region','#ff0000'),false);
  assert.equal(session.fill('carriage','url(javascript:bad)'),false);
  assert.equal(session.brush({colour:'#112233',size:12,points:[[1,2],[50,80]]}),true);
  assert.equal(session.stamp({kind:'star',colour:'#abcdef',x:450,y:80,size:28}),true);
  const finished=JSON.stringify(session.art);
  assert.equal(session.undo(),true);assert.equal(session.art.stamps.length,0);
  assert.equal(session.redo(),true);assert.equal(JSON.stringify(session.art),finished);
  assert.equal(session.clear(),true);assert.deepEqual(session.art,freshArtwork('train'));
  session.undo();assert.equal(JSON.stringify(session.art),finished);
  session.undo();session.fill('engine','#ff00ff');assert.equal(session.redo(),false);
});

test('artwork validation bounds coordinates and rejects unsafe or malformed drawing data',()=>{
  assert.equal(normaliseArtwork({pageId:'unknown'}),null);
  const art=normaliseArtwork({pageId:'train',fills:{carriage:'#ABCDEF',unknown:'#ff0000',background:'<script>'},strokes:[{colour:'#123456',size:100,points:[[-10,900],[NaN,3],[10,20]]},{colour:'bad',size:8,points:[[1,1]]}],stamps:[{kind:'star',colour:'#123456',x:900,y:-4,size:100},{kind:'script',colour:'#123456',x:1,y:1,size:12}]});
  assert.deepEqual(art.fills,{carriage:'#abcdef'});assert.equal(art.strokes.length,1);
  assert.deepEqual(art.strokes[0].points,[[0,440],[10,20]]);assert.equal(art.strokes[0].size,32);
  assert.deepEqual(art.stamps,[{kind:'star',colour:'#123456',x:600,y:0,size:44}]);
  const enormous=normaliseArtwork({pageId:'train',strokes:Array.from({length:100},()=>({colour:'#123456',size:10,points:Array.from({length:500},()=>[1,1])})),stamps:Array.from({length:100},()=>({kind:'heart',colour:'#abcdef',size:28,x:1,y:1}))});
  assert.equal(enormous.strokes.length,MAX_STROKES);assert.equal(enormous.strokes[0].points.length,MAX_POINTS);assert.equal(enormous.stamps.length,MAX_STAMPS);
});

test('artwork export retains the child’s fills, complete brush marks and original stamp geometry',()=>{
  const session=new DrawingSession(freshArtwork('rocket'));
  session.fill('rocket','#ff0000');session.brush({colour:'#00ff00',size:12,points:[[10,20],[30,40]]});session.stamp({kind:'heart',colour:'#0000ff',x:90,y:100,size:28});
  const svg=artworkSVG(session.art);
  assert.ok(svg.includes('fill="#ff0000"'));assert.ok(svg.includes('M10 20 L30 40'));
  assert.ok(svg.includes('translate(90 100)'));assert.ok(svg.includes('fill="#0000ff"'));
  assert.ok(!svg.includes('data-region='));
});

test('every mystery picture supports 10, 15 and 20 numbered dots with safe, distinct positions',()=>{
  for(const scene of SCENES)for(const count of [10,15,20]){
    const points=dotPoints(scene.id,count);assert.equal(points.length,count);
    assert.equal(new Set(points.map(point=>point.join(','))).size,count);
    assert.ok(points.every(([x,y])=>x>=25&&x<=575&&y>=25&&y<=415));
    let min=Infinity;for(let i=0;i<count;i++)for(let j=i+1;j<count;j++)min=Math.min(min,Math.hypot(points[i][0]-points[j][0],points[i][1]-points[j][1]));
    assert.ok(min>24,`${scene.id} ${count}: numbers must remain separated`);
  }
  assert.throws(()=>dotPoints('train',9),RangeError);
});

test('dot-to-dot requires every dot in order and locks completed connections',()=>{
  for(const count of [10,15,20]){
    const session=new DotSession('train',count);
    assert.equal(session.connect(4),'retry');assert.equal(session.connected,0);
    for(const invalid of [-1,0,1.5,99,'1'])assert.equal(session.connect(invalid),'ignored');
    for(let number=1;number<=count;number++){
      assert.equal(session.connect(number),number===count?'complete':'connected');
      assert.equal(session.connect(number),'ignored');
    }
    assert.equal(session.complete,true);assert.equal(session.connect(1),'ignored');
  }
});

test('all jigsaw sizes have complementary shared edges, flat borders and a shuffled tray',()=>{
  for(const count of [4,6,9,12])for(const random of [()=>0,()=>.99999,Math.random]){
    const puzzle=new PicturePuzzle(count,random);
    assert.equal(puzzle.rows*puzzle.columns,count);assert.equal(new Set(puzzle.order).size,count);
    assert.ok(puzzle.order.some((id,i)=>id!==i));
    for(let id=0;id<count;id++){
      const piece=puzzle.piece(id);assert.ok(piecePath(piece).startsWith('M0 0'));assert.ok(!piecePath(piece).includes('NaN'));
      if(piece.col===0)assert.equal(piece.edges.left,0);
      if(piece.row===0)assert.equal(piece.edges.top,0);
      if(piece.col===puzzle.columns-1)assert.equal(piece.edges.right,0);else assert.equal(piece.edges.right,puzzle.piece(id+1).edges.left);
      if(piece.row===puzzle.rows-1)assert.equal(piece.edges.bottom,0);else assert.equal(piece.edges.bottom,puzzle.piece(id+puzzle.columns).edges.top);
    }
  }
  for(const count of [0,5,'4',NaN])assert.throws(()=>new PicturePuzzle(count),RangeError);
});

test('jigsaw placement requires the selected piece, allows retries, and completes exactly once',()=>{
  for(const count of [4,6,9,12]){
    const puzzle=new PicturePuzzle(count,()=>0);
    assert.equal(puzzle.place(0),'ignored');assert.equal(puzzle.select(-1),false);
    for(let id=0;id<count;id++){
      assert.equal(puzzle.select(id),true);
      const wrong=(id+1)%count;
      if(!puzzle.placed.has(wrong))assert.equal(puzzle.place(wrong),'retry');
      assert.equal(puzzle.placed.size,id);
      assert.equal(puzzle.place(id),id===count-1?'complete':'placed');
      assert.equal(puzzle.select(id),false);assert.equal(puzzle.place(id),'ignored');
    }
    assert.equal(puzzle.complete,true);
  }
});

test('the activity book saves artwork, updates the same page, and preserves unrelated pages',()=>{
  const storage=memory();const art=freshArtwork('train');art.fills.carriage='#ff0000';
  const first=savePage(art,null,storage);assert.equal(first.ok,true);
  const second=savePage(freshArtwork('rocket'),null,storage);assert.equal(second.ok,true);
  art.fills.engine='#00ff00';assert.equal(savePage(art,first.page.id,storage).ok,true);
  const pages=readBook(storage);assert.equal(pages.length,2);assert.equal(pages[0].id,second.page.id);
  assert.equal(pages[1].art.fills.engine,'#00ff00');
  const removed=removePage(first.page.id,storage);assert.equal(removed.ok,true);assert.equal(readBook(storage).length,1);
  assert.equal(restorePage(removed.page,storage),true);assert.equal(readBook(storage).length,2);
  assert.equal(restorePage(removed.page,storage),true);assert.equal(readBook(storage).length,2);
});

test('a full activity book keeps all existing pictures and still allows edits',()=>{
  const storage=memory();let first;
  for(let i=0;i<BOOK_LIMIT;i++){const result=savePage(freshArtwork('train'),null,storage);assert.equal(result.ok,true);first ||= result.page;}
  assert.equal(savePage(freshArtwork('robot'),null,storage).reason,'full');assert.equal(readBook(storage).length,BOOK_LIMIT);
  assert.equal(savePage(freshArtwork('rocket'),first.id,storage).ok,true);assert.equal(readBook(storage).length,BOOK_LIMIT);
});

test('blocked or corrupt browser storage reports failed saves and draft loading stays safe',()=>{
  const blocked={getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('blocked');}};
  assert.deepEqual(readBook(blocked),[]);assert.equal(savePage(freshArtwork(),null,blocked).reason,'storage');
  assert.equal(readDraft(blocked),null);assert.equal(writeDraft(freshArtwork(),null,blocked),false);
  const corrupt={getItem:()=>'{oops',setItem:()=>{}};assert.deepEqual(readBook(corrupt),[]);assert.equal(readDraft(corrupt),null);
  const storage=memory();writeDraft(freshArtwork('butterfly'),'my-page',storage);assert.equal(readDraft(storage).art.pageId,'butterfly');assert.equal(readDraft(storage).id,'my-page');
});

test('a child’s saved colouring remains intact when reused as a jigsaw picture',()=>{
  const storage=memory(),session=new DrawingSession(freshArtwork('dinosaur'));
  session.fill('body','#f183b5');session.brush({colour:'#6655c7',size:12,points:[[170,240],[220,250]]});session.stamp({kind:'star',colour:'#ffcf43',size:28,x:440,y:90});
  const saved=savePage(session.art,null,storage);const fromBook=readBook(storage).find(page=>page.id===saved.page.id);
  const before=artworkSVG(fromBook.art);const puzzle=new PicturePuzzle(6);for(let id=0;id<6;id++){puzzle.select(id);puzzle.place(id);}
  assert.equal(puzzle.complete,true);assert.equal(artworkSVG(fromBook.art),before);
  assert.ok(before.includes('#f183b5')&&before.includes('#6655c7')&&before.includes('translate(440 90)'));
});

test('refreshing a colouring page resumes the matching draft and never replaces a different saved picture',()=>{
  const old=freshArtwork('robot');old.fills.head='#ff0000';
  const changed=freshArtwork('robot');changed.fills.head='#00ff00';
  const pages=[{id:'robot-page',art:old},{id:'train-page',art:freshArtwork('train')}];
  const draft={id:'robot-page',art:changed};
  const explicit=openArtwork({pages,draft,pageId:'robot'});
  assert.equal(explicit.art.fills.head,'#00ff00');assert.equal(explicit.id,'robot-page');assert.equal(explicit.dirty,true);
  const edited=openArtwork({pages,draft,artId:'robot-page'});assert.equal(edited.art.fills.head,'#00ff00');
  const other=openArtwork({pages,draft,artId:'train-page'});assert.equal(other.art.pageId,'train');assert.equal(other.id,'train-page');assert.equal(other.dirty,false);
  const newPage=openArtwork({pages,draft,pageId:'butterfly'});assert.deepEqual(newPage.art,freshArtwork('butterfly'));assert.equal(newPage.id,null);
});
