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
  centerStroke: document.getElementById('centerStroke'),
  centerWords: document.getElementById('centerWords'),
  players: document.getElementById('players'),
  turnInfo: document.getElementById('turnInfo'),
  rollBtn: document.getElementById('rollBtn'),
  rollResult: document.getElementById('rollResult'),
  judgeArea: document.getElementById('judgeArea'),
  challengeText: document.getElementById('challengeText'),
  correctBtn: document.getElementById('correctBtn'),
  wrongBtn: document.getElementById('wrongBtn'),
  nextTurn: document.getElementById('nextTurn'),
  log: document.getElementById('log'),
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

const CHAR_INFO = {
  '一': { pinyin: 'yī', stroke: '横', words: '一个、一人、一月' },
  '二': { pinyin: 'èr', stroke: '横、横', words: '二月、二人、二十' },
  '三': { pinyin: 'sān', stroke: '横、横、横', words: '三个、三天、三月' },
  '四': { pinyin: 'sì', stroke: '竖、横折、撇、竖弯、横', words: '四个、四天、四月' },
  '五': { pinyin: 'wǔ', stroke: '横、竖、横折、横、竖、横', words: '五个、五月、五天' },
  '六': { pinyin: 'liù', stroke: '点、横、撇、点', words: '六月、六个、六天' },
  '七': { pinyin: 'qī', stroke: '横、竖弯钩', words: '七天、七个、七月' },
  '八': { pinyin: 'bā', stroke: '撇、捺', words: '八天、八个、八月' },
  '九': { pinyin: 'jiǔ', stroke: '撇、横折弯钩', words: '九月、九个、九天' },
  '十': { pinyin: 'shí', stroke: '横、竖', words: '十个、十天、十月' },
  '人': { pinyin: 'rén', stroke: '撇、捺', words: '大人、人口、好人' },
  '口': { pinyin: 'kǒu', stroke: '竖、横折、横', words: '人口、口水、开口' },
  '手': { pinyin: 'shǒu', stroke: '撇、横、横、竖钩', words: '小手、手心、手足' },
  '足': { pinyin: 'zú', stroke: '竖、横折、横、竖、横、撇、捺', words: '手足、足球、满足' },
  '耳': { pinyin: 'ěr', stroke: '横、竖、竖、横、横、横', words: '耳朵、左耳、木耳' },
  '目': { pinyin: 'mù', stroke: '竖、横折、横、横、横', words: '目光、耳目、目标' },
  '日': { pinyin: 'rì', stroke: '竖、横折、横、横', words: '日月、生日、日子' },
  '月': { pinyin: 'yuè', stroke: '撇、横折钩、横、横', words: '月亮、月光、三月' },
  '山': { pinyin: 'shān', stroke: '竖、竖折、竖', words: '大山、山水、火山' },
  '水': { pinyin: 'shuǐ', stroke: '竖钩、横撇、撇、捺', words: '口水、喝水、水果' },
  '火': { pinyin: 'huǒ', stroke: '点、撇、撇、捺', words: '火车、上火、火山' },
  '木': { pinyin: 'mù', stroke: '横、竖、撇、捺', words: '木头、树木、木门' },
  '土': { pinyin: 'tǔ', stroke: '横、竖、横', words: '土地、土山、土木' },
  '田': { pinyin: 'tián', stroke: '竖、横折、横、竖、横', words: '田地、水田、田里' },
  '禾': { pinyin: 'hé', stroke: '撇、横、竖、撇、捺', words: '禾苗、禾田、禾草' },
  '上': { pinyin: 'shàng', stroke: '竖、横、横', words: '上学、上车、上山' },
  '下': { pinyin: 'xià', stroke: '横、竖、点', words: '下来、上下、下雨' },
  '左': { pinyin: 'zuǒ', stroke: '横、撇、横、竖、横', words: '左手、左右、左边' },
  '右': { pinyin: 'yòu', stroke: '横、撇、竖、横折、横', words: '右手、左右、右边' },
  '中': { pinyin: 'zhōng', stroke: '竖、横折、横、竖', words: '中间、中国、中心' },
  '大': { pinyin: 'dà', stroke: '横、撇、捺', words: '大小、大人、大山' },
  '小': { pinyin: 'xiǎo', stroke: '竖钩、撇、点', words: '大小、小手、小雨' },
  '多': { pinyin: 'duō', stroke: '撇、横撇、点、撇、横撇、点', words: '多少、多人、多云' },
  '少': { pinyin: 'shǎo', stroke: '竖、小、撇', words: '多少、少人、少见' },
  '来': { pinyin: 'lái', stroke: '横、点、撇、横、竖、撇、捺', words: '回来、来到、来去' },
  '去': { pinyin: 'qù', stroke: '横、竖、横、撇折、点', words: '回去、来去、去看' },
  '天': { pinyin: 'tiān', stroke: '横、横、撇、捺', words: '今天、天上、天气' },
  '地': { pinyin: 'dì', stroke: '横、竖、提、横折钩、竖、竖弯钩', words: '大地、地上、土地' },
  '风': { pinyin: 'fēng', stroke: '撇、横折弯钩、撇、点', words: '大风、风雨、风车' },
  '雨': { pinyin: 'yǔ', stroke: '横、竖、横折钩、竖、点、点、点、点', words: '下雨、雨水、风雨' },
  '云': { pinyin: 'yún', stroke: '横、横、撇折、点', words: '白云、云朵、风云' },
  '电': { pinyin: 'diàn', stroke: '竖、横折、横、横、竖弯钩', words: '电话、电灯、电车' },
  '白': { pinyin: 'bái', stroke: '撇、竖、横折、横、横', words: '白云、白天、白马' },
  '黑': { pinyin: 'hēi', stroke: '竖、横折、点、撇、横、竖、横、点、点、点、点', words: '黑白、黑马、黑板' },
  '红': { pinyin: 'hóng', stroke: '撇折、撇折、提、横、竖、横', words: '红花、红色、红日' },
  '黄': { pinyin: 'huáng', stroke: '横、竖、竖、横、竖、横折、横、竖、横、撇、点', words: '黄色、黄花、黄牛' },
  '蓝': { pinyin: 'lán', stroke: '横、竖、竖、撇、捺、竖、横折、竖、竖、横', words: '蓝天、蓝色、蓝鸟' },
  '绿': { pinyin: 'lǜ', stroke: '撇折、撇折、提、横折、横、横、竖钩、点、提、撇、捺', words: '绿色、绿草、绿叶' },
  '金': { pinyin: 'jīn', stroke: '撇、捺、横、横、竖、点、撇、横', words: '金鱼、金色、金子' },
  '玉': { pinyin: 'yù', stroke: '横、横、竖、横、点', words: '玉石、玉米、宝玉' },
  '花': { pinyin: 'huā', stroke: '横、竖、竖、撇、竖、撇、竖弯钩', words: '红花、花草、花朵' },
  '草': { pinyin: 'cǎo', stroke: '横、竖、竖、竖、横折、横、横、横、竖', words: '小草、花草、草地' },
  '虫': { pinyin: 'chóng', stroke: '竖、横折、横、竖、横、点', words: '虫子、小虫、飞虫' },
  '鸟': { pinyin: 'niǎo', stroke: '撇、横折钩、点、竖折折钩、横', words: '小鸟、飞鸟、鸟儿' },
  '鱼': { pinyin: 'yú', stroke: '撇、横撇、竖、横折、横、竖、横、横', words: '小鱼、金鱼、鱼水' },
  '牛': { pinyin: 'niú', stroke: '撇、横、横、竖', words: '黄牛、水牛、牛羊' },
  '羊': { pinyin: 'yáng', stroke: '点、撇、横、横、横、竖', words: '山羊、羊毛、牛羊' },
  '马': { pinyin: 'mǎ', stroke: '横折、竖折折钩、横', words: '白马、马上、马车' },
  '车': { pinyin: 'chē', stroke: '横、撇折、横、竖', words: '火车、马车、上车' },
  '门': { pinyin: 'mén', stroke: '点、竖、横折钩', words: '开门、大门、门口' },
  '开': { pinyin: 'kāi', stroke: '横、横、撇、竖', words: '开门、开口、开车' },
  '关': { pinyin: 'guān', stroke: '点、撇、横、横、撇、捺', words: '关门、开关、关上' },
  '东': { pinyin: 'dōng', stroke: '横、撇折、竖钩、撇、点', words: '东方、东西、东边' },
  '西': { pinyin: 'xī', stroke: '横、竖、横折、撇、竖弯', words: '东西、西边、西瓜' },
  '南': { pinyin: 'nán', stroke: '横、竖、竖、横折钩、点、撇、横、横、竖', words: '南方、东南、南北' },
  '北': { pinyin: 'běi', stroke: '竖、横、提、撇、竖弯钩', words: '北方、东北、南北' },
  '前': { pinyin: 'qián', stroke: '点、撇、横、竖、横折钩、横、横、竖', words: '前后、前门、前天' },
  '后': { pinyin: 'hòu', stroke: '撇、撇、横、竖、横折、横', words: '前后、后面、后来' },
  '里': { pinyin: 'lǐ', stroke: '竖、横折、横、横、竖、横、横', words: '里面、里外、田里' },
  '外': { pinyin: 'wài', stroke: '撇、横撇、点、竖、点', words: '外面、里外、外地' },
  '高': { pinyin: 'gāo', stroke: '点、横、竖、横折、横、竖、横折钩、竖、横折、横', words: '高山、高低、高大' },
  '低': { pinyin: 'dī', stroke: '撇、竖、横、撇、竖提、横、斜钩、点', words: '高低、低头、低下' },
  '长': { pinyin: 'cháng', stroke: '撇、横、竖提、捺', words: '长大、长短、长江' },
  '短': { pinyin: 'duǎn', stroke: '撇、横、横、撇、点、横、竖、横折、横', words: '长短、短发、短文' },
  '早': { pinyin: 'zǎo', stroke: '竖、横折、横、横、横、竖', words: '早上、早安、早晚' },
  '晚': { pinyin: 'wǎn', stroke: '竖、横折、横、横、撇、横撇、竖、横折、横、撇、竖弯钩', words: '晚上、早晚、晚安' },
  '吃': { pinyin: 'chī', stroke: '竖、横折、横、撇、横、横折弯钩', words: '吃饭、好吃、吃水' },
  '喝': { pinyin: 'hē', stroke: '竖、横折、横、竖、横折、横、横、撇、横折钩、撇、点', words: '喝水、喝茶、吃喝' },
  '看': { pinyin: 'kàn', stroke: '撇、横、横、撇、竖、横折、横、横', words: '看书、看见、好看' },
  '听': { pinyin: 'tīng', stroke: '竖、横折、横、撇、撇、横、竖', words: '听见、听书、听话' },
  '说': { pinyin: 'shuō', stroke: '点、横折提、撇、竖、横折、横、撇、竖弯钩', words: '说话、听说、小说' },
  '读': { pinyin: 'dú', stroke: '点、横折提、横、竖、横撇、点、点、横、撇、点', words: '读书、朗读、读音' },
  '写': { pinyin: 'xiě', stroke: '点、横撇、横折钩、横、竖折折钩、点', words: '写字、书写、写好' },
  '学': { pinyin: 'xué', stroke: '点、点、撇、点、横撇、横钩、竖钩、横', words: '学校、学习、学生' },
  '校': { pinyin: 'xiào', stroke: '横、竖、撇、点、点、横、撇、点、撇、捺', words: '学校、校长、校园' },
  '老': { pinyin: 'lǎo', stroke: '横、竖、横、撇、撇、竖弯钩', words: '老师、老人、老大' },
  '师': { pinyin: 'shī', stroke: '竖、撇、横、竖、横折钩、竖', words: '老师、师长、师生' },
  '同': { pinyin: 'tóng', stroke: '竖、横折钩、横、竖、横折、横', words: '同学、同样、一同' },
  '家': { pinyin: 'jiā', stroke: '点、点、横撇、横、撇、弯钩、撇、撇、撇、捺', words: '大家、我家、回家' },
  '爸': { pinyin: 'bà', stroke: '撇、点、撇、捺、横折、竖、横、竖弯钩', words: '爸爸、爸妈、老爸' },
  '妈': { pinyin: 'mā', stroke: '撇点、撇、横、横折、竖折折钩、横', words: '妈妈、爸妈、大妈' },
  '你': { pinyin: 'nǐ', stroke: '撇、竖、撇、横撇、竖钩、撇、点', words: '你好、你们、你的' },
  '我': { pinyin: 'wǒ', stroke: '撇、横、竖钩、提、斜钩、撇、点', words: '我们、我的、自我' },
  '他': { pinyin: 'tā', stroke: '撇、竖、横折钩、竖、竖弯钩', words: '他们、他的、他人' },
  '她': { pinyin: 'tā', stroke: '撇点、撇、横、横折钩、竖、竖弯钩', words: '她们、她的' },
  '们': { pinyin: 'men', stroke: '撇、竖、点、竖、横折钩', words: '我们、你们、他们' },
  '好': { pinyin: 'hǎo', stroke: '撇点、撇、横、横撇、竖钩、横', words: '你好、好人、好看' },
  '吗': { pinyin: 'ma', stroke: '竖、横折、横、横折、竖折折钩、横', words: '好吗、是吗、对吗' },
  '在': { pinyin: 'zài', stroke: '横、撇、竖、横、竖、横', words: '现在、正在、在家' },
  '有': { pinyin: 'yǒu', stroke: '横、撇、竖、横折钩、横、横', words: '有人、有水、有用' }
};

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
  over: false,
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
el.nextTurn.addEventListener('click', nextTurn);
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

  const oldBoard = game.board;
  const oldSize = oldBoard.length;
  buildBoard(nextSize);

  game.players.forEach((p) => {
    p.pos = Math.min(Math.round((p.pos / oldSize) * nextSize), nextSize - 1);
    p.lands = new Set([...p.lands]
      .map((idx) => Math.min(Math.round((idx / oldSize) * nextSize), nextSize - 1))
      .filter((idx) => idx > 0));
  });

  game.board.forEach((tile, idx) => {
    const owner = game.players.find((p) => p.lands.has(idx));
    if (owner) {
      tile.owner = owner.id;
      tile.level = 1;
    }
  });
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

  el.setupPanel.classList.add('hidden');
  document.getElementById('gamePanel').classList.remove('hidden');

  requestAnimationFrame(() => {
    updateBoardLayout();
    game.path = generatePath(game.board.length, el.board.clientWidth, el.board.clientHeight);
    log('游戏开始。');
    render();
  });
}

