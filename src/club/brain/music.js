export const NOTES=Object.freeze([
  {name:'C',sol:'Do',frequency:261.63,colour:'#f27888',key:'a'},
  {name:'D',sol:'Re',frequency:293.66,colour:'#f4a968',key:'s'},
  {name:'E',sol:'Mi',frequency:329.63,colour:'#efcf59',key:'d'},
  {name:'F',sol:'Fa',frequency:349.23,colour:'#8cc879',key:'f'},
  {name:'G',sol:'So',frequency:392,colour:'#61c3bf',key:'g'},
  {name:'A',sol:'La',frequency:440,colour:'#73b4ed',key:'h'},
  {name:'B',sol:'Ti',frequency:493.88,colour:'#a895e0',key:'j'},
  {name:'C high',sol:'Do!',frequency:523.25,colour:'#e49bc7',key:'k'},
]);
const names=['Morning hello','Bubble bounce','Forest footsteps','Little rainbow','Turtle tiptoe','Cloud castle','Starry stroll','Picnic dance','Rocket ripple','Moonbeam hop','Seashell song','Friendly wave','Sunshine steps','Garden gate','Butterfly bounce','Raindrop rhythm','Dinosaur disco','Pip’s parade','Cherry chime','Cosy cottage','Ocean echo','Secret sparkle','Mango melody','Goodnight glow'];
export const TUNES=Object.freeze(names.map((name,index)=>{
  const first=index%6,step=1+Math.floor(index/6);
  return {name,notes:[first,(first+step)%8,(first+2)%8,(first+step)%8,(first+4)%8,(first+1)%8,first]};
}));
export const MUSIC_LEVELS=Object.freeze({little:{name:'3-note tunes',length:3},growing:{name:'5-note tunes',length:5},brilliant:{name:'7-note tunes',length:7}});
export class MelodyMemory {
  constructor({level='little',index=0}={}){
    if(!MUSIC_LEVELS[level])throw new RangeError('Unknown melody level.');
    this.level=level;this.index=((index%TUNES.length)+TUNES.length)%TUNES.length;this.tune=TUNES[this.index];this.notes=this.tune.notes.slice(0,MUSIC_LEVELS[level].length);this.restart();
  }
  restart(){this.cursor=0;this.phase='idle';}
  listen(){this.cursor=0;this.phase='listening';}
  ready(){if(this.phase==='listening')this.phase='answer';}
  press(note){
    if(this.phase!=='answer'||!Number.isInteger(note)||note<0||note>=NOTES.length)return 'ignored';
    if(note!==this.notes[this.cursor]){this.cursor=0;return 'retry';}
    this.cursor++;if(this.cursor===this.notes.length){this.phase='complete';return 'complete';}return 'correct';
  }
}
// A cancelled tune cannot light keys, play later notes or unlock an old question.
export class TunePlayer {
  constructor({setTimer=(fn,ms)=>setTimeout(fn,ms),clearTimer=id=>clearTimeout(id),note=()=>{},light=()=>{}}={}){Object.assign(this,{setTimer,clearTimer,note,light});this.timers=[];this.version=0;this.playing=false;}
  stop(){this.version++;this.timers.forEach(this.clearTimer);this.timers=[];this.playing=false;this.light(null);}
  play(notes,onEnd=()=>{}){
    this.stop();this.playing=true;const version=this.version;
    const schedule=(fn,ms)=>this.timers.push(this.setTimer(()=>{if(version===this.version)fn();},ms));
    notes.forEach((note,index)=>{
      schedule(()=>{this.note(note);this.light(note);},index*700);
      schedule(()=>this.light(null),index*700+470);
    });
    schedule(()=>{this.playing=false;this.timers=[];onEnd();},notes.length*700);
  }
}
