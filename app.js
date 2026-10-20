const $=s=>document.querySelector(s),ls=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{toast('Не хватило места: уберите фото у старых рецептов')}};
const CATS=['Завтраки','Супы','Горячее','Салаты','Выпечка','Десерты'],HUE=['#ffd166','#ff8f6b','#f4a3b8','#8fd16a','#f0b46c','#c4a3f0'];
let custom=ls('cb2-custom',[]),fav=new Set(ls('cb2-fav',[])),cat='Все',editId=null;
const all=()=>[...custom,...BASE],esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1900)};
function plate(r){let h=0;for(const ch of r.title)h=(h*31+ch.charCodeAt(0))%9973;const c=HUE[Math.max(0,CATS.indexOf(r.category))];let d='';
for(let i=0;i<8;i++){h=(h*1103+12345)%9973;const a=h%360*Math.PI/180,k=6+h%18;d+=`<circle cx="${50+Math.cos(a)*k}" cy="${50+Math.sin(a)*k}" r="${4+h%7}" fill="${c}" opacity=".${6+h%4}"/>`}
return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="g"><stop offset="0" stop-color="#2f5a47"/><stop offset="1" stop-color="#10261e"/></radialGradient></defs><rect width="100" height="100" fill="url(#g)"/><circle cx="50" cy="50" r="37" fill="#e8efe0"/><circle cx="50" cy="50" r="29" fill="#f7faf2" stroke="#cfdcc4"/>${d}<path d="M40 44c6-10 16-12 22-8-4 8-14 12-22 8z" fill="#5f9a4e"/></svg>`}
const ph=(r,x='')=>`<div class="ph">${plate(r)}${r.photo?`<img src="${esc(r.photo)}" alt="${esc(r.title)}" loading="lazy" onerror="this.remove()">`:''}${x}</div>`;
function tiles(){$('#cats').innerHTML=['Все',...CATS].map(c=>`<button data-c="${c}" class="${cat===c?'on':''}"><b>${c==='Все'?all().length:all().filter(r=>r.category===c).length}</b>${c}</button>`).join('');
document.querySelectorAll('#tabs [data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t===(cat==='Все'||CATS.includes(cat)?'Все':cat)))}
function hero(){const l=all(),r=l[new Date().getDate()%l.length];$('#hero').innerHTML=`<div><small>Рецепт дня</small><h3>${esc(r.title)}</h3><p>${esc(r.description||'')}</p><button class="pill" data-open="${r.id}">Смотреть</button></div>${ph(r)}`}
function render(){const q=$('#search').value.toLowerCase().trim();
const list=all().filter(r=>(cat==='Все'||(cat==='♥'?fav.has(r.id):cat==='Мои'?r.id[0]==='c':r.category===cat))&&[r.title,r.category,r.description,...r.ingredients].join(' ').toLowerCase().includes(q));
$('#secTitle').textContent={'Все':'Все рецепты','♥':'Избранное','Мои':'Мои рецепты'}[cat]||cat;$('#count').textContent='Найдено: '+list.length;
$('#recipes').innerHTML=list.length?list.map(r=>`<article class="glass card" data-open="${r.id}">${ph(r,`<button class="fav" data-fav="${r.id}" aria-label="В избранное">${fav.has(r.id)?'♥':'♡'}</button>`)}<h3>${esc(r.title)}</h3><div class="meta">${esc(r.category)} · ${r.time} мин</div></article>`).join(''):'<p class="empty">Здесь пока пусто. Измените запрос или добавьте рецепт кнопкой «Добавить».</p>';tiles()}
function openRecipe(id){const r=all().find(x=>x.id===id);if(!r)return;const mine=id[0]==='c',d=$('#detail');
$('#detailContent').innerHTML=`<div class="dtop">${ph(r)}<button class="round bk" id="dBack" aria-label="Назад">‹</button><button class="round hf" id="dHeart" aria-label="В избранное">${fav.has(id)?'♥':'♡'}</button></div><div class="glass panel"><h2>${esc(r.title)}</h2><div class="sub">${esc(r.category)}</div><p>${esc(r.description||'')}</p><div class="facts"><div><b>${r.time}</b><span>минут</span></div><div><b>${r.ingredients.length}</b><span>ингредиентов</span></div><div><b>${r.steps.length}</b><span>шагов</span></div></div><h3>Ингредиенты</h3><ul class="ing">${r.ingredients.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h3>Приготовление</h3><ol class="steps">${r.steps.map(x=>`<li><span>${esc(x)}</span></li>`).join('')}</ol>${mine?'<div class="acts"><button class="ghost" id="dEdit">Изменить</button><button class="danger" id="dDel">Удалить</button></div>':'<div class="acts"></div>'}</div>`;
$('#dBack').onclick=()=>d.close();$('#dHeart').onclick=()=>{toggleFav(id);$('#dHeart').textContent=fav.has(id)?'♥':'♡'};
if(mine){$('#dEdit').onclick=()=>{d.close();openForm(r)};$('#dDel').onclick=()=>{if(confirm('Удалить рецепт?')){custom=custom.filter(x=>x.id!==id);sv('cb2-custom',custom);d.close();hero();render();toast('Рецепт удалён')}}}
d.querySelectorAll('.ing li').forEach(li=>li.onclick=()=>li.classList.toggle('done'));d.showModal();d.scrollTop=0}
function toggleFav(id){fav.has(id)?fav.delete(id):fav.add(id);sv('cb2-fav',[...fav]);render()}
function openForm(r){const f=$('#form');f.reset();editId=r?r.id:null;$('#formTitle').textContent=r?'Изменить рецепт':'Новый рецепт';
if(r){f.title.value=r.title;f.category.value=r.category;f.time.value=r.time;f.photo.value=(r.photo||'').startsWith('data:')?'':r.photo||'';f.description.value=r.description||'';f.ingredients.value=r.ingredients.join('\n');f.steps.value=r.steps.join('\n')}$('#addDialog').showModal()}
const readPhoto=file=>new Promise(res=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,700/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.75))};im.src=fr.result};fr.readAsDataURL(file)});
$('#form').category.innerHTML=CATS.map(c=>`<option>${c}</option>`).join('');
$('#form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),L=k=>f.get(k).split('\n').map(x=>x.trim()).filter(Boolean),file=f.get('file'),old=custom.find(x=>x.id===editId);
const photo=file&&file.size?await readPhoto(file):f.get('photo').trim()||(old&&old.photo.startsWith('data:')?old.photo:'');
const r={id:editId||'c'+Date.now(),title:f.get('title').trim(),category:f.get('category'),time:+f.get('time'),photo,description:f.get('description').trim(),ingredients:L('ingredients'),steps:L('steps')};
custom=editId?custom.map(x=>x.id===editId?r:x):[r,...custom];sv('cb2-custom',custom);cat='Все';hero();render();$('#addDialog').close();toast('Рецепт сохранён')};
$('#export').onclick=()=>{const t=JSON.stringify(custom.map(r=>({...r,photo:(r.photo||'').startsWith('data:')?'':r.photo})),null,1);navigator.clipboard?.writeText(t).then(()=>toast('Скопировано'),()=>prompt('Скопируйте:',t))};
$('#cats').onclick=e=>{const b=e.target.closest('[data-c]');if(b){cat=b.dataset.c;render()}};
$('#tabs').onclick=e=>{const b=e.target.closest('[data-t]');if(b){cat=b.dataset.t;render()}};
$('#search').oninput=render;$('#rand').onclick=()=>{const l=all();openRecipe(l[Math.floor(Math.random()*l.length)].id)};
document.body.onclick=e=>{const f=e.target.closest('[data-fav]'),o=e.target.closest('[data-open]');if(f){e.stopPropagation();toggleFav(f.dataset.fav)}else if(o)openRecipe(o.dataset.open)};
$('#add').onclick=()=>openForm();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());
try{Telegram.WebApp.ready();Telegram.WebApp.expand();Telegram.WebApp.setHeaderColor('#10261e');Telegram.WebApp.setBackgroundColor('#10261e')}catch(e){}
hero();render();
