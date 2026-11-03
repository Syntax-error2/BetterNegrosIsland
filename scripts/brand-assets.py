"""Export the existing logo system. No tracing or generative artwork.
Run: uv run --with pillow python scripts/brand-assets.py
SVGs embed the supplied raster; only the wordmark region receives a light fill.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops
import base64
import json

root = Path(__file__).resolve().parents[1]
brand = root / 'public/brand'
original = Image.open(brand / 'bni-regional-wordmark.png').convert('RGBA')
runtime = original.resize((788,264), Image.Resampling.LANCZOS)
runtime.save(brand / 'logo-primary.webp', lossless=True, exact=True, method=6)
converted = Image.open(brand / 'logo-primary.webp').convert('RGBA')
assert runtime.tobytes() == converted.tobytes(), 'Lossless encoding must preserve every exported RGBA pixel'
encoded = base64.b64encode((brand / 'logo-primary.webp').read_bytes()).decode()
image = f'<image id="source" width="2167" height="726" href="data:image/webp;base64,{encoded}"/>'
# This boundary follows the gap between the landscape and the existing letters.
# It leaves the sun, cane, hills, water and navy tagline banner unchanged.
wordmark = 'M730 0H2167V550H710V320H730Z'
light = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2167 726" width="2167" height="726">
<title>BetterNegrosIsland — light wordmark for dark backgrounds</title>
<defs>{image}<clipPath id="letters"><path d="{wordmark}"/></clipPath><clipPath id="landscape"><path d="M0 0H2167V726H0Z{wordmark}" clip-rule="evenodd"/></clipPath><filter id="light" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%"><feFlood flood-color="#f4f8ff"/><feComposite in2="SourceAlpha" operator="in"/></filter></defs>
<use href="#source" clip-path="url(#landscape)"/><g clip-path="url(#letters)"><use href="#source" filter="url(#light)"/></g></svg>'''
(brand / 'logo-light.svg').write_text(light, encoding='utf-8')
# Compact emblem is a crop of the supplied landscape, excluding text and banner.
mark = original.crop((0, 0, 730, 660))
mask = Image.new('L', mark.size, 0)
ImageDraw.Draw(mask).polygon([(0,0),(730,0),(730,305),(710,320),(710,450),(660,466),(600,500),(550,535),(500,565),(460,615),(440,660),(0,660)], fill=255)
mark.putalpha(ImageChops.multiply(mark.getchannel('A'), mask))
mark.save(brand / 'logo-mark.webp', lossless=True, exact=True, method=6)
for size in [32, 180]:
    square = Image.new('RGBA', (size, size))
    fit = mark.copy()
    fit.thumbnail((size, size), Image.Resampling.LANCZOS)
    square.alpha_composite(fit, ((size-fit.width)//2, (size-fit.height)//2))
    square.save(brand / f'favicon-{size}.png', optimize=True)
report = {'source': 'bni-regional-wordmark.png', 'size': original.size, 'mode': original.mode,
          'alpha_bbox': original.getbbox(), 'corner_alpha': [original.getpixel(p)[3] for p in [(0,0),(2166,0),(0,725),(2166,725)]],
          'runtime_size': runtime.size, 'runtime_aspect_ratio_identical': original.width * runtime.height == original.height * runtime.width,
          'runtime_export_rgba_pixel_equal': True, 'primary_is_source_pixel_identical': False,
          'light_variant': 'SVG raster wrapper with region-limited light wordmark fill; not a vector trace',
          'artifacts': 'Original PNG retained unchanged. Proportional Lanczos runtime resampling; no tracing or generative redraw.',
          'files': {p.name: p.stat().st_size for p in brand.iterdir() if p.name.startswith(('logo-', 'favicon-'))}}
(root / 'docs/qa/master-layout/brand-assets.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
