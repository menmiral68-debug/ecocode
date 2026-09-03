'use strict';

const STORAGE_KEY = 'ecocode_v4';
const MAX_XP = 375;

const scenarios = [
  {
    id: 'camp', title: 'Поход с друзьями', desc: 'Собираетесь на стоянку. Нужно решить, как организовать отдых без лишнего риска.', icon: '⛺', meta: 'уровень 1',
    questions: [
      ['НАБЛЮДЕНИЕ', 'Вы пришли на место. С чего начать?', 'Проверить правила и условия на сегодня', 'Ограничения могут меняться из-за пожароопасной обстановки.'],
      ['РЮКЗАК', 'В рюкзаке есть спички. Что важно сделать?', 'Убрать так, чтобы они не стали случайным источником огня', 'Главное — не создавать лишний риск.'],
      ['МЕСТО', 'Рядом сухая трава, а ветер усиливается. Что выбираешь?', 'Отказаться от открытого огня и выбрать безопасный вариант отдыха', 'Ветер и сухая растительность повышают опасность распространения огня.'],
      ['СИТУАЦИЯ', 'Ты заметил опасное возгорание неподалёку. Твой первый шаг?', 'Сообщить взрослым и при необходимости позвонить 101 или 112', 'При обнаружении возгорания нужно сообщить взрослым и в экстренные службы.'],
      ['ФИНАЛ', 'Перед уходом со стоянки что важнее всего?', 'Убедиться, что место оставлено безопасным и без источников огня', 'Безопасность важнее скорости ухода.']
    ]
  },
  {
    id: 'fish', title: 'Рыбалка в тундре', desc: 'Ветер меняется, погода портится. Учись замечать риск до того, как он станет проблемой.', icon: '◌', meta: 'уровень 2',
    questions: [
      ['ПОГОДА', 'Перед выходом погода выглядит сухой и ветреной. Что учитываешь?', 'Официальные предупреждения и местные ограничения', 'Условия и ограничения нужно проверять перед отдыхом.'],
      ['ОТДЫХ', 'Компания хочет использовать открытый огонь. Что делаешь?', 'Проверяю, разрешён ли он сейчас и здесь', 'Правила зависят от действующих ограничений и обстановки.'],
      ['ВЕТЕР', 'Ветер заметно усилился. Самое разумное решение?', 'Отказаться от открытого огня', 'Усиление ветра — причина снижать риск.'],
      ['СООБЩЕНИЕ', 'Увидел дым от природного пожара. Что делать?', 'Сообщить взрослым и позвонить 101 или 112', 'О возгорании нужно сообщить взрослым и в экстренные службы.'],
      ['ФИНАЛ', 'Какой принцип забираешь с собой?', 'Сначала условия и последствия, потом действие', 'Именно так работает ответственное поведение на природе.']
    ]
  },
  {
    id: 'picnic', title: 'Семейный пикник', desc: 'Нужно выбрать безопасный формат отдыха и заметить признаки меняющейся обстановки.', icon: '✦', meta: 'уровень 3',
    questions: [
      ['ПЛАН', 'Семья собирается на природу. Что проверяете заранее?', 'Правила места и актуальные ограничения', 'Ограничения могут вводиться при высокой пожарной опасности.'],
      ['МЕСТО', 'Вы нашли сухую траву и думаете о костре. Решение?', 'Не использовать открытый огонь', 'Сухая растительность — лишний риск.'],
      ['ДЕТИ', 'Младшие дети играют рядом с местом отдыха. Что меняешь?', 'Убираю потенциальные источники опасности и держу детей под присмотром взрослых', 'Безопасная организация пространства важна не меньше правил.'],
      ['ДЫМ', 'Появился дым вдалеке. Что делать?', 'Сообщить взрослым и при необходимости в 101/112', 'К источнику опасности приближаться не следует.'],
      ['ФИНАЛ', 'Как выглядит хороший туристический навык?', 'Уметь заметить риск и вовремя выбрать безопасное решение', 'Именно это тренирует ЭкоКод.']
    ]
  }
];

