from playwright.sync_api import sync_playwright,expect
import json
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':900})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    state={'version':1,'theme':'dino','sound':False,'assessed':True,'lessons':list(range(8)),'learned':list('abcdefghijklmnopqrstuvwx'),'mistakes':{'b':3},'assessment':{},'stickers':[],'session':None}
    page.add_init_script('localStorage.setItem("letter-explorers-v1",'+json.dumps(json.dumps(state))+')')
    page.goto('http://127.0.0.1:5173',wait_until='networkidle')
    page.locator('[data-action="start"]').click()
    # Last two new letters plus one previously difficult letter.
    for _ in range(3):page.locator('[data-action="learn-next"]').click()
    for c in 'yzb':
        page.locator(f'[data-action="pair"][data-value="{c}"]').click();page.wait_for_timeout(500)
    for c in 'yzb':page.keyboard.press(c);page.wait_for_timeout(500)
    for _ in range(2):
        word=''.join(page.locator('.word-letters>span').all_text_contents())
        for c in word:page.keyboard.press(c)
        page.wait_for_timeout(1200)
    expect(page.locator('.completion')).to_be_visible()
    stored=page.evaluate('JSON.parse(localStorage.getItem("letter-explorers-v1"))')
    assert len(stored['lessons'])==9 and len(stored['learned'])==26
    page.locator('[data-action="finish"]').click()
    expect(page.locator('.mission h2')).to_have_text('所有字母都见过啦')
    assert not errors,errors
    print('PASS: last lesson y/z, one weak-letter review, all 26 learned, all 9 lessons completed.')
    browser.close()
