const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today = new Date().toLocaleDateString('he-IL', {day:'2-digit', month:'2-digit', year:'numeric'}).replace(/\//g, '.');

/* ---- the one form definition ---- */
const BRANCHES = ['אשדוד','באר שבע','חיפה','ירושלים','נתניה','פתח תקווה','תל אביב'];
const PARTS = [
  {n:1, title:'פרטי מבקש', fields:[
    {k:'name', l:'שם מלא', q:'who', ac:'name'},
    {k:'role', l:'תפקיד', q:'who', ac:'organization-title'},
    {k:'branch', l:'סניף', q:'who', type:'select'},
    {k:'date', l:'תאריך הבקשה', auto:true},
    {k:'need', l:'הסבר הצורך', q:'why', type:'textarea', full:true}]},
  {n:2, title:'פרטי פריט', fields:[
    {k:'item', l:'שם הפריט', q:'what', full:true},
    {k:'sku', l:'מק"ט', q:'what', num:true},
    {k:'qty', l:'כמות', q:'howmany', num:true}]},
  {n:3, title:'אישור מנהל סניף', fields:[
    {k:'approver', l:'שם המאשר', q:'ok'},
    {k:'adate', l:'תאריך אישור', q:'ok'}]}
];
const EXAMPLE = {name:'נועה לוי', role:'רכזת הדרכה', branch:'חיפה', date:'26.11.2026',
  need:'לחדר ההדרכה בסניף חיפה. הלוח הקיים שבור, וההדרכות השבועיות לעובדים חדשים מתקיימות בלי לוח.',
  item:'לוח מחיק מגנטי לתלייה על קיר, 120×90 ס"מ', sku:'40218', qty:'2', approver:'אבי כהן', adate:'28.11.2026'};
const PARTIAL = {name:'נועה לוי', role:'רכזת הדרכה', branch:'חיפה', date:'11.11.2026', need:'צריך',
  item:'לוח מחיק מגנטי לתלייה על קיר, 120×90 ס"מ', sku:'', qty:'2', approver:'', adate:''};

function control(f, id, v, live, lockedPart){
  const dis = (!live || f.auto || lockedPart) ? ' disabled' : '';
  const cls = f.auto ? ' class="auto"' : '';
  const aria = live && !f.auto && !lockedPart ? ` aria-describedby="${id}-m"` : '';
  if (f.type === 'select'){
    const opts = ['<option value=""></option>', ...BRANCHES.map(b => `<option${b===v?' selected':''}>${b}</option>`)].join('');
    return `<select id="${id}" name="${f.k}"${dis}${aria}>${opts}</select>`;
  }
  if (f.type === 'textarea') return `<textarea id="${id}" name="${f.k}"${dis}${aria}>${esc(v)}</textarea>`;
  const im = f.num ? ' inputmode="numeric"' : '';
  const ac = f.ac && live ? ` autocomplete="${f.ac}"` : ' autocomplete="off"';
  return `<input id="${id}" name="${f.k}" type="text" value="${esc(v)}"${cls}${im}${ac}${dis}${aria}>`;
}

/* opts: id, live, values, only:[part numbers], hot, lock3, tags */
function formHTML(o){
  const vals = o.values || {};
  const parts = PARTS.filter(p => !o.only || o.only.includes(p.n));
  const body = parts.map(p => {
    const locked = o.live && o.lock3 && p.n === 3;
    const fields = p.fields.map(f => {
      const id = `${o.id}-${f.k}`;
      const tag = '';
      const msg = o.live && !f.auto && !locked ? `<span class="rf-msg" id="${id}-m"><svg aria-hidden="true"><use href="#i-alert"/></svg><span></span></span>` : '';
      return `<div class="rf-f${f.full?' full':''}" data-k="${f.k}" data-q="${f.q||''}"><label for="${id}">${f.l}${tag}</label>${control(f, id, vals[f.k] ?? '', o.live, locked)}${msg}</div>`;
    }).join('');
    const hot = o.hot ? `<button type="button" class="rf-hot" data-open="${p.n}" aria-label="פתחו הסבר על חלק ${p.n}: ${p.title}"><svg aria-hidden="true"><use href="#i-plus"/></svg></button>` : '';
    const lockNote = '';
    return `<fieldset class="rf-part${locked?' locked':''}" data-part="${p.n}"><legend><span class="rf-num">${p.n}</span>${p.title}${lockNote}</legend>${hot}<div class="rf-grid">${fields}</div></fieldset>`;
  }).join('');
  const head = `<div class="rf-head"><svg aria-hidden="true"><use href="#i-doc"/></svg><b>טופס בקשת רכש</b></div>`;
  if (o.live){
    return `<form class="rf" id="${o.id}" data-mode="live" novalidate aria-labelledby="h-fill">${head}<div class="rf-body">${body}</div>
      <div class="rf-foot"><button class="btn btn-p" type="submit">בדיקה</button></div></form>`;
  }
  return `<div class="rf${o.compact?' compact':''}" id="${o.id}" data-mode="static" role="group" aria-label="${esc(o.label||'טופס בקשת רכש')}">${head}<div class="rf-body">${body}</div></div>`;
}
function mount(sel, o){ $(sel).innerHTML = formHTML(o); }

/* ---- static views, all from the same component ---- */
mount('#ov-form', {id:'ov', values:{date:today}, compact:true, label:'טופס בקשת רכש'});
mount('#st-form', {id:'st', values:{date:today}, hot:true, compact:true, label:'מבנה הטופס'});
mount('#ck-form', {id:'ck', values:PARTIAL, label:'הבקשה שהוגשה לאישור'});
mount('#pr-form', {id:'pv', values:{date:today}, lock3:true, label:'טופס התרגול'});

/* ---- links to the practice wait until both questions are answered ---- */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href="#practice"]');
  if (a && $('#practice').hidden){ e.preventDefault(); $('#check').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); }
});

