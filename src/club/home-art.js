import { WORLD_WIDTH } from './home-model.js';

export function homeCardArt() {
  return `<svg viewBox="0 0 480 245" aria-hidden="true"><defs><linearGradient id="home-sky" x2="0" y2="1"><stop stop-color="#7396a2"/><stop offset="1" stop-color="#efd3a4"/></linearGradient></defs><rect width="480" height="245" fill="url(#home-sky)"/><circle cx="364" cy="67" r="26" fill="#f8dfa1"/><path d="m0 150 70-85 70 72 84-111 110 115 88-81 58 70v115H0" fill="#94a79c"/><path d="m0 167 93-57 98 68 102-76 101 75 86-49v117H0" fill="#668a7d"/><path d="M0 194q110-55 250-8t230-15v74H0" fill="#3e6654"/><path d="M174 245q60-48 180-63-77 27-107 63" fill="#c5b58b"/><g fill="#2c5148">${[25,65,395,436,466].map((x,i)=>`<path d="m${x} ${70+i%2*30}-25 111h50Z"/>`).join('')}</g><g transform="translate(212 172)"><path d="m-5 27-4 32m21-32 7 32" stroke="#354a4a" stroke-width="8"/><path d="M-14 0h32l5 33h-40Z" fill="#d6ae57"/><rect x="-23" y="0" width="11" height="27" rx="4" fill="#8e6150"/><circle cy="-13" r="13" fill="#e4b389"/><path d="M-15-17q2-21 28-4l3 8h-31" fill="#b35949"/></g><g transform="translate(268 209)" fill="#cc9c68"><ellipse rx="19" ry="10"/><circle cx="18" cy="-10" r="10"/><path d="m11-18 2 20 8-14M-15 4l-3 15m24-15 3 15" stroke="#bd8758" stroke-width="6"/><path d="M-16-5q-21-24-24-3" fill="none" stroke="#cc9c68" stroke-width="6"/></g><g fill="#e8cc86"><circle cx="102" cy="212" r="3"/><circle cx="353" cy="219" r="3"/><circle cx="322" cy="230" r="2"/></g></svg>`;
}
const palettes={meadow:['#486a4d','#709159','#a9b475'],river:['#41675c','#5c8873','#9bad85'],bamboo:['#315c4c','#5a8860','#a5b67d'],village:['#394e50','#596e62','#929574'],coast:['#345f58','#5e8370','#b4bc86'],autumn:['#8a6842','#c38b4f','#e2ba67'],clouds:['#647a89','#90a6ac','#d4c7b6'],home:['#2c5249','#4c7560','#7e9271']};
function seeded(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function path(ctx,points,fill,stroke,width=1){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function ellipse(ctx,x,y,rx,ry,colour){ctx.fillStyle=colour;ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);ctx.fill();}
function line(ctx,x,y,x2,y2,colour,width=1){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle=colour;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();}
function pine(ctx,x,y,size,palette,rng){
  line(ctx,x,y,x-3*size,y-138*size,'#514f3d',5*size);
  for(let i=0;i<9;i++){
    const top=y-155*size+i*14*size,w=(12+i*5)*size;
    path(ctx,[[x-2*size,top],[x-w,top+47*size],[x+w*.85,top+43*size]],palette[i%3]);
    for(let j=0;j<5;j++){const xx=x+(rng()-.5)*w*1.7,yy=top+30*size+rng()*13*size;line(ctx,xx,yy,xx+9*size,yy-5*size,palette[(i+1)%3],1.5*size);}
  }
}
function leafy(ctx,x,y,size,palette,rng){
  line(ctx,x,y,x-5*size,y-100*size,'#665b46',9*size);
  for(let i=0;i<10;i++){
    const a=rng()*Math.PI*2,r=rng()*43*size,cx=x+Math.cos(a)*r,cy=y-110*size+Math.sin(a)*r*.8;
    line(ctx,x,y-35*size,cx,cy,'#6b5b43',3*size);
    ellipse(ctx,cx,cy,(20+rng()*19)*size,(17+rng()*12)*size,palette[i%3]);
    for(let j=0;j<14;j++){const dx=(rng()-.5)*49*size,dy=(rng()-.5)*30*size;ellipse(ctx,cx+dx,cy+dy,(1+rng()*3)*size,1.5*size,palette[(i+1)%3]);}
  }
}
function cottage(ctx,x,y,s=1,night=false){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  path(ctx,[[-65,0],[-65,-88],[55,-88],[55,0]],night?'#b1a78d':'#e3cda2');
  path(ctx,[[-79,-84],[-10,-143],[72,-84]],'#5b655d');
  for(let i=0;i<8;i++)line(ctx,-68+i*17,-88,-10,-138,'#838475',1);
  path(ctx,[[27,-115],[27,-145],[42,-145],[42,-101]],'#8d7d69');
  ctx.fillStyle='#725f48';ctx.fillRect(-13,-57,28,57);
  for(const wx of [-48,29]){ctx.fillStyle=night?'#ffe0a0':'#7d9b95';ctx.fillRect(wx,-66,22,29);line(ctx,wx+11,-66,wx+11,-37,'#7d725b',2);line(ctx,wx,-51,wx+22,-51,'#7d725b',2);}
  for(let i=0;i<5;i++)line(ctx,-65,-72+i*16,55,-72+i*16,'#857b6633',1);
  ellipse(ctx,10,12,85,7,'#253d3a22');ctx.restore();
}
function cloud(ctx,x,y,s=1,colour='#fff3db88'){for(let i=0;i<6;i++)ellipse(ctx,x+i*25*s,y-Math.sin(i*.6)*16*s,(24+i%2*6)*s,15*s,colour);}

export class HomePainter {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.width=1100;this.height=680;this.chapter=-1;this.camera=0;this.facing=1;}
  resize(){const rect=this.canvas.getBoundingClientRect(),ratio=Math.min(globalThis.devicePixelRatio||1,2);this.canvas.width=Math.round(rect.width*ratio);this.canvas.height=Math.round(rect.height*ratio);this.width=Math.max(660,Math.min(1500,rect.width/rect.height*680));this.scale=this.canvas.width/this.width;this.height=this.canvas.height/this.scale;this.chapter=-1;}
  terrainY(x){return 533+Math.sin(x*.003)*12+Math.sin(x*.009)*3;}
  bake(scene,index){
    this.chapter=index;this.palette=palettes[scene.theme];
    const bg=document.createElement('canvas');bg.width=1700;bg.height=750;const b=bg.getContext('2d'),r=seeded(1462+index*71);
    const sky=b.createLinearGradient(0,0,0,600);sky.addColorStop(0,scene.sky[0]);sky.addColorStop(.8,scene.sky[1]);sky.addColorStop(1,scene.sky[1]);b.fillStyle=sky;b.fillRect(0,0,1700,750);
    const night=['village','home'].includes(scene.theme),sunx=1150,suny=150;
    const glow=b.createRadialGradient(sunx,suny,6,sunx,suny,180);glow.addColorStop(0,night?'#fff5cf44':'#ffe9ad88');glow.addColorStop(1,'#ffe9ad00');b.fillStyle=glow;b.fillRect(sunx-180,suny-180,360,360);ellipse(b,sunx,suny,night?24:32,night?24:32,night?'#fff3d4':'#ffe8ab');
    if(night)for(let i=0;i<60;i++)ellipse(b,r()*1700,r()*260,.6+r(),.6+r(),'#fff4cd99');
    for(let i=0;i<12;i++)cloud(b,r()*1700,40+r()*210,.4+r()*.8,night?'#d4c0c622':'#fff1d844');
    for(let layer=0;layer<3;layer++){
      const points=[[0,750],[0,320]];for(let x=0;x<=1800;x+=55)points.push([x,280+layer*50+Math.sin(x*.005+layer*2)*42+Math.sin(x*.013+layer)*25+(r()-.5)*25]);points.push([1800,750]);path(b,points,scene.hills[layer]);
      if(layer<2)for(let i=0;i<65;i++){const x=r()*1700,y=325+layer*50+r()*35;path(b,[[x,y],[x+4,y-14],[x+8,y]],scene.hills[layer+1]);}
    }
    // Tiny dry-brush flecks on the paper, baked once instead of changing each frame.
    for(let i=0;i<6000;i++){b.fillStyle=i%2?'#ffffff09':'#243e4007';b.fillRect(r()*1700,r()*750,1+r()*3,.5+r());}
    this.background=bg;
    const world=document.createElement('canvas');world.width=WORLD_WIDTH+200;world.height=750;const c=world.getContext('2d'),rng=seeded(532+index*93),p=this.palette,water=['river','coast'].includes(scene.theme);
    if(!water&&scene.mode!=='balloon'){
      const ground=[[0,750],[0,500]];for(let x=0;x<=2300;x+=30)ground.push([x,this.terrainY(x)-17]);ground.push([2300,750]);path(c,ground,scene.ground);
      c.beginPath();c.moveTo(0,552);for(let x=0;x<=2300;x+=10)c.lineTo(x,this.terrainY(x)+18);c.strokeStyle=scene.theme==='village'?'#a8957d':'#c5b48c';c.lineWidth=45;c.stroke();
      for(let i=0;i<2300;i++){const x=rng()*2300,y=490+rng()*250;if(Math.abs(y-this.terrainY(x)-18)<22)ellipse(c,x,y,1.3,1,'#6b715044');else line(c,x,y,x+(rng()-.5)*5,y-3-rng()*7,p[i%3],1);}
    }
    if(water){
      const wg=c.createLinearGradient(0,400,0,750);wg.addColorStop(0,scene.theme==='coast'?'#98bdba':'#9bb8a7');wg.addColorStop(1,scene.theme==='coast'?'#486f7c':'#4b777c');c.fillStyle=wg;c.fillRect(0,425,2300,325);
      for(let i=0;i<1000;i++){const x=rng()*2300,y=438+rng()*300;line(c,x,y,x+5+rng()*30,y,i%3?'#c0d3be33':'#f4dfb455',.5+rng());}
      if(scene.mode==='train'){
        path(c,[[0,570],[2300,570],[2300,750],[0,750]],'#71826b');
        for(let x=0;x<2300;x+=25)line(c,x,586,x+20,601,'#6a614e',5);
        line(c,0,586,2300,586,'#374d4a',4);line(c,0,599,2300,599,'#bac0a0',3);
      }else{
        for(let i=0;i<14;i++){const x=rng()*2300,y=560+rng()*130;ellipse(c,x,y,13,4,'#668e6a');ellipse(c,x-3,y-5,3,5,'#e6c9a0');}
      }
    }
    if(scene.theme==='bamboo'){
      for(let i=0;i<65;i++){
        const x=rng()*2300,y=500+rng()*18,h=150+rng()*220;line(c,x,y,x-12,y-h,p[i%3],5+rng()*6);
        for(let yy=y-h;yy<y;yy+=27){line(c,x-15,yy,x+4,yy,'#b3c69477',2);for(let j=0;j<4;j++){const xx=x+(j-1.5)*14;path(c,[[x,yy],[xx,yy-20-rng()*25],[xx+9,yy-13]],p[j%3]);}}
      }
    }else if(scene.theme==='village'){
      for(let i=0;i<9;i++)cottage(c,110+i*245,495,.8+rng()*.45,true);
      line(c,0,300,2300,300,'#7a7469',2);for(let i=0;i<24;i++){const x=35+i*99;line(c,x,300,x,335,'#7a7469',1);ellipse(c,x,350,12,17,'#f3c278');line(c,x-5,369,x+5,369,'#c88c64',3);}
      for(let i=0;i<4;i++){const x=200+i*550;path(c,[[x,550],[x+25,521],[x+125,521],[x+155,550]],'#b8aa8b');line(c,x+13,526,x+140,526,'#675f50',4);for(let j=0;j<6;j++)line(c,x+15+j*23,526,x+15+j*23,509,'#675f50',3);line(c,x+15,509,x+130,509,'#675f50',3);}
    }else if(scene.theme==='home'){
      for(let i=0;i<10;i++)pine(c,i*230,510,.9+rng()*.7,p,rng);
      cottage(c,1730,520,1.5,true);for(let i=0;i<50;i++){const x=1400+i*12;line(c,x,542,x,505,'#c6bea0',5);}line(c,1398,519,2000,519,'#bbb495',3);
    }else if(scene.theme==='clouds'){
      for(let i=0;i<7;i++)cloud(c,i*340,500+rng()*80,2.2,'#ead7c166');
      for(let i=0;i<8;i++)cottage(c,100+i*290,680,.15,false);
    }else{
      for(let i=0;i<25;i++){
        const x=i*100+rng()*70,y=scene.theme==='coast'?438:500-rng()*14,size=.45+rng()*.8;
        if(scene.theme==='autumn'||scene.theme==='meadow'&&i%3)leafy(c,x,y,size,p,rng);else pine(c,x,y,size,p,rng);
      }
      if(scene.theme==='meadow')cottage(c,1850,500,.65,false);
    }
    // Foreground flowers and stippling: the same seeded illustration on every visit.
    if(!water&&scene.mode!=='balloon')for(let i=0;i<260;i++){
      const x=rng()*2300,y=610+rng()*100;line(c,x,y,x-2,y-10,'#425b4488',1);ellipse(c,x-2,y-11,1.5+rng()*2,1+rng(),['#eadba1','#d3c1a7','#b8c4a0'][i%3]);
    }
    this.world=world;
  }
  draw(journey,time=0,moving=false,reduced=false){
    if(!this.ctx)return;
    const scene=journey.scene;if(this.chapter!==journey.chapter)this.bake(scene,journey.chapter);
    const c=this.ctx,w=this.width,h=this.height,sy=h/680;
    c.setTransform(this.scale,0,0,this.scale,0,0);c.clearRect(0,0,w,h);c.save();c.scale(1,sy);
    this.camera=Math.max(0,Math.min(WORLD_WIDTH-w,journey.x-w*.38));
    c.drawImage(this.background,-this.camera*.12,0,Math.max(w+300,1700),750);
    c.drawImage(this.world,-this.camera,0);
    if(!reduced){for(let i=0;i<16;i++){const x=(i*137+time*.009)%w,y=200+(i*41)%380+Math.sin(time*.0005+i)*14;ellipse(c,x,y,1.4,1.4,['village','home'].includes(scene.theme)?'#ffde8d99':'#fff3c355');}}
    // World discoveries have a warm marker, a small pictogram and a visible check when collected.
    scene.objects.forEach((object,i)=>{
      const x=object.x-this.camera;if(x<-80||x>w+80)return;
      const y=scene.mode==='balloon'?330:this.terrainY(object.x)-64;
      this.object(c,object.kind,x,y+19,time,reduced);
      const found=journey.found.has(i),glow=c.createRadialGradient(x,y-38,2,x,y-38,32);glow.addColorStop(0,found?'#d4e3bd66':'#ffdf9baa');glow.addColorStop(1,'#ffdf9b00');c.fillStyle=glow;c.fillRect(x-34,y-72,68,68);
      ellipse(c,x,y-38,13,13,found?'#466a51':'#e9cb8a');c.strokeStyle='#fff0cd';c.lineWidth=1.5;c.beginPath();c.arc(x,y-38,13,0,Math.PI*2);c.stroke();c.fillStyle=found?'#f5edce':'#3a534a';c.font='bold 14px system-ui';c.textAlign='center';c.fillText(found?'✓':String(i+1),x,y-33);
    });
    const px=journey.x-this.camera,walkY=this.terrainY(journey.x),phase=reduced?0:time*.009;
    if(scene.mode==='balloon'){
      const y=405+Math.sin(time*.0008)*(!reduced?7:0);
      this.balloon(c,px,y);this.child(c,px-8,y-17,.65,0,this.facing);this.dog(c,px+22,y-10,.55,0,1);path(c,[[px-40,y-24],[px+44,y-24],[px+32,y+17],[px-28,y+17]],'#b08c5f');for(let i=0;i<5;i++)line(c,px-34,y-17+i*7,px+38,y-17+i*7,'#806b4e',1);
    }else if(scene.mode==='canoe'){
      const y=walkY+12+(!reduced?Math.sin(time*.0015)*2:0);ellipse(c,px,y+8,78,5,'#345b6533');this.child(c,px-8,y-10,.75,0,this.facing);this.dog(c,px+40,y-6,.65,0,1);path(c,[[px-85,y-5],[px+90,y-5],[px+62,y+17],[px-53,y+17]],'#946c43','#d3a46b',3);line(c,px-12,y-35,px+19+Math.sin(phase*.35)*9,y+30,'#c7b08b',4);line(c,px+16,y+24,px+24,y+37,'#c7b08b',7);
    }else if(scene.mode==='train'){
      const y=570;for(let i=0;i<3;i++){const xx=px-95-i*24,yy=y-115-i*18;ellipse(c,xx,yy,12+i*4,9+i*3,'#fff6dd55');}
      for(const xx of [-57,40]){ellipse(c,px+xx,y+13,16,16,'#3f5350');ellipse(c,px+xx,y+13,7,7,'#a4b2a0');}
      c.fillStyle='#c2c7aa';c.fillRect(px-87,y-79,155,84);path(c,[[px-99,y-79],[px-85,y-93],[px+69,y-93],[px+80,y-79]],'#446b63');c.fillStyle='#6b9b99';c.fillRect(px-73,y-64,125,42);this.child(c,px-23,y-23,.6,0,1);this.dog(c,px+27,y-24,.55,0,1);line(c,px-12,y-64,px-12,y-22,'#e0d6ac',4);line(c,px-87,y+1,px+68,y+1,'#b28c5e',8);c.fillStyle='#4e675b';c.fillRect(px+68,y-53,35,58);c.fillRect(px+78,y-95,14,43);ellipse(c,px+91,y-30,9,9,'#f0d395');
    }else{
      this.dog(c,px-67*this.facing,walkY+8,.9,moving?phase:0,this.facing);
      this.child(c,px,walkY,.95,moving?phase:0,this.facing);
    }
    // Subtle translucent paper grain over every scene.
    c.restore();
  }
  child(c,x,y,s,phase,facing){
    c.save();c.translate(x,y);c.scale(s*facing,s);const step=Math.sin(phase)*7;
    ellipse(c,0,5,22,4,'#1e393530');line(c,-8,-7,-10+step,0,'#354d50',8);line(c,9,-7,11-step,0,'#354d50',8);line(c,-10+step,0,-5+step,1,'#3d4141',8);line(c,11-step,0,16-step,1,'#3d4141',8);
    path(c,[[-16,-47],[13,-48],[19,-12],[-18,-12]],'#d9ad58');path(c,[[-16,-44],[-23,-43],[-25,-17],[-16,-14]],'#8c6450');line(c,-20,-40,-20,-20,'#b58a64',2);line(c,11,-40,22,-22+step*.4,'#dfb267',7);ellipse(c,23,-21+step*.4,4,4,'#d5a780');
    ellipse(c,1,-59,13,15,'#e0b28a');ellipse(c,8,-56,3,4,'#d9a780');path(c,[[-13,-62],[-14,-71],[-3,-78],[11,-76],[16,-65]],'#a85747');line(c,-13,-63,15,-63,'#c47559',5);ellipse(c,-1,-78,5,5,'#b45f4b');line(c,-9,-45,13,-45,'#ad644d',5);path(c,[[-8,-44],[-14,-27],[-8,-29],[-1,-43]],'#ad644d');ellipse(c,11,-59,1.3,1.5,'#3a443e');c.restore();
  }
  dog(c,x,y,s,phase,facing){
    c.save();c.translate(x,y);c.scale(s*facing,s);const step=Math.sin(phase)*5;ellipse(c,0,3,25,4,'#183d3525');ellipse(c,0,-16,22,11,'#bf905e');line(c,-11,-13,-13+step,1,'#b28054',5);line(c,11,-13,14-step,1,'#d2a26a',5);line(c,-20,-20,-32,-32+Math.sin(phase*.6)*6,'#c89d67',6);ellipse(c,18,-30,12,12,'#cfa56d');ellipse(c,24,-26,9,6,'#dcb782');ellipse(c,31,-28,3,2,'#3c493f');ellipse(c,18,-32,1.6,1.6,'#3b443b');ellipse(c,10,-31,4,12,'#9b6e4c');line(c,10,-19,23,-20,'#ac6452',3);c.restore();
  }
  balloon(c,x,y){
    c.save();c.translate(x,y);line(c,-58,-138,-32,-19,'#6a6b5c',1.5);line(c,59,-138,34,-19,'#6a6b5c',1.5);ellipse(c,0,-192,84,99,'#c68163');ellipse(c,-17,-192,50,99,'#e0b57b');ellipse(c,2,-192,24,99,'#e9c992');path(c,[[-44,-108],[44,-108],[17,-82],[-17,-82]],'#aa765b');line(c,-17,-82,-17,-28,'#7c7761',1);line(c,17,-82,17,-28,'#7c7761',1);c.restore();
  }
  object(c,kind,x,y,time,reduced){
    c.save();c.translate(x,y);const gold='#efd49b',dark='#536c54';
    if(['flower','plant','leaf','acorn','lily'].includes(kind)){
      if(kind==='lily'){ellipse(c,0,17,28,6,'#6f956d');for(let i=0;i<5;i++)ellipse(c,(i-2)*5,4-Math.sin(i*.7)*5,4,9,'#eed8ba');}
      else if(kind==='acorn'){ellipse(c,0,4,11,14,'#cda475');ellipse(c,0,-5,14,6,'#8c6f50');line(c,0,-9,3,-16,dark,3);}
      else if(kind==='leaf'){path(c,[[0,-20],[-12,-4],[-17,3],[0,18],[17,-1],[8,-13]],'#e7bb62');line(c,0,20,0,-14,'#a5844f',1);}
      else{line(c,0,23,0,-7,dark,3);ellipse(c,-7,9,9,3,'#91a46f');ellipse(c,7,3,9,3,'#9caf77');if(kind==='flower'){for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ellipse(c,Math.cos(a)*8,-12+Math.sin(a)*8,5,5,gold);}ellipse(c,0,-12,4,4,'#bd9762');}}
    }else if(['dog','fox','cat'].includes(kind)){this.dog(c,0,15,.9,0,1);if(kind==='fox')path(c,[[11,-26],[8,-39],[18,-31],[22,-39],[28,-25]],'#b67d50');}
    else if(kind==='house'){cottage(c,0,20,.45,true);}
    else if(kind==='lighthouse'){
      path(c,[[-14,25],[-9,-38],[9,-38],[14,25]],'#e0d4b1');path(c,[[-14,-39],[0,-51],[14,-39]],'#955c51');c.fillStyle=gold;c.fillRect(-9,-37,18,13);line(c,-14,-22,14,-22,'#8b7561',3);
    }else if(kind==='sign'){line(c,0,25,0,-24,'#8d7e59',4);path(c,[[-28,-26],[20,-26],[31,-14],[20,-4],[-28,-4]],'#d1b98a');line(c,-17,-14,14,-14,'#6d7758',2);}
    else if(kind==='lantern'||kind==='bell'||kind==='chime'){
      line(c,0,-22,0,-7,dark,2);ellipse(c,0,4,kind==='lantern'?14:10,18,kind==='lantern'?'#edc17d':'#c7b88f');line(c,-9,22,9,22,'#96765a',2);line(c,0,23,0,32,gold,2);
    }else if(kind==='boat'){path(c,[[-29,5],[27,5],[15,20],[-15,20]],'#e7dec1');path(c,[[-4,4],[-4,-19],[20,4]],'#f5e8c5');}
    else if(kind==='duck'){ellipse(c,0,15,17,9,'#d9caae');ellipse(c,13,3,8,8,'#59776a');path(c,[[20,2],[29,6],[20,8]],gold);}
    else if(kind==='basket'){path(c,[[-22,0],[22,0],[16,24],[-17,24]],'#bd9464');c.beginPath();c.arc(0,0,17,Math.PI,0);c.strokeStyle='#ab865b';c.lineWidth=3;c.stroke();ellipse(c,0,-1,9,8,'#b36e59');}
    else if(kind==='ticket'){c.fillStyle=gold;c.fillRect(-23,-5,46,28);line(c,5,-5,5,23,'#967c56',1);line(c,-15,5,-3,5,'#967c56',2);line(c,-15,12,-3,12,'#967c56',2);}
    else if(kind==='shell'){for(let i=0;i<7;i++)line(c,0,21,(i-3)*7,Math.abs(i-3)*3-5,'#e4cbb0',7);}
    else if(kind==='cloud'){cloud(c,-33,8,.4,'#fff0d9bb');}
    else if(kind==='bird'){for(let j=0;j<2;j++){c.beginPath();c.moveTo(-25+j*25,7-j*12);c.quadraticCurveTo(-15+j*25,-3-j*12,-8+j*25,8-j*12);c.quadraticCurveTo(j*25,-4-j*12,10+j*25,2-j*12);c.strokeStyle='#4c6470';c.lineWidth=2;c.stroke();}}
    else{for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;line(c,0,3,Math.cos(a)*15,3+Math.sin(a)*15,gold,4);}}
    c.restore();
  }
}
