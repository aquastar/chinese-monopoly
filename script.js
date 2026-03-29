const defaultChars = "一,二,三,四,五,六,七,八,九,十,人,口,手,足,耳,目,日,月,山,水,火,木,土,田,禾,上,下,左,右,中,大,小,多,少,来,去,天,地,风,雨,云,电,白,黑,红,黄,蓝,绿,金,玉,花,草,虫,鸟,鱼,牛,羊,马,车,门,开,关,东,西,南,北,前,后,里,外,高,低,长,短,早,晚,吃,喝,看,听,说,读,写,学,校,老,师,同,家,爸,妈,你,我,他,她,们,好,吗,在,有";

const el = {
  playerCount: document.getElementById('playerCount'),
  playerNames: document.getElementById('playerNames'),
  startCoins: document.getElementById('startCoins'),
  tollAmount: document.getElementById('tollAmount'),
  correctOwnedAction: document.getElementById('correctOwnedAction'),
  charList: document.getElementById('charList'),
  startGame: document.getElementById('startGame'),
  setupPanel: document.getElementById('setupPanel'),
  gamePanel: document.getElementById('gamePanel'),
  board: document.getElementById('board'),
  pathLines: document.getElementById('pathLines'),
  centerHub: document.querySelector('.center-hub'),
  centerChar: document.getElementById('centerChar'),
  centerPinyin: document.getElementById('centerPinyin'),
  players: document.getElementById('players'),
  turnInfo: document.getElementById('turnInfo'),
  rollBtn: document.getElementById('rollBtn'),
  rollResult: document.getElementById('rollResult'),
  challengeText: document.getElementById('challengeText'),
  countdownText: document.getElementById('countdownText'),
  correctBtn: document.getElementById('correctBtn'),
  wrongBtn: document.getElementById('wrongBtn'),
  fxLayer: document.getElementById('fxLayer'),
  wrongFlash: document.getElementById('wrongFlash')
};

const poiTemplates = [
  ['福乐鸡','福乐鸡','#d71920'],['奇波雷','卷饼','#8a2b1d'],['麦当劳','麦当劳','#ffbc0d'],['星巴克','星巴克','#00704a'],['儿童乐园','乐园','#7a4cff'],
  ['麦基公园','公园','#2f8f4e'],['奥乐齐','奥乐齐','#1f64c8'],['沃尔玛','沃尔玛','#1f5fbf'],['克罗格','克罗格','#2b4aa0'],['消防局','消防','#e13b2c'],
  ['Sudduth 学校','学校','#355bc9'],['Hudson 学校','学校','#355bc9'],['SA 学校','学校','#355bc9'],['DMAA 跆拳道','跆拳道','#111827'],['加油站','加油','#ff6a00'],
  ['医院','医院','#e53935'],['达美乐披萨','披萨','#1565c0'],['图书馆','图书馆','#6d4c41'],['电影院','电影','#7b1fa2'],['冰淇淋店','冰淇淋','#ec407a'],
  ['宠物店','宠物','#8d6e63'],['游泳池','泳池','#039be5'],['健身房','健身','#455a64'],['博物馆','博物馆','#546e7a'],['书店','书店','#5d4037'],
  ['面包店','面包','#f57c00'],['水果店','水果','#43a047'],['动物园','动物园','#2e7d32'],['披萨店','披萨','#1565c0'],['诊所','诊所','#d32f2f'],
  ['警察局','警察','#283593'],['公交站','公交','#00838f'],['邮局','邮局','#6a1b9a'],['商场','商场','#3949ab'],['玩具店','玩具','#ef5350'],
  ['奶茶店','奶茶','#8e24aa'],['面馆','面馆','#fb8c00'],['赛百味','赛百味','#2e7d32'],['披萨屋','披萨','#c62828'],['农场','农场','#558b2f'],
  ['科学中心','科学','#00695c'],['美术教室','美术','#ad1457'],['音乐厅','音乐','#5e35b1'],['滑板公园','滑板','#00897b'],['水上乐园','水乐园','#0277bd']
].map(([name,logo,color]) => ({ name, logo, color }));

const TILE_W = 72;
const TILE_H = 102;
const TILE_GAP = 14;

const CHAR_INFO = {};