/* ---- nav ---- */
const nav = $('#nav'), burger = $('#burger'), links = $('#links');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), {passive:true});
burger.addEventListener('click', () => { const o = links.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
links.addEventListener('click', e => { if (e.target.closest('a')){ links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }});
const navMap = {why:'why', overview:'overview', form:'form', check:'form', practice:'practice', done:'practice'};
const io = new IntersectionObserver(es => {
  es.forEach(en => { if (en.isIntersecting){
    const key = navMap[en.target.id];
    $$('[data-nav]').forEach(a => { const on = a.dataset.nav === key; a.classList.toggle('on', on && !a.classList.contains('btn')); on ? a.setAttribute('aria-current','true') : a.removeAttribute('aria-current'); });
  }});
}, {rootMargin:'-45% 0px -50% 0px'});
$$('main > section').forEach(s => io.observe(s));

/* ---- chain reveal (content stays visible without script or with reduced motion) ---- */
const chain = $('#chain');
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){
  chain.classList.add('ready');
  const cio = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)){ chain.classList.add('play'); cio.disconnect(); }}, {threshold:.45});
  cio.observe(chain);
}

/* ---- structure: hotspots + dialog ---- */
const MODAL = {
  1:{t:'1. פרטי המבקש', b:'ממלאים את שמכם המלא, תפקיד וסניף. תאריך הבקשה ממולא אוטומטית. בהסבר הצורך מציינים לאן הציוד מיועד ולמה הוא נחוץ. כך הרכש יודע לתעדף את הבקשה ולוודא שהפריט מתאים לשימוש.',
     ex:'"לחדר ההדרכה בסניף חיפה. הלוח הקיים שבור, וההדרכות השבועיות לעובדים חדשים מתקיימות בלי לוח."',
     m:'משלימים את החסר. אם בהסבר כתוב רק "צריך", מוסיפים איפה ישתמשו בציוד ולמה.'},
  2:{t:'2. פרטי הפריט', b:'כותבים את שם הפריט כפי שמופיע בקטלוג מרחב, את המק"ט שלו ואת הכמות הנדרשת. כך הרכש יודע בדיוק מה להזמין ובאיזו כמות.',
     ex:'לוח מחיק מגנטי לתלייה על קיר, 120×90 ס"מ, מק"ט 40218, שתי יחידות.',
     m:'מאתרים את הדגם בקטלוג ומעתיקים את המק"ט. אם חסרה כמות, מבררים כמה יחידות דרושות.'},
  3:{t:'3. אישור מנהל סניף', b:'מאשרים מול מנהל הסניף את הבקשה. רק בקשה מאושרת עוברת לרכש.',
     ex:'אבי כהן, 28.11.2026.',
     m:'רכז הרכש מחזיר את הבקשה למבקש. אחרי ההשלמה, הבקשה נשלחת לאישור מחדש.'}
};
const opened = new Set();
const dlg = $('#dlg');
let lastFocus = null;

