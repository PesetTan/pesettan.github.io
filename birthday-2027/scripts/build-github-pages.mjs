import { build } from 'vite';
import { readFile, writeFile, copyFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

// Reuse the invitation and RSVP components for the static GitHub Pages frontend.
// Its API, protected host dashboard, and existing D1 data stay on Sites.
const root = fileURLToPath(new URL('..', import.meta.url));
const base = '/alyna/birthday-2027/';
const common = {
  configFile: false,
  publicDir: false,
  resolve: { alias: { '@': root } },
  define: { 'process.env.NODE_ENV': '"production"' },
};
await build({
  ...common, root,
  build: { ssr: 'github-pages/render.tsx', outDir: 'github-render', emptyOutDir: true },
});
const { render } = await import(pathToFileURL(path.join(root, 'github-render/render.js')).href);
await build({
  ...common, root: path.join(root, 'github-pages'), base,
  build: { outDir: path.join(root, 'github-dist'), emptyOutDir: true },
});
const destination = path.join(root, 'github-dist');
const css = (await readFile(path.join(root, 'app/birthday.css'), 'utf8'))
  .replace("@import url('/fonts/fonts.css');", "@import url('./fonts/fonts.css');");
await writeFile(path.join(destination, 'birthday.css'), css);
await mkdir(path.join(destination, 'fonts'), { recursive: true });
// Fonts must be same-origin: the media service does not emit font CORS headers.
const fonts = (await readFile(path.join(root, 'public/fonts/fonts.css'), 'utf8'))
  .replaceAll('url(/fonts/', 'url(./');
await writeFile(path.join(destination, 'fonts/fonts.css'), fonts);
for (const font of await readdir(path.join(root, 'public/fonts'))) {
  if (font !== 'fonts.css') await copyFile(path.join(root, 'public/fonts', font), path.join(destination, 'fonts', font));
}
const index = path.join(destination, 'index.html');
await writeFile(index, (await readFile(index, 'utf8')).replace('<!--birthday-markup-->', render()));
console.log(`GitHub Pages invitation built for ${base}`);
