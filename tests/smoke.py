from playwright.sync_api import sync_playwright
from pathlib import Path
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1440,"height":1050},device_scale_factor=1)
    page.on('pageerror',lambda err:print('PAGEERROR:',err))
    page.goto('http://127.0.0.1:5173',wait_until='networkidle')
    page.screenshot(path='.artifacts/home.png',full_page=True)
    print(page.locator('button').all_text_contents())
    page.get_by_role('link',name='认识字母').click()
    page.locator('[data-action="select-letter"][data-value="g"]').click()
    page.screenshot(path='.artifacts/letters.png',full_page=True)
    browser.close()
