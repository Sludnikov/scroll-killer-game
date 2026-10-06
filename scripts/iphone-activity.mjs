const APPS=['instagram','tiktok','youtube','vk'];
const EMPTY=()=>({instagram:0,tiktok:0,youtube:0,vk:0});

function appName(value){
  const name=value.toLocaleLowerCase('ru-RU').replace(/[^\p{L}\p{N}]+/gu,'');
  if(name.includes('instagram')||name.includes('инстаграм'))return 'instagram';
  if(name.includes('tiktok')||name.includes('тикток'))return 'tiktok';
  if(name.includes('youtube')||name.includes('ютуб')||name.includes('ютьюб'))return 'youtube';
  if(name==='vk'||name.includes('вконтакте')||name.includes('vkclient'))return 'vk';
  return null;
}

export function durationSeconds(value){
  const input=String(value).trim().toLocaleLowerCase('ru-RU')
    .replace(/[\u00a0\u202f]/g,' ')
    .replace(/(?<=\d) (?=\d{3}(?:[.,]|\b))/g,'');
  if(/^\d+(?:[.,]\d+)?$/.test(input))return Math.round(Number(input.replace(',','.')));
  const clock=input.match(/^(\d+):(\d{2})(?::(\d{2}))?$/);
  if(clock)return clock[3]?Number(clock[1])*3600+Number(clock[2])*60+Number(clock[3]):Number(clock[1])*60+Number(clock[2]);
  const units=[
    [/([\d.,]+)\s*(?:hours?|hrs?|h|час(?:а|ов)?|ч)(?![\p{L}])/gu,3600],
    [/([\d.,]+)\s*(?:minutes?|mins?|min|m|минут(?:а|ы)?|мин)(?![\p{L}])/gu,60],
    [/([\d.,]+)\s*(?:seconds?|secs?|sec|s|секунд(?:а|ы)?|сек|с)(?![\p{L}])/gu,1],
  ];
  let seconds=0,found=false;
  for(const [pattern,multiplier] of units){
    for(const match of input.matchAll(pattern)){seconds+=Number(match[1].replace(',','.'))*multiplier;found=true}
  }
  return found?Math.round(seconds):null;
}

export function parseActivityLines(lines){
  if(typeof lines!=='string'||lines.length>50000)throw Error('Неверный список приложений');
  const result=EMPTY();let rows=0;
  for(const raw of lines.split(/\r?\n/)){
    if(!raw.trim())continue;
    const separator=raw.indexOf('|');
    // Screen Time may return entries without an app name. They cannot match
    // any tracked app, so ignore them instead of rejecting the whole report.
    if(separator===0)continue;
    if(separator<0)throw Error('Неверная строка активности');
    rows++;
    const app=appName(raw.slice(0,separator));
    if(!app)continue;
    const seconds=durationSeconds(raw.slice(separator+1));
    if(seconds===null||seconds<0||seconds>86400)throw Error(`Неверная длительность для ${app}`);
    result[app]=Math.max(result[app],seconds);
  }
  if(!rows)throw Error('Пустая активность: проверьте действие «Экранное время»');
  return result;
}

export function mergeActivity(previous,day,totals,now,initialTotal=0){
  const old=previous||{revision:-1,startedAt:now,totalSeconds:initialTotal,days:{},sessions:[]};
  const prior=old.days[day]||(previous?EMPTY():totals);
  const latest=EMPTY();const additions=[];
  for(const app of APPS){
    latest[app]=Math.max(prior[app]||0,totals[app]||0);
    const delta=latest[app]-(prior[app]||0);
    if(delta>0)additions.push({app,openedAt:Math.max(old.startedAt,now-delta*1000),closedAt:now});
  }
  const days={...old.days,[day]:latest};
  const older=Object.keys(days).sort().slice(0,-40);
  for(const name of older)delete days[name];
  const eventsFrom=Math.max(old.startedAt,now-2*60*60*1000);
  const sessions=[...old.sessions,...additions].filter(item=>item.openedAt>=eventsFrom).slice(-2000);
  const delta=additions.reduce((sum,item)=>sum+(latest[item.app]-(prior[item.app]||0)),0);
  return {
    revision:Math.max(now,old.revision+1),startedAt:old.startedAt,
    totalSeconds:old.totalSeconds+delta,days,sessions,generatedAt:now,
  };
}

export function iphoneSnapshot(state){
  const eventsFrom=Math.max(state.startedAt,state.generatedAt-2*60*60*1000);
  return {version:1,source:'iphone',revision:state.revision,totalSeconds:state.totalSeconds,
    generatedAt:state.generatedAt,eventsFrom,
    sessions:state.sessions.filter(item=>item.openedAt>=eventsFrom)};
}
