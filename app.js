const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const root = document.documentElement;
const themeButton = $('.theme-toggle');
function updateThemeButton() {
  const dark = root.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
  $('meta[name="theme-color"]').content = dark ? '#17171b' : '#fcfcfd';
}
themeButton.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('ss-theme', root.dataset.theme); } catch {}
  updateThemeButton();
});
updateThemeButton();

const input = $('#demo-input');
const hud = $('.demo-hud');
const status = $('#demo-status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let animationTimer;
let correctionTimer;
let isPaused = false;
const samples = {ghbdtn:'привет',heccrbq:'русский','руддщ':'hello','спс':'спасибо','vbh':'мир','ьфс':'mac'};
function cancelDemo() { clearTimeout(animationTimer); clearTimeout(correctionTimer); }
function correctSample() {
  if (isPaused || !settings.automatic) return;
  const match = input.value.match(/([^\s]+)(\s*)$/);
  if (!match) return;
  const source = match[1].toLowerCase();
  let target = samples[source];
  if (!target || (source === 'спс' && !settings.expansions)) return;
  if (match[1][0] !== source[0]) target = target.charAt(0).toUpperCase() + target.slice(1);
  input.value = input.value.slice(0, match.index) + target + match[2];
  input.classList.add('corrected');
  const reverse = /[а-я]/i.test(source) && source !== 'спс';
  $('#hud-from').textContent = source === 'спс' ? 'спс' : reverse ? 'RU' : 'EN';
  $('#hud-to').textContent = source === 'спс' ? 'спасибо' : reverse ? 'EN' : 'RU';
  $('.layout-code').textContent = reverse ? 'EN' : 'RU';
  hud.classList.toggle('visible', settings.hud);
  status.textContent = 'Слово исправлено. Раскладка переключена.';
}
function playDemo(word = 'ghbdtn') {
  cancelDemo();
  hud.classList.remove('visible');
  input.classList.remove('corrected');
  input.value = word;
  status.textContent = isPaused ? 'Демонстрация приостановлена' : 'SmartSwitcher замечает неверную раскладку';
  if (reducedMotion) { correctSample(); return; }
  animationTimer = setTimeout(correctSample, 1500);
}
input.addEventListener('focus', () => { cancelDemo(); input.select(); });
input.addEventListener('input', () => {
  cancelDemo();
  hud.classList.remove('visible');
  input.classList.remove('corrected');
  status.textContent = isPaused ? 'Демонстрация приостановлена' : 'Попробуйте: ghbdtn, heccrbq или руддщ';
  correctionTimer = setTimeout(correctSample, 650);
});
$('#replay').addEventListener('click', () => playDemo());
$$('[data-example]').forEach(button => button.addEventListener('click', () => {
  $('.hero-demo').scrollIntoView({behavior: reducedMotion ? 'instant' : 'smooth', block:'center'});
  playDemo(button.dataset.example);
}));

const settings = {automatic:true, startup:true, hud:true, expansions:true};
const settingSwitch = (key, label) => `<button class="switch" type="button" role="switch" aria-checked="${settings[key]}" aria-label="${label}" data-setting="${key}"></button>`;
const row = (label, sub, control) => `<div class="setting-row"><div>${label}${sub ? `<span>${sub}</span>` : ''}</div>${control}</div>`;
const panels = {
  general: () => `<h3>Общие</h3><div class="settings-group">${row('Автоматически исправлять раскладку','Правильные слова без лишних движений',settingSwitch('automatic','Автоматически исправлять раскладку'))}${row('Показывать раскладку у курсора','Небольшая подсказка рядом с курсором',settingSwitch('hud','Показывать раскладку у курсора'))}${row('Запускать при входе в систему','',settingSwitch('startup','Запускать при входе в систему'))}</div><div class="settings-group">${row('Язык интерфейса','', '<span class="setting-value">Русский</span>')}</div><p class="settings-foot"><svg class="icon"><use href="#i-shield"/></svg>Весь текст обрабатывается только на вашем Mac.</p>`,
  exclusions: () => `<h3>Приложения</h3><p class="panel-label">Режим для каждого приложения</p><div class="settings-group">${row('Заметки','','<span class="setting-value">Авто</span>')}${row('Терминал','','<span class="setting-value">Только вручную</span>')}${row('1Password','Менеджеры паролей исключены по умолчанию','<span class="setting-value">Выключено</span>')}</div><p class="settings-foot">Поля паролей игнорируются всегда. Откат двойным Shift запоминает слово.</p>`,
  replacements: () => `<h3>Автозамена</h3><div class="settings-group">${row('Включить автозамену текста','',settingSwitch('expansions','Включить автозамену текста'))}</div><p class="panel-label">Пример правила</p><div class="settings-group">${row('спс','','<span class="setting-value">→ &nbsp; спасибо</span>')}</div><p class="settings-foot">Попробуйте ввести «спс» в заметке на первом экране.</p>`,
  shortcuts: () => `<h3>Хоткеи</h3><div class="settings-group">${row('Исправить последнее слово или откатить','','<span class="shortcut">⇧ ⇧</span>')}</div><p class="panel-label">Выделенный текст</p><div class="settings-group">${row('Сменить раскладку','','<span class="shortcut">⌃ ⌥ K</span>')}${row('Инвертировать регистр','','<span class="shortcut">⌃ ⌥ U</span>')}${row('Транслитерировать','','<span class="shortcut">⌃ ⌥ T</span>')}</div>`,
  statistics: () => `<h3>Статистика</h3><p class="stat-demo">Пример локальной статистики</p><div class="stats-grid"><div class="stat-cell"><b>128</b><span>исправленных слов</span></div><div class="stat-cell"><b>0</b><span>отправленных данных</span></div></div><p class="settings-foot" style="margin-top:18px">Статистика остаётся на устройстве. Без сетевой передачи и телеметрии.</p>`
};
let currentTab = 'general';
function renderPanel() {
  $('#settings-panel').innerHTML = panels[currentTab]();
  $('#settings-panel').setAttribute('aria-labelledby', `tab-${currentTab}`);
  $$('[data-tab]').forEach(button => {
    const active = button.dataset.tab === currentTab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  $$('[data-setting]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.setting;
    settings[key] = !settings[key];
    button.setAttribute('aria-checked', String(settings[key]));
    if(key === 'hud' && !settings.hud) hud.classList.remove('visible');
  }));
}
$$('[data-tab]').forEach(button => button.addEventListener('click', () => { currentTab = button.dataset.tab; renderPanel(); }));
$('.settings-tabs').addEventListener('keydown', event => {
  const tabs = $$('[data-tab]');
  let index = tabs.findIndex(tab => tab.dataset.tab === currentTab);
  if(['ArrowDown','ArrowRight'].includes(event.key)) index = (index + 1) % tabs.length;
  else if(['ArrowUp','ArrowLeft'].includes(event.key)) index = (index + tabs.length - 1) % tabs.length;
  else if(event.key === 'Home') index = 0;
  else if(event.key === 'End') index = tabs.length - 1;
  else return;
  event.preventDefault();
  currentTab = tabs[index].dataset.tab;
  renderPanel();
  tabs[index].focus();
  tabs[index].scrollIntoView({block:'nearest',inline:'nearest'});
});
renderPanel();
$('#menu-toggle').addEventListener('click', () => {
  const open = $('#menu-toggle').getAttribute('aria-expanded') === 'true';
  $('#menu-toggle').setAttribute('aria-expanded', String(!open));
  $('#menu-toggle').classList.toggle('selected', !open);
  $('#app-menu').hidden = open;
});
$('#pause-app').addEventListener('click', () => {
  isPaused = !isPaused;
  $('.menu-title b').textContent = isPaused ? 'SmartSwitcher на паузе' : 'SmartSwitcher работает';
  $('#pause-app span').textContent = isPaused ? 'Включить' : 'Пауза';
  $('.menu-title .status-dot').style.background = isPaused ? '#a69da9' : '';
  status.textContent = isPaused ? 'Демонстрация приостановлена' : 'SmartSwitcher замечает неверную раскладку';
});
$('#pause-10').addEventListener('click', () => $('#pause-app').click());
$('#show-settings').addEventListener('click', () => {
  currentTab = 'general'; renderPanel(); $('#tab-general').focus();
});
$('#check-updates').addEventListener('click', () => {
  location.href = 'https://github.com/SeregaProt/SmartSwitcher-releases/releases';
});
playDemo();