function getCharInfo(ch) {
  return CHAR_INFO[ch] || {
    pinyin: '—',
    stroke: '待补充',
    words: `${ch}字、${ch}文、${ch}词`
  };
}

function updateCenterCharInfo(ch) {
  const info = getCharInfo(ch);
  if (el.centerChar) el.centerChar.textContent = ch;
  if (el.centerPinyin) el.centerPinyin.textContent = info.pinyin;
  if (el.centerStroke) el.centerStroke.textContent = `笔顺：${info.stroke}`;
  if (el.centerWords) el.centerWords.textContent = `常用词：${info.words}`;
}

function rollDice() {
  if (game.over || el.rollBtn.disabled === true) return;
  el.nextTurn.disabled = true;
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
  game.pending = { tile, char: ch, playerId: p.id };
  el.challengeText.textContent = `请 ${p.name} 读出这个字：${ch}`;
  updateCenterCharInfo(ch);
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
    triggerCorrectFX();
    p.coins += 3;
    log(`${p.icon} ${p.name} 读对“${currentChar}”，+3金币。`);

    if (tile.type === 'char') {
      if (tile.owner === null) {
        tile.owner = p.id;
        tile.level = 1;
        p.lands.add(tile.i);
        log(`🎁 ${p.name} 来到无主地块 #${tile.i}（${tile.poiName}），系统直接赠予此地。`);
      } else if (tile.owner !== p.id) {
        const owner = game.players[tile.owner];
        if (game.settings.correctOwnedAction === 'steal') {
          owner.lands.delete(tile.i);
          tile.owner = p.id;
          tile.level = 1;
          p.lands.add(tile.i);
          log(`⚡ ${p.name} 读对了字，成功抢下 ${owner.name} 的地块 #${tile.i}（${tile.poiName}）。`);
        } else {
          log(`✅ ${p.name} 读对了字，这次无事发生。`);
        }
      }
    }
  } else {
    triggerWrongFX();
    log(`${p.icon} ${p.name} 读错“${currentChar}”。`);
    if (tile.type === 'char' && tile.owner !== null && tile.owner !== p.id) {
      const owner = game.players[tile.owner];
      const rent = game.settings.tollAmount;
      p.coins -= rent;
      owner.coins += rent;
      owner.tollIncome += rent;
      log(`❌ 读错触发收费：${p.name} 向 ${owner.name} 支付过路费 ${rent}。`);
    }
  }

  checkEliminationAndWinner();
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
    el.nextTurn.disabled = true;
    el.nextTurn.classList.add('hidden');
    if (alive.length === 1) log(`🏆 游戏结束，${alive[0].name} 获胜！`);
    else log('🏁 游戏结束，无人存活。');
  }
}