const state = { name: '', xp: 0, done: {}, streak: 0 };
let currentScenario = null;
let questionIndex = 0;
let risk = 12;
let sessionXP = 0;
let safeDecisions = 0;
let usedActions = new Set();
let toastTimer = 0;
let answerTimer = 0;

const $ = id => document.getElementById(id);

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return;
    state.name = typeof saved.name === 'string' ? saved.name.slice(0, 24) : '';
    state.xp = Number.isFinite(saved.xp) ? clamp(saved.xp, 0, MAX_XP) : 0;
    state.streak = Number.isFinite(saved.streak) ? clamp(saved.streak, 0, 999) : 0;
    state.done = saved.done && typeof saved.done === 'object' ? saved.done : {};
  } catch (_) {
    state.name = ''; state.xp = 0; state.streak = 0; state.done = {};
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: state.name, xp: state.xp, done: state.done, streak: state.streak }));
  } catch (_) {}
}

function showToast(message) {
  const element = $('toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => element.classList.remove('show'), 2400);
}

function switchView(viewName) {
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
  document.querySelectorAll('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === viewName));
  if (viewName === 'sim') renderScenarios();
  if (viewName === 'progress') renderProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateHeader() {
  const name = state.name || 'Гость';
  $('profileName').textContent = name;
  $('homeGreeting').textContent = state.name ? `С возвращением, ${state.name}. Имя и игровой прогресс хранятся только в этом браузере.` : 'Сохраняем только имя/ник и игровой прогресс на этом устройстве.';
  $('progressTitle').textContent = state.name ? `${state.name}, твой прогресс` : 'Твой прогресс';
  $('totalXP').textContent = `${state.xp} XP`;
}

function openProfile() {
  const modal = $('profileModal');
  if (!modal) return;
  $('nameInput').value = state.name;
  modal.classList.add('show');
  window.setTimeout(() => $('nameInput').focus(), 30);
}

function closeProfile() { $('profileModal').classList.remove('show'); }

function saveProfile() {
  const value = $('nameInput').value.trim().replace(/\s+/g, ' ').slice(0, 24);
  state.name = value;
  saveState(); updateHeader(); closeProfile();
  showToast(value ? `Профиль сохранён: ${value}` : 'Имя очищено.');
}

function renderScenarios() {
  const list = $('scenarioList');
  if (!list) return;
  list.replaceChildren();
  scenarios.forEach((scenario, index) => {
    const unlocked = index === 0 || Boolean(state.done[scenarios[index - 1].id]);
    const completed = Boolean(state.done[scenario.id]);
    const card = document.createElement('article');
    card.className = `scenario-card${unlocked ? '' : ' locked'}`;
    card.setAttribute('role', unlocked ? 'button' : 'article');
    card.tabIndex = unlocked ? 0 : -1;
    card.setAttribute('aria-disabled', String(!unlocked));

    const icon = document.createElement('div'); icon.className = 'sc-icon'; icon.textContent = scenario.icon;
    const body = document.createElement('div');
    const title = document.createElement('div'); title.className = 'sc-title'; title.textContent = scenario.title;
    const desc = document.createElement('div'); desc.className = 'sc-desc'; desc.textContent = scenario.desc;
    const meta = document.createElement('div'); meta.className = 'sc-meta'; meta.textContent = `${scenario.meta} · 5 решений`;
    body.append(title, desc, meta);
    const status = document.createElement('span'); status.className = `status ${completed ? 'done' : unlocked ? 'open' : ''}`; status.textContent = completed ? '✓ пройден' : unlocked ? 'играть' : 'закрыт';
    card.append(icon, body, status);
    if (unlocked) {
      card.addEventListener('click', () => startScenario(scenario.id));
      card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); startScenario(scenario.id); } });
    }
    list.append(card);
  });
  const completedCount = scenarios.filter(scenario => state.done[scenario.id]).length;
  $('overallProgressText').textContent = `${completedCount} / ${scenarios.length}`;
  $('overallProgressBar').style.width = `${completedCount / scenarios.length * 100}%`;
}

