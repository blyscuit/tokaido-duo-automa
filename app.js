(function () {
  'use strict';
  const L = window.AutomaLogic;
  const CHARS = L.CHARS, NAMES = L.NAMES;
  const COLORS = { pilgrim: 'var(--pilgrim)', merchant: 'var(--merchant)', artist: 'var(--artist)' };
  const GAINS = {
    pilgrim: 'a Garden, a Temple, or a Coastal town without a Painting tile',
    merchant: 'a Coastal town without a Painting tile',
    artist: 'an area without a coin',
  };
  const STEPS = ['Levels', 'Cards', 'Rank tokens', 'Board tokens', 'Meeples', 'First player'];

  const $ = (s, r) => (r || document).querySelector(s);
  const app = $('#app');

  /* ---------------- persistence (cookies, mirrored to localStorage) ---------------- */
  const COOKIE_STATE = 'automa_state';
  function setCookie(n, v) {
    try { document.cookie = n + '=' + encodeURIComponent(btoa(v)) + ';path=/;max-age=31536000;SameSite=Lax'; } catch (e) {}
  }
  function getCookie(n) {
    const m = document.cookie.split('; ').find((r) => r.startsWith(n + '='));
    if (!m) return null;
    try { return atob(decodeURIComponent(m.slice(n.length + 1))); } catch (e) { return null; }
  }
  function store(n, v) { setCookie(n, v); try { localStorage.setItem(n, v); } catch (e) {} }
  function load(n) {
    let v = getCookie(n);
    if (v == null) { try { v = localStorage.getItem(n); } catch (e) {} }
    try { return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  const fresh = () => ({ screen: 'setup', levels: { pilgrim: 2, merchant: 2, artist: 2 }, step: 0, checks: {}, starter: null, game: null });
  let S = Object.assign(fresh(), load(COOKIE_STATE) || {});
  if (!S.levels) { const l = S.level || 2; S.levels = { pilgrim: l, merchant: l, artist: l }; }
  let hist = [];
  const save = () => store(COOKIE_STATE, JSON.stringify(S));

  /* ---------------- helpers ---------------- */
  const card = (c) => L.getCard(c, S.levels[c]);
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600);
  }
  function mutate(fn) {
    hist.push(JSON.stringify({ g: S.game, l: S.levels })); if (hist.length > 60) hist.shift();
    fn(); save(); render();
  }
  function levelPicker(c, cur) {
    return '<div class="seg" role="group" aria-label="' + NAMES[c] + ' level">' +
      L.LEVELS.map((n) => '<button data-act="lvl" data-c="' + c + '" data-l="' + n + '" class="' + (n === cur ? 'on' : '') + '" aria-pressed="' + (n === cur) + '">' + n + '</button>').join('') + '</div>';
  }

  /* ---------------- real card image with tokens drawn on top ---------------- */
  function boardHTML(c, g, interactive) {
    const lvl = S.levels[c], d = card(c), P = L.POS[c + '-' + lvl];
    const pos = g ? g.pos[c] : -2;
    const w = g ? g.wave[c] : null;
    const dia = P.r * 2;
    const spot = (x, y, cls, inner, attrs) =>
      '<div class="' + cls + '" style="left:' + x + '%;top:' + y + '%;width:' + dia + '%" ' + (attrs || '') + '>' + inner + '</div>';
    let h = '<div class="board" style="--c:' + COLORS[c] + ';aspect-ratio:' + P.ar + '">' +
      '<img src="' + L.imgOf(c, lvl) + '" alt="' + NAMES[c] + ' card, level ' + lvl + '" draggable="false">';
    if (interactive) {
      h += spot(P.s[0], P.s[1], 'hs', '', 'data-act="setpos" data-c="' + c + '" data-i="-1" title="Move token to Start"');
      P.c.forEach((xy, i) => {
        h += spot(xy[0], xy[1], 'hs' + (pos >= i ? ' past' : ''), '', 'data-act="setpos" data-c="' + c + '" data-i="' + i + '" title="Move token here"');
      });
    }
    if (g) {
      const at = pos === -1 ? P.s : P.c[pos];
      if (at) h += spot(at[0], at[1], 'tok', '<img src="img/coin.png" alt="Rank token" draggable="false">');
      if (w.loc === 'automa' && w.pos !== 'off' && P.c[w.pos]) h += spot(P.c[w.pos][0], P.c[w.pos][1], 'wt', '🌊');
    }
    return h + '</div>';
  }

  /* ---------------- setup screens ---------------- */
  function progress() {
    return '<div class="progress">' + STEPS.map((_, i) => '<i class="' + (i <= S.step ? 'on' : '') + '"></i>').join('') + '</div>' +
      '<div class="small">Step ' + (S.step + 1) + ' of ' + STEPS.length + ' · ' + STEPS[S.step] + ' · checklist is optional</div>';
  }
  function chk(key, text) {
    return '<label class="check"><input type="checkbox" data-chk="' + key + '"' + (S.checks[key] ? ' checked' : '') + '><span>' + text + '</span></label>';
  }
  function nav(nextLabel) {
    return '<div class="row between" style="margin-top:14px">' +
      (S.step > 0 ? '<button data-act="back">← Back</button>' : '<span></span>') +
      '<button class="primary" data-act="next">' + (nextLabel || 'Next →') + '</button></div>';
  }
  const same = () => CHARS.every((c) => S.levels[c] === S.levels.pilgrim);

  function setupHTML() {
    let h = '<div class="panel">';
    if (S.step === 0) {
      h += '<h2>Choose Automa’s difficulty</h2><p class="small">Level 1 is easiest, Level 6 hardest. For a first play use Level 2. You can set a different level for each Character (the “Character Priority Variant”) — and change it later during the game.</p>';
      h += '<h3>All three Characters</h3><div class="seg big" role="group">' +
        L.LEVELS.map((n) => '<button data-act="all" data-l="' + n + '" class="' + (same() && S.levels.pilgrim === n ? 'on' : '') + '">' + n + '</button>').join('') + '</div>';
      h += '<h3 style="margin-top:14px">Per Character</h3>';
      CHARS.forEach((c) => {
        h += '<div class="cl" style="--c:' + COLORS[c] + '"><b>' + NAMES[c] + '</b>' + levelPicker(c, S.levels[c]) + '</div>';
      });
      h += nav();
    } else {
      h += progress();
      if (S.step === 1) {
        h += '<h2>1 · Take the 3 Character cards</h2><p>Take these cards and place the indicated side face up.</p>';
        CHARS.forEach((c) => {
          h += '<div class="cardrow" style="--c:' + COLORS[c] + '"><h3>' + NAMES[c] + ' · Level ' + S.levels[c] + '</h3>' + boardHTML(c, null, false) + '</div>';
        });
        h += chk('cards', 'I have the 3 cards face up');
        h += nav();
      } else if (S.step === 2) {
        h += '<h2>2 · Rank tokens</h2><p>Place <b>1 coin</b> (the <b>Rank token</b>) on the <b>“Start”</b> space of the Rank track on each Character card.</p>';
        CHARS.forEach((c) => { h += chk('tok-' + c, 'Rank token on <b style="color:' + COLORS[c] + '">' + NAMES[c] + '</b> card Start'); });
        h += nav();
      } else if (S.step === 3) {
        h += '<h2>3 · Board tokens</h2><p>Put <b>1 coin in each of the 2 central areas</b> and <b>1 purple Painting tile</b> on the Coastal town shown below.</p>' +
          '<p class="small">These tokens affect Automa’s scoring but <b>not</b> movement for you or Automa.</p>' +
          '<img class="photo" src="img/setup-board.jpg" alt="Board setup">';
        h += chk('coins', '1 coin in each of the 2 central areas');
        h += chk('paint', '1 purple Painting tile on the Coastal town');
        h += nav();
      } else if (S.step === 4) {
        h += '<h2>4 · Automa’s meeples</h2><p>Place Automa’s Character meeples (playing <b>purple</b>) on their starting spaces <b>furthest from the compass</b>.</p>' +
          '<img class="photo" src="img/setup-board.jpg" alt="Board setup">';
        CHARS.forEach((c) => { h += chk('mee-' + c, 'Purple <b style="color:' + COLORS[c] + '">' + NAMES[c] + '</b> meeple placed'); });
        h += nav();
      } else if (S.step === 5) {
        h += '<h2>5 · Who starts?</h2><p>Determine at random who starts the game.</p>' +
          '<div class="row"><button data-act="rand" class="primary">🎲 Pick randomly</button></div>' +
          (S.starter ? '<p style="font-size:1.4rem;font-weight:700;margin:14px 0">' + (S.starter === 'automa' ? 'Automa goes first' : 'You go first') + '</p>' : '') +
          '<p class="small">Or decide it your own way, then tap Start.</p>';
        h += '<div class="row between" style="margin-top:14px"><button data-act="back">← Back</button><button class="primary" data-act="start">Start game ▶</button></div>';
      }
    }
    return h + '</div>';
  }

  /* ---------------- game screen ---------------- */
  function gameHTML() {
    const g = S.game;
    const ranks = {}; CHARS.forEach((c) => { ranks[c] = L.rankOf(g, card(c), c); });
    const score = CHARS.reduce((a, c) => a + ranks[c], 0);
    let h = '<div class="panel"><div class="scorebar"><div><div class="small">Automa score</div><div class="score">' + score + '</div></div>' +
      '<div style="text-align:right"><div class="small">' + (S.starter === 'automa' ? 'Automa started' : S.starter === 'you' ? 'You started' : '') + '</div>' +
      '<div class="small">Ranks ' + CHARS.map((c) => ranks[c]).join(' + ') + '</div></div></div></div>';
    if (g.ended) h += '<div class="banner">🏁 A Rank token reached the final space — the game end is triggered. Finish per the main rules, then compare scores (tie → money; Automa has none).</div>';

    h += '<div class="panel"><h3>Wave tiles</h3><div class="wavebar">' + CHARS.map((c) => {
      const w = g.wave[c];
      const t = w.loc === 'board' ? 'On the board' : w.loc === 'user' ? 'You have it' : (w.pos === 'off' ? 'Automa · beside card' : 'Automa · on track');
      return '<button class="wchip ' + w.loc + '" style="--c:' + COLORS[c] + '" data-act="wtoggle" data-c="' + c + '"' + '><b>' + NAMES[c] + '</b>' + t + '</button>';
    }).join('') + '<button class="primary wgain" data-act="gain">🌊 Automa gains a Wave tile</button></div>' +
      '<p class="small">Tap a tile when <b>you</b> take it from the board (tap again to put it back). Tap a tile Automa holds to remove it from her card — “You have it”. Press “Automa gains a Wave tile” when her Pilgrim lands on a Seashore.</p></div>';

    CHARS.forEach((c) => {
      const d = card(c), pos = g.pos[c], last = d.nums.length - 1;
      h += '<section class="panel char" style="--c:' + COLORS[c] + '"><div class="cwrap"><div class="cleft">' + boardHTML(c, g, true) + '</div>' +
        '<div class="cright"><div><h3 style="color:' + COLORS[c] + '">' + NAMES[c] + '</h3><div class="small">Space ' + Math.max(pos + 1, 0) + ' of ' + d.nums.length + '</div></div>' +
        '<div><div class="small">Rank</div><div class="rankbig">' + ranks[c] + '</div></div>' +
        '<div class="small">Level ' + S.levels[c] + '</div>' +
        '<button class="primary" data-act="adv" data-c="' + c + '"' + (pos >= last ? ' disabled' : '') + '>Advance ▶</button>' +
        '<p class="small hint">Advance when ' + NAMES[c] + ' lands on ' + GAINS[c] + '. Tap a circle on the card to move the token.</p></div></div></section>';
    });

    const order = CHARS.slice().sort((a, b) => ranks[b] - ranks[a] || CHARS.indexOf(a) - CHARS.indexOf(b));
    h += '<details><summary>Turn guide</summary><ol>' +
      '<li><b>Seashore?</b> If the Pilgrim die would reach a Seashore and Automa lacks a Wave tile → she takes the Pilgrim die and gains a Wave tile.</li>' +
      '<li><b>Advance?</b> Check dice by decreasing Rank (tie: higher in column) for one that moves a Character onto a space that advances its track. She takes it and advances once.</li>' +
      '<li><b>Fallback:</b> otherwise she takes the available die with the highest Rank (tie: higher in column) and moves that Character if possible.</li></ol>' +
      '<table class="rk"><tr><th>Priority by Rank now</th><th>Rank</th></tr>' + order.map((c) => '<tr><td style="color:' + COLORS[c] + '"><b>' + NAMES[c] + '</b></td><td>' + ranks[c] + '</td></tr>').join('') + '</table>' +
      '<p class="small">Die column order: closest to the opposite side of the table on top; if unsure, the rightmost die goes above.</p></details>';
    return h;
  }

  function render() {
    $('#btnUndo').hidden = !(S.screen === 'game' && hist.length);
    app.innerHTML = S.screen === 'game' && S.game ? gameHTML() : setupHTML();
  }

  /* ---------------- events ---------------- */
  app.addEventListener('change', (e) => {
    const k = e.target.dataset && e.target.dataset.chk;
    if (k) { S.checks[k] = e.target.checked; save(); }
  });
  function setLevel(c, l) {
    S.levels[c] = l;
    const g = S.game;
    if (g) {
      const d = card(c), last = d.nums.length - 1;
      g.pos[c] = Math.min(g.pos[c], last);
      const w = g.wave[c];
      if (w.loc === 'automa') L.placeWave(g, d, c);
      g.ended = CHARS.some((x) => g.pos[x] >= card(x).nums.length - 1);
    }
  }
  app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act, c = el.dataset.c, g = S.game;
    if (act === 'all') { CHARS.forEach((x) => { S.levels[x] = +el.dataset.l; }); save(); render(); }
    else if (act === 'lvl') {
      if (S.levels[c] === +el.dataset.l) return;
      if (S.screen === 'game') mutate(() => setLevel(c, +el.dataset.l));
      else { S.levels[c] = +el.dataset.l; save(); render(); }
    }
    else if (act === 'next') { S.step = Math.min(S.step + 1, 5); save(); render(); window.scrollTo(0, 0); }
    else if (act === 'back') { S.step = Math.max(S.step - 1, 0); save(); render(); window.scrollTo(0, 0); }
    else if (act === 'rand') { S.starter = Math.random() < 0.5 ? 'automa' : 'you'; save(); render(); }
    else if (act === 'start') { S.game = L.newGameState(); S.screen = 'game'; hist = []; save(); render(); window.scrollTo(0, 0); }
    else if (act === 'adv') {
      mutate(() => {
        const r = L.advance(g, card(c), c);
        toast(r.extra ? NAMES[c] + ' landed on a Wave tile: +1 extra space, tile placed again' : NAMES[c] + ' advances');
      });
    } else if (act === 'wtoggle') {
      mutate(() => { const w = g.wave[c]; w.loc = w.loc === 'board' ? 'user' : w.loc === 'user' ? 'board' : 'user'; w.pos = null; });
    } else if (act === 'gain') {
      const probe = JSON.parse(JSON.stringify(g));
      const r = L.gainWave(probe, (x) => card(x));
      if (r.error) return toast(r.error);
      mutate(() => {
        const rr = L.gainWave(g, (x) => card(x));
        toast('Wave tile → ' + NAMES[rr.tile] + ' (taken from ' + (rr.from === 'board' ? 'the board' : 'your tiles') + ', highest Rank)');
      });
    } else if (act === 'setpos') {
      const i = +el.dataset.i;
      if (g.pos[c] === i) return;
      mutate(() => {
        g.pos[c] = i; g.ended = CHARS.some((x) => g.pos[x] >= card(x).nums.length - 1);
        if (g.wave[c].loc === 'automa' && (g.wave[c].pos === 'off' || g.wave[c].pos <= i)) L.placeWave(g, card(c), c);
      });
    }
  });

  $('#btnUndo').addEventListener('click', () => {
    if (!hist.length) return;
    const p = JSON.parse(hist.pop()); S.game = p.g; S.levels = p.l; save(); render(); toast('Undone');
  });
  $('#btnNew').addEventListener('click', () => {
    if (confirm('Start a new game? The current game and setup progress will be cleared.')) {
      const lv = S.levels; S = fresh(); S.levels = lv; hist = []; save(); render(); window.scrollTo(0, 0);
    }
  });

  /* rules dialog */
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]')) e.target.closest('dialog').close();
    else if (e.target.tagName === 'DIALOG') e.target.close();
  });
  const rulesDlg = $('#rulesDlg');
  $('#rulesNav').innerHTML = window.RULES.map((r, i) => '<button data-r="' + r.id + '"' + (i === 0 ? ' class="on"' : '') + '>' + r.title + '</button>').join('');
  $('#rulesBody').innerHTML = window.RULES.map((r) => '<section id="r-' + r.id + '"><h3>' + r.title + '</h3>' + r.html + '</section>').join('');
  $('#rulesNav').addEventListener('click', (e) => {
    const id = e.target.dataset && e.target.dataset.r; if (!id) return;
    $('#r-' + id).scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelectorAll('#rulesNav button').forEach((b) => b.classList.toggle('on', b === e.target));
  });
  $('#btnRules').addEventListener('click', () => { rulesDlg.showModal(); $('#rulesBody').scrollTop = 0; });

  /* ---------------- boot ---------------- */
  if (S.screen === 'game' && !S.game) S.screen = 'setup';
  render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
