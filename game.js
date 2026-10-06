export const SCENES=[
  ['common','Гостиная Гриффиндора',0,'🏰'],['hall','Большой зал',5,'🕯️'],['library','Библиотека',8,'📚'],['corridor','Коридор замка',12,'🏛️'],['potions','Кабинет зелий',16,'⚗️'],['yard','Двор',20,'🌙'],['greenhouse','Теплицы',24,'🌿'],['tower','Астрономическая башня',28,'🔭'],['quidditch','Поле для квиддича',32,'🏟️'],['hut','Хижина Хагрида',36,'🛖']
];
export const ITEMS=[
  ['scarf','Алый шарф',3,'🧣'],['glasses','Круглые очки',3,'◉'],['pin','Золотой значок',3,'✦'],['mittens','Тёплые варежки',3,'🧤'],['ribbon','Лента факультета',3,'🎗️'],
  ['hat','Остроконечная шляпа',5,'🧙'],['cloak','Плащ путника',5,'🧥'],['book','Старая книга',5,'📖'],['lantern','Карманный фонарь',5,'🏮'],['boots','Высокие сапоги',5,'🥾'],
  ['owl','Сова-спутник',8,'🦉'],['wand','Звёздная палочка',8,'🪄'],['satchel','Кожаная сумка',8,'🎒'],['brooch','Лунная брошь',8,'🌙'],['gloves','Дуэльные перчатки',8,'🧤'],
  ['crown','Корона созвездий',12,'👑'],['cape','Мантия ночи',12,'🌌'],['phoenix','Феникс',12,'🔥'],['staff','Посох света',12,'✨'],['aura','Золотая аура',12,'☀️']
];
export const ACTIVITIES=[['extraRead','Дополнительное чтение','10 мин',1,3,'📖'],['meditate','Медитация','20 мин',2,2,'🪷'],['walk','Прогулка','30 мин',3,1,'🌿'],['gym','Тренировка в зале','60 мин',5,1,'💪']];
export const TARGET_SECONDS=600;
export const fresh=(s,now=Date.now())=>s.sync.source==='iphone'&&s.sync.revision>=0&&now-s.sync.at<120000&&now-s.sync.generatedAt<120000&&s.sync.error===null;
const connected=s=>['iphone','local'].includes(s.sync.source)&&s.sync.revision>=0&&s.sync.error===null;
export const localDay=(now=Date.now())=>{const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export function initialState(){return {version:1,hp:100,totalSeconds:0,damageMarks:0,candy:0,ownedScenes:['common'],scene:'common',ownedItems:[],equipped:[],daily:{day:localDay(),counts:{}},sound:false,callbackSafe:false,sync:{revision:-1,at:0,generatedAt:0,error:null,source:null},timer:null}};
export function restore(raw){if(!raw||raw.version!==1||!Number.isInteger(raw.hp)||raw.hp<0||raw.hp>100||raw.hp%25||!Number.isFinite(raw.totalSeconds)||raw.totalSeconds<0||!Number.isInteger(raw.damageMarks)||raw.damageMarks<0||!Number.isInteger(raw.candy)||raw.candy<0)throw Error('Некорректный файл состояния');const s=initialState();Object.assign(s,raw);s.sync={...initialState().sync,...raw.sync};if(!Array.isArray(s.ownedScenes)||!Array.isArray(s.ownedItems)||!Array.isArray(s.equipped))throw Error('Некорректная коллекция');return s}
export function normalizedSync(raw){if(typeof raw==='string')raw=JSON.parse(raw);if(!raw||raw.version!==1||!Number.isSafeInteger(raw.revision)||raw.revision<0||!Number.isFinite(raw.totalSeconds)||raw.totalSeconds<0||!Number.isFinite(raw.generatedAt)||!Number.isFinite(raw.eventsFrom)||!Array.isArray(raw.sessions))throw Error('Неверный формат синхронизации');if(raw.sessions.some(x=>!x||!['instagram','tiktok','youtube','vk'].includes(x.app)||!Number.isFinite(x.openedAt)||!(x.closedAt===null||Number.isFinite(x.closedAt)&&x.closedAt>=x.openedAt)))throw Error('Неверные события приложений');return raw}
export function applySync(state,input,now=Date.now()){
  const p=normalizedSync(input),s=structuredClone(state);
  if(p.revision<s.sync.revision)throw Error('Эта синхронизация устарела');
  if(p.revision===s.sync.revision&&p.totalSeconds!==s.totalSeconds)throw Error('Одинаковая ревизия содержит разные данные');
  if(p.totalSeconds<s.totalSeconds)throw Error('Счётчик использования уменьшился');
  if(p.generatedAt>now+120000)throw Error('Время телефона неверно: отчёт датирован будущим');
  if(p.eventsFrom>p.generatedAt)throw Error('Неверный диапазон событий');
  const totalMarks=Math.floor(p.totalSeconds/TARGET_SECONDS);
  const damage=Math.max(0,totalMarks-s.damageMarks);
  s.hp=Math.max(0,s.hp-damage*25);s.totalSeconds=p.totalSeconds;s.damageMarks=totalMarks;
  s.sync={revision:p.revision,at:p.error?s.sync.at:now,generatedAt:p.generatedAt,error:p.error||null,source:p.source||'mac'};
  return {state:s,damage,interrupted:false};
}
export function startTimer(s,type,now=Date.now()){if(s.timer)throw Error('Сначала завершите текущий таймер');if(type==='read'&&s.hp===0||type==='revive'&&s.hp!==0)throw Error('Этот таймер сейчас недоступен');s.timer={type,startedAt:now};return s}
export function finishTimer(s,now=Date.now()){if(!s.timer)throw Error('Нет активного таймера');if(!Number.isFinite(s.timer.startedAt)||now-s.timer.startedAt<TARGET_SECONDS*1000)throw Error('Десять минут ещё не прошли');if(s.timer.type==='read'){if(s.hp===0)throw Error('Чтение недоступно при 0% HP');s.hp=Math.min(100,s.hp+25)}else{s.hp=100}s.timer=null;return s}
export function resetDaily(s,now=Date.now()){const day=localDay(now);if(s.daily.day!==day)s.daily={day,counts:{}};return s}
export function claimActivity(s,id,now=Date.now()){if(!connected(s))throw Error('Сначала подключите iPhone');if(s.hp===0)throw Error('Занятия недоступны при 0% HP');resetDaily(s,now);const a=ACTIVITIES.find(x=>x[0]===id);if(!a)throw Error('Неизвестное занятие');const count=s.daily.counts[id]||0;if(count>=a[4])throw Error('Дневной лимит исчерпан');s.daily.counts[id]=count+1;s.candy+=a[3];return s}
export function buyOrEquip(s,kind,id,now=Date.now()){if(!connected(s))throw Error('Сначала подключите iPhone');if(s.hp===0)throw Error('Коллекция недоступна при 0% HP');const item=(kind==='scene'?SCENES:ITEMS).find(x=>x[0]===id);if(!item)throw Error('Неизвестный предмет');const owned=kind==='scene'?s.ownedScenes:s.ownedItems;if(!owned.includes(id)){if(s.candy<item[2])throw Error('Недостаточно леденцов');s.candy-=item[2];owned.push(id)}if(kind==='scene')s.scene=id;else if(s.equipped.includes(id))s.equipped=s.equipped.filter(x=>x!==id);else s.equipped.push(id);return s}
