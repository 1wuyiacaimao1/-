// 浮生 — 主逻辑

(function() {
  'use strict';

  // DOM 引用
  const $birthdayInput = document.getElementById('birthday-input');
  const $birthdayClear = document.getElementById('birthday-clear');
  const $historyList = document.getElementById('history-list');
  const $ganzhiContent = document.getElementById('ganzhi-content');
  const $recommendContent = document.getElementById('recommend-content');
  const $resultArea = document.getElementById('result-area');
  const $randomBtn = document.getElementById('random-btn');

  // === 干支与颜色 ===
  const ACCENT_COLORS = {
    '木': ['#8B9A46', '#A3B05A', '#6B7A36', '#E8ECD8'],
    '火': ['#C75B39', '#D9805A', '#A84D2B', '#F5E8DC'],
    '土': ['#C4953A', '#D4A54A', '#A4752A', '#F5ECD8'],
    '金': ['#C4A882', '#D4B892', '#A48862', '#F0E8DC'],
    '水': ['#7B8FA1', '#96AAB5', '#617585', '#DCE4E8']
  };

  function applyDayColors() {
    const today = new Date();
    const gz = getDayGanZhi(today);
    const cols = ACCENT_COLORS[gz.wuxing];
    document.documentElement.style.setProperty('--accent-1', cols[0]);
    document.documentElement.style.setProperty('--accent-2', cols[1]);
    document.documentElement.style.setProperty('--accent-3', cols[2]);
    document.documentElement.style.setProperty('--bg-tint', cols[3]);
    return gz;
  }

  // === 生日管理 ===
  function getStoredBirthday() {
    try { return JSON.parse(localStorage.getItem('fusheng_birthday')); }
    catch(e) { return null; }
  }

  function setStoredBirthday(month, day) {
    localStorage.setItem('fusheng_birthday', JSON.stringify({ month, day }));
  }

  function clearStoredBirthday() {
    localStorage.removeItem('fusheng_birthday');
    $birthdayInput.value = '';
    $birthdayInput.classList.remove('valid');
    $birthdayClear.classList.remove('visible');
    updateRecommend(null);
  }

  function parseBirthday(str) {
    const trimmed = str.trim();
    let match;
    // 支持: 7-8, 7/8, 7.8, 7 8, 7月8, 7月8日
    const patterns = [
      /^(\d{1,2})[-\/.](\d{1,2})$/,
      /^(\d{1,2})\s+(\d{1,2})$/,
      /^(\d{1,2})月(\d{1,2})日?$/
    ];
    for (const p of patterns) {
      match = trimmed.match(p);
      if (match) break;
    }
    if (!match) return null;
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { month, day };
  }

  // === 历史记录 ===
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem('fusheng_history')) || []; }
    catch(e) { return []; }
  }

  function saveHistory(history) {
    localStorage.setItem('fusheng_history', JSON.stringify(history));
  }

  function addToHistory(activity) {
    const history = loadHistory();
    history.unshift({ id: activity.id, text: activity.text, time: Date.now() });
    const seen = new Set();
    const deduped = [];
    for (const h of history) {
      if (!seen.has(h.id)) { deduped.push(h); seen.add(h.id); }
    }
    const trimmed = deduped.slice(0, 5);
    saveHistory(trimmed);
    renderHistory(trimmed);
  }

  function renderHistory(history) {
    $historyList.innerHTML = '';
    if (history.length === 0) {
      $historyList.innerHTML = '<li class="history-empty">尚无记录</li>';
      return;
    }
    for (const h of history) {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.textContent = h.text;
      $historyList.appendChild(li);
    }
  }

  // === 运势 & 推荐 ===
  function updateGanZhi(gz) {
    const fortune = getFortuneText(gz.gzIndex);
    $ganzhiContent.textContent = fortune;
  }

  function updateRecommend(birthWuxing) {
    const today = new Date();
    const gz = getDayGanZhi(today);

    if (!birthWuxing) {
      $recommendContent.innerHTML = '<span style="color:var(--text-faint)">输入出生月日后<br>根据当日运势推荐</span>';
      return;
    }

    
    const tops = recommendTop(ACTIVITIES, gz.wuxing, birthWuxing, 3);
    let html = '';
    for (const a of tops) {
      html += '<div style="margin-bottom:4px">' + a.text + '</div>';
    }
    if (tops.length === 0) {
      html += '<div style="color:var(--text-faint)">暂无推荐</div>';
    }
    $recommendContent.innerHTML = html;
  }

  // === 随机抽取 ===
  function doRandom() {
    const today = new Date();
    const gz = getDayGanZhi(today);
    const birthWuxing = getCurrentBirthWuxing();
    const activity = recommend(ACTIVITIES, gz.wuxing, birthWuxing);

    $resultArea.innerHTML = '';
    const span = document.createElement('span');
    span.className = 'result-text animate-in';
    span.textContent = activity.text;
    $resultArea.appendChild(span);

    addToHistory(activity);
  }

  function getCurrentBirthWuxing() {
    const stored = getStoredBirthday();
    if (!stored) return null;
    return getBirthWuxing(stored.month, stored.day);
  }

  // === 处理生日输入 ===
  function handleBirthdayInput(value) {
    const parsed = parseBirthday(value);
    if (parsed) {
      setStoredBirthday(parsed.month, parsed.day);
      $birthdayClear.classList.add('visible');
      $birthdayInput.classList.add('valid');
      const birthWuxing = getBirthWuxing(parsed.month, parsed.day);
      updateRecommend(birthWuxing);
    } else {
      $birthdayInput.classList.remove('valid');
    }
  }

  // === 初始化 ===
  function init() {
    const gz = applyDayColors();
    try { updateGanZhi(gz); } catch(e) {}
    renderHistory(loadHistory());

    const stored = getStoredBirthday();
    if (stored) {
      $birthdayInput.value = stored.month + '-' + String(stored.day).padStart(2, '0');
      $birthdayClear.classList.add('visible');
      $birthdayInput.classList.add('valid');
      const birthWuxing = getBirthWuxing(stored.month, stored.day);
      try { updateRecommend(birthWuxing); } catch(e) {}
    } else {
      try { updateRecommend(null); } catch(e) {}
    }

    $randomBtn.addEventListener('click', doRandom);

    $birthdayInput.addEventListener('input', function() {
      handleBirthdayInput(this.value);
    });

    $birthdayInput.addEventListener('change', function() {
      handleBirthdayInput(this.value);
    });

    $birthdayInput.addEventListener('blur', function() {
      if (!this.value.trim()) { clearStoredBirthday(); }
    });

    $birthdayClear.addEventListener('click', function() {
      clearStoredBirthday();
    });

    scheduleMidnightReset();
  }

  function scheduleMidnightReset() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight - now;
    setTimeout(function() {
      const gz = applyDayColors();
      updateGanZhi(gz);
      const birthWuxing = getCurrentBirthWuxing();
      updateRecommend(birthWuxing);
      scheduleMidnightReset();
    }, msUntilMidnight);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();