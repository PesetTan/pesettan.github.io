import { cp, mkdir, copyFile } from 'node:fs/promises';
await mkdir('docs', { recursive: true });
await cp('family', 'docs', { recursive: true });
await copyFile('public/CNAME', 'docs/CNAME');
