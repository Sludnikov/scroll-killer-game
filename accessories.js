// Faceted accessories share the hero's warm, low-poly palette. Coordinates
// are relative to the centre of the hero in the 390px scene canvas.
const ink='#2d2029';

function poly(ctx,points,color,edge=ink,width=1){
  ctx.beginPath();ctx.moveTo(...points[0]);
  for(const point of points.slice(1))ctx.lineTo(...point);
  ctx.closePath();ctx.fillStyle=color;ctx.fill();
  if(edge){ctx.lineWidth=width;ctx.strokeStyle=edge;ctx.stroke()}
}
function stroke(ctx,points,color,width=2){
  ctx.beginPath();ctx.moveTo(...points[0]);
  for(const point of points.slice(1))ctx.lineTo(...point);
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
}
function gem(ctx,x,y,r,base='#d6aa62'){
  poly(ctx,[[x,y-r],[x+r,y],[x,y+r],[x-r,y]],base,'#644534',1);
  poly(ctx,[[x,y-r],[x+r,y],[x,y]],'#f6d993',null);
  poly(ctx,[[x-r,y],[x,y],[x,y+r]],'#936b56',null);
}
function scarf(ctx){
  // Two woven ends pass under a folded collar instead of forming a flat L.
  poly(ctx,[[-27,117],[-13,126],[-22,145],[-35,175],[-47,170],[-34,138]],'#6e2732','#3d2029',1.5);
  poly(ctx,[[-27,117],[-13,126],[-27,149],[-36,147]],'#b44b4b',null);
  poly(ctx,[[-35,147],[-27,149],[-35,171],[-47,170]],'#8e333e',null);
  poly(ctx,[[-33,143],[-28,148],[-37,155]],'#c16a5c',null);
  poly(ctx,[[-38,153],[-32,158],[-42,167]],'#632634',null);
  poly(ctx,[[-43,162],[-31,165],[-34,171],[-47,170]],'#d1a75e',null);
  stroke(ctx,[[-43,170],[-46,178]],'#b88d5b',1.5);stroke(ctx,[[-38,172],[-40,180]],'#b88d5b',1.5);stroke(ctx,[[-34,172],[-34,179]],'#b88d5b',1.5);
  poly(ctx,[[8,123],[20,113],[27,139],[34,171],[22,178],[14,148]],'#8e3039','#3d2029',1.5);
  poly(ctx,[[20,113],[27,139],[20,146],[11,127]],'#b95b50',null);
  poly(ctx,[[20,146],[27,139],[34,171],[23,173]],'#722934',null);
  poly(ctx,[[21,142],[27,139],[27,153]],'#d0765f',null);
  poly(ctx,[[27,153],[33,165],[23,169]],'#a84041',null);
  poly(ctx,[[22,169],[33,166],[34,171],[22,178]],'#d0a65e',null);
  stroke(ctx,[[24,178],[24,184]],'#c9a36a',1.5);stroke(ctx,[[29,176],[30,183]],'#c9a36a',1.5);stroke(ctx,[[34,173],[37,180]],'#c9a36a',1.5);
  poly(ctx,[[-34,110],[-23,104],[-10,111],[2,116],[16,107],[28,111],[34,119],[19,129],[3,134],[-17,128],[-33,119]],'#7c2935','#3b2028',1.5);
  poly(ctx,[[-32,110],[-22,105],[-10,112],[-18,124],[-33,118]],'#b24a48',null);
  poly(ctx,[[-10,112],[3,116],[18,108],[27,112],[13,124],[-1,127]],'#a34143',null);
  poly(ctx,[[-19,108],[-11,112],[-17,120],[-26,114]],'#d06d5b',null);
  poly(ctx,[[-8,114],[3,116],[-1,127],[-13,123]],'#7b2b38',null);
  poly(ctx,[[6,115],[17,109],[13,124],[3,128]],'#c16654',null);
  poly(ctx,[[-17,128],[3,134],[19,129],[13,124],[-1,127]],'#592831',null);
  poly(ctx,[[27,112],[34,119],[19,129],[14,124]],'#bd6555',null);
  stroke(ctx,[[-31,119],[-20,125],[-17,128]],'#cc9b59',2);
  stroke(ctx,[[16,128],[22,125],[30,119]],'#c39859',2);
  poly(ctx,[[10,127],[17,122],[21,128],[14,135]],'#c09258','#543329',1);
}
function hat(ctx){
  ctx.save();ctx.translate(0,-21);
  poly(ctx,[[-43,68],[-21,61],[-9,15],[8,43],[28,66],[8,72]],'#34313b','#171a25',1.5);
  poly(ctx,[[-21,61],[-9,15],[2,46],[-2,66]],'#59505a',null);
  poly(ctx,[[-9,15],[8,43],[28,66],[3,60]],'#282b36',null);
  poly(ctx,[[-48,68],[-25,62],[11,64],[39,70],[26,77],[-13,75]],'#282832','#171920',1.5);
  poly(ctx,[[-40,67],[-14,64],[14,66],[31,70],[-5,70]],'#624145',null);
  poly(ctx,[[-4,65],[8,65],[6,71],[-6,71]],'#c99e5d',null);
  gem(ctx,1,68,3);
  ctx.restore();
}
function glasses(ctx){
  // The face is slightly turned: its eyes are not on the same horizontal line.
  for(const [x,y] of [[-9,66],[12,64]]){
    ctx.beginPath();ctx.ellipse(x,y,9,7,-.08,0,Math.PI*2);
    ctx.strokeStyle='#45372f';ctx.lineWidth=2.8;ctx.stroke();
    ctx.beginPath();ctx.ellipse(x,y,8.2,6.2,-.08,0,Math.PI*2);
    ctx.strokeStyle='#c5a06c';ctx.lineWidth=1.1;ctx.stroke();
    stroke(ctx,[[x-6,y-4],[x-3,y-5]],'#f1d69a',.8);
  }
  stroke(ctx,[[-1,65],[2,64],[3,65]],'#c5a06c',1.8);
  stroke(ctx,[[-18,64],[-25,62]],'#45372f',1.8);
  stroke(ctx,[[21,63],[27,64]],'#45372f',1.8);
}
function cloak(ctx){
  poly(ctx,[[-63,126],[-73,139],[-83,173],[-78,188],[-64,154],[-52,139]],'#47323b','#2c202b',1.2);
  poly(ctx,[[-73,139],[-83,173],[-78,188],[-64,154]],'#7e5056',null);
  poly(ctx,[[63,126],[74,140],[84,175],[78,188],[64,154],[52,139]],'#45313d','#2c202b',1.2);
  poly(ctx,[[74,140],[84,175],[78,188],[64,154]],'#73505a',null);
  poly(ctx,[[-55,132],[-39,138],[-43,173],[-58,206],[-67,192],[-57,155]],'#67414b','#342833',1.2);
  poly(ctx,[[-55,132],[-39,138],[-47,160],[-61,154]],'#a16a63',null);
  poly(ctx,[[55,132],[39,138],[43,173],[58,206],[67,192],[57,155]],'#63404b','#342833',1.2);
  poly(ctx,[[55,132],[39,138],[47,160],[61,154]],'#9b6b63',null);
  stroke(ctx,[[-58,203],[-66,192]],'#c49472',1.5);
  stroke(ctx,[[58,203],[66,192]],'#c49472',1.5);
}
function cape(ctx){
  poly(ctx,[[-62,127],[-76,143],[-81,170],[-66,156],[-48,142]],'#263249','#1b2237',1.2);
  poly(ctx,[[-76,143],[-81,170],[-66,156]],'#59637a',null);
  poly(ctx,[[62,127],[76,143],[81,170],[66,156],[48,142]],'#263249','#1b2237',1.2);
  poly(ctx,[[76,143],[81,170],[66,156]],'#59637a',null);
  poly(ctx,[[-57,131],[-40,139],[-46,179],[-60,211],[-68,190],[-58,156]],'#35435e','#202a3c',1.2);
  poly(ctx,[[-57,131],[-40,139],[-49,165],[-64,156]],'#68758d',null);
  poly(ctx,[[57,131],[40,139],[46,179],[60,211],[68,190],[58,156]],'#35435e','#202a3c',1.2);
  poly(ctx,[[57,131],[40,139],[49,165],[64,156]],'#68758d',null);
  stroke(ctx,[[-60,210],[-68,190]],'#b49a75',1.5);
  stroke(ctx,[[60,210],[68,190]],'#b49a75',1.5);
}
function mitten(ctx,x,y,color){
  poly(ctx,[[x-8,y-6],[x+2,y-9],[x+9,y-2],[x+8,y+9],[x-4,y+11],[x-11,y+4]],color,'#34242d',1.5);
  poly(ctx,[[x-8,y-6],[x+2,y-9],[x+3,y+1],[x-9,y+4]],'#b5746c',null);
  poly(ctx,[[x-10,y-1],[x-16,y+3],[x-11,y+9],[x-5,y+6]],color,'#34242d',1);
  poly(ctx,[[x-5,y+9],[x+9,y+7],[x+9,y+12],[x-5,y+14]],'#c6985a',null);
}
function glove(ctx,x,y){
  poly(ctx,[[x-8,y-7],[x+4,y-9],[x+10,y-3],[x+8,y+12],[x-5,y+13],[x-11,y+5]],'#30384c','#202532',1.5);
  poly(ctx,[[x-8,y-7],[x+4,y-9],[x+4,y+6],[x-10,y+5]],'#586078',null);
  stroke(ctx,[[x-4,y-2],[x-3,y+8]],'#8690a0',1);
  stroke(ctx,[[x+1,y-3],[x+2,y+8]],'#8690a0',1);
  poly(ctx,[[x-5,y+11],[x+9,y+9],[x+9,y+14],[x-5,y+16]],'#73515a',null);
}

