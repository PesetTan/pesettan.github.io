"""Generate delivery WebP copies; retain the original PNG artwork.

Requires Pillow: python3 -m pip install Pillow
Run from any directory: python3 scripts/optimize-artwork.py
"""
from pathlib import Path
from PIL import Image, ImageChops

assets = Path(__file__).resolve().parents[1] / 'family' / 'assets' / 'seasons'
for name in ('spring', 'summer', 'autumn', 'winter', 'cumulus', 'winter-clouds'):
    source = assets / f'{name}.png'
    target = source.with_suffix('.webp')
    with Image.open(source) as original:
        original.save(target, 'WEBP', quality=95 if original.mode == 'RGBA' else 92,
                      method=6, exact=True)
        with Image.open(target) as encoded:
            assert encoded.size == original.size, f'{name}: framing changed'
            if original.mode == 'RGBA':
                assert encoded.mode == 'RGBA', f'{name}: transparency lost'
                assert ImageChops.difference(original.getchannel('A'),
                                             encoded.getchannel('A')).getbbox() is None, f'{name}: alpha changed'
    assert target.stat().st_size < source.stat().st_size, f'{name}: no size reduction'
    print(f'{name}: {source.stat().st_size:,} → {target.stat().st_size:,} bytes')
