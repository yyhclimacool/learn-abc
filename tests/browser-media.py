from playwright.sync_api import sync_playwright,expect
from pathlib import Path
import fitz
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':950})
    errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    page.add_init_script('''{
      const NativeAudio=window.Audio;
      window.playedLetters=[];window.endedLetters=[];
      window.Audio=function(src){
        const audio=new NativeAudio(src);
        audio.addEventListener('playing',()=>window.playedLetters.push(src));
        audio.addEventListener('ended',()=>window.endedLetters.push(src));
        return audio;
      };
    }''')
    page.goto('http://127.0.0.1:5173/#letters',wait_until='networkidle')
    for c in ['p','b','a','i','j']:
        page.locator(f'[data-action="select-letter"][data-value="{c}"]').click()
        page.wait_for_function('(c)=>window.endedLetters.includes(`/audio/letters/${c}.wav`)',arg=c)
    page.locator('[data-action="select-letter"][data-value="l"]').click()
    page.evaluate('document.fonts.ready')
    assert page.locator('.alphabet-tile.active').evaluate('(el)=>getComputedStyle(el).fontFamily').startswith('"Patrick Hand"')
    page.screenshot(path='.artifacts/handwriting-l.png',full_page=True)
    page.get_by_role('link',name='家长中心').click()
    page.locator('[data-action="select-none"]').click()
    for c in 'blp':page.locator(f'[data-action="toggle-print"][data-value="{c}"]').click()
    page.locator('[data-action="preview-print"]').click()
    page.pdf(path='.artifacts/handwriting-b-l-p.pdf',format='A4',print_background=True,prefer_css_page_size=True)
    pdf=fitz.open('.artifacts/handwriting-b-l-p.pdf');assert len(pdf)==1
    pdf[0].get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save('.artifacts/handwriting-print.png')
    assert not errors,errors
    print('PASS: real p/b/a/i/j audio loads and plays to completion, handwriting font loads, l screen + b/l/p PDF generated without browser exceptions.')
    browser.close()
