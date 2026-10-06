import {SCENES,ITEMS,ACTIVITIES,TARGET_SECONDS,initialState,restore,applySync,startTimer,finishTimer,resetDaily,claimActivity,buyOrEquip,fresh} from './game.js';
import {drawAccessories,itemIconData} from './accessories.js';
const KEY='scroll-killer-pages-state-v1';
const BRIDGE='https://scroll-killer-sync-bridge.radiance5100.chatgpt.site';
const OWNER_TOKEN_KEY='scroll-killer-owner-token-v1';
const PLAYER_TOKEN_KEY='scroll-killer-player-token-v1';
if(!localStorage.getItem(OWNER_TOKEN_KEY)&&!localStorage.getItem(PLAYER_TOKEN_KEY)){const bytes=crypto.getRandomValues(new Uint8Array(32));localStorage.setItem(PLAYER_TOKEN_KEY,Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join(''))}
const isOwner=()=>!!localStorage.getItem(OWNER_TOKEN_KEY);
const currentToken=()=>localStorage.getItem(OWNER_TOKEN_KEY)||localStorage.getItem(PLAYER_TOKEN_KEY);
const hasCloud=()=>!!currentToken();
const cloudHeaders=()=>({'authorization':`Bearer ${currentToken()}`});
const SHORTCUT_NAME=()=>isOwner()?'ScrollKiller':'ScrollKillerFriends';
const $=s=>document.querySelector(s);
let state;try{state=restore(JSON.parse(localStorage.getItem(KEY)))}catch{state=initialState()}
if(!isOwner()&&state.sync.source===null)state.sync={...state.sync,source:'local',revision:0,error:null};
let view='home',category='scenes',toastTimeout,speechTimeout,audio;
let cloudRevision=null,cloudReady=false,cloudQueue=Promise.resolve(),localGeneration=0,ready;
const saveLocal=()=>{localStorage.setItem(KEY,JSON.stringify(state));render()};
const toast=message=>{const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),3500)};
async function cloudRequest(payload){
  const response=await fetch(`${BRIDGE}/api/game-state`,{method:'POST',headers:{'content-type':'application/json',...cloudHeaders()},body:JSON.stringify(payload),cache:'no-store',credentials:'same-origin'});
  const data=await response.json();
  if(!response.ok&&response.status!==409)throw Error(data.error||'Не удалось сохранить прогресс');
  return {response,data};
}
function adoptCloud(data){
  cloudRevision=data.revision;
  state=restore(data.state);
  saveLocal();
}
async function readCloud(migrate=false){
  if(!hasCloud())return;
  await cloudQueue.catch(()=>{});
  const response=await fetch(`${BRIDGE}/api/game-state`,{cache:'no-store',headers:cloudHeaders(),credentials:'omit'});
  if(response.status===404){
    if(!migrate)return;
    const {data}=await cloudRequest({migrate:true,state});
    adoptCloud(data);cloudReady=true;return;
  }
  if(!response.ok)throw Error(`Не удалось загрузить прогресс: ${response.status}`);
  let data=await response.json();
  if(migrate&&state.totalSeconds>data.state.totalSeconds){
    data=(await cloudRequest({migrate:true,state})).data;
  }
  if(!cloudReady||data.revision!==cloudRevision)adoptCloud(data);
  cloudReady=true;
}
function save(){
  saveLocal();
  if(!hasCloud())return Promise.resolve();
  const generation=++localGeneration;
  if(!cloudReady)return Promise.resolve();
  const snapshot=structuredClone(state);
  cloudQueue=cloudQueue.catch(()=>{}).then(async()=>{
    const {response,data}=await cloudRequest({revision:cloudRevision,state:snapshot});
    cloudRevision=data.revision;
    if(response.status===409&&generation===localGeneration){adoptCloud(data);toast('Прогресс обновлён из другой версии игры')}
  });
  return cloudQueue;
}
const action=async fn=>{try{await ready;await readCloud();fn();await save()}catch(e){toast(e.message)}};
const sceneBackgrounds={common:'common-room.png',hall:'great-hall.png',library:'library.png',corridor:'corridor.png',potions:'potions.png',yard:'yard.png',greenhouse:'greenhouse.png',tower:'tower.png',quidditch:'quidditch.png',hut:'hut.png'};
function drawScene(){
  const scene=$('#scene'),backdrop=$('#scene-backdrop'),canvas=$('#scene-canvas'),hero=$('#hero-art');
  scene.dataset.hp=String(state.hp);
  backdrop.style.backgroundImage=`url("assets/${sceneBackgrounds[state.scene]||'common-room.png'}")`;
  backdrop.style.filter='saturate(.95) contrast(1.02)';
  hero.alt=`Волшебник: ${state.hp}% здоровья, ${SCENES.find(x=>x[0]===state.scene)?.[1]||'сцена'}`;
  const w=scene.clientWidth,h=scene.clientHeight,dpr=Math.min(window.devicePixelRatio||1,2);
  if(!w||!h)return;
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
  const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const cx=w/2,t=Date.now()/1000;
  ctx.save();ctx.translate(cx,h-8);ctx.scale(.9,.9);ctx.translate(-cx,-(h-8));
  // The forehead mark belongs to the hero; spectacles are only drawn when equipped.
  ctx.strokeStyle='#c79473';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(cx-17,45);ctx.lineTo(cx-13,49);ctx.lineTo(cx-16,52);ctx.lineTo(cx-12,55);ctx.stroke();
  ctx.translate(cx,0);
  drawAccessories(ctx,new Set(state.equipped));
  ctx.restore();
  const curse=Math.min(1,(100-state.hp)/100+(state.totalSeconds%600)/1200);
  for(let i=0;i<Math.floor(curse*23);i++){const x=(i*61+Math.floor(t*8)*(i%3+1))%w,y=(i*79+Math.floor(t*11))%h;const radius=1.5+i%3;ctx.fillStyle=i%2?'#c189d2aa':'#7660baa8';ctx.shadowColor='#8e69c8';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill()}
  ctx.shadowBlur=0;
  if(state.hp===0){ctx.fillStyle='#1d122744';ctx.fillRect(0,0,w,h)}
}
function formatTime(sec){sec=Math.max(0,sec);return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
function render(){resetDaily(state);if(state.hp===0&&!['defeat','timer'].includes(view))view='defeat';if(state.hp>0&&view==='defeat')view='home';document.body.classList.toggle('defeated',state.hp===0);document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===view));document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('selected',x.dataset.view===view));
  $('#hp-label').textContent=`${state.hp}% HP`;$('#hp-bar').style.width=`${state.hp}%`;$('#hp-word').textContent=state.hp===100?'Здоров':state.hp===0?'Поражение':state.hp<=25?'Критично':'Ослаблен';$('#horcruxes').innerHTML=Array.from({length:4},(_,i)=>`<span class="horcrux ${i>=state.hp/25?'broken':''}" aria-label="${i<state.hp/25?'целый':'разрушенный'} крестраж">${i<state.hp/25?'✧':'×'}</span>`).join('');const remainder=state.totalSeconds%600;$('#minutes-left').textContent=`${Math.ceil((600-remainder)/60)} мин`;$('#minute-bar').style.width=`${remainder/600*100}%`;$('#hero-state').textContent=['Сила духа на высоте','Заклятие оставило след','Нужен отдых','Сил почти не осталось','Герой пал'][4-state.hp/25];$('#scene-name').textContent=SCENES.find(x=>x[0]===state.scene)?.[1]||SCENES[0][1];$('#candy-top').textContent=`🍬 ${state.candy}`;$('#candy-collection').textContent=state.candy;
  const synced=state.sync.source==='iphone';const stale=!fresh(state);$('#sync-status').textContent=state.sync.error?'● Ошибка синхронизации':!synced?'● Подключите iPhone':stale?'● Нужен свежий отчёт':'● Синхронизировано';$('#sync-status').className=`status-pill ${state.sync.error?'bad':stale||!synced?'':'good'}`;$('#sync-detail').textContent=`${state.sync.error||'Минуты приходят с iPhone после выхода из выбранных приложений.'} Последний отчёт iPhone: ${synced&&state.sync.generatedAt?new Date(state.sync.generatedAt).toLocaleString('ru-RU'):'никогда'}. ${stale&&synced?'Для обновления запустите ScrollKiller и вернитесь в игру.':''}`;
  if(!isOwner()&&state.sync.source!=='iphone'){$('#sync-status').textContent='● iPhone не подключён';$('#sync-status').className='status-pill';$('#sync-detail').textContent='Ваш прогресс хранится отдельно. Для автоматического учёта установите личную команду ниже; первый отчёт создаст исходную точку.'}
  $('#friend-setup').hidden=isOwner();
  if(!isOwner())$('#friend-code').textContent=currentToken();
  $('#sound-toggle').classList.toggle('on',state.sound);$('#sound-toggle').setAttribute('aria-checked',String(state.sound));renderTimer();renderActivities();renderCollection();drawScene();}
