
(function(){
'use strict';
var E=function(i){return document.getElementById(i);};
var esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var C=function(v,a,b){return v<a?a:(v>b?b:v);};
var F=function(v,n){n=(n===undefined)?2:n;if(!isFinite(v))return'—';if(Math.abs(v)>=1e6||(Math.abs(v)<1e-3&&v!==0))return v.toExponential(2);return Number(v).toFixed(n);};
var SE=function(m){var b=E('eb3');if(!b)return;b.textContent='⚠ '+m;b.style.display='block';clearTimeout(SE.t);SE.t=setTimeout(function(){b.style.display='none';},6000);};
function dSpr(c,x1,y1,x2,y2,co,am){var dx=x2-x1,dy=y2-y1,L=Math.sqrt(dx*dx+dy*dy);if(L<12)return;var ux=dx/L,uy=dy/L,nx=-uy,ny=ux;var ld=Math.min(18,L*0.13),n=co*2,sp=L-2*ld;c.beginPath();c.moveTo(x1,y1);c.lineTo(x1+ux*ld,y1+uy*ld);for(var i=1;i<n;i++){var t=ld+sp*i/n,s=(i%2?1:-1)*am;c.lineTo(x1+ux*t+nx*s,y1+uy*t+ny*s);}c.lineTo(x2-ux*ld,y2-uy*ld);c.lineTo(x2,y2);c.stroke();}
function lb(c,t,x,y,col,sz,al){sz=sz||11;al=al||'left';c.save();c.font=sz+'px Menlo,Consolas,monospace';c.fillStyle=col;c.textAlign=al;c.textBaseline='middle';c.fillText(t,x,y);c.restore();}
function pl(c,t,x,y,bg,fg){c.save();c.font='11px Menlo,Consolas,monospace';var w=c.measureText(t).width+20;c.fillStyle=bg;var r=9;c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+23-r);c.quadraticCurveTo(x+w,y+23,x+w-r,y+23);c.lineTo(x+r,y+23);c.quadraticCurveTo(x,y+23,x,y+23-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();c.fill();c.fillStyle=fg;c.textAlign='left';c.textBaseline='middle';c.fillText(t,x+10,y+11.5);c.restore();}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}
function ptR(s,x0,y0,x1,y1){var w=x1-x0,h=y1-y0,P=2*(w+h);var d=(((s%1)+1)%1)*P;if(d<w)return[x0+d,y0];d-=w;if(d<h)return[x1,y0+d];d-=h;if(d<w)return[x1-d,y1];d-=w;return[x0,y1-d];}

var EXP=window.EXP||(window.EXP=[]);

/* ============ 引擎渲染器 ============ */
function drawCurve(c,W,H,p,st,g){
  var padL=64,padR=24,padT=32,padB=44;
  var gw=W-padL-padR,gh=H-padT-padB;
  var xR=g.xR,yR=g.yR;
  var x2p=function(x){return padL+(x-xR[0])/(xR[1]-xR[0])*gw;};
  var y2p=function(y){return padT+gh-(y-yR[0])/(yR[1]-yR[0])*gh;};
  var xt=g.xT||8,yt=g.yT||6;
  c.strokeStyle='rgba(120,160,220,.07)';c.lineWidth=1;
  for(var i=0;i<=xt;i++){var xx=xR[0]+(xR[1]-xR[0])*i/xt;var px=x2p(xx);c.beginPath();c.moveTo(px,padT);c.lineTo(px,padT+gh);c.stroke();lb(c,F(xx,1),px,padT+gh+14,'#5a6d87',10,'center');}
  for(var j=0;j<=yt;j++){var yy=yR[0]+(yR[1]-yR[0])*j/yt;var py=y2p(yy);c.beginPath();c.moveTo(padL,py);c.lineTo(padL+gw,py);c.stroke();lb(c,F(yy,1),padL-6,py,'#5a6d87',10,'right');}
  c.strokeStyle='rgba(34,211,238,.5)';c.lineWidth=2;
  c.beginPath();c.moveTo(padL,padT);c.lineTo(padL,padT+gh);c.lineTo(padL+gw,padT+gh);c.stroke();
  var col=g.col||'#a78bfa';
  c.beginPath();
  var N=300,hasPrev=false;
  for(var k=0;k<=N;k++){
    var xv=xR[0]+(xR[1]-xR[0])*k/N;
    var yv=g.fn(p,xv,st.t||0);
    if(!Number.isFinite(yv)){hasPrev=false;continue;}
    var pxx=x2p(xv),pyy=y2p(yv);
    if(hasPrev)c.lineTo(pxx,pyy);else c.moveTo(pxx,pyy);
    hasPrev=true;
  }
  c.strokeStyle=col+'40';c.lineWidth=8;c.stroke();
  c.strokeStyle=col;c.lineWidth=2.4;c.stroke();
  if(g.mk){for(var m=0;m<g.mk.length;m++){
    var mk=g.mk[m],myValue=g.fn(p,mk.x,st.t||0);
    if(!Number.isFinite(myValue))continue;
    var mx=x2p(mk.x),my=y2p(myValue);c.fillStyle=mk.c||'#fbbf24';
    c.beginPath();c.arc(mx,my,5,0,7);c.fill();lb(c,mk.l||'',mx+8,my-14,mk.c||'#fbbf24',11);
  }}
  lb(c,g.xL||'x',padL+gw/2,padT+gh+30,'#22d3ee',11.5,'center');
  lb(c,g.yL||'y',padL-40,padT+10,'#22d3ee',11.5,'center');
}
function mkCurve(g){
  return {id:g.id,name:g.name,cat:g.cat,tags:g.tags,brief:g.brief,params:g.p,formulas:g.f,
    resetOnChange:!!g.rc,init:function(){return{t:0};},step:function(p,dt,st){st.t=(st.t||0)+dt;},
    draw:function(c,W,H,p,st){drawCurve(c,W,H,p,st,g);},readout:g.ro,tutor:g.tt};
}
function mkMotion(g){
  return {id:g.id,name:g.name,cat:g.cat,tags:g.tags,brief:g.brief,params:g.p,formulas:g.f,resetOnChange:!!g.rc,
    init:function(){return{t:0};},step:function(p,dt,st){st.t=(st.t||0)+dt;},
    draw:function(c,W,H,p,st){
      var t=st.t||0,T=g.dur(p),tc=t%T;
      c.strokeStyle='rgba(120,160,220,.06)';c.lineWidth=1;
      for(var x=40;x<W-20;x+=44){c.beginPath();c.moveTo(x,24);c.lineTo(x,H-40);c.stroke();}
      for(var y=H-40;y>24;y-=44){c.beginPath();c.moveTo(40,y);c.lineTo(W-20,y);c.stroke();}
      if(g.gr!==false){c.strokeStyle='#1f6f66';c.lineWidth=3;c.beginPath();c.moveTo(30,H-40);c.lineTo(W-16,H-40);c.stroke();}
      if(g.tr!==false){c.beginPath();for(var i=0;i<=120;i++){var ti=tc*i/120;var pn=g.pos(p,ti,W,H);i?c.lineTo(pn.x,pn.y):c.moveTo(pn.x,pn.y);}
        c.strokeStyle=(g.col||'#a78bfa')+'60';c.lineWidth=2;c.stroke();}
      var pt=g.pos(p,tc,W,H);
      var gr=c.createRadialGradient(pt.x-3,pt.y-3,1,pt.x,pt.y,20);
      gr.addColorStop(0,'#fff');gr.addColorStop(.45,g.col||'#fbbf24');gr.addColorStop(1,(g.col||'#fbbf24')+'00');
      c.fillStyle=gr;c.beginPath();c.arc(pt.x,pt.y,20,0,7);c.fill();
      c.fillStyle='#fff';c.beginPath();c.arc(pt.x,pt.y,6,0,7);c.fill();
      if(g.ex)g.ex(c,W,H,p,st,pt);
      if(g.bd)for(var b=0;b<g.bd.length;b++){var bd=g.bd[b];pl(c,bd.t(p,st),26,22+b*30,bd.bg,bd.fg);}
    },
    readout:g.ro,tutor:g.tt};
}
function mkPart(g){
  return {id:g.id,name:g.name,cat:g.cat,tags:g.tags,brief:g.brief,params:g.p,formulas:g.f,resetOnChange:!!g.rc,
    init:function(){return{t:0,dt:0.016,ps:null};},
    step:function(p,dt,st){st.t=(st.t||0)+dt;st.dt=Math.min(dt,0.05);},
    draw:function(c,W,H,p,st){
      var n=g.n||60;
      var bx=W*0.14,by=52,bw=W*0.72,bh=H-110;
      c.fillStyle='rgba(12,22,40,.85)';rr(c,bx,by,bw,bh,10);c.fill();
      c.strokeStyle=g.bc||'rgba(34,211,238,.55)';c.lineWidth=2.5;rr(c,bx,by,bw,bh,10);c.stroke();
      if(!st.ps){st.ps=[];for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2;st.ps.push({x:Math.random(),y:Math.random(),vx:Math.cos(a),vy:Math.sin(a),r:(g.rMin||2)+(g.rMax||4)-(g.rMin||2)*Math.random()});}}
      var spd=g.speed?g.speed(p):0.3;var hue=g.hue?g.hue(p):200;
      for(var k=0;k<st.ps.length;k++){var pt=st.ps[k];pt.x+=pt.vx*spd*st.dt;pt.y+=pt.vy*spd*st.dt;
        if(pt.x<0.03){pt.x=0.03;pt.vx*=-1;}if(pt.x>0.97){pt.x=0.97;pt.vx*=-1;}
        if(pt.y<0.03){pt.y=0.03;pt.vy*=-1;}if(pt.y>0.97){pt.y=0.97;pt.vy*=-1;}
        var x=bx+pt.x*bw,y=by+pt.y*bh;var gr=c.createRadialGradient(x,y,0,x,y,pt.r*3.5);
        gr.addColorStop(0,'hsla('+hue+',90%,72%,1)');gr.addColorStop(1,'hsla('+hue+',90%,60%,0)');
        c.fillStyle=gr;c.beginPath();c.arc(x,y,pt.r*3.5,0,7);c.fill();
        c.fillStyle='hsl('+hue+',95%,84%)';c.beginPath();c.arc(x,y,pt.r,0,7);c.fill();}
      if(g.bd)for(var b=0;b<g.bd.length;b++){var bd=g.bd[b];pl(c,bd.t(p,st),20,20+b*30,bd.bg,bd.fg);}
    },
    readout:g.ro,tutor:g.tt};
}

