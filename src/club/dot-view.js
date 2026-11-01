import { getScene, escapeHTML } from './activity-scenes.js';
import { dotLabels, dotTargetRadius } from './activity-model.js';

// Interior marks are printed clues, like the details in a paper activity book.
// The child builds the outer contour; that same contour stays after completion.
const features={
  train:['window1','window2','window3','window4','windscreen','stripe'],
  dinosaur:['belly','spike1','spike2','spike3'],
  rocket:['window','band','innerflame','nose'],
  turtle:['shell','centre'],
  butterfly:['body','head','spot1','spot2','spot3','spot4'],
  robot:['antenna','eye1','eye2','heart'],
  bus:['upper0','upper1','upper2','upper3','lower0','lower1','lower2','door','stripe'],
  aeroplane:['cockpit','window0','window1','window2','window3'],
  helicopter:['window','door','rotor','mast','skid','tailcentre'],
  sailboat:['mast','stripe','porthole1','porthole2'],
  excavator:['window','joint','trackcentre','wheel1','wheel2'],
  cat:['ear1','ear2','belly','nose'],
  owl:['belly','eye1','eye2','beak'],
  elephant:['ear','innerear','toe1','toe2'],
  lion:['face','muzzle1','muzzle2','nose'],
  penguin:['belly','face1','face2','beak','scarf'],
  whale:['belly','flipper','cheek'],
  octopus:['face','cheek1','cheek2'],
  crab:['belly','eye1','eye2'],
  seahorse:['belly','cheek'],
  jellyfish:['shine','cheek1','cheek2'],
  bee:['stripe1','stripe2','cheek1','cheek2'],
  ladybird:['spot0','spot1','spot2','spot3','spot4','spot5','cheek1','cheek2'],
  flower:['centre','cheek1','cheek2'],
  snail:['shellmiddle','shellcentre','eye1','eye2','cheek'],
  tree:['apple0','apple1','apple2','apple3','apple4','apple5'],
  ufo:['alien','light0','light1','light2','light3','light4'],
  castle:['door','window1','window2','window3'],
  dragon:['belly','horn1','horn2'],
  astronaut:['visor','panel','button1','button2'],
  icecream:['conestripe','sauce','sprinkle0','sprinkle1','sprinkle2','sprinkle3','sprinkle4','sprinkle5'],
  cupcake:['fold0','fold1','fold2','fold3','fold4','swirl','cheek1','cheek2'],
  balloon:['panel1','panel2','panel3','rim'],
  kite:['panel1','panel2','bow1','bow2','bow3'],
  house:['door','window1','window2','sill1','sill2'],
  treasure:['inside','coin0','coin1','coin2','coin3','coin4','band1','band2','lock'],
};
export const dotFeatureShapes=pageId=>features[getScene(pageId).id].map(id=>getScene(pageId).shapes.find(shape=>shape.id===id));
export function dotBoard(session,{hint=false}={}){
  const scene=getScene(session.pageId),labels=dotLabels(session.points);
  const details=dotFeatureShapes(scene.id).map(shape=>`<${shape.tag} ${Object.entries(shape.attrs).map(([key,value])=>`${key}="${escapeHTML(value)}"`).join(' ')} fill="none"/>`).join('');
  const contour=scene.dots.map(point=>point.join(',')).join(' ');
  return `<svg viewBox="0 0 600 440" data-dot-board="true" role="group" aria-label="${session.complete?'Your finished '+escapeHTML(scene.short.toLowerCase())+' drawing':'Connect the numbered dots in order'}"><defs><clipPath id="dot-interior-${scene.id}"><polygon points="${contour}"/></clipPath></defs><g class="dot-details" aria-hidden="true" pointer-events="none">${details}<g clip-path="url(#dot-interior-${scene.id})">${scene.details}</g></g><polyline data-dot-trace points="${session.trace.map(point=>point.join(',')).join(' ')}" fill="none" stroke="#7443cd" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>${session.points.map(([x,y],i)=>{
    const next=!session.complete&&i+1===session.next,connected=i<session.connected&&!next;
    return `<g data-dot="${i+1}" role="button" tabindex="${connected||session.complete?-1:0}" aria-label="Dot ${i+1}${session.closing&&i===0?', close the outline':connected?', connected':''}" aria-disabled="${connected||session.complete}" class="number-dot ${connected?'connected':''} ${next?'next-dot-target':''} ${hint&&next?'hint-dot':''}"><circle cx="${x}" cy="${y}" r="${dotTargetRadius(session.points,i)}" fill="transparent"/><circle cx="${x}" cy="${y}" r="7"/><text x="${labels[i][0].toFixed(1)}" y="${labels[i][1].toFixed(1)}" text-anchor="middle" dominant-baseline="central">${i+1}</text></g>`;
  }).join('')}</svg>`;
}
