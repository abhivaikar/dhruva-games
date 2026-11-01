import { SCENES, getScene, STAMPS } from './activity-scenes.js';
export const MAX_STROKES = 64, MAX_POINTS = 160, MAX_STAMPS = 50;
export const validColour = value => /^#[\da-f]{6}$/i.test(value);
const finite = value => typeof value === 'number' && Number.isFinite(value);
const clamp = (value, max) => Math.round(Math.max(0, Math.min(max, value)) * 10) / 10;
const copy = value => JSON.parse(JSON.stringify(value));
export function freshArtwork(pageId = 'train') { return { pageId: getScene(pageId).id, fills: {}, strokes: [], stamps: [] }; }
export function normaliseArtwork(value) {
  if (!value || !SCENES.some(scene => scene.id === value.pageId)) return null;
  const result = freshArtwork(value.pageId);
  const regions = new Set(['background', ...getScene(value.pageId).shapes.map(shape => shape.id)]);
  for (const [key, colour] of Object.entries(value.fills || {})) if (regions.has(key) && validColour(colour)) result.fills[key] = colour.toLowerCase();
  for (const stroke of (Array.isArray(value.strokes) ? value.strokes : []).slice(0, MAX_STROKES)) {
    if (!stroke || !validColour(stroke.colour) || !finite(stroke.size) || !Array.isArray(stroke.points)) continue;
    const points = stroke.points.filter(point => Array.isArray(point) && point.length === 2 && point.every(finite)).slice(0,MAX_POINTS).map(([x,y])=>[clamp(x,600),clamp(y,440)]);
    if (points.length) result.strokes.push({colour:stroke.colour.toLowerCase(),size:Math.max(3,Math.min(32,stroke.size)),points});
  }
  for (const stamp of (Array.isArray(value.stamps) ? value.stamps : []).slice(0,MAX_STAMPS)) {
    if (stamp && STAMPS.includes(stamp.kind) && validColour(stamp.colour) && [stamp.x,stamp.y,stamp.size].every(finite)) result.stamps.push({kind:stamp.kind,colour:stamp.colour.toLowerCase(),x:clamp(stamp.x,600),y:clamp(stamp.y,440),size:Math.max(12,Math.min(44,stamp.size))});
  }
  return result;
}
export class DrawingSession {
  constructor(art) { this.art = normaliseArtwork(art) || freshArtwork(); this.past = []; this.future = []; }
  commit(next) {
    const clean = normaliseArtwork(next);
    if (!clean || JSON.stringify(clean) === JSON.stringify(this.art)) return false;
    this.past.push(copy(this.art)); if (this.past.length > 80) this.past.shift();
    this.art = clean; this.future = []; return true;
  }
  fill(region, colour) {
    if (!['background',...getScene(this.art.pageId).shapes.map(shape=>shape.id)].includes(region) || !validColour(colour)) return false;
    return this.commit({...this.art,fills:{...this.art.fills,[region]:colour}});
  }
  brush(stroke) { if (this.art.strokes.length >= MAX_STROKES) return false; return this.commit({...this.art,strokes:[...this.art.strokes,stroke]}); }
  stamp(stamp) { if (this.art.stamps.length >= MAX_STAMPS) return false; return this.commit({...this.art,stamps:[...this.art.stamps,stamp]}); }
  clear() { return this.commit(freshArtwork(this.art.pageId)); }
  undo() { if (!this.past.length) return false; this.future.push(this.art); this.art = this.past.pop(); return true; }
  redo() { if (!this.future.length) return false; this.past.push(this.art); this.art = this.future.pop(); return true; }
}
/** Numbered checkpoints share one authored contour; retain every bend between them. */
export function dotRoute(pageId, count) {
  if (![10,15,20].includes(count)) throw new RangeError('Choose 10, 15 or 20 dots.');
  const source=getScene(pageId).dots,vertices=[{point:source[0],distance:0}];
  for(let i=0;i<source.length;i++){
    const a=source[i],b=source[(i+1)%source.length];
    vertices.push({point:b,distance:vertices.at(-1).distance+Math.hypot(b[0]-a[0],b[1]-a[1])});
  }
  const total=vertices.at(-1).distance;
  const pointAt=distance=>{
    if(distance>=total)return [...source[0]];
    const edge=vertices.findIndex((vertex,i)=>i<source.length&&vertices[i+1].distance>distance);
    const a=vertices[edge],b=vertices[edge+1],ratio=(distance-a.distance)/(b.distance-a.distance);
    return a.point.map((value,i)=>clamp(value+(b.point[i]-value)*ratio,i?440:600));
  };
  const points=Array.from({length:count},(_,i)=>pointAt(total*i/count));
  const segments=points.map((point,i)=>{
    const start=total*i/count,end=total*(i+1)/count;
    return vertices.filter(vertex=>vertex.distance>start+1e-6&&vertex.distance<end-1e-6).map(vertex=>[...vertex.point]).concat([points[(i+1)%count]]);
  });
  return {points,segments};
}
export const dotPoints=(pageId,count)=>dotRoute(pageId,count).points;

