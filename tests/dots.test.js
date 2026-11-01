import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENES } from '../src/club/activity-scenes.js';
import { DotSession, dotLabels, dotTargetRadius } from '../src/club/activity-model.js';
import { dotBoard, dotFeatureShapes } from '../src/club/dot-view.js';
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const length=points=>points.slice(1).reduce((sum,point,i)=>sum+distance(points[i],point),0);

test('all 108 dot challenges retain every bend of the picture instead of cutting corners between checkpoints',()=>{
  for(const scene of SCENES)for(const count of [10,15,20]){
    const session=new DotSession(scene.id,count);
    assert.deepEqual(session.trace,[]);
    for(let n=1;n<=count;n++){
      session.connect(n);
      assert.equal(session.complete,false,'the last numbered dot must not finish the picture');
      assert.deepEqual(session.trace.at(-1),session.points[n-1]);
    }
    assert.equal(session.closing,true);
    assert.equal(session.connect(1),'complete');
    assert.deepEqual(session.trace.at(-1),session.points[0]);
    for(const corner of scene.dots)assert.ok(session.trace.some(point=>distance(point,corner)<.15),`${scene.id} ${count} lost ${corner}`);
    const perimeter=length([...scene.dots,scene.dots[0]]);
    assert.ok(Math.abs(length(session.trace)-perimeter)<.3,`${scene.id} ${count} must follow its authored outline`);
  }
});

test('completion needs one deliberate closing action, can be undone, and does not change the existing drawing',()=>{
  const session=new DotSession('excavator',10);
  session.connect(1);assert.equal(session.connect(10),'retry');assert.equal(session.connected,1);
  for(let n=2;n<=10;n++)session.connect(n);
  const open=JSON.stringify(session.trace);
  for(const invalid of [0,11,2,10,1.5,'1'])assert.equal(session.connect(invalid),'ignored');
  assert.equal(session.complete,false);assert.equal(JSON.stringify(session.trace),open);
  assert.equal(session.next,1);session.connect(1);const closed=JSON.stringify(session.trace);
  session.undo();assert.equal(session.closing,true);assert.equal(session.complete,false);assert.equal(JSON.stringify(session.trace),open);
  session.redo();assert.equal(JSON.stringify(session.trace),closed);assert.equal(session.complete,true);
  session.reset();assert.deepEqual(session.trace,[]);session.undo();assert.equal(JSON.stringify(session.trace),closed);
});

test('every picture has genuine printed details and the finished SVG keeps the child’s trace and numbered dots',()=>{
  for(const scene of SCENES){
    assert.ok(dotFeatureShapes(scene.id).length>0);
    assert.ok(dotFeatureShapes(scene.id).every(shape=>shape&&scene.shapes.includes(shape)));
    const session=new DotSession(scene.id,10),before=dotBoard(session);
    assert.equal((before.match(/data-dot="/g)||[]).length,10);
    for(let n=1;n<=10;n++)session.connect(n);
    assert.ok(dotBoard(session).includes('Dot 1, close the outline'));
    session.connect(1);const complete=dotBoard(session);
    assert.ok(complete.includes('data-dot-trace'));
    assert.ok(complete.includes(session.trace.map(point=>point.join(',')).join(' ')));
    assert.equal((complete.match(/data-dot="/g)||[]).length,10);
    assert.ok(!complete.includes('<image'),'completion must not replace the work with a different picture');
  }
});

test('number labels stay on the page without overlapping, and neighbouring dot targets never overlap',()=>{
  for(const scene of SCENES)for(const count of [10,15,20]){
    const {points}=new DotSession(scene.id,count),labels=dotLabels(points);
    labels.forEach(([x,y],i)=>{
      assert.ok(x>=18&&x<=582&&y>=18&&y<=422,`${scene.id} ${count} label bounds`);
      points.forEach(([a,b])=>assert.ok(Math.abs(x-a)>=23||Math.abs(y-b)>=22,`${scene.id} ${count} number overlaps a dot`));
      labels.slice(0,i).forEach(([a,b])=>assert.ok(Math.abs(x-a)>=29||Math.abs(y-b)>=25,`${scene.id} ${count} labels overlap`));
      points.slice(0,i).forEach((point,j)=>assert.ok(dotTargetRadius(points,i)+dotTargetRadius(points,j)<distance(points[i],point)));
    });
  }
});