function startScenario(id) {
  const scenario = scenarios.find(item => item.id === id);
  if (!scenario) return;
  currentScenario = scenario; questionIndex = 0; risk = 12; sessionXP = 0; safeDecisions = 0; usedActions = new Set();
  window.clearTimeout(answerTimer);
  $('game').hidden = false;
  $('result').classList.remove('show');
  $('questionBox').style.display = '';
  $('actionbar').style.display = '';
  $('gameTitle').textContent = scenario.title;
  renderQuestion(); updateScene();
  $('game').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getWrongAnswers(correct) {
  const pool = [
    'Продолжить как обычно, если кажется, что риск небольшой',
    'Подойти ближе и проверить ситуацию самому',
    'Сначала снять видео и разобраться позже',
    'Выбрать место, где сухой растительности больше',
    'Ничего не менять, пока проблема не станет очевидной'
  ];
  return pool.filter(item => item !== correct).slice(0, 2);
}

function renderQuestion() {
  if (!currentScenario) return;
  const [tag, text, correct, explanation] = currentScenario.questions[questionIndex];
  const answers = [correct, ...getWrongAnswers(correct)].sort(() => Math.random() - 0.5);
  const container = $('answers'); container.replaceChildren();
  $('gameStep').textContent = `Решение ${questionIndex + 1} из ${currentScenario.questions.length}`;
  $('questionTag').textContent = tag; $('questionCount').textContent = `${questionIndex + 1} / ${currentScenario.questions.length}`; $('questionText').textContent = text;
  const feedback = $('feedback'); feedback.className = 'feedback'; feedback.replaceChildren();
  answers.forEach(answerText => {
    const button = document.createElement('button'); button.className = 'answer'; button.type = 'button'; button.textContent = answerText;
    button.addEventListener('click', () => handleAnswer(button, answerText === correct, explanation));
    container.append(button);
  });
}

function handleAnswer(button, correct, explanation) {
  const buttons = [...document.querySelectorAll('.answer')];
  if (buttons.some(item => item.disabled)) return;
  buttons.forEach(item => { item.disabled = true; });
  button.classList.add(correct ? 'correct' : 'wrong');
  if (correct) {
    safeDecisions++; sessionXP += 25; state.xp = clamp(state.xp + 25, 0, MAX_XP); state.streak++; risk = clamp(risk - 12, 0, 100);
  } else {
    state.streak = 0; risk = clamp(risk + 18, 0, 100);
  }
  saveState(); updateHeader(); updateScene();
  const feedback = $('feedback'); feedback.className = `feedback show${correct ? ' good' : ''}`;
  const heading = document.createElement('b'); heading.textContent = correct ? 'Верное решение' : 'Стоит подумать ещё раз';
  const note = document.createElement('span'); note.textContent = `${explanation}${correct ? ' +25 XP' : ''}`;
  feedback.replaceChildren(heading, note);
  window.clearTimeout(answerTimer);
  answerTimer = window.setTimeout(() => {
    if (questionIndex < currentScenario.questions.length - 1) { questionIndex++; renderQuestion(); }
    else finishScenario();
  }, 750);
}

function finishScenario() {
  if (!currentScenario) return;
  state.done[currentScenario.id] = true; saveState(); updateHeader();
  $('questionBox').style.display = 'none'; $('actionbar').style.display = 'none'; $('result').classList.add('show');
  $('resultTitle').textContent = safeDecisions >= 4 ? 'Маршрут под контролем' : safeDecisions >= 3 ? 'Хороший разбор' : 'Есть что повторить';
  $('resultText').textContent = safeDecisions >= 4 ? 'Ты хорошо замечаешь условия и выбираешь решения, которые снижают риск.' : safeDecisions >= 3 ? 'Основные принципы уже понятны. Повтори ошибки и попробуй сценарий ещё раз.' : 'Ошибки тоже часть обучения. Вернись к сценарию и проверь решения ещё раз.';
  $('resultXP').textContent = sessionXP; $('resultRisk').textContent = risk < 30 ? 'низкий' : risk < 60 ? 'средний' : 'высокий'; $('resultDecisions').textContent = `${safeDecisions}/5`;
  renderScenarios(); renderProgress();
}

function updateScene() {
  const meter = $('riskMeter'); const label = $('riskLabel');
  meter.style.width = `${risk}%`; meter.classList.toggle('medium', risk >= 30 && risk < 60); meter.classList.toggle('high', risk >= 60);
  label.textContent = risk < 30 ? 'низкий' : risk < 60 ? 'средний' : 'высокий'; $('gameXP').textContent = state.xp;
}

function useAction(kind) {
  if (usedActions.has(kind)) return;
  usedActions.add(kind);
  const effects = { water: -10, adult: -15, call: -20 };
  risk = clamp(risk + effects[kind], 0, 100); updateScene(); saveState();
  const messages = {
    water: 'Риск снижен: остановиться и оценить условия — правильная привычка.',
    adult: 'Хорошее решение: подключить взрослого, если ситуация становится сложнее.',
    call: 'Правильный шаг: о возгорании сообщают по 101 или 112.'
  };
  showToast(messages[kind]);
}

function renderProgress() {
  const completedCount = scenarios.filter(scenario => state.done[scenario.id]).length;
  $('doneCount').textContent = `${completedCount} / ${scenarios.length}`; $('streakCount').textContent = state.streak; $('totalXP').textContent = `${state.xp} XP`; $('xpLine').style.width = `${clamp(state.xp / MAX_XP * 100, 0, 100)}%`;
  const badges = [
    ['🌲', 'Первый шаг', 'Пройди первый сценарий', completedCount >= 1],
    ['✦', 'Безопасный выбор', 'Сделай 5 безопасных решений', state.xp >= 125],
    ['◆', 'Маршрут под контролем', 'Заверши все 3 сценария', completedCount >= 3],
    ['↗', 'Серия', 'Сохрани серию из 3 решений', state.streak >= 3]
  ];
  const grid = $('badgeGrid'); grid.replaceChildren();
  badges.forEach(([icon, title, description, unlocked]) => {
    const element = document.createElement('div'); element.className = `badge${unlocked ? '' : ' locked'}`;
    const medal = document.createElement('div'); medal.className = 'medal'; medal.textContent = icon;
    const strong = document.createElement('strong'); strong.textContent = title;
    const text = document.createElement('span'); text.textContent = unlocked ? 'получено' : description;
    element.append(medal, strong, text); grid.append(element);
  });
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', event => { event.preventDefault(); switchView(button.dataset.view); }));
  document.querySelectorAll('[data-action="start"]').forEach(button => button.addEventListener('click', () => switchView('sim')));
  const how = document.querySelector('[data-action="how"]');
  if (how) how.addEventListener('click', () => document.querySelector('.hero').nextElementSibling?.scrollIntoView({ behavior: 'smooth' }));
  $('profileBtn').addEventListener('click', openProfile); $('closeProfile').addEventListener('click', closeProfile); $('saveProfile').addEventListener('click', saveProfile);
  $('nameInput').addEventListener('keydown', event => { if (event.key === 'Enter') saveProfile(); if (event.key === 'Escape') closeProfile(); });
  $('profileModal').addEventListener('click', event => { if (event.target === $('profileModal')) closeProfile(); });
  $('waterBtn').addEventListener('click', () => useAction('water')); $('adultBtn').addEventListener('click', () => useAction('adult')); $('callBtn').addEventListener('click', () => useAction('call'));
  $('backBtn').addEventListener('click', () => { $('game').hidden = true; switchView('sim'); });
  $('replayBtn').addEventListener('click', () => { if (currentScenario) startScenario(currentScenario.id); });
  const hotspots = {
    spotBag: 'Рюкзак: проверь, чтобы потенциальные источники огня не создавали лишнего риска.',
    spotFire: 'Место: сухая растительность и усиливающийся ветер — повод отказаться от открытого огня.',
    spotSky: 'Условия: перед отдыхом учитывай официальные предупреждения и действующие ограничения.'
  };
  Object.entries(hotspots).forEach(([id, message]) => { const element = $(id); if (element) element.addEventListener('click', () => showToast(message)); });
}

loadState();
bindEvents();
updateHeader();
renderScenarios();
renderProgress();
