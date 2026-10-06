import {createCipheriv,createHash,randomBytes} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';

const bridge='https://scroll-killer-sync-bridge.radiance5100.chatgpt.site';
const token=process.env.OWNER_GAME_KEY;
const output=process.env.SITE_OUTPUT||'site';
if(!/^[a-f0-9]{64}$/i.test(token||''))throw Error('OWNER_GAME_KEY is missing');

async function get(path){
  const response=await fetch(bridge+path,{headers:{authorization:'Bearer '+token,'user-agent':'Mozilla/5.0'},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error(`Bridge ${path} returned ${response.status}`);
  return response.json();
}

function idFor(key){return createHash('sha256').update(key).digest('hex')}
function encrypt(key,data){
  const iv=randomBytes(12);
  const cipher=createCipheriv('aes-256-gcm',createHash('sha256').update(key).digest(),iv);
  const ciphertext=Buffer.concat([cipher.update(JSON.stringify(data),'utf8'),cipher.final(),cipher.getAuthTag()]);
  return {version:1,iv:iv.toString('base64'),data:ciphertext.toString('base64')};
}

const [ownerGame,ownerSync,friendExport]=await Promise.all([
  get('/api/game-state'),get('/api/sync'),get('/api/export-reports')
]);
if(!ownerGame?.state||!Array.isArray(friendExport.players))throw Error('Incomplete export');
await mkdir(`${output}/feeds`,{recursive:true});
await writeFile(`${output}/feeds/${idFor(token)}.json`,JSON.stringify(encrypt(token,{game:ownerGame,sync:ownerSync})));
for(const player of friendExport.players){
  if(!/^[a-f0-9]{64}$/i.test(player.token)||idFor(player.token)!==player.id)throw Error('Invalid player export');
  await writeFile(`${output}/feeds/${player.id}.json`,JSON.stringify(encrypt(player.token,{game:player.game,sync:player.sync||{source:'local'}})));
}
await writeFile(`${output}/feeds/status.json`,JSON.stringify({updatedAt:new Date().toISOString(),players:friendExport.players.length}));
console.log(`Built encrypted feeds for ${friendExport.players.length+1} players`);