/* ============ 辅助：参数 ============ */
function P(k,l,mn,mx,s,v,u){return{key:k,label:l,min:mn,max:mx,step:s,value:v,unit:u||''};}

/* ============================================================
   引擎
   ============================================================ */
var cv,ctx,sw;
var W=800,H=500;
var cur=null,P={},ST={};
var paused=false;
var SAVE_KEY='physchem_lab_saved_experiments_v1';
var saves=[];
var storageRecoveryRequired=false;
try{
  var rawSaved=localStorage.getItem(SAVE_KEY);
  var restored=JSON.parse(rawSaved||'[]');
  if(!Array.isArray(restored))throw new TypeError('实验存档格式不是数组');
  saves=restored.slice(0,30);
}catch(e){storageRecoveryRequired=true;console.warn('实验存档读取失败，已暂停覆盖写入；请先恢复或导出原始存档',e);}
function persistExperimentSaves(nextSaves){
  if(storageRecoveryRequired)return false;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(nextSaves));saves=nextSaves;return true;}
  catch(e){storageRecoveryRequired=true;console.warn('实验存档写入失败，已启用恢复保护',e);return false;}
}
var typer=null;
var started=false;
var last=0,lastRO=0;
var fCat='全部',sQ='';

function resize(){
  if(!sw||!cv||!ctx)return false;
  var r=sw.getBoundingClientRect();
  if(r.width<20||r.height<20)return false;
  var dpr=Math.min(window.devicePixelRatio||1,2);
  W=Math.floor(r.width);H=Math.floor(r.height);
  cv.width=Math.floor(W*dpr);cv.height=Math.floor(H*dpr);
  cv.style.width=W+'px';cv.style.height=H+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return true;
}

