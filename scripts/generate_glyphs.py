"""Bundle the unmodified Patrick Hand font and derive all 26 worksheet outlines."""
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from pathlib import Path
import json
import shutil
root = Path(__file__).resolve().parents[1]
source = root / 'node_modules/@fontsource/patrick-hand'
font_path = source / 'files/patrick-hand-latin-400-normal.woff2'
shutil.copyfile(font_path, root / 'public/fonts/patrick-hand-400.woff2')
shutil.copyfile(source / 'LICENSE', root / 'public/fonts/Patrick-Hand-OFL.txt')
font = TTFont(font_path)
glyphset, cmap = font.getGlyphSet(), font.getBestCmap()
result = {'_xHeight': font['OS/2'].sxHeight}
for c in 'abcdefghijklmnopqrstuvwxyz':
    name = cmap[ord(c)]
    pen = SVGPathPen(glyphset)
    glyphset[name].draw(pen)
    result[c] = {'path': pen.getCommands(), 'advance': font['hmtx'][name][0]}
(root / 'src/glyphs.json').write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8')
print('Bundled Patrick Hand and generated all 26 matching worksheet outlines.')
