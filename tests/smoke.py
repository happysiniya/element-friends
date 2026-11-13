"""원소 친구 도감 화면 확인 (Playwright + 설치된 Chrome)

실행 (프로젝트 폴더 어디서든):
    python tests/smoke.py

폴더를 직접 작은 서버로 띄웠다가 끝나면 같이 꺼요 (빈 포트를 자동으로 골라요).
webapp-testing 스킬의 with_server.py는 Windows에서 서버를 셸로 띄워서, 끝난 뒤에도
http.server가 남아 포트를 막아요. 그래서 여기서는 쓰지 않아요.

스크린샷은 tests/screenshots/ 에 저장돼요. 오류가 있으면 종료 코드 1로 끝나요.
"""
import functools
import http.server
import json
import os
import sys
import threading

from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "tests", "screenshots")
os.makedirs(OUT, exist_ok=True)


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = http.server.ThreadingHTTPServer(
    ("127.0.0.1", 0), functools.partial(QuietHandler, directory=ROOT)
)
threading.Thread(target=server.serve_forever, daemon=True).start()
URL = f"http://127.0.0.1:{server.server_address[1]}/index.html"

# 스티커 상태를 골고루 보여 주는 기록: 빈 칸, 스티커, 반짝이
SEEDED = {
    "seen": list(range(1, 31)) + [47, 79, 80, 92],
    "friends": [1, 2, 6, 8, 11, 26, 79],
    "recipes": ["water", "nacl", "ch4"],
    "muted": True,
}
EMPTY = {"seen": [], "friends": [], "recipes": [], "muted": True}

errors = []
checks = []


def check(name, ok):
    checks.append((name, ok))
    print(("  OK   " if ok else "  FAIL ") + name)


def new_page(browser, progress, viewport):
    ctx = browser.new_context(viewport=viewport, device_scale_factor=1)
    # 소리를 끄고, 원하는 기록으로 시작해요
    ctx.add_init_script(
        "localStorage.setItem('element-friends-v1', %s);" % json.dumps(json.dumps(progress))
    )
    page = ctx.new_page()
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    page.on("console", lambda m: m.type == "error" and errors.append(f"console: {m.text}"))
    page.goto(URL)
    page.wait_for_load_state("networkidle")
    return ctx, page


def shot(page, name, full=False):
    page.screenshot(path=os.path.join(OUT, name + ".png"), full_page=full)


