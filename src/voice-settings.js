import { narratorVoices, chooseNarrator, readVoice, writeVoice, DEFAULT_VOICE, PACES } from './voice-preferences.js';

export function mountVoiceSettings(audio,{anchor,onOpen=()=>{},onClose=()=>{},description}={}){
  if(!anchor)return;
  const button=document.createElement('button');button.type='button';button.className='voice-open';button.setAttribute('aria-label','Choose a narrator voice');button.innerHTML='<span aria-hidden="true">♬</span><span>Voice</span>';
  anchor.insertAdjacentElement('beforebegin',button);
  const dialog=document.createElement('dialog');dialog.className='voice-dialog';dialog.setAttribute('aria-labelledby','voice-title');
  dialog.innerHTML=`<form method="dialog"><div class="voice-heading"><div><p>MAKE IT SOUND LIKE AN ADVENTURE</p><h2 id="voice-title">Meet your narrator</h2></div><button class="voice-close" value="close" aria-label="Close voice choices">×</button></div><p class="voice-intro">Pick a voice you enjoy. It’ll join you in every game.</p><label class="voice-label" for="narrator-voice">Who’s coming along?</label><select id="narrator-voice"></select><p class="voice-choice-note" id="voice-choice-note"></p><fieldset class="voice-paces"><legend>Choose the pace</legend>${Object.entries(PACES).map(([id,pace])=>`<label><input type="radio" name="narrator-pace" value="${id}"><span>${pace.label}</span></label>`).join('')}</fieldset><div class="voice-demo"><span aria-hidden="true">✦</span><p>“Hello, Dhruva! Ready for a little adventure? Let’s discover something wonderful together!”</p></div><div class="voice-actions"><button type="button" class="voice-preview">▶ Hear this voice</button><button type="button" class="voice-stop">■ Stop</button></div><p id="voice-status" role="status"></p><p class="voice-device-note">Voices come from this device and browser. Natural or enhanced voices are preferred when available.</p><button class="voice-done" value="done">Let’s play →</button></form>`;
  document.body.append(dialog);
  if(description)dialog.querySelector('.voice-intro').textContent=description;
  const select=dialog.querySelector('select'),note=dialog.querySelector('#voice-choice-note'),status=dialog.querySelector('#voice-status'),preview=dialog.querySelector('.voice-preview');
  let choices=[],previewVersion=0;
  const stopPreview=()=>{previewVersion++;audio.stop();status.textContent='';};
  const render=()=>{
    const preference=audio.voicePreference||readVoice(),synth=window.speechSynthesis;
    choices=narratorVoices(synth?.getVoices?.()||[]);
    select.replaceChildren();
    const recommended=chooseNarrator(choices),automatic=document.createElement('option');automatic.value='auto';automatic.textContent=recommended?`Recommended · ${recommended.name}`:'Automatic voice';select.append(automatic);
    choices.forEach((voice,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=`${voice.name} · ${voice.lang}`;select.append(option);});
    const chosen=choices.findIndex(voice=>(preference.voiceURI&&voice.voiceURI===preference.voiceURI)||(preference.name&&voice.name===preference.name&&voice.lang===preference.lang));
    select.value=chosen>=0?String(chosen):'auto';
    select.disabled=!choices.length;
    const available=Boolean(synth&&window.SpeechSynthesisUtterance);preview.disabled=!available;
    note.textContent=!available?'Spoken voices aren’t available in this browser. The games still work with written prompts.':!choices.length?'No voice list is available yet. You can try the browser’s automatic voice.':(preference.voiceURI||preference.name)&&chosen<0?'Your saved voice isn’t on this device, so we’ve chosen another one.':`${choices.length} narrator ${choices.length===1?'voice':'voices'} available. Preview a few to find your favourite.`;
    dialog.querySelectorAll('[name=narrator-pace]').forEach(input=>{input.checked=input.value===preference.pace;});
  };
  const save=()=>{
    stopPreview();const preference=audio.voicePreference||readVoice(),voice=select.value==='auto'?null:choices[Number(select.value)];
    const value={...DEFAULT_VOICE,...(voice?{voiceURI:voice.voiceURI,name:voice.name,lang:voice.lang}:{}),pace:dialog.querySelector('[name=narrator-pace]:checked')?.value||preference.pace};
    const saved=writeVoice(value);
    audio.voicePreference=saved?null:value;
    status.textContent=saved?'Voice saved for all your games.':'This voice works for this visit. This browser couldn’t remember it for next time.';
  };
  button.addEventListener('click',()=>{audio.stop();onOpen();render();dialog.showModal();});
  dialog.addEventListener('change',save);
  preview.addEventListener('click',()=>{
    const version=++previewVersion;status.textContent='Getting your voice ready…';
    audio.speak('Hello, Dhruva! Ready for a little adventure? Let’s discover something wonderful together!',{preview:true,onStatus:state=>{
      if(version!==previewVersion||!dialog.open)return;
      status.textContent=({speaking:'Have a listen…',finished:'Like that one? Your choice is ready for every game.',error:'That voice couldn’t play. Try another voice or turn on your device’s sound.',unavailable:'Spoken voices aren’t available in this browser.',stopped:'Preview stopped.'})[state]||'';
    }});
  });
  dialog.querySelector('.voice-stop').addEventListener('click',stopPreview);
  dialog.addEventListener('close',()=>{stopPreview();onClose();button.focus({preventScroll:true});});
  window.speechSynthesis?.addEventListener?.('voiceschanged',()=>{if(dialog.open)render();});
  return dialog;
}
