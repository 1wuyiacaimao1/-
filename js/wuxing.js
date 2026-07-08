// 五行生克匹配模块

// 生克关系: 生我/同我/我生/我克/克我
// 五行相生: 木生火, 火生土, 土生金, 金生水, 水生木
// 五行相克: 木克土, 土克水, 水克火, 火克金, 金克木

const WX_INDEX = { '木': 0, '火': 1, '土': 2, '金': 3, '水': 4 };

// 生: sheng[i] = 第i行生的那行
const SHENG = [1, 2, 3, 4, 0]; // 木→火, 火→土, 土→金, 金→水, 水→木

// relation: 当日五行对用户本命五行的关系
// 返回: '生我','同我','我生','我克','克我'
function getRelation(dayWx, birthWx) {
  const d = WX_INDEX[dayWx];
  const b = WX_INDEX[birthWx];
  if (d === b) return '同我';
  if (SHENG[d] === b) return '生我';    // 当日 生 本命
  if (SHENG[b] === d) return '我生';    // 本命 生 当日
  // 克: 木克土(0克2), 土克水(2克4), 水克火(4克1), 火克金(1克3), 金克木(3克0)
  // 克关系: 间隔2 (mod 5)
  if ((d + 2) % 5 === b) return '克我';  // 当日克本命 → 克我
  if ((b + 2) % 5 === d) return '我克';  // 本命克当日 → 我克
  return '同我';
}

// 根据当日五行和用户本命五行的关系，筛选推荐的活动
// 优先: 生我/同我 → 推荐tag匹配当日本命五行的活动
//       其他 → 随机
function recommend(activities, dayWuxing, birthWuxing) {
  if (!birthWuxing) {
    // 未输入生日，纯随机
    const idx = Math.floor(Math.random() * activities.length);
    return activities[idx];
  }

  const rel = getRelation(dayWuxing, birthWuxing);

  // 当日生本命 或 同日五行 → 优先推荐匹配用户本命五行的活动
  if (rel === '生我' || rel === '同我') {
    const tag = '利' + birthWuxing;
    const matched = activities.filter(a => a.tags.includes(tag));
    if (matched.length > 0) {
      const idx = Math.floor(Math.random() * matched.length);
      return matched[idx];
    }
  }

  // 其他情况 → 随机
  const idx = Math.floor(Math.random() * activities.length);
  return activities[idx];
}

// 推荐供"今日推荐"框展示的活动（与上面逻辑相同但返回前几条）
function recommendTop(activities, dayWuxing, birthWuxing, count) {
  if (!birthWuxing) {
    const shuffled = [...activities].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  const rel = getRelation(dayWuxing, birthWuxing);
  if (rel === '生我' || rel === '同我') {
    const tag = '利' + birthWuxing;
    const matched = activities.filter(a => a.tags.includes(tag));
    const rest = activities.filter(a => !a.tags.includes(tag));
    const shuffled = [...matched].sort(() => Math.random() - 0.5);
    const restShuffled = [...rest].sort(() => Math.random() - 0.5);
    return [...shuffled, ...restShuffled].slice(0, count);
  }

  const shuffled = [...activities].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
