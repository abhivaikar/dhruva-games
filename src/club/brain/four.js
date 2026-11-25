export const FOUR_ROWS=6,FOUR_COLS=7;
export function winningLine(board,row,col){
  const player=board[row*7+col];if(!player)return [];
  for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){
    const line=[row*7+col];
    for(const sign of [-1,1])for(let step=1;step<7;step++){
      const r=row+dr*step*sign,c=col+dc*step*sign;
      if(r<0||r>=6||c<0||c>=7||board[r*7+c]!==player)break;
      line.push(r*7+c);
    }
    if(line.length>=4)return line;
  }
  return [];
}
export class FourGame {
  constructor(){this.board=Array(42).fill(0);this.turn=1;this.winner=0;this.draw=false;this.line=[];this.history=[];}
  get available(){return Array.from({length:7},(_,col)=>col).filter(col=>!this.board[col]);}
  snapshot(){return {board:[...this.board],turn:this.turn,winner:this.winner,draw:this.draw,line:[...this.line]};}
  clone(){const game=new FourGame();Object.assign(game,this.snapshot());return game;}
  drop(col){
    if(this.winner||this.draw||!Number.isInteger(col)||col<0||col>=7||this.board[col])return {status:'ignored'};
    this.history.push(this.snapshot());
    let row=5;while(this.board[row*7+col])row--;
    const player=this.turn;this.board[row*7+col]=player;this.line=winningLine(this.board,row,col);
    if(this.line.length)this.winner=player;
    else if(!this.available.length)this.draw=true;
    else this.turn=3-player;
    return {status:this.winner?'win':this.draw?'draw':'placed',row,col,player};
  }
  undo(){const old=this.history.pop();if(!old)return false;Object.assign(this,old);return true;}
  restart(){this.board.fill(0);this.turn=1;this.winner=0;this.draw=false;this.line=[];this.history=[];}
}
const ordered=game=>[3,2,4,1,5,0,6].filter(col=>game.available.includes(col));
const winAt=(game,col,player)=>{const copy=game.clone();copy.turn=player;return copy.drop(col).status==='win';};
function evaluate(game,player){
  let score=0;
  for(let r=0;r<6;r++)if(game.board[r*7+3])score+=game.board[r*7+3]===player?3:-3;
  for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){
    const er=r+dr*3,ec=c+dc*3;if(er<0||er>=6||ec<0||ec>=7)continue;
    const cells=Array.from({length:4},(_,i)=>game.board[(r+dr*i)*7+c+dc*i]);
    const own=cells.filter(n=>n===player).length,other=cells.filter(n=>n===3-player).length;
    if(!other)score+=[0,1,7,45,10000][own];if(!own)score-=[0,1,7,50,10000][other];
  }
  return score;
}
export function chooseFourColumn(game,{level='gentle',random=Math.random}={}){
  if(game.winner||game.draw)return null;
  const choices=ordered(game),player=game.turn;
  const win=choices.find(col=>winAt(game,col,player));if(win!==undefined)return win;
  if(level==='gentle')return choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];
  const block=choices.find(col=>winAt(game,col,3-player));if(block!==undefined)return block;
  function search(state,depth,alpha,beta){
    if(state.winner)return (state.winner===player?100000:-100000)*(depth+1);
    if(state.draw)return 0;if(!depth)return evaluate(state,player);
    const maximizing=state.turn===player;let best=maximizing?-Infinity:Infinity;
    for(const col of ordered(state)){
      const next=state.clone();next.drop(col);const score=search(next,depth-1,alpha,beta);
      best=maximizing?Math.max(best,score):Math.min(best,score);
      if(maximizing)alpha=Math.max(alpha,best);else beta=Math.min(beta,best);if(beta<=alpha)break;
    }
    return best;
  }
  let best=-Infinity,choice=choices[0];
  for(const col of choices){const next=game.clone();next.drop(col);const score=search(next,3,-Infinity,Infinity);if(score>best){best=score;choice=col;}}
  return choice;
}
