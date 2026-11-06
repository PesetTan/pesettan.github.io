"""Check migrated media links and keep large media out of website builds."""
import json
import posixpath
import re
from pathlib import Path
from urllib.parse import urlsplit

root = Path(__file__).resolve().parents[1]
config = json.loads((root / 'media-hosting.json').read_text())
base = config['baseUrl']
assets = {item['path'] for item in config['assets']}
local = set(config['localIcons'])
media = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.mp4', '.webm'}
pattern = re.compile(r'''["'`(]([^"'`\s<>)]*)''')
checked = 0
for folder in ['family', 'docs']:
    for p in (root / folder).rglob('*'):
        if not p.is_file():
            continue
        rel = p.relative_to(root / folder).as_posix()
        if p.suffix.lower() in media:
            assert rel in local, f'Media was copied back into website: {p}'
        if p.suffix not in {'.html', '.css', '.js', '.mjs', '.json'}:
            continue
        text = p.read_text()
        for match in pattern.finditer(text):
            if text[max(0, match.start() - 10):match.start()].endswith('download='):
                continue
            url = match[1]
            parsed = urlsplit(url)
            if url.startswith(base):
                asset = urlsplit(url[len(base):]).path
                if '${' not in asset:
                    assert asset in assets, f'Unknown hosted asset: {p}: {url}'
                    checked += 1
                continue
            if p.name == 'seasons.js' and '/' not in url and url.endswith('.webp'):
                assert 'assets/seasons/' + url in assets
                continue
            if p.suffix in {'.js', '.mjs'} and text[max(0, match.start() - 12):match.start()].endswith(('.endsWith', '.endsWith(')):
                continue
            if parsed.scheme or parsed.netloc or '${' in url:
                continue
            if Path(parsed.path).suffix.lower() not in media:
                continue
            target = parsed.path.lstrip('/') if parsed.path.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(rel), parsed.path))
            assert target in local, f'Media still points to website repository: {p}: {url}'
print(f'Validated {checked} hosted media references; only small browser icons remain in website files.')
