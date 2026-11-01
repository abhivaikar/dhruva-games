import { normaliseArtwork, freshArtwork } from './activity-model.js';
import { getScene } from './activity-scenes.js';
const DRAFT_KEY='dhruva-colouring-draft-v1';
const storageFor=storage=>storage||globalThis.localStorage;
export function writeDraft(art,storage){
  try{storageFor(storage).setItem(DRAFT_KEY,JSON.stringify({art:normaliseArtwork(art)}));return true;}catch{return false;}
}
export function readDraft(storage){
  try{const saved=JSON.parse(storageFor(storage).getItem(DRAFT_KEY)),art=normaliseArtwork(saved?.art);return art?{art}:null;}catch{return null;}
}
/** Resume the current picture on refresh without overriding a different picture selection. */
export function openArtwork({draft=null,pageId=null}={}){
  const page=pageId?getScene(pageId).id:null;
  const art=normaliseArtwork(draft&&(!page||draft.art?.pageId===page)?draft.art:null)||freshArtwork(page||'train');
  return {art,dirty:Object.keys(art.fills).length+art.strokes.length+art.stamps.length>0};
}
