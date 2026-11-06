import { cp, mkdir, copyFile, readFile } from 'node:fs/promises';
import path from 'node:path';
const media = JSON.parse(await readFile('media-hosting.json', 'utf8'));
const localIcons = new Set(media.localIcons);
const mediaExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.mp4', '.webm']);
await mkdir('docs', { recursive: true });
await cp('family', 'docs', {
  recursive: true,
  filter: source => !mediaExtensions.has(path.extname(source).toLowerCase()) || localIcons.has(path.relative('family', source).split(path.sep).join('/')),
});
await copyFile('public/CNAME', 'docs/CNAME');
