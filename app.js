// Демо на первом экране: посимвольная смена раскладки (иллюстрация,
// не настоящий детектор приложения) и мобильное меню.
const examples = [['ghbdtn', 'привет'], ['руддщ', 'hello'], ['heccrbq', 'русский']];
const en = "`qwertyuiop[]asdfghjkl;'zxcvbnm,.";
const ru = 'ёйцукенгшщзхъфывапролджэячсмитьбю';
const isCyrillic = value => /[а-яё]/i.test(value);

function convert(value) {
  const from = isCyrillic(value) ? ru : en;
  const to = from === ru ? en : ru;
  return [...value].map(c => {
    const i = from.indexOf(c.toLowerCase());
    if (i < 0) return c;
    return c === c.toUpperCase() ? to[i].toUpperCase() : to[i];
  }).join('');
}

const input = document.getElementById('demo-input');
const result = document.getElementById('demo-result');
const output = document.getElementById('demo-output');
const undo = document.getElementById('undo');
const exampleButtons = [...document.querySelectorAll('[data-example]')];
let corrected = 'привет';
let undone = false;
let timer;

function render() {
  const cyr = isCyrillic(input.value);
  document.getElementById('lang-from').textContent = cyr ? 'RU' : 'EN';
  document.getElementById('lang-to').textContent = cyr ? 'EN' : 'RU';
  document.getElementById('menubar-layout').textContent = undone ? (cyr ? 'RU' : 'EN') : (cyr ? 'EN' : 'RU');
  result.textContent = undone ? input.value : corrected;
  output.classList.toggle('undone', undone);
  undo.setAttribute('aria-label', undone ? 'Повторить исправление' : 'Отменить исправление (в приложении — двойной Shift)');
}

function select(index) {
  clearTimeout(timer);
  [input.value, corrected] = examples[index];
  undone = false;
  exampleButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
  render();
}

input.addEventListener('input', () => {
  exampleButtons.forEach(b => b.setAttribute('aria-pressed', 'false'));
  clearTimeout(timer);
  timer = setTimeout(() => { corrected = convert(input.value); undone = false; render(); }, 500);
});
exampleButtons.forEach((b, i) => b.addEventListener('click', () => select(i)));
undo.addEventListener('click', () => { undone = !undone; render(); });

const menu = document.querySelector('.menu');
const nav = document.getElementById('nav');
function setMenu(open) {
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
