import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {parseActivityLines,mergeActivity,iphoneSnapshot} from './iphone-activity.mjs';

const token=process.env.OWNER_GAME_KEY;
const lines=process.env.IPHONE_LINES;
if(!/^[a-f0-9]{64}$/i.test(token||''))throw Error('OWNER_GAME_KEY is missing');
if(typeof lines!=='string')throw Error('IPHONE_LINES is missing');
const digest=createHash('sha256').update(token).digest();
const file=process.env.FEED_DIR
  ? new URL(`${digest.toString('hex')}.json`,new URL(`file://${process.env.FEED_DIR.replace(/\/$/,'')}/`))
  : new URL(`../feeds/${digest.toString('hex')}.json`,import.meta.url);
const decrypt=box=>{
  const bytes=Buffer.from(box.data,'base64');
  const decipher=createDecipheriv('aes-256-gcm',digest,Buffer.from(box.iv,'base64'));
  decipher.setAuthTag(bytes.subarray(-16));
  return JSON.parse(Buffer.concat([decipher.update(bytes.subarray(0,-16)),decipher.final()]).toString());
};
const encrypt=value=>{
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',digest,iv);
  const data=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final(),cipher.getAuthTag()]);
  return {version:1,iv:iv.toString('base64'),data:data.toString('base64')};
};
let current;
try{current=decrypt(JSON.parse(await readFile(file,'utf8')))}
catch(error){if(error.code!=='ENOENT')throw error;current={game:null,sync:{source:'local',totalSeconds:0}}}
if(!current.sync)throw Error('Feed is incomplete');
const totals=parseActivityLines(lines);
const now=Date.now();
const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
const baseline=!current.activity;
const activity=mergeActivity(current.activity||null,day,totals,now,current.sync.totalSeconds||0);
const next={...current,activity,sync:iphoneSnapshot(activity)};
await mkdir(new URL('.',file),{recursive:true});
await writeFile(file,JSON.stringify(encrypt(next))+'\n');
console.log(`iPhone report accepted; baseline=${baseline}; addedSeconds=${activity.totalSeconds-(current.sync.totalSeconds||0)}`);