function updateProgress(){
  const n = opened.size;
  opened.forEach(k => {
    $$(`#st-form .rf-hot[data-open="${k}"]`).forEach(b => { b.classList.add('done'); b.innerHTML = '<svg aria-hidden="true"><use href="#i-check"/></svg>'; b.setAttribute('aria-label', `חלק ${k} נפתח – פתחו שוב`); });
  });
  const go = $('#go-check');
  go.setAttribute('aria-disabled', n < 3);
  go.toggleAttribute('data-locked', n < 3);
  go.style.opacity = n < 3 ? .5 : 1;
}
$('#go-check').addEventListener('click', e => { if (opened.size < 3) e.preventDefault(); });
updateProgress();

function openPart(n){
  const m = MODAL[n];
  $('#dlg-t').textContent = m.t; $('#dlg-b').textContent = m.b; $('#dlg-ex').textContent = m.ex; $('#dlg-m').textContent = m.m;
  mount('#dlg-form', {id:'dl', values:EXAMPLE, only:[+n], label:`דוגמה: ${PARTS[n-1].title}`});
  lastFocus = document.activeElement;
  dlg.showModal();
  opened.add(String(n)); updateProgress();
}
document.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) openPart(b.dataset.open); });
const closeDlg = () => dlg.close();
$('#dlg-x').addEventListener('click', closeDlg);
dlg.addEventListener('click', e => { if (e.target === dlg) closeDlg(); });
dlg.addEventListener('close', () => { if (lastFocus) lastFocus.focus(); });

/* ---- check questions ---- */
const ICON = {good:'i-ok', part:'i-info', bad:'i-alert', none:'i-info'};
function feedback(el, kind, title, text){
  el.className = `fb show ${kind}`;
  el.innerHTML = `<svg aria-hidden="true"><use href="#${ICON[kind]}"/></svg><div>${title ? `<b>${title}</b>` : ''}${text}</div>`;
}
$('#q1').addEventListener('submit', e => {
  e.preventDefault();
  const v = ($('#q1 input:checked') || {}).value, fb = $('#fb1');
  if (!v) return feedback(fb, 'none', '', 'יש לבחור תשובה.');
  if (v === 'no') feedback(fb, 'good', 'נכון.', 'בבקשה חסרים פרטים, והיא עוד לא אושרה על ידי מנהל הסניף. בקשה כזו הייתה חוזרת אליכם להשלמה, וספירת 3 ימי העבודה הייתה מתחילה מחדש.');
  else feedback(fb, 'bad', 'לא בדיוק.', 'בדקו שוב כל שדה בטופס. בקשה עוברת לרכש רק כשכל השדות מלאים והיא מאושרת על ידי מנהל הסניף. בקשה חסרה חוזרת אליכם להשלמה, וספירת 3 ימי העבודה מתחילה מחדש.');
  const q2 = $('#q2');
  if (q2.hidden){ q2.hidden = false; q2.classList.add('in'); setTimeout(() => q2.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'nearest'}), 600); }
});
$('#q2').addEventListener('submit', e => {
  e.preventDefault();
  const sel = $$('#q2 input:checked').map(i => i.value), fb = $('#fb2');
  const right = ['c','e'], wrong = sel.filter(v => !right.includes(v)), hit = sel.filter(v => right.includes(v));
  if (!sel.length) return feedback(fb, 'none', '', 'יש לבחור לפחות תשובה אחת.');

  /* can't move on to the practice before all 3 click-areas in "מבנה הטופס" were opened */
  if (opened.size < 3){
    feedback(fb, 'none', 'עוד לא.', 'לפני שממשיכים, חזרו למקטע "מבנה הטופס" ולחצו על שלושת הסימונים שבטופס.');
    $('#form').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    return;
  }

  if (wrong.length) feedback(fb, 'bad', 'לא בדיוק.', 'חלק מהפרטים שבחרתם כבר מלאים בטופס. בדקו שוב: איזה שדה ריק, ואיזה שדה מלא אבל לא מסביר מספיק?');
  else if (hit.length === 2) feedback(fb, 'good', 'נכון.', '"צריך" לא מסביר לאן ילך הציוד ולמה, ובלי מק"ט הרכש לא יודע איזה לוח בדיוק להזמין. אחרי ההשלמה, הבקשה נשלחת לאישור מנהל הסניף, ואז רכז הרכש יכול להתחיל לטפל בה.');
  else feedback(fb, 'part', 'כמעט.', 'מצאתם פרט אחד שצריך להשלים, אבל יש עוד אחד. בדקו שוב את הסבר הצורך ואת פרטי הפריט.');

  const pr = $('#practice');
  if (pr.hidden){ pr.hidden = false; pr.classList.add('in'); }
});

