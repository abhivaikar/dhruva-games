import test from 'node:test';
import assert from 'node:assert/strict';
import { HomeJourney, CHAPTERS, WORLD_WIDTH, loadJourney, saveJourney } from '../src/club/home-model.js';

test('the full story requires nearby discoveries in all eight chapters and ends only once',()=>{
  const journey=new HomeJourney();
  assert.equal(CHAPTERS.length,8);
  for(let chapter=0;chapter<CHAPTERS.length;chapter++){
    assert.equal(journey.chapter,chapter);assert.equal(journey.advance(),false);
    assert.equal(journey.interact(),null);assert.equal(journey.visit(chapter+1),false);
    for(const [i,object] of journey.scene.objects.entries()){
      journey.move(object.x-journey.x-126);assert.equal(journey.interact(),null,'cannot discover from afar');
      journey.move(1);assert.equal(journey.interact(),object);assert.equal(journey.interact(),null,'one-time discovery');assert.equal(journey.found.size,i+1);
    }
    assert.equal(journey.ready,true);assert.equal(journey.advance(),true);
  }
  assert.equal(journey.finished,true);assert.equal(journey.completed.size,8);assert.equal(journey.advance(),false);assert.equal(journey.interact(),null);
});

test('save and reload retain partial chapters, unlocks, movement and the ending',()=>{
  const journey=new HomeJourney(),values=new Map(),storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
  for(const object of journey.scene.objects){journey.x=object.x;journey.interact();}journey.advance();
  journey.x=journey.target.x;journey.interact();journey.move(20);assert.ok(saveJourney(journey,storage));
  const restored=loadJourney(storage);assert.deepEqual(restored.snapshot(),journey.snapshot());assert.equal(restored.chapter,1);assert.equal(restored.found.size,1);assert.equal(restored.visit(2),false);
  assert.ok(restored.visit(0));assert.equal(restored.found.size,0);assert.equal(restored.x,150);assert.equal(restored.completed.size,1);
  const finished=new HomeJourney({chapter:7,found:[0,1,2],completed:[0,1,2,3,4,5,6,7],finished:true});saveJourney(finished,storage);assert.equal(loadJourney(storage).finished,true);
});

test('invalid storage, blocked storage and malformed saves recover safely',()=>{
  for(const value of [null,[],false,'hello',{chapter:-1,x:Infinity,found:[-1,5],completed:[7],finished:true},{chapter:200,x:-100,completed:[0,2,3]},{chapter:0,x:1e9,found:[0,0,'1',2]}]){
    const storage={getItem:()=>JSON.stringify(value)};const journey=loadJourney(storage);
    assert.ok(journey.chapter>=0&&journey.chapter<8);assert.ok(journey.x>=100&&journey.x<=WORLD_WIDTH-100);assert.ok(journey.found.size<=3);assert.ok(!journey.finished);
  }
  assert.equal(loadJourney({getItem:()=>'{broken'}).chapter,0);
  const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  assert.equal(loadJourney(blocked).chapter,0);assert.equal(saveJourney(new HomeJourney(),blocked),false);
  assert.equal(new HomeJourney({completed:[0,2,3]}).completed.size,1);
});

test('travel is bounded and discovery order is freely chosen',()=>{
  const journey=new HomeJourney();journey.move(-1e9);assert.equal(journey.x,100);journey.move(NaN);assert.equal(journey.x,100);journey.move(1e9);assert.equal(journey.x,2000);
  for(const index of [2,0,1]){journey.x=journey.scene.objects[index].x;assert.equal(journey.interact(),journey.scene.objects[index]);}
  assert.ok(journey.ready);assert.ok(journey.advance());
  assert.equal(journey.visit(NaN),false);assert.equal(journey.visit(-1),false);assert.equal(journey.visit(8),false);
});

test('every landscape and travel mode renders on wide and phone-shaped canvases, including reduced motion',async()=>{
  const {HomePainter}=await import('../src/club/home-art.js');
  let drawings=0;
  const gradient={addColorStop(){}};
  const context=new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get(target,key){return target[key]??(()=>{drawings++;});}});
  const oldDocument=globalThis.document;
  globalThis.document={createElement:()=>({getContext:()=>context})};
  try{
    for(const [width,height] of [[1280,620],[390,520]]){
      const canvas={getContext:()=>context,getBoundingClientRect:()=>({width,height})};
      const painter=new HomePainter(canvas);painter.resize();
      for(let chapter=0;chapter<8;chapter++){
        const journey=new HomeJourney({completed:Array.from({length:chapter},(_,i)=>i),chapter});
        for(const x of [100,1100,2000]){journey.x=x;painter.draw(journey,7000,true,false);painter.draw(journey,0,false,true);}
        assert.equal(painter.chapter,chapter);
      }
      assert.ok(canvas.width>0&&canvas.height>0);
    }
    assert.ok(drawings>1000,'all scenes execute their drawing paths');
  }finally{if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;}
});
