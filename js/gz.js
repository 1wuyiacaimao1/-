// 干支计算模块

const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// 天干五行: 甲乙=木, 丙丁=火, 戊己=土, 庚辛=金, 壬癸=水
const GAN_WUXING = ['木','木','火','火','土','土','金','金','水','水'];

// 地支五行
const ZHI_WUXING = ['水','土','木','木','土','火','火','土','金','金','土','水'];

// 月支（公历月份 → 地支索引，0-based）
const MONTH_ZHI = [10,11,0,1,2,3,4,5,6,7,8,9]; // 1月=寅(2), ..., 12月=丑(1)

// 1900-01-01 = 甲戌日，干支序数 11（0-based = 10）
const REF_DATE = new Date(1900, 0, 1);
const REF_GZ_INDEX = 10;

function daysFromRef(date) {
  const msPerDay = 86400000;
  return Math.floor((date.getTime() - REF_DATE.getTime()) / msPerDay);
}

function getDayGanZhi(date) {
  const days = daysFromRef(date);
  const gzIndex = ((days % 60) + 60 + REF_GZ_INDEX) % 60;
  return {
    ganIndex: gzIndex % 10,
    zhiIndex: gzIndex % 12,
    gzIndex: gzIndex,
    ganName: GAN[gzIndex % 10],
    zhiName: ZHI[gzIndex % 12],
    wuxing: GAN_WUXING[gzIndex % 10]
  };
}

function getDayGanZhiIndex(date) {
  const days = daysFromRef(date);
  return ((days % 60) + 60 + REF_GZ_INDEX) % 60;
}

// 从出生月日获取月支五行
function getBirthWuxing(month, day) {
  const zhiIndex = MONTH_ZHI[(month - 1 + 12) % 12];
  return ZHI_WUXING[zhiIndex];
}

// 用日干支索引生成当日运势短句
function getFortuneText(gzIndex) {
  const ganIdx = gzIndex % 10;
  const zhiIdx = gzIndex % 12;
  const name = GAN[ganIdx] + ZHI[zhiIdx];
  const wx = GAN_WUXING[ganIdx];

  // 每个天干的运势短句池
  const lines = {
    '甲': ['木气生发，适合学新东西','宜动手，少空想','往外走走比闷着好','把拖了很久的小事清一清','今天适合跟人聊聊'],
    '乙': ['木性柔和，慢慢来','做点细活儿很合适','适合出门散个步','读点什么都好','把一件小事做好就够了'],
    '丙': ['火气旺盛，做事利落','适合出去见见人','动手做点什么都会有收获','今天适合大步流星','把想了半天的事做了'],
    '丁': ['火气温和，别急','适合做顿饭','跟朋友说说话会开心','今天适合学点新东西','把攒着的小事处理掉'],
    '戊': ['土气厚重，稳当做事','适合整理收拾','做点重复的活儿反而安心','今天适合在家里待着','把一件具体的事做好'],
    '己': ['土气温和，慢慢来','适合做点手工活','整理一下乱的东西','今天适合照顾点什么','把杂事变小事'],
    '庚': ['金气清朗，效率高','适合处理杂务','收拾东西会很顺手','今天思路清晰，适合动笔','把欠的债清一清'],
    '辛': ['金气细腻，适合精工细活','整理东西会上瘾','今天适合安静待着','把一件小东西修好','仔细做完一件就行'],
    '壬': ['水气流动，适合出门','思路开阔，适合动笔','今天适合听点什么','去水边或安静的地方待一会儿','把一件事想明白'],
    '癸': ['水气沉静，宜静不宜动','适合一个人待着','读读书，喝杯茶','今天适合慢慢来','闭上眼睛歇一歇']
  };

  const ganName = GAN[ganIdx];
  const pool = lines[ganName];
  if (!pool) return name + '日，' + wx + '旺，顺其自然';
  // 用地支索引确定性选一条
  const pick = pool[zhiIdx % pool.length];
  return name + '日，' + wx + '旺，' + pick;
}
