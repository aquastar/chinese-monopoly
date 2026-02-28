const defaultChars = "一,二,三,四,五,六,七,八,九,十,人,口,手,足,耳,目,日,月,山,水,火,木,土,田,禾,上,下,左,右,中,大,小,多,少,来,去,天,地,风,雨,云,电,白,黑,红,黄,蓝,绿,金,玉,花,草,虫,鸟,鱼,牛,羊,马,车,门,开,关,东,西,南,北,前,后,里,外,高,低,长,短,早,晚,吃,喝,看,听,说,读,写,学,校,老,师,同,家,爸,妈,你,我,他,她,们,好,吗,在,有";

const el = {
  playerCount: document.getElementById('playerCount'),
  playerNames: document.getElementById('playerNames'),
  startCoins: document.getElementById('startCoins'),
  charList: document.getElementById('charList'),
  startGame: document.getElementById('startGame'),
  setupPanel: document.getElementById('setupPanel'),
  gamePanel: document.getElementById('gamePanel'),
  board: document.getElementById('board'),
  pathLines: document.getElementById('pathLines'),
  centerHub: document.querySelector('.center-hub'),
  centerChar: document.getElementById('centerChar'),
  players: document.getElementById('players'),
  turnInfo: document.getElementById('turnInfo'),
  rollBtn: document.getElementById('rollBtn'),
  rollResult: document.getElementById('rollResult'),
  judgeArea: document.getElementById('judgeArea'),
  challengeText: document.getElementById('challengeText'),
  correctBtn: document.getElementById('correctBtn'),
  wrongBtn: document.getElementById('wrongBtn'),
  buyArea: document.getElementById('buyArea'),
  buyText: document.getElementById('buyText'),
  buyYes: document.getElementById('buyYes'),
  buyNo: document.getElementById('buyNo'),
  nextTurn: document.getElementById('nextTurn'),
  log: document.getElementById('log')
};

const poiTemplates = [
  ['Chick-fil-A','CFA','#d71920'],['Chipotle','CHIP','#8a2b1d'],['McDonald\'s','MCD','#ffbc0d'],['Starbucks','SB','#00704a'],['Playtopia','PLAY','#7a4cff'],
  ['McKee Park','PARK','#2f8f4e'],['Aldi','ALDI','#1f64c8'],['Walmart','WAL','#1f5fbf'],['Kroger','KRO','#2b4aa0'],['消防局','FIRE','#e13b2c'],
  ['Sudduth','SCH','#355bc9'],['Hudson','SCH','#355bc9'],['SA','SCH','#355bc9'],['DMAA','TKD','#111827'],['加油站','GAS','#ff6a00'],
  ['医院','HOSP','#e53935'],['Domino Pizza','DOM','#1565c0'],['Library','LIB','#6d4c41'],['Cinema','MOV','#7b1fa2'],['Ice Cream','ICE','#ec407a'],
  ['Pet Shop','PET','#8d6e63'],['Pool','POOL','#039be5'],['Gym','GYM','#455a64'],['Museum','MUS','#546e7a'],['Bookstore','BOOK','#5d4037'],
  ['Bakery','BAKE','#f57c00'],['Fruit Store','FRUIT','#43a047'],['Zoo','ZOO','#2e7d32'],['Domino 2','DOM','#1565c0'],['Clinic','MED','#d32f2f'],
  ['Police','POL','#283593'],['Bus Stop','BUS','#00838f'],['Post Office','POST','#6a1b9a'],['Mall','MALL','#3949ab'],['Toy Store','TOY','#ef5350'],
  ['Bubble Tea','BTEA','#8e24aa'],['Noodle','NOOD','#fb8c00'],['Subway','SUB','#2e7d32'],['Pizza 2','PZA','#c62828'],['Farm','FARM','#558b2f'],
  ['Science Ctr','SCI','#00695c'],['Art Studio','ART','#ad1457'],['Music Hall','MUSI','#5e35b1'],['Skate Park','SK8','#00897b'],['Water Park','WPK','#0277bd']
].map(([name,logo,color]) => ({ name, logo, color }));

const TILE_W = 72;
const TILE_H = 102;