function calculateBoardSize(boardW = 1320, boardH = 860) {
  const margin = 20;
  const left = margin;
  const top = margin;
  const right = Math.max(left + 400, boardW - TILE_W - margin);
  const bottom = Math.max(top + 300, boardH - TILE_H - margin);
  const w = right - left;
  const h = bottom - top;
  const perimeter = 2 * (w + h);
  const spacing = Math.max(TILE_W, TILE_H) + TILE_GAP;
  const maxCount = Math.max(24, Math.floor(perimeter / spacing));
  return Math.min(52, maxCount);
}

function generatePath(count = 50, boardW = 1320, boardH = 860) {
  const margin = 20;
  const left = margin;
  const top = margin;
  const right = Math.max(left + 400, boardW - TILE_W - margin);
  const bottom = Math.max(top + 300, boardH - TILE_H - margin);
  const w = right - left;
  const h = bottom - top;
  const perimeter = 2 * (w + h);
  const minStep = Math.max(TILE_W, TILE_H) + 2;
  const step = Math.max(minStep, perimeter / count);

  const path = [];
  for (let i = 0; i < count; i++) {
    let d = (i * step) % perimeter;
    let x, y;
    if (d < w) {
      x = left + d; y = top;
    } else if (d < w + h) {
      d -= w; x = right; y = top + d;
    } else if (d < 2 * w + h) {
      d -= (w + h); x = right - d; y = bottom;
    } else {
      d -= (2 * w + h); x = left; y = bottom - d;
    }
    path.push([Math.round(x), Math.round(y)]);
  }
  return path;
}

function updateBoardLayout() {
  const bw = el.board.clientWidth;
  const bh = el.board.clientHeight;
  const safePadX = TILE_W + 34;
  const safePadY = TILE_H + 34;
  const hubW = Math.max(520, bw - safePadX * 2);
  const hubH = Math.max(360, bh - safePadY * 2);
  if (el.centerHub) {
    el.centerHub.style.setProperty('--hub-w', `${Math.min(hubW, bw - 24)}px`);
    el.centerHub.style.setProperty('--hub-h', `${Math.min(hubH, bh - 24)}px`);
  }
}

function getTileFace(left, top) {
  const bw = el.board.clientWidth || 1320;
  const bh = el.board.clientHeight || 860;
  const distTop = top;
  const distBottom = Math.abs((bh - TILE_H) - top);
  const distLeft = left;
  const distRight = Math.abs((bw - TILE_W) - left);
  const min = Math.min(distTop, distBottom, distLeft, distRight);
  if (min === distTop) return 'top';
  if (min === distBottom) return 'bottom';
  if (min === distLeft) return 'left';
  return 'right';
}

const game = {
  players: [],
  board: [],
  path: [],
  current: 0,
  pending: null,
  round: 1,
  over: false,
  timerId: null,
  timerLeft: 0,
  movingPlayerId: null,
  movingPath: [],
  settings: {
    tollAmount: 10,
    correctOwnedAction: 'steal'
  }
};

el.charList.value = defaultChars;
renderNameInputs();

el.playerCount.addEventListener('change', renderNameInputs);
el.startGame.addEventListener('click', initGame);
el.rollBtn.addEventListener('click', rollDice);
el.correctBtn.addEventListener('click', () => judge(true));
el.wrongBtn.addEventListener('click', () => judge(false));
window.addEventListener('resize', () => {
  if (!game.board.length) return;
  updateBoardLayout();
  resizeBoardToViewport();
  game.path = generatePath(game.board.length, el.board.clientWidth, el.board.clientHeight);
  render();
});

