import { normaliseArtwork, freshArtwork } from './activity-model.js';
import { getScene } from './activity-scenes.js';
const BOOK_KEY='dhruva-activity-book-v1',DRAFT_KEY='dhruva-colouring-draft-v1';
export const BOOK_LIMIT=18;
const storageFor = storage => storage || globalThis.localStorage;
const cleanPage=page=>{
  const art=normaliseArtwork(page?.art);
  if(!art || typeof page.id!=='string'||!/^[\w-]{1,80}$/.test(page.id))return null;
  return {id:page.id,art,created:Number.isFinite(page.created)?page.created:0};
};
export function readBook(storage){
  try{const pages=JSON.parse(storageFor(storage).getItem(BOOK_KEY));const seen=new Set();return (Array.isArray(pages)?pages:[]).slice(0,BOOK_LIMIT).map(cleanPage).filter(page=>{if(!page||seen.has(page.id))return false;seen.add(page.id);return true;});}catch{return [];}
}
export function savePage(art,id,storage){
  const clean=normaliseArtwork(art);if(!clean)return {ok:false,reason:'invalid'};
  const pages=readBook(storage),index=pages.findIndex(page=>page.id===id);
  if(index<0&&pages.length>=BOOK_LIMIT)return {ok:false,reason:'full'};
  const page={id:index>=0?id:`art-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`,art:clean,created:index>=0?pages[index].created:Date.now()};
  if(index>=0)pages[index]=page;else pages.unshift(page);
  try{storageFor(storage).setItem(BOOK_KEY,JSON.stringify(pages));return {ok:true,page};}catch{return {ok:false,reason:'storage'};}
}
export function removePage(id,storage){
  const pages=readBook(storage),page=pages.find(page=>page.id===id);if(!page)return {ok:false};
  try{storageFor(storage).setItem(BOOK_KEY,JSON.stringify(pages.filter(page=>page.id!==id)));return {ok:true,page};}catch{return {ok:false};}
}
export function restorePage(page,storage){
  const clean=cleanPage(page),pages=readBook(storage);if(!clean)return false;
  if(pages.some(item=>item.id===clean.id))return true;
  if(pages.length>=BOOK_LIMIT)return false;
  try{storageFor(storage).setItem(BOOK_KEY,JSON.stringify([clean,...pages]));return true;}catch{return false;}
}
export function writeDraft(art,id,storage){try{storageFor(storage).setItem(DRAFT_KEY,JSON.stringify({art:normaliseArtwork(art),id}));return true;}catch{return false;}}
export function readDraft(storage){try{const saved=JSON.parse(storageFor(storage).getItem(DRAFT_KEY));const art=normaliseArtwork(saved?.art);return art?{art,id:typeof saved.id==='string'?saved.id:null}:null;}catch{return null;}}

/** Prefer a matching in-progress draft so refreshing an editor never resets its colours. */
export function openArtwork({pages=[],draft=null,artId=null,pageId=null}={}){
  const saved=pages.find(page=>page.id===artId),page=pageId?getScene(pageId).id:null;
  const useDraft=draft&&(saved?draft.id===saved.id:page?draft.art.pageId===page:true);
  const art=normaliseArtwork(useDraft?draft.art:saved?.art)||freshArtwork(page||'train');
  const id=useDraft?draft.id:saved?.id||null,stored=pages.find(item=>item.id===id);
  const hasInk=Object.keys(art.fills).length+art.strokes.length+art.stamps.length>0;
  return {art,id,dirty:hasInk&&JSON.stringify(stored?.art)!==JSON.stringify(art)};
}
