// 원소 친구 도감 - 퀴즈
const Quiz = (() => {
  const LEVELS = [
    { id: "easy", label: "🌱 쉬움", sub: "1~20번", max: 20 },
    { id: "normal", label: "🌿 보통", sub: "1~54번", max: 54 },
    { id: "hard", label: "🌳 어려움", sub: "118개 전부!", max: 118 },
  ];
  const MODES = [
    { id: "mix", label: "🎲 섞어서" },
    { id: "sym", label: "🔤 기호 맞히기" },
    { id: "name", label: "📛 이름 맞히기" },
    { id: "num", label: "🔢 번호 맞히기" },
    { id: "where", label: "📍 어디서 만나?" },
    { id: "family", label: "👪 가족 맞히기" },
  ];
  const TYPES = ["sym", "name", "num", "where", "family"];
  const ROUND = 10;

  let level = "easy";
  let mode = "mix";
  let st = null; // 진행 중인 퀴즈

  const root = () => document.getElementById("quiz");
  const shuffle = (a) => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const pickOthers = (pool, el, k) => shuffle(pool.filter((e) => e !== el)).slice(0, k);

  // ---------- 설정 화면 ----------
  function show(force) {
    if (st && !st.done && !force) return; // 풀던 퀴즈는 그대로 유지
    st = null;
    root().innerHTML = `
      <div class="panel quiz-setup">
        <h2>원소 퀴즈</h2>
        <p class="sub">10문제를 풀어 봐! 맞힌 원소는 반짝이 스티커가 돼.</p>
        <h3>난이도</h3>
        <div class="opt-row" id="opt-level">
          ${LEVELS.map((l) => `<button class="opt ${l.id === level ? "selected" : ""}" data-id="${l.id}">${l.label}<small>${l.sub}</small></button>`).join("")}
        </div>
        <h3>문제 종류</h3>
        <div class="opt-row" id="opt-mode">
          ${MODES.map((m) => `<button class="opt ${m.id === mode ? "selected" : ""}" data-id="${m.id}">${m.label}</button>`).join("")}
        </div>
        <button class="big-btn" id="quiz-start">시작하기</button>
      </div>`;
    const bindRow = (id, set) => {
      document.getElementById(id).addEventListener("click", (e) => {
        const b = e.target.closest(".opt");
        if (!b) return;
        set(b.dataset.id);
        document.querySelectorAll(`#${id} .opt`).forEach((o) => o.classList.toggle("selected", o === b));
        App.sfx.pop();
      });
    };
    bindRow("opt-level", (v) => (level = v));
    bindRow("opt-mode", (v) => (mode = v));
    document.getElementById("quiz-start").onclick = start;
  }

  // ---------- 문제 만들기 ----------
  function start() {
    const max = LEVELS.find((l) => l.id === level).max;
    const pool = ELEMENTS.slice(0, max);
    // 아직 친구가 아닌 원소를 먼저 물어봄
    const notFriends = shuffle(pool.filter((e) => !App.Progress.has("friends", e.n)));
    const friends = shuffle(pool.filter((e) => App.Progress.has("friends", e.n)));
    const targets = notFriends.concat(friends).slice(0, ROUND);
    st = {
      i: 0, score: 0, done: false, newFriends: [],
      qs: targets.map((el) => makeQuestion(el, pool)),
    };
    renderQuestion();
  }

  function makeQuestion(el, pool) {
    const type = mode === "mix" ? TYPES[Math.floor(Math.random() * TYPES.length)] : mode;
    const opts = shuffle([el, ...pickOthers(pool, el, 3)]);
    switch (type) {
      case "sym":
        return {
          el, prompt: `<div class="q-big">${el.emoji} ${el.name}</div><div class="q-text">의 원소 기호는?</div>`,
          choices: opts.map((e) => ({ label: `<span class="c-sym">${e.sym}</span>`, ok: e === el })),
        };
      case "name":
        return {
          el, prompt: `<div class="q-big q-sym">${el.sym}</div><div class="q-text">이 기호를 가진 원소는?</div>`,
          choices: opts.map((e) => ({ label: e.name, ok: e === el })),
        };
      case "num":
        return {
          el, prompt: `<div class="q-big">No.${String(el.n).padStart(3, "0")}</div><div class="q-text">${el.n}번 원소는 누구일까?</div>`,
          choices: opts.map((e) => ({ label: `${e.name} <small>${e.sym}</small>`, ok: e === el })),
        };
      case "where":
        return {
          el, prompt: `<div class="q-text">📍 여기서 만날 수 있는 원소는?</div><div class="q-where">${el.where}</div>`,
          choices: opts.map((e) => ({ label: e.name, ok: e === el })),
        };
      case "family": {
        const others = shuffle(Object.keys(FAMILIES).filter((k) => k !== el.family)).slice(0, 3);
        return {
          el, wide: true,
          prompt: `<div class="q-big">${el.emoji} ${el.name} <small>${el.sym}</small></div><div class="q-text">어느 가족일까?</div>`,
          choices: shuffle([el.family, ...others]).map((k) => ({
            label: `${FAMILIES[k].emoji} ${FAMILIES[k].nick}<small>${FAMILIES[k].name}</small>`,
            ok: k === el.family,
          })),
        };
      }
    }
  }

  // ---------- 문제 화면 ----------
  function renderQuestion() {
    const q = st.qs[st.i];
    root().innerHTML = `
      <div class="panel quiz-box">
        <div class="quiz-head">
          <span>${st.i + 1} / ${ROUND}</span>
          <span>⭐ ${st.score}</span>
        </div>
        <div class="quiz-bar"><div style="width:${(st.i / ROUND) * 100}%"></div></div>
        <div class="q">${q.prompt}</div>
        <div class="choices ${q.wide ? "wide" : ""}">
          ${q.choices.map((c, k) => `<button class="choice" data-k="${k}">${c.label}</button>`).join("")}
        </div>
        <div class="feedback" id="q-fb"></div>
      </div>`;
    root().querySelectorAll(".choice").forEach((b) => (b.onclick = () => answer(+b.dataset.k)));
  }

  function answer(k) {
    const q = st.qs[st.i];
    const buttons = root().querySelectorAll(".choice");
    buttons.forEach((b, idx) => {
      b.disabled = true;
      if (q.choices[idx].ok) b.classList.add("right");
    });
    const fb = document.getElementById("q-fb");
    const el = q.el;
    if (q.choices[k].ok) {
      st.score++;
      App.sfx.good();
      const isNew = App.Progress.add("friends", el.n);
      App.Progress.add("seen", el.n);
      if (isNew) st.newFriends.push(el);
      fb.innerHTML = `<div class="fb good">정답! ${isNew ? `<b>${el.name}</b> 반짝이 스티커를 얻었어!` : `역시 ${el.name}!`}</div>`;
    } else {
      buttons[k].classList.add("wrong");
      App.sfx.bad();
      fb.innerHTML = `<div class="fb bad">아쉬워! 정답은 <b>${el.emoji} ${el.name} (${el.sym})</b></div>`;
    }
    const last = st.i === ROUND - 1;
    fb.insertAdjacentHTML("beforeend", `
      <div class="fb-actions">
        <button class="small-btn" id="q-card">${el.name} 카드 보기</button>
        <button class="big-btn" id="q-next">${last ? "결과 보기" : "다음 문제"}</button>
      </div>`);
    document.getElementById("q-card").onclick = () => App.openCard(el.n);
    document.getElementById("q-next").onclick = () => {
      if (last) finish();
      else { st.i++; renderQuestion(); }
    };
  }

  function finish() {
    st.done = true;
    const s = st.score;
    const medal = s === ROUND ? "🏆" : s >= 8 ? "🥇" : s >= 5 ? "🥈" : s >= 3 ? "🥉" : "💪";
    const msg = s === ROUND ? "만점! 원소 박사님이다!" : s >= 8 ? "대단해!" : s >= 5 ? "잘했어!" : "다음엔 더 잘할 수 있어!";
    root().innerHTML = `
      <div class="panel quiz-result">
        <div class="medal">${medal}</div>
        <h2>${ROUND}문제 중 ${s}개 맞혔어!</h2>
        <p class="sub">${msg}</p>
        ${st.newFriends.length
          ? `<h3>새로 얻은 반짝이 스티커 ${st.newFriends.length}장</h3>
             <div class="new-friends">${st.newFriends.map((e) =>
               `<button class="mini-card holo" data-n="${e.n}" style="--c:${FAMILIES[e.family].color}"><span>${e.emoji}</span><b>${e.sym}</b><small>${e.name}</small></button>`).join("")}</div>`
          : ""}
        <div class="fb-actions">
          <button class="small-btn" id="q-setup">설정 바꾸기</button>
          <button class="big-btn" id="q-again">한 번 더 하기</button>
        </div>
      </div>`;
    if (s >= 8) App.confetti(["🏆", "🎉", "⭐", "🌟"]);
    root().querySelectorAll(".mini-card").forEach((b) => (b.onclick = () => App.openCard(+b.dataset.n)));
    document.getElementById("q-again").onclick = start;
    document.getElementById("q-setup").onclick = () => show(true);
  }

  return { show };
})();
