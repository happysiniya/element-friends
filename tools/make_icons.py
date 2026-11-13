"""앱 아이콘(icon-192.png, icon-512.png) 만들기

실행 (프로젝트 폴더에서):  python tools/make_icons.py

앨범 표지 파랑 바탕에 1번 수소 스티커를 붙인 그림을 HTML로 그리고,
Playwright + 설치된 Chrome으로 찍어요. 휴대폰이 아이콘을 동그랗게 잘라도 괜찮도록
(maskable) 스티커는 가운데 안전 영역(지름 80%) 안에 둬요.
"""
import os

from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HTML = """<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap" rel="stylesheet">
<style>
  html, body { margin: 0; width: 512px; height: 512px; overflow: hidden; }
  body {
    display: flex; align-items: center; justify-content: center;
    background-color: #2D3FA6;
    background-image: radial-gradient(rgba(255,255,255,.13) 3px, transparent 3.5px);
    background-size: 36px 36px;
  }
  .sticker {
    position: relative; overflow: hidden;
    width: 236px; height: 262px; box-sizing: border-box;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: #4FC8F2; border: 18px solid #fff; border-radius: 40px;
    box-shadow: 0 4px 0 2px rgba(15, 20, 60, .35), 0 14px 24px rgba(10, 15, 50, .35);
    transform: rotate(-7deg);
    font-family: "Black Han Sans", sans-serif; color: #1D2340;
  }
  .sticker::after {  /* 반짝이 빛 */
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(120deg, rgba(255,60,190,.5) 0%, rgba(60,210,255,.5) 25%,
      rgba(255,255,255,.95) 42%, rgba(255,235,60,.55) 56%, rgba(60,255,170,.5) 74%, rgba(170,90,255,.5) 100%);
    mix-blend-mode: overlay;
  }
  .no { position: absolute; top: 14px; left: 20px; font-size: 34px; z-index: 1; }
  .sym { font-size: 170px; line-height: 1; margin-top: 18px; z-index: 1; }
  .star { position: absolute; top: 4px; right: 12px; font-size: 44px; color: #FFC531; z-index: 1;
          text-shadow: 0 2px 0 rgba(0,0,0,.15); }
</style></head>
<body><div class="sticker"><span class="no">1</span><span class="star">★</span><span class="sym">H</span></div></body></html>"""

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    for size in (512, 192):
        page = browser.new_page(viewport={"width": 512, "height": 512},
                                device_scale_factor=size / 512)
        page.set_content(HTML)
        page.wait_for_load_state("networkidle")
        page.evaluate("document.fonts.ready")
        path = os.path.join(ROOT, f"icon-{size}.png")
        page.screenshot(path=path)
        print("saved", path)
        page.close()
    browser.close()
