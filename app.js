const $=s=>document.querySelector(s),ls=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},sv=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const CATS=['Завтраки','Супы','Горячее','Салаты','Выпечка','Десерты'],ICON=['🍳','🍲','🍗','🥗','🥐','🍰'];
let custom=ls('cb2-custom',[]),fav=new Set(ls('cb2-fav',[])),cat='Все',editId=null;
const all=()=>[...custom,...BASE],tint=c=>`var(--c${Math.max(0,CATS.indexOf(c))})`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1800)};
const img=r=>r.photo?`<img src="${esc(r.photo)}" alt="" loading="lazy" onerror="this.remove()">`:'';
function chips(){const l=['Все','♥ Избранное','Мои',...CATS.map((c,i)=>ICON[i]+' '+c)];$('#cats').innerHTML=l.map(x=>`<button data-c="${esc(x)}" class="${cat===x?'on':''}">${x}</button>`).join('')}
function render(){const q=$('#search').value.toLowerCase().trim();
const list=all().filter(r=>(cat==='Все'||(cat==='♥ Избранное'?fav.has(r.id):cat==='Мои'?r.id.startsWith('c'):cat.endsWith(r.category)))&&[r.title,r.category,r.description,...r.ingredients].join(' ').toLowerCase().includes(q));
$('#count').textContent=list.length+' '+(list.length%10==1&&list.length!=11?'рецепт':[2,3,4].includes(list.length%10)&&(list.length<10||list.length>20)?'рецепта':'рецептов');
$('#recipes').innerHTML=list.length?list.map(r=>`<article class="card" data-open="${r.id}"><div class="art" style="background:${tint(r.category)}">${esc(r.emoji)}${img(r)}<button class="fav" data-fav="${r.id}" aria-label="В избранное">${fav.has(r.id)?'♥':'♡'}</button></div><div class="body"><div class="meta">${esc(r.category)} · ${r.time} мин</div><h3>${esc(r.title)}</h3><p>${esc(r.description||'')}</p></div></article>`).join(''):'<p class="empty">Ничего не нашлось. Попробуйте другое слово или добавьте свой рецепт.</p>'}
function openRecipe(id){const r=all().find(x=>x.id===id);if(!r)return;const mine=id.startsWith('c');
$('#detailContent').innerHTML=`<div class="dart" style="background:${tint(r.category)}">${esc(r.emoji)}${img(r)}</div><div class="meta">${esc(r.category)} · ${r.time} мин</div><div class="dt">${esc(r.title)}</div><p>${esc(r.description||'')}</p><h3>Ингредиенты</h3><ul class="ing">${r.ingredients.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h3>Приготовление</h3><ol class="steps">${r.steps.map(x=>`<li><span>${esc(x)}</span></li>`).join('')}</ol><div class="acts"><button class="primary" id="dFav">${fav.has(id)?'♥ В избранном':'♡ В избранное'}</button>${mine?'<button class="ghost" id="dEdit">Изменить</button><button class="danger" id="dDel">Удалить</button>':''}</div>`;
$('#dFav').onclick=()=>{toggleFav(id);$('#dFav').textContent=fav.has(id)?'♥ В избранном':'♡ В избранное'};
if(mine){$('#dEdit').onclick=()=>{$('#detail').close();openForm(r)};$('#dDel').onclick=()=>{if(confirm('Удалить рецепт?')){custom=custom.filter(x=>x.id!==id);sv('cb2-custom',custom);$('#detail').close();render();toast('Рецепт удалён')}}}
$('#detailContent').querySelectorAll('.ing li').forEach(li=>li.onclick=()=>li.classList.toggle('done'));$('#detail').showModal()}
function toggleFav(id){fav.has(id)?fav.delete(id):fav.add(id);sv('cb2-fav',[...fav]);render()}
function openForm(r){const f=$('#form');f.reset();editId=r?r.id:null;$('#formTitle').textContent=r?'Изменить рецепт':'Новый рецепт';
if(r){f.title.value=r.title;f.category.value=r.category;f.time.value=r.time;f.emoji.value=r.emoji;f.photo.value=r.photo||'';f.description.value=r.description||'';f.ingredients.value=r.ingredients.join('\n');f.steps.value=r.steps.join('\n')}
$('#addDialog').showModal()}
$('#form').category.innerHTML=CATS.map(c=>`<option>${c}</option>`).join('');
$('#form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),L=k=>f.get(k).split('\n').map(x=>x.trim()).filter(Boolean);
const r={id:editId||'c'+Date.now(),title:f.get('title').trim(),category:f.get('category'),time:+f.get('time'),emoji:f.get('emoji')||'🍲',photo:f.get('photo').trim(),description:f.get('description').trim(),ingredients:L('ingredients'),steps:L('steps')};
custom=editId?custom.map(x=>x.id===editId?r:x):[r,...custom];sv('cb2-custom',custom);cat='Все';chips();render();$('#addDialog').close();toast('Рецепт сохранён')};
$('#export').onclick=()=>{const t=JSON.stringify(custom,null,1);navigator.clipboard?.writeText(t).then(()=>toast('Скопировано'),()=>prompt('Скопируйте:',t))};
$('#cats').onclick=e=>{const b=e.target.closest('[data-c]');if(b){cat=b.dataset.c;chips();render()}};
$('#search').oninput=render;
$('#recipes').onclick=e=>{const f=e.target.closest('[data-fav]'),o=e.target.closest('[data-open]');if(f){e.stopPropagation();toggleFav(f.dataset.fav)}else if(o)openRecipe(o.dataset.open)};
$('#add').onclick=()=>openForm();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());
document.querySelectorAll('dialog').forEach(d=>d.onclick=e=>{if(e.target===d)d.close()});
try{Telegram.WebApp.ready();Telegram.WebApp.expand();const dk=matchMedia('(prefers-color-scheme:dark)').matches;Telegram.WebApp.setHeaderColor(dk?'#1c1423':'#f1f5e9');Telegram.WebApp.setBackgroundColor(dk?'#1c1423':'#f1f5e9')}catch(e){}
chips();render();