function generatePath(count = 50, boardW = 1320, boardH = 860) {
  // 方形边缘路线：严格防重叠（步长 >= 方格尺寸 + 2）
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

const game = {
  players: [],
  board: [],
  path: [],
  current: 0,
  pending: null,
  round: 1,
  over: false
};

el.charList.value = defaultChars;
renderNameInputs();

el.playerCount.addEventListener('change', renderNameInputs);
el.startGame.addEventListener('click', initGame);
el.rollBtn.addEventListener('click', rollDice);
el.correctBtn.addEventListener('click', () => judge(true));
el.wrongBtn.addEventListener('click', () => judge(false));
el.buyYes.addEventListener('click', () => handleBuy(true));
el.buyNo.addEventListener('click', () => handleBuy(false));
el.nextTurn.addEventListener('click', nextTurn);
window.addEventListener('resize', () => {
  if (!game.board.length) return;
  updateBoardLayout();
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

function initGame() {
  const chars = parseChars();
  if (chars.length < 30) return alert('字表太少，至少建议 30 个字。');

  const n = Number(el.playerCount.value);
  const startCoins = Number(el.startCoins.value || 20);
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
      eliminated: false
    });
  }

  const size = 50;
  game.board = Array.from({ length: size }, (_, i) => {
    const poi = poiTemplates[i % poiTemplates.length];
    let type = 'char';
    if ([8, 17, 26, 35, 44].includes(i)) type = 'penalty';
    if (i === 0) type = 'start';
    return {
      i,
      type,
      poiName: poi.name,
      poiLogo: poi.logo,
      poiColor: poi.color,
      owner: null,
      level: 0,
      price: 8 + (i % 5)
    };
  });
  game.charPool = chars;

  game.current = 0;
  game.pending = null;
  game.round = 1;
  game.over = false;
  if (el.centerChar) el.centerChar.textContent = '？';

  el.setupPanel.classList.add('hidden');
  document.getElementById('gamePanel').classList.remove('hidden');

  requestAnimationFrame(() => {
    updateBoardLayout();
    game.path = generatePath(game.board.length, el.board.clientWidth, el.board.clientHeight);
    log('游戏开始。');
    render();
  });
}

function rollDice() {
  if (game.over) return;
  const p = game.players[game.current];
  if (!p || p.eliminated) {
    nextTurn();
    return;
  }
  if (p.skip > 0) {
    p.skip--;
    log(`${p.icon} ${p.name} 本轮停走，还需跳过 ${p.skip} 轮。`);
    nextTurn();
    return;
  }

  const d = 1 + Math.floor(Math.random() * 6);
  p.pos = (p.pos + d) % game.board.length;
  const tile = game.board[p.pos];
  const ch = game.charPool[Math.floor(Math.random() * game.charPool.length)];
  el.rollResult.textContent = `${p.icon} ${p.name} 掷出了 ${d} 点，来到 #${tile.i}。`;
  game.pending = { tile, char: ch, playerId: p.id, canAvoidPenalty: tile.type === 'penalty' };
  el.challengeText.textContent = `请 ${p.name} 读出这个字：${ch}`;
  if (el.centerChar) el.centerChar.textContent = ch;
  el.judgeArea.classList.remove('hidden');
  el.rollBtn.disabled = true;
  render();
}

function judge(correct) {
  const pending = game.pending;
  if (!pending || game.over) return;

  const p = game.players[pending.playerId];
  const tile = pending.tile;
  const currentChar = pending.char;
  el.judgeArea.classList.add('hidden');

  p.attempts += 1;
  if (correct) p.correct += 1;

  if (correct) {
    p.coins += 3;
    log(`${p.icon} ${p.name} 读对“${currentChar}”，+3金币。`);

    if (tile.type === 'penalty') {
      log(`${p.name} 因答对，免除惩罚。`);
      maybeChanceCard(p, true);
      checkEliminationAndWinner();
      if (!game.over) prepareNextTurn();
      return;
    }

    if (tile.type === 'char') {
      if (tile.owner === null) {
        if (Math.random() < 0.45) {
          showBuyDialog(p, tile);
          return;
        } else {
          log('本次没有触发购买机会。');
        }
      } else if (tile.owner !== p.id) {
        const owner = game.players[tile.owner];
        log(`✅ ${p.name} 读对了字，免除 ${owner.name} 地块的过路费。`);
      } else if (tile.owner === p.id && tile.level === 1) {
        tile.level = 2;
        log(`⬆️ ${p.name} 再次到达自己的地块 #${tile.i}，升级为 Lv2（过路费 2 金币）。`);
      }
      maybeChanceCard(p, true);
    }
  } else {
    log(`${p.icon} ${p.name} 读错“${currentChar}”。`);
    if (tile.type === 'penalty') {
      applyPenalty(p);
    } else if (tile.type === 'char' && tile.owner !== null && tile.owner !== p.id) {
      const owner = game.players[tile.owner];
      const rent = tile.level >= 2 ? 2 : 1;
      p.coins -= rent;
      owner.coins += rent;
      log(`❌ 读错触发收费：${p.name} 向 ${owner.name} 支付过路费 ${rent}（Lv${tile.level || 1}）。`);
      maybeChanceCard(p, false);
    } else {
      maybeChanceCard(p, false);
    }
  }

  checkEliminationAndWinner();
  if (!game.over) prepareNextTurn();
}

