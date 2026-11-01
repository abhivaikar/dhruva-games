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
export function dotPoints(pageId, count) {
  if (![10,15,20].includes(count)) throw new RangeError('Choose 10, 15 or 20 dots.');
  const source = getScene(pageId).dots;
  const lengths = source.map((point,i)=>Math.hypot(point[0]-source[(i+1)%source.length][0],point[1]-source[(i+1)%source.length][1]));
  const total = lengths.reduce((sum,value)=>sum+value,0);
  return Array.from({length:count},(_,i)=>{
    let distance = total*i/count, edge = 0;
    while (edge < lengths.length-1 && distance >= lengths[edge]) { distance -= lengths[edge]; edge++; }
    const ratio = distance/lengths[edge], a=source[edge], b=source[(edge+1)%source.length];
    return [clamp(a[0]+(b[0]-a[0])*ratio,600),clamp(a[1]+(b[1]-a[1])*ratio,440)];
  });
}
export class DotSession {
  constructor(pageId, count=10) { this.pageId=getScene(pageId).id; this.points=dotPoints(this.pageId,count); this.connected=0; }
  get complete() { return this.connected === this.points.length; }
  connect(number) {
    if (this.complete || !Number.isInteger(number) || number < 1 || number > this.points.length || number <= this.connected) return 'ignored';
    if (number !== this.connected+1) return 'retry';
    this.connected++; return this.complete ? 'complete' : 'connected';
  }
}
const shuffle = (items,random) => {
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.max(0,Math.min(i,Math.floor(random()*(i+1))));[result[i],result[j]]=[result[j],result[i]];}
  if(result.every((item,i)=>item===items[i])) result.push(result.shift());
  return result;
};
export const PUZZLE_LEVELS = Object.freeze({4:[2,2],6:[3,2],9:[3,3],12:[4,3]});
export class PicturePuzzle {
  constructor(count=4, random=Math.random) {
    if(!Number.isInteger(count)||!PUZZLE_LEVELS[count]) throw new RangeError('Choose 4, 6, 9 or 12 pieces.');
    [this.columns,this.rows]=PUZZLE_LEVELS[count]; this.count=count; this.placed=new Set();this.selected=null;
    this.order=shuffle(Array.from({length:count},(_,i)=>i),random);
    this.horizontal=Array.from({length:this.rows-1},(_,r)=>Array.from({length:this.columns},(_,c)=>(r+c)%2?1:-1));
    this.vertical=Array.from({length:this.rows},(_,r)=>Array.from({length:this.columns-1},(_,c)=>(r+c)%2?-1:1));
  }
  get complete(){return this.placed.size===this.count;}
  select(piece){if(!Number.isInteger(piece)||piece<0||piece>=this.count||this.placed.has(piece))return false;this.selected=piece;return true;}
  place(slot){
    if(this.complete||this.selected===null||!Number.isInteger(slot)||slot<0||slot>=this.count||this.placed.has(slot))return 'ignored';
    if(slot!==this.selected)return 'retry';
    this.placed.add(slot);this.selected=null;return this.complete?'complete':'placed';
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
