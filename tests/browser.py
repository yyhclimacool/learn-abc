"""Full user journeys, keyboard boundaries, reload persistence and print QA.
Run after npm run dev: .venv/bin/python tests/browser.py
"""
from playwright.sync_api import sync_playwright, expect
from pathlib import Path
from pypdf import PdfReader
import json
import unicodedata
OUT=Path('.artifacts');OUT.mkdir(exist_ok=True)
URL='http://127.0.0.1:5173'
KEY='letter-explorers-v1'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1000})
    errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    page.add_init_script('''window.__speech=[];window.__clips=[];window.Audio=class extends EventTarget{constructor(src){super();window.__clips.push(src);}play(){setTimeout(()=>this.dispatchEvent(new Event('ended')),10);return Promise.resolve();}pause(){}};window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};speechSynthesis.getVoices=()=>[{name:'Albert',lang:'en-US',localService:true},{name:'Samantha',lang:'en-US',localService:true},{name:'Tingting',lang:'zh-CN',localService:true}];speechSynthesis.speak=u=>{window.__speech.push({text:u.text,lang:u.lang,voice:u.voice?.name,rate:u.rate});setTimeout(()=>u.onend?.(),0);};speechSynthesis.cancel=()=>{};''')
    def click(action): page.locator('[data-action="'+action+'"]').click()
    def saved(): return page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',KEY)
    def stage(s): expect(page.locator('.stepper .current')).to_contain_text(s)
    page.goto(URL,wait_until='networkidle')
    page.screenshot(path=str(OUT/'home.png'),full_page=True)
    page.locator('[data-action="theme"][data-value="space"]').click()
    page.reload(wait_until='networkidle')
    expect(page.locator('[data-action="theme"][data-value="space"]')).to_have_attribute('aria-pressed','true')
    click('start')
    expect(page.get_by_role('dialog')).to_be_visible()
    # Wrong answers give guidance, then allow skipping; untested letters remain unknown.
    page.locator('[data-action="assessment-answer"][data-value="h"]').click()
    assert saved()['assessment']['a']=='review'
    click('assessment-next');click('skip-assessment')
    stage('认一认')
    assert 'b' not in saved()['assessment']
    for _ in range(3): click('learn-next')
    stage('配一配')
    for c in 'abc':
        page.locator(f'[data-action="pair"][data-value="{c}"]').click()
        page.wait_for_timeout(500)
    stage('找一找')
    page.keyboard.press('z')
    expect(page.locator('.key.lit')).to_have_text('A')
    assert saved()['mistakes']['a']==1
    page.wait_for_function("window.__clips.includes('/audio/letters/a.wav')")
    page.evaluate("window.dispatchEvent(new KeyboardEvent('keydown',{key:'a',repeat:true}))")
    assert saved()['session']['index']==0
    page.keyboard.press('Shift+A');page.wait_for_timeout(500)
    assert saved()['session']['index']==1
    page.reload(wait_until='networkidle')
    expect(page.locator('.key-target>.latin')).to_have_text('b')
    page.keyboard.press('b');page.wait_for_timeout(500)
    page.keyboard.press('c');page.wait_for_timeout(500)
    stage('拼一拼')
    page.screenshot(path=str(OUT/'game.png'),full_page=True)
    # Wrong key cannot consume a character.
    expected=page.locator('.word-letters .target').inner_text()
    page.keyboard.press('z' if expected!='z' else 'x')
    expect(page.locator('.word-letters .target')).to_have_text(expected)
    word=''.join(page.locator('.word-letters>span').all_text_contents())
    for c in word[:-1]:page.keyboard.press(c)
    page.keyboard.press(word[-1])
    # Navigation during celebration must commit the completed word and remain resumable.
    click('leave-game');click('start')
    stage('拼一拼')
    assert saved()['session']['wordIndex']==1
    word=''.join(page.locator('.word-letters>span').all_text_contents())
    for c in word:page.keyboard.press(c)
    expect(page.locator('.completion')).to_be_visible(timeout=5000)
    assert saved()['lessons']==[0] and len(saved()['stickers'])==1
    page.reload(wait_until='networkidle')
    expect(page.locator('.completion')).to_be_visible()
    assert len(saved()['stickers'])==1
    click('finish');click('start')
    assert saved()['session']['lesson']==1
    # Independent letter practice must preserve the ongoing lesson.
    page.get_by_role('link',name='认识字母').click()
    page.locator('[data-action="select-letter"][data-value="j"]').click()
    page.wait_for_function("window.__clips.includes('/audio/letters/j.wav')")
    page.locator('[data-action="select-letter"][data-value="g"]').click()
    page.screenshot(path=str(OUT/'letters.png'),full_page=True)
    click('practice-letter');page.keyboard.press('g');page.wait_for_timeout(500)
    click('leave-game');click('start')
    assert saved()['session']['lesson']==1 and saved()['session']['stage']=='learn'
    # Parent controls and selected print preview.
    page.get_by_role('link',name='家长中心').click()
    page.locator('#sound-toggle').uncheck()
    before=page.evaluate('window.__speech.length');click('test-audio')
    assert page.evaluate('window.__speech.length')==before
    page.locator('#sound-toggle').check()
    page.screenshot(path=str(OUT/'parents.png'),full_page=True)
    click('select-none')
    expect(page.locator('[data-action="preview-print"]')).to_be_disabled()
    click('select-all');click('preview-print')
    expect(page.locator('.worksheet')).to_have_count(9)
    page.pdf(path=str(OUT/'alphabet-worksheets.pdf'),format='A4',print_background=True,prefer_css_page_size=True)
    pdf=PdfReader(OUT/'alphabet-worksheets.pdf')
    assert len(pdf.pages)==9, f'Unexpected print pagination: {len(pdf.pages)}'
    assert all('我的字母练习纸' in unicodedata.normalize('NFKC',sheet.extract_text()) for sheet in pdf.pages)
    for i,sheet in enumerate(pdf.pages):
        text=unicodedata.normalize('NFKC',sheet.extract_text())
        assert f'{i+1} / 9' in text, (i,text)
        if i: assert f'{i} / 9' not in text, 'Previous footer overflowed into next page'
    # Responsive layouts cannot overflow horizontally.
    click('close-modal')
    for width in [390,768,1280]:
        page.set_viewport_size({'width':width,'height':900})
        for route in ['home','letters','game','parents']:
            page.goto(URL+'/#'+route,wait_until='networkidle')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(width,route)
        if width==390:
            page.goto(URL,wait_until='networkidle');page.screenshot(path=str(OUT/'mobile.png'),full_page=True)
    # Finish a full assessment in another browser profile.
    fresh=browser.new_page(viewport={'width':1280,'height':900});fresh.on('pageerror',lambda err:errors.append(str(err)))
    fresh.goto(URL,wait_until='networkidle');fresh.locator('[data-action="start"]').click()
    for c in ['a','b','d','e','g','h','m','n','p','q','r','t']:
        fresh.locator(f'[data-action="assessment-answer"][data-value="{c}"]').click()
        fresh.locator('[data-action="assessment-next"]').click()
    fresh.locator('[data-action="assessment-finish"]').click()
    for _ in range(3): fresh.locator('[data-action="learn-next"]').click()
    expect(fresh.locator('.pair-target')).to_have_text('c') # known a/b skip extra matching
    assert not errors, errors
    print('PASS: assessment, complete lesson, wrong/held/uppercase keys, progress recovery, interrupted word completion, practice isolation, sound toggle, 9-page A4 PDF, responsive layout, known-letter adaptation. No browser exceptions.')
    browser.close()
