import { seeded, shuffled } from './random.js';
export const MAZE_DIRECTIONS=Object.freeze({up:[-1,0,0,2],right:[0,1,1,3],down:[1,0,2,0],left:[0,-1,3,1]});
export const MAZE_THEMES=Object.freeze([
  {id:'garden',name:'Butterfly garden',icon:'🦋',fruit:'🍓',colour:'#edf8dc'},
  {id:'beach',name:'Seashell shore',icon:'🐚',fruit:'🥥',colour:'#fff2d4'},
  {id:'space',name:'Moon picnic',icon:'🪐',fruit:'⭐',colour:'#eee8ff'},
  {id:'forest',name:'Woodland wander',icon:'🦊',fruit:'🍎',colour:'#ddf3e4'},
  {id:'city',name:'Singapore stroll',icon:'🚆',fruit:'🥭',colour:'#e3f3ff'},
  {id:'snow',name:'Snowy expedition',icon:'⛄',fruit:'🫐',colour:'#e8f8ff'},
  {id:'dino',name:'Dinosaur valley',icon:'🦕',fruit:'🍐',colour:'#f0f3d9'},
  {id:'clouds',name:'Rainbow sky',icon:'🌈',fruit:'🍒',colour:'#fff0f7'},
]);
export class PicnicMaze {
  constructor({size=5,seed=Date.now(),theme='garden'}={}){
    if(![5,7,9].includes(size))throw new RangeError('Choose a 5, 7 or 9 square maze.');
    this.size=size;this.seed=seed;this.theme=MAZE_THEMES.find(item=>item.id===theme)||MAZE_THEMES[0];
    this.walls=Array.from({length:size*size},()=>[true,true,true,true]);
    const random=seeded(seed),visited=new Set([0]),stack=[0];
    while(stack.length){
      const cell=stack.at(-1),r=Math.floor(cell/size),c=cell%size;
      const choices=shuffled(Object.values(MAZE_DIRECTIONS),random).filter(([dr,dc])=>r+dr>=0&&r+dr<size&&c+dc>=0&&c+dc<size&&!visited.has((r+dr)*size+c+dc));
      if(!choices.length){stack.pop();continue;}
      const [dr,dc,edge,opposite]=choices[0],next=(r+dr)*size+c+dc;
      this.walls[cell][edge]=false;this.walls[next][opposite]=false;visited.add(next);stack.push(next);
    }
    this.cell=0;this.goal=size*size-1;this.collected=new Set();this.visited=new Set([0]);this.history=[];this.steps=0;
    const route=this.route(0,this.goal).slice(1,-1),count=Math.min(3,route.length);
    this.fruits=Array.from({length:count},(_,i)=>route[Math.floor((i+.5)*route.length/count)]);
  }
  neighbours(cell){
    return Object.values(MAZE_DIRECTIONS).filter(([, ,edge])=>!this.walls[cell][edge]).map(([dr,dc])=>cell+dr*this.size+dc);
  }
  route(start,goal){
    if(![start,goal].every(cell=>Number.isInteger(cell)&&cell>=0&&cell<this.walls.length))return [];
    const queue=[start],parents=new Map([[start,null]]);
    for(let i=0;i<queue.length;i++){
      const cell=queue[i];if(cell===goal)break;
      for(const next of this.neighbours(cell))if(!parents.has(next)){parents.set(next,cell);queue.push(next);}
    }
    if(!parents.has(goal))return [];
    const result=[];for(let cell=goal;cell!==null;cell=parents.get(cell))result.unshift(cell);return result;
  }
  get complete(){return this.cell===this.goal&&this.collected.size===this.fruits.length;}
  move(direction){
    if(this.complete||!MAZE_DIRECTIONS[direction])return 'ignored';
    const [dr,dc,edge]=MAZE_DIRECTIONS[direction];if(this.walls[this.cell][edge])return 'wall';
    this.history.push({cell:this.cell,collected:[...this.collected],visited:[...this.visited],steps:this.steps});
    this.cell+=dr*this.size+dc;this.steps++;this.visited.add(this.cell);
    if(this.fruits.includes(this.cell))this.collected.add(this.cell);
    return this.complete?'complete':'moved';
  }
  moveTo(cell){
    const delta=cell-this.cell;
    const direction=Object.keys(MAZE_DIRECTIONS).find(key=>{const [dr,dc]=MAZE_DIRECTIONS[key];return delta===dr*this.size+dc&&Math.abs(Math.floor(cell/this.size)-Math.floor(this.cell/this.size))+Math.abs(cell%this.size-this.cell%this.size)===1;});
    return direction?this.move(direction):'far';
  }
  undo(){const previous=this.history.pop();if(!previous)return false;Object.assign(this,previous,{collected:new Set(previous.collected),visited:new Set(previous.visited)});return true;}
  restart(){this.cell=0;this.collected.clear();this.visited=new Set([0]);this.steps=0;this.history=[];}
  hint(){return this.route(this.cell,this.goal)[1]??null;}
}
