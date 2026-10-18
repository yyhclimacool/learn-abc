"""Generate deterministic outlines from the bundled OFL Andika font."""
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from pathlib import Path
import json
root = Path(__file__).resolve().parents[1]
font = TTFont(root / 'node_modules/@fontsource/andika/files/andika-latin-400-normal.woff2')
glyphset = font.getGlyphSet()
cmap = font.getBestCmap()
result = {'_xHeight': font['OS/2'].sxHeight}
for c in 'abcdefghijklmnopqrstuvwxyz':
    name = cmap[ord(c)]
    pen = SVGPathPen(glyphset)
    glyphset[name].draw(pen)
    result[c] = {'path': pen.getCommands(), 'advance': font['hmtx'][name][0]}
(root / 'src/glyphs.json').write_text(json.dumps(result), encoding='utf-8')
print('Generated 26 outlines; x-height:', result['_xHeight'])