function renderList(){
  var box=E('lst');if(!box)return;box.innerHTML='';
  var list=[];
  for(var i=0;i<EXP.length;i++){
    var e=EXP[i];var ok=true;
    if(fCat!=='全部'&&e.cat!==fCat)ok=false;
    if(ok&&sQ){var s=(e.name+e.brief+e.tags.join('')+e.formulas.join('')).toLowerCase();if(s.indexOf(sQ.toLowerCase())===-1)ok=false;}
    if(ok)list.push(e);
  }
  E('cnt').textContent=String(list.length);
  if(!list.length){box.innerHTML='<div style="color:#5a6d87;font-size:12px;padding:16px;text-align:center">未找到匹配的实验</div>';return;}
  for(var j=0;j<list.length;j++){
    var ex=list[j];var d=document.createElement('div');
    d.className='it'+(cur&&cur.id===ex.id?' on':'');
    d.innerHTML='<div class="t"><span class="tg '+(ex.cat==='物理'?'p':'c')+'">'+esc(ex.cat)+'</span>'+esc(ex.name)+'</div><div class="d">'+esc(ex.brief)+'</div>';
    (function(id){d.onclick=function(){selectExp(id);};})(ex.id);
    box.appendChild(d);
  }
}

function selectExp(id){
  var f=null;
  for(var i=0;i<EXP.length;i++)if(EXP[i].id===id){f=EXP[i];break;}
  if(!f){SE('未找到实验: '+id);return;}
  cur=f;P={};
  for(var j=0;j<cur.params.length;j++)P[cur.params[j].key]=cur.params[j].value;
  ST=cur.init?cur.init(P):{};
  paused=false;
  var bp=E('bp');if(bp){bp.textContent='⏸ 暂停';bp.className='bt';}
  E('et').textContent=cur.name;E('eb2').textContent=cur.brief;
  buildParams();buildPanel();renderList();refreshTutor(true);
  setTimeout(resize,30);setTimeout(resize,200);
}

