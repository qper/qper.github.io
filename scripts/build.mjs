import {mkdir,readFile,writeFile,cp,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {lessons} from '../course/assets/lessons.js';
// Only replace our generated subtree: never erase the root site or its CNAME.
const siteRoot=resolve(process.env.PAGES_DIR||'dist'),out=resolve(siteRoot,'js');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});await cp('course/assets',out+'/assets',{recursive:true});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const page=(title,body,id=0)=>`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Практический курс физики на JavaScript: 14 уроков, Canvas, пружины, цепи и игра. Без сервера и аккаунтов."><title>${esc(title)} · Физика в JavaScript</title><link rel="stylesheet" href="${id?'../../':''}assets/style.css"><script type="module" src="${id?'../../':''}assets/app.js"></script></head><body data-lesson="${id}"><a class="crumb" href="#main" style="position:absolute;left:-9999px" onfocus="this.style.left='20px'" onblur="this.style.left='-9999px'">К содержанию</a><header><a href="${id?'../../':'./'}">Физика / JavaScript</a><span id="progress">Завершено 0 / 14</span></header><main id="main">${body}</main><footer>Все расчёты выполняются на устройстве. Без аккаунтов, аналитики и сетевых API. <span id="storage-note">Прогресс и черновики — только в этом браузере.</span></footer></body></html>`;
const home=`<div class="intro"><p class="eyebrow">Учебная мастерская · 14 экспериментов</p><h1>От движения точки<br>до физической игры.</h1><p class="lead">Учись строить модели, видеть их ограничения и превращать несколько строк JavaScript в систему, с которой можно взаимодействовать.</p><div class="actions"><a class="button" id="resume" href="lessons/01-canvas/">Начать курс</a><a class="button secondary" href="lessons/14-game/">Открыть игру</a></div><p>Без установки библиотек. Достаточно браузера и любопытства. Уроки рассчитаны на инженерный опыт: знакомство с переменными и функциями полезно, подробного курса синтаксиса здесь нет.</p></div><section><h2>Как работать</h2><p>Прочитай идею → запусти сцену → измени параметр → допиши численный механизм → проверь три случая → исследуй собственные входные данные. Ориентир: 15–30 минут на урок, проект — до часа.</p><p class="note">Сцены изначально на паузе. Они также останавливаются вне экрана и при скрытии вкладки. Численные модели используют условные единицы; ограничения описаны в каждом уроке.</p></section><section><h2>Карта курса</h2><ol class="map">${lessons.map(l=>`<li><a href="lessons/${l.slug}/" data-lesson="${l.id}"><span class="number">${String(l.id).padStart(2,'0')}</span><span><strong>${esc(l.title)}</strong><span class="badge">${l.level} · ${l.id===14?'45–60':'15–30'} мин</span></span></a></li>`).join('')}</ol></section><button class="secondary" id="clear-progress">Сбросить локальный прогресс и черновики</button>`;
await writeFile(out+'/index.html',page('Учебная мастерская',home));
const snippets=[
`const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
ctx.beginPath();
ctx.arc(200, 100, 16, 0, Math.PI * 2);
ctx.fill(); // координаты в логических px`,
`const target = { x: 500, y: 200 };
const position = { x: 100, y: 200 };
// Вектор от position к target: (400, 0)
const length = Math.hypot(400, 0);`,
`const dt = (timestamp - previousTimestamp) / 1000;
// 60 px/s × 0.5 s = 30 px пути
previousTimestamp = timestamp;`,
`const factor = Math.exp(-damping * dt);
// factor — доля скорости, оставшаяся за dt
// При damping = 0 получаем factor = 1.`,
`const gravity = { x: 0, y: 300 }; // px/s²
// За 0.1 s вертикальная скорость вырастет на 30 px/s.
position.y += velocity.y * dt;`,
`const displacement = position.x - anchor.x;
// Правее опоры: displacement > 0 → сила влево.
velocity.x += force / mass * dt;`,
`if (ball.y > height - ball.radius) {
  ball.y = height - ball.radius; // убрать проникновение
  // Отражаем vy только если шар двигался вниз.
}`,
`const distance = Math.hypot(b.x - a.x, b.y - a.y);
const direction = { x: (b.x-a.x)/distance, y: (b.y-a.y)/distance };
// Сила действует вдоль этой единичной оси.`,
`for (let iteration = 0; iteration < 8; iteration++) {
  for (const link of rigidLinks) projectLength(link);
}
// projectLength распределяет ошибку между свободными концами.`,
`canvas.addEventListener('pointerup', () => {
  // Вектор от пальца к опоре задаёт скорость.
  model.launch(index, pointer, anchor);
});`,
`if (!switchClosed) current = 0;
const power = voltage * current; // ватт
// 5 V × 0.05 A = 0.25 W`,
`const dx = source.x - core.x;
const dy = source.y - core.y;
const strength = Math.exp(-(dx*dx + dy*dy) / 50000);
// Скалярное гауссово пятно — авторское приближение.`,
`const sign = -Math.tanh((ball.x - 400) / 45);
// Слева sign > 0, справа sign < 0; переход непрерывен.
const dragFactor = Math.exp(-damping * dt);`,
`model.launch(0, pointer, anchor);
model.step(1 / 120);
render(ctx, model);
// Управление → модель → визуализация.`
];
for(const l of lessons){const prev=lessons[l.id-2],next=lessons[l.id];const instructions=l.id===11?'Меняй U и R; нажми на плату или кнопку выключателя.':l.id===14?'Тяни шар 1 в противоположную сторону от цели и отпускай. В режиме «Связать» выбери два шара. Кнопкой можно менять тип связи и на телефоне. Правый клик рядом с линией также переключает тип.':l.id===10?'Тяни шар влево и вниз; отпускай для запуска к цели. Enter запускает фиксированный бросок; точный запуск доступен ниже.':[6,8,9].includes(l.id)?'Перетаскивай свободные шарики. × означает закреплённую опору. В уроке сети используй режим связывания и выбор связи.':'Коснись сцены или перемести указатель. Стрелки на сфокусированной сцене меняют цель; пробел управляет паузой.';
const body=`<nav class="crumb"><a href="../../">Все уроки</a> / ${String(l.id).padStart(2,'0')}</nav><p class="eyebrow">Урок ${l.id} / 14 · ${l.level}</p><h1>${esc(l.title)}</h1><p class="lead">${esc(l.goal)}</p><section><h2>Ключевая идея</h2><p>${esc(l.idea)}</p></section><section><h2>Эксперимент</h2><p>${instructions} Нажми «Запустить», чтобы время пошло. «Один шаг» помогает рассмотреть изменение.</p><div id="scene"></div><div id="keyboard-launch" class="keyboard-controls" hidden><label>Натяжение x (−150…150)<input name="dx" type="number" value="110" min="-150" max="150"></label><label>Натяжение y (−150…150)<input name="dy" type="number" value="-80" min="-150" max="150"></label><button>Запустить шар 1</button></div><p class="note"><strong>Границы модели.</strong> ${esc(l.limits)}</p></section><section><h2>Минимальный механизм</h2><pre><code>${esc(snippets[l.id-1])}</code></pre><p>Это фрагмент основного механизма. В полном JavaScript-коде объяви результат через <code>const</code> или присвой существующей переменной. Модель, отрисовка и управление в проекте разделены на <a href="../../assets/model.js">model.js</a>, <a href="../../assets/render.js">render.js</a> и <a href="../../assets/scene.js">scene.js</a>.</p></section><section class="exercise"><h2>Практика: допиши выражение</h2><p>Замени <code>___</code>. Входные величины: <code>${l.vars.join(', ')}</code>. Проверка использует три разных набора, в том числе нулевые или отрицательные значения, где они уместны.</p><p class="note">Редактор — безопасное подмножество арифметики, а не среда исполнения JavaScript. Одна строка присваивания; числа, входные имена, +, −, *, /, скобки. Без функций, циклов и доступа к странице. После проверки можно менять входные значения и наблюдать результат своего выражения. Этот численный эксперимент независим от демонстрации выше.</p><label for="editor">Код задания</label><textarea id="editor" spellcheck="false" autocomplete="off">${esc(l.starter)}</textarea><div class="actions"><button id="check">Проверить</button><button class="secondary" id="hint-button">Показать подсказку</button><button class="secondary" id="solution-button">Показать решение</button><button class="secondary" id="reset-code">Вернуть заготовку</button></div><p id="hint" class="note" hidden>${esc(l.hint)}</p><div id="check-result" role="status" aria-live="polite"></div><div id="experiment" hidden aria-label="Численный эксперимент"></div><div id="solution" hidden><h3>Решение и разбор</h3><pre><code>${esc(l.solution)};</code></pre><p>${esc(l.explanation)}</p><button class="secondary" id="load-solution">Загрузить решение в редактор</button></div></section><section class="checklist"><h2>Самопроверка</h2><p>${esc(l.criteria)}</p><label><input type="checkbox">Могу объяснить знак и единицы результата.</label><label><input type="checkbox">Проверил нулевой или предельный случай.</label><label><input type="checkbox">Понимаю ограничения этой модели.</label><button id="complete" disabled>Отметить урок завершённым</button><small>Станет доступно после численной проверки. Выполнение критериев оцениваешь самостоятельно.</small></section><section><h2>Источники и следующий шаг</h2><p><a href="https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API">Canvas API · MDN</a> · <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame">requestAnimationFrame · MDN</a> · <a href="https://openstax.org/details/books/university-physics-volume-1">Механика · OpenStax, том 1</a> · <a href="https://openstax.org/details/books/university-physics-volume-2">Электричество и магнетизм · том 2</a>. Формулы механики опираются на законы Ньютона и Гука; управляющие поля и игровые правила — авторские упрощения.</p></section><nav class="lesson-nav">${prev?`<a href="../${prev.slug}/">← ${esc(prev.title)}</a>`:'<a href="../../">← Карта курса</a>'}${next?`<a href="../${next.slug}/">${esc(next.title)} →</a>`:'<a href="../../">Вернуться к карте →</a>'}</nav>`;
await mkdir(out+`/lessons/${l.slug}`,{recursive:true});await writeFile(out+`/lessons/${l.slug}/index.html`,page(l.title,body,l.id));}
console.log(`Built 15 static pages at ${out}; root site preserved.`);
