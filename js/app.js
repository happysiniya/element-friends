// 원소 친구 도감 - 공통 기능 (저장, 소리, 주기율표, 원소 카드)
const App = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const byNum = (n) => ELEMENTS[n - 1];
  const bySym = (s) => ELEMENTS.find((e) => e.sym === s);

  // ---------- 저장 (브라우저 localStorage) ----------
  const KEY = "element-friends-v1";
  const Progress = {
    data: { seen: [], friends: [], recipes: [], muted: false },
    load() {
      try {
        const d = JSON.parse(localStorage.getItem(KEY));
        if (d) Object.assign(this.data, d);
      } catch (e) { /* 저장소를 못 쓰면 그냥 새로 시작 */ }
    },
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {}
    },
    has(list, v) { return this.data[list].includes(v); },
    add(list, v) {
      if (this.has(list, v)) return false;
      this.data[list].push(v);
      this.save();
      updateCounters();
      return true;
    },
    reset() {
      this.data = { seen: [], friends: [], recipes: [], muted: this.data.muted };
      this.save();
    },
  };

  // ---------- 소리 ----------
  let actx;
  function tone(freqs, dur = 0.12, type = "sine") {
    if (Progress.data.muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      let t = actx.currentTime;
      for (const f of freqs) {
        const o = actx.createOscillator();
        const g = actx.createGain();
        o.type = type;
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(actx.destination);
        o.start(t);
        o.stop(t + dur + 0.02);
        t += dur * 0.85;
      }
    } catch (e) {}
  }
  const sfx = {
    good: () => tone([523, 659, 784, 1047]),
    bad: () => tone([330, 247], 0.2, "triangle"),
    pop: () => tone([880], 0.07, "triangle"),
    open: () => tone([660, 990], 0.08),
    cook: () => tone([392, 523, 659, 784, 1047, 1319], 0.1),
  };

  // 받침에 따라 조사 고르기: josa("철", "은", "는") → "철은"
  function josa(word, withBatchim, without) {
    const code = word.charCodeAt(word.length - 1) - 0xac00;
    const has = code >= 0 && code <= 11171 && code % 28 !== 0;
    return word + (has ? withBatchim : without);
  }
  const shuffle = (a) => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // ---------- 축하 효과 ----------
  function confetti(emojis = ["⭐", "✨", "🎉", "🌟"]) {
    const fx = $("#fx");
    for (let i = 0; i < 28; i++) {
      const s = document.createElement("span");
      s.className = "confetti";
      s.textContent = emojis[i % emojis.length];
      s.style.left = Math.random() * 100 + "vw";
      s.style.animationDelay = Math.random() * 0.4 + "s";
      s.style.fontSize = 18 + Math.random() * 22 + "px";
      fx.appendChild(s);
      setTimeout(() => s.remove(), 2200);
    }
  }

  // ---------- 상단 카운터 ----------
  function updateCounters() {
    const d = Progress.data;
    const total = typeof Kitchen !== "undefined" ? Kitchen.RECIPES.length : 0;
    $("#counters").innerHTML =
      `<span class="count" title="모은 스티커"><b>${d.seen.length}</b>/118 스티커</span>` +
      `<span class="count holo-count" title="퀴즈로 얻은 반짝이 스티커"><b>${d.friends.length}</b>/118 반짝이</span>` +
      `<span class="count" title="만든 요리"><b>${d.recipes.length}</b>/${total} 요리</span>`;
  }

  // ---------- 주기율표 ----------
  function renderTable() {
    const grid = $("#ptable");
    grid.innerHTML = "";
    for (const el of ELEMENTS) {
      const b = document.createElement("button");
      b.className = "cell";
      b.dataset.n = el.n;
      b.dataset.family = el.family;
      b.style.setProperty("--c", FAMILIES[el.family].color);
      b.style.gridRow = el.row;
      b.style.gridColumn = el.col;
      // 손으로 붙인 것처럼 살짝 기울기 (번호마다 항상 같은 각도)
      b.style.setProperty("--tilt", (((el.n * 47) % 7) - 3) * 0.6 + "deg");
      b.title = `${el.n}번 ${el.name}`;
      b.innerHTML =
        `<span class="num">${el.n}</span><span class="star">⭐</span>` +
        `<span class="sym">${el.sym}</span><span class="nm">${el.name}</span>`;
      b.addEventListener("click", () => openCard(el.n));
      grid.appendChild(b);
    }
    // 란타넘족, 악티늄족 자리 표시
    for (const [row, fam, label] of [[6, "lanthanide", "57~71"], [7, "actinide", "89~103"]]) {
      const famName = FAMILIES[fam].name;
      const p = document.createElement("div");
      p.className = "cell placeholder";
      p.dataset.family = fam;
      p.style.setProperty("--c", FAMILIES[fam].color);
      p.style.gridRow = row;
      p.style.gridColumn = 3;
      p.title = `${famName}은 아래 줄에 있어요`;
      p.innerHTML = `<span class="nm">${label}</span><span class="nm">${famName}</span>`;
      grid.appendChild(p);
    }
    refreshTableMarks();
  }

  function refreshTableMarks() {
    for (const c of $$("#ptable .cell[data-n]")) {
      const n = +c.dataset.n;
      c.classList.toggle("seen", Progress.has("seen", n));
      c.classList.toggle("friend", Progress.has("friends", n));
    }
  }

  // 가족 범례 + 검색 하이라이트
  let activeFamily = null;
  function renderLegend() {
    const lg = $("#legend");
    lg.innerHTML = Object.entries(FAMILIES)
      .map(([k, f]) =>
        `<button class="legend-item" data-family="${k}" style="--c:${f.color}">${f.emoji} ${f.nick}</button>`)
      .join("");
    lg.addEventListener("click", (e) => {
      const btn = e.target.closest(".legend-item");
      if (!btn) return;
      const fam = btn.dataset.family;
      activeFamily = activeFamily === fam ? null : fam;
      $("#search").value = "";
      $$(".legend-item").forEach((b) => b.classList.toggle("active", b.dataset.family === activeFamily));
      highlight((cell) => cell.dataset.family === activeFamily, !!activeFamily);
      showFamilyDesc();
      if (activeFamily) sfx.pop();
    });
  }

  function showFamilyDesc() {
    const box = $("#legend-desc");
    const f = activeFamily && FAMILIES[activeFamily];
    box.innerHTML = f ? `<b>${f.emoji} ${f.nick}</b> (${f.name}) ${f.desc}` : "";
  }

  function highlight(test, on) {
    const grid = $("#ptable");
    grid.classList.toggle("filtering", on);
    for (const c of $$(".cell", grid)) c.classList.toggle("hl", on && test(c));
  }

  function setupSearch() {
    $("#search").addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      activeFamily = null;
      $$(".legend-item").forEach((b) => b.classList.remove("active"));
      showFamilyDesc();
      if (!q) return highlight(() => false, false);
      // 기호나 번호가 딱 맞으면 그 원소만 (Fe → 철, 페르뮴은 빼고)
      const exact = ELEMENTS.find((el) => String(el.n) === q || el.sym.toLowerCase() === q);
      highlight((c) => {
        if (!c.dataset.n) return false;
        const el = byNum(+c.dataset.n);
        if (exact) return el === exact;
        return el.name.includes(q) || el.en.toLowerCase().startsWith(q);
      }, true);
    });
  }

  // 오늘의 원소 (날짜마다 바뀜)
  function renderToday() {
    const d = new Date();
    const seed = d.getFullYear() * 400 + (d.getMonth() + 1) * 31 + d.getDate();
    const el = byNum((seed * 37) % 118 + 1);
    const box = $("#today");
    box.style.setProperty("--c", FAMILIES[el.family].color);
    box.innerHTML = `
      <button class="today-sticker" title="${el.name} 카드 열기">
        <span class="ts-emoji">${el.emoji}</span><span class="ts-sym">${el.sym}</span>
      </button>
      <div class="today-text">
        <p class="today-label">오늘의 원소</p>
        <p class="today-name">${el.n}번 ${el.name}</p>
        <p class="today-desc">${el.desc.split(/(?<=[.!?])\s/)[0]}</p>
      </div>`;
    box.querySelector(".today-sticker").onclick = () => openCard(el.n);
  }

  // ---------- 원소 카드 ----------
  let current = 1;
  const PHASE = { solid: "🧱 고체", liquid: "💧 액체", gas: "💨 기체", unknown: "❔ 아직 몰라" };

  // 카드에서 이웃 원소 찾기. 좌우는 번호 순서, 위아래는 주기율표의 같은 세로줄(같은 가족)
  function neighbor(n, dir) {
    if (dir === "left") return n === 1 ? 118 : n - 1;
    if (dir === "right") return n === 118 ? 1 : n + 1;
    const d = dir === "up" ? -1 : 1;
    // 란타넘족(57~71)과 악티늄족(89~103)은 아래 두 줄에 따로 있어요
    if (n >= 57 && n <= 71) return d === 1 ? n + 32 : n === 57 ? 39 : null;
    if (n >= 89 && n <= 103) return d === -1 ? n - 32 : null;
    if (n === 39 && d === 1) return 57; // 이트륨 아래는 란타넘
    const el = byNum(n);
    const target = ELEMENTS.find((e) => e.row === el.row + d && e.col === el.col && e.row <= 7);
    return target ? target.n : null;
  }

  const NAV = {
    left: { arrow: "◀", label: "이전 번호" },
    up: { arrow: "▲", label: "위 칸" },
    down: { arrow: "▼", label: "아래 칸" },
    right: { arrow: "▶", label: "다음 번호" },
  };

  function paintNav(n) {
    for (const btn of $$("#card .nav-btn")) {
      const dir = btn.dataset.dir;
      const t = neighbor(n, dir);
      btn.disabled = !t;
      btn.title = t ? `${NAV[dir].label}: ${byNum(t).name}` : "이쪽에는 원소가 없어요";
      btn.innerHTML = `<span class="arrow">${NAV[dir].arrow}</span><span class="nsym">${t ? byNum(t).sym : ""}</span>`;
    }
    const ch = $("#card-challenge");
    const done = Progress.has("friends", n);
    ch.disabled = done;
    ch.textContent = done ? "⭐ 반짝이 완성" : "✨ 반짝이 도전";
  }

  function openCard(n, opts = {}) {
    const el = byNum(n);
    const f = FAMILIES[el.family];
    current = n;
    const isNew = Progress.add("seen", n);
    const isFriend = Progress.has("friends", n);
    const place = el.group
      ? `${el.period}주기 ${el.group}족`
      : `${el.period}주기, ${f.name}`;
    const badge = opts.holoNew ? "반짝이 스티커가 됐어요!" : isNew ? "새 스티커를 붙였어요!" : "";

    const dlg = $("#card");
    dlg.classList.remove("challenging");
    dlg.style.setProperty("--c", f.color);
    $("#card-body").innerHTML = `
      <div class="card-top">
        ${badge ? `<p class="new-badge">${badge}</p>` : ""}
        <div class="big-sticker ${isFriend ? "holo" : ""} ${isNew || opts.holoNew ? "stick" : ""}">
          <span class="bs-no">No.${String(n).padStart(3, "0")}</span>
          <span class="bs-emoji">${el.emoji}</span>
          <span class="bs-sym">${el.sym}</span>
          <span class="bs-name">${el.name}</span>
          <span class="bs-en">${el.en}</span>
        </div>
      </div>
      <div class="card-info">
        <div class="badges">
          <span class="badge fam">${f.emoji} ${f.nick}</span>
          <span class="badge">${PHASE[el.phase]}</span>
          ${el.radioactive ? '<span class="badge warn">☢️ 방사능</span>' : ""}
          ${el.synthetic ? '<span class="badge">🔬 실험실 출신</span>' : ""}
        </div>
        <p class="desc">${el.desc}</p>
        <dl class="facts">
          <div class="fact-where"><dt>어디서 만나?</dt><dd>${el.where}</dd></div>
          <div><dt>번호</dt><dd>${el.n}</dd></div>
          <div><dt>몸무게(원자량)</dt><dd>${el.mass.replace(/[\[\]]/g, "")}</dd></div>
          <div><dt>사는 곳</dt><dd>${place}</dd></div>
          <div class="fact-family"><dt>${f.name}</dt><dd>${f.desc}</dd></div>
        </dl>
        <p class="holo-note ${isFriend ? "got" : ""}">${isFriend
          ? "⭐ 반짝이 스티커예요!"
          : "카드를 잘 읽고 ‘반짝이 도전’에서 맞히면 반짝이 스티커가 돼요."}</p>
      </div>
    `;
    if (!dlg.open) dlg.showModal();
    $("#card-body").scrollTop = 0;
    if (!opts.holoNew) { if (isNew) sfx.good(); else sfx.open(); }
    paintNav(n);
    refreshTableMarks();
  }

  // ---------- 반짝이 도전: 카드를 가리고 그 원소에 대해 한 문제 ----------
  function makeChallenge(el) {
    const others = ELEMENTS.filter((e) => e !== el);
    const types = ["num", "sym", "where", "family", "emoji"];
    const type = types[Math.floor(Math.random() * types.length)];
    const pick = (list, k) => shuffle(list).slice(0, k);
    switch (type) {
      case "num": {
        // 가까운 번호로 헷갈리게
        const near = shuffle([-3, -2, -1, 1, 2, 3].map((d) => el.n + d).filter((x) => x >= 1 && x <= 118)).slice(0, 3);
        return {
          text: `${josa(el.name, "은", "는")} 몇 번이었지?`,
          choices: shuffle([el.n, ...near]).map((x) => ({ label: `${x}번`, ok: x === el.n })),
        };
      }
      case "sym": {
        // 첫 글자가 같은 기호를 먼저 섞어요 (C → Ca, Co, Cu…)
        const alike = pick(others.filter((e) => e.sym[0] === el.sym[0]), 3);
        const rest = pick(others.filter((e) => !alike.includes(e)), 3 - alike.length);
        return {
          text: `${el.name}의 원소 기호는?`,
          choices: shuffle([el, ...alike, ...rest]).map((e) => ({ label: `<span class="c-sym">${e.sym}</span>`, ok: e === el })),
        };
      }
      case "where": {
        const seen = new Set([el.where]);
        const wrong = [];
        for (const e of shuffle(others)) {
          if (wrong.length === 3) break;
          if (seen.has(e.where) || e.where.includes("연구실") || e.where.includes("입자 가속기")) continue;
          seen.add(e.where);
          wrong.push(e.where);
        }
        return {
          wide: true,
          text: `${josa(el.name, "은", "는")} 어디서 만날 수 있었지?`,
          choices: shuffle([el.where, ...wrong]).map((w) => ({ label: w, ok: w === el.where })),
        };
      }
      case "family": {
        const fams = pick(Object.keys(FAMILIES).filter((k) => k !== el.family), 3);
        return {
          wide: true,
          text: `${josa(el.name, "은", "는")} 어느 가족이었지?`,
          choices: shuffle([el.family, ...fams]).map((k) => ({
            label: `${FAMILIES[k].emoji} ${FAMILIES[k].nick}`, ok: k === el.family,
          })),
        };
      }
      default: {
        const emojis = [...new Set(others.map((e) => e.emoji))].filter((x) => x !== el.emoji);
        return {
          text: `${el.name} 카드에 있던 그림은?`,
          choices: shuffle([el.emoji, ...pick(emojis, 3)]).map((x) => ({ label: `<span class="c-emoji">${x}</span>`, ok: x === el.emoji })),
        };
      }
    }
  }

  function startChallenge() {
    const n = current;
    const el = byNum(n);
    const q = makeChallenge(el);
    const dlg = $("#card");
    dlg.classList.add("challenging");
    $("#card-body").innerHTML = `
      <div class="card-top">
        <p class="new-badge">반짝이 도전!</p>
        <div class="big-sticker back flip"><span class="back-mark">?</span><span class="back-name">${el.name}</span></div>
      </div>
      <div class="card-info challenge">
        <p class="ch-q">${q.text}</p>
        <div class="choices ${q.wide ? "wide" : ""}">
          ${q.choices.map((c, k) => `<button class="choice" data-k="${k}"${c.ok ? ' data-ok="1"' : ""}>${c.label}</button>`).join("")}
        </div>
        <div class="ch-fb" id="ch-fb"></div>
      </div>`;
    $("#card-body").scrollTop = 0;
    sfx.pop();
    $$("#card-body .choice").forEach((b) => (b.onclick = () => answerChallenge(n, q, +b.dataset.k)));
  }

  function answerChallenge(n, q, k) {
    const buttons = $$("#card-body .choice");
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (q.choices[i].ok) b.classList.add("right");
    });
    const fb = $("#ch-fb");
    if (q.choices[k].ok) {
      Progress.add("friends", n);
      sfx.good();
      confetti([byNum(n).emoji, "⭐", "✨"]);
      fb.innerHTML = `<p class="fb good">정답! 반짝이 스티커가 됐어!</p>`;
      setTimeout(() => { if (current === n && $("#card").open) openCard(n, { holoNew: true }); }, 1100);
    } else {
      buttons[k].classList.add("wrong");
      sfx.bad();
      fb.innerHTML = `<p class="fb bad">아쉬워! 카드를 다시 보고 또 도전해 봐.</p>
        <button class="big-btn" id="ch-back">카드 다시 보기</button>`;
      $("#ch-back").onclick = () => openCard(n);
    }
  }

  function setupCard() {
    const dlg = $("#card");
    $("#card-close").onclick = () => dlg.close();
    for (const btn of $$("#card .nav-btn")) {
      btn.onclick = () => {
        const t = neighbor(current, btn.dataset.dir);
        if (t) openCard(t);
      };
    }
    $("#card-challenge").onclick = startChallenge;
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    const KEYS = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
    dlg.addEventListener("keydown", (e) => {
      if (!KEYS[e.key] || dlg.classList.contains("challenging")) return;
      e.preventDefault();
      const t = neighbor(current, KEYS[e.key]);
      if (t) openCard(t);
    });
  }

  // ---------- 화면 전환 ----------
  function showView(name) {
    $$(".view").forEach((v) => (v.hidden = v.id !== "view-" + name));
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === name));
    if (name === "quiz") Quiz.show();
    if (name === "kitchen") Kitchen.render();
    if (name === "table") refreshTableMarks();
    window.scrollTo({ top: 0 });
  }

  function setupSound() {
    const btn = $("#sound-toggle");
    const paint = () => (btn.textContent = Progress.data.muted ? "🔇" : "🔊");
    paint();
    btn.onclick = () => {
      Progress.data.muted = !Progress.data.muted;
      Progress.save();
      paint();
    };
  }

  // 기록 지우기: 어른용 메뉴 안에서, 두 자리 × 한 자리 곱셈을 맞혀야 해요
  let resetAnswer = 0;
  function newResetQuestion() {
    const a = 12 + Math.floor(Math.random() * 8);  // 12~19
    const b = 3 + Math.floor(Math.random() * 7);   // 3~9
    resetAnswer = a * b;
    $("#reset-q").textContent = `${a} × ${b}`;
    $("#reset-answer").value = "";
  }

  function setupReset() {
    newResetQuestion();
    $("#grown-up").addEventListener("toggle", () => { newResetQuestion(); $("#reset-msg").textContent = ""; });
    $("#reset-form").addEventListener("submit", (e) => {
      e.preventDefault();
      if (+$("#reset-answer").value !== resetAnswer) {
        $("#reset-msg").textContent = "답이 맞지 않아요. 새 문제로 다시 해 주세요.";
        newResetQuestion();
        return;
      }
      if (!confirm("정말 모든 기록을 지울까요? 되돌릴 수 없어요.")) return;
      Progress.reset();
      refreshTableMarks();
      updateCounters();
      Quiz.show(true);
      Kitchen.render();
      $("#grown-up").open = false;
      $("#reset-msg").textContent = "";
    });
  }

  function init() {
    Progress.load();
    renderTable();
    renderLegend();
    renderToday();
    setupSearch();
    setupCard();
    setupSound();
    $$(".tab").forEach((t) => (t.onclick = () => showView(t.dataset.view)));
    setupReset();
    updateCounters();
  }

  return { init, Progress, sfx, confetti, openCard, byNum, bySym, josa, updateCounters, neighbor };
})();