export function drawAccessories(ctx,equipped){
  const eq=id=>equipped.has(id);
  ctx.save();ctx.lineJoin='round';
  if(eq('cloak'))cloak(ctx);
  if(eq('cape'))cape(ctx);
  if(eq('aura')){
    ctx.save();ctx.globalAlpha=.72;ctx.strokeStyle='#e8c379';ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(0,186,112,174,0,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle='#866aae';ctx.lineWidth=1.3;
    ctx.beginPath();ctx.ellipse(0,186,117,181,0,0,Math.PI*2);ctx.stroke();
    for(const [x,y] of [[0,4],[-107,91],[108,102],[-116,216],[112,257],[-64,351],[61,350]])gem(ctx,x,y,4,'#ead29a');
    ctx.restore();
  }
  if(eq('boots'))for(const x of [-26,53]){
    poly(ctx,[[x-12,347],[x+9,346],[x+12,354],[x-12,356]],'#493b37','#302b2d',1.2);
    poly(ctx,[[x-12,348],[x+3,346],[x-2,353],[x-12,355]],'#715849',null);
    stroke(ctx,[[x-6,352],[x+7,351]],'#a58763',1.3);
    gem(ctx,x+3,351,2,'#d3ac70');
  }
  if(eq('satchel')){
    stroke(ctx,[[27,125],[54,165],[85,220]],'#4d332e',5);
    stroke(ctx,[[28,125],[55,166],[85,220]],'#ae805b',2);
    poly(ctx,[[72,215],[102,218],[107,251],[74,253]],'#624334','#33262a',1.5);
    poly(ctx,[[73,217],[101,218],[98,233],[77,236]],'#9c714a',null);
    poly(ctx,[[77,235],[98,233],[105,249],[74,252]],'#77523b',null);
    gem(ctx,89,237,3);
  }
  if(eq('mittens')){mitten(ctx,-72,122,'#873f43');mitten(ctx,83,224,'#873f43')}
  if(eq('gloves')){glove(ctx,-72,122);glove(ctx,83,224)}
  if(eq('book')){
    poly(ctx,[[70,226],[103,225],[108,265],[72,264]],'#503c43','#29252b',1.5);
    poly(ctx,[[73,229],[101,228],[104,258],[74,260]],'#926c53',null);
    poly(ctx,[[76,231],[98,230],[100,254],[77,256]],'#63434a',null);
    stroke(ctx,[[82,231],[82,255]],'#cfab6f',2);
    gem(ctx,89,243,4);
  }
  if(eq('lantern')){
    stroke(ctx,[[82,194],[85,202]],'#c8a170',2);
    poly(ctx,[[78,201],[91,201],[97,210],[94,236],[76,236],[73,210]],'#614a3b','#322b2a',1.5);
    poly(ctx,[[79,207],[90,207],[93,227],[77,227]],'#e0a957',null);
    poly(ctx,[[84,207],[91,207],[88,226],[80,226]],'#f8d88b',null);
    poly(ctx,[[76,231],[94,231],[96,238],[74,238]],'#a47e53',null);
    stroke(ctx,[[77,207],[91,207]],'#c79b63',2);
  }
  if(eq('owl')){
    poly(ctx,[[76,111],[89,98],[103,109],[111,126],[101,148],[85,151],[73,133]],'#775e4e','#3d3332',1.5);
    poly(ctx,[[76,111],[89,98],[90,133],[73,133]],'#a1886a',null);
    poly(ctx,[[90,132],[103,109],[111,126],[101,148],[85,151]],'#5b4f4b',null);
    poly(ctx,[[79,119],[85,115],[90,121],[85,126]],'#dfbf80',null);
    poly(ctx,[[94,120],[100,116],[105,123],[98,128]],'#dfbf80',null);
    gem(ctx,85,121,2,'#30252b');gem(ctx,99,123,2,'#30252b');
    poly(ctx,[[89,130],[98,130],[93,137]],'#c39354',null);
  }
  if(eq('phoenix')){
    poly(ctx,[[-121,131],[-107,106],[-94,125],[-81,116],[-84,142],[-100,150]],'#9f4038','#4d2930',1.5);
    poly(ctx,[[-121,131],[-107,106],[-101,135]],'#e4864a',null);
    poly(ctx,[[-101,135],[-81,116],[-84,142],[-100,150]],'#c6573b',null);
    poly(ctx,[[-98,147],[-86,159],[-96,155],[-105,163]],'#e7a04e',null);
    gem(ctx,-105,125,2,'#f5d785');
  }
  if(eq('wand')){
    poly(ctx,[[-75,132],[-70,132],[-101,47],[-106,35],[-100,53],[-69,129]],'#78513d','#35272b',1);
    poly(ctx,[[-73,129],[-70,130],[-101,52],[-103,45]],'#bd8f5e',null);
    gem(ctx,-105,35,4,'#ddbd82');
  }
  if(eq('staff')){
    poly(ctx,[[75,329],[80,329],[88,117],[83,118]],'#674638','#30282d',1.3);
    poly(ctx,[[79,321],[82,322],[87,120],[84,118]],'#b58b61',null);
    poly(ctx,[[78,116],[84,98],[94,116],[87,126]],'#b48b62','#4e3a34',1.4);
    gem(ctx,86,112,8,'#e6c581');
  }
  if(eq('hat'))hat(ctx);
  if(eq('crown')){
    ctx.save();ctx.translate(0,-27);
    poly(ctx,[[-35,65],[-30,47],[-15,57],[-4,39],[8,56],[25,46],[33,65],[27,72],[-27,72]],'#99754b','#4c3b33',1.4);
    poly(ctx,[[-30,47],[-15,57],[-25,66]],'#f3d48b',null);
    poly(ctx,[[-4,39],[8,56],[-7,62]],'#d9ac63',null);
    poly(ctx,[[25,46],[33,65],[15,64]],'#ebc57b',null);
    gem(ctx,-4,62,4,'#9d6f91');
    ctx.restore();
  }
  if(eq('glasses'))glasses(ctx);
  if(eq('scarf'))scarf(ctx);
  if(eq('ribbon')){
    poly(ctx,[[-14,113],[-4,119],[4,141],[11,164],[4,174],[-5,146]],'#b18350','#50342d',1.2);
    poly(ctx,[[-14,113],[-4,119],[-5,146]],'#e1b871',null);
    poly(ctx,[[-5,146],[4,141],[11,164],[4,174]],'#805548',null);
    gem(ctx,3,137,3);
  }
  if(eq('pin'))gem(ctx,37,141,6,'#d8b36b');
  if(eq('brooch')){gem(ctx,-36,136,8,'#b7a4ca');gem(ctx,-36,136,3,'#ead4df')}
  ctx.restore();
}

const bounds={
  scarf:[-48,101,38,185],glasses:[-26,55,28,75],pin:[29,131,45,151],
  mittens:[-91,109,-55,138],ribbon:[-16,110,14,178],hat:[-49,-10,41,60],
  cloak:[-84,121,-35,213],book:[68,223,110,268],lantern:[70,191,100,241],
  boots:[-40,344,66,359],owl:[70,95,115,154],wand:[-110,29,-67,135],
  satchel:[68,211,110,256],brooch:[-47,125,-25,147],gloves:[-91,109,-55,138],
  crown:[-40,8,38,49],cape:[-83,120,-35,215],phoenix:[-126,102,-79,166],
  staff:[72,94,98,332],aura:[-125,2,125,370],
};
const iconCache=new Map();
export function itemIconData(id){
  if(iconCache.has(id))return iconCache.get(id);
  const box=bounds[id];if(!box)return '';
  const canvas=document.createElement('canvas');canvas.width=112;canvas.height=112;
  const ctx=canvas.getContext('2d');
  const [x1,y1,x2,y2]=box,scale=Math.min(84/(x2-x1),84/(y2-y1));
  ctx.translate(56,56);ctx.scale(scale,scale);ctx.translate(-(x1+x2)/2,-(y1+y2)/2);
  drawAccessories(ctx,new Set([id]));
  const data=canvas.toDataURL('image/png');iconCache.set(id,data);return data;
}
