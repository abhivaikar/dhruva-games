import test from 'node:test';
import assert from 'node:assert/strict';
import { AutoAdvance } from '../src/auto-advance.js';

function harness(ready=()=>true){
  let time=0,id=0;const jobs=new Map();
  const clock=new AutoAdvance({ready,now:()=>time,setTimer(fn,delay){jobs.set(++id,{fn,due:time+delay});return id;},clearTimer(key){jobs.delete(key);}});
  function advance(ms){const end=time+ms;while(true){const next=[...jobs].sort((a,b)=>a[1].due-b[1].due)[0];if(!next||next[1].due>end)break;time=next[1].due;jobs.delete(next[0]);next[1].fn();}time=end;}
  return {clock,advance,jobs};
}

test('successful feedback advances once after its delay, never before, and creates no question deadline',()=>{
  const {clock,advance}=harness();let count=0;
  clock.schedule(()=>count++);advance(2599);assert.equal(count,0);advance(1);assert.equal(count,1);
  assert.equal(clock.active,false);advance(100000);assert.equal(count,1);
});

test('manual pause preserves the remaining reading time and needs an explicit resume',()=>{
  const {clock,advance}=harness();let count=0;
  clock.schedule(()=>count++,3000);advance(1100);clock.toggle();
  advance(50000);assert.equal(count,0);assert.equal(clock.paused,true);
  clock.toggle();advance(1899);assert.equal(count,0);advance(1);assert.equal(count,1);
});

test('hidden tabs, dialogs and restart decisions block independently without losing remaining time',()=>{
  const {clock,advance}=harness();let count=0;
  clock.schedule(()=>count++,2000);advance(500);clock.block('hidden',true);clock.block('dialog',true);
  advance(9000);clock.block('hidden',false);advance(9000);assert.equal(count,0);
  clock.block('dialog',false);advance(1499);assert.equal(count,0);advance(1);assert.equal(count,1);
});

test('feedback waits for audio to end, with a bounded fallback for missing speech-end events',()=>{
  let speaking=true;const {clock,advance}=harness(()=>!speaking);let count=0;
  clock.schedule(()=>count++,2000);advance(5000);assert.equal(count,0);
  speaking=false;advance(150);assert.equal(count,1);
  speaking=true;clock.schedule(()=>count++,2000);advance(23000);assert.equal(count,2);
});

test('restart, undo or navigation cancellation invalidates already queued transition callbacks',()=>{
  const {clock,advance,jobs}=harness();let old=0,current=0;
  clock.schedule(()=>old++);const stale=[...jobs.values()][0].fn;
  clock.cancel();clock.schedule(()=>current++);stale();assert.equal(old,0);assert.equal(current,0);
  advance(2600);assert.equal(current,1);clock.cancel();advance(50000);assert.equal(current,1);
});

test('a new activity stays blocked until its dialog is closed, even when an old transition was cancelled',()=>{
  const {clock,advance}=harness();let count=0;
  clock.block('dialog',true);clock.schedule(()=>count++);advance(5000);assert.equal(count,0);
  clock.cancel();clock.schedule(()=>count+=2);advance(5000);assert.equal(count,0);
  clock.block('dialog',false);advance(2600);assert.equal(count,2);
});
