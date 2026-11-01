import { mkdir, cp, rm } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of ['index.html', 'activity.html', 'activity.css', 'play.html', 'mrt-adventure.html', 'club.css', 'treasure.css', 'styles.css', 'src', 'assets', '.nojekyll']) {
  await cp(new URL(path, root), new URL(path, output), { recursive: true });
}
console.log('Built Discovery Club and all nine static games in dist/ (no runtime dependencies).');
