// A quiet, procedural music-box accompaniment. No downloads or autoplay.
export class HomeAmbience {
  constructor(guide){this.guide=guide;this.timer=null;this.nodes=new Set();this.note=0;this.chapter=0;}
  start(chapter=0){
    this.stop();this.chapter=chapter;
    if(!this.guide.enabled)return;
    this.guide.unlock();if(!this.guide.context)return;
    const play=()=>{
      const ctx=this.guide.context;if(!this.guide.enabled||ctx.state!=='running')return;
      const tune=[0,4,7,12,7,4,2,7,11,14,11,7,0,4,9,12,9,4,2,5,7,14,7,5];
      const pitch=196*Math.pow(2,(tune[this.note++%tune.length]+(this.chapter%3)*2)/12);
      try{
        const oscillator=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
        oscillator.type='sine';oscillator.frequency.value=pitch;
        gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.016,now+.09);gain.gain.exponentialRampToValueAtTime(.0001,now+2.7);
        oscillator.connect(gain);gain.connect(ctx.destination);this.nodes.add(oscillator);
        oscillator.onended=()=>{this.nodes.delete(oscillator);oscillator.disconnect();gain.disconnect();};
        oscillator.start(now);oscillator.stop(now+2.8);
      }catch{/* Music remains optional. */}
    };
    play();this.timer=setInterval(play,1500);
  }
  stop(){clearInterval(this.timer);this.timer=null;for(const node of this.nodes){try{node.stop();}catch{}}this.nodes.clear();}
}
