// Only successful feedback uses this clock. Answering and creative play have no deadline.
export class AutoAdvance {
  constructor({now=()=>performance.now(),setTimer=(callback,delay)=>setTimeout(callback,delay),clearTimer=id=>clearTimeout(id),ready=()=>true,onChange=()=>{}}={}){
    Object.assign(this,{now,setTimer,clearTimer,ready,onChange});this.blocks=new Set();this.pending=null;this.timer=null;this.paused=false;this.version=0;
  }
  schedule(callback,delay=2600){
    this.cancel();this.pending={callback,remaining:delay,waited:0};this.arm();this.onChange();
  }
  cancel(){this.version++;this.clearTimer(this.timer);this.timer=null;this.pending=null;this.paused=false;this.onChange();}
  get active(){return Boolean(this.pending);}
  suspend(){
    if(this.timer!==null){this.clearTimer(this.timer);this.timer=null;if(this.pending)this.pending.remaining=Math.max(0,this.pending.remaining-(this.now()-this.started));}
  }
  block(reason,blocked){this.suspend();if(blocked)this.blocks.add(reason);else this.blocks.delete(reason);this.arm();this.onChange();}
  toggle(){if(!this.pending)return;this.suspend();this.paused=!this.paused;this.arm();this.onChange();}
  arm(){
    if(!this.pending||this.paused||this.blocks.size||this.timer!==null)return;
    const version=this.version;this.started=this.now();
    this.timer=this.setTimer(()=>{
      if(version!==this.version)return;
      this.timer=null;const pending=this.pending;pending.remaining=0;
      // A bounded wait handles missing browser speech-end events without getting stuck.
      if(!this.ready()&&pending.waited<20000){pending.waited+=150;pending.remaining=150;this.arm();return;}
      this.pending=null;this.onChange();pending.callback();
    },this.pending.remaining);
  }
}

export function transitionControls(label='Next discovery'){
  return `<div class="auto-transition"><span data-auto-state>${label} in a moment…</span><button type="button" data-auto-toggle aria-label="Pause automatic transition">Ⅱ Pause</button></div>`;
}

export function mountAutoAdvance({ready=()=>true}={}){
  const clock=new AutoAdvance({ready,onChange(){
    document.querySelectorAll('[data-auto-toggle]').forEach(button=>{
      button.textContent=clock.paused?'▶ Continue':'Ⅱ Pause';button.setAttribute('aria-label',`${clock.paused?'Resume':'Pause'} automatic transition`);button.setAttribute('aria-pressed',String(clock.paused));
    });
    document.querySelectorAll('[data-auto-state]').forEach(node=>{
      if(!node.dataset.label)node.dataset.label=node.textContent;
      node.textContent=clock.paused?'Staying here. Continue when you’re ready.':node.dataset.label;
    });
  }});
  document.addEventListener('click',event=>{if(event.target.closest('[data-auto-toggle]'))clock.toggle();});
  const sync=()=>{clock.block('hidden',document.hidden);clock.block('dialog',Boolean(document.querySelector('dialog[open]')));};
  document.addEventListener('visibilitychange',sync);
  new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  window.addEventListener('pagehide',()=>clock.block('page',true));window.addEventListener('pageshow',()=>{clock.block('page',false);sync();});sync();return clock;
}

// Scroll only when the useful workspace is outside the viewport; never bounce to the page header.
export function revealWorkspace(element){
  if(!element)return;const rect=element.getBoundingClientRect();
  if(rect.top<8||rect.bottom>innerHeight-8)element.scrollIntoView({block:rect.height>innerHeight-16?'start':'nearest',behavior:'instant'});
}