/** Disjoint targets prevent a neighbouring dot from stealing a tap. */
export function dotTargetRadius(points,index){
  return Math.min(23,...points.filter((_,i)=>i!==index).map(point=>Math.hypot(point[0]-points[index][0],point[1]-points[index][1])*.44));
}

/** Put numbers beside dots, keeping them away from other dots and numbers. */
export function dotLabels(points){
  const labels=[];
  const centre=points.reduce((sum,[x,y])=>[sum[0]+x/points.length,sum[1]+y/points.length],[0,0]);
  for(const [x,y] of points){
    const outward=Math.atan2(y-centre[1],x-centre[0]);
    const candidates=[25,36,47].flatMap(distance=>Array.from({length:16},(_,i)=>{
      const angle=outward+(i%2?1:-1)*Math.ceil(i/2)*Math.PI/8;
      return [x+Math.cos(angle)*distance,y+Math.sin(angle)*distance];
    }));
    const score=([lx,ly])=>{
      let penalty=lx<18||lx>582||ly<18||ly>422?10000:0;
      for(const [px,py] of points)if(Math.abs(lx-px)<23&&Math.abs(ly-py)<22)penalty+=1000;
      for(const [px,py] of labels)if(Math.abs(lx-px)<29&&Math.abs(ly-py)<25)penalty+=1000;
      return penalty;
    };
    labels.push(candidates.reduce((best,candidate)=>score(candidate)<score(best)?candidate:best));
  }
  return labels;
}
class ReversibleSession {
  constructor(){this.past=[];this.future=[];}
  remember(){this.past.push(this.snapshot());if(this.past.length>80)this.past.shift();this.future=[];}
  undo(){if(!this.past.length)return false;this.future.push(this.snapshot());this.restore(this.past.pop());return true;}
  redo(){if(!this.future.length)return false;this.past.push(this.snapshot());this.restore(this.future.pop());return true;}
}
export class DotSession extends ReversibleSession {
  constructor(pageId, count=10) {
    super();this.pageId=getScene(pageId).id;
    const route=dotRoute(this.pageId,count);this.points=route.points;this.segments=route.segments;
    this.connected=0;this.closed=false;
  }
  snapshot(){return {connected:this.connected,closed:this.closed};}
  restore({connected,closed}){this.connected=connected;this.closed=closed;}
  reset(){if(!this.connected)return false;this.remember();this.connected=0;this.closed=false;return true;}
  get closing(){return this.connected===this.points.length&&!this.closed;}
  get complete(){return this.closed;}
  get next(){return this.closing?1:this.connected+1;}
  get trace(){
    if(!this.connected)return [];
    return [this.points[0],...this.segments.slice(0,this.connected-1+(this.closed?1:0)).flat()];
  }
  connect(number) {
    if(this.complete||!Number.isInteger(number)||number<1||number>this.points.length)return 'ignored';
    if(this.closing){
      if(number!==1)return 'ignored';
      this.remember();this.closed=true;return 'complete';
    }
    if(number<=this.connected)return 'ignored';
    if(number!==this.next)return 'retry';
    this.remember();this.connected++;return this.closing?'close':'connected';
  }
}
const shuffle = (items,random) => {
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.max(0,Math.min(i,Math.floor(random()*(i+1))));[result[i],result[j]]=[result[j],result[i]];}
  if(result.every((item,i)=>item===items[i])) result.push(result.shift());
  return result;
};
export const PUZZLE_LEVELS = Object.freeze({4:[2,2],6:[3,2],9:[3,3],12:[4,3]});
export class PicturePuzzle extends ReversibleSession {
  constructor(count=4, random=Math.random) {
    super();
    if(!Number.isInteger(count)||!PUZZLE_LEVELS[count]) throw new RangeError('Choose 4, 6, 9 or 12 pieces.');
    [this.columns,this.rows]=PUZZLE_LEVELS[count]; this.count=count; this.placed=new Set();this.selected=null;
    this.order=shuffle(Array.from({length:count},(_,i)=>i),random);
    this.horizontal=Array.from({length:this.rows-1},(_,r)=>Array.from({length:this.columns},(_,c)=>(r+c)%2?1:-1));
    this.vertical=Array.from({length:this.rows},(_,r)=>Array.from({length:this.columns-1},(_,c)=>(r+c)%2?-1:1));
  }
  get complete(){return this.placed.size===this.count;}
  snapshot(){return [...this.placed];}
  restore(placed){this.placed=new Set(placed);this.selected=null;}
  reset(){if(!this.placed.size)return false;this.remember();this.restore([]);return true;}
  select(piece){if(!Number.isInteger(piece)||piece<0||piece>=this.count||this.placed.has(piece))return false;this.selected=piece;return true;}
  place(slot){
    if(this.complete||this.selected===null||!Number.isInteger(slot)||slot<0||slot>=this.count||this.placed.has(slot))return 'ignored';
    if(slot!==this.selected)return 'retry';
    this.remember();this.placed.add(slot);this.selected=null;return this.complete?'complete':'placed';
  }
  piece(id){
    const col=id%this.columns,row=Math.floor(id/this.columns),width=600/this.columns,height=440/this.rows;
    const top=row?this.horizontal[row-1][col]:0,bottom=row<this.rows-1?this.horizontal[row][col]:0,left=col?this.vertical[row][col-1]:0,right=col<this.columns-1?this.vertical[row][col]:0;
    return {id,col,row,width,height,pad:Math.min(width,height)*.18,edges:{top,right,bottom,left}};
  }
}
export function piecePath(piece){
  const {width:w,height:h,edges,pad}=piece;
  const point=(a,b,t,n,amount)=>[a[0]+(b[0]-a[0])*t+n[0]*amount,a[1]+(b[1]-a[1])*t+n[1]*amount].map(v=>Math.round(v*100)/100).join(' ');
  const edge=(a,b,n,sign)=>sign?`L${point(a,b,.34,n,0)} C${point(a,b,.43,n,0)} ${point(a,b,.35,n,pad*sign)} ${point(a,b,.5,n,pad*sign)} C${point(a,b,.65,n,pad*sign)} ${point(a,b,.57,n,0)} ${point(a,b,.66,n,0)} L${b.join(' ')}`:`L${b.join(' ')}`;
  return `M0 0 ${edge([0,0],[w,0],[0,1],edges.top)} ${edge([w,0],[w,h],[1,0],edges.right)} ${edge([w,h],[0,h],[0,1],edges.bottom)} ${edge([0,h],[0,0],[1,0],edges.left)} Z`;
}
