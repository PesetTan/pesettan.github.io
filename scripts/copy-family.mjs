import { cp, mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
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

const header = (await readFile(new URL('components/family-header.html', import.meta.url), 'utf8')).trimEnd();
const placeholder = '<template id="family-header"></template>';
const familyPages = [
  'index.html',
  'alyna/index.html',
  'daisy/index.html',
  'memorial/index.html',
  'memorial/kimkoeut/index.html',
  'sam/resume/index.html',
];

for (const page of familyPages) {
  const output = path.join('docs', page);
  const html = await readFile(output, 'utf8');
  if (html.split(placeholder).length !== 2) {
    throw new Error(`Expected one family header placeholder in ${output}`);
  }
  await writeFile(output, html.replace(placeholder, header));
}
