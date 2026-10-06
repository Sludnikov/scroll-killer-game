const APPS=new Set(['instagram','tiktok','youtube','vk']);
const ISO=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

// An append-only text file is much easier to maintain in iOS Shortcuts than JSON.
export function logToSync(input,revision,now=Date.now()){
  if(typeof input!=='string'||!input.trim())throw Error('Журнал пуст. Откройте и закройте отслеживаемое приложение.');
  const opened=new Map(),sessions=[];
  const lines=input.replace(/^\uFEFF/,'').trim().split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
    const line=lines[i].trim();
    if(!line)continue;
    const parts=line.split('|');
    if(parts.length!==3||!APPS.has(parts[0])||!['open','close'].includes(parts[1])||!ISO.test(parts[2]))throw Error(`Неверная строка журнала ${i+1}`);
    const [app,kind,iso]=parts,at=Date.parse(iso);
    if(!Number.isFinite(at)||at>now+120000)throw Error(`Неверное время в строке ${i+1}`);
    if(kind==='open'){
      if(opened.has(app))throw Error(`Нет закрытия ${app} перед строкой ${i+1}`);
      opened.set(app,at);
    }else{
      const start=opened.get(app);
      if(start===undefined||at<start)throw Error(`Нет открытия ${app} перед строкой ${i+1}`);
      sessions.push({app,openedAt:start,closedAt:at});
      opened.delete(app);
    }
  }
  if(opened.size)throw Error('В журнале есть незакрытое приложение. Проверьте автоматизацию «Закрыто».');
  sessions.sort((a,b)=>a.openedAt-b.openedAt);
  let totalMs=0,end=0;
  for(const s of sessions){
    if(s.closedAt>end){totalMs+=s.closedAt-Math.max(s.openedAt,end);end=s.closedAt}
  }
  return {version:1,revision,totalSeconds:Math.floor(totalMs/1000),generatedAt:now,eventsFrom:0,sessions};
}