function buildParams(){
  var box=E('pb');if(!box)return;box.innerHTML='';
  for(var i=0;i<cur.params.length;i++){
    var pr=cur.params[i];var w=document.createElement('div');w.className='pm';
    var vt=pr.fmt?pr.fmt(P[pr.key]):(P[pr.key]+' '+(pr.unit||''));
    w.innerHTML='<div class="r"><span>'+esc(pr.label)+'</span><span class="v" id="v_'+esc(pr.key)+'">'+esc(vt)+'</span></div><input type="range" min="'+pr.min+'" max="'+pr.max+'" step="'+pr.step+'" value="'+P[pr.key]+'">';
    box.appendChild(w);
    var inp=w.querySelector('input');
    (function(p2,el2){el2.oninput=function(ev){P[p2.key]=parseFloat(ev.target.value);
      var vv=E('v_'+p2.key);if(vv)vv.textContent=p2.fmt?p2.fmt(P[p2.key]):(P[p2.key]+' '+(p2.unit||''));
      onPC();};})(pr,inp);
  }
}

var pTimer=null;
function onPC(){
  if(cur.resetOnChange)ST=cur.init?cur.init(P):{};
  updateRO();
  clearTimeout(pTimer);pTimer=setTimeout(function(){refreshTutor(false);},260);
}

function buildPanel(){
  var fb=E('fb');if(!fb)return;var h='';
  var fs=cur.formulas||[];
  for(var i=0;i<fs.length;i++)h+='<div class="fi">'+fs[i]+'</div>';
  var ro=cur.readout?cur.readout(P,ST):[];
  if(ro.length){h+='<div class="ro">';
    for(var j=0;j<ro.length;j++)h+='<div class="r"><div class="k">'+ro[j].k+'</div><div class="v" id="ro_'+j+'">'+ro[j].v+'</div></div>';
    h+='</div>';}
  fb.innerHTML=h;
}
function updateRO(){
  if(!cur||!cur.readout)return;
  var ro=cur.readout(P,ST);
  for(var i=0;i<ro.length;i++){var el=E('ro_'+i);if(el)el.textContent=ro[i].v;}
}

function typeTxt(el2,txt){
  clearInterval(typer);el2.textContent='';var i=0;var st=Math.max(2,Math.ceil(txt.length/240));
  typer=setInterval(function(){i+=st;if(i>=txt.length){el2.textContent=txt;clearInterval(typer);}else el2.textContent=txt.slice(0,i);},14);
}
function refreshTutor(imm){
  if(!cur)return;var el2=E('tb2');if(!el2)return;
  var txt;try{txt=cur.tutor?cur.tutor(P,ST):'暂无解析。';}catch(e){txt='解析生成中……';}
  if(imm){clearInterval(typer);el2.textContent=txt;}else typeTxt(el2,txt);
}

function loop(ts){
  if(!started)return;
  requestAnimationFrame(loop);
  if(!last)last=ts;var dt=(ts-last)/1000;last=ts;dt=C(dt,0,0.05);
  if(!cur||!ctx)return;
  if(!paused&&cur.step){try{cur.step(P,dt,ST);}catch(e){}}
  ctx.clearRect(0,0,W,H);
  try{cur.draw(ctx,W,H,P,ST);}catch(e){}
  ctx.save();ctx.font='11px Menlo,Consolas,monospace';ctx.fillStyle='rgba(125,143,171,.55)';ctx.textAlign='right';ctx.textBaseline='bottom';
  ctx.fillText('PhysChem Lab · Ternence Dai',W-16,H-12);ctx.restore();
  if(ts-lastRO>110){lastRO=ts;updateRO();}
}