function renderNameInputs() {
  const n = Number(el.playerCount.value);
  el.playerNames.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<label>玩家${i + 1}名字</label><input id="pname-${i}" value="玩家${i + 1}" />`;
    el.playerNames.appendChild(row);
  }
}

function parseChars() {
  return [...new Set(el.charList.value.split(/[\s,，、]+/).map(s => s.trim()).filter(Boolean))];
}

function buildBoard(size) {
  game.board = Array.from({ length: size }, (_, i) => {
    const poi = poiTemplates[i % poiTemplates.length];
    let type = 'char';
    if (i === 0) type = 'start';
    return {
      i,
      type,
      poiName: poi.name,
      poiLogo: poi.logo,
      poiColor: poi.color,
      owner: null,
      level: 0,
      price: 5
    };
  });
}

function resizeBoardToViewport() {
  const nextSize = calculateBoardSize(el.board.clientWidth, el.board.clientHeight);
  if (!game.board.length || nextSize === game.board.length) return;
  buildBoard(nextSize);
}

function initGame() {
  const chars = parseChars();
  if (chars.length < 30) return alert('字表太少，至少建议 30 个字。');

  const n = Number(el.playerCount.value);
  const startCoins = Number(el.startCoins.value || 100);
  game.settings.tollAmount = Math.max(0, Number(el.tollAmount.value || 10));
  game.settings.correctOwnedAction = el.correctOwnedAction.value || 'steal';
  const animals = ['🐯','🐰','🐼','🐵','🦊','🐸'];
  const colors = ['#e74c3c', '#3498db', '#27ae60', '#f39c12', '#8e44ad', '#16a085'];
  game.players = [];
  for (let i = 0; i < n; i++) {
    const name = document.getElementById(`pname-${i}`).value.trim() || `玩家${i + 1}`;
    game.players.push({
      id: i,
      name,
      icon: animals[i % animals.length],
      color: colors[i % colors.length],
      pos: 0,
      coins: startCoins,
      lands: new Set(),
      skip: 0,
      attempts: 0,
      correct: 0,
      correctChars: [],
      wrongChars: [],
      tollIncome: 0,
      eliminated: false
    });
  }

  const size = calculateBoardSize(el.board.clientWidth || 1320, el.board.clientHeight || 860);
  buildBoard(size);
  game.charPool = chars;
  game.current = 0;
  game.pending = null;
  game.round = 1;
  game.over = false;
  updateCenterCharInfo('？');
  if (el.correctBtn) el.correctBtn.disabled = true;
  if (el.wrongBtn) el.wrongBtn.disabled = true;

  el.setupPanel.classList.add('hidden');
  document.getElementById('gamePanel').classList.remove('hidden');

  requestAnimationFrame(() => {
    updateBoardLayout();
    game.path = generatePath(game.board.length, el.board.clientWidth, el.board.clientHeight);
    render();
  });
}

function getCharInfo(ch) {
  return CHAR_INFO[ch] || { pinyin: '—' };
}

function updateCenterCharInfo(ch, reveal = false) {
  const info = getCharInfo(ch);
  if (el.centerChar) el.centerChar.textContent = ch;
  if (el.centerPinyin) el.centerPinyin.textContent = reveal ? info.pinyin : '•••';
}

function pickCharForPlayer(player) {
  const unseen = game.charPool.filter(ch => !player.correctChars?.includes(ch) && !player.wrongChars.includes(ch));
  const wrong = player.wrongChars || [];
  const correct = player.correctChars || [];
  const primary = [...new Set([...wrong, ...unseen])];
  const useCorrect = correct.length && Math.random() < 0.1;
  const pool = useCorrect ? correct : (primary.length ? primary : game.charPool);
  return pool[Math.floor(Math.random() * pool.length)];
}

function clearTurnTimer() {
  if (game.timerId) clearInterval(game.timerId);
  game.timerId = null;
}

function startTurnTimer() {
  clearTurnTimer();
  game.timerLeft = 10;
  if (el.countdownText) el.countdownText.textContent = `剩余 ${game.timerLeft} 秒`;
  game.timerId = setInterval(() => {
    game.timerLeft -= 1;
    if (el.countdownText) el.countdownText.textContent = `剩余 ${game.timerLeft} 秒`;
    if (game.timerLeft <= 0) {
      clearTurnTimer();
      judge(false, true);
    }
  }, 1000);
}

async function animatePlayerMove(player, steps) {
  game.movingPlayerId = player.id;
  game.movingPath = [player.pos];
  render();
  await new Promise(r => setTimeout(r, 280));
  for (let i = 0; i < steps; i++) {
    player.pos = (player.pos + 1) % game.board.length;
    game.movingPath.push(player.pos);
    render();
    await new Promise(r => setTimeout(r, 260));
  }
  game.movingPath = [];
  game.movingPlayerId = null;
  render();
}

async function rollDice() {
  if (game.over || el.rollBtn.disabled === true) return;
  const p = game.players[game.current];
  if (!p || p.eliminated) {
    prepareNextTurn();
    return;
  }
  if (p.skip > 0) {
    p.skip--;
    prepareNextTurn();
    return;
  }

  el.rollBtn.disabled = true;
  const d = 1 + Math.floor(Math.random() * 6);
  const startPos = p.pos;
  await animatePlayerMove(p, d);
  const tile = game.board[p.pos];
  const ch = pickCharForPlayer(p);
  el.rollResult.textContent = `${p.icon} ${p.name} 从 #${startPos} 掷出了 ${d} 点，来到 #${tile.i}。`;
  game.pending = { tile, char: ch, playerId: p.id };
  el.challengeText.textContent = `请 ${p.name} 读出这个字：${ch}`;
  updateCenterCharInfo(ch, false);
  if (el.correctBtn) el.correctBtn.disabled = false;
  if (el.wrongBtn) el.wrongBtn.disabled = false;
  startTurnTimer();
  render();
}

