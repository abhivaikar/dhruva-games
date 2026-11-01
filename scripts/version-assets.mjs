import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative, extname } from 'node:path';

// Version the whole module graph together: versioning only the entry script
// would still let a browser reuse incompatible cached dependency modules.
export async function versionAssets(directory){
  const files=[];
  async function visit(path){
    for(const entry of await readdir(path,{withFileTypes:true})){
      const child=join(path,entry.name);
      if(entry.isDirectory())await visit(child);
      else if(['.html','.js','.css'].includes(extname(child)))files.push(child);
    }
  }
  await visit(directory);files.sort();
  const sources=await Promise.all(files.map(async path=>({path,text:await readFile(path,'utf8')})));
  const hash=createHash('sha256');
  for(const source of sources)hash.update(relative(directory,source.path)).update('\0').update(source.text).update('\0');
  const version=hash.digest('hex').slice(0,16);
  for(const source of sources){
    let text=source.text;
    if(extname(source.path)==='.html')text=text.replace(/\b(src|href)=(['"])(\.\/?[^'"?#]+\.(?:js|css))\2/g,(_,attribute,quote,path)=>`${attribute}=${quote}${path}?v=${version}${quote}`);
    if(extname(source.path)==='.js')text=text.replace(/(\b(?:from|import)\s*)(['"])(\.{1,2}\/[^'"?#]+\.js)\2/g,(_,prefix,quote,path)=>`${prefix}${quote}${path}?v=${version}${quote}`);
    if(text!==source.text)await writeFile(source.path,text);
  }
  return version;
}