function boot(){
  cv=E('cv');sw=E('sw');
  if(cv&&!ctx){try{ctx=cv.getContext('2d');}catch(e){ctx=null;}}
  if(!cv||!sw||!ctx){requestAnimationFrame(boot);return;}
  if(!resize()){requestAnimationFrame(boot);return;}
  try{renderList();updateSI();renderD();selectExp('p1');}catch(e){SE('初始化失败: '+e.message);console.error(e);return;}
  setTimeout(resize,50);setTimeout(resize,250);setTimeout(resize,600);setTimeout(resize,1200);
  started=true;requestAnimationFrame(loop);
}

function bindUI(){
  var bp=E('bp');if(bp)bp.onclick=function(){paused=!paused;this.textContent=paused?'▶ 继续':'⏸ 暂停';this.className=paused?'bt on':'bt';};
  var br=E('br2');if(br)br.onclick=function(){ST=cur&&cur.init?cur.init(P):{};paused=false;
    var b=E('bp');if(b){b.textContent='⏸ 暂停';b.className='bt';}refreshTutor(true);toast('实验已重置 ↺');};
  var bs=E('bs');if(bs)bs.onclick=function(){if(!cur)return;
    if(storageRecoveryRequired){toast('存档恢复保护已启用：为避免覆盖旧数据，本次保存已暂停');return;}
    var nextSaves=[{name:cur.name,time:new Date().toLocaleString('zh-CN',{hour12:false}),params:JSON.parse(JSON.stringify(P))}].concat(saves).slice(0,30);
    if(persistExperimentSaves(nextSaves))toast('实验档案已保存到本机 ✓');
    else toast('存档写入失败或恢复保护已启用；原有档案未被覆盖');
    updateSI();renderD();};
  var bd=E('bd');if(bd)bd.onclick=function(){var d=E('dr');if(d)d.className=d.className.indexOf('on')>=0?'dr':'dr on';renderD();};
  var dc=E('dx');if(dc)dc.onclick=function(){var d=E('dr');if(d)d.className='dr';};
  var sE=E('search');if(sE)sE.oninput=function(e){sQ=e.target.value.trim();renderList();};
  var bts=document.querySelectorAll('.fl button');
  for(var i=0;i<bts.length;i++)(function(b){b.onclick=function(){
    var all=document.querySelectorAll('.fl button');for(var k=0;k<all.length;k++)all[k].className='';
    b.className='on';fCat=b.getAttribute('data-c');renderList();};})(bts[i]);
  document.addEventListener('keydown',function(e){
    if(e.code==='Space'&&e.target.tagName!=='INPUT'){e.preventDefault();var b=E('bp');if(b)b.click();}
    if(e.code==='Escape'){var d=E('dr');if(d)d.className='dr';}});
  var rT=null;window.addEventListener('resize',function(){clearTimeout(rT);rT=setTimeout(resize,60);});
}

function updateSI(){var x=E('si');if(x)x.textContent='📁 存档：'+saves.length+' 条';}
function renderD(){
  var b=E('db');if(!b)return;
  if(!saves.length){b.innerHTML='<div class="ep">暂无存档记录<br>点击「💾 存档」保存当前实验参数</div>';return;}
  b.innerHTML='';for(var i=0;i<saves.length;i++){var s=saves[i];
    var d=document.createElement('div');d.className='rc';
    var parts=[];for(var k in s.params)if(s.params.hasOwnProperty(k))parts.push(esc(k)+'='+esc(typeof s.params[k]==='number'?+s.params[k].toFixed(3):s.params[k]));
    d.innerHTML='<div class="rh"><span class="rn">'+(i+1)+'. '+esc(s.name)+'</span><span class="rt">'+esc(s.time)+'</span></div><div class="rp">'+parts.join('  ')+'</div>';
    b.appendChild(d);}
}
var tT=null;
function toast(m){var t=E('ts');if(!t)return;t.textContent=m;t.className='ts on';clearTimeout(tT);tT=setTimeout(function(){t.className='ts';},1800);}

async function main(){try{window.PHYS_DOMAIN=await import('../../src/domain/index.js');}catch(e){console.error('科学计算核心加载失败',e);toast('科学计算核心加载失败，请刷新或检查部署');return;}bindUI();boot();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',main);else main();
})();
