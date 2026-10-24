
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
// Public drawing primitives shared with the separately loaded experiment catalogue.
window.PHYS_DRAW={clamp:C,roundedRect:rr,pill:pl,label:lb,spring:dSpr,perimeterPoint:ptR};

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
    var mk=g.mk[m],markerX=typeof mk.x==='function'?mk.x(p):mk.x,myValue=g.fn(p,markerX,st.t||0);
    if(!Number.isFinite(markerX)||!Number.isFinite(myValue))continue;
    var mx=x2p(markerX),my=y2p(myValue);c.fillStyle=mk.c||'#fbbf24';
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

// The catalogue is loaded after this engine file and uses these factories to register models.
window.mkCurve=mkCurve;
window.mkMotion=mkMotion;
window.mkPart=mkPart;

/* ============ 辅助：参数 ============ */
function P(k,l,mn,mx,s,v,u){return{key:k,label:l,min:mn,max:mx,step:s,value:v,unit:u||''};}

/* ============================================================
   引擎
   ============================================================ */
var cv,ctx,sw,resizeObserver=null;
var W=800,H=500;
var cur=null,P={},ST={};
var paused=false;
var SAVE_KEY='physchem_lab_saved_experiments_v1';
var ARCHIVE_MODEL_VERSION='physchem-engine-v2';
var saves=[];
var archiveCompareSelection=[];
var archiveCompareVisible=false;
var storageRecoveryRequired=false;
var archiveRawValue=null;
var archiveReadFailed=false;
function isValidExperimentSave(item){
  if(!item||typeof item!=='object'||Array.isArray(item))return false;
  var allowedFields=['name','time','params','note','readouts','formulaSnapshot','tutorSnapshot','experimentId','modelVersion','experimentSnapshotVersion','snapshotAt'];
  if(Object.keys(item).some(function(key){return allowedFields.indexOf(key)===-1;}))return false;
  if(typeof item.name!=='string'||!item.name.trim()||item.name.length>160)return false;
  if(typeof item.time!=='string'||!item.time.trim()||item.time.length>80)return false;
  if(item.experimentId!==undefined && (typeof item.experimentId!=='string'||!item.experimentId.trim()||item.experimentId.length>80))return false;
  if(item.modelVersion!==undefined && (typeof item.modelVersion!=='string'||!item.modelVersion.trim()||item.modelVersion.length>80))return false;
  if(item.experimentSnapshotVersion!==undefined && item.experimentSnapshotVersion!==1)return false;
  if(item.experimentSnapshotVersion===1 && (!item.experimentId || item.snapshotAt===undefined))return false;
  if(item.snapshotAt!==undefined && item.experimentSnapshotVersion!==1)return false;
  if(item.snapshotAt!==undefined && (typeof item.snapshotAt!=='string'||
     !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(item.snapshotAt)||
     !Number.isFinite(Date.parse(item.snapshotAt))||
     new Date(Date.parse(item.snapshotAt)).toISOString()!==item.snapshotAt))return false;
  if(item.note!==undefined && (typeof item.note!=='string'||item.note.length>1200||
     /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(item.note)))return false;
  if(item.readouts!==undefined && (!Array.isArray(item.readouts)||item.readouts.length>30||
     !item.readouts.every(function(row){
       return !!row&&typeof row==='object'&&!Array.isArray(row)&&
         typeof row.label==='string'&&row.label.trim().length>0&&row.label.length<=120&&
         typeof row.value==='string'&&row.value.length<=180;
     })))return false;
  if(item.formulaSnapshot!==undefined && (!Array.isArray(item.formulaSnapshot)||
     item.formulaSnapshot.length>20||!item.formulaSnapshot.every(function(row){
       return typeof row==='string'&&row.length>0&&row.length<=300;
     })))return false;
  if(item.tutorSnapshot!==undefined && (typeof item.tutorSnapshot!=='string'||item.tutorSnapshot.length>2400))return false;
  if(!item.params||typeof item.params!=='object'||Array.isArray(item.params))return false;
  var keys=Object.keys(item.params);
  if(keys.length<1||keys.length>30)return false;
  return keys.every(function(key){
    return /^[A-Za-z][A-Za-z0-9_]*$/.test(key)&&Number.isFinite(item.params[key]);
  });
}
function isValidExperimentSaveList(value){
  if(!Array.isArray(value)||value.length>30||!value.every(isValidExperimentSave))return false;
  var identities=Object.create(null);
  return value.every(function(item){
    if(item.experimentSnapshotVersion!==1||!item.experimentId||!item.snapshotAt)return true;
    var parameters=Object.keys(item.params).sort().map(function(key){
      return [key,item.params[key]];
    });
    var identity=JSON.stringify([item.experimentId,item.snapshotAt,parameters]);
    if(identities[identity])return false;
    identities[identity]=true;
    return true;
  });
}
var rawSaved=null;
try{
  rawSaved=localStorage.getItem(SAVE_KEY);
  archiveRawValue=rawSaved;
}catch(readError){
  archiveReadFailed=true;
  storageRecoveryRequired=true;
  console.warn('无法读取实验档案缓存，已暂停覆盖写入；请导出恢复记录或导入有效备份',readError);
}
if(!archiveReadFailed){
  try{
    var restored=JSON.parse(rawSaved||'[]');
    if(!isValidExperimentSaveList(restored))throw new TypeError('实验存档内容或结构无效');
    saves=restored;
  }catch(e){
    storageRecoveryRequired=true;
    console.warn('实验存档读取失败，已暂停覆盖写入；请导出原始存档或导入有效备份',e);
  }
}
function persistExperimentSaves(nextSaves){
  if(storageRecoveryRequired)return false;
  if(!isValidExperimentSaveList(nextSaves)){
    console.warn('拒绝写入结构无效的实验存档；原有存档保持不变');
    return false;
  }
  try{
    var serialized=JSON.stringify(nextSaves);
    localStorage.setItem(SAVE_KEY,serialized);
    saves=JSON.parse(serialized);
    archiveRawValue=serialized;
    archiveReadFailed=false;
    return true;
  }catch(e){
    storageRecoveryRequired=true;
    console.warn('实验存档写入失败，已启用恢复保护',e);
    return false;
  }
}
function buildExperimentArchiveBackup(){
  if(storageRecoveryRequired){
    return {
      format:'physchem-lab-archive-recovery',
      version:1,
      storageKey:SAVE_KEY,
      exportedAt:new Date().toISOString(),
      readFailed:archiveReadFailed,
      rawValue:archiveRawValue
    };
  }
  return JSON.parse(JSON.stringify(saves));
}
function restoreExperimentArchive(input){
  var candidate=input;
  if(candidate&&!Array.isArray(candidate)&&candidate.format==='physchem-lab-archive-recovery'){
    if(candidate.version!==1||candidate.storageKey!==SAVE_KEY||typeof candidate.rawValue!=='string')return false;
    try{candidate=JSON.parse(candidate.rawValue);}catch(e){return false;}
  }
  if(!isValidExperimentSaveList(candidate))return false;
  try{
    var serialized=JSON.stringify(candidate);
    localStorage.setItem(SAVE_KEY,serialized);
    saves=JSON.parse(serialized);
    archiveRawValue=serialized;
    archiveReadFailed=false;
    storageRecoveryRequired=false;
    return true;
  }catch(e){
    storageRecoveryRequired=true;
    console.warn('实验档案恢复写入失败，恢复保护仍保持启用',e);
    return false;
  }
}
function deferArchiveObjectUrlRelease(url){
  // Safari and iOS may begin consuming the download after click() returns.
  // Keep the object URL alive briefly so the browser can finish reading it.
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
}
function exportExperimentArchive(){
  var payload=buildExperimentArchiveBackup();
  var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var link=document.createElement('a');
  link.href=url;
  link.download=storageRecoveryRequired
    ? 'PhysChem_原始存档恢复包_'+new Date().toISOString().slice(0,10)+'.json'
    : 'PhysChem_实验档案备份_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  deferArchiveObjectUrlRelease(url);
  toast(storageRecoveryRequired?'已导出原始存档恢复包；请妥善保管并检查内容。':'实验档案备份已导出');
}
function syncArchiveRecoveryUI(){
  var status=E('archiveRecoveryStatus');
  if(status){
    status.hidden=!storageRecoveryRequired;
    status.textContent=storageRecoveryRequired
      ? '存档缓存异常或不可读取：自动写入已锁定。可先导出原始恢复包，再导入有效备份。'
      : '';
  }
  var exportButton=E('archiveExport');
  if(exportButton)exportButton.textContent=storageRecoveryRequired?'导出原始恢复包':'导出档案备份';
}
function importExperimentArchiveFile(input){
  var file=input&&input.files&&input.files[0];
  if(!file)return;
  if(file.size>1024*1024){
    toast('档案备份超过 1 MB，已拒绝导入');
    input.value='';
    return;
  }
  var reader=new FileReader();
  reader.onload=function(event){
    try{
      var parsed=JSON.parse(event.target.result);
      if(!restoreExperimentArchive(parsed))throw new Error('档案结构无效或浏览器存储仍不可写');
      syncArchiveRecoveryUI();
      updateSI();
      renderD();
      toast('实验档案已验证并恢复 ✓');
    }catch(error){
      toast('档案恢复失败：'+error.message+'；原有存档保持不变');
    }finally{input.value='';}
  };
  reader.onerror=function(){
    toast('无法读取档案文件；原有存档保持不变');
    input.value='';
  };
  reader.readAsText(file);
}
var typer=null;
var started=false;
var last=0,lastRO=0;
var animationFrameId=0;
var motionPreference=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
var reducedMotion=!!(motionPreference&&motionPreference.matches);
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
  // Assigning canvas.width/height clears its bitmap. Repaint immediately after every container resize,
  // including animated mode, so a throttled or paused animation frame cannot leave a blank instrument.
  if(started)renderCurrentFrame();
  return true;
}