function showBuyDialog(player, tile) {
  el.buyText.textContent = `触发购买机会：地块 #${tile.i} ${tile.poiName}，价格 ${tile.price} 金币。当前你有 ${player.coins} 金币。`;
  el.buyArea.classList.remove('hidden');
  game.pending.buying = true;
}

function handleBuy(yes) {
  const pending = game.pending;
  if (!pending || !pending.buying) return;
  const p = game.players[pending.playerId];
  const tile = pending.tile;

  if (yes) {
    if (p.coins >= tile.price) {
      p.coins -= tile.price;
      tile.owner = p.id;
      tile.level = 1;
      p.lands.add(tile.i);
      log(`${p.name} 购买了地块 #${tile.i}（Lv1）。`);
    } else {
      log(`${p.name} 金币不足，购买失败。`);
    }
  } else {
    log(`${p.name} 放弃购买地块 #${tile.i}。`);
  }

  maybeChanceCard(p, true);
  checkEliminationAndWinner();
  el.buyArea.classList.add('hidden');
  if (!game.over) prepareNextTurn();
}

function applyPenalty(p) {
  const t = Math.floor(Math.random() * 3);
  if (t === 0) {
    p.skip += 1;
    log(`惩罚：${p.name} 停止下一轮。`);
  } else if (t === 1) {
    const loss = Math.min(5, p.coins);
    p.coins -= loss;
    log(`惩罚：${p.name} 丢失 ${loss} 金币。`);
  } else {
    if (p.lands.size > 0) {
      const idx = [...p.lands][Math.floor(Math.random() * p.lands.size)];
      p.lands.delete(idx);
      game.board[idx].owner = null;
      log(`惩罚：${p.name} 丢失地块 #${idx}。`);
    } else {
      log(`惩罚触发“丢地”，但 ${p.name} 没有地，改为罚 2 金币。`);
      p.coins -= 2;
    }
  }
}

function maybeChanceCard(p, answeredCorrect) {
  if (Math.random() > 0.35) return;
  const cards = [
    { text: '机会卡：答题奖励，额外 +4 金币。', run: () => (p.coins += 4) },
    { text: '机会卡：知识分享，前进 2 格（不额外判题）。', run: () => (p.pos = (p.pos + 2) % game.board.length) },
    { text: '机会卡：课堂小考，若本轮答对再 +2 金币。', run: () => answeredCorrect && (p.coins += 2) },
    { text: '机会卡：课间休息，下轮免疫一次惩罚。', run: () => (p.skip = Math.max(0, p.skip - 1)) },
    { text: '机会卡：教材购买，-3 金币。', run: () => (p.coins -= 3) },
    { text: '机会卡：助教奖励，随机获得一块空地。', run: () => grantRandomLand(p) }
  ];
  const c = cards[Math.floor(Math.random() * cards.length)];
  c.run();
  log(c.text);
}

function grantRandomLand(p) {
  const empties = game.board.filter(t => t.type === 'char' && t.owner === null);
  if (!empties.length) {
    p.coins += 2;
    log('（没有空地，改为 +2 金币）');
    return;
  }
  const tile = empties[Math.floor(Math.random() * empties.length)];
  tile.owner = p.id;
  tile.level = 1;
  p.lands.add(tile.i);
}

function sellOneLandForCash(p) {
  if (!p.lands.size) return false;
  const idx = [...p.lands].sort((a, b) => game.board[b].price - game.board[a].price)[0];
  const tile = game.board[idx];
  p.lands.delete(idx);
  tile.owner = null;
  tile.level = 0;
  const cash = tile.price;
  p.coins += cash;
  log(`💸 ${p.name} 被迫卖出地块 #${idx}（${tile.poiName}），回收 ${cash} 金币。`);
  return true;
}

function clearAllOwnership() {
  game.players.forEach(pl => pl.lands.clear());
  game.board.forEach(t => {
    t.owner = null;
    t.level = 0;
  });
  log('🧹 由于破产未能回正，所有地皮持有关系已清空，重新开放购买。');
}

