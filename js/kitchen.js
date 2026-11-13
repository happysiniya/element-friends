// 원소 친구 도감 - 원소 요리사 (원소를 섞어 물질 만들기)
// 레시피 책에서 요리를 고르면 목표가 되고, 힌트를 두 단계로 볼 수 있어요: 재료 → 개수.
const Kitchen = (() => {
  // 번호 순서로 놓아요
  const PALETTE = ["H", "C", "N", "O", "Na", "Mg", "Al", "Si", "S", "Cl", "K", "Ca", "Fe"];
  const MAX_EACH = 12;

  // id는 기록(localStorage)에 저장되니 바꾸지 마세요. disp는 화학식 표기가 f 순서와 다를 때만 써요.
  // 쉬운 것(원자 2~3개)부터 어려운 것 순서예요.
  const RECIPES = [
    // ---- 쉬운 요리 ----
    { id: "h2", f: { H: 2 }, name: "수소 기체", emoji: "🚀", hint: "로켓 연료로 써요", desc: "세상에서 가장 가벼운 기체! 로켓 연료로 써." },
    { id: "o2", f: { O: 2 }, name: "산소 기체", emoji: "🌳", hint: "숨 쉴 때 꼭 필요해요", desc: "산소 2개가 짝꿍이 되면 우리가 들이마시는 산소 기체가 돼." },
    { id: "n2", f: { N: 2 }, name: "질소 기체", emoji: "🌬️", hint: "공기의 대부분이에요", desc: "공기의 78%가 바로 이 질소 짝꿍이야." },
    { id: "nacl", f: { Na: 1, Cl: 1 }, name: "소금", emoji: "🧂", hint: "짭짤한 맛", desc: "물에서 펑 터지는 소듐과 독한 염소가 만나면 맛있는 소금이 된다니, 신기하지?" },
    { id: "hcl", f: { H: 1, Cl: 1 }, name: "염산 (위산)", emoji: "🍽️", hint: "배 속에서 음식을 녹여요", desc: "우리 위 속에서 음식을 녹이는 위산이 바로 이거야." },
    { id: "kcl", f: { K: 1, Cl: 1 }, name: "염화 포타슘", emoji: "🍜", hint: "덜 짠 소금", desc: "소금이랑 닮았는데 소듐 대신 포타슘이 들어갔어. 짠맛을 줄인 소금에 써." },
    { id: "co", f: { C: 1, O: 1 }, name: "일산화 탄소", emoji: "⚠️", hint: "냄새가 없는 위험한 기체", desc: "산소가 모자랄 때 불이 타면 생겨. 냄새가 없어서 더 위험해! 집에 가스 경보기를 다는 이유야." },
    { id: "mgo", f: { Mg: 1, O: 1 }, name: "산화 마그네슘", emoji: "🎇", hint: "눈부시게 탄 뒤 남는 하얀 재", desc: "마그네슘이 하얀 빛을 내며 타고 나면 이 하얀 가루가 남아." },
    { id: "cao", f: { Ca: 1, O: 1 }, name: "생석회", emoji: "🍱", hint: "물을 부으면 뜨거워져요", desc: "물을 만나면 뜨거워져서 저절로 데워지는 도시락에 써." },
    { id: "sic", f: { Si: 1, C: 1 }, name: "탄화 규소", emoji: "💅", hint: "사포의 까끌까끌한 가루", desc: "다이아몬드 다음으로 단단해! 사포와 손톱 다듬는 줄에 써." },
    { id: "o3", f: { O: 3 }, name: "오존", emoji: "🌍", hint: "지구를 지키는 자외선 방패", desc: "산소 3개가 뭉치면 오존! 하늘 높은 곳에서 해로운 자외선을 막아 줘." },
    { id: "water", f: { H: 2, O: 1 }, name: "물", emoji: "💧", hint: "목마를 때 마셔요", desc: "수소 2개와 산소 1개가 손을 잡으면 물이 돼!" },
    { id: "co2", f: { C: 1, O: 2 }, name: "이산화 탄소", emoji: "🥤", hint: "사이다 속 뽀글뽀글 거품", desc: "우리가 내쉬는 숨과 탄산음료 거품 속에 있어. 식물은 이걸 먹고 자라!" },
    { id: "h2s", f: { H: 2, S: 1 }, name: "황화 수소", emoji: "🥚", hint: "썩은 달걀 냄새", desc: "으엑! 썩은 달걀 냄새의 범인이야. 온천이나 화산 근처에서도 이 냄새가 나." },
    { id: "so2", f: { S: 1, O: 2 }, name: "이산화 황", emoji: "🌋", hint: "화산이 뿜는 매운 냄새", desc: "화산에서 뿜어져 나오는 코를 찌르는 기체야." },
    { id: "n2o", f: { N: 2, O: 1 }, name: "웃음 가스", emoji: "😆", hint: "치과에서 마시면 기분이 몽롱해요", desc: "진짜 이름은 일산화 이질소. 치과에서 덜 아프게 하려고 마시기도 해." },
    { id: "no2", f: { N: 1, O: 2 }, name: "이산화 질소", emoji: "🚗", hint: "자동차 매연 속 갈색 기체", desc: "자동차 매연에 섞여 나오는 갈색 기체야. 공기를 더럽혀." },
    { id: "sio2", f: { Si: 1, O: 2 }, name: "모래 (석영)", emoji: "🏖️", hint: "바닷가에 잔뜩 있어요", desc: "바닷가 모래와 유리의 재료야." },
    { id: "cacl2", f: { Ca: 1, Cl: 2 }, name: "염화 칼슘", emoji: "❄️", hint: "겨울에 눈길에 뿌려요", desc: "눈 오는 날 길에 뿌리면 눈이 녹아. 제설제라고 해." },
    { id: "mgcl2", f: { Mg: 1, Cl: 2 }, name: "간수", emoji: "🥢", hint: "콩물을 두부로 굳혀요", desc: "바닷물에서 얻는 간수의 주인공이야. 콩물에 넣으면 몽글몽글 두부가 돼!" },
    { id: "h2o2", f: { H: 2, O: 2 }, name: "과산화 수소", emoji: "🩹", hint: "상처에 바르면 거품이 뽀글", desc: "물보다 산소가 하나 더! 상처 소독약이야." },
    // ---- 보통 요리 ----
    { id: "naoh", f: { Na: 1, O: 1, H: 1 }, name: "수산화 소듐", emoji: "🧼", hint: "비누를 만들 때 써요", desc: "기름이랑 섞으면 비누가 돼. 맨손으로 만지면 위험해!" },
    { id: "naclo", f: { Na: 1, Cl: 1, O: 1 }, name: "표백제", emoji: "🧴", hint: "옷을 하얗게, 화장실을 깨끗하게", desc: "락스 같은 표백제 속 물질이야. 세균을 없애고 얼룩을 하얗게 지워." },
    { id: "nh3", f: { N: 1, H: 3 }, name: "암모니아", emoji: "🚽", hint: "화장실 지린내의 정체", desc: "화장실 냄새의 범인! 식물 비료를 만들 때도 써." },
    { id: "ch4", f: { C: 1, H: 4 }, name: "메테인", emoji: "💨", hint: "소가 뀌는 방귀 속에 있어요", desc: "소 방귀와 트림 속 기체! 가스레인지 연료(천연가스)이기도 해." },
    { id: "kno3", f: { K: 1, N: 1, O: 3 }, name: "질산 포타슘", emoji: "🎆", hint: "불꽃놀이 화약 재료", desc: "옛날부터 화약을 만들 때 썼어. 불꽃놀이 속에도 들어 있어." },
    { id: "h2co3", f: { H: 2, C: 1, O: 3 }, name: "탄산", emoji: "🍾", hint: "탄산수가 톡 쏘는 이유", desc: "물에 이산화 탄소가 녹으면 조금씩 생겨. 탄산수가 톡 쏘는 맛을 내." },
    { id: "caoh2", f: { Ca: 1, O: 2, H: 2 }, disp: "Ca(OH)₂", name: "소석회", emoji: "⚽", hint: "운동장에 하얀 선을 그어요", desc: "생석회에 물을 부으면 생기는 하얀 가루야. 옛날엔 운동장 선을 그을 때 썼어." },
    { id: "mgoh2", f: { Mg: 1, O: 2, H: 2 }, disp: "Mg(OH)₂", name: "수산화 마그네슘", emoji: "💊", hint: "속 쓰릴 때 먹는 약", desc: "배 속의 위산을 순하게 만들어 주는 위장약에 들어 있어." },
    { id: "fes2", f: { Fe: 1, S: 2 }, name: "바보의 금", emoji: "💛", hint: "진짜 금처럼 반짝이는 돌", desc: "진짜 이름은 황철석. 금처럼 반짝여서 옛날 사람들이 금인 줄 알고 속았대!" },
    { id: "rust", f: { Fe: 2, O: 3 }, name: "녹", emoji: "🟫", hint: "오래된 철에 생기는 갈색", desc: "철이 산소와 물을 만나면 갈색 녹이 슬어." },
    { id: "al2o3", f: { Al: 2, O: 3 }, name: "루비와 사파이어", emoji: "💎", hint: "빨갛고 파란 보석", desc: "알루미늄과 산소가 만나 보석이 돼! 크로뮴이 조금 섞이면 빨간 루비가 돼." },
    { id: "fe3o4", f: { Fe: 3, O: 4 }, name: "자철석", emoji: "🧲", hint: "자석에 착 붙는 까만 모래", desc: "모래밭에서 자석에 달라붙는 까만 모래(사철)가 바로 이거야." },
    { id: "caco3", f: { Ca: 1, C: 1, O: 3 }, name: "탄산 칼슘", emoji: "🐚", hint: "조개껍데기와 분필", desc: "조개껍데기, 달걀 껍데기, 분필이 다 이거야!" },
    { id: "h2so4", f: { H: 2, S: 1, O: 4 }, name: "황산", emoji: "🔋", hint: "자동차 배터리 속 무서운 액체", desc: "자동차 배터리 속에 들어 있는 아주 강한 산이야. 절대 만지면 안 돼!" },
    // ---- 어려운 요리 ----
    { id: "nahco3", f: { Na: 1, H: 1, C: 1, O: 3 }, name: "베이킹 소다", emoji: "🧁", hint: "빵을 빵빵하게 부풀려요", desc: "빵과 쿠키를 부풀려 줘. 식초랑 섞으면 거품이 부글부글!" },
    { id: "ethanol", f: { C: 2, H: 6, O: 1 }, disp: "C₂H₅OH", name: "에탄올", emoji: "👐", hint: "손 소독제 속 시원한 액체", desc: "손 소독제를 바르면 시원하게 날아가는 액체야. 세균을 없애 줘." },
    { id: "vinegar", f: { C: 2, H: 4, O: 2 }, disp: "CH₃COOH", name: "식초 (아세트산)", emoji: "🥗", hint: "새콤한 맛", desc: "식초가 시큼한 건 이 아세트산 때문이야. 베이킹 소다랑 섞으면 부글부글!" },
    { id: "propane", f: { C: 3, H: 8 }, name: "프로페인", emoji: "🏕️", hint: "캠핑 버너 가스", desc: "캠핑장에서 쓰는 가스통 속 연료야." },
    { id: "butane", f: { C: 4, H: 10 }, name: "뷰테인", emoji: "🔥", hint: "휴대용 가스레인지 가스", desc: "식탁에서 쓰는 휴대용 가스레인지의 가스통 속 연료야." },
    { id: "glucose", f: { C: 6, H: 12, O: 6 }, name: "포도당", emoji: "🍬", hint: "달콤한 몸의 에너지 (도전 요리!)", desc: "우리 몸이 쓰는 에너지! 식물이 햇빛으로 만들어." },
  ];

  const SUB = "₀₁₂₃₄₅₆₇₈₉";
  const subNum = (n) => (n === 1 ? "" : String(n).split("").map((d) => SUB[+d]).join(""));
  const formula = (r) => r.disp || Object.entries(r.f).map(([s, k]) => s + subNum(k)).join("");
  const potFormula = () => PALETTE.filter((s) => pot[s]).map((s) => s + subNum(pot[s])).join("");
  const nameOf = (s) => App.bySym(s).name;
  const ingText = (f) => Object.entries(f).map(([s, k]) => `${nameOf(s)} ${k}개`).join(" + ");

  let pot = {};
  let target = null;   // 고른 요리 id
  let hintLv = 0;      // 0: 수수께끼만, 1: 재료, 2: 재료와 개수
  const root = () => document.getElementById("kitchen");
  const $k = (id) => document.getElementById(id);
  const colorOf = (sym) => FAMILIES[App.bySym(sym).family].color;
  const found = (id) => App.Progress.data.recipes.includes(id);
  const byId = (id) => RECIPES.find((r) => r.id === id);

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
        <p class="sub">아래 레시피 책에서 만들고 싶은 요리를 골라 봐. 힌트를 보면서 원소를 냄비에 넣고 <b>요리하기</b>를 누르면 돼!</p>
        <div class="target" id="target"></div>
        <div class="palette" id="palette">
          ${PALETTE.map((s) => `<button class="atom-btn" data-s="${s}" style="--c:${colorOf(s)}"><b>${s}</b><small>${nameOf(s)}</small></button>`).join("")}
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
        <p class="sub book-tip">요리를 누르면 만들 요리로 골라져요.</p>
        <div class="book" id="book"></div>
      </div>`;
    $k("palette").addEventListener("click", (e) => {
      const b = e.target.closest(".atom-btn");
      if (b) add(b.dataset.s);
    });
    $k("book").addEventListener("click", (e) => {
      const b = e.target.closest(".recipe");
      if (b) pickTarget(b.dataset.id);
    });
    $k("pot-clear").onclick = () => { pot = {}; drawPot(); msg(""); };
    $k("pot-cook").onclick = cook;
    drawPot();
    drawBook();
  }

  // ---------- 목표 요리와 힌트 ----------
  function pickTarget(id) {
    target = id;
    hintLv = found(id) ? 2 : 0;
    App.sfx.pop();
    msg("");
    drawTarget();
    drawBook();
    $k("target").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function drawTarget() {
    const box = $k("target");
    const r = target && byId(target);
    paintPalette(r);
    if (!r) {
      box.className = "target empty";
      box.innerHTML = "아직 고른 요리가 없어. 아래 레시피 책에서 하나 골라 봐! 👇";
      return;
    }
    const known = found(r.id);
    box.className = "target";
    box.innerHTML = `
      <div class="t-head">
        <span class="t-emoji">${known ? r.emoji : "❓"}</span>
        <div class="t-text">
          <p class="t-label">만들 요리</p>
          <p class="t-name">${known ? `${r.name} <span>${formula(r)}</span>` : "???"}</p>
          <p class="t-hint">힌트: ${r.hint}</p>
        </div>
        <button class="t-close" id="t-close" title="고른 요리 취소">✕</button>
      </div>
      <div class="t-ings">
        ${hintLv >= 1 ? Object.entries(r.f).map(([s, need]) => {
          const have = pot[s] || 0;
          const state = hintLv >= 2 ? (have === need ? "done" : have > need ? "over" : "") : (have ? "done" : "");
          return `<span class="ing ${state}" style="--c:${colorOf(s)}"><b>${s}</b> ${nameOf(s)}${hintLv >= 2 ? ` <em>${have}/${need}</em>` : ""}</span>`;
        }).join("") : ""}
        ${hintLv === 0 ? '<button class="small-btn" id="hint-1">💡 재료 힌트 보기</button>' : ""}
        ${hintLv === 1 ? '<button class="small-btn" id="hint-2">💡 개수 힌트 보기</button>' : ""}
      </div>`;
    $k("t-close").onclick = () => { target = null; hintLv = 0; drawTarget(); drawBook(); };
    if ($k("hint-1")) $k("hint-1").onclick = () => { hintLv = 1; App.sfx.pop(); drawTarget(); };
    if ($k("hint-2")) $k("hint-2").onclick = () => { hintLv = 2; App.sfx.pop(); drawTarget(); };
  }

  // 재료 힌트를 보면 필요한 원소 버튼에 표시해요
  function paintPalette(r) {
    root().querySelectorAll(".atom-btn").forEach((b) => {
      b.classList.toggle("need", !!r && hintLv >= 1 && !!r.f[b.dataset.s]);
    });
  }

  // ---------- 냄비 ----------
  function add(s) {
    if ((pot[s] || 0) >= MAX_EACH) return msg(`${App.josa(nameOf(s), "은", "는")} ${MAX_EACH}개까지만 넣을 수 있어!`);
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
    const el = $k("pot");
    const keys = PALETTE.filter((s) => pot[s]);
    el.innerHTML = keys.length
      ? keys.map((s) => `
          <button class="pot-group" data-s="${s}" title="눌러서 하나 빼기">
            ${Array.from({ length: pot[s] }, () => `<span class="atom" style="--c:${colorOf(s)}">${s}</span>`).join("")}
          </button>`).join("")
      : `<div class="pot-empty">냄비가 비어 있어요 🍲</div>`;
    el.querySelectorAll(".pot-group").forEach((g) => (g.onclick = () => removeOne(g.dataset.s)));
    $k("pot-formula").textContent = keys.length ? potFormula() : "";
    drawTarget();
  }

  function drawBook() {
    const list = App.Progress.data.recipes;
    $k("book-count").textContent = `(${list.length}/${RECIPES.length})`;
    $k("book").innerHTML = RECIPES.map((r) => {
      const on = target === r.id ? " targeted" : "";
      return found(r.id)
        ? `<button class="recipe found${on}" data-id="${r.id}"><span class="r-emoji">${r.emoji}</span><b>${r.name}</b><span class="r-formula">${formula(r)}</span></button>`
        : `<button class="recipe${on}" data-id="${r.id}"><span class="r-emoji">❓</span><b>???</b><span class="r-hint">${r.hint}</span></button>`;
    }).join("");
  }

  function msg(html) { $k("kitchen-msg").innerHTML = html; }

  // ---------- 요리하기 ----------
  function cook() {
    if (!Object.keys(pot).length) return msg("먼저 원소를 냄비에 넣어 줘! 👆");
    const r = RECIPES.find((x) => sameMix(x.f, pot));
    if (r) {
      const isNew = App.Progress.add("recipes", r.id);
      App.sfx.cook();
      if (isNew) App.confetti([r.emoji, "✨", "🎉"]);
      msg(`<div class="cooked">
          <div class="cooked-emoji">${r.emoji}</div>
          <div class="cooked-name">${isNew ? "새 요리 발견! " : ""}${r.name} <span>${formula(r)}</span></div>
          <p class="cooked-ing">${ingText(r.f)}</p>
          <p>${r.desc}</p>
        </div>`);
      pot = {};
      if (target === r.id) { target = null; hintLv = 0; }
      drawPot();
      drawBook();
      return;
    }
    App.sfx.bad();
    msg(target ? targetFeedback(byId(target)) : freeFeedback());
  }

  // 고른 요리가 있을 때: 무엇이 틀렸는지 구체적으로
  function targetFeedback(t) {
    const extra = Object.keys(pot).filter((s) => !t.f[s]);
    if (extra.length) {
      const names = extra.map(nameOf).join(", ");
      return `🙅 ${App.josa(names, "은", "는")} 이 요리에 안 들어가! 냄비에서 눌러서 빼 봐.`;
    }
    const missing = Object.keys(t.f).filter((s) => !pot[s]);
    if (missing.length) {
      return hintLv >= 1
        ? `🤏 ${missing.map(nameOf).join(", ")}도 넣어야 해!`
        : "🤏 빠진 재료가 있어. 💡 재료 힌트를 볼까?";
    }
    if (hintLv < 2) return "👍 재료는 다 맞았어! 개수가 달라. 💡 개수 힌트를 볼까?";
    const tips = Object.entries(t.f).filter(([s, need]) => pot[s] !== need).map(([s, need]) => {
      const d = need - pot[s];
      return d > 0
        ? `${App.josa(nameOf(s), "이", "가")} ${d}개 더 필요해`
        : `${App.josa(nameOf(s), "이", "가")} ${-d}개 너무 많아`;
    });
    return `🔢 ${tips.join(", ")}!`;
  }

  // 고른 요리가 없을 때
  function freeFeedback() {
    if (RECIPES.some(isPartOf)) return "🤏 거의 다 왔어! 원소를 조금 더 넣어 볼까?";
    return "🤔 이런 요리는 아직 몰라. 레시피 책에서 요리를 고르면 힌트를 볼 수 있어!";
  }

  return { render, RECIPES };
})();
