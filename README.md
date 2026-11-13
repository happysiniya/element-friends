# 🧪 원소 친구 도감

어린이가 118개 원소를 **스티커 앨범처럼 모으면서** 주기율표를 배우는 웹앱이에요.
빌드 도구 없이 HTML, CSS, JavaScript만으로 만들었어요.

## 할 수 있는 것

- **🗺️ 주기율표 앨범**: 처음엔 모든 칸이 점선 빈 칸이에요. 원소를 누르면 카드(No.001~No.118)가 열리고 그 칸에 스티커가 붙어요.
  - 카드 아래 ◀ ▶는 번호 순서, ▲ ▼는 주기율표의 위아래 칸(같은 가족)으로 이동해요
  - **✨ 반짝이 도전**: 카드를 가리고 그 원소에 대해 한 문제를 내요. 맞히면 바로 반짝이 스티커가 돼요
  - 가족(족) 버튼을 누르면 같은 가족끼리 표시되고 가족 설명이 나와요
  - 이름, 기호, 번호로 검색할 수 있어요
  - 날마다 바뀌는 "오늘의 원소"
- **❓ 퀴즈**: 난이도 3단계(1~20번, 1~54번, 118개 전부)와 문제 종류 5가지(기호, 이름, 번호, 어디서 만나, 가족). 맞힌 원소는 반짝이(홀로그램) 스티커가 돼요.
- **🍳 원소 요리사**: 원소를 냄비에 넣어 물(H₂O), 소금(NaCl), 방귀 가스(CH₄), 썩은 달걀 냄새(H₂S) 같은 41가지 물질을 만들어요. 레시피 책에서 요리를 고르면 재료 힌트와 개수 힌트를 볼 수 있어요.

진행 기록은 브라우저(localStorage)에 저장돼서 로그인이 필요 없어요.

## 내 컴퓨터에서 실행하기

`index.html`을 더블클릭해서 브라우저로 열면 바로 실행돼요.

## 배포 (GitHub Pages)

- 사이트: https://happysiniya.github.io/element-friends/
- 저장소: https://github.com/happysiniya/element-friends
- `main` 브랜치의 루트 폴더를 그대로 배포해요 (Settings → Pages → Deploy from a branch → `main` / `/ (root)`).
- `git push`하면 1~2분 뒤 사이트에 반영돼요.

## 파일 구조

```
index.html          화면 뼈대
css/style.css       디자인
js/elements.js      118개 원소 데이터 (이름, 설명, 어디서 만나 등)
js/app.js           주기율표, 원소 카드, 반짝이 도전, 저장, 효과음
js/quiz.js          퀴즈
js/kitchen.js       원소 요리사 (레시피는 이 파일의 RECIPES)
manifest.json, sw.js  앱 설치(PWA)와 오프라인
icon-192/512.png    앱 아이콘 (tools/make_icons.py로 만들어요)
tests/smoke.py      화면 자동 확인 (Playwright)
```

원소 설명을 고치고 싶으면 `js/elements.js`를, 요리 레시피를 추가하고 싶으면 `js/kitchen.js`의 `RECIPES`를 수정하면 돼요.

## 화면 확인 (개발용)

Python과 Playwright, Chrome이 있으면 주요 화면을 자동으로 눌러 보고 스크린샷을 찍어요.

```bash
python tests/smoke.py
```

스크린샷은 `tests/screenshots/`에 저장돼요 (git에는 올라가지 않아요).
