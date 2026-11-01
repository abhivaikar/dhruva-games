import { SCENES, artworkSVG, svgURL, escapeHTML } from './activity-scenes.js';
import { THEMES, libraryPage, LIBRARY_PAGE_SIZE } from './activity-library.js';

export function pickerResults(state,{selected,attribute,coloured=false}={}){
  const {scenes,total,page,pages}=libraryPage(state);
  const noun=total===1?'picture':'pictures';
  return `<div class="library-result-top"><p role="status">${total?`${page*LIBRARY_PAGE_SIZE+1}–${Math.min((page+1)*LIBRARY_PAGE_SIZE,total)} of ${total} ${noun}`:'No pictures found'}</p><span>PICK YOUR NEXT ADVENTURE</span></div><div class="library-grid" role="group" aria-label="Choose a picture">${scenes.map(item=>{
    const scene=item,art={pageId:scene.id},label=`${scene.short} picture`,value=scene.id;
    return `<button type="button" class="library-card" ${attribute}="${value}" aria-label="${escapeHTML(label)}" aria-pressed="${selected===value}"><img src="${svgURL(artworkSVG(art,{coloured}))}" alt="" loading="lazy"><span>${escapeHTML(scene.short)}</span><small>${escapeHTML(THEMES.find(theme=>theme.id===scene.theme).name)}</small><i aria-hidden="true">${selected===value?'✓':'+'}</i></button>`;
  }).join('')}</div>${!total?`<div class="library-empty"><span aria-hidden="true">🔎</span><p>Try another word or choose a different world.</p><button type="button" class="activity-secondary" data-library-reset>Show all pictures</button></div>`:''}${pages>1?`<nav class="library-pagination" aria-label="Picture library pages"><button type="button" class="activity-secondary" data-library-move="-1" ${page===0?'disabled':''}>← Previous</button><span>Page ${page+1} of ${pages}</span><button type="button" class="activity-secondary" data-library-move="1" ${page===pages-1?'disabled':''}>Next pictures →</button></nav>`:''}`;
}
export function picturePicker(state,options){
  return `<section class="picture-library" aria-label="Picture library"><div class="library-controls"><label class="library-search"><span>Find a picture</span><input type="search" data-library-search placeholder="Try bus, dragon or cupcake…" value="${escapeHTML(state.query)}" autocomplete="off"></label><p><strong>${SCENES.length}</strong> pictures<br><span>6 worlds to explore</span></p></div><div class="library-themes" role="group" aria-label="Picture themes">${[{id:'all',name:'All pictures',icon:'🌈'},...THEMES].map(theme=>`<button type="button" data-library-theme="${theme.id}" aria-pressed="${state.theme===theme.id}"><span aria-hidden="true">${theme.icon}</span> ${theme.name} <small>${theme.id==='all'?SCENES.length:SCENES.filter(scene=>scene.theme===theme.id).length}</small></button>`).join('')}</div><div data-library-results>${pickerResults(state,options)}</div></section>`;
}
