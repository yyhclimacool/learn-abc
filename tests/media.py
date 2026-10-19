"""Validate shipped alphabet audio and the shared handwriting font/outline."""
from pathlib import Path
import wave,json,hashlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'public/audio/letters/manifest.json').read_text())
hashes=set()
for c in 'abcdefghijklmnopqrstuvwxyz':
    path=root/f'public/audio/letters/{c}.wav'
    with wave.open(str(path)) as audio:
        assert audio.getnchannels()==1 and audio.getsampwidth()==2
        rate=audio.getframerate();frames=audio.readframes(audio.getnframes())
        assert .4 < audio.getnframes()/rate < 4
        assert not any(frames[:int(rate*.18)*2]), f'{c}: missing onset buffer'
        assert any(frames[int(rate*.18)*2:]), f'{c}: empty clip'
    hashes.add(hashlib.sha256(path.read_bytes()).hexdigest())
assert len(hashes)==26, 'Unexpected duplicate audio'
assert manifest['p']['name']=='pee' and manifest['b']['name']=='bee'
font=TTFont(root/'public/fonts/patrick-hand-400.woff2')
assert font['name'].getDebugName(1)=='Patrick Hand'
reference=root/'node_modules/@fontsource/patrick-hand/files/patrick-hand-latin-400-normal.woff2'
assert (root/'public/fonts/patrick-hand-400.woff2').read_bytes()==reference.read_bytes()
outlines=json.loads((root/'src/glyphs.json').read_text())
for c in 'abcdefghijklmnopqrstuvwxyz':
    name=font.getBestCmap()[ord(c)]
    pen=SVGPathPen(font.getGlyphSet());font.getGlyphSet()[name].draw(pen)
    assert outlines[c]['path']==pen.getCommands(), f'{c}: worksheet differs from font'
print('PASS: 26 distinct nonempty WAVs, intact onset buffers, b/p mapping, unmodified Patrick Hand and all 26 matching worksheet outlines.')