function resolveBankruptcy(p) {
  if (p.eliminated || p.coins >= 0) return;
  while (p.coins < 0 && p.lands.size > 0) {
    if (!sellOneLandForCash(p)) break;
  }
  if (p.coins < 0) {
    p.eliminated = true;
    log(`💥 ${p.name} 资产仍为负（${p.coins}），出局。`);
    clearAllOwnership();
  } else {
    log(`✅ ${p.name} 通过变卖地皮回到非负资产（${p.coins}）。`);
  }
}

function checkEliminationAndWinner() {
  game.players.forEach(p => {
    if (!p.eliminated && p.coins < 0) resolveBankruptcy(p);
  });
  const alive = game.players.filter(p => !p.eliminated);
  if (alive.length <= 1) {
    game.over = true;
    el.rollBtn.disabled = true;
    el.nextTurn.classList.add('hidden');
    if (alive.length === 1) log(`🏆 游戏结束，${alive[0].name} 获胜！`);
    else log('🏁 游戏结束，无人存活。');
  }
}

function prepareNextTurn() {
  el.nextTurn.classList.remove('hidden');
  el.rollBtn.disabled = true;
  game.pending = null;
  render();
}

function nextTurn() {
  if (game.over) return;
  el.nextTurn.classList.add('hidden');
  el.buyArea.classList.add('hidden');
  el.rollBtn.disabled = false;
  el.rollResult.textContent = '';

  let guard = 0;
  do {
    game.current = (game.current + 1) % game.players.length;
    if (game.current === 0) game.round++;
    guard++;
  } while (game.players[game.current].eliminated && guard < game.players.length + 1);

  render();
}

function render() {
  // board
  el.board.querySelectorAll('.tile').forEach(n => n.remove());
  const points = [];
  for (const tile of game.board) {
    const div = document.createElement('div');
    const currentPlayer = game.players[game.current];
    const hasCurrent = currentPlayer && currentPlayer.pos === tile.i;
    const herePlayers = game.players.filter(p => !p.eliminated && p.pos === tile.i);
    const ownedClass = tile.owner !== null ? ' owned' : '';
    div.className = 'tile' + ownedClass + (hasCurrent ? ' active' : '') + (herePlayers.length ? ' occupied' : '');
    if (tile.owner !== null) {
      div.style.setProperty('--owner-color', game.players[tile.owner].color);
    }
    if (herePlayers.length) {
      const color = hasCurrent ? currentPlayer.color : herePlayers[0].color;
      div.style.setProperty('--occ-color', color);
    }
    const ownerName = tile.owner === null ? '' : `地主：${game.players[tile.owner].icon}${game.players[tile.owner].name} Lv${tile.level}`;
    const tag = tile.type === 'penalty' ? '⚠️惩罚格' : tile.type === 'start' ? '🏁起点' : '';
    const here = herePlayers.map(p => p.icon).join(' ');
    const [left, top] = game.path[tile.i];
    div.style.left = `${left}px`;
    div.style.top = `${top}px`;
    div.style.transform = 'none';
    div.innerHTML = `<div class="idx">#${tile.i}</div><div class="logo" style="background:${tile.poiColor}">${tile.poiLogo}</div><div class="poi-name">${tile.poiName}</div><div class="tag">${tag}</div><div class="owner">${ownerName}</div><div class="tokens">${here}</div>`;
    el.board.appendChild(div);
    points.push([left + TILE_W / 2, top + TILE_H / 2]);
  }

  renderPathLines(points);

  // players
  el.players.innerHTML = '';
  game.players.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'player' + (i === game.current ? ' current' : '') + (p.eliminated ? ' eliminated' : '');
    const acc = p.attempts ? Math.round((p.correct / p.attempts) * 100) : 0;
    card.innerHTML = `<div class="name">${p.icon} ${p.name} ${p.eliminated ? '（出局）' : ''}</div>
      <div>金币：${p.coins}</div>
      <div>位置：#${p.pos}</div>
      <div>地皮数：${p.lands.size}</div>
      <div>识字正确率：${p.correct}/${p.attempts} (${acc}%)</div>
      <div>跳过轮次：${p.skip}</div>`;
    el.players.appendChild(card);
  });

  const cur = game.players[game.current];
  el.turnInfo.textContent = game.over
    ? '游戏已结束'
    : `第 ${game.round} 轮 · 当前：${cur?.icon || ''}${cur?.name || '-'}。`;
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
  points.forEach(([x, y], i) => {
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('r', i === 0 ? 5 : 3.2);
    dot.setAttribute('class', 'dot');
    el.pathLines.appendChild(dot);
  });
}

function log(msg) {
  const t = new Date().toLocaleTimeString();
  el.log.innerHTML = `[${t}] ${msg}<br>` + el.log.innerHTML;
}