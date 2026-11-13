// 원소 친구 도감 - 원소 요리사 (원소를 섞어 물질 만들기)
const Kitchen = (() => {
  const PALETTE = ["H", "C", "N", "O", "Na", "Al", "Si", "Cl", "Ca", "Fe"];
  const MAX_EACH = 12;

  const RECIPES = [
    { id: "water", f: { H: 2, O: 1 }, name: "물", emoji: "💧", hint: "목마를 때 마셔요", desc: "수소 2개와 산소 1개가 손을 잡으면 물이 돼!" },
    { id: "o2", f: { O: 2 }, name: "산소 기체", emoji: "🌳", hint: "숨 쉴 때 꼭 필요해요", desc: "산소 2개가 짝꿍이 되면 우리가 들이마시는 산소 기체가 돼." },
    { id: "n2", f: { N: 2 }, name: "질소 기체", emoji: "🌬️", hint: "공기의 대부분이에요", desc: "공기의 78%가 바로 이 질소 짝꿍이야." },
    { id: "h2", f: { H: 2 }, name: "수소 기체", emoji: "🚀", hint: "로켓 연료로 써요", desc: "세상에서 가장 가벼운 기체! 로켓 연료로 써." },
    { id: "o3", f: { O: 3 }, name: "오존", emoji: "🌍", hint: "지구를 지키는 자외선 방패", desc: "산소 3개가 뭉치면 오존! 하늘 높은 곳에서 해로운 자외선을 막아 줘." },
    { id: "co2", f: { C: 1, O: 2 }, name: "이산화탄소", emoji: "🥤", hint: "사이다 속 뽀글뽀글 거품", desc: "우리가 내쉬는 숨과 탄산음료 거품 속에 있어. 식물은 이걸 먹고 자라!" },
    { id: "nacl", f: { Na: 1, Cl: 1 }, name: "소금", emoji: "🧂", hint: "짭짤한 맛", desc: "물에서 펑 터지는 소듐과 독한 염소가 만나면 맛있는 소금이 된다니, 신기하지?" },
    { id: "hcl", f: { H: 1, Cl: 1 }, name: "염산 (위산)", emoji: "🍽️", hint: "배 속에서 음식을 녹여요", desc: "우리 위 속에서 음식을 녹이는 위산이 바로 이거야." },
    { id: "nh3", f: { N: 1, H: 3 }, name: "암모니아", emoji: "🚽", hint: "화장실 지린내의 정체", desc: "화장실 냄새의 범인! 식물 비료를 만들 때도 써." },
    { id: "ch4", f: { C: 1, H: 4 }, name: "메테인", emoji: "💨", hint: "소가 뀌는 방귀 속에 있어요", desc: "소 방귀와 트림 속 기체! 가스레인지 연료(천연가스)이기도 해." },
    { id: "h2o2", f: { H: 2, O: 2 }, name: "과산화수소", emoji: "🩹", hint: "상처에 바르면 거품이 뽀글", desc: "물보다 산소가 하나 더! 상처 소독약이야." },
    { id: "sio2", f: { Si: 1, O: 2 }, name: "모래 (석영)", emoji: "🏖️", hint: "바닷가에 잔뜩 있어요", desc: "바닷가 모래와 유리의 재료야." },
    { id: "rust", f: { Fe: 2, O: 3 }, name: "녹", emoji: "🟫", hint: "오래된 철에 생기는 갈색", desc: "철이 산소와 물을 만나면 갈색 녹이 슬어." },
    { id: "caco3", f: { Ca: 1, C: 1, O: 3 }, name: "탄산칼슘", emoji: "🐚", hint: "조개껍데기와 분필", desc: "조개껍데기, 달걀 껍데기, 분필이 다 이거야!" },
    { id: "nahco3", f: { Na: 1, H: 1, C: 1, O: 3 }, name: "베이킹 소다", emoji: "🧁", hint: "빵을 빵빵하게 부풀려요", desc: "빵과 쿠키를 부풀려 줘. 식초랑 섞으면 거품이 부글부글!" },
    { id: "al2o3", f: { Al: 2, O: 3 }, name: "루비와 사파이어", emoji: "💎", hint: "빨갛고 파란 보석", desc: "알루미늄과 산소가 만나 보석이 돼! 크로뮴이 조금 섞이면 빨간 루비가 돼." },
    { id: "glucose", f: { C: 6, H: 12, O: 6 }, name: "포도당", emoji: "🍬", hint: "달콤한 몸의 에너지 (도전 요리!)", desc: "우리 몸이 쓰는 에너지! 식물이 햇빛으로 만들어." },
  ];

  const SUB = "₀₁₂₃₄₅₆₇₈₉";
  const subNum = (n) => (n === 1 ? "" : String(n).split("").map((d) => SUB[+d]).join(""));
  // 화학식 표기: 레시피에 적힌 순서대로
  const formula = (f) => Object.entries(f).map(([s, k]) => s + subNum(k)).join("");
  const potFormula = () => PALETTE.filter((s) => pot[s]).map((s) => s + subNum(pot[s])).join("");

  let pot = {};
  const root = () => document.getElementById("kitchen");
  const colorOf = (sym) => FAMILIES[App.bySym(sym).family].color;

  function sameMix(a, b) {
    const ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => a[k] === b[k]);
  }
  // 지금 냄비가 어떤 레시피로 가는 중인지 (일부분인지)
  const isPartOf = (r) => Object.keys(pot).every((k) => (r.f[k] || 0) >= pot[k]);

  function render() {
    root().innerHTML = `
      <div class="panel kitchen">
        <h2>원소 요리사</h2>
        <p class="sub">원소를 냄비에 넣고 <b>요리하기</b>를 눌러 봐! 원소들이 손을 잡으면 새로운 물질이 돼.</p>
        <div class="palette" id="palette">
          ${PALETTE.map((s) => {
            const el = App.bySym(s);
            return `<button class="atom-btn" data-s="${s}" style="--c:${colorOf(s)}"><b>${s}</b><small>${el.name}</small></button>`;
          }).join("")}
        </div>
        <div class="pot-area">
          <div class="pot" id="pot"></div>
          <div class="pot-formula" id="pot-formula"></div>
          <div class="pot-actions">
            <button class="small-btn" id="pot-clear">냄비 비우기</button>
            <button class="big-btn" id="pot-cook">요리하기</button>
          </div>
          <div class="kitchen-msg" id="kitchen-msg"></div>
        </div>
        <h3>레시피 책 <span id="book-count"></span></h3>
        <div class="book" id="book"></div>
      </div>`;
    root().querySelector("#palette").addEventListener("click", (e) => {
      const b = e.target.closest(".atom-btn");
      if (b) add(b.dataset.s);
    });
    document.getElementById("pot-clear").onclick = () => { pot = {}; drawPot(); msg(""); };
    document.getElementById("pot-cook").onclick = cook;
    drawPot();
    drawBook();
  }

  function add(s) {
    if ((pot[s] || 0) >= MAX_EACH) return msg(`${App.bySym(s).name}은(는) ${MAX_EACH}개까지만 넣을 수 있어!`);
    pot[s] = (pot[s] || 0) + 1;
    App.sfx.pop();
    msg("");
    drawPot();
  }

  function removeOne(s) {
    if (!pot[s]) return;
    pot[s]--;
    if (!pot[s]) delete pot[s];
    App.sfx.pop();
    drawPot();
  }

  function drawPot() {
    const el = document.getElementById("pot");
    const keys = PALETTE.filter((s) => pot[s]);
    el.innerHTML = keys.length
      ? keys.map((s) => `
          <button class="pot-group" data-s="${s}" title="눌러서 하나 빼기">
            ${Array.from({ length: pot[s] }, () => `<span class="atom" style="--c:${colorOf(s)}">${s}</span>`).join("")}
          </button>`).join("")
      : `<div class="pot-empty">냄비가 비어 있어요 🍲</div>`;
    el.querySelectorAll(".pot-group").forEach((g) => (g.onclick = () => removeOne(g.dataset.s)));
    document.getElementById("pot-formula").textContent = keys.length ? potFormula() : "";
  }

  function drawBook() {
    const found = App.Progress.data.recipes;
    document.getElementById("book-count").textContent = `(${found.length}/${RECIPES.length})`;
    document.getElementById("book").innerHTML = RECIPES.map((r) => found.includes(r.id)
      ? `<div class="recipe found"><span class="r-emoji">${r.emoji}</span><b>${r.name}</b><span class="r-formula">${formula(r.f)}</span></div>`
      : `<div class="recipe"><span class="r-emoji">❓</span><b>???</b><span class="r-hint">힌트: ${r.hint}</span></div>`).join("");
  }

  function msg(html) { document.getElementById("kitchen-msg").innerHTML = html; }

  function cook() {
    if (!Object.keys(pot).length) return msg("먼저 원소를 냄비에 넣어 줘! 👆");
    const r = RECIPES.find((x) => sameMix(x.f, pot));
    if (r) {
      const isNew = App.Progress.add("recipes", r.id);
      App.sfx.cook();
      App.confetti([r.emoji, "✨", "🎉"]);
      msg(`<div class="cooked">
          <div class="cooked-emoji">${r.emoji}</div>
          <div class="cooked-name">${isNew ? "새 요리 발견! " : ""}${r.name} <span>${formula(r.f)}</span></div>
          <p>${r.desc}</p>
        </div>`);
      pot = {};
      drawPot();
      drawBook();
    } else if (RECIPES.some(isPartOf)) {
      App.sfx.bad();
      msg("🤏 거의 다 왔어! 원소를 조금 더 넣어 볼까?");
    } else {
      App.sfx.bad();
      msg("🤔 이런 조합은 아직 몰라. 레시피 책의 힌트를 보고 다시 해 봐!");
    }
  }

  return { render, RECIPES };
})();