function judge(correct, autoWrong = false) {
  const pending = game.pending;
  if (!pending || game.over) return;
  clearTurnTimer();
  const p = game.players[pending.playerId];
  const tile = pending.tile;
  const currentChar = pending.char;
  if (el.correctBtn) el.correctBtn.disabled = true;
  if (el.wrongBtn) el.wrongBtn.disabled = true;
  updateCenterCharInfo(currentChar, true);

  p.attempts += 1;
  if (correct) {
    p.correct += 1;
    if (!p.correctChars.includes(currentChar)) p.correctChars.push(currentChar);
  } else if (!p.wrongChars.includes(currentChar)) p.wrongChars.push(currentChar);

  if (correct) {
    triggerCorrectFX();
    p.coins += 3;
    if (tile.type === 'char' && tile.owner === null) {
      tile.owner = p.id;
      tile.level = 1;
      p.lands.add(tile.i);
    }
  } else {
    triggerWrongFX();
    if (tile.type === 'char' && tile.owner !== null && tile.owner !== p.id) {
      const owner = game.players[tile.owner];
      const rent = game.settings.tollAmount;
      p.coins -= rent;
      owner.coins += rent;
      owner.tollIncome += rent;
    }
  }

  if (!game.over) prepareNextTurn();
}

function prepareNextTurn() {
  game.pending = null;
  el.rollBtn.disabled = false;
  let guard = 0;
  do {
    game.current = (game.current + 1) % game.players.length;
    if (game.current === 0) game.round++;
    guard++;
  } while (game.players[game.current].eliminated && guard < game.players.length + 1);
  el.rollResult.textContent = '';
  render();
}