with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)

    # ---- 데스크톱: 주기율표와 카드 ----
    print("[desktop]")
    ctx, page = new_page(browser, SEEDED, {"width": 1280, "height": 900})
    check("118 cells", page.locator("#ptable .cell[data-n]").count() == 118)
    check("seen stickers", page.locator("#ptable .cell.seen").count() == len(SEEDED["seen"]))
    check("holo stickers", page.locator("#ptable .cell.friend").count() == len(SEEDED["friends"]))
    shot(page, "1-table", full=True)

    page.click('#ptable .cell[data-n="26"]')
    page.wait_for_timeout(300)
    check("card opens", page.locator("#card[open]").count() == 1)
    check("card is holo for friend", page.locator(".big-sticker.holo").count() == 1)
    shot(page, "2-card-holo")

    page.click("#card-close")
    check("cell 33 starts empty", "seen" not in page.get_attribute('#ptable .cell[data-n="33"]', "class"))
    page.click('#ptable .cell[data-n="33"]')  # 처음 보는 원소
    page.wait_for_timeout(700)
    check("new sticker badge", page.locator(".new-badge").count() == 1)
    shot(page, "3-card-new")
    page.click("#card-close")
    check("cell 33 became sticker", "seen" in page.get_attribute('#ptable .cell[data-n="33"]', "class"))

    # 카드 상하좌우 이동: 위아래는 같은 세로줄(가족)
    def sym_now():
        return page.inner_text(".big-sticker .bs-sym")

    def go(direction):
        page.click(f'#card .nav-btn[data-dir="{direction}"]')

    page.click('#ptable .cell[data-n="24"]')  # 크로뮴
    check("challenge button shown", page.inner_text("#card-challenge") == "✨ 반짝이 도전")
    check("down arrow previews Mo", page.inner_text('#card .nav-btn[data-dir="down"] .nsym') == "Mo")
    go("down"); check("Cr down -> Mo", sym_now() == "Mo")
    go("down"); check("Mo down -> W", sym_now() == "W")
    go("up"); go("up"); check("W up up -> Cr", sym_now() == "Cr")
    check("Cr has no up (3주기 6족은 비어 있음)", page.is_disabled('#card .nav-btn[data-dir="up"]'))
    page.click("#card-close")
    page.click('#ptable .cell[data-n="39"]')  # 이트륨
    go("down"); check("Y down -> La", sym_now() == "La")
    go("down"); check("La down -> Ac", sym_now() == "Ac")
    check("Ac has no down", page.is_disabled('#card .nav-btn[data-dir="down"]'))
    go("up"); go("up"); check("La up -> Y", sym_now() == "Y")
    page.click("#card-close")
    page.click('#ptable .cell[data-n="1"]')
    check("H has no up", page.is_disabled('#card .nav-btn[data-dir="up"]'))
    go("left"); check("H left wraps to Og", sym_now() == "Og")
    shot(page, "3b-card-nav")
    page.click("#card-close")

    # 반짝이 도전: 맞히면 반짝이
    page.click('#ptable .cell[data-n="34"]')
    page.click("#card-challenge")
    check("challenge shows card back", page.locator(".big-sticker.back").count() == 1)
    check("challenge hides nav", not page.is_visible("#card .card-nav"))
    page.wait_for_timeout(600)  # 뒤집기 애니메이션이 끝날 때까지
    shot(page, "3c-challenge")
    page.click('#card-body .choice[data-ok="1"]')
    page.wait_for_timeout(1500)
    check("challenge win -> holo card", page.locator(".big-sticker.holo").count() == 1)
    check("holo badge", "반짝이" in page.inner_text(".new-badge"))
    check("challenge button done", page.is_disabled("#card-challenge"))
    shot(page, "3d-challenge-won")
    page.click("#card-close")
    check("cell 34 is holo", "friend" in page.get_attribute('#ptable .cell[data-n="34"]', "class"))

    # 반짝이 도전: 틀리면 카드로 돌아가 다시
    page.click('#ptable .cell[data-n="35"]')
    page.click("#card-challenge")
    page.locator('#card-body .choice:not([data-ok])').first.click()
    check("challenge lose message", page.locator(".ch-fb .fb.bad").count() == 1)
    shot(page, "3e-challenge-lost")
    page.click("#ch-back")
    check("back to card, not holo", page.locator(".big-sticker.holo").count() == 0
          and page.is_visible("#card .card-nav"))
    page.click("#card-close")

    page.click('.legend-item[data-family="noble"]')
    check("family highlight", page.locator("#ptable .cell.hl").count() == 7)
    check("family description shown", "혼자가 좋아" in page.inner_text("#legend-desc"))
    page.click('.legend-item[data-family="noble"]')
    check("family description cleared", page.inner_text("#legend-desc").strip() == "")

    page.fill("#search", "Fe")
    check("search highlight", page.locator("#ptable .cell.hl").count() == 1)
    page.fill("#search", "")

    # ---- 퀴즈 ----
    page.click('.tab[data-view="quiz"]')
    shot(page, "4-quiz-setup")
    page.click("#quiz-start")
    for i in range(10):
        page.locator(".choice").first.click()
        if i == 0:
            shot(page, "5-quiz-answer")
        page.click("#q-next")
    check("quiz result", "문제 중" in page.inner_text(".quiz-result h2"))
    shot(page, "6-quiz-result")

    # ---- 요리사 ----
    page.click('.tab[data-view="kitchen"]')
    for s in ["H", "H", "O"]:
        page.click(f'.atom-btn[data-s="{s}"]')
    check("pot formula", page.inner_text("#pot-formula") == "H₂O")
    page.click("#pot-cook")
    check("cooked water", "물" in page.inner_text(".cooked-name"))
    for s in ["C", "O", "O"]:
        page.click(f'.atom-btn[data-s="{s}"]')
    shot(page, "7-kitchen", full=True)
    ctx.close()

    # ---- 처음 시작 (기록 없음) ----
    print("[empty]")
    ctx, page = new_page(browser, EMPTY, {"width": 1280, "height": 900})
    check("all empty slots", page.locator("#ptable .cell.seen").count() == 0)
    shot(page, "8-table-empty")
    ctx.close()

    # ---- 휴대폰 크기 ----
    print("[mobile]")
    ctx, page = new_page(browser, SEEDED, {"width": 412, "height": 900})
    check("no page overflow",
          page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"))
    shot(page, "9-mobile-table")
    page.click('#ptable .cell[data-n="8"]')
    page.wait_for_timeout(300)
    shot(page, "10-mobile-card")
    page.click("#card-close")
    page.click('.tab[data-view="quiz"]')
    page.click("#quiz-start")
    shot(page, "11-mobile-quiz")
    ctx.close()

    browser.close()

server.shutdown()
server.server_close()

for e in errors:
    print("  ERROR", e)
failed = [n for n, ok in checks if not ok]
print(f"\n{len(checks) - len(failed)}/{len(checks)} checks passed, {len(errors)} errors")
print("screenshots:", OUT)
sys.exit(1 if failed or errors else 0)