function prepareNextTurn() {
  el.nextTurn.classList.remove('hidden');
  el.nextTurn.disabled = false;
  el.rollBtn.disabled = true;
  game.pending = null;
  render();
}

function nextTurn() {
  if (game.over || el.nextTurn.disabled === true) return;
  el.nextTurn.disabled = true;
  el.nextTurn.classList.add('hidden');
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
    const ownerName = tile.owner === null ? '' : `地主：${game.players[tile.owner].icon}${game.players[tile.owner].name}`;
    const tag = tile.type === 'start' ? '🏁起点' : '';
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
    card.style.setProperty('--player-accent', p.color);
    const acc = p.attempts ? Math.round((p.correct / p.attempts) * 100) : 0;
    const landsText = [...p.lands].sort((a, b) => a - b).map(idx => `#${idx} ${game.board[idx].poiName}`).join('、') || '无';
    card.innerHTML = `<div class="player-head">
        <div class="player-badge">${p.icon}</div>
        <div class="player-title">
          <div class="name">${p.name} ${p.eliminated ? '（出局）' : ''}</div>
          <div class="player-sub">位置 #${p.pos} · 地皮 ${p.lands.size}</div>
        </div>
      </div>
      <div class="player-stats">
        <span class="stat-pill">金币 ${p.coins}</span>
        <span class="stat-pill">过路费 ${p.tollIncome}</span>
        <span class="stat-pill">正确率 ${acc}%</span>
      </div>
      <div class="player-lands"><strong>地皮：</strong>${landsText}</div>`;
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

function triggerCorrectFX() {
  if (!el.fxLayer) return;
  const bursts = 64;
  const colors = ['#ff4d6d', '#ffb703', '#3a86ff', '#06d6a0', '#8338ec', '#fb5607', '#ffd166', '#00c2ff'];
  for (let i = 0; i < bursts; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${8 + Math.random() * 84}%`;
    piece.style.top = `${8 + Math.random() * 28}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--dx', `${(Math.random() - 0.5) * 900}px`);
    piece.style.setProperty('--dy', `${180 + Math.random() * 420}px`);
    piece.style.setProperty('--rot', `${Math.random() * 1440 - 720}deg`);
    piece.style.setProperty('--dur', `${1100 + Math.random() * 900}ms`);
    el.fxLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 2300);
  }

  for (let i = 0; i < 18; i++) {
    const coin = document.createElement('span');
    coin.className = 'coin-rain';
    coin.textContent = '🪙';
    coin.style.left = `${10 + Math.random() * 80}%`;
    coin.style.top = `${-8 - Math.random() * 10}%`;
    coin.style.setProperty('--coin-dur', `${1300 + Math.random() * 800}ms`);
    coin.style.setProperty('--coin-rot', `${Math.random() * 540 - 270}deg`);
    el.fxLayer.appendChild(coin);
    setTimeout(() => coin.remove(), 2400);
  }

  const halo = document.createElement('div');
  halo.className = 'success-burst';
  halo.textContent = '🎆 太棒了!';
  el.fxLayer.appendChild(halo);
  setTimeout(() => halo.remove(), 1450);

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

function log(msg) {
  const t = new Date().toLocaleTimeString();
  el.log.innerHTML = `[${t}] ${msg}<br>` + el.log.innerHTML;
}