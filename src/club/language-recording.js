// One optional practice recording in memory. Nothing is uploaded or saved in the book.
export class PracticeRecording {
  constructor({devices=globalThis.navigator?.mediaDevices,Recorder=globalThis.MediaRecorder,urls=globalThis.URL,BlobType=globalThis.Blob}={}){this.devices=devices;this.Recorder=Recorder;this.urls=urls;this.BlobType=BlobType;this.version=0;this.url=null;this.recorder=null;this.stream=null;this.timer=null;}
  get supported(){return Boolean(this.devices?.getUserMedia&&this.Recorder);}
  async start(onReady,onError){
    this.dispose();const version=this.version;
    if(!this.supported){onError();return;}
    try{
      const stream=await this.devices.getUserMedia({audio:true});
      if(version!==this.version){stream.getTracks().forEach(track=>track.stop());return;}
      this.stream=stream;const mime=['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(type=>this.Recorder.isTypeSupported?.(type));
      const recorder=new this.Recorder(stream,mime?{mimeType:mime}:undefined),chunks=[];let timer;this.recorder=recorder;
      recorder.ondataavailable=event=>{if(event.data?.size)chunks.push(event.data);};
      recorder.onstop=()=>{clearTimeout(timer);stream.getTracks().forEach(track=>track.stop());if(this.stream===stream)this.stream=null;if(version!==this.version)return;this.recorder=null;if(!chunks.length){onError();return;}this.url=this.urls.createObjectURL(new this.BlobType(chunks,{type:recorder.mimeType||mime||'audio/webm'}));onReady(this.url);};
      recorder.onerror=()=>{if(version===this.version){this.dispose();onError();}};
      recorder.start();this.timer=timer=setTimeout(()=>this.stop(),15000);
    }catch{if(version===this.version){this.dispose();onError();}}
  }
  stop(){if(this.recorder&&this.recorder.state!=='inactive')this.recorder.stop();}
  dispose(){this.version++;clearTimeout(this.timer);if(this.recorder&&this.recorder.state!=='inactive')this.recorder.stop();this.recorder=null;this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;if(this.url)this.urls.revokeObjectURL(this.url);this.url=null;}
}