/* ---- practice ---- */
const norm = s => String(s || '').replace(/["'״׳]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const RULES = {
  name: v => norm(v) ? '' : 'יש למלא את שמכם המלא.',
  role: v => !norm(v) ? 'יש למלא את התפקיד שלכם.' : (/מזכיר/.test(v) ? '' : 'התפקיד לא תואם לתרחיש. בדקו שוב מה התפקיד שלכם.'),
  branch: v => !v ? 'יש לבחור סניף מהרשימה.' : (v === 'אשדוד' ? '' : 'הסניף לא תואם לתרחיש. בדקו שוב באיזה סניף אתם עובדים.'),
  need: v => { const t = norm(v); if (!t) return 'יש לפרט את הסבר הצורך.'; return (t.length < 15 || t.split(' ').length < 4) ? 'ההסבר קצר מדי. כתבו לאן ילך הציוד ולמה הוא נחוץ.' : ''; },
  item: v => { const t = norm(v); if (!t) return 'יש לכתוב את שם הפריט.'; return (t.includes('ארון מתכת') && t.includes('r11')) ? '' : 'שם הפריט לא תואם לתרחיש. כתבו אותו כפי שהוא מופיע בקטלוג.'; },
  sku: v => { const t = String(v).trim(); if (!t) return 'יש למלא את המק"ט.'; if (!/^\d+$/.test(t)) return 'מק"ט מכיל ספרות בלבד.'; return t === '55210' ? '' : 'המק"ט לא תואם לפריט. בדקו שוב בתרחיש.'; },
  qty: v => { const t = String(v).trim(); if (!t) return 'יש למלא כמות.'; if (!/^\d+$/.test(t) || +t < 1) return 'יש להזין מספר שלם הגדול מ-0.'; return +t === 2 ? '' : 'הכמות לא תואמת לתרחיש. בדקו שוב כמה יחידות צריך להזמין.'; }
};
let checked = false;
const fld = (form, k) => form.querySelector(`[name="${k}"]`);
function checkField(form, k){
  const el = fld(form, k), box = el.closest('.rf-f'), msg = RULES[k](el.value);
  box.classList.toggle('err', !!msg); box.classList.toggle('ok', !msg);
  el.setAttribute('aria-invalid', !!msg);
  box.querySelector('.rf-msg span').textContent = msg;
  return !msg;
}
function startPractice(){
  $('#intro').hidden = true; $('#prac').hidden = false;
  mount('#pr-form', {id:'pr', live:true, values:{date:today}, lock3:true});
  const f = $('#pr'); checked = false;
  f.addEventListener('submit', e => {
    e.preventDefault(); checked = true;
    const bad = Object.keys(RULES).filter(k => !checkField(f, k)).length, fb = $('#fb3');
    if (!bad){
      feedback(fb, 'good', 'כל הכבוד!', 'הבקשה מלאה ומוכנה לאישור מנהל הסניף. מנהל הסניף יכול לאשר אותה בלי לחזור אליכם להשלמות, ואחרי האישור רכז הרכש יכול להתחיל לטפל בה.');
      finish(f);
    } else if (bad <= 3){
      feedback(fb, 'part', 'כמעט.', 'הבקשה עדיין לא מוכנה לאישור. בקשה כזו הייתה חוזרת אליכם להשלמה, וספירת 3 ימי העבודה הייתה מתחילה מחדש. תקנו את השדות המסומנים ושלחו שוב.');
    } else {
      feedback(fb, 'bad', 'הבקשה עדיין רחוקה מלהיות מלאה.', 'חזרו לתרחיש ומלאו כל שדה לפי הפרטים שמופיעים בו. אפשר להיעזר בהסברים על חלקי הטופס.');
    }
    if (bad){ const first = f.querySelector('.rf-f.err input, .rf-f.err select, .rf-f.err textarea'); if (first) first.focus(); }
  });
  f.addEventListener('input', e => { if (checked && RULES[e.target.name]) checkField(f, e.target.name); });
  f.addEventListener('change', e => { if (checked && RULES[e.target.name]) checkField(f, e.target.name); });
  $('#practice').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  setTimeout(() => fld(f, 'name').focus({preventScroll:true}), 450);
}
$('#start').addEventListener('click', startPractice);

function finish(f){
  const vals = {date:today};
  Object.keys(RULES).forEach(k => vals[k] = fld(f, k).value);
  mount('#dn-form', {id:'dn', values:vals, lock3:true, label:'הבקשה שמילאתם'});
  const d = $('#done'); d.hidden = false;
  setTimeout(() => { d.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); $('#h-done').focus({preventScroll:true}); }, 900);
}