function renderList(){
  var box=E('lst');if(!box)return;box.innerHTML='';
  var total=E('catalogueTotal');if(total)total.textContent=String(EXP.length);
  var totalInline=E('catalogueTotalInline');if(totalInline)totalInline.textContent=String(EXP.length);
  box.setAttribute('role','list');
  box.setAttribute('aria-label','完整物理化学实验目录');
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
    var ex=list[j];var item=document.createElement('div');
    item.setAttribute('role','listitem');
    var d=document.createElement('button');
    d.type='button';
    d.className='it'+(cur&&cur.id===ex.id?' on':'');
    d.setAttribute('aria-pressed',cur&&cur.id===ex.id?'true':'false');
    d.setAttribute('aria-label',ex.name+'，'+ex.cat+'实验');
    d.innerHTML='<div class="t"><span class="tg '+(ex.cat==='物理'?'p':'c')+'">'+esc(ex.cat)+'</span>'+esc(ex.name)+'</div><div class="d">'+esc(ex.brief)+'</div>';
    (function(id,node){node.onclick=function(){selectExp(id);};})(ex.id,d);
    item.appendChild(d);
    box.appendChild(item);
  }
}

function syncSimulationStatus(){
  var status=E('simulationStatus');
  var panel=E('sw');
  var button=E('bp');
  if(status)status.textContent=reducedMotion?'静态预览（已启用减少动态效果）':paused?'已暂停':'运行中';
  if(panel)panel.classList.toggle('is-paused',!!paused||reducedMotion);
  if(button){
    button.disabled=!!reducedMotion;
    button.textContent=reducedMotion?'静态预览':paused?'▶ 继续':'⏸ 暂停';
    button.title=reducedMotion?'已尊重系统减少动态效果设置':'暂停或继续当前实验动画';
  }
}
function setExperimentSidebarOpen(open){
  var sidebar=E('experimentSidebar');
  var backdrop=E('sidebarBackdrop');
  var button=E('mobileMenu');
  if(sidebar)sidebar.classList.toggle('open',!!open);
  if(backdrop)backdrop.classList.toggle('show',!!open);
  if(button)button.setAttribute('aria-expanded',open?'true':'false');
}
function selectExp(id){
  var f=null;
  for(var i=0;i<EXP.length;i++)if(EXP[i].id===id){f=EXP[i];break;}
  if(!f){SE('未找到实验: '+id);return;}
  setExperimentSidebarOpen(false);
  cur=f;window.__physchemDrawError=null;window.__physchemStepError=null;P={};
  var noteField=E('experimentNote');if(noteField)noteField.value='';
  updateExperimentNoteCount();
  for(var j=0;j<cur.params.length;j++)P[cur.params[j].key]=cur.params[j].value;
  ST=cur.init?cur.init(P):{};
  paused=false;
  E('et').textContent=cur.name;E('eb2').textContent=cur.brief;
  buildParams();buildPanel();renderList();refreshTutor(true);syncSimulationStatus();
  if(reducedMotion&&started)renderCurrentFrame();
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
  if(reducedMotion&&started)renderCurrentFrame();
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

function drawCurrentFrame(ts,dt,advance){
  if(!cur||!ctx)return;
  if(advance&&!paused&&!reducedMotion&&cur.step){
    try{cur.step(P,dt,ST);}catch(e){window.__physchemStepError={experimentId:cur.id,message:String(e&&e.message||e)};}
  }
  ctx.clearRect(0,0,W,H);
  try{cur.draw(ctx,W,H,P,ST);window.__physchemDrawError=null;}
  catch(e){window.__physchemDrawError={experimentId:cur.id,message:String(e&&e.message||e)};}
  ctx.save();ctx.font='11px Menlo,Consolas,monospace';ctx.fillStyle='rgba(125,143,171,.55)';ctx.textAlign='right';ctx.textBaseline='bottom';
  ctx.fillText('PhysChem Lab · Ternence Dai',W-16,H-12);ctx.restore();
  if(!advance||ts-lastRO>110){lastRO=ts;updateRO();}
}
function renderCurrentFrame(){
  if(!cur||!ctx)return;
  drawCurrentFrame(0,0,false);
}
function scheduleAnimationFrame(){
  if(started&&!reducedMotion&&!animationFrameId)animationFrameId=requestAnimationFrame(loop);
}
function loop(ts){
  animationFrameId=0;
  if(!started||reducedMotion)return;
  if(!last)last=ts;var dt=(ts-last)/1000;last=ts;dt=C(dt,0,0.05);
  drawCurrentFrame(ts,dt,true);
  scheduleAnimationFrame();
}
function handleMotionPreferenceChange(event){
  reducedMotion=!!event.matches;
  if(reducedMotion){
    if(animationFrameId)cancelAnimationFrame(animationFrameId);
    animationFrameId=0;
    renderCurrentFrame();
  }else{
    last=0;
    scheduleAnimationFrame();
  }
  syncSimulationStatus();
}

function boot(){
  cv=E('cv');sw=E('sw');
  if(cv&&!ctx){try{ctx=cv.getContext('2d');}catch(e){ctx=null;}}
  if(!cv||!sw||!ctx){requestAnimationFrame(boot);return;}
  if(!resize()){requestAnimationFrame(boot);return;}
  try{renderList();updateSI();renderD();selectExp('p1');}catch(e){SE('初始化失败: '+e.message);console.error(e);return;}
  setTimeout(resize,50);setTimeout(resize,250);setTimeout(resize,600);setTimeout(resize,1200);
  started=true;syncSimulationStatus();
  if(reducedMotion)renderCurrentFrame();else scheduleAnimationFrame();
}

function bindUI(){
  if(motionPreference){
    if(typeof motionPreference.addEventListener==='function')motionPreference.addEventListener('change',handleMotionPreferenceChange);
    else if(typeof motionPreference.addListener==='function')motionPreference.addListener(handleMotionPreferenceChange);
  }
  var noteField=E('experimentNote');
  if(noteField)noteField.addEventListener('input',updateExperimentNoteCount);
  updateExperimentNoteCount();
  var mobileMenu=E('mobileMenu');
  if(mobileMenu)mobileMenu.onclick=function(){
    var sidebar=E('experimentSidebar');
    setExperimentSidebarOpen(!(sidebar&&sidebar.classList.contains('open')));
  };
  var sidebarBackdrop=E('sidebarBackdrop');
  if(sidebarBackdrop)sidebarBackdrop.onclick=function(){setExperimentSidebarOpen(false);};
  var archiveComparePanel=E('archiveComparisonPanel');
  if(archiveComparePanel&&archiveComparePanel.dataset.compareActionsBound!=='true'){
    archiveComparePanel.dataset.compareActionsBound='true';
    archiveComparePanel.addEventListener('click',function(event){
      var action=event.target.closest('[data-archive-compare-action]');
      if(!action)return;
      var command=action.getAttribute('data-archive-compare-action');
      if(command==='clear'){
        archiveCompareSelection=[];
        archiveCompareVisible=false;
        renderD();
      }else if(command==='run'){
        if(archiveCompareSelection.length!==2)return;
        archiveCompareVisible=true;
        renderArchiveComparison();
      }
    });
  }
  var archiveExport=E('archiveExport');
  if(archiveExport)archiveExport.onclick=exportExperimentArchive;
  var archiveImport=E('archiveImport');
  if(archiveImport)archiveImport.onchange=function(){importExperimentArchiveFile(this);};
  syncArchiveRecoveryUI();
  var bp=E('bp');if(bp)bp.onclick=function(){paused=!paused;this.textContent=paused?'▶ 继续':'⏸ 暂停';this.className=paused?'bt on':'bt';syncSimulationStatus();};
  var br=E('br2');if(br)br.onclick=function(){ST=cur&&cur.init?cur.init(P):{};paused=false;
    syncSimulationStatus();if(reducedMotion)renderCurrentFrame();refreshTutor(true);toast('实验已重置 ↺');};
  var bs=E('bs');if(bs)bs.onclick=function(){if(!cur)return;
    if(storageRecoveryRequired){toast('存档恢复保护已启用：为避免覆盖旧数据，本次保存已暂停');return;}
    if(saves.length>=30){
      toast('实验档案已达到 30 份上限。请先导出备份，或在档案列表明确删除旧记录；系统不会自动覆盖。');
      setExperimentSidebarOpen(false);
      var archiveDrawer=E('dr');if(archiveDrawer)archiveDrawer.className='dr on';
      return;
    }
    var snapshot=buildExperimentRecordSnapshot();
    var record={
      name:cur.name,
      experimentId:String(cur.id||''),
      modelVersion:ARCHIVE_MODEL_VERSION,
      time:new Date().toLocaleString('zh-CN',{hour12:false}),
      params:JSON.parse(JSON.stringify(P)),
      experimentSnapshotVersion:snapshot.experimentSnapshotVersion,
      snapshotAt:snapshot.snapshotAt,
      note:snapshot.note,
      readouts:snapshot.readouts,
      formulaSnapshot:snapshot.formulaSnapshot,
      tutorSnapshot:snapshot.tutorSnapshot
    };
    var nextSaves=[record].concat(saves);
    if(persistExperimentSaves(nextSaves))toast('实验档案已保存：参数、计算读数、公式、助教说明与观察备注 ✓');
    else toast('存档写入失败或恢复保护已启用；原有档案未被覆盖');
    updateSI();renderD();syncArchiveRecoveryUI();};
  var bd=E('bd');if(bd)bd.onclick=function(){var d=E('dr');if(d)d.className=d.className.indexOf('on')>=0?'dr':'dr on';renderD();};
  var dc=E('dx');if(dc)dc.onclick=function(){var d=E('dr');if(d)d.className='dr';};
  var sE=E('search');if(sE)sE.oninput=function(e){sQ=e.target.value.trim();renderList();};
  var bts=document.querySelectorAll('.fl button');
  for(var i=0;i<bts.length;i++)(function(b){b.onclick=function(){
    var all=document.querySelectorAll('.fl button');for(var k=0;k<all.length;k++)all[k].className='';
    b.className='on';fCat=b.getAttribute('data-c');renderList();};})(bts[i]);
  document.addEventListener('keydown',function(e){
    if(e.code==='Space'&&e.target.tagName!=='INPUT'){e.preventDefault();var b=E('bp');if(b)b.click();}
    if(e.code==='Escape'){
      var d=E('dr');if(d)d.className='dr';
      setExperimentSidebarOpen(false);
    }});
  var rT=null;window.addEventListener('resize',function(){clearTimeout(rT);rT=setTimeout(resize,60);});
  if(typeof ResizeObserver==='function'&&sw){
    resizeObserver=new ResizeObserver(function(){if(started)resize();});
    resizeObserver.observe(sw);
  }
}

function updateSI(){
  var x=E('si');
  if(x){
    x.textContent='📁 存档：'+saves.length+' / 30 条';
    x.title='最多保留 30 份；满额时不会自动覆盖旧档案。';
  }
}
function deleteSavedExperiment(index){
  if(storageRecoveryRequired){toast('存档恢复保护已启用，当前禁止删除；请先恢复或导出原始数据');return false;}
  if(!Number.isSafeInteger(index)||index<0||index>=saves.length){
    toast('未找到要删除的实验档案');return false;
  }
  var target=saves[index];
  var label=String(target&&target.name||'未命名实验');
  if(!confirm('确定删除“'+label+'”这份实验档案吗？此操作不可撤销。建议先导出档案备份。'))return false;
  var nextSaves=saves.slice();
  nextSaves.splice(index,1);
  if(!persistExperimentSaves(nextSaves)){
    syncArchiveRecoveryUI();
    toast('档案删除未完成：存储写入失败，原有档案保持不变');
    return false;
  }
  updateSI();
  renderD();
  syncArchiveRecoveryUI();
  toast('已删除所选实验档案；其他档案保持不变');
  return true;
}
function restoreSavedExperiment(index){
  if(!Number.isSafeInteger(index)||index<0||index>=saves.length){
    toast('未找到对应的实验档案记录');return false;
  }
  var saved=saves[index];
  var target=null;
  for(var i=0;i<EXP.length;i++){
    if(saved.experimentId!==undefined && String(EXP[i].id)===String(saved.experimentId)){
      target=EXP[i];break;
    }
  }
  if(!target && saved.experimentId===undefined){
    var legacyMatches=EXP.filter(function(experiment){return experiment.name===saved.name;});
    if(legacyMatches.length===1)target=legacyMatches[0];
    else if(legacyMatches.length>1){
      toast('旧版档案名称对应多个实验模型，已阻止自动载入以避免套用错误参数');
      return false;
    }
  }
  if(!target){
    toast('该档案对应的实验模型不存在；原档案保持不变');return false;
  }
  if(saved.modelVersion && saved.modelVersion!==ARCHIVE_MODEL_VERSION){
    toast('该档案使用不同版本的实验模型，已阻止自动套用');return false;
  }
  var definitions=Array.isArray(target.params)?target.params:[];
  var keys=Object.keys(saved.params||{});
  if(!definitions.length||keys.length!==definitions.length){
    toast('档案参数结构与当前实验不一致；请保留档案并人工核对');return false;
  }
  var nextParams={};
  for(var k=0;k<definitions.length;k++){
    var definition=definitions[k];
    var value=saved.params[definition.key];
    if(!Object.prototype.hasOwnProperty.call(saved.params,definition.key)||
       !Number.isFinite(value)||value<definition.min||value>definition.max||
       !Number.isFinite(definition.min)||!Number.isFinite(definition.max)){
      toast('档案参数 '+definition.key+' 超出当前实验允许范围，未应用任何参数');return false;
    }
    nextParams[definition.key]=value;
  }
  var nextState;
  try{nextState=target.init?target.init(nextParams):{};}
  catch(error){toast('实验模型无法使用这组参数：'+error.message);return false;}

  setExperimentSidebarOpen(false);
  cur=target;
  P=nextParams;
  ST=nextState||{};
  paused=false;
  var pauseButton=E('bp');
  if(pauseButton){pauseButton.textContent='⏸ 暂停';pauseButton.className='bt';}
  E('et').textContent=cur.name;
  E('eb2').textContent=cur.brief;
  buildParams();
  buildPanel();
  renderList();
  refreshTutor(true);
  var noteField=E('experimentNote');
  if(noteField)noteField.value=typeof saved.note==='string'?saved.note:'';
  updateExperimentNoteCount();
  setTimeout(resize,30);
  setTimeout(resize,200);
  toast('已载入实验参数与观察备注；原始档案仍保留在列表中');
  return true;
}
function updateExperimentNoteCount(){
  var field=E('experimentNote');
  var counter=E('experimentNoteCount');
  if(counter)counter.textContent=(field?field.value.length:0)+' / 1200';
}
function buildExperimentRecordSnapshot(){
  var readouts=[];
  try{
    var rows=cur&&cur.readout?cur.readout(P,ST):[];
    if(Array.isArray(rows))readouts=rows.slice(0,30).map(function(row){
      return {
        label:String(row&&row.k!==undefined?row.k:'结果').slice(0,120),
        value:String(row&&row.v!==undefined?row.v:'—').slice(0,180)
      };
    });
  }catch(error){console.warn('当前模型读数快照未能生成',error);}
  var formulaSnapshot=Array.isArray(cur&&cur.formulas)
    ?cur.formulas.slice(0,20).map(function(formula){return String(formula).slice(0,300);})
    :[];
  var tutorSnapshot='';
  try{tutorSnapshot=cur&&cur.tutor?String(cur.tutor(P,ST)).slice(0,2400):'';}
  catch(error){tutorSnapshot='当前助教说明未能生成：'+String(error&&error.message||error).slice(0,300);}
  var noteField=E('experimentNote');
  return {
    experimentSnapshotVersion:1,
    snapshotAt:new Date().toISOString(),
    note:noteField?String(noteField.value||'').trim():'',
    readouts:readouts,
    formulaSnapshot:formulaSnapshot,
    tutorSnapshot:tutorSnapshot
  };
}

function archiveSnapshotIdentity(snapshot){
  return JSON.stringify([
    String(snapshot.experimentId||''),String(snapshot.modelVersion||''),
    String(snapshot.experimentSnapshotVersion||''),String(snapshot.snapshotAt||''),
    String(snapshot.time||''),String(snapshot.name||'')
  ]);
}
function selectedArchiveSnapshots(){
  var selected=[];
  for(var i=0;i<archiveCompareSelection.length;i++){
    var identity=archiveCompareSelection[i];
    var snapshot=saves.find(function(item){return archiveSnapshotIdentity(item)===identity;});
    if(snapshot)selected.push(snapshot);
  }
  archiveCompareSelection=archiveCompareSelection.filter(function(identity){
    return saves.some(function(item){return archiveSnapshotIdentity(item)===identity;});
  });
  return selected;
}
function archiveDateLabel(snapshot){
  var value=snapshot.snapshotAt||snapshot.time||'时间未知';
  if(snapshot.snapshotAt){
    var date=new Date(snapshot.snapshotAt);
    if(Number.isFinite(date.getTime()))return date.toLocaleString('zh-CN',{hour12:false});
  }
  return String(value);
}
function archiveComparisonValue(value){
  return value===null||value===undefined?'—':String(value);
}
function archiveComparisonDelta(value,unit){
  if(typeof value!=='number'||!Number.isFinite(value))return '—';
  var stable=Number(value.toPrecision(7));
  var sign=stable>0?'+':'';
  return sign+String(stable)+(unit?' '+unit:'');
}
function renderArchiveComparison(){
  var panel=E('archiveComparisonPanel');
  if(!panel)return;
  var selected=selectedArchiveSnapshots();
  var status=E('archiveCompareSelectionStatus');
  var run=E('archiveCompareRun');
  var clear=E('archiveCompareClear');
  var output=E('archiveCompareResult');
  if(status)status.textContent='已选 '+selected.length+' / 2 份档案';
  if(run)run.disabled=selected.length!==2;
  if(clear)clear.disabled=selected.length===0;
  var picks=document.querySelectorAll('[data-compare-save]');
  for(var i=0;i<picks.length;i++){
    var identity=picks[i].getAttribute('data-compare-save');
    var isSelected=archiveCompareSelection.indexOf(identity)>=0;
    picks[i].textContent=isSelected?'已选 · 取消':'加入对照';
    picks[i].setAttribute('aria-pressed',isSelected?'true':'false');
    picks[i].disabled=!isSelected&&archiveCompareSelection.length>=2;
  }
  if(!output)return;
  if(!archiveCompareVisible||selected.length!==2){
    output.innerHTML='<div class="w9-archive-compare__empty">在下方任意两份档案中点击“加入对照”，即可查看参数变更与结果差值。</div>';
    return;
  }
  if(!window.PHYS_DOMAIN||typeof window.PHYS_DOMAIN.compareExperimentArchiveSnapshots!=='function'){
    output.innerHTML='<div class="w9-archive-compare__blocked">对照计算模块尚未加载；历史档案保持不变，请刷新后重试。</div>';
    return;
  }
  var comparison=window.PHYS_DOMAIN.compareExperimentArchiveSnapshots(selected[0],selected[1]);
  if(!comparison.compatible){
    output.innerHTML='<div class="w9-archive-compare__blocked"><strong>无法自动对照</strong><p>'+esc(comparison.reason)+'</p></div>';
    return;
  }
  var parameters=comparison.parameters.filter(function(row){return row.changed;});
  var parameterRows=parameters.map(function(row){
    return '<tr><th scope="row">'+esc(row.key)+'</th><td>'+esc(archiveComparisonValue(row.leftValue))+
      '</td><td>'+esc(archiveComparisonValue(row.rightValue))+'</td></tr>';
  }).join('');
  var readoutRows=comparison.readouts.map(function(row){
    var delta=row.comparable?archiveComparisonDelta(row.delta,row.unit):'—';
    var note=row.comparable?'':row.reason;
    return '<tr><th scope="row">'+esc(row.label)+'</th><td>'+esc(archiveComparisonValue(row.leftValue))+
      '</td><td>'+esc(archiveComparisonValue(row.rightValue))+
      '</td><td class="'+(row.comparable?'is-comparable':'is-not-comparable')+'">'+
      esc(delta)+(note?'<small>'+esc(note)+'</small>':'')+'</td></tr>';
  }).join('');
  var leftTitle=esc(selected[0].name)+' · '+esc(archiveDateLabel(selected[0]));
  var rightTitle=esc(selected[1].name)+' · '+esc(archiveDateLabel(selected[1]));
  output.innerHTML=
    '<div class="w9-archive-compare__identity"><div><span>实验模型</span><strong>'+
      esc(comparison.experimentId)+'</strong></div><div><span>计算版本</span><strong>'+
      esc(comparison.modelVersion)+'</strong></div></div>'+
    '<section class="w9-archive-compare__table-section"><h5>输入参数变化</h5>'+
      '<div class="w9-archive-compare__table-wrap"><table><thead><tr><th>参数键</th><th>'+leftTitle+
      '</th><th>'+rightTitle+'</th></tr></thead><tbody>'+
      (parameterRows||'<tr><td colspan="3">两份快照中的输入参数相同。</td></tr>')+
      '</tbody></table></div><p>参数只展示保存值，不补写未随档案保存的单位，也不推测单位换算。</p></section>'+
    '<section class="w9-archive-compare__table-section"><h5>计算结果对照</h5>'+
      '<div class="w9-archive-compare__table-wrap"><table><thead><tr><th>结果项</th><th>'+leftTitle+
      '</th><th>'+rightTitle+'</th><th>差值（右 − 左）</th></tr></thead><tbody>'+
      (readoutRows||'<tr><td colspan="4">两份档案没有可对应的结果项。</td></tr>')+
      '</tbody></table></div><p>差值仅在结果标签相同且单位完全一致时计算；其余保留原始文本并说明未比较原因。</p></section>';
}

function renderD(){
  var b=E('db');if(!b)return;
  if(b.dataset.archiveActionsBound!=='true'){
    b.dataset.archiveActionsBound='true';
    b.addEventListener('click',function(event){
      var compareButton=event.target.closest('[data-compare-save]');
      if(compareButton){
        var identity=compareButton.getAttribute('data-compare-save');
        var position=archiveCompareSelection.indexOf(identity);
        if(position>=0)archiveCompareSelection.splice(position,1);
        else if(archiveCompareSelection.length>=2){toast('每次最多选择两份档案对照');return;}
        else archiveCompareSelection.push(identity);
        archiveCompareVisible=false;
        renderD();
        return;
      }
      var deleteButton=event.target.closest('[data-delete-save]');
      if(deleteButton){
        deleteSavedExperiment(Number(deleteButton.getAttribute('data-delete-save')));
        return;
      }
      var button=event.target.closest('[data-load-save]');
      if(!button)return;
      restoreSavedExperiment(Number(button.getAttribute('data-load-save')));
    });
  }
  if(!saves.length){
    b.innerHTML='<div class="ep">暂无存档记录<br>点击「💾 存档」保存当前实验参数</div>';
    renderArchiveComparison();return;
  }
  b.innerHTML='';for(var i=0;i<saves.length;i++){var s=saves[i];
    var d=document.createElement('div');d.className='rc';
    var parts=[];for(var k in s.params)if(s.params.hasOwnProperty(k))parts.push(esc(k)+'='+esc(typeof s.params[k]==='number'?+s.params[k].toFixed(3):s.params[k]));
    var meta=(s.experimentId?'实验ID '+esc(s.experimentId):'旧版存档 · 未记录实验ID')+' · '+(s.modelVersion?esc(s.modelVersion):'旧版模型');
    var outputs=Array.isArray(s.readouts)&&s.readouts.length
      ?'<div class="w9-archive-results">'+s.readouts.map(function(row){return '<div><span>'+esc(row.label)+'</span><b>'+esc(row.value)+'</b></div>';}).join('')+'</div>':'';
    var note=s.note?'<div class="w9-archive-note"><strong>观察备注</strong><p>'+esc(s.note)+'</p></div>':'';
    var formulas=Array.isArray(s.formulaSnapshot)&&s.formulaSnapshot.length
      ?'<details class="w9-archive-formulas"><summary>公式快照 · '+s.formulaSnapshot.length+' 条</summary>'+s.formulaSnapshot.map(function(formula){return '<div>'+esc(formula)+'</div>';}).join('')+'</details>':'';
    var snapshotMeta=s.snapshotAt?' · 结果快照 '+esc(new Date(s.snapshotAt).toLocaleString()):'';
    d.innerHTML='<div class="rh"><span class="rn">'+(i+1)+'. '+esc(s.name)+'</span><span class="rt">'+esc(s.time)+'</span></div><div class="rp">'+meta+snapshotMeta+'<br>'+parts.join('  ')+outputs+note+formulas+
      (s.tutorSnapshot?'<details class="w9-archive-tutor"><summary>当时的公式助教说明</summary><p>'+esc(s.tutorSnapshot)+'</p></details>':'')+
      '<div class="archive-action-row"><button type="button" class="w9-archive-load" data-load-save="'+i+'">载入本组参数与备注</button><button type="button" class="w9-archive-compare-pick" data-compare-save="'+esc(archiveSnapshotIdentity(s))+'" aria-pressed="false">加入对照</button><button type="button" class="w9-archive-delete" data-delete-save="'+i+'" aria-label="删除第 '+(i+1)+' 份实验档案">删除档案</button></div></div>';
    b.appendChild(d);}
  renderArchiveComparison();
}

var tT=null;
function toast(m){var t=E('ts');if(!t)return;t.textContent=m;t.className='ts on';clearTimeout(tT);tT=setTimeout(function(){t.className='ts';},1800);}

async function main(){try{window.PHYS_DOMAIN=await import('../../src/domain/index.js');}catch(e){console.error('科学计算核心加载失败',e);toast('科学计算核心加载失败，请刷新或检查部署');return;}bindUI();boot();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',main);else main();
})();