function renderTimer(){
  const info=$('#timer-intro'),controls=$('#timer-controls'),timer=state.timer;
  const revive=timer?timer.type==='revive':state.hp===0;
  info.textContent=revive?'Мини-тренировка · 10 минут → 100% HP и четыре крестража':'Читаю · 10 минут → +25% HP и один крестраж';
  if(!timer){
    $('#timer-time').textContent='10:00';$('#timer-subtitle').textContent='до награды';
    controls.innerHTML=`<button id="start-timer" class="primary wide">${revive?'Начать мини-тренировку':'Начать чтение'}</button>`;
    $('#start-timer').onclick=()=>{unlockAudio();action(()=>startTimer(state,revive?'revive':'read'))};
    return;
  }
  const remaining=Math.max(0,Math.ceil((timer.startedAt+TARGET_SECONDS*1000-Date.now())/1000));
  $('#timer-time').textContent=formatTime(remaining);
  $('#timer-subtitle').textContent=remaining?'читай спокойно':'время вышло';
  controls.innerHTML=`<div class="info-card">${remaining?'Таймер идёт. Проверять iPhone для награды не нужно.':'Десять минут прошли. Награда готова.'}</div>${remaining?'':'<button id="finish-timer" class="primary wide">Завершить и получить награду</button>'}<button id="cancel-timer" class="ghost wide">Отменить таймер</button>`;
  if(!remaining)$('#finish-timer').onclick=()=>action(()=>{finishTimer(state);tone(660);toast('Силы восстановлены')});
  $('#cancel-timer').onclick=()=>action(()=>{state.timer=null});
}
function renderActivities(){const el=$('#activity-list');el.innerHTML='';for(const [id,name,duration,reward,limit,icon] of ACTIVITIES){const count=state.daily.counts[id]||0;const card=document.createElement('div');card.className='activity-card';card.innerHTML=`<div class="activity-icon">${icon}</div><div class="activity-copy"><h3>${name}</h3><p>${duration} · +${reward} 🍬 · ${count}/${limit} сегодня</p></div><button ${count>=limit||state.hp===0?'disabled':''}>Сделано</button>`;card.querySelector('button').onclick=()=>action(()=>{claimActivity(state,id);tone(500);toast(`+${reward} леденцов`)});el.append(card)}}
function renderCollection(){
  document.querySelectorAll('[data-category]').forEach(x=>x.classList.toggle('selected',x.dataset.category===category));
  const el=$('#collection-list');el.innerHTML='';
  const items=category==='scenes'?SCENES:ITEMS;
  for(const [id,name,price] of items){
    const isScene=category==='scenes',owned=(isScene?state.ownedScenes:state.ownedItems).includes(id),equipped=isScene?state.scene===id:state.equipped.includes(id);
    const card=document.createElement('div');card.className=`shop-card ${equipped?'equipped':''}`;
    const visual=isScene?`<img class="scene-thumbnail" src="assets/${sceneBackgrounds[id]}" alt="">`:`<div class="shop-icon"><img src="${itemIconData(id)}" alt=""></div>`;
    const status=equipped?isScene?'Выбрано':'Надето':owned?'Куплено':price===0?'Бесплатно':`${price} 🍬`;
    const button=equipped?isScene?'Выбрано':'Снять':owned?'Надеть':'Купить';
    card.innerHTML=`${visual}<div class="shop-copy"><h3>${name}</h3><p>${status}</p></div><button ${isScene&&equipped||state.hp===0?'disabled':''}>${button}</button>`;
    card.querySelector('button').onclick=()=>action(()=>{
      const wasOwned=(isScene?state.ownedScenes:state.ownedItems).includes(id),wasEquipped=!isScene&&state.equipped.includes(id);
      buyOrEquip(state,isScene?'scene':'item',id);tone(700);toast(!wasOwned?'Покупка совершена':isScene?'Локация выбрана':wasEquipped?'Предмет снят':'Предмет надет');
    });
    el.append(card);
  }
}
function navigate(to){if(state.hp===0&&!['defeat','timer'].includes(to)){view='defeat';toast('Сначала оживите героя')}else view=to;render();window.scrollTo(0,0)}
function tone(f=440,volume=.08){if(!state.sound)return;try{audio||=new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(f*1.3,audio.currentTime+.16);g.gain.setValueAtTime(.0001,audio.currentTime);g.gain.exponentialRampToValueAtTime(volume,audio.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.32);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.33)}catch{}}
function unlockAudio(){if(!state.sound)return;try{audio||=new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{})}catch{}}
function checkTimerCompletion(){
  const timer=state.timer;
  if(!timer||document.visibilityState!=='visible'||Date.now()-timer.startedAt<TARGET_SECONDS*1000)return;
  const key='scroll-killer-timer-alarm-v1',id=String(timer.startedAt);
  if(localStorage.getItem(key)===id)return;
  localStorage.setItem(key,id);
  if(state.sound){unlockAudio();[523.25,659.25,783.99,1046.5].forEach((note,index)=>setTimeout(()=>tone(note,.13),index*170))}
  toast('Время вышло! Награда ждёт тебя.');
}
let musicStep=0;const melody=[392,493.88,587.33,493.88,349.23,440,523.25,440];function startMusic(){if(!state.sound)return;tone(melody[musicStep++%melody.length],.022)}setInterval(()=>{if(document.visibilityState==='visible')startMusic()},950);
let syncBusy=false;
function runShortcut(){if(!hasCloud()){$('#import-file').click();return}window.location.href=`shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME())}`}
async function pullSync(manual=false){if(!hasCloud()){if(manual)$('#import-file').click();return;}
  if(syncBusy)return;
  syncBusy=true;
  try{
    await ready;
    await readCloud();
    const response=await fetch(`${BRIDGE}/api/sync`,{cache:'no-store',headers:cloudHeaders(),credentials:'omit'});
    if(!response.ok)throw Error(response.status===404?'iPhone ещё не передал данные':`Ошибка сервера: ${response.status}`);
    const input=await response.json();
    if(input.source!=='iphone'){
      if(state.sync.error){state.sync.error=null;save()}
      if(manual)toast('iPhone ещё не передал данные. Запустите команду в приложении «Команды».');
      return;
    }
    const sameSource=state.sync.source==='iphone';
    if(sameSource&&input.revision===state.sync.revision){
      if(state.sync.error==='Данные синхронизации устарели или время телефона неверно'){
        state.sync.error=null;
        await save();
      }else render();
      if(manual)toast(fresh(state)?'Данные уже актуальны':'Нового отчёта нет. Запустите ScrollKiller на iPhone.');
      return;
    }
    if(sameSource&&input.revision<state.sync.revision)return;
    const baseKey=input.source==='iphone'?'iphoneBaseTotal':'macBaseTotal';
    if(state[baseKey]===undefined)state[baseKey]=state.totalSeconds-input.totalSeconds;
    const adjusted={...input,totalSeconds:input.totalSeconds+state[baseKey]};
    const result=applySync(state,adjusted);
    state=result.state;await save();
    if(result.damage||result.interrupted||manual){tone(result.damage?220:630);toast(result.damage?`Урон: −${result.damage*25}% HP`:result.interrupted?'Таймер на паузе после открытия приложения':'Данные обновлены')}
  }catch(error){
    const message=error.message||'Не удалось получить данные iPhone';
    if(state.sync.error!==message){state.sync.error=message;await save()}
    if(manual)toast(message);
  }finally{syncBusy=false}
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.view)));
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;renderCollection()}));
$('#hero-hit').onclick=()=>{const lines=state.hp===0?['Мне нужен новый шанс…']:['Ещё одна страница вместо ленты?','Магия начинается с выбора.','Давай проживём этот вечер по-настоящему.','Я всё ещё здесь.'];$('#speech').textContent=lines[Math.floor(Math.random()*lines.length)];$('#speech').classList.remove('hidden');clearTimeout(speechTimeout);speechTimeout=setTimeout(()=>$('#speech').classList.add('hidden'),2700);tone(560)};
$('#sync-button').onclick=runShortcut;$('#defeat-sync').onclick=runShortcut;$('#settings-sync').onclick=()=>pullSync(true);$('#settings-run-shortcut').onclick=runShortcut;$('#revive-entry').onclick=()=>navigate('timer');
$('#sound-toggle').onclick=()=>action(()=>{state.sound=!state.sound;startMusic()});
$('#copy-friend-code').onclick=async()=>{try{await navigator.clipboard.writeText(currentToken());toast('Личный код скопирован')}catch{toast('Скопируйте код из поля выше')}};
$('#export-button').onclick=()=>{const blob=new Blob([JSON.stringify({format:'scroll-killer-backup',exportedAt:new Date().toISOString(),state,syncToken:currentToken(),syncKind:isOwner()?'owner':'player'},null,2)],{type:'application/json'}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`scroll-killer-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)};
$('#import-file').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const backup=JSON.parse(await file.text());if(backup.format!=='scroll-killer-backup')throw Error('Это не резервная копия игры');await ready;await readCloud();state=restore(backup.state);state.callbackSafe=false;if(backup.syncToken){if(backup.syncKind==='player'){localStorage.removeItem(OWNER_TOKEN_KEY);localStorage.setItem(PLAYER_TOKEN_KEY,backup.syncToken)}else localStorage.setItem(OWNER_TOKEN_KEY,backup.syncToken);cloudReady=false;cloudRevision=null;saveLocal();await readCloud(false)}else if(!isOwner())state.sync={...state.sync,source:'local',revision:0,error:null};await save();pullSync();toast(backup.syncToken?'Копия восстановлена':'Прогресс восстановлен. Для учёта Экранного времени настройте команду iPhone.')}catch(error){toast(error.message)}e.target.value=''};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){pullSync();checkTimerCompletion();render()}});setInterval(()=>{checkTimerCompletion();if(view==='timer')renderTimer();if(view==='home'||view==='defeat')drawScene()},1000);setInterval(()=>{if(document.visibilityState==='visible')pullSync()},60000);
if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').then(registration=>{
  registration.update().catch(()=>{});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')registration.update().catch(()=>{})});
  setInterval(()=>registration.update().catch(()=>{}),15*60*1000);
}).catch(()=>{});
render();ready=readCloud(!isOwner()).catch(error=>{toast(error.message)});ready.then(()=>{pullSync();checkTimerCompletion()});