function render() {
  el.board.querySelectorAll('.tile, .player-token-float').forEach(n => n.remove());
  const points = [];
  for (const tile of game.board) {
    const div = document.createElement('div');
    const currentPlayer = game.players[game.current];
    const movingGlow = game.movingPath.includes(tile.i);
    const hasCurrent = currentPlayer && currentPlayer.pos === tile.i;
    const herePlayers = game.players.filter(p => !p.eliminated && p.pos === tile.i);
    const ownedClass = tile.owner !== null ? ' owned' : '';
    const [left, top] = game.path[tile.i];
    const face = getTileFace(left, top);
    div.className = 'tile face-' + face + ownedClass + (hasCurrent ? ' active' : '') + (herePlayers.length ? ' occupied' : '') + (movingGlow ? ' moving-glow' : '');
    if (tile.owner !== null) div.style.setProperty('--owner-color', game.players[tile.owner].color);
    if (herePlayers.length) div.style.setProperty('--occ-color', hasCurrent ? currentPlayer.color : herePlayers[0].color);
    const ownerName = tile.owner === null ? '' : `地主：${game.players[tile.owner].icon}${game.players[tile.owner].name}`;
    const tag = tile.type === 'start' ? '🏁起点' : '';
    const here = herePlayers.filter(p => p.id !== game.current).map(p => p.icon).join(' ');
    div.style.left = `${left}px`;
    div.style.top = `${top}px`;
    div.innerHTML = `<div class="idx">#${tile.i}</div><div class="logo" style="background:${tile.poiColor}">${tile.poiLogo}</div><div class="poi-name">${tile.poiName}</div><div class="tag">${tag}</div><div class="owner">${ownerName}</div><div class="tokens">${here}</div>`;
    el.board.appendChild(div);
    points.push([left + TILE_W / 2, top + TILE_H / 2]);
  }

  const curFloat = game.players[game.current];
  if (curFloat) {
    const [left, top] = game.path[curFloat.pos];
    const token = document.createElement('div');
    token.className = 'player-token-float' + (game.movingPlayerId === curFloat.id ? ' moving' : '');
    token.style.setProperty('--player-accent', curFloat.color);
    token.style.left = `${left + TILE_W + 8}px`;
    token.style.top = `${top - 4}px`;
    token.innerHTML = `<span class="token-emoji">${curFloat.icon}</span><span class="token-coins">💰 ${curFloat.coins}</span>`;
    el.board.appendChild(token);
  }

  renderPathLines(points);

  el.players.innerHTML = '';
  const rankedPlayers = [...game.players].sort((a, b) => b.coins - a.coins || b.lands.size - a.lands.size || a.id - b.id);
  rankedPlayers.forEach((p, rank) => {
    const card = document.createElement('div');
    card.className = 'player' + (p.id === game.current ? ' current' : '') + (p.eliminated ? ' eliminated' : '') + (rank === 0 ? ' leader' : '');
    card.style.setProperty('--player-accent', p.color);
    const acc = p.attempts ? Math.round((p.correct / p.attempts) * 100) : 0;
    const wrongText = p.wrongChars.length ? p.wrongChars.join('、') : '暂无';
    card.innerHTML = `<div class="player-main"><div class="player-left"><div class="player-head"><div class="player-badge">${p.icon}</div><div class="player-title"><div class="name">${rank === 0 ? '🥇 ' : ''}${p.name} ${p.eliminated ? '（出局）' : ''}</div><div class="player-sub">位置 #${p.pos} · 地皮 ${p.lands.size}</div></div></div><div class="player-stats"><span class="stat-pill">金币 ${p.coins}</span><span class="stat-pill">过路费 ${p.tollIncome}</span><span class="stat-pill">正确率 ${acc}%</span></div></div><div class="player-wrong"><strong>答错的字：</strong>${wrongText}</div></div>`;
    el.players.appendChild(card);
  });

  const cur = game.players[game.current];
  el.turnInfo.textContent = game.over ? '游戏已结束' : `第 ${game.round} 轮 · 当前：${cur?.icon || ''}${cur?.name || '-'}。`;
}

function renderPathLines(points) {
  if (!el.pathLines) return;
  const ns = 'http://www.w3.org/2000/svg';
  el.pathLines.innerHTML = '';
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', 'seg');
    el.pathLines.appendChild(line);
  }
}

function triggerCorrectFX() {
  if (!el.fxLayer) return;
  const bursts = 36;
  const colors = ['#ff4d6d', '#ffb703', '#3a86ff', '#06d6a0', '#8338ec', '#fb5607'];
  for (let i = 0; i < bursts; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${8 + Math.random() * 84}%`;
    piece.style.top = `${8 + Math.random() * 28}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--dx', `${(Math.random() - 0.5) * 700}px`);
    piece.style.setProperty('--dy', `${160 + Math.random() * 340}px`);
    piece.style.setProperty('--rot', `${Math.random() * 1080 - 540}deg`);
    piece.style.setProperty('--dur', `${900 + Math.random() * 700}ms`);
    el.fxLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 2000);
  }

  if (el.centerChar) {
    el.centerChar.classList.remove('correct-bounce');
    void el.centerChar.offsetWidth;
    el.centerChar.classList.add('correct-bounce');
    setTimeout(() => el.centerChar?.classList.remove('correct-bounce'), 900);
  }
}

function triggerWrongFX() {
  if (!el.wrongFlash) return;
  el.wrongFlash.classList.remove('hidden');
  el.wrongFlash.classList.remove('animate');
  void el.wrongFlash.offsetWidth;
  el.wrongFlash.classList.add('animate');

  if (el.centerChar) {
    el.centerChar.classList.remove('wrong-shake');
    void el.centerChar.offsetWidth;
    el.centerChar.classList.add('wrong-shake');
    setTimeout(() => el.centerChar?.classList.remove('wrong-shake'), 700);
  }

  setTimeout(() => {
    el.wrongFlash.classList.add('hidden');
    el.wrongFlash.classList.remove('animate');
  }, 1100);
}
