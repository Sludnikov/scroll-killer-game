const CACHE='scroll-killer-pages-v4';
const ASSETS=['./','./index.html','./styles.css','./app.js','./game.js','./accessories.js','./shortcut-log.js','./manifest.webmanifest','./assets/logo-no-scroll.png','./assets/hero-lowpoly.png','./assets/common-room.png','./assets/great-hall.png','./assets/library.png','./assets/corridor.png','./assets/potions.png','./assets/yard.png','./assets/greenhouse.png','./assets/tower.png','./assets/quidditch.png','./assets/hut.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('scroll-killer-pages-')&&key!==CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  await Promise.all(windows.filter(client=>client.visibilityState==='visible'&&typeof client.navigate==='function').map(client=>client.navigate(client.url).catch(()=>{})));
})()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).pathname.startsWith('/api/'))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok&&new URL(e.request.url).origin===location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request)));});
