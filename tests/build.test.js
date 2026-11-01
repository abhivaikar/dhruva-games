import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { versionAssets } from '../scripts/version-assets.mjs';

test('published HTML, CSS and every nested module use the same release, and dependency changes invalidate cached URLs',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'dhruva-assets-'));
  try{
    const build=async(value=1)=>{
      await mkdir(join(directory,'src/club'),{recursive:true});
      await writeFile(join(directory,'index.html'),'<link rel="stylesheet" href="./club.css"><script type="module" src="./src/club/hub.js"></script><a href="./activity.html?game=dots">Dots</a><img src="./assets/club.svg">');
      await writeFile(join(directory,'club.css'),'.icon { background:url(./assets/club.svg); }');
      await writeFile(join(directory,'src/club/hub.js'),"import { voice } from '../audio.js';\nimport './dots.js';");
      await writeFile(join(directory,'src/audio.js'),`export const voice=${value};`);
      await writeFile(join(directory,'src/club/dots.js'),"import { voice } from '../audio.js';");
      return versionAssets(directory);
    };
    const first=await build(),html=await readFile(join(directory,'index.html'),'utf8');
    assert.ok(html.includes(`./club.css?v=${first}`));assert.ok(html.includes(`./src/club/hub.js?v=${first}`));
    assert.ok(html.includes('./activity.html?game=dots'));assert.ok(html.includes('./assets/club.svg'));
    assert.ok((await readFile(join(directory,'src/club/hub.js'),'utf8')).includes(`../audio.js?v=${first}`));
    assert.ok((await readFile(join(directory,'src/club/hub.js'),'utf8')).includes(`./dots.js?v=${first}`));
    assert.ok((await readFile(join(directory,'src/club/dots.js'),'utf8')).includes(`../audio.js?v=${first}`));
    assert.equal(await build(),first,'unchanged builds have stable asset URLs');
    assert.notEqual(await build(2),first,'changing a dependency must invalidate the entry and its whole graph');
  }finally{await rm(directory,{recursive:true,force:true});}
});
