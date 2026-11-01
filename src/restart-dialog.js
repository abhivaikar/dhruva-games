// Restarts affect the current adventure only; saved achievements are never cleared.
export function mountRestart({title='Start this adventure again?',detail='Go back to the beginning. Your saved discoveries will stay.',onOpen=()=>{},onRestart,onCancel=()=>{}}){
  const dialog=document.createElement('dialog');
  dialog.className='restart-dialog';
  const heading=document.createElement('h2'),copy=document.createElement('p');
  heading.id='restart-title';heading.textContent=title;copy.textContent=detail;
  dialog.setAttribute('aria-labelledby',heading.id);
  const actions=document.createElement('div');actions.className='restart-dialog-actions';
  const keep=document.createElement('button'),restart=document.createElement('button');
  keep.type=restart.type='button';keep.textContent='Keep playing';restart.textContent='↺ Start again';
  restart.className='restart-confirm';actions.append(keep,restart);dialog.append(heading,copy,actions);document.body.append(dialog);
  let confirmed=false,opener=null;
  keep.addEventListener('click',()=>dialog.close());
  restart.addEventListener('click',()=>{confirmed=true;dialog.close();});
  dialog.addEventListener('close',()=>{
    if(confirmed)onRestart();else{onCancel();if(opener?.isConnected)opener.focus({preventScroll:true});}
  });
  return {open(){if(dialog.open)return;opener=document.activeElement;confirmed=false;onOpen();dialog.showModal();keep.focus();},get openNow(){return dialog.open;}};
}
