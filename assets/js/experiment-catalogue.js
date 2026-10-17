/* ============================================================
   8 个旗舰实验
   ============================================================ */
/* 1. 抛体运动 */
EXP.push({id:'p1',name:'抛体运动轨迹',cat:'物理',tags:['力学','运动学'],brief:'把速度分解为水平匀速与竖直匀变速，运动合成与分解的经典范例。',resetOnChange:true,
  params:[P('v0','初速度 v₀',5,60,1,32,'m/s'),P('ang','发射角 θ',5,85,1,45,'°'),P('g','重力加速度 g',1.6,20,0.1,9.8,'m/s²')],
  formulas:['x = v₀·cosθ·t','y = v₀·sinθ·t − ½g·t²','R = v₀²·sin2θ/g','H = v₀²·sin²θ/(2g)','T = 2v₀·sinθ/g'],
  calc:function(p){var d=window.PHYS_DOMAIN.projectileMotion({initialSpeed:p.v0,angleDeg:p.ang,gravity:p.g});return{vx:d.horizontalVelocity,vy:d.verticalVelocity,T:d.flightTime,R:d.range,H:d.maxHeight};},
  init:function(){return{t:0};},step:function(p,dt,st){var d=this.calc(p);st.t+=dt;if(st.t>d.T*1.55)st.t=0;},
  draw:function(c,W,H,p,st){var d=this.calc(p);var gy=H-52,ox=78;var s=Math.min((W-ox-80)/Math.max(d.R,1e-3),(gy-58)/Math.max(d.H,1e-3));
    c.strokeStyle='rgba(120,160,220,.07)';c.lineWidth=1;for(var x=ox;x<W-24;x+=44){c.beginPath();c.moveTo(x,24);c.lineTo(x,gy);c.stroke();}
    for(var y=gy;y>24;y-=44){c.beginPath();c.moveTo(ox,y);c.lineTo(W-24,y);c.stroke();}
    c.strokeStyle='rgba(34,211,238,.5)';c.lineWidth=2;c.beginPath();c.moveTo(ox,24);c.lineTo(ox,gy);c.lineTo(W-30,gy);c.stroke();
    c.strokeStyle='#1f6f66';c.lineWidth=3;c.beginPath();c.moveTo(40,gy);c.lineTo(W-16,gy);c.stroke();
    c.beginPath();for(var i=0;i<=120;i++){var t=d.T*i/120;var X=ox+d.vx*t*s;var Y=gy-(d.vy*t-0.5*p.g*t*t)*s;i?c.lineTo(X,Y):c.moveTo(X,Y);}
    c.strokeStyle='rgba(167,139,250,.55)';c.lineWidth=2;c.setLineDash([7,7]);c.stroke();c.setLineDash([]);
    var aX=ox+d.vx*(d.T/2)*s,aY=gy-d.H*s;lb(c,'H='+F(d.H)+'m',ox+8,aY-11,'#fbbf24',11);lb(c,'R='+F(d.R)+'m',ox+d.R*s-4,gy+18,'#34d399',11,'right');
    var tc=Math.min(st.t,d.T);var Xc=ox+d.vx*tc*s;var Yc=gy-(d.vy*tc-0.5*p.g*tc*tc)*s;
    var gr=c.createRadialGradient(Xc-3,Yc-3,1,Xc,Yc,18);gr.addColorStop(0,'#fff');gr.addColorStop(.45,'#fbbf24');gr.addColorStop(1,'rgba(251,191,36,0)');
    c.fillStyle=gr;c.beginPath();c.arc(Xc,Yc,18,0,7);c.fill();c.fillStyle='#fde68a';c.beginPath();c.arc(Xc,Yc,6,0,7);c.fill();
    c.strokeStyle='rgba(34,211,238,.65)';c.lineWidth=2;c.beginPath();c.arc(ox,gy,46,0,-p.ang*Math.PI/180,true);c.stroke();
    lb(c,p.ang+'°',ox+58,gy-24,'#22d3ee',12);
    pl(c,'v₀='+p.v0+' m/s',26,22,'rgba(34,211,238,.12)','#22d3ee');pl(c,'θ='+p.ang+'°',26,52,'rgba(251,191,36,.12)','#fbbf24');
  },
  readout:function(p){var d=this.calc(p);return[{k:'水平分速度 vₓ',v:F(d.vx)+' m/s'},{k:'竖直分速度 v_y',v:F(d.vy)+' m/s'},{k:'飞行时间 T',v:F(d.T)+' s'},{k:'射程 R',v:F(d.R)+' m'},{k:'最大高度 H',v:F(d.H)+' m'},{k:'重力加速度 g',v:F(p.g,1)+' m/s²'}];},
  tutor:function(p){var d=this.calc(p);var near=Math.abs(p.ang-45)<=3;
    return '【模型】抛体运动=水平匀速⊕竖直匀变速。分运动互不干扰。\n\n【参数】v₀='+p.v0+' m/s, θ='+p.ang+'°, g='+p.g+' m/s²\n\n【推演】\n· vₓ='+F(d.vx)+' m/s\n· v_y='+F(d.vy)+' m/s\n· T='+F(d.T)+' s\n· R='+F(d.R)+' m\n· H='+F(d.H)+' m\n\n【结论】'+(near?'θ≈45° 射程最大！':'把发射角调到 45° 试试，射程会达到峰值。')+'\n\n【延伸】月球 g=1.6 时射程是地球的 '+F(9.8/p.g,1)+' 倍。';}
});

/* 2. 单摆 */
EXP.push({id:'p2',name:'单摆与简谐振动',cat:'物理',tags:['力学','振动'],brief:'小角度下单摆做简谐振动，周期只与摆长和重力加速度有关。',resetOnChange:true,
  params:[P('L','摆长 L',0.3,2,0.05,1,'m'),P('g','重力加速度 g',1.6,20,0.1,9.8,'m/s²'),P('b','阻尼系数 b',0,0.6,0.02,0,'')],
  formulas:['θ″=−(g/L)·sinθ−b·θ′','小角度近似 sinθ≈θ','T=2π√(L/g)','ω=√(g/L)'],
  init:function(){return{th:0.17,w:0,t:0};},
  step:function(p,dt,st){var n=8,h=dt/n;for(var i=0;i<n;i++){var a=-(p.g/p.L)*Math.sin(st.th)-p.b*st.w;st.w+=a*h;st.th+=st.w*h;}st.t+=dt;},
  draw:function(c,W,H,p,st){var px=W/2,py=64;var sc=Math.min((H-py-74)/2.2,236);var L=p.L*sc;
    var bx=px+L*Math.sin(st.th),by=py+L*Math.cos(st.th);
    c.fillStyle='#1b2740';c.fillRect(px-90,py-22,180,14);
    c.strokeStyle='rgba(120,160,220,.22)';c.lineWidth=1;c.setLineDash([4,7]);c.beginPath();c.moveTo(px,py);c.lineTo(px,py+L+46);c.stroke();c.setLineDash([]);
    c.strokeStyle='rgba(167,139,250,.16)';c.lineWidth=1.4;c.beginPath();c.arc(px,py,L,Math.PI/2-0.6,Math.PI/2+0.6);c.stroke();
    c.strokeStyle='#94a3b8';c.lineWidth=2;c.beginPath();c.moveTo(px,py);c.lineTo(bx,by);c.stroke();
    var gr=c.createRadialGradient(bx-5,by-5,1,bx,by,24);gr.addColorStop(0,'#e0f2fe');gr.addColorStop(.42,'#22d3ee');gr.addColorStop(1,'rgba(34,211,238,0)');
    c.fillStyle=gr;c.beginPath();c.arc(bx,by,24,0,7);c.fill();c.fillStyle='#a5f3fc';c.beginPath();c.arc(bx,by,9,0,7);c.fill();
    var T=window.PHYS_DOMAIN.pendulumPeriod({lengthM:p.L,gravity:p.g});
    pl(c,'T='+F(T)+' s',26,26,'rgba(34,211,238,.12)','#22d3ee');pl(c,'θ='+F(st.th*180/Math.PI,1)+'°',26,56,'rgba(167,139,250,.12)','#a78bfa');
  },
  readout:function(p,st){var T=window.PHYS_DOMAIN.pendulumPeriod({lengthM:p.L,gravity:p.g});return[{k:'周期 T',v:F(T)+' s'},{k:'频率 f',v:F(1/T)+' Hz'},{k:'角频率 ω',v:F(Math.sqrt(p.g/p.L))+' rad/s'},{k:'当前摆角',v:F(st.th*180/Math.PI,1)+'°'},{k:'角速度',v:F(st.w)+' rad/s'},{k:'摆长 L',v:F(p.L,2)+' m'}];},
  tutor:function(p,st){var T=window.PHYS_DOMAIN.pendulumPeriod({lengthM:p.L,gravity:p.g});
    return '【模型】单摆回复力来自重力切向分量 −mg·sinθ。小角度时 sinθ≈θ。\n\n【参数】L='+F(p.L,2)+' m, g='+F(p.g,1)+' m/s², b='+F(p.b,2)+'\n\n【推演】\n· T=2π√(L/g)='+F(T)+' s\n· f='+F(1/T)+' Hz\n· ω='+F(Math.sqrt(p.g/p.L))+' rad/s\n· θ='+F(st.th*180/Math.PI,1)+'°\n\n【结论】'+(p.b>0.05?'阻尼 b='+F(p.b,2)+'，振幅按指数衰减。':'调大 b 观察阻尼振动。')+'\n\n【延伸】周期里没有摆球质量——伽利略的等时性。';}
});

/* 3. 弹簧振子 */
EXP.push({id:'p3',name:'弹簧振子与能量转化',cat:'物理',tags:['力学','能量'],brief:'弹性回复力 F=−kx 驱动的简谐振动，动能与弹性势能此消彼长。',resetOnChange:false,
  params:[P('m','质量 m',0.2,3,0.1,1,'kg'),P('k','劲度系数 k',5,80,1,30,'N/m')],
  formulas:['F=−k·x','a=−(k/m)·x','ω=√(k/m)','T=2π√(m/k)','E=½mv²+½kx²=常数'],
  init:function(){return{x:0.6,v:0,t:0};},
  step:function(p,dt,st){var n=6,h=dt/n;for(var i=0;i<n;i++){var a=-(p.k/p.m)*st.x;st.v+=a*h;st.x+=st.v*h;}st.t+=dt;},
  draw:function(c,W,H,p,st){var cy=H*0.42,wx=58;var sc=Math.min(160,(W/2-130)/0.72);var eqX=W/2+20,bw=72,bh=62;
    var bx=eqX+st.x*sc,left=bx-bw/2;
    c.fillStyle='#1b2740';c.fillRect(wx-22,cy-90,22,180);
    c.strokeStyle='#64748b';c.lineWidth=2.6;dSpr(c,wx,cy,left,cy,13,20);
    var grd=c.createLinearGradient(left,cy-bh/2,left+bw,cy+bh/2);grd.addColorStop(0,'#1e3a5f');grd.addColorStop(1,'#2a4d7a');
    c.fillStyle=grd;c.strokeStyle='#22d3ee';c.lineWidth=2;rr(c,left,cy-bh/2,bw,bh,8);c.fill();c.stroke();
    c.fillStyle='#a5f3fc';c.font='bold 12px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(p.m.toFixed(1)+' kg',bx,cy);
    c.strokeStyle='rgba(167,139,250,.35)';c.setLineDash([5,6]);c.lineWidth=1.4;c.beginPath();c.moveTo(eqX,cy-100);c.lineTo(eqX,cy+100);c.stroke();c.setLineDash([]);
    var E=0.5*p.k*st.x*st.x+0.5*p.m*st.v*st.v,ek=0.5*p.m*st.v*st.v,ep=0.5*p.k*st.x*st.x;
    var bw2=Math.min(300,W-160),bx2=(W-bw2)/2,by2=H-58;var rk=E>1e-9?ek/E:0,rp=E>1e-9?ep/E:0;
    c.fillStyle='#0a1220';rr(c,bx2,by2,bw2,16,8);c.fill();
    if(rk>0){c.fillStyle='rgba(52,211,153,.85)';rr(c,bx2,by2,bw2*rk,16,8);c.fill();}
    if(rp>0){c.fillStyle='rgba(251,191,36,.85)';rr(c,bx2+bw2*rk,by2,bw2*rp,16,8);c.fill();}
    c.strokeStyle='#1d2b45';c.lineWidth=1;rr(c,bx2,by2,bw2,16,8);c.stroke();
    lb(c,'动能 Ek',bx2,by2+30,'#34d399',10.5);lb(c,'弹性势能 Ep',bx2+bw2,by2+30,'#fbbf24',10.5,'right');
    pl(c,'E='+F(E,3)+' J',26,26,'rgba(34,211,238,.12)','#22d3ee');
  },
  readout:function(p,st){var T=2*Math.PI*Math.sqrt(p.m/p.k);return[{k:'周期 T',v:F(T)+' s'},{k:'角频率 ω',v:F(Math.sqrt(p.k/p.m))+' rad/s'},{k:'位移 x',v:F(st.x)+' m'},{k:'速度 v',v:F(st.v)+' m/s'},{k:'动能 Ek',v:F(0.5*p.m*st.v*st.v,3)+' J'},{k:'弹性势能 Ep',v:F(0.5*p.k*st.x*st.x,3)+' J'}];},
  tutor:function(p,st){var T=2*Math.PI*Math.sqrt(p.m/p.k);var ek=0.5*p.m*st.v*st.v,ep=0.5*p.k*st.x*st.x;
    return '【模型】F=−kx，a=−(k/m)x。\n\n【参数】m='+F(p.m,1)+' kg, k='+F(p.k,0)+' N/m\n\n【推演】\n· ω=√(k/m)='+F(Math.sqrt(p.k/p.m))+' rad/s\n· T='+F(T)+' s\n· x='+F(st.x)+' m, v='+F(st.v)+' m/s\n· Ek='+F(ek,3)+' J, Ep='+F(ep,3)+' J, E='+F(ek+ep,3)+' J\n\n【结论】'+(Math.abs(st.x)<0.05?'经过平衡位置：动能最大。':Math.abs(st.v)<0.05?'到达最大位移：全部能量为弹性势能。':'能量守恒流动中。');}
});

/* 4. 欧姆定律 */
EXP.push({id:'p4',name:'欧姆定律电路',cat:'物理',tags:['电学','电流'],brief:'电压驱动电荷定向移动形成电流，电阻阻碍电流，I=U/R。',resetOnChange:false,
  params:[P('U','电源电压 U',1,24,0.5,12,'V'),P('R','电阻 R',1,60,1,12,'Ω')],
  formulas:['I=U/R','P=U·I=I²R=U²/R','Q=I²R·t'],
  init:function(){return{s:0,t:0};},
  step:function(p,dt,st){var I=window.PHYS_DOMAIN.ohmsLaw({voltageV:p.U,resistanceOhm:p.R}).currentA;var sp=Math.min(0.55,I*0.035);st.s=(st.s+sp*dt)%1;st.t+=dt;},
  draw:function(c,W,H,p,st){var x0=W*0.16,x1=W*0.84,y0=78,y1=H-88,I=window.PHYS_DOMAIN.ohmsLaw({voltageV:p.U,resistanceOhm:p.R}).currentA,cy=(y0+y1)/2;
    c.strokeStyle='#3b5a80';c.lineWidth=4;c.lineJoin='round';c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y0);c.lineTo(x1,y1);c.lineTo(x0,y1);c.lineTo(x0,y0);c.stroke();
    c.strokeStyle='#fbbf24';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(x0-18,cy-11);c.lineTo(x0+18,cy-11);c.stroke();c.beginPath();c.moveTo(x0-10,cy+9);c.lineTo(x0+10,cy+9);c.stroke();
    var rw=104,rh=34;c.fillStyle='#0e1626';rr(c,W/2-rw/2,y0-rh/2,rw,rh,6);c.fill();
    c.strokeStyle='#a78bfa';c.lineWidth=2.4;rr(c,W/2-rw/2,y0-rh/2,rw,rh,6);c.stroke();
    c.fillStyle='#c4b5fd';c.font='bold 13px Menlo,monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(p.R.toFixed(0)+' Ω',W/2,y0);
    for(var i=0;i<64;i++){var ss=(st.s+i/64)%1;var p2=ptR(ss,x0,y0,x1,y1);
      var gr=c.createRadialGradient(p2[0],p2[1],0,p2[0],p2[1],7);gr.addColorStop(0,'rgba(56,189,248,1)');gr.addColorStop(1,'rgba(56,189,248,0)');
      c.fillStyle=gr;c.beginPath();c.arc(p2[0],p2[1],7,0,7);c.fill();c.fillStyle='#7dd3fc';c.beginPath();c.arc(p2[0],p2[1],2.4,0,7);c.fill();}
    pl(c,'I='+F(I,3)+' A',26,22,'rgba(244,114,182,.14)','#f472b6');pl(c,'P='+F(p.U*I,2)+' W',26,52,'rgba(52,211,153,.14)','#34d399');pl(c,'U='+F(p.U,1)+' V',26,82,'rgba(251,191,36,.14)','#fbbf24');
  },
  readout:function(p){var I=window.PHYS_DOMAIN.ohmsLaw({voltageV:p.U,resistanceOhm:p.R}).currentA;return[{k:'电流 I',v:F(I,3)+' A'},{k:'电功率 P',v:F(p.U*I,2)+' W'},{k:'1分钟发热',v:F(I*I*p.R*60,1)+' J'},{k:'电阻 R',v:F(p.R,0)+' Ω'},{k:'电压 U',v:F(p.U,1)+' V'},{k:'每秒电荷',v:F(I,3)+' C'}];},
  tutor:function(p){var I=window.PHYS_DOMAIN.ohmsLaw({voltageV:p.U,resistanceOhm:p.R}).currentA;return '【模型】I=U/R，P=UI。\n\n【参数】U='+F(p.U,1)+' V, R='+F(p.R,0)+' Ω\n\n【推演】\n· I=U/R='+F(I,3)+' A\n· P='+F(p.U*I,2)+' W\n· Q=I²Rt='+F(I*I*p.R*60,1)+' J (60s)\n\n【结论】'+(p.R<5?'电阻很小，电流大，发热惊人——这就是短路。':p.R>40?'电阻大，电流被限制。':'电压翻倍→电流翻倍→功率4倍。');}
});

/* 5. 斜面运动 */
EXP.push({id:'p5',name:'斜面滑动与摩擦力',cat:'物理',tags:['力学','摩擦'],brief:'重力分解、法向支持力与摩擦力共同决定物体在斜面上的运动状态。',resetOnChange:true,
  params:[P('theta','斜面倾角 θ',8,60,1,30,'°'),P('mu','动摩擦因数 μ',0,0.8,0.02,0.2,''),P('m','物体质量 m',1,10,0.5,3,'kg')],
  formulas:['ma=mg·sinθ−μ·mg·cosθ','a=g(sinθ−μ·cosθ)','临界 tanθ=μ','f=μ·m·g·cosθ'],
  init:function(){return{s:4,v:0,hold:0,t:0};},
  step:function(p,dt,st){var th=p.theta*Math.PI/180;var a=window.PHYS_DOMAIN.inclinedPlaneAcceleration({angleDeg:p.theta,frictionCoefficient:p.mu,gravity:9.8});
    if(a>0.01){st.v+=a*dt;st.s-=st.v*dt;if(st.s<=0.32){st.s=0.32;st.v=0;st.hold+=dt;if(st.hold>1.4){st.s=4;st.v=0;st.hold=0;}}}
    st.t+=dt;},
  draw:function(c,W,H,p,st){var th=p.theta*Math.PI/180;var gy=H-72,ox=112;
    var mxH=gy-80;var Lpx=Math.min(430,W-ox-170,mxH/Math.max(Math.sin(th),0.18));var PPM=Lpx/4;
    var topX=ox+Lpx*Math.cos(th),topY=gy-Lpx*Math.sin(th);
    c.strokeStyle='#1f6f66';c.lineWidth=3;c.beginPath();c.moveTo(40,gy);c.lineTo(W-20,gy);c.stroke();
    c.beginPath();c.moveTo(ox,gy);c.lineTo(topX,topY);c.lineTo(topX,gy);c.closePath();
    var gg=c.createLinearGradient(ox,gy,topX,topY);gg.addColorStop(0,'rgba(30,58,95,.75)');gg.addColorStop(1,'rgba(20,38,66,.55)');
    c.fillStyle=gg;c.fill();c.strokeStyle='#3b5a80';c.lineWidth=2;c.stroke();
    c.strokeStyle='#22d3ee';c.lineWidth=2;c.beginPath();c.arc(ox,gy,62,-th,0);c.stroke();
    lb(c,p.theta+'°',ox+74,gy-16,'#22d3ee',12);
    var bx=ox+st.s*Math.cos(th)*PPM,by=gy-st.s*Math.sin(th)*PPM;var bw=46,bh=38;
    c.save();c.translate(bx,by);c.rotate(-th);
    var bg=c.createLinearGradient(-bw/2,-bh,bw/2,0);bg.addColorStop(0,'#7c2d12');bg.addColorStop(1,'#b45309');
    c.fillStyle=bg;c.strokeStyle='#fbbf24';c.lineWidth=2;rr(c,-bw/2,-bh,bw,bh,6);c.fill();c.stroke();c.restore();
    var a=window.PHYS_DOMAIN.inclinedPlaneAcceleration({angleDeg:p.theta,frictionCoefficient:p.mu,gravity:9.8});
    var stat=a>0.01?(st.v>0.05?'加速下滑':'即将下滑'):'保持静止';
    var col=a>0.01?'#f472b6':'#34d399';
    pl(c,'状态：'+stat,26,22,'rgba(255,255,255,.05)',col);
    pl(c,'tanθ='+F(Math.tan(th),3)+'  μ='+F(p.mu,2),26,52,'rgba(255,255,255,.05)',Math.tan(th)>p.mu?'#f472b6':'#34d399');
  },
  readout:function(p,st){var th=p.theta*Math.PI/180;var a=9.8*(Math.sin(th)-p.mu*Math.cos(th));return[{k:'加速度 a',v:F(Math.max(a,0),2)+' m/s²'},{k:'当前速度 v',v:F(st.v,2)+' m/s'},{k:'沿面位移',v:F(4-st.s,2)+' m'},{k:'重力分量',v:F(p.m*9.8*Math.sin(th),1)+' N'},{k:'摩擦力 f',v:F(p.mu*p.m*9.8*Math.cos(th),1)+' N'},{k:'临界角 arctanμ',v:F(Math.atan(p.mu)*180/Math.PI,1)+'°'}];},
  tutor:function(p,st){var th=p.theta*Math.PI/180;var a=9.8*(Math.sin(th)-p.mu*Math.cos(th));var cr=Math.atan(p.mu)*180/Math.PI;
    return '【模型】力的正交分解：重力拆成 mg·sinθ（下滑）和 mg·cosθ（压面）。\n\n【参数】θ='+p.theta+'°, μ='+F(p.mu,2)+', m='+F(p.m,1)+' kg\n\n【推演】\n· mg·sinθ='+F(p.m*9.8*Math.sin(th),1)+' N\n· N='+F(p.m*9.8*Math.cos(th),1)+' N\n· f=μN='+F(p.mu*p.m*9.8*Math.cos(th),1)+' N\n· a='+F(Math.max(a,0),2)+' m/s²\n· 临界角='+F(cr,1)+'°\n\n【结论】'+(a>0.01?'θ>临界角，加速下滑。':'θ<临界角，自锁。')+'\n\n【延伸】加速度与质量无关！';}
});

/* 6. 理想气体 */
EXP.push({id:'p6',name:'理想气体分子运动',cat:'化学',tags:['气体','热力学'],brief:'分子无规则热运动撞击器壁产生压强，PV=nRT 严格联系。',resetOnChange:false,
  params:[P('T','热力学温度 T',100,900,10,300,'K'),P('V','体积 V',2,20,0.5,10,'L'),P('n','物质的量 n',0.2,2,0.1,1,'mol')],
  formulas:['PV=nRT','R=8.314 J/(mol·K)','Ēk=(3/2)kT','v_rms=√(3RT/M)'],
  init:function(){var ps=[];for(var i=0;i<80;i++){var a=Math.random()*Math.PI*2;ps.push({x:Math.random(),y:Math.random(),vx:Math.cos(a),vy:Math.sin(a)});}return{ps:ps,t:0};},
  step:function(p,dt,st){var sp=0.30*Math.sqrt(p.T/300);for(var i=0;i<st.ps.length;i++){var pt=st.ps[i];
    pt.x+=pt.vx*sp*dt;pt.y+=pt.vy*sp*dt;
    if(pt.x<0){pt.x=-pt.x;pt.vx*=-1;}if(pt.x>1){pt.x=2-pt.x;pt.vx*=-1;}
    if(pt.y<0){pt.y=-pt.y;pt.vy*=-1;}if(pt.y>1){pt.y=2-pt.y;pt.vy*=-1;}}
    st.t+=dt;},
  draw:function(c,W,H,p,st){var bh=Math.min(H-170,290);var bw=C(100+(W-340)*(p.V-2)/18,100,Math.max(120,W-280));
    var bx=(W-bw)/2,by=(H-bh)/2+16;
    c.fillStyle='rgba(12,22,40,.85)';rr(c,bx,by,bw,bh,10);c.fill();
    c.strokeStyle='rgba(34,211,238,.55)';c.lineWidth=2.5;rr(c,bx,by,bw,bh,10);c.stroke();
    var hue=210-C((p.T-100)/800,0,1)*210;var r=3.1;
    for(var j=0;j<st.ps.length;j++){var pt=st.ps[j];var x=bx+pt.x*bw,y=by+pt.y*bh;
      var gr=c.createRadialGradient(x,y,0,x,y,r*3.4);gr.addColorStop(0,'hsla('+hue+',90%,72%,1)');gr.addColorStop(1,'hsla('+hue+',90%,60%,0)');
      c.fillStyle=gr;c.beginPath();c.arc(x,y,r*3.4,0,7);c.fill();c.fillStyle='hsl('+hue+',95%,82%)';c.beginPath();c.arc(x,y,r,0,7);c.fill();}
    var P=p.n*8.314*p.T/p.V;
    pl(c,'P='+F(P,1)+' kPa',26,22,'rgba(244,114,182,.12)','#f472b6');
    pl(c,'PV='+F(P*p.V,0)+' kPa·L',26,52,'rgba(34,211,238,.12)','#22d3ee');
    pl(c,'nRT='+F(p.n*8.314*p.T,0)+' J',26,82,'rgba(52,211,153,.12)','#34d399');
    lb(c,'V='+F(p.V,1)+' L',bx+bw/2,by+bh+26,'#22d3ee',12,'center');
  },
  readout:function(p){var P=window.PHYS_DOMAIN.idealGasPressure({amountMol:p.n,temperatureK:p.T,volumeM3:p.V/1000})/1000;var vR=Math.sqrt(3*8.314*p.T/0.028);return[{k:'压强 P',v:F(P,1)+' kPa'},{k:'PV 乘积',v:F(P*p.V,0)+' kPa·L'},{k:'nRT',v:F(p.n*8.314*p.T,0)+' J'},{k:'方均根速率',v:F(vR,0)+' m/s'},{k:'平均动能',v:F(1.5*1.381e-23*p.T*1e21,2)+'×10⁻²¹ J'},{k:'分子数密度',v:F(p.n*6.022e23/(p.V*1e-3)/1e25,2)+'×10²⁵/m³'}];},
  tutor:function(p){var P=window.PHYS_DOMAIN.idealGasPressure({amountMol:p.n,temperatureK:p.T,volumeM3:p.V/1000})/1000;var vR=Math.sqrt(3*8.314*p.T/0.028);
    return '【模型】理想气体：分子无体积、无相互作用。压强来自分子撞击器壁。\n\n【参数】T='+p.T+' K, V='+F(p.V,1)+' L, n='+F(p.n,1)+' mol\n\n【推演】\n· P=nRT/V='+F(P,1)+' kPa\n· PV='+F(P*p.V,0)+' kPa·L\n· nRT='+F(p.n*8.314*p.T,0)+' J\n· v_rms='+F(vR,0)+' m/s\n\n【结论】'+(p.T>600?'高温，分子运动剧烈。':p.T<200?'低温，分子迟缓。':'P·V/(n·T) 始终=8.314，这就是 R 的物理意义。')+'\n\n【延伸】波义耳定律：T不变 P∝1/V。';}
});

/* 7. 酸碱滴定 */
EXP.push({id:'p7',name:'酸碱滴定曲线',cat:'化学',tags:['分析化学','pH'],brief:'强酸强碱滴定过程中 pH 的突变规律，是定量分析的核心工具。',resetOnChange:true,
  params:[P('ca','酸的浓度 c(酸)',0.01,0.5,0.01,0.1,'mol/L'),P('va','酸的体积 V(酸)',10,50,1,20,'mL'),P('cb','碱的浓度 c(碱)',0.01,1,0.01,0.1,'mol/L')],
  formulas:['V_eq=c(酸)·V(酸)/c(碱)','当量点前 [H⁺]=(n酸−n碱)/V总','当量点后 pOH=−lg[(n碱−n酸)/V总]','当量点 pH=7.00'],
  init:function(){return{Vb:0,t:0};},
  step:function(p,dt,st){var Veq=p.ca*p.va/p.cb;var Vm=Veq*1.9;st.Vb+=Vm/9*dt;if(st.Vb>Vm)st.Vb=0;st.t+=dt;},
  pHAt:function(Vb,p){var nA=p.ca*p.va/1000;var nB=p.cb*Vb/1000;var Vt=(p.va+Vb)/1000;var df=nA-nB;
    if(Math.abs(df)<1e-12)return 7;
    if(df>0)return C(-Math.log10(df/Vt),0,14);
    return C(14-(-Math.log10(-df/Vt)),0,14);},
  pHC:function(ph){if(ph<3)return'#ef4444';if(ph<5)return'#f97316';if(ph<6.5)return'#facc15';if(ph<7.5)return'#4ade80';if(ph<9)return'#38bdf8';if(ph<11)return'#818cf8';return'#c084fc';},
  draw:function(c,W,H,p,st){var self=this;var Veq=p.ca*p.va/p.cb;var Vm=Veq*1.9;
    var gx0=66,gx1=Math.max(W-260,220);var gy0=54,gy1=H-66;
    var V2x=function(v){return gx0+(v/Vm)*(gx1-gx0);};
    var pH2y=function(ph){return gy1-(ph/14)*(gy1-gy0);};
    c.strokeStyle='rgba(120,160,220,.09)';c.lineWidth=1;
    for(var ph=0;ph<=14;ph+=2){var y=pH2y(ph);c.beginPath();c.moveTo(gx0,y);c.lineTo(gx1,y);c.stroke();lb(c,String(ph),gx0-10,y,'#5a6d87',10,'right');}
    c.strokeStyle='rgba(34,211,238,.45)';c.lineWidth=2;c.beginPath();c.moveTo(gx0,gy0);c.lineTo(gx0,gy1);c.lineTo(gx1,gy1);c.stroke();
    lb(c,'pH',gx0-6,gy0-16,'#22d3ee',11.5);lb(c,'V(碱)/mL',gx1,gy1+30,'#22d3ee',11.5,'right');
    c.beginPath();for(var j=0;j<=600;j++){var vv=Vm*j/600;var xx=V2x(vv),yy=pH2y(self.pHAt(vv,p));j?c.lineTo(xx,yy):c.moveTo(xx,yy);}
    c.strokeStyle='rgba(167,139,250,.85)';c.lineWidth=2.4;c.stroke();
    var ex=V2x(Veq),ey=pH2y(7);
    c.strokeStyle='rgba(251,191,36,.55)';c.setLineDash([5,5]);c.lineWidth=1.4;c.beginPath();c.moveTo(ex,gy1);c.lineTo(ex,ey);c.lineTo(gx0,ey);c.stroke();c.setLineDash([]);
    c.fillStyle='#fbbf24';c.beginPath();c.arc(ex,ey,5,0,7);c.fill();
    var cx=V2x(st.Vb),cy=pH2y(self.pHAt(st.Vb,p));
    var cg=c.createRadialGradient(cx-3,cy-3,1,cx,cy,15);cg.addColorStop(0,'#fff');cg.addColorStop(.4,'#34d399');cg.addColorStop(1,'rgba(52,211,153,0)');
    c.fillStyle=cg;c.beginPath();c.arc(cx,cy,15,0,7);c.fill();c.fillStyle='#a7f3d0';c.beginPath();c.arc(cx,cy,5.5,0,7);c.fill();
    var bx=W-215,by=gy0+40,bw=120,bh=Math.min(gy1-by-40,180);
    var ph2=self.pHAt(st.Vb,p);var col=self.pHC(ph2);
    c.strokeStyle='rgba(160,190,225,.4)';c.lineWidth=2;c.beginPath();c.moveTo(bx,by);c.lineTo(bx,by+bh);c.lineTo(bx+bw,by+bh);c.lineTo(bx+bw,by);c.stroke();
    var ff=C((p.va+st.Vb)/(p.va+Vm),0.12,1);var lh=bh*ff;
    var lg=c.createLinearGradient(bx,by+bh-lh,bx,by+bh);lg.addColorStop(0,col+'aa');lg.addColorStop(1,col+'55');
    c.fillStyle=lg;c.fillRect(bx+2,by+bh-lh,bw-4,lh);
    lb(c,'pH='+F(ph2,2),bx+bw/2,by+bh+18,col,13,'center');
    pl(c,'V_eq='+F(Veq,2)+' mL',26,20,'rgba(251,191,36,.12)','#fbbf24');
    pl(c,'V='+F(st.Vb,2)+' mL',26,50,'rgba(52,211,153,.12)','#34d399');
  },
  readout:function(p,st){var Veq=p.ca*p.va/p.cb;var ph=this.pHAt(st.Vb,p);return[{k:'当量点 V_eq',v:F(Veq,2)+' mL'},{k:'当前体积 V',v:F(st.Vb,2)+' mL'},{k:'当前 pH',v:F(ph,2)},{k:'酸的物质的量',v:F(p.ca*p.va,3)+' mmol'},{k:'已加碱量',v:F(p.cb*st.Vb,3)+' mmol'},{k:'滴定进度',v:F(C(st.Vb/Veq*100,0,200),1)+' %'}];},
  tutor:function(p,st){var Veq=p.ca*p.va/p.cb;var ph=this.pHAt(st.Vb,p);var r=st.Vb/Veq;var sg;
    if(r<0.9)sg='滴定初期——酸大量过量，pH 上升缓慢。';
    else if(r<0.999)sg='接近当量点——剩余酸量急剧减少，pH 开始爬坡。';
    else if(r<1.001)sg='当量点附近——pH≈7.00。';
    else sg='超过当量点——碱过量，pH 迅速跃升。';
    return '【模型】滴定曲线记录"加入滴定剂体积"与"溶液 pH"的对应关系。\n\n【参数】c(酸)='+F(p.ca,2)+' mol/L, V(酸)='+p.va+' mL, c(碱)='+F(p.cb,2)+' mol/L\n\n【推演】\n· V_eq='+F(Veq,2)+' mL\n· V='+F(st.Vb,2)+' mL ('+F(C(r*100,0,200),1)+'%)\n· pH='+F(ph,2)+'\n\n【阶段】'+sg+'\n\n【延伸】弱酸滴定当量点 pH>7，有"缓冲平台"。';}
});

/* 8. 反应速率 */
EXP.push({id:'p8',name:'化学反应速率与活化能',cat:'化学',tags:['动力学','阿伦尼乌斯'],brief:'温度、浓度与催化剂如何影响反应速率——阿伦尼乌斯方程。',resetOnChange:false,
  params:[P('T','温度 T',20,90,1,25,'°C'),P('c','反应物浓度 c',0.1,2,0.05,1,'mol/L'),{key:'cat',label:'催化剂',min:0,max:1,step:1,value:0,unit:'',fmt:function(v){return v?'有':'无';}}],
  formulas:['v=k·c(A)','k=A·e^(−Ea/RT)','无催化剂 Ea=70 kJ/mol','有催化剂 Ea=40 kJ/mol'],
  init:function(){var ps=[];for(var i=0;i<50;i++){var a=Math.random()*Math.PI*2;
    ps.push({x:0.08+Math.random()*0.84,y:0.08+Math.random()*0.84,vx:Math.cos(a),vy:Math.sin(a),r:2.6+Math.random()*1.8});}
    return{ps:ps,flashes:[],count:0,t:0};},
  step:function(p,dt,st){var sp=0.26*Math.sqrt((p.T+273.15)/298);
    for(var i=0;i<st.ps.length;i++){var pt=st.ps[i];pt.x+=pt.vx*sp*dt;pt.y+=pt.vy*sp*dt;
      if(pt.x<0.06){pt.x=0.06;pt.vx*=-1;}if(pt.x>0.94){pt.x=0.94;pt.vx*=-1;}
      if(pt.y<0.06){pt.y=0.06;pt.vy*=-1;}if(pt.y>0.94){pt.y=0.94;pt.vy*=-1;}}
    var Tk=p.T+273.15;var Ea=(p.cat?40:70)*1000;var k=window.PHYS_DOMAIN.arrheniusRateConstant({preExponentialFactor:1,activationEnergyJPerMol:Ea,temperatureK:Tk});
    var vis=C((Math.log10(k*p.c*1e10)+3)/6,0,1);
    if(Math.random()<vis*1.6*dt*10&&st.flashes.length<26){var a=Math.random()*Math.PI*2,r=Math.random()*0.35;
      st.flashes.push({x:0.5+Math.cos(a)*r,y:0.5+Math.sin(a)*r,life:1});st.count++;}
    for(var j=st.flashes.length-1;j>=0;j--){st.flashes[j].life-=dt*1.5;if(st.flashes[j].life<=0)st.flashes.splice(j,1);}
    st.t+=dt;},
  draw:function(c,W,H,p,st){var bh=Math.min(H-170,286);var bw=Math.min(W-220,520);
    var bx=(W-bw)/2-40,by=(H-bh)/2+14;
    c.fillStyle='rgba(12,22,40,.85)';rr(c,bx,by,bw,bh,10);c.fill();
    c.strokeStyle='rgba(167,139,250,.5)';c.lineWidth=2.5;rr(c,bx,by,bw,bh,10);c.stroke();
    var hue=p.cat?280:200;
    for(var i=0;i<st.ps.length;i++){var pt=st.ps[i];var x=bx+pt.x*bw,y=by+pt.y*bh;
      var gr=c.createRadialGradient(x,y,0,x,y,pt.r*3.2);gr.addColorStop(0,'hsla('+hue+',90%,72%,.95)');gr.addColorStop(1,'hsla('+hue+',90%,60%,0)');
      c.fillStyle=gr;c.beginPath();c.arc(x,y,pt.r*3.2,0,7);c.fill();c.fillStyle='hsl('+hue+',95%,84%)';c.beginPath();c.arc(x,y,pt.r,0,7);c.fill();}
    for(var j=0;j<st.flashes.length;j++){var f=st.flashes[j];var fx=bx+f.x*bw,fy=by+f.y*bh;
      var fg=c.createRadialGradient(fx,fy,0,fx,fy,30*f.life);fg.addColorStop(0,'rgba(52,211,153,'+f.life+')');fg.addColorStop(1,'rgba(52,211,153,0)');
      c.fillStyle=fg;c.beginPath();c.arc(fx,fy,30*f.life,0,7);c.fill();}
    var Tk=p.T+273.15;var Ea=(p.cat?40:70)*1000;var k=window.PHYS_DOMAIN.arrheniusRateConstant({preExponentialFactor:1,activationEnergyJPerMol:Ea,temperatureK:Tk});var rt=k*p.c*1e10;
    pl(c,'相对速率='+(rt<0.01?F(rt,4):F(rt,2)),26,20,'rgba(52,211,153,.12)','#34d399');
    pl(c,'Ea='+(p.cat?40:70)+' kJ/mol',26,50,'rgba(244,114,182,.12)','#f472b6');
    pl(c,'碰撞 '+st.count+' 次',26,80,'rgba(34,211,238,.12)','#22d3ee');
  },
  readout:function(p,st){var Tk=p.T+273.15;var Ea=(p.cat?40:70)*1000;var k=window.PHYS_DOMAIN.arrheniusRateConstant({preExponentialFactor:1,activationEnergyJPerMol:Ea,temperatureK:Tk});var rt=k*p.c*1e10;
    return[{k:'活化能 Ea',v:(p.cat?40:70)+' kJ/mol'},{k:'温度（绝对）',v:F(Tk,1)+' K'},{k:'速率常数 k',v:k.toExponential(2)},{k:'反应速率 v',v:rt<0.01?F(rt,4):F(rt,2)},{k:'碰撞次数',v:String(st.count)},{k:'催化剂',v:p.cat?'有':'无'}];},
  tutor:function(p,st){var Tk=p.T+273.15;var Ea=(p.cat?40:70)*1000;var k=window.PHYS_DOMAIN.arrheniusRateConstant({preExponentialFactor:1,activationEnergyJPerMol:Ea,temperatureK:Tk});var rt=k*p.c*1e10;
    return '【模型】k=A·e^(−Ea/RT)：只有能量超过 Ea 的分子碰撞才能引发反应。\n\n【参数】T='+p.T+'°C ('+F(Tk,1)+' K), c='+F(p.c,2)+' mol/L, 催化剂：'+(p.cat?'有':'无')+'\n\n【推演】\n· Ea='+(p.cat?40:70)+' kJ/mol\n· k='+k.toExponential(3)+'\n· v='+(rt<0.01?F(rt,4):F(rt,2))+'\n· 累计碰撞='+st.count+'\n\n【结论】'+(p.cat?'催化剂把 Ea 从 70 降到 40 kJ/mol，速率提升多个数量级。':p.T>60?'高温下越过能垒的分子比例显著增加。':'试着打开催化剂或提高温度，观察反应闪光频率变化。')+'\n\n【延伸】温度每升高 10 K，速率约提高 2~4 倍。';}
});

/* ============================================================
   92 个配置驱动实验
   ============================================================ */

/* -------- 力学/运动（15个）-------- */
var M=[
{id:'m1',name:'自由落体运动',tags:['力学','重力'],br:'在重力作用下，物体从静止开始的下落运动——伽利略的经典发现。',
 p:[P('h','初始高度 h',5,100,1,45,'m'),P('g','重力加速度 g',1.6,20,0.1,9.8,'m/s²')],
 f:['v=g·t','h=½g·t²','落地速度 v=√(2gh)','下落时间 t=√(2h/g)'],
 dur:function(p){return Math.sqrt(2*p.h/p.g);},
 pos:function(p,t,W,H){var T=Math.sqrt(2*p.h/p.g);var tt=Math.min(t,T);var y=0.5*p.g*tt*tt;return{x:W/2,y:60+(y/p.h)*(H-120)};},
 col:'#22d3ee',
 ro:function(p){var T=Math.sqrt(2*p.h/p.g);return[{k:'下落时间 t',v:F(T,2)+' s'},{k:'落地速度 v',v:F(p.g*T,1)+' m/s'},{k:'初始高度',v:F(p.h,1)+' m'},{k:'加速度 g',v:F(p.g,1)+' m/s²'},{k:'落地动能(1kg)',v:F(0.5*p.g*p.g*T*T,1)+' J'},{k:'总路程',v:F(p.h,1)+' m'}];},
 tt:function(p){var T=Math.sqrt(2*p.h/p.g);return'【模型】自由落体：初速为零、加速度 g 的匀加速直线运动。\n\n【参数】h='+p.h+' m, g='+p.g+' m/s²\n\n【推演】\n· t=√(2h/g)='+F(T,2)+' s\n· v=g·t='+F(p.g*T,1)+' m/s\n\n【结论】伽利略用斜面"冲淡"重力，证明轻重物体下落加速度相同。真空中羽毛和铁球同时落地！';}},

{id:'m2',name:'竖直上抛运动',tags:['力学','抛体'],br:'竖直上抛是匀减速上升和自由落体下降的组合，最高点速度为零。',
 p:[P('v0','初速度 v₀',5,50,1,20,'m/s'),P('g','重力加速度 g',1.6,20,0.1,9.8,'m/s²')],
 f:['v(t)=v₀−g·t','h(t)=v₀·t−½g·t²','上升时间 t=v₀/g','最大高度 H=v₀²/(2g)'],
 dur:function(p){return 2*p.v0/p.g;},
 pos:function(p,t,W,H){var T=2*p.v0/p.g;var tt=Math.min(t%T,T);var y=p.v0*tt-0.5*p.g*tt*tt;var mH=p.v0*p.v0/(2*p.g);return{x:W/2,y:60+(1-y/mH)*(H-120)};},
 col:'#fbbf24',
 ro:function(p){var T=p.v0/p.g;return[{k:'上升时间 t',v:F(T,2)+' s'},{k:'最大高度 H',v:F(p.v0*p.v0/(2*p.g),2)+' m'},{k:'总飞行时间',v:F(2*T,2)+' s'},{k:'初速度 v₀',v:p.v0+' m/s'},{k:'落地速度',v:F(p.v0,1)+' m/s'},{k:'重力加速度',v:F(p.g,1)+' m/s²'}];},
 tt:function(p){var T=p.v0/p.g;return'【模型】上升阶段匀减速，下降阶段自由落体。\n\n【参数】v₀='+p.v0+' m/s, g='+p.g+' m/s²\n\n【推演】\n· 上升时间='+F(T,2)+' s\n· 最大高度='+F(p.v0*p.v0/(2*p.g),2)+' m\n· 总飞行时间='+F(2*T,2)+' s\n\n【结论】上升和下降过程完全对称。';}},

{id:'m3',name:'圆周运动与向心力',tags:['力学','圆周'],br:'物体做圆周运动需要指向圆心的向心力 F=mv²/r。',
 p:[P('v','线速度 v',1,15,0.5,5,'m/s'),P('r','半径 r',0.3,2,0.05,1,'m')],
 f:['F=mv²/r','a=v²/r','T=2πr/v','ω=v/r'],
 dur:function(p){return 2*Math.PI*p.r/p.v;},
 pos:function(p,t,W,H){var ang=t*p.v/p.r;var R=Math.min(W,H)*0.3*p.r;return{x:W/2+R*Math.cos(ang),y:H/2+R*Math.sin(ang)};},
 col:'#f472b6',gr:false,
 ex:function(c,W,H,p,st,pt){c.strokeStyle='rgba(167,139,250,.3)';c.lineWidth=1.5;c.setLineDash([5,5]);
   c.beginPath();c.arc(W/2,H/2,Math.min(W,H)*0.3*p.r,0,7);c.stroke();c.setLineDash([]);
   c.strokeStyle='#f472b6';c.lineWidth=2;c.beginPath();c.moveTo(W/2,H/2);c.lineTo(pt.x,pt.y);c.stroke();
   c.fillStyle='#22d3ee';c.beginPath();c.arc(W/2,H/2,5,0,7);c.fill();},
 ro:function(p){return[{k:'向心加速度 a',v:F(p.v*p.v/p.r,2)+' m/s²'},{k:'向心力(1kg)',v:F(p.v*p.v/p.r,2)+' N'},{k:'周期 T',v:F(2*Math.PI*p.r/p.v,2)+' s'},{k:'角速度 ω',v:F(p.v/p.r,2)+' rad/s'},{k:'频率 f',v:F(p.v/(2*Math.PI*p.r),2)+' Hz'},{k:'半径 r',v:F(p.r,2)+' m'}];},
 tt:function(p){return'【模型】圆周运动加速度总指向圆心，a=v²/r。\n\n【推演】\n· a=v²/r='+F(p.v*p.v/p.r,2)+' m/s²\n· F=ma='+F(p.v*p.v/p.r,2)+' N (1kg)\n· T=2πr/v='+F(2*Math.PI*p.r/p.v,2)+' s\n\n【结论】向心力不是"额外的力"，而是由重力、支持力、摩擦力、拉力等提供的合力的法向分量。';}},

{id:'m4',name:'平抛运动',tags:['力学','抛体'],br:'水平抛出的物体做平抛运动，水平匀速、竖直自由落体。',
 p:[P('v0','水平速度 v₀',2,30,1,15,'m/s'),P('h','抛出高度 h',5,60,1,30,'m'),P('g','重力加速度 g',1.6,20,0.1,9.8,'m/s²')],
 f:['x=v₀·t','y=½g·t²','t=√(2h/g)','R=v₀·√(2h/g)'],
 dur:function(p){return Math.sqrt(2*p.h/p.g)*1.5;},
 pos:function(p,t,W,H){var T=Math.sqrt(2*p.h/p.g);var tt=Math.min(t,T);
   var fx=tt*p.v0,fy=0.5*p.g*tt*tt;
   var xs=(W-140)/Math.max(p.v0*T,1),ys=(H-140)/p.h;
   return{x:80+fx*xs,y:60+fy*ys};},
 col:'#a78bfa',
 ro:function(p){var T=Math.sqrt(2*p.h/p.g);return[{k:'下落时间 t',v:F(T,2)+' s'},{k:'水平射程 R',v:F(p.v0*T,2)+' m'},{k:'落地 vx',v:p.v0+' m/s'},{k:'落地 vy',v:F(p.g*T,1)+' m/s'},{k:'合速度',v:F(Math.sqrt(p.v0*p.v0+p.g*p.g*T*T),1)+' m/s'},{k:'抛出高度',v:F(p.h,1)+' m'}];},
 tt:function(p){var T=Math.sqrt(2*p.h/p.g);return'【模型】平抛=水平匀速⊕竖直自由落体。\n\n【推演】\n· t=√(2h/g)='+F(T,2)+' s\n· R=v₀·t='+F(p.v0*T,2)+' m\n· vx='+p.v0+' m/s（恒定）\n· vy=g·t='+F(p.g*T,1)+' m/s\n\n【结论】子弹水平射出和同时自由落体，会同时落地。';}},

{id:'m5',name:'斜抛运动',tags:['力学','抛体'],br:'斜抛运动是水平匀速与竖直匀变速的组合，45°时射程最大。',
 p:[P('v0','初速度 v₀',5,50,1,25,'m/s'),P('ang','发射角 θ',10,80,1,60,'°'),P('g','重力加速度 g',1.6,20,0.1,9.8,'m/s²')],
 f:['x=v₀cosθ·t','y=v₀sinθ·t−½g·t²','R=v₀²sin2θ/g','H=v₀²sin²θ/(2g)'],
 dur:function(p){var r=p.ang*Math.PI/180;return 2*p.v0*Math.sin(r)/p.g;},
 pos:function(p,t,W,H){var r=p.ang*Math.PI/180;var T=2*p.v0*Math.sin(r)/p.g;var tt=Math.min(t,T);
   var x=p.v0*Math.cos(r)*tt,y=p.v0*Math.sin(r)*tt-0.5*p.g*tt*tt;
   var R=p.v0*p.v0*Math.sin(2*r)/p.g,Hm=p.v0*p.v0*Math.sin(r)*Math.sin(r)/(2*p.g);
   var xs=(W-140)/Math.max(R,1),ys=(H-140)/Math.max(Hm,1);
   return{x:70+x*xs,y:70+Hm*ys-y*ys};},
 col:'#34d399',
 ro:function(p){var r=p.ang*Math.PI/180;var T=2*p.v0*Math.sin(r)/p.g;return[{k:'飞行时间 T',v:F(T,2)+' s'},{k:'射程 R',v:F(p.v0*p.v0*Math.sin(2*r)/p.g,2)+' m'},{k:'最大高度 H',v:F(p.v0*p.v0*Math.sin(r)*Math.sin(r)/(2*p.g),2)+' m'},{k:'水平分速度',v:F(p.v0*Math.cos(r),2)+' m/s'},{k:'竖直分速度',v:F(p.v0*Math.sin(r),2)+' m/s'},{k:'发射角 θ',v:p.ang+'°'}];},
 tt:function(p){var r=p.ang*Math.PI/180;var T=2*p.v0*Math.sin(r)/p.g;return'【模型】斜抛=水平匀速⊕竖直上抛。\n\n【推演】\n· T='+F(T,2)+' s\n· R='+F(p.v0*p.v0*Math.sin(2*r)/p.g,2)+' m\n· H='+F(p.v0*p.v0*Math.sin(r)*Math.sin(r)/(2*p.g),2)+' m\n\n【结论】θ=45°射程最大；30°和60°射程相同但高度不同。';}},

{id:'m6',name:'匀速直线运动',tags:['力学','运动'],br:'速度恒定的直线运动，位移与时间成正比。',
 p:[P('v','速度 v',1,30,0.5,10,'m/s'),P('L','总路程 L',10,200,5,100,'m')],
 f:['x=v·t','t=L/v'],
 dur:function(p){return p.L/p.v;},
 pos:function(p,t,W,H){var T=p.L/p.v;var tt=Math.min(t%T,T);var x=tt*p.v;return{x:60+(x/p.L)*(W-120),y:H/2};},
 col:'#60a5fa',
 ro:function(p){var T=p.L/p.v;return[{k:'总时间 T',v:F(T,2)+' s'},{k:'速度 v',v:p.v+' m/s'},{k:'总路程 L',v:p.L+' m'},{k:'每秒位移',v:F(p.v,2)+' m'},{k:'平均速度',v:F(p.v,2)+' m/s'},{k:'加速度',v:'0 m/s²'}];},
 tt:function(p){return'【模型】匀速直线运动：速度恒定，位移与时间成正比。\n\n【推演】\n· T=L/v='+F(p.L/p.v,2)+' s\n· x(t)=v·t\n\n【延伸】这是牛顿第一定律的直接体现。';}},

{id:'m7',name:'匀加速直线运动',tags:['力学','运动'],br:'加速度恒定，速度随时间线性增加，位移与时间平方成正比。',
 p:[P('v0','初速度 v₀',0,20,0.5,0,'m/s'),P('a','加速度 a',0.5,10,0.1,2,'m/s²'),P('T','总时间 T',1,20,0.5,5,'s')],
 f:['v=v₀+a·t','x=v₀·t+½a·t²','v²=v₀²+2ax'],
 dur:function(p){return p.T;},
 pos:function(p,t,W,H){var tt=Math.min(t%p.T,p.T);var x=p.v0*tt+0.5*p.a*tt*tt;var mx=p.v0*p.T+0.5*p.a*p.T*p.T;return{x:60+(x/mx)*(W-120),y:H/2};},
 col:'#22d3ee',
 ro:function(p){var mx=p.v0*p.T+0.5*p.a*p.T*p.T;return[{k:'总位移',v:F(mx,2)+' m'},{k:'末速度',v:F(p.v0+p.a*p.T,2)+' m/s'},{k:'平均速度',v:F(mx/p.T,2)+' m/s'},{k:'初速度',v:F(p.v0,2)+' m/s'},{k:'加速度',v:F(p.a,2)+' m/s²'},{k:'总时间',v:F(p.T,2)+' s'}];},
 tt:function(p){var mx=p.v0*p.T+0.5*p.a*p.T*p.T;return'【模型】匀加速直线运动。\n\n【推演】\n· 总位移='+F(mx,2)+' m\n· 末速度='+F(p.v0+p.a*p.T,2)+' m/s\n· 平均速度='+F(mx/p.T,2)+' m/s\n\n【延伸】v-t 图像面积等于位移。';}},

{id:'m8',name:'竖直下抛运动',tags:['力学','抛体'],br:'初速度方向竖直向下的抛体运动，末速度比自由落体大。',
 p:[P('v0','初速度 v₀',1,20,0.5,5,'m/s'),P('h','下落高度 h',5,80,1,40,'m'),P('g','重力加速度 g',1.6,20,0.1,9.8,'m/s²')],
 f:['v=v₀+g·t','h=v₀·t+½g·t²','t=(−v₀+√(v₀²+2gh))/g'],
 dur:function(p){return (-p.v0+Math.sqrt(p.v0*p.v0+2*p.g*p.h))/p.g;},
 pos:function(p,t,W,H){var T=(-p.v0+Math.sqrt(p.v0*p.v0+2*p.g*p.h))/p.g;var tt=Math.min(t,T);
   var y=p.v0*tt+0.5*p.g*tt*tt;return{x:W/2,y:60+(y/p.h)*(H-120)};},
 col:'#f87171',
 ro:function(p){var T=(-p.v0+Math.sqrt(p.v0*p.v0+2*p.g*p.h))/p.g;return[{k:'下落时间 t',v:F(T,2)+' s'},{k:'末速度 v',v:F(p.v0+p.g*T,2)+' m/s'},{k:'初速度 v₀',v:p.v0+' m/s'},{k:'下落高度 h',v:p.h+' m'},{k:'加速度 g',v:F(p.g,1)+' m/s²'},{k:'末动能(1kg)',v:F(0.5*Math.pow(p.v0+p.g*T,2),1)+' J'}];},
 tt:function(p){var T=(-p.v0+Math.sqrt(p.v0*p.v0+2*p.g*p.h))/p.g;return'【模型】竖直下抛=有初速度的自由落体。\n\n【推演】\n· t='+F(T,2)+' s\n· v=v₀+g·t='+F(p.v0+p.g*T,2)+' m/s\n\n【结论】竖直下抛比自由落体多了一段"初速度"贡献的位移。';}},

{id:'m9',name:'简谐运动(SHM)',tags:['力学','振动'],br:'回复力与位移成正比且反向，是最基本的振动模型。',
 p:[P('A','振幅 A',0.2,3,0.1,1,'m'),P('w','角频率 ω',0.5,5,0.1,2,'rad/s')],
 f:['x=A·sin(ω·t)','v=Aω·cos(ω·t)','a=−Aω²·sin(ω·t)','T=2π/ω'],
 dur:function(p){return 2*Math.PI/p.w;},
 pos:function(p,t,W,H){var x=p.A*Math.sin(p.w*t);return{x:W/2+x*(W*0.35/p.A),y:H/2};},
 col:'#a78bfa',
 ro:function(p){return[{k:'周期 T',v:F(2*Math.PI/p.w,2)+' s'},{k:'频率 f',v:F(p.w/(2*Math.PI),2)+' Hz'},{k:'振幅 A',v:F(p.A,2)+' m'},{k:'角频率 ω',v:F(p.w,2)+' rad/s'},{k:'最大速度',v:F(p.A*p.w,2)+' m/s'},{k:'最大加速度',v:F(p.A*p.w*p.w,2)+' m/s²'}];},
 tt:function(p){return'【模型】简谐运动：x=A·sin(ωt)，回复力 F=−kx。\n\n【推演】\n· T=2π/ω='+F(2*Math.PI/p.w,2)+' s\n· 最大速度=Aω='+F(p.A*p.w,2)+' m/s\n· 最大加速度=Aω²='+F(p.A*p.w*p.w,2)+' m/s²\n\n【结论】SHM 是自然界最普遍的振动形式。';}},

{id:'m10',name:'胡克定律弹簧',tags:['力学','弹性'],br:'弹簧伸长量与所受拉力成正比，比例系数为劲度系数 k。',
 p:[P('k','劲度系数 k',5,100,1,30,'N/m'),P('F','拉力 F',0.5,30,0.5,10,'N')],
 f:['F=k·x','x=F/k','弹性势能 E=½kx²'],
 dur:function(p){return 3;},
 pos:function(p,t,W,H){var x=Math.min(p.F/p.k,0.9);var osc=1-Math.abs(Math.sin(t*3))*0.02;return{x:60+x*(W-120)*osc,y:H/2};},
 col:'#34d399',
 ro:function(p){var x=p.F/p.k;return[{k:'伸长量 x',v:F(x,3)+' m'},{k:'劲度系数 k',v:F(p.k,1)+' N/m'},{k:'拉力 F',v:F(p.F,2)+' N'},{k:'弹性势能',v:F(0.5*p.k*x*x,3)+' J'},{k:'应力比 F/k',v:F(x,4)+' m'},{k:'每牛伸长',v:F(1/p.k,4)+' m/N'}];},
 tt:function(p){var x=p.F/p.k;return'【模型】胡克定律 F=kx，在弹性限度内成立。\n\n【推演】\n· x=F/k='+F(x,3)+' m\n· E=½kx²='+F(0.5*p.k*x*x,3)+' J\n\n【延伸】"弹簧串并联"：串联 1/k=1/k₁+1/k₂，并联 k=k₁+k₂。';}},

{id:'m11',name:'动量守恒碰撞',tags:['力学','动量'],br:'两物体碰撞前后总动量守恒。',
 p:[P('m1','质量 m₁',0.5,5,0.1,1,'kg'),P('v1','初速 v₁',0,10,0.5,5,'m/s'),P('m2','质量 m₂',0.5,5,0.1,2,'kg'),P('v2','初速 v₂',-5,5,0.5,0,'m/s')],
 f:['m₁v₁+m₂v₂ = m₁v₁′+m₂v₂′','弹性碰撞动能守恒','完全非弹性 v′=(m₁v₁+m₂v₂)/(m₁+m₂)'],
 dur:function(p){return 4;},
 pos:function(p,t,W,H){var tt=t%4;var x1=60+tt*(W-120)*0.2;var x2=W-60-tt*(W-120)*0.2*(p.m1/p.m2);return{x:(x1+x2)/2,y:H/2};},
 col:'#f472b6',
 ro:function(p){var p1=p.m1*p.v1,p2=p.m2*p.v2;return[{k:'总动量 P',v:F(p1+p2,2)+' kg·m/s'},{k:'动量 p₁',v:F(p1,2)+' kg·m/s'},{k:'动量 p₂',v:F(p2,2)+' kg·m/s'},{k:'总动能',v:F(0.5*p.m1*p.v1*p.v1+0.5*p.m2*p.v2*p.v2,2)+' J'},{k:'总质量',v:F(p.m1+p.m2,2)+' kg'},{k:'质心速度',v:F((p1+p2)/(p.m1+p.m2),2)+' m/s'}];},
 tt:function(p){var P=p.m1*p.v1+p.m2*p.v2;return'【模型】动量守恒定律：系统不受外力或合外力为零时，总动量保持不变。\n\n【推演】\n· P=m₁v₁+m₂v₂='+F(P,2)+' kg·m/s\n· 弹性碰撞：动能守恒\n· 非弹性：动能损失\n\n【延伸】火箭反冲、爆炸都遵循动量守恒。';}},

{id:'m12',name:'功与功率',tags:['力学','能量'],br:'功等于力与位移的标积，功率是做功的快慢。',
 p:[P('F','力 F',1,100,1,20,'N'),P('s','位移 s',1,50,1,10,'m'),P('t','时间 t',1,60,1,5,'s')],
 f:['W=F·s','P=W/t=F·v','平均速度 v=s/t'],
 dur:function(p){return 4;},
 pos:function(p,t,W,H){var tt=t%4;var x=60+(tt/4)*(W-120);return{x:x,y:H/2};},
 col:'#fbbf24',
 ro:function(p){var W2=p.F*p.s,P2=W2/p.t;return[{k:'做功 W',v:F(W2,2)+' J'},{k:'功率 P',v:F(P2,2)+' W'},{k:'平均速度 v',v:F(p.s/p.t,2)+' m/s'},{k:'力 F',v:F(p.F,1)+' N'},{k:'位移 s',v:F(p.s,1)+' m'},{k:'时间 t',v:F(p.t,1)+' s'}];},
 tt:function(p){var W2=p.F*p.s;return'【模型】W=Fs（力与位移同向），P=W/t。\n\n【推演】\n· W='+F(W2,2)+' J\n· P='+F(W2/p.t,2)+' W\n\n【延伸】1 kWh=3.6×10⁶ J；家用空调约 1-2 kW。';}},

{id:'m13',name:'动能与势能转化',tags:['力学','能量'],br:'物体下落时重力势能转化为动能，总机械能守恒。',
 p:[P('h','初始高度 h',5,60,1,30,'m'),P('m','质量 m',0.5,10,0.1,2,'kg'),P('g','重力加速度 g',1.6,20,0.1,9.8,'m/s²')],
 f:['Ep=mgh','Ek=½mv²','E=Ep+Ek=常数'],
 dur:function(p){return 3;},
 pos:function(p,t,W,H){var tt=t%3;var frac=tt/3;var y=0.5*p.g*Math.pow(frac*Math.sqrt(2*p.h/p.g),2);return{x:W/2,y:60+(y/p.h)*(H-120)};},
 col:'#22d3ee',
 ro:function(p){return[{k:'初始势能 Ep',v:F(p.m*p.g*p.h,2)+' J'},{k:'初始动能',v:'0 J'},{k:'总机械能',v:F(p.m*p.g*p.h,2)+' J'},{k:'落地动能',v:F(p.m*p.g*p.h,2)+' J'},{k:'落地速度',v:F(Math.sqrt(2*p.g*p.h),2)+' m/s'},{k:'质量 m',v:F(p.m,2)+' kg'}];},
 tt:function(p){return'【模型】机械能守恒：Ep=mgh，Ek=½mv²，总量恒定。\n\n【推演】\n· 初始 Ep='+F(p.m*p.g*p.h,2)+' J\n· 落地 Ek='+F(p.m*p.g*p.h,2)+' J\n· 落地速度='+F(Math.sqrt(2*p.g*p.h),2)+' m/s\n\n【结论】在无摩擦、无空气阻力的理想情况下，机械能严格守恒。';}},

{id:'m14',name:'牛顿第二定律',tags:['力学','动力学'],br:'物体加速度与合外力成正比，与质量成反比。',
 p:[P('F','合外力 F',1,100,1,20,'N'),P('m','质量 m',0.5,20,0.5,5,'kg'),P('v0','初速度 v₀',0,10,0.5,0,'m/s')],
 f:['F=m·a','a=F/m','v=v₀+a·t','x=v₀t+½at²'],
 dur:function(p){return 4;},
 pos:function(p,t,W,H){var tt=t%4;var a=p.F/p.m;var x=p.v0*tt+0.5*a*tt*tt;var mx=p.v0*4+0.5*a*16;return{x:60+(x/Math.max(mx,0.01))*(W-120),y:H/2};},
 col:'#a78bfa',
 ro:function(p){var a=p.F/p.m;return[{k:'加速度 a',v:F(a,3)+' m/s²'},{k:'合外力 F',v:F(p.F,1)+' N'},{k:'质量 m',v:F(p.m,1)+' kg'},{k:'4s 后速度',v:F(p.v0+a*4,2)+' m/s'},{k:'4s 位移',v:F(p.v0*4+0.5*a*16,2)+' m'},{k:'动量变化',v:F(p.F*4,2)+' kg·m/s'}];},
 tt:function(p){var a=p.F/p.m;return'【模型】牛顿第二定律 F=ma 是经典力学的核心。\n\n【推演】\n· a=F/m='+F(a,3)+' m/s²\n· 4s 后速度 v='+F(p.v0+a*4,2)+' m/s\n· 4s 位移 x='+F(p.v0*4+0.5*a*16,2)+' m\n\n【延伸】F=ma 是矢量式，加速度方向与合外力方向一致。';}},

{id:'m15',name:'斜抛水平射程优化',tags:['力学','抛体'],br:'探究发射角对斜抛射程的影响，45°时取得最大值。',
 p:[P('v0','初速度 v₀',10,50,1,25,'m/s'),P('ang','发射角 θ',5,85,1,30,'°'),P('g','重力加速度 g',1.6,20,0.1,9.8,'m/s²')],
 f:['R=v₀²·sin2θ/g','θ=45°时 R_max=v₀²/g'],
 dur:function(p){var r=p.ang*Math.PI/180;return 2*p.v0*Math.sin(r)/p.g;},
 pos:function(p,t,W,H){var r=p.ang*Math.PI/180;var T=2*p.v0*Math.sin(r)/p.g;var tt=Math.min(t%T,T);
   var x=p.v0*Math.cos(r)*tt,y=p.v0*Math.sin(r)*tt-0.5*p.g*tt*tt;
   var R=p.v0*p.v0*Math.sin(2*r)/p.g,Hm=p.v0*p.v0*Math.sin(r)*Math.sin(r)/(2*p.g);
   var xs=(W-140)/Math.max(R,1),ys=(H-140)/Math.max(Hm,1);
   return{x:70+x*xs,y:70+Hm*ys-y*ys};},
 col:'#34d399',
 ro:function(p){var r=p.ang*Math.PI/180;return[{k:'射程 R',v:F(p.v0*p.v0*Math.sin(2*r)/p.g,2)+' m'},{k:'最大射程',v:F(p.v0*p.v0/p.g,2)+' m (45°)'},{k:'射程比',v:F(Math.sin(2*r)*100,1)+'%'},{k:'最大高度',v:F(p.v0*p.v0*Math.sin(r)*Math.sin(r)/(2*p.g),2)+' m'},{k:'发射角 θ',v:p.ang+'°'},{k:'互补角',v:(90-p.ang)+'°'}];},
 tt:function(p){var r=p.ang*Math.PI/180;return'【模型】斜抛射程 R=v₀²sin2θ/g，θ=45° 时 sin2θ=1 最大。\n\n【推演】\n· 当前 R='+F(p.v0*p.v0*Math.sin(2*r)/p.g,2)+' m\n· 最大 R='+F(p.v0*p.v0/p.g,2)+' m\n· 占比='+F(Math.sin(2*r)*100,1)+'%\n\n【结论】互补角（如 30° 和 60°）射程相同，但高度不同。';}}
];
for(var i=0;i<M.length;i++){M[i].cat='物理';EXP.push(mkMotion(M[i]));}

/* -------- 光学/波动（12个）-------- */
var C1=[
{id:'o1',name:'光的折射(Snell)',cat:'物理',tags:['光学','折射'],br:'光从一种介质进入另一种介质时传播方向发生偏折。',
 p:[P('n1','介质1折射率 n₁',1,2.5,0.05,1,''),P('n2','介质2折射率 n₂',1,2.5,0.05,1.5,''),P('a','入射角 θ₁',0,80,1,45,'°')],
 f:['n₁sinθ₁=n₂sinθ₂','sinθc=n₂/n₁'],
 xR:[0,1.57],yR:[0,1.57],xT:8,yT:8,xL:'θ₁ (rad)',yL:'θ₂ (rad)',col:'#fbbf24',
 fn:function(p,x){var s=p.n1*Math.sin(x)/p.n2;return Math.abs(s)<=1?Math.asin(s):NaN;},
 mk:[{x:Math.PI/4,l:'45°',c:'#22d3ee'}],
 ro:function(p){var r=p.a*Math.PI/180;var s=p.n1*Math.sin(r)/p.n2;var t2=Math.abs(s)<=1?Math.asin(s)*180/Math.PI:NaN;
   var cr=p.n1>p.n2?Math.asin(p.n2/p.n1)*180/Math.PI:NaN;
   return[{k:'入射角 θ₁',v:p.a+'°'},{k:'折射角 θ₂',v:isFinite(t2)?F(t2,1)+'°':'全反射'},{k:'n₁/n₂',v:F(p.n1/p.n2,2)},{k:'n₂/n₁',v:F(p.n2/p.n1,2)},{k:'临界角',v:isFinite(cr)?F(cr,1)+'°':'无'},{k:'光速比',v:F(p.n2/p.n1,2)}];},
 tt:function(p){var r=p.a*Math.PI/180;var s=p.n1*Math.sin(r)/p.n2;return'【模型】斯涅尔定律 n₁sinθ₁=n₂sinθ₂。\n\n【推演】\n· n₁='+p.n1+', n₂='+p.n2+'\n· 入射角='+p.a+'°\n· 折射角='+(Math.abs(s)<=1?F(Math.asin(s)*180/Math.PI,1)+'°':'发生全反射')+'\n\n【结论】光从光密射向光疏且入射角大于临界角时全反射——光纤原理。';}},

{id:'o2',name:'杨氏双缝干涉',cat:'物理',tags:['光学','干涉'],br:'两束相干光叠加产生明暗相间的干涉条纹。',
 p:[P('lam','波长 λ',400,750,10,550,'nm'),P('d','缝间距 d',0.1,1,0.02,0.3,'mm'),P('D','屏距离 D',0.5,3,0.1,1.5,'m')],
 f:['Δx=λD/d','亮纹 光程差=kλ','暗纹 光程差=(k+½)λ'],
 xR:[-10,10],yR:[0,1.1],xT:10,yT:5,xL:'屏上位置 (mm)',yL:'相对光强',col:'#a78bfa',
 fn:function(p,x){var d=p.d*1e-3,D=p.D;var dx=x*1e-3*d/(p.lam*1e-9*D);var I=Math.cos(Math.PI*dx);return I*I;},
 ro:function(p){var dx=p.lam*1e-9*p.D/(p.d*1e-3);return[{k:'条纹间距 Δx',v:F(dx*1000,3)+' mm'},{k:'波长 λ',v:p.lam+' nm'},{k:'缝间距 d',v:p.d+' mm'},{k:'屏距离 D',v:p.D+' m'},{k:'波数 k',v:F(1/p.lam*1e9,2)+' /m'},{k:'频率 f',v:F(3e8/(p.lam*1e-9)/1e14,2)+'×10¹⁴ Hz'}];},
 tt:function(p){var dx=p.lam*1e-9*p.D/(p.d*1e-3);return'【模型】双缝干涉：光程差 kλ 处亮，(k+½)λ 处暗。\n\n【推演】\n· Δx=λD/d='+F(dx*1000,3)+' mm\n· 波长='+p.lam+' nm\n\n【结论】这是光具有波动性的判决性实验——1801年托马斯·杨用它推翻了光的微粒说。';}},

{id:'o3',name:'单缝衍射',cat:'物理',tags:['光学','衍射'],br:'光通过单缝后偏离直线传播，中央主极大最亮。',
 p:[P('lam','波长 λ',400,750,10,550,'nm'),P('a','缝宽 a',0.05,0.5,0.01,0.1,'mm'),P('D','屏距离 D',0.5,3,0.1,1.5,'m')],
 f:['暗纹 a·sinθ=kλ','小角度近似：中央宽度 Δx≈2λD/a','I=I₀(sinβ/β)²，β≈πax/(λD)'],
 xR:[-15,15],yR:[0,1.1],xT:10,yT:5,xL:'屏上位置 (mm)',yL:'相对光强',col:'#22d3ee',
 fn:function(p,x){var b=Math.PI*p.a*1e-3*x*1e-3/(p.lam*1e-9*p.D);if(Math.abs(b)<1e-9)return 1;var s=Math.sin(b)/b;return s*s;},
 ro:function(p){var dx=2*p.lam*1e-9*p.D/(p.a*1e-3);var first=p.lam*1e-9*p.D/(p.a*1e-3);var ratio=p.lam*1e-9/(p.a*1e-3);return[{k:'中央明纹宽度（小角度近似）',v:F(dx*1000,2)+' mm'},{k:'波长 λ',v:p.lam+' nm'},{k:'缝宽 a',v:p.a+' mm'},{k:'屏距离 D',v:p.D+' m'},{k:'第一暗纹位置（小角度近似）',v:F(first*1000,2)+' mm'},{k:'第一暗纹角度',v:F(Math.asin(Math.min(1,ratio))*180/Math.PI,2)+'°'}];},
 tt:function(p){var dx=2*p.lam*1e-9*p.D/(p.a*1e-3);var first=p.lam*1e-9*p.D/(p.a*1e-3);var ratio=p.lam*1e-9/(p.a*1e-3);return'【模型】单缝衍射：I=(sinβ/β)²，β≈πax/(λD)（小角度近似）。\n\n【推演】\n· 中央明纹宽≈2λD/a='+F(dx*1000,2)+' mm\n· 第一暗纹位置≈λD/a='+F(first*1000,2)+' mm\n· 第一暗纹角度='+F(Math.asin(Math.min(1,ratio))*180/Math.PI,2)+'°\n\n【结论】缝越窄或屏距离越远，衍射条纹越宽。';}},

{id:'o4',name:'黑体辐射(维恩位移)',cat:'物理',tags:['热力学','量子'],br:'黑体辐射谱峰值波长与温度成反比——量子力学诞生的导火索。',
 p:[P('T','温度 T',1000,8000,100,5000,'K')],
 f:['λ_max·T=2.898×10⁻³ m·K','普朗克公式 B(λ,T)','M=σT⁴'],
 xR:[0,3000],yR:[0,1.1],xT:10,yT:5,xL:'波长 (nm)',yL:'相对辐射强度',col:'#f87171',
 fn:function(p,x){
   // Wavelength is plotted in nm. The x-axis includes 0, where Planck's
   // wavelength-form spectral radiance is undefined; its limiting value is 0.
   if(!Number.isFinite(x)||x<=0||!Number.isFinite(p.T)||p.T<=0)return 0;
   var l=x*1e-9,T=p.T,lm=2.897771955e-3/T;
   var c2=1.438776877e-2; // h*c/k, m·K
   var z=c2/(l*T),zm=c2/(lm*T);
   function logExpm1(v){return v>50?v+Math.log1p(-Math.exp(-v)):Math.log(Math.expm1(v));}
   // Evaluate log(B_lambda/B_lambda_peak) to avoid exp overflow and 0/0.
   var logRatio=5*Math.log(lm/l)+logExpm1(zm)-logExpm1(z);
   if(!Number.isFinite(logRatio))return logRatio===-Infinity?0:1;
   return Math.exp(Math.max(-745,Math.min(700,logRatio)));
 },
 ro:function(p){var lm=2.897771955e-3/p.T*1e9;return[{k:'峰值波长',v:F(lm,0)+' nm'},{k:'温度 T',v:p.T+' K'},{k:'辐射出射度',v:F(5.67e-8*Math.pow(p.T,4)/1e6,2)+' MW/m²'},{k:'峰值频率',v:F(3e8/(lm*1e-9)/1e14,2)+'×10¹⁴ Hz'},{k:'光子能量',v:F(6.626e-34*3e8/(lm*1e-9)/1.602e-19,2)+' eV'},{k:'颜色',v:p.T>6000?'蓝白色':p.T>4000?'白色':p.T>3000?'暖白':'橙红'}];},
 tt:function(p){var lm=2.898e-3/p.T*1e9;return'【模型】黑体辐射谱是经典物理无法解释的难题，普朗克提出"能量量子化"假设才解决。\n\n【推演】\n· λ_max='+F(lm,0)+' nm\n· M=σT⁴='+F(5.67e-8*Math.pow(p.T,4)/1e6,2)+' MW/m²\n\n【结论】温度越高，峰值波长越短，颜色越蓝——铁块加热"红→黄→白"的原因。';}},

{id:'o5',name:'光电效应',cat:'物理',tags:['量子','光电'],br:'光照射金属表面发射电子，爱因斯坦用光子说解释。',
 p:[P('lam','波长 λ',200,700,10,400,'nm'),P('W','逸出功 W',1,5,0.1,2.3,'eV')],
 f:['Ek_max=hν−W','红限 ν₀=W/h','遏止电压 U₀=Ek_max/e'],
 xR:[200,700],yR:[0,5],xT:10,yT:5,xL:'波长 λ (nm)',yL:'光电子最大动能 (eV)',col:'#fbbf24',
 fn:function(p,x){var hc=1240;var E=hc/x;return Math.max(0,E-p.W);},
 mk:[{x:540,l:'红限',c:'#f87171'}],
 ro:function(p){var hc=1240;var E=hc/p.lam;var Ek=Math.max(0,E-p.W);
   return[{k:'光子能量',v:F(E,2)+' eV'},{k:'逸出功 W',v:p.W+' eV'},{k:'最大动能',v:F(Ek,2)+' eV'},{k:'红限波长',v:F(hc/p.W,0)+' nm'},{k:'遏止电压',v:F(Ek,2)+' V'},{k:'能否光电',v:E>p.W?'能':'不能'}];},
 tt:function(p){var hc=1240;var E=hc/p.lam;var Ek=Math.max(0,E-p.W);return'【模型】光电方程 Ek=hν−W，光子的能量被电子一次性吸收。\n\n【推演】\n· 光子能量='+F(E,2)+' eV\n· 逸出功='+p.W+' eV\n· Ek='+F(Ek,2)+' eV\n· 红限='+F(hc/p.W,0)+' nm\n\n【结论】'+(E>p.W?'光子能量超过逸出功，能发生光电效应。':'光子能量不足，无法光电效应。')+'\n\n【延伸】爱因斯坦因此获1921年诺贝尔物理学奖。';}},

{id:'o6',name:'康普顿散射',cat:'物理',tags:['量子','散射'],br:'X射线被电子散射后波长变长，证明光子具有动量。',
 p:[P('lam','入射波长 λ',0.01,0.1,0.005,0.05,'nm'),P('ang','散射角 θ',0,180,5,60,'°')],
 f:['Δλ=(h/mₑc)(1−cosθ)','λ′=λ+Δλ','康普顿波长 λc=2.43 pm'],
 xR:[0,180],yR:[0,0.02],xT:9,yT:5,xL:'散射角 θ (°)',yL:'波长变化 Δλ (nm)',col:'#22d3ee',
 fn:function(p,x){var r=x*Math.PI/180;return 2.43e-12*(1-Math.cos(r))*1e9;},
 ro:function(p){var r=p.ang*Math.PI/180;var dl=2.43e-12*(1-Math.cos(r));
   return[{k:'波长变化 Δλ',v:F(dl*1e12,3)+' pm'},{k:'散射波长 λ′',v:F((p.lam*1e-9+dl)*1e12,3)+' pm'},{k:'入射波长',v:F(p.lam*1e9,1)+' pm'},{k:'散射角 θ',v:p.ang+'°'},{k:'康普顿波长',v:'2.43 pm'},{k:'电子反冲动能',v:F(6.626e-34*3e8*(1/(p.lam*1e-9)-1/(p.lam*1e-9+dl))/1.602e-19,2)+' eV'}];},
 tt:function(p){var r=p.ang*Math.PI/180;var dl=2.43e-12*(1-Math.cos(r));return'【模型】康普顿散射：光子与电子碰撞，一部分能量转移给电子。\n\n【推演】\n· Δλ='+F(dl*1e12,3)+' pm\n· λ′='+F((p.lam*1e-9+dl)*1e12,3)+' pm\n\n【结论】散射光波长变长，证明光子具有动量 p=h/λ。康普顿因此获1927年诺贝尔奖。';}},

{id:'o7',name:'德布罗意波长',cat:'物理',tags:['量子','波粒二象性'],br:'所有物质都具有波动性，波长 λ=h/p。',
 p:[P('m','质量 m',1,1000,1,9.11,''),P('v','速度 v',1,10000,100,1000,'m/s')],
 f:['λ=h/(mv)','p=mv','E=p²/2m'],
 xR:[0,10000],yR:[0,1],xT:10,yT:5,xL:'速度 v (m/s)',yL:'相对波长',col:'#a78bfa',
 fn:function(p,x){var h=6.626e-34;var m=p.m*(p.m<100?9.11e-31:1.67e-27);return (h/(m*x))/1e-9;},
 ro:function(p){var h=6.626e-34;var m=p.m*(p.m<100?9.11e-31:1.67e-27);var lam=h/(m*p.v);
   return[{k:'德布罗意波长',v:F(lam*1e12,3)+' pm'},{k:'动量 p',v:F(m*p.v,3)+' kg·m/s'},{k:'动能',v:F(0.5*m*p.v*p.v/1.602e-19,3)+' eV'},{k:'质量 m',v:m.toExponential(2)+' kg'},{k:'速度 v',v:p.v+' m/s'},{k:'频率 f',v:F(p.v/lam,3)+' Hz'}];},
 tt:function(p){var h=6.626e-34;var m=p.m*(p.m<100?9.11e-31:1.67e-27);var lam=h/(m*p.v);return'【模型】德布罗意关系 λ=h/p，物质波假设。\n\n【推演】\n· λ='+F(lam*1e12,3)+' pm\n· 电子（0.5MeV）λ≈1pm，X射线量级\n\n【结论】1927年戴维孙-革末实验用电子衍射证实了物质波。';}},

{id:'o8',name:'单摆波速',cat:'物理',tags:['波动','摆'],br:'绳波传播速度与张力和线密度有关 v=√(T/μ)。',
 p:[P('T','张力 T',1,100,1,20,'N'),P('mu','线密度 μ',0.01,1,0.01,0.1,'kg/m')],
 f:['v=√(T/μ)','反射与折射','驻波条件 L=nλ/2'],
 xR:[0,100],yR:[0,20],xT:10,yT:5,xL:'张力 T (N)',yL:'波速 v (m/s)',col:'#22d3ee',
 fn:function(p,x){return Math.sqrt(x/p.mu);},
 mk:[{x:50,l:'测试点',c:'#fbbf24'}],
 ro:function(p){return[{k:'波速 v',v:F(Math.sqrt(p.T/p.mu),2)+' m/s'},{k:'张力 T',v:p.T+' N'},{k:'线密度 μ',v:p.mu+' kg/m'},{k:'1m 传播时间',v:F(1/Math.sqrt(p.T/p.mu),3)+' s'},{k:'频率 10Hz 波长',v:F(Math.sqrt(p.T/p.mu)/10,3)+' m'},{k:'波阻抗 Z',v:F(Math.sqrt(p.T*p.mu),2)}];},
 tt:function(p){return'【模型】绳波速度 v=√(T/μ)，张力越大越快、越粗越慢。\n\n【推演】\n· v=√('+p.T+'/'+p.mu+')='+F(Math.sqrt(p.T/p.mu),2)+' m/s\n\n【延伸】吉他调音就是通过改变张力来改变波速，从而改变音高。';}},

{id:'o9',name:'多普勒效应',cat:'物理',tags:['波动','多普勒'],br:'波源与观察者相对运动时，观察到的频率发生变化。',
 p:[P('f0','波源频率 f₀',100,2000,10,440,'Hz'),P('vs','声速 v',300,400,5,340,'m/s'),P('v','相对速度 v',-100,100,5,30,'m/s')],
 f:['f=f₀·(v±v₀)/(v∓vs)','接近：f>f₀','远离：f<f₀'],
 xR:[-100,100],yR:[200,800],xT:10,yT:5,xL:'相对速度 v (m/s)',yL:'观测频率 (Hz)',col:'#f472b6',
 fn:function(p,x){return p.f0*p.vs/(p.vs-x);},
 mk:[{x:0,l:'v=0',c:'#22d3ee'},{x:30,l:'测试点',c:'#fbbf24'}],
 ro:function(p){var f=p.f0*p.vs/(p.vs-p.v);return[{k:'观测频率 f',v:F(f,1)+' Hz'},{k:'波源频率 f₀',v:p.f0+' Hz'},{k:'相对速度',v:p.v+' m/s'},{k:'频率变化',v:F(f-p.f0,1)+' Hz'},{k:'变化率',v:F((f-p.f0)/p.f0*100,2)+' %'},{k:'状态',v:p.v>0?'接近':p.v<0?'远离':'静止'}];},
 tt:function(p){var f=p.f0*p.vs/(p.vs-p.v);return'【模型】多普勒效应：f=f₀·v/(v−vs)。\n\n【推演】\n· f='+F(f,1)+' Hz\n· Δf='+F(f-p.f0,1)+' Hz\n· 变化率='+F((f-p.f0)/p.f0*100,2)+'%\n\n【结论】'+(p.v>0?'波源接近，观测频率升高。':p.v<0?'波源远离，观测频率降低。':'相对静止，无多普勒效应。')+'\n\n【延伸】交警测速仪、医学彩超、天文红移都应用了多普勒效应。';}},

{id:'o10',name:'布儒斯特角',cat:'物理',tags:['光学','偏振'],br:'反射光成为完全偏振光时的入射角，tanθ_B=n₂/n₁。',
 p:[P('n1','介质1 n₁',1,2,0.05,1,''),P('n2','介质2 n₂',1,2,0.05,1.5,''),P('ang','入射角 θ',0,89,1,56,'°')],
 f:['tanθ_B=n₂/n₁','反射光完全偏振','θ_B+θ_r=90°'],
 xR:[0,1.57],yR:[0,1],xT:8,yT:5,xL:'入射角 (rad)',yL:'偏振度',col:'#22d3ee',
 fn:function(p,x){var r=Math.atan(p.n2/p.n1);return Math.exp(-Math.pow((x-r)*8,2));},
 mk:[{x:Math.atan(1.5),l:'θ_B',c:'#fbbf24'}],
 ro:function(p){var tb=Math.atan(p.n2/p.n1)*180/Math.PI;return[{k:'布儒斯特角',v:F(tb,2)+'°'},{k:'当前入射角',v:p.ang+'°'},{k:'n₂/n₁',v:F(p.n2/p.n1,3)},{k:'折射角',v:F(90-tb,2)+'°'},{k:'偏振度',v:F(Math.exp(-Math.pow((p.ang-tb)/20,2))*100,1)+'%'},{k:'反射率 Rp',v:'0（完全偏振）'}];},
 tt:function(p){var tb=Math.atan(p.n2/p.n1)*180/Math.PI;return'【模型】布儒斯特角：tanθ_B=n₂/n₁，此时反射光完全偏振。\n\n【推演】\n· θ_B='+F(tb,2)+'°\n· θ_B+θ_r=90°\n\n【结论】偏振太阳镜利用布儒斯特角原理，消除水面/路面的反射眩光。';}},

{id:'o11',name:'薄膜干涉',cat:'物理',tags:['光学','干涉'],br:'薄膜上下表面反射光叠加形成彩色条纹。',
 p:[P('n','薄膜折射率 n',1.2,2,0.05,1.5,''),P('d','膜厚 d',100,1000,10,500,'nm'),P('lam','波长 λ',400,750,10,550,'nm')],
 f:['光程差 Δ=2nd·cosθ','相长 2nd=kλ','相消 2nd=(k+½)λ'],
 xR:[0,1000],yR:[0,1],xT:10,yT:5,xL:'波长 λ (nm)',yL:'相对反射强度',col:'#a78bfa',
 fn:function(p,x){var delta=2*p.n*p.d;return 0.5+0.5*Math.cos(2*Math.PI*delta/(x));},
 ro:function(p){var delta=2*p.n*p.d;return[{k:'光程差 Δ',v:F(delta,1)+' nm'},{k:'薄膜折射率',v:p.n},{k:'膜厚 d',v:p.d+' nm'},{k:'波长 λ',v:p.lam+' nm'},{k:'Δ/λ',v:F(delta/p.lam,3)},{k:'干涉类型',v:Math.abs(delta/p.lam-Math.round(delta/p.lam))<0.2?'相长':'介于之间'}];},
 tt:function(p){var delta=2*p.n*p.d;return'【模型】薄膜干涉：上下表面反射光的光程差决定加强或减弱。\n\n【推演】\n· Δ=2nd='+F(delta,1)+' nm\n· Δ/λ='+F(delta/p.lam,3)+'\n\n【结论】肥皂泡、油膜、镀膜镜片都体现了薄膜干涉——颜色随膜厚变化。';}},

{id:'o12',name:'麦克斯韦-玻尔兹曼分布',cat:'化学',tags:['统计','分子'],br:'气体分子速率服从 M-B 分布，温度越高分布越宽。',
 p:[P('T','温度 T',100,1500,10,300,'K'),P('M','摩尔质量 M',2,100,1,28,'g/mol')],
 f:['f(v)=4π(M/2πRT)^(3/2)·v²·e^(−Mv²/2RT)','最概然速率 v_p=√(2RT/M)','平均速率 v̄=√(8RT/πM)'],
 xR:[0,2000],yR:[0,1.1],xT:10,yT:5,xL:'分子速率 v (m/s)',yL:'相对分布 f(v)',col:'#22d3ee',
 fn:function(p,x){var R=8.314,T=p.T,M=p.M/1000;var A=4*Math.PI*Math.pow(M/(2*Math.PI*R*T),1.5);
   var v2=x*x;var e=Math.exp(-M*v2/(2*R*T));var vp=Math.sqrt(2*R*T/M);
   var Avp=4*Math.PI*Math.pow(M/(2*Math.PI*R*T),1.5)*vp*vp*Math.exp(-M*vp*vp/(2*R*T));
   return A*v2*e/Avp;},
 ro:function(p){var R=8.314,T=p.T,M=p.M/1000;
   var vp=Math.sqrt(2*R*T/M);var vbar=Math.sqrt(8*R*T/(Math.PI*M));var vrms=Math.sqrt(3*R*T/M);
   return[{k:'最概然速率 v_p',v:F(vp,0)+' m/s'},{k:'平均速率 v̄',v:F(vbar,0)+' m/s'},{k:'方均根 v_rms',v:F(vrms,0)+' m/s'},{k:'温度 T',v:p.T+' K'},{k:'摩尔质量 M',v:p.M+' g/mol'},{k:'v_p/v_rms',v:F(vp/vrms,3)}];},
 tt:function(p){var R=8.314,T=p.T,M=p.M/1000;var vp=Math.sqrt(2*R*T/M);
   return'【模型】麦克斯韦-玻尔兹曼分布：分子速率服从统计规律。\n\n【推演】\n· v_p=√(2RT/M)='+F(vp,0)+' m/s\n· 三个特征速率：v_p < v̄ < v_rms\n\n【结论】温度升高，分布曲线右移且变宽——高速分子比例增加，这就是温度升高反应速率加快的原因。';}}
];
for(var i=0;i<C1.length;i++){EXP.push(mkCurve(C1[i]));}

/* -------- 电学/磁学（10个）-------- */
var C2=[
{id:'e1',name:'RC电路充放电',cat:'物理',tags:['电学','瞬态'],br:'电容器通过电阻充放电遵循指数规律，时间常数 τ=RC。',
 p:[P('R','电阻 R',100,10000,100,1000,'Ω'),P('Cc','电容 C',1,100,1,10,'μF')],
 f:['q(t)=Q(1−e^(−t/τ))','放电 q(t)=Q·e^(−t/τ)','τ=RC','t½=0.693RC'],
 xR:[0,10],yR:[0,1.1],xT:10,yT:5,xL:'时间 t/τ',yL:'相对电荷 q/Q₀',col:'#22d3ee',
 fn:function(p,x){return 1-Math.exp(-x);},
 ro:function(p){var tau=p.R*p.Cc*1e-6;return[{k:'时间常数 τ',v:F(tau*1000,3)+' ms'},{k:'半衰期 t½',v:F(0.693*tau*1000,3)+' ms'},{k:'电阻 R',v:p.R+' Ω'},{k:'电容 C',v:p.Cc+' μF'},{k:'5τ 时充电',v:F(1-Math.exp(-5),4)},{k:'截止频率',v:F(1/(2*Math.PI*tau),1)+' Hz'}];},
 tt:function(p){var tau=p.R*p.Cc*1e-6;return'【模型】RC 充放电：q(t)=Q(1−e^(−t/τ))。\n\n【推演】\n· τ=RC='+F(tau*1000,3)+' ms\n· t½=0.693τ='+F(0.693*tau*1000,3)+' ms\n· 5τ 后充电完成度='+F((1-Math.exp(-5))*100,2)+'%\n\n【延伸】τ 的物理意义：电压达 63.2% 所需时间。';}},

{id:'e2',name:'RL电路瞬态',cat:'物理',tags:['电学','瞬态'],br:'通过电感 L 的电流变化时，遵循指数规律，时间常数 τ=L/R。',
 p:[P('R','电阻 R',1,1000,1,100,'Ω'),P('L','电感 L',0.01,1,0.01,0.1,'H')],
 f:['i(t)=(V/R)(1−e^(−t/τ))','τ=L/R','能量 E=½Li²'],
 xR:[0,10],yR:[0,1.1],xT:10,yT:5,xL:'时间 t/τ',yL:'相对电流 i/i∞',col:'#fbbf24',
 fn:function(p,x){return 1-Math.exp(-x);},
 ro:function(p){var tau=p.L/p.R;return[{k:'时间常数 τ',v:F(tau*1000,3)+' ms'},{k:'电阻 R',v:p.R+' Ω'},{k:'电感 L',v:F(p.L,3)+' H'},{k:'5τ 时电流',v:F(1-Math.exp(-5),4)},{k:'能量(1A)',v:F(0.5*p.L,3)+' J'},{k:'截止频率',v:F(p.R/(2*Math.PI*p.L),1)+' Hz'}];},
 tt:function(p){var tau=p.L/p.R;return'【模型】RL 电路：τ=L/R。\n\n【推演】\n· τ='+F(tau*1000,3)+' ms\n· 5τ 后电流趋于稳态\n\n【延伸】电感"抗拒"电流变化——这是变压器、扼流圈的工作原理。';}},

{id:'e3',name:'RLC谐振电路',cat:'物理',tags:['电学','谐振'],br:'RLC 电路在特定频率下阻抗最小，电流最大。',
 p:[P('L','电感 L',0.001,0.1,0.001,0.01,'H'),P('C','电容 C',1,100,1,10,'μF'),P('R','电阻 R',1,100,1,10,'Ω')],
 f:['f₀=1/(2π√(LC))','品质因数 Q=ω₀L/R','带宽 BW=f₀/Q'],
 xR:[100,10000],yR:[0,1.1],xT:10,yT:5,xL:'频率 (Hz)',yL:'相对电流',col:'#f472b6',
 fn:function(p,x){var w=2*Math.PI*x;var L=p.L,Cc=p.C*1e-6;var XL=w*L,XC=1/(w*Cc);
   var Z=Math.sqrt(p.R*p.R+Math.pow(XL-XC,2));
   var Zmin=p.R;return Zmin/Z;},
 ro:function(p){var Cc=p.C*1e-6;var f0=1/(2*Math.PI*Math.sqrt(p.L*Cc));
   return[{k:'谐振频率 f₀',v:F(f0,1)+' Hz'},{k:'品质因数 Q',v:F(2*Math.PI*f0*p.L/p.R,2)},{k:'带宽 BW',v:F(f0/(2*Math.PI*f0*p.L/p.R),1)+' Hz'},{k:'L',v:p.L+' H'},{k:'C',v:p.C+' μF'},{k:'R',v:p.R+' Ω'}];},
 tt:function(p){var Cc=p.C*1e-6;var f0=1/(2*Math.PI*Math.sqrt(p.L*Cc));
   return'【模型】RLC 谐振：感抗=容抗时阻抗最小。\n\n【推演】\n· f₀=1/(2π√(LC))='+F(f0,1)+' Hz\n· Q=ω₀L/R='+F(2*Math.PI*f0*p.L/p.R,2)+'\n\n【延伸】收音机选台就是调节 LC 使谐振在目标频率。';}},

{id:'e4',name:'洛伦兹力与回旋运动',cat:'物理',tags:['电磁','带电粒子'],br:'带电粒子在磁场中做圆周运动，半径 r=mv/(qB)。',
 p:[P('v','速度 v',1e5,1e7,1e5,1e6,'m/s'),P('B','磁场 B',0.01,1,0.01,0.1,'T'),P('q','电荷量(×e)',1,10,1,1,'')],
 f:['F=qvB','r=mv/(qB)','T=2πm/(qB)'],
 xR:[0,1],yR:[0,1e7],xT:10,yT:5,xL:'磁场 B (T)',yL:'轨道半径 (m)',col:'#22d3ee',
 fn:function(p,x){var m=9.11e-31,q=p.q*1.602e-19;return m*p.v/(q*x);},
 ro:function(p){var m=9.11e-31,q=p.q*1.602e-19;var r=m*p.v/(q*p.B);var T=2*Math.PI*m/(q*p.B);
   return[{k:'回旋半径 r',v:r.toExponential(2)+' m'},{k:'回旋周期 T',v:F(T*1e9,3)+' ns'},{k:'洛伦兹力 F',v:(q*p.v*p.B).toExponential(2)+' N'},{k:'速度 v',v:p.v.toExponential(2)+' m/s'},{k:'磁场 B',v:p.B+' T'},{k:'回旋频率',v:F(1/T/1e6,1)+' MHz'}];},
 tt:function(p){var m=9.11e-31,q=p.q*1.602e-19;var r=m*p.v/(q*p.B);
   return'【模型】洛伦兹力 F=qvB，方向垂直于 v 和 B。\n\n【推演】\n· r=mv/(qB)='+r.toExponential(2)+' m\n· T=2πm/(qB)\n\n【结论】这是质谱仪、回旋加速器、磁约束核聚变的基本原理。';}},

{id:'e5',name:'平行板电容器',cat:'物理',tags:['电学','电容'],br:'电容器电容与极板面积成正比，与间距成反比 C=εA/d。',
 p:[P('A','面积 A',0.01,1,0.01,0.1,'m²'),P('d','间距 d',0.001,0.01,0.001,0.002,'m'),P('er','相对介电常数 εr',1,10,0.1,1,'')],
 f:['C=ε₀εr·A/d','E=U/d','Q=CU'],
 xR:[0.001,0.01],yR:[0,1e-9],xT:9,yT:5,xL:'间距 d (m)',yL:'电容 C (F)',col:'#a78bfa',
 fn:function(p,x){return 8.854e-12*p.er*p.A/x;},
 ro:function(p){var C=8.854e-12*p.er*p.A/p.d;return[{k:'电容 C',v:C.toExponential(3)+' F'},{k:'面积 A',v:p.A+' m²'},{k:'间距 d',v:p.d+' m'},{k:'相对介电常数',v:p.er},{k:'1V 时电荷',v:C.toExponential(3)+' C'},{k:'真空电容率 ε₀',v:'8.854e-12 F/m'}];},
 tt:function(p){var C=8.854e-12*p.er*p.A/p.d;return'【模型】平行板电容器 C=ε₀εr·A/d。\n\n【推演】\n· C='+C.toExponential(3)+' F\n\n【延伸】插入介质 εr 增大，电容增大；拉开极板 d 增大，电容减小。';}},

{id:'e6',name:'电磁感应(法拉第)',cat:'物理',tags:['电磁','感应'],br:'穿过回路的磁通量变化产生感应电动势 E=−dΦ/dt。',
 p:[P('B','磁场 B',0.1,5,0.1,1,'T'),P('A','线圈面积 A',0.01,1,0.01,0.1,'m²'),P('n','匝数 n',1,1000,1,100,''),P('dt','时间 dt',0.01,1,0.01,0.1,'s')],
 f:['E=−n·dΦ/dt','Φ=B·A·cosθ','E=n·B·A/dt (垂直)'],
 xR:[0.01,1],yR:[0,100],xT:10,yT:5,xL:'时间 dt (s)',yL:'感应电动势 (V)',col:'#fbbf24',
 fn:function(p,x){return p.n*p.B*p.A/x;},
 ro:function(p){var E=p.n*p.B*p.A/p.dt;return[{k:'感应电动势 E',v:F(E,2)+' V'},{k:'磁通 Φ',v:F(p.B*p.A,4)+' Wb'},{k:'磁场 B',v:p.B+' T'},{k:'面积 A',v:p.A+' m²'},{k:'匝数 n',v:p.n},{k:'时间 dt',v:p.dt+' s'}];},
 tt:function(p){var E=p.n*p.B*p.A/p.dt;return'【模型】法拉第电磁感应定律 E=−dΦ/dt。\n\n【推演】\n· E=n·B·A/dt='+F(E,2)+' V\n\n【延伸】发电机、变压器、无线充电都基于电磁感应。楞次定律：感应电流阻碍磁通量变化。';}},

{id:'e7',name:'库仑定律',cat:'物理',tags:['电磁','静电'],br:'两静止点电荷间作用力与电荷量成正比，与距离平方成反比。',
 p:[P('q1','电荷 q₁ (μC)',0.1,10,0.1,1,''),P('q2','电荷 q₂ (μC)',-10,10,0.1,-2,''),P('r','距离 r',0.01,1,0.01,0.1,'m')],
 f:['F=k·q₁q₂/r²','k=8.99×10⁹ N·m²/C²','同号排斥、异号吸引'],
 xR:[0.01,1],yR:[-100,100],xT:10,yT:5,xL:'距离 r (m)',yL:'库仑力 (N)',col:'#f472b6',
 fn:function(p,x){return 8.99e9*(p.q1*1e-6)*(p.q2*1e-6)/(x*x);},
 ro:function(p){var F2=8.99e9*p.q1*1e-6*p.q2*1e-6/(p.r*p.r);
   return[{k:'库仑力 F',v:F(F2,3)+' N'},{k:'q₁',v:p.q1+' μC'},{k:'q₂',v:p.q2+' μC'},{k:'距离 r',v:p.r+' m'},{k:'力的方向',v:F2>0?'排斥':'吸引'},{k:'电场强度 E₁',v:F(8.99e9*Math.abs(p.q1)*1e-6/(p.r*p.r),1)+' V/m'}];},
 tt:function(p){var F2=8.99e9*p.q1*1e-6*p.q2*1e-6/(p.r*p.r);
   return'【模型】库仑定律 F=kq₁q₂/r²，类比万有引力定律。\n\n【推演】\n· F='+F(F2,3)+' N\n· 力的方向：'+(F2>0?'排斥（同号）':'吸引（异号）')+'\n\n【延伸】库仑力是长程力，也是化学键、分子间作用力的基础。';}},

{id:'e8',name:'霍尔效应',cat:'物理',tags:['电磁','霍尔'],br:'载流导体在磁场中产生横向电压差，可用于测磁场。',
 p:[P('I','电流 I',0.01,10,0.01,1,'A'),P('B','磁场 B',0.01,2,0.01,0.1,'T'),P('n','载流子浓度',1e22,1e26,1e22,1e24,'/m³'),P('d','厚度 d',0.1,5,0.1,1,'mm')],
 f:['U_H=I·B/(n·e·d)','R_H=1/(n·e)'],
 xR:[0.01,2],yR:[0,0.1],xT:10,yT:5,xL:'磁场 B (T)',yL:'霍尔电压 (V)',col:'#22d3ee',
 fn:function(p,x){return p.I*x/(p.n*1.602e-19*p.d*1e-3);},
 ro:function(p){var U=p.I*p.B/(p.n*1.602e-19*p.d*1e-3);var RH=1/(p.n*1.602e-19);
   return[{k:'霍尔电压 U_H',v:F(U*1000,4)+' mV'},{k:'霍尔系数 R_H',v:RH.toExponential(2)+' m³/C'},{k:'电流 I',v:p.I+' A'},{k:'磁场 B',v:p.B+' T'},{k:'载流子浓度',v:p.n.toExponential(1)+' /m³'},{k:'厚度 d',v:p.d+' mm'}];},
 tt:function(p){var U=p.I*p.B/(p.n*1.602e-19*p.d*1e-3);
   return'【模型】霍尔效应：运动载流子在磁场中受洛伦兹力偏转，产生横向电压。\n\n【推演】\n· U_H=IB/(n·e·d)='+F(U*1000,4)+' mV\n\n【延伸】霍尔传感器广泛用于测转速、磁场、位置——手机、汽车里都有。';}},

{id:'e9',name:'通电螺线管磁场',cat:'物理',tags:['电磁','磁场'],br:'通电螺线管内部磁场近似均匀，B=μ₀nI。',
 p:[P('I','电流 I',0.1,10,0.1,2,'A'),P('n','单位长匝数 n',100,5000,100,1000,'/m'),P('L','螺线管长度 L',0.1,1,0.05,0.3,'m')],
 f:['B=μ₀·n·I','Φ=B·A','L=μ₀n²V'],
 xR:[0.1,10],yR:[0,0.1],xT:10,yT:5,xL:'电流 I (A)',yL:'磁感应强度 B (T)',col:'#fbbf24',
 fn:function(p,x){return 4*Math.PI*1e-7*p.n*x;},
 ro:function(p){var B=4*Math.PI*1e-7*p.n*p.I;return[{k:'磁感应强度 B',v:F(B*1000,3)+' mT'},{k:'总匝数 N',v:Math.round(p.n*p.L)},{k:'电流 I',v:p.I+' A'},{k:'单位匝数 n',v:p.n+' /m'},{k:'长度 L',v:p.L+' m'},{k:'磁场能密度',v:F(B*B/(2*4*Math.PI*1e-7),2)+' J/m³'}];},
 tt:function(p){var B=4*Math.PI*1e-7*p.n*p.I;
   return'【模型】理想螺线管内部 B=μ₀nI，外部近似为零。\n\n【推演】\n· B='+F(B*1000,3)+' mT\n\n【延伸】增加匝数、增大电流、插入铁芯（提高 μ）都能增强磁场——电磁铁原理。';}},

{id:'e10',name:'安培环路定理',cat:'物理',tags:['电磁','安培'],br:'磁感应强度沿闭合回路的线积分等于 μ₀ 乘以穿过回路的电流。',
 p:[P('I','电流 I',0.1,100,0.1,10,'A'),P('r','半径 r',0.01,1,0.01,0.1,'m')],
 f:['∮B·dl=μ₀·I','B=μ₀I/(2πr)','长直导线'],
 xR:[0.01,1],yR:[0,0.01],xT:10,yT:5,xL:'半径 r (m)',yL:'磁感应强度 B (T)',col:'#a78bfa',
 fn:function(p,x){return 4*Math.PI*1e-7*p.I/(2*Math.PI*x);},
 ro:function(p){var B=4*Math.PI*1e-7*p.I/(2*Math.PI*p.r);
   return[{k:'磁感应强度 B',v:B.toExponential(3)+' T'},{k:'电流 I',v:p.I+' A'},{k:'半径 r',v:p.r+' m'},{k:'2πr 周长',v:F(2*Math.PI*p.r,3)+' m'},{k:'∮B·dl',v:(B*2*Math.PI*p.r).toExponential(3)+' T·m'},{k:'μ₀I',v:(4*Math.PI*1e-7*p.I).toExponential(3)+' T·m'}];},
 tt:function(p){var B=4*Math.PI*1e-7*p.I/(2*Math.PI*p.r);
   return'【模型】安培环路定理 ∮B·dl=μ₀I，磁场产生于电流。\n\n【推演】\n· B=μ₀I/(2πr)='+B.toExponential(3)+' T\n\n【延伸】这是麦克斯韦方程组中的一条，与高斯定律并称电磁学基石。';}}
];
for(var i=0;i<C2.length;i++){EXP.push(mkCurve(C2[i]));}

/* -------- 化学：热力学/平衡（12个）-------- */
var C3=[
{id:'ch1',name:'阿伦尼乌斯方程',cat:'化学',tags:['动力学','温度'],br:'反应速率常数随温度指数增长。',
 p:[P('Ea','活化能 Ea',10,200,1,70,'kJ/mol'),P('T1','温度 T₁',273,373,1,298,'K'),P('T2','温度 T₂',273,373,1,308,'K')],
 f:['k=A·e^(−Ea/RT)','ln(k₂/k₁)=Ea/R·(1/T₁−1/T₂)','温度每升 10K 速率约×2-4'],
 xR:[273,500],yR:[0,1000],xT:10,yT:5,xL:'温度 T (K)',yL:'相对速率常数 k/k₂₉₈',col:'#fbbf24',
 fn:function(p,x){var R=8.314;var k0=Math.exp(-p.Ea*1000/(R*298));return Math.exp(-p.Ea*1000/(R*x))/k0;},
 mk:[{x:298,l:'298K',c:'#22d3ee'},{x:308,l:'308K',c:'#34d399'}],
 ro:function(p){var R=8.314;
   var k1=Math.exp(-p.Ea*1000/(R*p.T1));var k2=Math.exp(-p.Ea*1000/(R*p.T2));var ratio=k2/k1;
   return[{k:'k₂/k₁',v:F(ratio,3)},{k:'ln(k₂/k₁)',v:F(Math.log(ratio),3)},{k:'T₁',v:p.T1+' K'},{k:'T₂',v:p.T2+' K'},{k:'Ea',v:p.Ea+' kJ/mol'},{k:'ΔT',v:(p.T2-p.T1)+' K'}];},
 tt:function(p){var R=8.314;var k1=Math.exp(-p.Ea*1000/(R*p.T1));var k2=Math.exp(-p.Ea*1000/(R*p.T2));var ratio=k2/k1;
   return'【模型】阿伦尼乌斯方程 k=A·e^(−Ea/RT)。\n\n【推演】\n· Ea='+p.Ea+' kJ/mol\n· T₁='+p.T1+'K, T₂='+p.T2+'K\n· k₂/k₁='+F(ratio,3)+'\n\n【结论】'+(ratio>1?'温度升高，速率增大。':'温度降低，速率减小。')+'\n\n【延伸】多数反应温度每升 10K，速率约提高 2~4 倍（范特霍夫规则）。';}},

{id:'ch2',name:'吉布斯自由能',cat:'化学',tags:['热力学','自发'],br:'ΔG=ΔH−TΔS，ΔG<0 时反应自发。',
 p:[P('dH','焓变 ΔH',-200,200,1,-50,'kJ/mol'),P('dS','熵变 ΔS',-500,500,5,100,'J/(mol·K)'),P('T','温度 T',200,1000,10,298,'K')],
 f:['ΔG=ΔH−TΔS','ΔG<0 自发','ΔG=0 平衡','ΔG>0 非自发'],
 xR:[200,1000],yR:[-300,300],xT:10,yT:6,xL:'温度 T (K)',yL:'ΔG (kJ/mol)',col:'#22d3ee',
 fn:function(p,x){return p.dH-x*p.dS/1000;},
 mk:[{x:298,l:'298K',c:'#22d3ee'},{x:500,l:'500K',c:'#34d399'}],
 ro:function(p){var dG=p.dH-p.T*p.dS/1000;
   var Tbal=p.dS!==0?p.dH*1000/p.dS:Infinity;
   return[{k:'ΔG',v:F(dG,2)+' kJ/mol'},{k:'ΔH',v:p.dH+' kJ/mol'},{k:'ΔS',v:p.dS+' J/(mol·K)'},{k:'温度 T',v:p.T+' K'},{k:'平衡温度',v:isFinite(Tbal)?F(Tbal,1)+' K':'不存在'},{k:'自发性',v:dG<0?'自发':dG>0?'非自发':'平衡'}];},
 tt:function(p){var dG=p.dH-p.T*p.dS/1000;var Tbal=p.dS!==0?p.dH*1000/p.dS:Infinity;
   return'【模型】吉布斯自由能判据 ΔG=ΔH−TΔS。\n\n【推演】\n· ΔG='+F(dG,2)+' kJ/mol\n· 平衡温度='+(isFinite(Tbal)?F(Tbal,1)+' K':'—')+'\n\n【结论】'+(dG<0?'ΔG<0，反应自发。':dG>0?'ΔG>0，反应非自发。':'ΔG=0，处于平衡。')+'\n\n【延伸】放热且熵增（ΔH<0，ΔS>0）的反应任何温度都自发。';}},

{id:'ch3',name:'化学平衡常数',cat:'化学',tags:['平衡','平衡常数'],br:'K 只与温度有关，ΔG°=−RT·lnK。',
 p:[P('dG0','标准 ΔG°',-100,100,1,-20,'kJ/mol'),P('T','温度 T',200,1000,10,298,'K')],
 f:['ΔG°=−RT·lnK','K=e^(−ΔG°/RT)','ΔG=ΔG°+RT·lnQ'],
 xR:[200,1000],yR:[0,100],xT:10,yT:5,xL:'温度 T (K)',yL:'平衡常数 K',col:'#f472b6',
 fn:function(p,x){return Math.exp(-p.dG0*1000/(8.314*x));},
 ro:function(p){var K=Math.exp(-p.dG0*1000/(8.314*p.T));var lnK=Math.log(K);
   return[{k:'平衡常数 K',v:K.toExponential(3)},{k:'ln K',v:F(lnK,3)},{k:'ΔG°',v:p.dG0+' kJ/mol'},{k:'温度 T',v:p.T+' K'},{k:'反应倾向',v:p.dG0<0?'向右':p.dG0>0?'向左':'平衡'},{k:'R',v:'8.314 J/(mol·K)'}];},
 tt:function(p){var K=Math.exp(-p.dG0*1000/(8.314*p.T));
   return'【模型】ΔG°=−RT·lnK，K 只与温度有关。\n\n【推演】\n· ΔG°='+p.dG0+' kJ/mol\n· T='+p.T+'K\n· K='+K.toExponential(3)+'\n\n【结论】'+(p.dG0<0?'ΔG°<0，K>1，平衡偏向产物。':p.dG0>0?'ΔG°>0，K<1，平衡偏向反应物。':'ΔG°=0，K=1。');}},

{id:'ch4',name:'勒夏特列原理',cat:'化学',tags:['平衡','移动'],br:'平衡体系受扰动时，平衡向减弱扰动的方向移动。',
 p:[P('K','初始 K',0.1,100,0.1,10,''),P('Q','反应商 Q',0.01,100,0.01,5,''),P('T','温度 T',200,1000,10,298,'K')],
 f:['Q<K 向右移动','Q>K 向左移动','Q=K 平衡'],
 xR:[0.01,100],yR:[0.01,100],xT:10,yT:10,xL:'反应商 Q',yL:'ΔG (kJ/mol)',col:'#34d399',
 fn:function(p,x){return 8.314*p.T/1000*Math.log(x/p.K);},
 mk:[{x:10,l:'Q=K',c:'#fbbf24'}],
 ro:function(p){var dG=8.314*p.T/1000*Math.log(p.Q/p.K);
   return[{k:'ΔG',v:F(dG,3)+' kJ/mol'},{k:'K',v:F(p.K,2)},{k:'Q',v:F(p.Q,3)},{k:'Q/K',v:F(p.Q/p.K,3)},{k:'移动方向',v:dG<0?'向右':dG>0?'向左':'平衡'},{k:'T',v:p.T+' K'}];},
 tt:function(p){var dG=8.314*p.T/1000*Math.log(p.Q/p.K);
   return'【模型】勒夏特列原理：平衡向减弱扰动的方向移动。\n\n【推演】\n· Q/K='+F(p.Q/p.K,3)+'\n· ΔG=RT·ln(Q/K)='+F(dG,3)+' kJ/mol\n\n【结论】'+(dG<0?'Q<K，正反应方向移动。':dG>0?'Q>K，逆反应方向移动。':'Q=K，平衡状态。')+'\n\n【延伸】升温→吸热方向；加压→体积减小方向；加催化剂→不移动。';}},

{id:'ch5',name:'亨利定律气体溶解度',cat:'化学',tags:['溶液','气体'],br:'气体溶解度与分压成正比，c=kH·P。',
 p:[P('kH','亨利常数 kH',0.0001,0.1,0.0001,0.034,'mol/(L·atm)'),P('P','分压 P',0.1,10,0.1,1,'atm')],
 f:['c=kH·P','P=kc·c','稀溶液中成立'],
 xR:[0.1,10],yR:[0,0.5],xT:10,yT:5,xL:'分压 P (atm)',yL:'溶解度 c (mol/L)',col:'#22d3ee',
 fn:function(p,x){return p.kH*x;},
 ro:function(p){return[{k:'溶解度 c',v:F(p.kH*p.P,4)+' mol/L'},{k:'亨利常数 kH',v:p.kH+' mol/(L·atm)'},{k:'分压 P',v:p.P+' atm'},{k:'分压 P (kPa)',v:F(p.P*101.325,1)+' kPa'},{k:'浓度 (g/L,CO₂)',v:F(p.kH*p.P*44,4)+' g/L'},{k:'影响因素',v:'温度↑溶解度↓'}];},
 tt:function(p){return'【模型】亨利定律：c=kH·P，气体溶解度与分压成正比。\n\n【推演】\n· c='+F(p.kH*p.P,4)+' mol/L (P='+p.P+' atm)\n\n【结论】打开汽水瓶压力骤降，CO₂ 逸出冒气泡——这就是亨利定律。深海潜水员上浮过快会得"减压病"。';}},

{id:'ch6',name:'拉乌尔定律',cat:'化学',tags:['溶液','蒸气压'],br:'溶液中溶剂蒸气压等于纯溶剂蒸气压乘以摩尔分数。',
 p:[P('P0','纯溶剂蒸气压 P°',1,100,1,30,'kPa'),P('xs','溶质摩尔分数 xs',0,1,0.01,0.2,'')],
 f:['P=P°·x溶剂','ΔP=P°·xs','稀溶液适用'],
 xR:[0,1],yR:[0,30],xT:10,yT:5,xL:'溶质摩尔分数 xs',yL:'溶液蒸气压 (kPa)',col:'#a78bfa',
 fn:function(p,x){return p.P0*(1-x);},
 ro:function(p){return[{k:'溶液蒸气压 P',v:F(p.P0*(1-p.xs),2)+' kPa'},{k:'纯溶剂蒸气压 P°',v:p.P0+' kPa'},{k:'溶质摩尔分数',v:p.xs},{k:'蒸气压下降 ΔP',v:F(p.P0*p.xs,2)+' kPa'},{k:'相对下降率',v:F(p.xs*100,1)+'%'},{k:'沸点',v:'升高（依数性）'}];},
 tt:function(p){return'【模型】拉乌尔定律：P=P°·x溶剂。\n\n【推演】\n· P='+F(p.P0*(1-p.xs),2)+' kPa\n· ΔP='+F(p.P0*p.xs,2)+' kPa\n\n【结论】溶质降低了溶剂蒸气压——这就是"海水比淡水沸点高"的原因，也是汽车防冻液的原理。';}},

{id:'ch7',name:'依数性-沸点升高',cat:'化学',tags:['溶液','依数性'],br:'溶液沸点升高与溶质质量摩尔浓度成正比，ΔTb=Kb·b。',
 p:[P('Kb','沸点升高常数 Kb',0.1,5,0.1,0.512,'K·kg/mol'),P('b','质量摩尔浓度 b',0.1,5,0.1,1,'mol/kg')],
 f:['ΔTb=Kb·b','ΔTf=Kf·b','Π=cRT（渗透压）'],
 xR:[0,5],yR:[0,3],xT:10,yT:5,xL:'浓度 b (mol/kg)',yL:'ΔTb (K)',col:'#fbbf24',
 fn:function(p,x){return p.Kb*x;},
 ro:function(p){return[{k:'沸点升高 ΔTb',v:F(p.Kb*p.b,3)+' K'},{k:'Kb',v:p.Kb+' K·kg/mol'},{k:'浓度 b',v:p.b+' mol/kg'},{k:'新沸点',v:F(100+p.Kb*p.b,2)+' °C'},{k:'ΔTf (Kf=1.86)',v:F(1.86*p.b,3)+' K'},{k:'新凝固点',v:F(0-1.86*p.b,2)+' °C'}];},
 tt:function(p){return'【模型】依数性：ΔTb=Kb·b，ΔTf=Kf·b。\n\n【推演】\n· ΔTb='+F(p.Kb*p.b,3)+' K\n· 新沸点='+F(100+p.Kb*p.b,2)+' °C\n· 新凝固点='+F(-1.86*p.b,2)+' °C\n\n【结论】这是"撒盐化雪"、"汽车防冻液"的原理。溶质粒子数越多，效果越明显。';}},

{id:'ch8',name:'渗透压(范特霍夫)',cat:'化学',tags:['溶液','渗透'],br:'渗透压 Π=cRT，与浓度和温度成正比。',
 p:[P('c','浓度 c',0.001,1,0.001,0.1,'mol/L'),P('T','温度 T',273,373,1,298,'K')],
 f:['Π=cRT','R=8.314 J/(mol·K)','生物细胞约 0.7 MPa'],
 xR:[0.001,1],yR:[0,3000],xT:10,yT:5,xL:'浓度 c (mol/L)',yL:'渗透压 Π (kPa)',col:'#22d3ee',
 fn:function(p,x){return x*8.314*p.T;},
 ro:function(p){var P=8.314*p.c*p.T;
   return[{k:'渗透压 Π',v:F(P,2)+' kPa'},{k:'浓度 c',v:p.c+' mol/L'},{k:'温度 T',v:p.T+' K'},{k:'Π (atm)',v:F(P/101.325,4)+' atm'},{k:'Π (mOsm)',v:F(p.c*1000,1)+' mOsm/L'},{k:'生理盐水',v:'约 0.154 mol/L, 770 kPa'}];},
 tt:function(p){var P=8.314*p.c*p.T;
   return'【模型】渗透压 Π=cRT，与理想气体方程形式相同。\n\n【推演】\n· Π='+F(P,2)+' kPa\n· 生理盐水约 770 kPa\n\n【结论】细胞膜是半透膜，水分子从低浓度侧流向高浓度侧——这就是渗透。静脉注射必须用等渗溶液，否则红细胞会涨破或皱缩。';}},

{id:'ch9',name:'反应级数与速率方程',cat:'化学',tags:['动力学','级数'],br:'反应速率与浓度幂次成正比，级数由实验确定。',
 p:[P('k','速率常数 k',0.001,1,0.001,0.1,''),P('c0','初始浓度 c₀',0.1,5,0.1,1,'mol/L'),P('n','反应级数 n',0,3,1,1,'')],
 f:['v=k·[A]ⁿ','零级 c=c₀−kt','一级 ln(c/c₀)=−kt','二级 1/c−1/c₀=kt'],
 xR:[0,10],yR:[0,2],xT:10,yT:5,xL:'时间 t (s)',yL:'浓度 c (mol/L)',col:'#a78bfa',
 fn:function(p,x){if(p.n===0)return Math.max(0,p.c0-p.k*x);
   if(p.n===1)return p.c0*Math.exp(-p.k*x);
   if(p.n===2)return p.c0/(1+p.k*p.c0*x);
   return p.c0;},
 ro:function(p){return[{k:'速率常数 k',v:p.k},{k:'初始浓度 c₀',v:p.c0+' mol/L'},{k:'反应级数 n',v:p.n},{k:'速率 v₀',v:F(p.k*Math.pow(p.c0,p.n),4)+' mol/(L·s)'},{k:'半衰期',v:p.n===1?F(0.693/p.k,2)+' s':p.n===2?F(1/(p.k*p.c0),2)+' s':'—'},{k:'单位',v:p.n===1?'1/s':p.n===2?'L/(mol·s)':'mol/(L·s)'}];},
 tt:function(p){return'【模型】速率方程 v=k[A]ⁿ，n 为反应级数。\n\n【推演】\n· n='+p.n+' 级反应\n· v₀='+F(p.k*Math.pow(p.c0,p.n),4)+' mol/(L·s)\n'+(p.n===1?'· 半衰期 t½=0.693/k='+F(0.693/p.k,2)+' s（与浓度无关）':'')+'\n\n【结论】反应级数由实验测定，不能从化学计量式直接推断。';}},

{id:'ch10',name:'pH 与缓冲溶液',cat:'化学',tags:['酸碱','缓冲'],br:'缓冲溶液的 pH 由 Henderson-Hasselbalch 方程决定。',
 p:[P('pKa','pKa',2,12,0.1,4.76,''),P('cA','酸浓度 [HA]',0.01,1,0.01,0.1,'mol/L'),P('cB','共轭碱 [A⁻]',0.01,1,0.01,0.1,'mol/L')],
 f:['pH=pKa+lg([A⁻]/[HA])','缓冲容量 β','有效缓冲范围 pKa±1'],
 xR:[0,1],yR:[2,12],xT:10,yT:10,xL:'加入碱比例',yL:'pH',col:'#34d399',
 fn:function(p,x){return p.pKa+Math.log10((p.cB+x*(p.cA+p.cB)*0.5)/Math.max(p.cA-x*(p.cA+p.cB)*0.5,0.001));},
 mk:[{x:0,l:'初始',c:'#22d3ee'},{x:0.5,l:'半当量',c:'#fbbf24'}],
 ro:function(p){var pH=p.pKa+Math.log10(p.cB/p.cA);
   return[{k:'pH',v:F(pH,2)},{k:'pKa',v:p.pKa},{k:'[HA]',v:p.cA+' mol/L'},{k:'[A⁻]',v:p.cB+' mol/L'},{k:'比值 [A⁻]/[HA]',v:F(p.cB/p.cA,3)},{k:'缓冲能力',v:Math.min(p.cA,p.cB)>0.05?'强':'弱'}];},
 tt:function(p){var pH=p.pKa+Math.log10(p.cB/p.cA);
   return'【模型】Henderson-Hasselbalch 方程：pH=pKa+lg([A⁻]/[HA])。\n\n【推演】\n· pH='+F(pH,2)+'\n· [A⁻]/[HA]='+F(p.cB/p.cA,3)+'\n\n【结论】当 [A⁻]=[HA] 时 pH=pKa，缓冲能力最强。血液 pH 7.35-7.45 由碳酸/碳酸氢盐缓冲对维持。';}},

{id:'ch11',name:'溶度积与沉淀',cat:'化学',tags:['沉淀','Ksp'],br:'难溶电解质溶解平衡由 Ksp 描述，Q>Ksp 时沉淀。',
 p:[P('Ksp','溶度积 Ksp',1e-15,1e-3,1e-15,1.8e-10,''),P('cA','阳离子浓度',1e-6,0.1,1e-6,0.01,'mol/L'),P('cB','阴离子浓度',1e-6,0.1,1e-6,0.01,'mol/L')],
 f:['Ksp=[A⁺]ᵃ[B⁻]ᵇ','Q>Ksp 沉淀','Q<Ksp 溶解','Q=Ksp 饱和'],
 xR:[1e-6,0.1],yR:[1e-6,0.1],xT:10,yT:10,xL:'阳离子浓度',yL:'阴离子浓度',col:'#f472b6',
 fn:function(p,x){return p.Ksp/x;},
 ro:function(p){var Q=p.cA*p.cB;var ratio=Q/p.Ksp;
   return[{k:'离子积 Q',v:Q.toExponential(3)},{k:'Ksp',v:p.Ksp.toExponential(3)},{k:'Q/Ksp',v:F(ratio,3)},{k:'状态',v:ratio>1?'沉淀':ratio<1?'溶解':'饱和'},{k:'溶解度 s',v:F(Math.sqrt(p.Ksp),3)+' mol/L'},{k:'阳离子',v:p.cA.toExponential(2)+' mol/L'}];},
 tt:function(p){var Q=p.cA*p.cB;var r=Q/p.Ksp;
   return'【模型】溶度积规则：Q>Ksp 时生成沉淀。\n\n【推演】\n· Q='+Q.toExponential(3)+'\n· Ksp='+p.Ksp.toExponential(3)+'\n· Q/Ksp='+F(r,3)+'\n\n【结论】'+(r>1?'Q>Ksp，有沉淀生成。':r<1?'Q<Ksp，无沉淀或沉淀溶解。':'Q=Ksp，饱和溶液。')+'\n\n【延伸】同离子效应降低溶解度，络合效应提高溶解度。';}},

{id:'ch12',name:'能斯特方程',cat:'化学',tags:['电化学','电极'],br:'电极电势与浓度有关，E=E°−(RT/nF)·lnQ。',
 p:[P('E0','标准电势 E°',-2,2,0.05,1.1,'V'),P('n','转移电子数 n',1,4,1,2,''),P('Q','反应商 Q',1e-6,1e6,1e-6,1,'')],
 f:['E=E°−(0.0592/n)·lgQ','ΔG=−nFE','E>0 反应自发'],
 xR:[1e-6,1e6],yR:[-2,2],xT:10,yT:5,xL:'lg Q',yL:'电极电势 E (V)',col:'#22d3ee',
 fn:function(p,x){return p.E0-0.0592/p.n*Math.log10(x);},
 mk:[{x:1,l:'Q=1',c:'#fbbf24'}],
 ro:function(p){var E=p.E0-0.0592/p.n*Math.log10(p.Q);
   return[{k:'实际电势 E',v:F(E,3)+' V'},{k:'标准电势 E°',v:p.E0+' V'},{k:'lg Q',v:F(Math.log10(p.Q),3)},{k:'转移电子 n',v:p.n},{k:'ΔG',v:F(-p.n*96485*E/1000,2)+' kJ/mol'},{k:'自发性',v:E>0?'自发':'非自发'}];},
 tt:function(p){var E=p.E0-0.0592/p.n*Math.log10(p.Q);
   return'【模型】能斯特方程 E=E°−(0.0592/n)·lgQ。\n\n【推演】\n· E='+F(E,3)+' V\n· ΔG=−nFE='+F(-p.n*96485*E/1000,2)+' kJ/mol\n\n【结论】'+(E>0?'E>0，反应自发。':'E<0，反应非自发。')+'\n\n【延伸】这是原电池、电解池、pH 电极、生物膜电位的基础。';}}
];
for(var i=0;i<C3.length;i++){EXP.push(mkCurve(C3[i]));}

/* -------- 粒子类（8个）-------- */
var C4=[
{id:'pt1',name:'布朗运动',cat:'化学',tags:['热运动','分子'],br:'悬浮微粒受分子撞击产生无规则运动——分子热运动的直接证据。',
 p:[P('T','温度 T',200,500,10,300,'K'),P('v','黏度 η',0.5,5,0.1,1,'mPa·s')],
 f:['⟨x²⟩=2Dt','D=kT/(6πηr)','爱因斯坦关系式'],
 n:80,rMin:2,rMax:5,
 speed:function(p){return 0.2*Math.sqrt(p.T/300)/Math.sqrt(p.v);},
 hue:function(p){return 200+(p.T-200)/3;},
 ro:function(p){var D=1.381e-23*p.T/(6*Math.PI*p.v*1e-3*1e-6);
   return[{k:'扩散系数 D',v:D.toExponential(2)+' m²/s'},{k:'温度 T',v:p.T+' K'},{k:'黏度 η',v:p.v+' mPa·s'},{k:'均方位移',v:F(Math.sqrt(2*D*1)*1e6,2)+' μm/s'},{k:'平均动能',v:F(1.5*1.381e-23*p.T*1e21,2)+'×10⁻²¹ J'},{k:'热运动速度',v:F(Math.sqrt(3*1.381e-23*p.T/1e-20),1)+' m/s'}];},
 tt:function(p){return'【模型】布朗运动：悬浮微粒受周围流体分子不平衡撞击产生的无规则运动。\n\n【推演】\n· D=kT/(6πηr)\n· T='+p.T+' K, η='+p.v+' mPa·s\n\n【结论】1905年爱因斯坦用布朗运动理论证实了分子的真实存在，佩兰因此获1926年诺贝尔物理学奖。';}},

{id:'pt2',name:'气体扩散(格雷姆)',cat:'化学',tags:['扩散','气体'],br:'不同气体分子扩散速率与摩尔质量的平方根成反比。',
 p:[P('M1','气体1摩尔质量',2,100,1,2,'g/mol'),P('M2','气体2摩尔质量',2,100,1,32,'g/mol'),P('T','温度 T',200,600,10,300,'K')],
 f:['r₁/r₂=√(M₂/M₁)','v_rms=√(3RT/M)','格雷姆扩散定律'],
 n:60,rMin:2,rMax:4,
 speed:function(p){return 0.35*Math.sqrt(300/p.M2);},
 hue:function(p){return 280;},
 ro:function(p){var v1=Math.sqrt(3*8.314*p.T/(p.M1/1000));var v2=Math.sqrt(3*8.314*p.T/(p.M2/1000));
   return[{k:'气体1 v_rms',v:F(v1,1)+' m/s'},{k:'气体2 v_rms',v:F(v2,1)+' m/s'},{k:'扩散比 r₁/r₂',v:F(Math.sqrt(p.M2/p.M1),3)},{k:'摩尔质量比',v:F(p.M2/p.M1,2)},{k:'温度 T',v:p.T+' K'},{k:'平均动能比',v:'1.00'}];},
 tt:function(p){var r=Math.sqrt(p.M2/p.M1);return'【模型】格雷姆定律：气体扩散速率与摩尔质量平方根成反比。\n\n【推演】\n· r₁/r₂=√(M₂/M₁)='+F(r,3)+'\n· M₁='+p.M1+' g/mol, M₂='+p.M2+' g/mol\n\n【结论】氢气扩散最快，所以气球放几天就瘪了。铀同位素分离利用 UF₆ 的扩散速率差异。';}},

{id:'pt3',name:'分子热运动速率分布',cat:'化学',tags:['统计','分子'],br:'温度越高，分子运动越剧烈，速率分布越宽。',
 p:[P('T','温度 T',100,1000,10,300,'K')],
 f:['v_rms=√(3RT/M)','v_p=√(2RT/M)','v̄=√(8RT/πM)'],
 n:100,rMin:1.5,rMax:4,
 speed:function(p){return 0.15*Math.sqrt(p.T/300);},
 hue:function(p){return 30+200*(p.T-100)/900;},
 ro:function(p){var M=0.028;return[{k:'v_rms',v:F(Math.sqrt(3*8.314*p.T/M),0)+' m/s'},{k:'v_p',v:F(Math.sqrt(2*8.314*p.T/M),0)+' m/s'},{k:'v̄',v:F(Math.sqrt(8*8.314*p.T/(Math.PI*M)),0)+' m/s'},{k:'温度 T',v:p.T+' K'},{k:'平均动能',v:F(1.5*1.381e-23*p.T*1e21,2)+'×10⁻²¹ J'},{k:'分子(N₂)',v:'28 g/mol'}];},
 tt:function(p){return'【模型】分子热运动：温度越高速率分布越宽。\n\n【推演】\n· v_rms='+F(Math.sqrt(3*8.314*p.T/0.028),0)+' m/s\n· T='+p.T+' K\n\n【结论】温度升高，分子碰撞频率和力度都增大，这就是升温加快反应速率的微观原因。';}},

{id:'pt4',name:'荧光分子与激发态',cat:'化学',tags:['光化学','激发'],br:'分子吸收光子跃迁到激发态，回落到基态时释放荧光。',
 p:[P('lam','激发波长 λ',300,600,10,400,'nm'),P('kf','荧光速率 kf',1e6,1e9,1e6,1e8,'1/s'),P('knr','非辐射速率 knr',1e6,1e9,1e6,1e7,'1/s')],
 f:['量子产率 Φ=kf/(kf+knr)','荧光寿命 τ=1/(kf+knr)','Stokes 位移'],
 n:50,rMin:2,rMax:4,
 speed:function(p){return 0.3;},
 hue:function(p){return 260+50*p.kf/1e9;},
 ro:function(p){var ph=p.kf/(p.kf+p.knr);var tau=1/(p.kf+p.knr);
   return[{k:'量子产率 Φ',v:F(ph,3)},{k:'荧光寿命 τ',v:F(tau*1e9,2)+' ns'},{k:'kf',v:p.kf.toExponential(1)+' 1/s'},{k:'knr',v:p.knr.toExponential(1)+' 1/s'},{k:'激发波长',v:p.lam+' nm'},{k:'发射波长',v:F(p.lam*1.15,0)+' nm（估算）'}];},
 tt:function(p){var ph=p.kf/(p.kf+p.knr);var tau=1/(p.kf+p.knr);
   return'【模型】荧光：分子吸收光子后跃迁到激发态，回落到基态时发射荧光。\n\n【推演】\n· Φ=kf/(kf+knr)='+F(ph,3)+'\n· τ='+F(tau*1e9,2)+' ns\n\n【结论】荧光量子产率越高、寿命越长，荧光越亮。荧光显微镜、荧光探针、OLED 都基于此。';}},

{id:'pt5',name:'纳米颗粒表面等离子体',cat:'化学',tags:['纳米','等离子体'],br:'金属纳米颗粒表面电子集体振荡，呈现鲜艳颜色。',
 p:[P('d','粒径 d',5,100,1,20,'nm'),P('n','介质折射率 n',1,2,0.05,1.33,'')],
 f:['λ_SPR≈λp·√(εm+2n²)','摩尔消光系数∝粒径','颜色随尺寸变化'],
 n:70,rMin:2,rMax:6,
 speed:function(p){return 0.25;},
 hue:function(p){return 30+p.d*3;},
 ro:function(p){return[{k:'粒径 d',v:p.d+' nm'},{k:'介质折射率',v:p.n},{k:'SPR 波长',v:F(500+2*p.d,0)+' nm（估算）'},{k:'颜色',v:p.d<30?'红色':p.d<60?'紫色':'蓝色'},{k:'比表面积',v:F(6/(p.d*1e-9*19300),0)+' m²/kg'},{k:'应用',v:'生物传感、SERS'}];},
 tt:function(p){return'【模型】表面等离子体共振：金属纳米颗粒中自由电子集体振荡。\n\n【推演】\n· 粒径 d='+p.d+' nm\n· 颜色='+(p.d<30?'红色':p.d<60?'紫色':'蓝色')+'\n\n【结论】金纳米颗粒粒径不同呈现不同颜色——这就是古代"卢瑟福玻璃"和现代生物标记的原理。';}},

{id:'pt6',name:'扩散与渗透(膜)',cat:'化学',tags:['渗透','膜'],br:'溶质穿过半透膜从高浓度向低浓度扩散。',
 p:[P('D','扩散系数 D',1e-11,1e-8,1e-11,1e-9,'m²/s'),P('dc','浓度差 Δc',0.01,1,0.01,0.5,'mol/L')],
 f:['J=−D·dc/dx','菲克第一定律','渗透压 Π=cRT'],
 n:70,rMin:2,rMax:4,
 speed:function(p){return 0.1+Math.log10(p.D*1e11)/5;},
 hue:function(p){return 180;},
 ro:function(p){return[{k:'扩散系数 D',v:p.D.toExponential(2)+' m²/s'},{k:'浓度差 Δc',v:p.dc+' mol/L'},{k:'通量 J(1mm)',v:(p.D*p.dc/1e-3).toExponential(2)+' mol/(m²·s)'},{k:'扩散时间(1mm)',v:F(1e-6/(2*p.D),1)+' s'},{k:'渗透压',v:F(p.dc*8.314*298,1)+' kPa'},{k:'平衡状态',v:'动态平衡'}];},
 tt:function(p){return'【模型】菲克定律：J=−D·dc/dx。\n\n【推演】\n· D='+p.D.toExponential(2)+' m²/s\n· J='+(p.D*p.dc/1e-3).toExponential(2)+' mol/(m²·s)\n\n【结论】扩散是分子热运动的宏观表现。药物缓释、气体交换、膜分离都基于此。';}},

{id:'pt7',name:'酶催化反应动力学',cat:'化学',tags:['酶','动力学'],br:'酶促反应速率与底物浓度呈饱和曲线——米氏方程。',
 p:[P('Vmax','最大速率 Vmax',1,100,1,10,'μmol/min'),P('Km','米氏常数 Km',0.01,10,0.01,1,'mmol/L'),P('S','底物浓度 [S]',0.01,50,0.01,5,'mmol/L')],
 f:['v=Vmax·[S]/(Km+[S])','Km 为半饱和浓度','双倒数图 1/v vs 1/[S] 为直线'],
 n:60,rMin:2,rMax:5,
 speed:function(p){return 0.2+0.3*p.S/(p.Km+p.S);},
 hue:function(p){return 300;},
 ro:function(p){var v=p.Vmax*p.S/(p.Km+p.S);return[{k:'反应速率 v',v:F(v,3)+' μmol/min'},{k:'Vmax',v:p.Vmax+' μmol/min'},{k:'Km',v:p.Km+' mmol/L'},{k:'[S]',v:p.S+' mmol/L'},{k:'v/Vmax',v:F(v/p.Vmax,3)},{k:'催化效率',v:F(p.Vmax/p.Km,2)+' 1/min'}];},
 tt:function(p){var v=p.Vmax*p.S/(p.Km+p.S);
   return'【模型】米氏方程：v=Vmax·[S]/(Km+[S])。\n\n【推演】\n· v='+F(v,3)+' μmol/min\n· v/Vmax='+F(v/p.Vmax,3)+'\n\n【结论】'+(p.S<p.Km?'[S]<Km，速率近似与 [S] 成正比（一级）。':p.S>5*p.Km?'[S]>>Km，速率趋于 Vmax（零级）。':'过渡区。')+'\n\n【延伸】Km 反映酶与底物的亲和力，Km 越小亲和力越强。';}},

{id:'pt8',name:'化学反应碰撞理论',cat:'化学',tags:['动力学','碰撞'],br:'只有能量足够且方向正确的碰撞才能引发反应。',
 p:[P('T','温度 T',300,1000,10,500,'K'),P('Ea','活化能 Ea',10,200,5,50,'kJ/mol')],
 f:['有效碰撞分数 f=e^(−Ea/RT)','碰撞频率 Z','反应速率 ∝ Z·f'],
 n:100,rMin:1.5,rMax:3.5,
 speed:function(p){return 0.2*Math.sqrt(p.T/300);},
 hue:function(p){return 200+(p.T-300)/10;},
 ro:function(p){var f=Math.exp(-p.Ea*1000/(8.314*p.T));return[{k:'有效碰撞分数',v:f.toExponential(3)},{k:'温度 T',v:p.T+' K'},{k:'活化能 Ea',v:p.Ea+' kJ/mol'},{k:'RT (kJ/mol)',v:F(8.314*p.T/1000,2)},{k:'Ea/RT',v:F(p.Ea*1000/(8.314*p.T),2)},{k:'活化分子比例',v:F(f*100,4)+'%'}];},
 tt:function(p){var f=Math.exp(-p.Ea*1000/(8.314*p.T));
   return'【模型】碰撞理论：有效碰撞分数 f=exp(−Ea/RT)。\n\n【推演】\n· f='+f.toExponential(3)+'\n· 活化分子比例='+F(f*100,4)+'%\n\n【结论】只有极少数分子拥有超过 Ea 的能量。升温或加催化剂都能提高这一比例，加速反应。';}}
];
for(var i=0;i<C4.length;i++){EXP.push(mkPart(C4[i]));}

/* -------- 更多曲线类（35个）-------- */
var C5=[
{id:'k1',name:'玻尔兹曼分布因子',cat:'化学',tags:['统计','能量'],br:'分子在能级上的分布由玻尔兹曼因子决定。',
 p:[P('dE','能级差 ΔE',0.01,1,0.01,0.1,'eV'),P('T','温度 T',100,1000,10,298,'K')],
 f:['N₂/N₁=exp(−ΔE/kT)','k=1.381×10⁻²³ J/K','1 eV=1.602×10⁻¹⁹ J'],
 xR:[100,1000],yR:[0,1],xT:10,yT:5,xL:'温度 T (K)',yL:'相对布居 N₂/N₁',col:'#22d3ee',
 fn:function(p,x){return Math.exp(-p.dE*1.602e-19/(1.381e-23*x));},
 ro:function(p){var r=Math.exp(-p.dE*1.602e-19/(1.381e-23*p.T));
   return[{k:'N₂/N₁',v:r.toExponential(3)},{k:'能级差 ΔE',v:p.dE+' eV'},{k:'温度 T',v:p.T+' K'},{k:'ΔE (J)',v:(p.dE*1.602e-19).toExponential(2)+' J'},{k:'kT (eV)',v:F(1.381e-23*p.T/1.602e-19,4)+' eV'},{k:'ΔE/kT',v:F(p.dE*1.602e-19/(1.381e-23*p.T),2)}];},
 tt:function(p){var r=Math.exp(-p.dE*1.602e-19/(1.381e-23*p.T));
   return'【模型】玻尔兹曼分布：N₂/N₁=exp(−ΔE/kT)。\n\n【推演】\n· N₂/N₁='+r.toExponential(3)+'\n· ΔE='+p.dE+' eV, T='+p.T+'K\n\n【结论】温度越高，高能级分子越多。这是 NMR、光谱、反应动力学的核心。';}},

{id:'k2',name:'范德华气体方程',cat:'化学',tags:['气体','真实气体'],br:'考虑分子体积和分子间作用力，修正理想气体。',
 p:[P('a','分子间引力常数 a',0.01,1,0.01,0.14,'L²·bar/mol²'),P('b','分子体积常数 b',0.01,0.1,0.001,0.039,'L/mol'),P('T','温度 T',200,1000,10,300,'K'),P('V','体积 V',0.1,10,0.1,1,'L')],
 f:['(P+an²/V²)(V−nb)=nRT','a,b 为范德华常数','高温低压趋于理想气体'],
 xR:[0.1,10],yR:[0,50],xT:10,yT:5,xL:'体积 V (L)',yL:'压力 P (bar)',col:'#f472b6',
 fn:function(p,x){var n=1,R=0.08314;return (n*R*p.T/(x-p.b))-p.a/(x*x);},
 mk:[{x:1,l:'测试',c:'#fbbf24'}],
 ro:function(p){var R=0.08314;var P=R*p.T/(p.V-p.b)-p.a/(p.V*p.V);var Pi=R*p.T/p.V;
   return[{k:'实际压力 P',v:F(P,3)+' bar'},{k:'理想压力',v:F(Pi,3)+' bar'},{k:'偏差',v:F((P-Pi)/Pi*100,2)+'%'},{k:'a',v:p.a},{k:'b',v:p.b},{k:'V',v:p.V+' L'}];},
 tt:function(p){var R=0.08314;var P=R*p.T/(p.V-p.b)-p.a/(p.V*p.V);
   return'【模型】范德华方程：(P+an²/V²)(V−nb)=nRT。\n\n【推演】\n· P='+F(P,3)+' bar\n· a 项修正分子引力，b 项修正分子体积\n\n【结论】高温低压趋于理想气体；低温高压偏差大——真实气体可能液化。';}},

{id:'k3',name:'克拉珀龙-克劳修斯方程',cat:'化学',tags:['相变','蒸气压'],br:'液体蒸气压随温度指数增长，lnP=−ΔHvap/RT+C。',
 p:[P('dHv','汽化焓 ΔHvap',10,80,1,40,'kJ/mol'),P('T','温度 T',273,500,1,373,'K')],
 f:['ln(P₂/P₁)=−ΔHvap/R·(1/T₂−1/T₁)','克-克方程','特鲁顿规则 ΔHvap≈88·Tb'],
 xR:[250,500],yR:[0,200],xT:10,yT:5,xL:'温度 T (K)',yL:'蒸气压 (kPa)',col:'#fbbf24',
 fn:function(p,x){var R=8.314;var P1=101.325;var T1=373;return P1*Math.exp(-p.dHv*1000/R*(1/x-1/T1));},
 mk:[{x:373,l:'100°C',c:'#22d3ee'}],
 ro:function(p){var R=8.314;var P1=101.325;var T1=373;var P=P1*Math.exp(-p.dHv*1000/R*(1/p.T-1/T1));
   return[{k:'蒸气压 P',v:F(P,3)+' kPa'},{k:'ΔHvap',v:p.dHv+' kJ/mol'},{k:'温度 T',v:p.T+' K'},{k:'正常沸点',v:F(p.dHv*1000/(88*8.314),1)+' K（估算）'},{k:'P (atm)',v:F(P/101.325,4)+' atm'},{k:'ln(P)',v:F(Math.log(P),3)}];},
 tt:function(p){var R=8.314;var P1=101.325;var T1=373;var P=P1*Math.exp(-p.dHv*1000/R*(1/p.T-1/T1));
   return'【模型】克劳修斯-克拉珀龙方程：ln(P₂/P₁)=−ΔHvap/R·(1/T₂−1/T₁)。\n\n【推演】\n· 温度 '+p.T+' K 时蒸气压='+F(P,3)+' kPa\n· ΔHvap='+p.dHv+' kJ/mol\n\n【结论】这是"高压锅"原理——压力高沸点升高。也是"高原煮不熟饭"的原因。';}},

{id:'k4',name:'一级反应动力学',cat:'化学',tags:['动力学','指数'],br:'反应物浓度随时间指数衰减，lnc=−kt+lnc₀。',
 p:[P('k','速率常数 k',0.01,1,0.01,0.1,'1/s'),P('c0','初始浓度 c₀',0.1,5,0.1,1,'mol/L')],
 f:['lnc=−kt+lnc₀','c=c₀·e^(−kt)','t½=0.693/k'],
 xR:[0,50],yR:[0,2],xT:10,yT:5,xL:'时间 t (s)',yL:'浓度 c (mol/L)',col:'#22d3ee',
 fn:function(p,x){return p.c0*Math.exp(-p.k*x);},
 ro:function(p){return[{k:'半衰期 t½',v:F(0.693/p.k,3)+' s'},{k:'k',v:p.k+' 1/s'},{k:'c₀',v:p.c0+' mol/L'},{k:'5t½ 后',v:F(p.c0*Math.pow(0.5,5),5)+' mol/L'},{k:'10t½ 后',v:F(p.c0*Math.pow(0.5,10),5)+' mol/L'},{k:'ln2',v:F(Math.log(2),4)}];},
 tt:function(p){return'【模型】一级反应 c=c₀e^(−kt)，半衰期与浓度无关。\n\n【推演】\n· t½=0.693/k='+F(0.693/p.k,3)+' s\n· 5 个半衰期后剩余='+F(p.c0*Math.pow(0.5,5),5)+' mol/L\n\n【结论】这是最简单的动力学——放射性衰变、药物代谢、热分解多是这个模型。';}},

{id:'k5',name:'二级反应动力学',cat:'化学',tags:['动力学','倒数'],br:'反应物浓度倒数与时间线性增长，1/c=kt+1/c₀。',
 p:[P('k','速率常数 k',0.01,1,0.01,0.05,'L/(mol·s)'),P('c0','初始浓度 c₀',0.1,5,0.1,1,'mol/L')],
 f:['1/c=kt+1/c₀','c=c₀/(1+c₀kt)','t½=1/(kc₀)'],
 xR:[0,50],yR:[0,2],xT:10,yT:5,xL:'时间 t (s)',yL:'浓度 c (mol/L)',col:'#a78bfa',
 fn:function(p,x){return p.c0/(1+p.c0*p.k*x);},
 ro:function(p){return[{k:'半衰期 t½',v:F(1/(p.k*p.c0),3)+' s'},{k:'k',v:p.k+' L/(mol·s)'},{k:'c₀',v:p.c0+' mol/L'},{k:'2t½ 后',v:F(p.c0/3,4)+' mol/L'},{k:'5t½ 后',v:F(p.c0/6,4)+' mol/L'},{k:'倒数斜率',v:p.k+' L/(mol·s)'}];},
 tt:function(p){return'【模型】二级反应 1/c=1/c₀+kt，半衰期与初始浓度成反比。\n\n【推演】\n· t½=1/(kc₀)='+F(1/(p.k*p.c0),3)+' s\n· 2t½ 后剩余='+F(p.c0/3,4)+' mol/L\n\n【结论】浓度越低，二级反应越慢——所以低浓度反应常用一级近似。';}},

{id:'k6',name:'米氏方程(酶动力学)',cat:'化学',tags:['酶','动力学'],br:'酶促反应速率与底物浓度的饱和曲线。',
 p:[P('Vmax','Vmax',1,100,1,10,'μmol/min'),P('Km','Km',0.01,10,0.01,1,'mmol/L')],
 f:['v=Vmax·[S]/(Km+[S])','[S]=Km 时 v=Vmax/2','双倒数图'],
 xR:[0,50],yR:[0,12],xT:10,yT:6,xL:'底物浓度 [S] (mmol/L)',yL:'速率 v (μmol/min)',col:'#34d399',
 fn:function(p,x){return p.Vmax*x/(p.Km+x);},
 mk:[{x:1,l:'Km',c:'#fbbf24'}],
 ro:function(p){return[{k:'Vmax',v:p.Vmax+' μmol/min'},{k:'Km',v:p.Km+' mmol/L'},{k:'[S]=Km 时 v',v:F(p.Vmax/2,3)+' μmol/min'},{k:'[S]→0 斜率',v:F(p.Vmax/p.Km,2)},{k:'[S]→∞ v',v:p.Vmax+' μmol/min'},{k:'催化效率 kcat/Km',v:F(p.Vmax/(p.Km*10),2)}];},
 tt:function(p){return'【模型】米氏方程 v=Vmax[S]/(Km+[S])，是酶动力学的基础。\n\n【推演】\n· Vmax='+p.Vmax+' μmol/min\n· Km='+p.Km+' mmol/L\n· [S]=Km 时 v=Vmax/2='+F(p.Vmax/2,3)+'\n\n【结论】低 [S] 一级，高 [S] 零级（酶饱和）。Km 越小酶与底物亲和力越强。';}},

{id:'k7',name:'竞争性抑制',cat:'化学',tags:['酶','抑制'],br:'抑制剂与底物竞争酶活性位点，表观 Km 增大。',
 p:[P('Vmax','Vmax',1,100,1,10,'μmol/min'),P('Km','Km',0.01,10,0.01,1,'mmol/L'),P('I','抑制剂 [I]',0,10,0.1,2,'mmol/L'),P('Ki','抑制常数 Ki',0.01,10,0.01,1,'mmol/L')],
 f:['v=Vmax[S]/(Km(1+[I]/Ki)+[S])','表观 Km 增大','Vmax 不变'],
 xR:[0,50],yR:[0,12],xT:10,yT:6,xL:'底物浓度 [S]',yL:'速率 v (μmol/min)',col:'#f472b6',
 fn:function(p,x){return p.Vmax*x/(p.Km*(1+p.I/p.Ki)+x);},
 ro:function(p){var Kmapp=p.Km*(1+p.I/p.Ki);return[{k:'表观 Km',v:F(Kmapp,3)+' mmol/L'},{k:'Vmax',v:p.Vmax+' μmol/min'},{k:'[I]',v:p.I+' mmol/L'},{k:'Ki',v:p.Ki+' mmol/L'},{k:'抑制程度',v:F((1+p.I/p.Ki),3)+'×'},{k:'半饱和 [S]',v:F(Kmapp,3)+' mmol/L'}];},
 tt:function(p){var Kmapp=p.Km*(1+p.I/p.Ki);
   return'【模型】竞争性抑制：抑制剂与底物竞争活性位点。\n\n【推演】\n· 表观 Km='+F(Kmapp,3)+' mmol/L\n· Vmax 不变\n\n【结论】增加 [S] 可克服竞争性抑制。很多药物是酶的竞争性抑制剂（如他汀类）。';}},

{id:'k8',name:'电导率与浓度',cat:'化学',tags:['电化学','电导'],br:'强电解质摩尔电导率随浓度降低而增大，弱电解质差异明显。',
 p:[P('L0','极限摩尔电导率 Λ°',0.001,0.1,0.001,0.012,'S·m²/mol'),P('K','解离常数 K',1e-6,1e-1,1e-6,1e-3,'')],
 f:['Λ=Λ°·α','α=√(K/c)','Kohlrausch 定律'],
 xR:[1e-4,1],yR:[0,0.012],xT:10,yT:5,xL:'浓度 c (mol/L)',yL:'摩尔电导率 Λ (S·m²/mol)',col:'#22d3ee',
 fn:function(p,x){var a=Math.sqrt(p.K/x);if(a>1)a=1;return p.L0*a;},
 ro:function(p){var c=0.01;var a=Math.sqrt(p.K/c);if(a>1)a=1;
   return[{k:'解离度 α',v:F(a*100,3)+'%'},{k:'Λ°',v:p.L0+' S·m²/mol'},{k:'K',v:p.K.toExponential(2)},{k:'c=0.01M Λ',v:F(p.L0*a,5)+' S·m²/mol'},{k:'pH(弱酸)',v:F(-Math.log10(Math.sqrt(p.K*c)),2)},{k:'类型',v:p.K<0.01?'弱电解质':'强电解质'}];},
 tt:function(p){var c=0.01;var a=Math.sqrt(p.K/c);if(a>1)a=1;
   return'【模型】摩尔电导率 Λ=Λ°·α，弱电解质 α<1。\n\n【推演】\n· α='+F(a*100,3)+'% (c=0.01M)\n· Λ='+F(p.L0*a,5)+'\n\n【结论】通过电导率可以求弱电解质的解离度 Ka，这是物理化学经典实验。';}},

{id:'k9',name:'原电池电动势(Nernst)',cat:'化学',tags:['电化学','电池'],br:'电池电动势随浓度变化，遵循 Nernst 方程。',
 p:[P('E0','标准电动势 E°',0.1,3,0.05,1.1,'V'),P('n','电子数 n',1,4,1,2,''),P('Q','反应商 Q',1e-6,1e6,1e-6,1,'')],
 f:['E=E°−(0.0592/n)·lgQ','ΔG=−nFE','E>0 电池自发'],
 xR:[1e-6,1e6],yR:[0,2],xT:10,yT:5,xL:'lg Q',yL:'E (V)',col:'#34d399',
 fn:function(p,x){return p.E0-0.0592/p.n*Math.log10(x);},
 ro:function(p){var E=p.E0-0.0592/p.n*Math.log10(p.Q);
   return[{k:'E',v:F(E,4)+' V'},{k:'E°',v:p.E0+' V'},{k:'n',v:p.n},{k:'lg Q',v:F(Math.log10(p.Q),2)},{k:'ΔG',v:F(-p.n*96485*E/1000,3)+' kJ/mol'},{k:'ΔG°',v:F(-p.n*96485*p.E0/1000,3)+' kJ/mol'}];},
 tt:function(p){var E=p.E0-0.0592/p.n*Math.log10(p.Q);
   return'【模型】Nernst 方程 E=E°−(0.0592/n)lgQ。\n\n【推演】\n· E='+F(E,4)+' V\n· ΔG=−nFE='+F(-p.n*96485*E/1000,3)+' kJ/mol\n\n【结论】丹尼尔电池、燃料电池、pH 电极都遵循这个方程。';}},

{id:'k10',name:'反应进度与平衡',cat:'化学',tags:['平衡','转化率'],br:'反应进度 ξ 描述反应进行的程度，平衡时 ΔG=0。',
 p:[P('K','平衡常数 K',0.1,100,0.1,10,''),P('c0','初始浓度 c₀',0.1,5,0.1,1,'mol/L')],
 f:['K=[产物]/[反应物]','转化率 α','平衡时 Q=K'],
 xR:[0,1],yR:[0,1],xT:10,yT:5,xL:'反应进度 ξ',yL:'转化率 α',col:'#fbbf24',
 fn:function(p,x){var K=p.K;if(K===1)return x;var a=K-1;if(Math.abs(a)<1e-6)return x;
   var disc=Math.sqrt(a*a+4*K*x*x);return (a+disc)/(2*a)*x;},
 ro:function(p){var a=p.K/(1+p.K);return[{k:'平衡转化率',v:F(a*100,2)+'%'},{k:'K',v:p.K},{k:'c₀',v:p.c0+' mol/L'},{k:'平衡浓度(产物)',v:F(p.c0*a,3)+' mol/L'},{k:'平衡浓度(反应物)',v:F(p.c0*(1-a),3)+' mol/L'},{k:'方向',v:p.K>1?'正反应':p.K<1?'逆反应':'平衡'}];},
 tt:function(p){var a=p.K/(1+p.K);return'【模型】平衡常数 K 决定反应进行的程度。\n\n【推演】\n· K='+p.K+'\n· 转化率='+F(a*100,2)+'%\n\n【结论】K>>1 反应彻底；K<<1 几乎不反应；K≈1 平衡转化率约 50%。';}},

{id:'k11',name:'氧化还原电位-pH图',cat:'化学',tags:['电化学','pH'],br:'水溶液中氧化还原电位随 pH 变化。',
 p:[P('E0','标准电位 E°',-1,2,0.05,0.8,'V'),P('n','电子数 n',1,4,1,1,''),P('m','H⁺数 m',0,4,1,2,''),P('pH','pH',0,14,0.5,7,'')],
 f:['E=E°−(0.0592m/n)·pH','Pourbaix 图','水的稳定区'],
 xR:[0,14],yR:[-1,2],xT:7,yT:6,xL:'pH',yL:'电位 E (V)',col:'#22d3ee',
 fn:function(p,x){return p.E0-0.0592*p.m/p.n*x;},
 ro:function(p){var E=p.E0-0.0592*p.m/p.n*p.pH;
   return[{k:'实际电位 E',v:F(E,4)+' V'},{k:'E°',v:p.E0+' V'},{k:'pH',v:p.pH},{k:'斜率',v:F(-0.0592*p.m/p.n,4)+' V/pH'},{k:'n',v:p.n},{k:'m',v:p.m}];},
 tt:function(p){var E=p.E0-0.0592*p.m/p.n*p.pH;
   return'【模型】Pourbaix 电位-pH 图：E=E°−(0.0592m/n)·pH。\n\n【推演】\n· pH='+p.pH+' 时 E='+F(E,4)+' V\n· 斜率='+F(-0.0592*p.m/p.n,4)+' V/pH\n\n【结论】用于判断金属在水中的腐蚀、钝化或免疫区，是腐蚀科学的基石。';}},

{id:'k12',name:'摩尔电导率与温度',cat:'化学',tags:['电化学','温度'],br:'电导率随温度升高而增大。',
 p:[P('L25','25°C 电导率',0.001,0.1,0.001,0.01,'S/m'),P('a','温度系数',0.01,0.05,0.001,0.02,'1/K')],
 f:['Λ(T)=Λ(25°C)·[1+a(T−25)]','离子迁移','Kohlrausch 经验公式'],
 xR:[0,100],yR:[0,0.03],xT:10,yT:5,xL:'温度 T (°C)',yL:'电导率 (S/m)',col:'#fbbf24',
 fn:function(p,x){return p.L25*(1+p.a*(x-25));},
 ro:function(p){return[{k:'25°C 电导率',v:p.L25+' S/m'},{k:'温度系数 a',v:p.a+' 1/K'},{k:'0°C 电导率',v:F(p.L25*(1+p.a*(0-25)),5)+' S/m'},{k:'100°C 电导率',v:F(p.L25*(1+p.a*(100-25)),5)+' S/m'},{k:'增长比',v:F(p.a*75*100,1)+'%'},{k:'机理',v:'离子迁移率↑'}];},
 tt:function(p){return'【模型】电解质电导率随温度升高而增大。\n\n【推演】\n· 25°C: '+p.L25+' S/m\n· 100°C: '+F(p.L25*(1+p.a*75),5)+' S/m\n· 增长 '+F(p.a*75*100,1)+'%\n\n【结论】温度升高离子迁移率增大，导电能力增强。所以热水比冷水更容易导电。';}},

{id:'k13',name:'比表面与催化',cat:'化学',tags:['催化','表面'],br:'催化剂比表面积越大，活性越高。',
 p:[P('d','催化剂粒径 d',1,1000,1,10,'nm'),P('A','比表面积系数',1,100,1,3,''),P('k','本征活性 k',0.001,1,0.001,0.1,'')],
 f:['S=6/(ρd)','比表面随粒径减小急剧增大','活性∝k·S'],
 xR:[1,1000],yR:[0,100],xT:10,yT:5,xL:'粒径 d (nm)',yL:'比表面 (m²/g)',col:'#f472b6',
 fn:function(p,x){return 6/(19300*(x*1e-9))/1000*p.A;},
 ro:function(p){return[{k:'比表面积',v:F(6/(19300*p.d*1e-9)/1000*p.A,3)+' m²/g'},{k:'粒径 d',v:p.d+' nm'},{k:'本征活性 k',v:p.k},{k:'相对活性',v:F(p.k*6/(19300*p.d*1e-9)/1000*p.A,3)},{k:'体积表面比',v:F(6/p.d,3)+' nm⁻¹'},{k:'应用',v:'纳米催化、燃料电池'}];},
 tt:function(p){return'【模型】比表面积 S=6/(ρd)，粒径越小，表面积越大。\n\n【推演】\n· d='+p.d+' nm\n· S='+F(6/(19300*p.d*1e-9)/1000*p.A,3)+' m²/g\n\n【结论】纳米催化剂活性高，就是因为比表面巨大。1g 纳米金可以铺满几个足球场！';}},

{id:'k14',name:'沉降平衡',cat:'化学',tags:['胶体','沉降'],br:'胶体粒子在重力场中形成浓度梯度。',
 p:[P('r','粒子半径 r',1,1000,1,100,'nm'),P('drho','密度差 Δρ',0.1,5,0.1,1,'g/cm³'),P('T','温度 T',273,373,1,298,'K')],
 f:['浓度分布 c(h)=c₀·exp(−mgh/kT)','沉降速度 v=2r²Δρg/(9η)','高度分布'],
 xR:[0,10],yR:[0,1],xT:10,yT:5,xL:'高度 h (cm)',yL:'相对浓度 c/c₀',col:'#22d3ee',
 fn:function(p,x){var m=(4/3)*Math.PI*Math.pow(p.r*1e-9,3)*p.drho*1000;
   var kT=1.381e-23*p.T;var h=x*0.01;return Math.exp(-m*9.8*h/kT);},
 ro:function(p){var m=(4/3)*Math.PI*Math.pow(p.r*1e-9,3)*p.drho*1000;
   var kT=1.381e-23*p.T;
   return[{k:'粒子质量 m',v:m.toExponential(2)+' kg'},{k:'mgh/kT (h=1cm)',v:F(m*9.8*0.01/kT,3)},{k:'10cm 相对浓度',v:F(Math.exp(-m*9.8*0.1/kT),4)},{k:'粒径 r',v:p.r+' nm'},{k:'Δρ',v:p.drho+' g/cm³'},{k:'温度 T',v:p.T+' K'}];},
 tt:function(p){var m=(4/3)*Math.PI*Math.pow(p.r*1e-9,3)*p.drho*1000;var kT=1.381e-23*p.T;
   return'【模型】沉降平衡：浓度按玻尔兹曼分布 c(h)=c₀·exp(−mgh/kT)。\n\n【推演】\n· 粒子质量='+m.toExponential(2)+' kg\n· h=10cm 处浓度比='+F(Math.exp(-m*9.8*0.1/kT),4)+'\n\n【结论】粒子越小，沉降越不明显。这就是超速离心机可以分离蛋白质和病毒的原理。';}},

{id:'k15',name:'超速离心沉降速度',cat:'化学',tags:['胶体','离心'],br:'离心力场中粒子以恒定速度沉降，与粒径平方成正比。',
 p:[P('r','粒子半径 r',1,100,1,10,'nm'),P('drho','密度差 Δρ',0.1,5,0.1,0.5,'g/cm³'),P('omega','角速度 ω',1000,100000,100,10000,'rpm'),P('eta','黏度 η',1,10,0.1,1,'mPa·s')],
 f:['v=2r²Δρ·ω²R/(9η)','沉降系数 s=v/(ω²R)','Svedberg 单位 10⁻¹³ s'],
 xR:[1000,100000],yR:[0,1],xT:10,yT:5,xL:'转速 (rpm)',yL:'相对沉降速度',col:'#fbbf24',
 fn:function(p,x){var w=x*2*Math.PI/60;return w*w/1e8;},
 ro:function(p){var w=p.omega*2*Math.PI/60;var R=0.1;
   var v=2*Math.pow(p.r*1e-9,2)*p.drho*1000*w*w*R/(9*p.eta*1e-3);
   return[{k:'沉降速度 v',v:v.toExponential(2)+' m/s'},{k:'沉降系数 s',v:(v/(w*w*R)*1e13).toFixed(1)+' S'},{k:'粒径 r',v:p.r+' nm'},{k:'转速',v:p.omega+' rpm'},{k:'离心加速度',v:(w*w*R/9.8).toFixed(0)+' g'},{k:'Δρ',v:p.drho+' g/cm³'}];},
 tt:function(p){var w=p.omega*2*Math.PI/60;var R=0.1;
   var v=2*Math.pow(p.r*1e-9,2)*p.drho*1000*w*w*R/(9*p.eta*1e-3);
   return'【模型】离心沉降：v=2r²Δρ·ω²R/(9η)。\n\n【推演】\n· v='+v.toExponential(2)+' m/s\n· 离心加速度约 '+(w*w*R/9.8).toFixed(0)+' g\n\n【结论】超速离心机可达 10⁵ g，能分离蛋白质、核酸、病毒。Svedberg 单位用于描述沉降系数。';}},

{id:'k16',name:'光散射与瑞利散射',cat:'化学',tags:['光学','散射'],br:'光被小于波长的粒子散射，强度与 λ⁻⁴ 成正比。',
 p:[P('lam','波长 λ',300,800,10,550,'nm'),P('d','粒子直径 d',1,100,1,20,'nm')],
 f:['I∝1/λ⁴','瑞利散射','天空为什么是蓝的'],
 xR:[300,800],yR:[0,1],xT:10,yT:5,xL:'波长 λ (nm)',yL:'相对散射强度',col:'#22d3ee',
 fn:function(p,x){return Math.pow(550/x,4);},
 ro:function(p){return[{k:'散射强度比',v:F(Math.pow(550/p.lam,4),3)+' (相对 550nm)'},{k:'波长 λ',v:p.lam+' nm'},{k:'粒子直径',v:p.d+' nm'},{k:'d/λ',v:F(p.d/p.lam,4)},{k:'散射类型',v:p.d<p.lam/10?'瑞利散射':'米散射'},{k:'颜色',v:p.lam<450?'紫蓝':p.lam<500?'蓝':p.lam<580?'绿黄':p.lam<650?'橙红':'红'}];},
 tt:function(p){return'【模型】瑞利散射 I∝1/λ⁴，短波散射更强。\n\n【推演】\n· λ='+p.lam+' nm，散射强度='+F(Math.pow(550/p.lam,4),3)+'\n· d/λ='+F(p.d/p.lam,4)+' → '+(p.d<p.lam/10?'瑞利散射':'米散射')+'\n\n【结论】蓝光波长短散射强，所以天空是蓝色；日落时阳光斜穿大气，蓝光被散射殆尽，剩下红光——晚霞红。';}},

{id:'k17',name:'X射线衍射布拉格',cat:'化学',tags:['晶体','衍射'],br:'X射线在晶体上衍射满足 2dsinθ=nλ。',
 p:[P('d','晶面间距 d',1,10,0.1,3,'Å'),P('lam','X射线波长 λ',0.5,2.5,0.01,1.54,'Å')],
 f:['2d·sinθ=nλ','布拉格方程','n 为衍射级数'],
 xR:[5,90],yR:[0,5],xT:10,yT:5,xL:'衍射角 θ (°)',yL:'衍射级数 n',col:'#a78bfa',
 fn:function(p,x){var r=x*Math.PI/180;var n=2*p.d*Math.sin(r)/p.lam;return Math.floor(n);},
 mk:[{x:30,l:'典型',c:'#fbbf24'}],
 ro:function(p){var r=30*Math.PI/180;var n=2*p.d*Math.sin(r)/p.lam;
   return[{k:'衍射级数 n',v:F(n,3)},{k:'晶面间距 d',v:p.d+' Å'},{k:'波长 λ',v:p.lam+' Å'},{k:'2d/λ',v:F(2*p.d/p.lam,3)},{k:'最大 n',v:F(2*p.d/p.lam,2)},{k:'应用',v:'晶体结构解析'}];},
 tt:function(p){return'【模型】布拉格方程 2dsinθ=nλ。\n\n【推演】\n· d='+p.d+' Å, λ='+p.lam+' Å\n· 最大衍射级数='+F(2*p.d/p.lam,2)+'\n\n【结论】布拉格父子用此解决晶体结构，1915年获诺贝尔物理学奖。DNA 双螺旋结构就是用 XRD 解出的。';}},

{id:'k18',name:'量子隧穿概率',cat:'化学',tags:['量子','隧穿'],br:'粒子能穿过经典禁区，概率随势垒宽度指数衰减。',
 p:[P('k','衰减常数 κ',0.1,10,0.1,1,'Å⁻¹'),P('a','势垒宽度 a',0.1,5,0.1,1,'Å')],
 f:['T≈exp(−2κa)','κ=√(2m(V−E))/ℏ','扫描隧道显微镜原理'],
 xR:[0,5],yR:[0,1],xT:10,yT:5,xL:'势垒宽度 a (Å)',yL:'隧穿概率 T',col:'#f472b6',
 fn:function(p,x){return Math.exp(-2*p.k*x);},
 ro:function(p){var T=Math.exp(-2*p.k*p.a);
   return[{k:'隧穿概率 T',v:T.toExponential(3)},{k:'κ',v:p.k+' Å⁻¹'},{k:'势垒宽度 a',v:p.a+' Å'},{k:'2κa',v:F(2*p.k*p.a,3)},{k:'电流比(1Å)',v:F(Math.exp(-2*p.k*1),4)},{k:'应用',v:'STM、隧道二极管'}];},
 tt:function(p){var T=Math.exp(-2*p.k*p.a);
   return'【模型】量子隧穿：T≈exp(−2κa)，概率随势垒宽度指数衰减。\n\n【推演】\n· T='+T.toExponential(3)+'\n· 势垒宽度='+p.a+' Å\n\n【结论】隧穿是量子力学的核心效应。STM 利用隧穿电流对距离的极端敏感性实现原子级成像，1986年获诺贝尔奖。';}},

{id:'k19',name:'势能曲线-双原子分子',cat:'化学',tags:['分子','势能'],br:'双原子分子的势能随原子间距变化，Lennard-Jones 势。',
 p:[P('eps','势阱深度 ε',0.01,1,0.01,0.1,'eV'),P('sig','平衡距离 σ',1,5,0.1,3,'Å')],
 f:['V(r)=4ε[(σ/r)¹²−(σ/r)⁶]','Lennard-Jones 势','平衡距离≈σ'],
 xR:[1,10],yR:[-0.15,0.5],xT:10,yT:6,xL:'原子间距 r (Å)',yL:'势能 V (eV)',col:'#22d3ee',
 fn:function(p,x){var t=p.sig/x;return 4*p.eps*(Math.pow(t,12)-Math.pow(t,6));},
 mk:[{x:3,l:'σ',c:'#fbbf24'}],
 ro:function(p){return[{k:'势阱深度 ε',v:p.eps+' eV'},{k:'平衡距离 σ',v:p.sig+' Å'},{k:'最小势能',v:F(-p.eps,3)+' eV'},{k:'解离能',v:F(p.eps,3)+' eV'},{k:'典型分子',v:p.sig<3?'H₂':p.sig<4?'N₂':'I₂'},{k:'类型',v:'范德华/共价'}];},
 tt:function(p){return'【模型】Lennard-Jones 势：V(r)=4ε[(σ/r)¹²−(σ/r)⁶]。\n\n【推演】\n· ε='+p.eps+' eV, σ='+p.sig+' Å\n· 最小势能=−ε='+F(-p.eps,3)+' eV\n\n【结论】r⁻¹² 是泡利排斥，r⁻⁶ 是范德华引力。分子动力学模拟的核心势函数。';}},

{id:'k20',name:'反应坐标与能垒',cat:'化学',tags:['动力学','过渡态'],br:'反应物经渡态到达产物，能垒决定反应速率。',
 p:[P('dH','反应焓变 ΔH',-100,100,5,-30,'kJ/mol'),P('Ea','活化能 Ea',20,200,5,80,'kJ/mol')],
 f:['Ea 决定速率','ΔH 决定热效应','ΔH=Ea(正)−Ea(逆)'],
 xR:[0,1],yR:[-150,150],xT:5,yT:6,xL:'反应坐标',yL:'能量 (kJ/mol)',col:'#f472b6',
 fn:function(p,x){var t=(x-0.5)*2;var E=p.Ea*Math.exp(-t*t*3)-p.dH*0.5*(1-Math.tanh(t*2));return E;},
 mk:[{x:0,l:'反应物',c:'#22d3ee'},{x:0.5,l:'过渡态',c:'#fbbf24'},{x:1,l:'产物',c:'#34d399'}],
 ro:function(p){var EaR=p.Ea-p.dH;return[{k:'正反应 Ea',v:F(p.Ea,1)+' kJ/mol'},{k:'逆反应 Ea',v:F(EaR,1)+' kJ/mol'},{k:'ΔH',v:p.dH+' kJ/mol'},{k:'ΔH 类型',v:p.dH<0?'放热':p.dH>0?'吸热':'热中性'},{k:'K (298K)',v:F(Math.exp(-p.dH*1000/(8.314*298)),3)},{k:'ΔG°',v:p.dH+' kJ/mol（近似）'}];},
 tt:function(p){var EaR=p.Ea-p.dH;
   return'【模型】反应坐标图：Ea 决定反应速率，ΔH 决定热效应。\n\n【推演】\n· 正反应 Ea='+F(p.Ea,1)+' kJ/mol\n· 逆反应 Ea='+F(EaR,1)+' kJ/mol\n· ΔH='+p.dH+' kJ/mol\n\n【结论】'+(p.dH<0?'放热反应：正反应 Ea 低，更容易进行。':p.dH>0?'吸热反应：逆反应 Ea 低，产物稳定。':'热中性。')+'\n\n【延伸】催化剂降低 Ea，不改变 ΔH。';}},

{id:'k21',name:'微波旋转光谱',cat:'化学',tags:['光谱','转动'],br:'分子转动能级间距对应微波波段。',
 p:[P('B','转动常数 B',0.1,20,0.1,2,'cm⁻¹'),P('J','转动量子数 J',0,20,1,5,'')],
 f:['E=hcB·J(J+1)','ΔJ=±1 选择定则','波数 ν̃=2B(J+1)'],
 xR:[0,20],yR:[0,1500],xT:10,yT:5,xL:'转动量子数 J',yL:'转动能 (cm⁻¹)',col:'#a78bfa',
 fn:function(p,x){return p.B*x*(x+1);},
 mk:[{x:5,l:'测试',c:'#fbbf24'}],
 ro:function(p){var E=p.B*p.J*(p.J+1);var nu=2*p.B*(p.J+1);
   return[{k:'转动能 E',v:F(E,2)+' cm⁻¹'},{k:'相邻跃迁频率',v:F(nu,2)+' cm⁻¹'},{k:'B',v:p.B+' cm⁻¹'},{k:'J',v:p.J},{k:'波数 (nm)',v:F(1e7/nu,0)+' nm（μ波）'},{k:'转动惯量 I',v:F(1.66e-47/(p.B*1e2*1e-2),3)+' kg·m²'}];},
 tt:function(p){var nu=2*p.B*(p.J+1);
   return'【模型】转动能级 E=hcB·J(J+1)，ΔJ=±1。\n\n【推演】\n· E='+F(p.B*p.J*(p.J+1),2)+' cm⁻¹\n· 相邻跃迁='+F(nu,2)+' cm⁻¹\n\n【结论】微波旋转光谱可以精确测定键长——分子的"尺子"。';}},

{id:'k22',name:'振动光谱(谐振子)',cat:'化学',tags:['光谱','振动'],br:'分子振动能级等间距，红外光谱的量子基础。',
 p:[P('nu','振动频率 ν̃',100,4000,10,1500,'cm⁻¹'),P('v','振动量子数 v',0,10,1,3,'')],
 f:['E=(v+½)hν','Δv=±1','零点能 E₀=½hν'],
 xR:[0,10],yR:[0,40000],xT:10,yT:5,xL:'振动量子数 v',yL:'振动能 (cm⁻¹)',col:'#22d3ee',
 fn:function(p,x){return p.nu*(x+0.5);},
 ro:function(p){var E=p.nu*(p.v+0.5);
   return[{k:'振动能 E',v:F(E,1)+' cm⁻¹'},{k:'ν̃',v:p.nu+' cm⁻¹'},{k:'零点能',v:F(p.nu/2,1)+' cm⁻¹'},{k:'v',v:p.v},{k:'跃迁频率',v:p.nu+' cm⁻¹'},{k:'典型键',v:p.nu<1500?'C-C 骨架':p.nu<2500?'C=O, C≡C':'O-H, N-H'}];},
 tt:function(p){var E=p.nu*(p.v+0.5);
   return'【模型】谐振子能级 E=(v+½)hν，等间距。\n\n【推演】\n· E='+F(E,1)+' cm⁻¹\n· 零点能='+F(p.nu/2,1)+' cm⁻¹\n\n【结论】红外光谱通过吸收峰位置识别官能团——化学家的"分子指纹"。';}},

{id:'k23',name:'荧光共振能量转移(FRET)',cat:'化学',tags:['光谱','FRET'],br:'两个荧光基团间能量转移效率与距离六次方成反比。',
 p:[P('R0','Förster 半径 R₀',1,10,0.1,5,'nm'),P('r','供体-受体距离 r',1,20,0.1,5,'nm')],
 f:['E=1/(1+(r/R₀)⁶)','FRET 效率','分子尺(1-10nm)'],
 xR:[1,20],yR:[0,1],xT:10,yT:5,xL:'距离 r (nm)',yL:'FRET 效率 E',col:'#34d399',
 fn:function(p,x){return 1/(1+Math.pow(x/p.R0,6));},
 mk:[{x:5,l:'R₀',c:'#fbbf24'}],
 ro:function(p){var E=1/(1+Math.pow(p.r/p.R0,6));
   return[{k:'FRET 效率',v:F(E,4)},{k:'R₀',v:p.R0+' nm'},{k:'r',v:p.r+' nm'},{k:'r/R₀',v:F(p.r/p.R0,3)},{k:'r=R₀ 时 E',v:'0.5（50%）'},{k:'应用',v:'蛋白构象、DNA 检测'}];},
 tt:function(p){var E=1/(1+Math.pow(p.r/p.R0,6));
   return'【模型】FRET：E=1/(1+(r/R₀)⁶)，对距离极度敏感。\n\n【推演】\n· r='+p.r+' nm, R₀='+p.R0+' nm\n· E='+F(E,4)+'\n\n【结论】FRET 是"分子尺"，可测量 1-10 nm 的距离变化。绿色荧光蛋白 GFP 的 FRET 用于活细胞成像，2008 年诺贝尔化学奖。';}},

{id:'k24',name:'核磁共振化学位移',cat:'化学',tags:['NMR','化学位移'],br:'原子核在磁场中共振频率与电子云密度相关。',
 p:[P('B0','磁场 B₀',1,20,0.1,7,'T'),P('gamma','磁旋比 γ',1,30,0.1,26.75,'×10⁷ rad/(T·s)'),P('delta','化学位移 δ',0,15,0.1,3,'ppm')],
 f:['ω=γ·B₀','δ=(ν−ν_ref)/ν_ref×10⁶','屏蔽效应'],
 xR:[0,15],yR:[0,1000],xT:10,yT:5,xL:'化学位移 δ (ppm)',yL:'共振频率 (MHz)',col:'#22d3ee',
 fn:function(p,x){return p.gamma*1e7*p.B0/(2*Math.PI*1e6)*(1-x*1e-6);},
 mk:[{x:0,l:'TMS',c:'#fbbf24'}],
 ro:function(p){var nu=p.gamma*1e7*p.B0/(2*Math.PI*1e6);
   return[{k:'共振频率(无屏蔽)',v:F(nu,2)+' MHz'},{k:'化学位移 δ',v:p.delta+' ppm'},{k:'B₀',v:p.B0+' T'},{k:'实际频率',v:F(nu*(1-p.delta*1e-6),4)+' MHz'},{k:'频差',v:F(nu*p.delta*1e-6*1000,2)+' kHz'},{k:'核类型',v:p.gamma>20?'¹H':'¹³C（估算）'}];},
 tt:function(p){var nu=p.gamma*1e7*p.B0/(2*Math.PI*1e6);
   return'【模型】NMR：核在磁场中共振 ω=γB₀，化学环境不同产生化学位移。\n\n【推演】\n· B₀='+p.B0+' T 时共振频率='+F(nu,2)+' MHz\n· δ='+p.delta+' ppm\n\n【结论】NMR 是确定有机分子结构最强有力的工具。MRI 是它在医学上的应用。';}},

{id:'k25',name:'质谱分辨率',cat:'化学',tags:['质谱','分辨'],br:'质谱仪按 m/z 分离离子，分辨率决定区分能力。',
 p:[P('m','质量 m',100,10000,10,1000,'Da'),P('z','电荷 z',1,5,1,1,''),P('R','分辨率 R',1000,100000,1000,10000,'')],
 f:['m/Δm=R','飞行时间 t∝√(m/z)','磁扇形半径 r=mv/(qB)'],
 xR:[100,10000],yR:[0,0.5],xT:10,yT:5,xL:'质量 m (Da)',yL:'可分辨质量差 Δm (Da)',col:'#f472b6',
 fn:function(p,x){return x/p.R;},
 ro:function(p){return[{k:'m/z',v:F(p.m/p.z,2)},{k:'Δm',v:F(p.m/p.R,4)+' Da'},{k:'质量 m',v:p.m+' Da'},{k:'电荷 z',v:p.z},{k:'分辨率 R',v:p.R},{k:'能否区分同位素',v:p.m/p.R<0.01?'能':'不能'}];},
 tt:function(p){return'【模型】质谱分辨率 R=m/Δm。\n\n【推演】\n· m/z='+F(p.m/p.z,2)+'\n· 可分辨 Δm='+F(p.m/p.R,4)+' Da\n\n【结论】高分辨质谱能区分同位素峰（如 ¹³C 与 ¹²C 差 1.003 Da），是蛋白质组学的关键工具。';}},

{id:'k26',name:'Raman散射',cat:'化学',tags:['光谱','拉曼'],br:'非弹性散射，频移对应分子振动能级。',
 p:[P('nu','入射波数 ν̃',5000,20000,100,15000,'cm⁻¹'),P('dvib','振动频率',100,3000,10,1000,'cm⁻¹')],
 f:['ν̃_Stokes=ν̃−Δν̃','ν̃_anti=ν̃+Δν̃','拉曼频移 Δν̃'],
 xR:[0,3000],yR:[0,1],xT:10,yT:5,xL:'拉曼频移 Δν̃ (cm⁻¹)',yL:'相对强度',col:'#34d399',
 fn:function(p,x){return Math.exp(-Math.pow((x-p.dvib)/150,2));},
 mk:[{x:1000,l:'振动峰',c:'#fbbf24'}],
 ro:function(p){return[{k:'Stokes 线',v:F(p.nu-p.dvib,0)+' cm⁻¹'},{k:'Anti-Stokes',v:F(p.nu+p.dvib,0)+' cm⁻¹'},{k:'拉曼频移',v:p.dvib+' cm⁻¹'},{k:'入射波数',v:p.nu+' cm⁻¹'},{k:'波长（入射）',v:F(1e7/p.nu,0)+' nm'},{k:'应用',v:'无损检测、手性识别'}];},
 tt:function(p){return'【模型】拉曼散射：非弹性光散射，频移=分子振动频率。\n\n【推演】\n· 入射='+p.nu+' cm⁻¹\n· 拉曼频移='+p.dvib+' cm⁻¹\n\n【结论】拉曼是红外光谱的互补技术，对对称振动敏感。可测水溶液、活细胞，无损快速。';}},

{id:'k27',name:'圆二色性与手性',cat:'化学',tags:['光学','手性'],br:'左右旋圆偏振光吸收差，反映分子手性。',
 p:[P('A','吸收强度 A',0.1,5,0.1,1,''),P('lam','波长 λ',200,500,5,220,'nm')],
 f:['CD=A_L−A_R','Cotton 效应','α-螺旋特征 CD'],
 xR:[180,300],yR:[-5,5],xT:10,yT:6,xL:'波长 λ (nm)',yL:'CD (mdeg)',col:'#a78bfa',
 fn:function(p,x){return p.A*10*Math.exp(-Math.pow((x-p.lam)/15,2))-p.A*8*Math.exp(-Math.pow((x-(p.lam+15))/20,2));},
 ro:function(p){return[{k:'吸收 A',v:p.A},{k:'波长 λ',v:p.lam+' nm'},{k:'样品',v:'手性分子/蛋白'},{k:'正峰',v:F(p.A*10,2)+' mdeg'},{k:'负峰',v:F(-p.A*8,2)+' mdeg'},{k:'应用',v:'蛋白二级结构、手性药物'}];},
 tt:function(p){return'【模型】圆二色性（CD）：左右旋圆偏振光吸收系数不同。\n\n【推演】\n· 样品吸收 A='+p.A+'\n· 波长 λ='+p.lam+' nm\n\n【结论】CD 光谱是研究蛋白质二级结构、DNA 构象、手性药物的重要工具。α-螺旋在 208 和 222 nm 有特征负峰。';}},

{id:'k28',name:'XPS 光电子能谱',cat:'化学',tags:['表面','XPS'],br:'X射线激发出光电子，结合能反映元素与化学态。',
 p:[P('hnu','X射线能量 hν',1000,2000,10,1486.6,'eV'),P('BE','结合能 BE',50,1000,1,285,'eV'),P('phi','功函数 φ',3,6,0.1,4.5,'eV')],
 f:['Ek=hν−BE−φ','XPS 结合能','化学位移反映氧化态'],
 xR:[0,1400],yR:[0,1],xT:10,yT:5,xL:'结合能 BE (eV)',yL:'相对强度',col:'#22d3ee',
 fn:function(p,x){return Math.exp(-Math.pow((x-p.BE)/3,2))+0.3*Math.exp(-Math.pow((x-p.BE-15)/4,2));},
 mk:[{x:285,l:'C1s',c:'#fbbf24'},{x:532,l:'O1s',c:'#f472b6'}],
 ro:function(p){var Ek=p.hnu-p.BE-p.phi;
   return[{k:'光电子动能 Ek',v:F(Ek,2)+' eV'},{k:'hν',v:p.hnu+' eV'},{k:'结合能 BE',v:p.BE+' eV'},{k:'功函数 φ',v:p.phi+' eV'},{k:'元素',v:p.BE<100?'金属内层':p.BE<300?'C 1s':p.BE<600?'N/O 1s':'金属'} ,{k:'化学态',v:p.BE>284.5&&p.BE<285.5?'C-C/C-H':'氧化态'}];},
 tt:function(p){var Ek=p.hnu-p.BE-p.phi;
   return'【模型】XPS：Ek=hν−BE−φ，测量光电子动能反推结合能。\n\n【推演】\n· Ek='+F(Ek,2)+' eV\n· BE='+p.BE+' eV\n\n【结论】XPS 是表面分析利器，能测定元素组成、化学态、氧化态。化学位移几 eV 就能区分不同化学环境。';}},

{id:'k29',name:'晶体场分裂',cat:'化学',tags:['配位','晶体场'],br:'过渡金属 d 轨道在配体场中分裂，产生颜色和磁性。',
 p:[P('Dq','分裂能 Δo',5000,30000,100,20000,'cm⁻¹'),P('P','成对能 P',10000,30000,100,15000,'cm⁻¹')],
 f:['Δo=Dq·10','高自旋 P>Δo','低自旋 P<Δo'],
 xR:[0,30000],yR:[0,30000],xT:10,yT:6,xL:'分裂能 Δo (cm⁻¹)',yL:'成对能 P (cm⁻¹)',col:'#f472b6',
 fn:function(p,x){return p.P-x;},
 mk:[{x:20000,l:'分界',c:'#fbbf24'}],
 ro:function(p){var type=p.P>p.Dq?'高自旋':'低自旋';
   return[{k:'自旋状态',v:type},{k:'Δo',v:p.Dq+' cm⁻¹'},{k:'P',v:p.P+' cm⁻¹'},{k:'P/Δo',v:F(p.P/p.Dq,2)},{k:'吸收波长',v:F(1e7/p.Dq,0)+' nm'},{k:'颜色',v:p.Dq>20000?'蓝绿':p.Dq>15000?'红':'黄绿'}];},
 tt:function(p){return'【模型】晶体场理论：d 轨道在配体场中分裂为 t2g 和 eg。\n\n【推演】\n· Δo='+p.Dq+' cm⁻¹\n· P='+p.P+' cm⁻¹\n· 类型：'+(p.P>p.Dq?'高自旋（P>Δo）':'低自旋（P<Δo）')+'\n\n【结论】Δo 决定络合物颜色和磁性。强场配体（CN⁻）→低自旋，弱场配体（H₂O）→高自旋。';}},

{id:'k30',name:'胶体稳定性 DLVO',cat:'化学',tags:['胶体','DLVO'],br:'范德华吸引与静电排斥竞争决定胶体稳定性。',
 p:[P('A','Hamaker 常数',1e-21,1e-19,1e-21,1e-20,'J'),P('psi','表面电位 ψ',10,100,1,30,'mV'),P('k','Debye 参数 κ',1e7,1e9,1e7,1e8,'1/m')],
 f:['V=VR+VA','VR=2πεaψ²·exp(−κh)','VA=−A/(12h)'],
 xR:[0,20],yR:[-1e-18,1e-17],xT:10,yT:5,xL:'距离 h (nm)',yL:'总势能 (J)',col:'#22d3ee',
 fn:function(p,x){var h=x*1e-9;var a=100e-9;var VA=-p.A/(12*h);var VR=2*Math.PI*8.854e-12*78*a*Math.pow(p.psi*1e-3,2)*Math.exp(-p.k*h);return (VA+VR);},
 ro:function(p){var a=100e-9;var d=Math.pow(p.k,2)*8.854e-12*78*1.381e-23*298/(2*Math.pow(1.602e-19,2)*(0.01*1e3));
   return[{k:'DLVO 势能',v:'多极值'},{k:'κ',v:(p.k/1e8).toFixed(2)+'×10⁸ /m'},{k:'ψ',v:p.psi+' mV'},{k:'Hamaker 常数',v:p.A.toExponential(2)+' J'},{k:'双电层厚度',v:F(1/p.k*1e9,3)+' nm'},{k:'稳定性',v:p.psi>30?'稳定':'易聚集'}];},
 tt:function(p){return'【模型】DLVO 理论：总势能=范德华吸引+静电排斥。\n\n【推演】\n· A='+p.A.toExponential(2)+' J\n· ψ='+p.psi+' mV\n· 双电层厚度='+F(1/p.k*1e9,3)+' nm\n\n【结论】存在能垒时胶体稳定；加入电解质压缩双电层（Schulze-Hardy 规则），能垒消失则聚沉。这是胶体化学和纳米材料分散的核心。';}},

{id:'k31',name:'反应-扩散方程',cat:'化学',tags:['反应','扩散'],br:'化学波和图灵斑图的核心方程。',
 p:[P('D','扩散系数 D',1e-6,1e-3,1e-6,1e-4,'m²/s'),P('k','反应速率 k',0.1,10,0.1,1,'1/s'),P('L','空间尺度 L',0.001,0.1,0.001,0.01,'m')],
 f:['∂c/∂t=D∇²c+R(c)','特征长度 L=√(D/k)','图灵不稳定性'],
 xR:[0,0.1],yR:[0,1.5],xT:10,yT:5,xL:'空间位置 x (m)',yL:'相对浓度',col:'#f472b6',
 fn:function(p,x){var L=Math.sqrt(p.D/p.k);return Math.exp(-x/L)+0.3*Math.sin(10*x/L)*Math.exp(-x/(2*L));},
 ro:function(p){var L=Math.sqrt(p.D/p.k);
   return[{k:'特征长度 L',v:F(L*1000,3)+' mm'},{k:'扩散系数 D',v:p.D.toExponential(2)+' m²/s'},{k:'反应速率 k',v:p.k+' 1/s'},{k:'扩散时间 t=L²/D',v:F(L*L/p.D,3)+' s'},{k:'Damköhler 数',v:F(p.k*p.L*p.L/p.D,3)},{k:'图灵斑图',v:p.k*p.L*p.L/p.D>1?'可能':'不可能'}];},
 tt:function(p){var L=Math.sqrt(p.D/p.k);
   return'【模型】反应-扩散方程 ∂c/∂t=D∇²c+R(c)，图灵 1952 年提出。\n\n【推演】\n· 特征长度 L='+F(L*1000,3)+' mm\n· 扩散时间 τ=L²/D='+F(L*L/p.D,3)+' s\n\n【结论】这是解释动物皮毛条纹、化学振荡、心脏节律的核心方程，非平衡态热力学的经典。';}},

{id:'k32',name:'自催化与振荡反应',cat:'化学',tags:['动力学','振荡'],br:'反应产物加速自身生成，产生周期振荡。',
 p:[P('k','速率常数 k',0.1,5,0.1,1,''),P('c0','初始浓度',0.1,2,0.1,0.5,'mol/L'),P('n','自催化级数 n',1,3,1,2,'')],
 f:['dc/dt=k·cⁿ','自催化加速','Logistic 模型'],
 xR:[0,20],yR:[0,2.5],xT:10,yT:5,xL:'时间 t (s)',yL:'浓度 c (mol/L)',col:'#fbbf24',
 fn:function(p,x){var c=p.c0;var dt=0.01;var t=0;var cc=p.c0;while(t<x){cc+=p.k*Math.pow(cc,p.n)*dt*(1-cc/2);t+=dt;}return cc;},
 ro:function(p){return[{k:'速率常数 k',v:p.k},{k:'初始浓度',v:p.c0+' mol/L'},{k:'自催化级数',v:p.n},{k:'增长模式',v:'S 型曲线'},{k:'典型反应',v:'B-Z 振荡'},{k:'应用',v:'化学振荡、图灵斑图'}];},
 tt:function(p){return'【模型】自催化：dc/dt=k·cⁿ，反应产物加速自身生成。\n\n【推演】\n· k='+p.k+', n='+p.n+'\n· S 型浓度曲线\n\n【结论】B-Z 振荡反应产生周期变色，是远离平衡态自组织的经典例子，普里高津因耗散结构获 1977 年诺贝尔化学奖。';}},

{id:'k33',name:'闪烁荧光寿命成像',cat:'化学',tags:['荧光','成像'],br:'荧光分子寿命对微环境敏感。',
 p:[P('tau0','本征寿命 τ₀',0.1,10,0.1,2,'ns'),P('Q','淬灭效率',0,1,0.01,0.3,'')],
 f:['I(t)=I₀·exp(−t/τ)','τ=τ₀(1−Q)','FLIM 成像'],
 xR:[0,10],yR:[0,1],xT:10,yT:5,xL:'时间 t (ns)',yL:'相对荧光强度',col:'#34d399',
 fn:function(p,x){return Math.exp(-x/(p.tau0*(1-p.Q)));},
 mk:[{x:1,l:'τ',c:'#fbbf24'}],
 ro:function(p){var tau=p.tau0*(1-p.Q);
   return[{k:'荧光寿命 τ',v:F(tau,3)+' ns'},{k:'本征寿命 τ₀',v:p.tau0+' ns'},{k:'淬灭效率 Q',v:F(p.Q,2)},{k:'量子产率比',v:F(1-p.Q,3)},{k:'1/e 时间',v:F(tau,3)+' ns'},{k:'应用',v:'FLIM、FRET'}];},
 tt:function(p){var tau=p.tau0*(1-p.Q);
   return'【模型】荧光寿命：I(t)=I₀e^(−t/τ)。\n\n【推演】\n· τ='+F(tau,3)+' ns\n· 淬灭效率='+F(p.Q,2)+'\n\n【结论】荧光寿命对 pH、氧浓度、粘度敏感——FLIM 成像是活细胞定量成像的利器，比强度成像更可靠。';}},

{id:'k34',name:'光声效应',cat:'化学',tags:['光声','成像'],br:'脉冲光激发生物组织热膨胀产生超声波。',
 p:[P('mu_a','吸收系数 μa',0.1,100,0.1,10,'1/cm'),P('F','光通量 F',0.1,100,0.1,10,'mJ/cm²'),P('G','Grüneisen 参数',0.1,1,0.01,0.2,'')],
 f:['p₀=Γ·μa·F','光声信号','穿透深度 1/μa'],
 xR:[0.1,100],yR:[0,1],xT:10,yT:5,xL:'吸收系数 μa (1/cm)',yL:'相对光声信号',col:'#22d3ee',
 fn:function(p,x){return x*p.F*p.G/(100);},
 mk:[{x:10,l:'组织',c:'#fbbf24'}],
 ro:function(p){var pa=p.G*p.mu_a*p.F;
   return[{k:'初始声压 p₀',v:F(pa,3)+' (a.u.)'},{k:'吸收系数 μa',v:p.mu_a+' /cm'},{k:'光通量 F',v:p.F+' mJ/cm²'},{k:'穿透深度',v:F(1/p.mu_a*10,2)+' mm'},{k:'Grüneisen',v:p.G},{k:'应用',v:'血氧、肿瘤成像'}];},
 tt:function(p){var pa=p.G*p.mu_a*p.F;
   return'【模型】光声效应：脉冲激光被组织吸收→热膨胀→产生超声波。\n\n【推演】\n· p₀=Γ·μa·F='+F(pa,3)+'\n· 穿透深度='+F(1/p.mu_a*10,2)+' mm\n\n【结论】光声成像是"光学对比度+超声穿透深度"的结合，用于血氧饱和度、肿瘤、脑功能成像。';}},

{id:'k35',name:'蛋白质折叠能量漏斗',cat:'化学',tags:['生物','折叠'],br:'蛋白质沿能量漏斗快速折叠到天然构象。',
 p:[P('dG','折叠自由能 ΔG',-100,0,1,-30,'kJ/mol'),P('dGts','过渡态势垒',5,100,1,20,'kJ/mol')],
 f:['能量漏斗','自由能景观','folding funnel'],
 xR:[0,1],yR:[-50,50],xT:10,yT:5,xL:'折叠坐标',yL:'自由能 (kJ/mol)',col:'#f472b6',
 fn:function(p,x){var t=(x-0.5)*2;return p.dGts*Math.exp(-Math.pow(t+0.3,2)*5)+p.dG*(0.5+0.5*Math.tanh(t*2));},
 mk:[{x:0,l:'伸展态',c:'#22d3ee'},{x:0.5,l:'过渡态',c:'#fbbf24'},{x:1,l:'天然态',c:'#34d399'}],
 ro:function(p){return[{k:'折叠 ΔG',v:p.dG+' kJ/mol'},{k:'势垒',v:p.dGts+' kJ/mol'},{k:'折叠方向',v:'向天然态'},{k:'K_fold',v:Math.exp(-p.dG*1000/(8.314*298)).toExponential(2)},{k:'折叠时间',v:'ms~s'},{k:'Levinthal 悖论',v:'漏斗模型解决'}];},
 tt:function(p){return'【模型】蛋白质折叠能量漏斗：多维景观，蛋白质沿漏斗下滑到天然态。\n\n【推演】\n· ΔG='+p.dG+' kJ/mol\n· 势垒='+p.dGts+' kJ/mol\n· K_fold='+Math.exp(-p.dG*1000/(8.314*298)).toExponential(2)+'\n\n【结论】Anfinsen 和 Levinthal 悖论的解决方案：不是随机搜索，而是沿漏斗定向折叠。2004 年诺贝尔化学奖。';}}
,
{id:'k36',name:'范特霍夫方程-平衡常数温度效应',cat:'化学',tags:['热力学','化学平衡'],br:'在焓变近似恒定时，平衡常数随温度变化遵循范特霍夫方程。',
 p:[P('dH','反应焓变 ΔH',-80,80,1,40,'kJ/mol'),P('Kref','参考平衡常数 K₁',0.1,100,0.1,10,''),P('Tref','参考温度 T₁',250,500,1,298,'K'),P('T','当前温度 T₂',250,600,1,373,'K')],
 f:['ln(K₂/K₁)=−ΔH/R·(1/T₂−1/T₁)','ΔH>0：升温使 K 增大','ΔH<0：升温使 K 减小'],
 xR:[250,600],yR:[0,100000],xT:7,yT:5,xL:'温度 T (K)',yL:'平衡常数 K',col:'#34d399',
 fn:function(p,x){return p.Kref*Math.exp(-p.dH*1000/8.314*(1/x-1/p.Tref));},
 ro:function(p){var k=p.Kref*Math.exp(-p.dH*1000/8.314*(1/p.T-1/p.Tref));return[{k:'当前平衡常数 K₂',v:k.toExponential(4)},{k:'参考 K₁',v:p.Kref},{k:'ΔH',v:p.dH+' kJ/mol'},{k:'T₂',v:p.T+' K'},{k:'ln(K₂/K₁)',v:F(Math.log(k/p.Kref),4)},{k:'升温效应',v:p.dH>0?'吸热反应：K 增大':p.dH<0?'放热反应：K 减小':'ΔH≈0：K 近似不变'}];},
 tt:function(p){var k=p.Kref*Math.exp(-p.dH*1000/8.314*(1/p.T-1/p.Tref));return'【模型】范特霍夫方程描述平衡常数的温度依赖。\n\n【推演】\n· K₂='+k.toExponential(4)+'\n· ΔH='+p.dH+' kJ/mol\n· 温度由 '+p.Tref+' K 变为 '+p.T+' K\n\n【结论】'+(p.dH>0?'吸热反应升温有利于正向平衡。':p.dH<0?'放热反应升温使平衡常数减小。':'焓变为零时，近似模型中 K 不随温度变化。')+'\n\n【适用条件】假设研究温区内反应焓变近似恒定。';}},
{id:'k37',name:'朗缪尔单分子层吸附',cat:'化学',tags:['表面化学','吸附'],br:'吸附位点逐渐饱和，吸附量随平衡浓度呈现饱和曲线。',
 p:[P('qmax','最大吸附量 qₘₐₓ',1,10,0.1,5,'mmol/g'),P('K','吸附平衡常数 K',0.01,10,0.01,0.5,'L/mmol'),P('C','平衡浓度 C',0.01,100,0.1,10,'mmol/L')],
 f:['q=qₘₐₓ·K·C/(1+K·C)','θ=K·C/(1+K·C)','高浓度时吸附位点趋于饱和'],
 xR:[0,100],yR:[0,10],xT:10,yT:5,xL:'平衡浓度 C (mmol/L)',yL:'吸附量 q (mmol/g)',col:'#f472b6',
 fn:function(p,x){return p.qmax*p.K*x/(1+p.K*x);},
 ro:function(p){var theta=p.K*p.C/(1+p.K*p.C);return[{k:'平衡吸附量 q',v:F(p.qmax*theta,4)+' mmol/g'},{k:'表面覆盖率 θ',v:F(theta*100,2)+'%'},{k:'最大吸附量 qₘₐₓ',v:p.qmax+' mmol/g'},{k:'K',v:p.K+' L/mmol'},{k:'C',v:p.C+' mmol/L'},{k:'剩余空位比例',v:F((1-theta)*100,2)+'%'}];},
 tt:function(p){var theta=p.K*p.C/(1+p.K*p.C);return'【模型】朗缪尔等温吸附：q=qₘₐₓKC/(1+KC)。\n\n【推演】\n· q='+F(p.qmax*theta,4)+' mmol/g\n· 表面覆盖率 θ='+F(theta*100,2)+'%\n\n【结论】浓度升高时吸附量逐渐接近单层饱和值 qₘₐₓ。模型假设吸附位点等价、相互独立且只形成单分子层。';}},
{id:'k38',name:'吉布斯自由能与自发性',cat:'化学',tags:['热力学','自发过程'],br:'在焓变和熵变近似恒定时，ΔG=ΔH−TΔS 判断过程的热力学方向。',
 p:[P('dH','焓变 ΔH',-100,100,1,-40,'kJ/mol'),P('dS','熵变 ΔS',-300,300,1,-100,'J/(mol·K)'),P('T','温度 T',200,1000,1,298,'K')],
 f:['ΔG=ΔH−TΔS','ΔG<0：正向过程热力学有利','ΔG=0：平衡条件'],
 xR:[200,1000],yR:[-200,200],xT:8,yT:8,xL:'温度 T (K)',yL:'吉布斯自由能 ΔG (kJ/mol)',col:'#a78bfa',
 fn:function(p,x){return p.dH-x*p.dS/1000;},
 ro:function(p){var g=p.dH-p.T*p.dS/1000;var te=p.dS!==0?p.dH*1000/p.dS:NaN;return[{k:'ΔG',v:F(g,3)+' kJ/mol'},{k:'ΔH',v:p.dH+' kJ/mol'},{k:'ΔS',v:p.dS+' J/(mol·K)'},{k:'T',v:p.T+' K'},{k:'热力学判断',v:g<0?'正向有利':g>0?'逆向有利':'处于平衡边界'},{k:'ΔG=0 临界温度',v:Number.isFinite(te)&&te>0?F(te,2)+' K':'不存在正温度临界点'}];},
 tt:function(p){var g=p.dH-p.T*p.dS/1000;return'【模型】ΔG=ΔH−TΔS，假设焓变和熵变在研究温区内近似恒定。\n\n【推演】\n· ΔG='+F(g,3)+' kJ/mol\n· ΔH='+p.dH+' kJ/mol\n· TΔS='+F(p.T*p.dS/1000,3)+' kJ/mol\n\n【结论】'+(g<0?'ΔG<0，正向过程在热力学上有利。':g>0?'ΔG>0，逆向过程在热力学上有利。':'ΔG=0，达到平衡条件。')+' 动力学快慢仍取决于活化能。';}}

];
for(var i=0;i<C5.length;i++){EXP.push(mkCurve(C5[i]));}

/* -------- 更多运动类（5个）-------- */
var C6=[
{id:'mv1',name:'陀螺进动',cat:'物理',tags:['力学','进动'],br:'自转物体在外力矩下产生进动。',
 p:[P('L','角动量 L',0.1,10,0.1,1,'kg·m²/s'),P('tau','外力矩 τ',0.1,10,0.1,1,'N·m')],
 f:['Ω=τ/L','进动角速度','陀螺效应'],
 dur:function(p){return 2*Math.PI*p.L/p.tau;},
 pos:function(p,t,W,H){var ang=t*p.tau/p.L;return{x:W/2+Math.cos(ang)*80,y:H/2+Math.sin(ang)*20};},
 col:'#fbbf24',
 ro:function(p){return[{k:'进动角速度 Ω',v:F(p.tau/p.L,3)+' rad/s'},{k:'角动量 L',v:p.L+' kg·m²/s'},{k:'外力矩 τ',v:p.tau+' N·m'},{k:'进动周期',v:F(2*Math.PI*p.L/p.tau,2)+' s'},{k:'进动方向',v:'与 τ 方向垂直'},{k:'应用',v:'陀螺仪、原子进动'}];},
 tt:function(p){return'【模型】进动 Ω=τ/L。\n\n【推演】\n· Ω='+F(p.tau/p.L,3)+' rad/s\n· 周期='+F(2*Math.PI*p.L/p.tau,2)+' s\n\n【结论】陀螺仪、自行车、原子核自旋都展现进动。MRI 的原理就是核自旋在磁场中的进动。';}},

{id:'mv2',name:'开普勒行星运动',cat:'物理',tags:['天文','轨道'],br:'行星沿椭圆轨道运动，面积速度守恒。',
 p:[P('a','半长轴 a',0.5,5,0.1,1,'AU'),P('e','离心率 e',0,0.9,0.01,0.2,'')],
 f:['T²=a³ (AU)','r=a(1−e²)/(1+e·cosθ)','面积速度守恒'],
 dur:function(p){return Math.pow(p.a,1.5)*2;},
 pos:function(p,t,W,H){var T=Math.pow(p.a,1.5);var M=2*Math.PI*t/T;var E=M;for(var i=0;i<5;i++){E=E-(E-p.e*Math.sin(E)-M)/(1-p.e*Math.cos(E));}
   var x=p.a*(Math.cos(E)-p.e);var y=p.a*Math.sqrt(1-p.e*p.e)*Math.sin(E);
   return{x:W/2+x*(W*0.3/3),y:H/2+y*(H*0.3/3)};},
 col:'#22d3ee',gr:false,
 ex:function(c,W,H,p,st,pt){c.fillStyle='#fbbf24';c.beginPath();c.arc(W/2,H/2,8,0,7);c.fill();
   c.strokeStyle='rgba(167,139,250,.3)';c.lineWidth=1;c.beginPath();
   for(var i=0;i<=100;i++){var T=Math.pow(p.a,1.5);var M=2*Math.PI*i/100;var E=M;
     for(var k=0;k<5;k++){E=E-(E-p.e*Math.sin(E)-M)/(1-p.e*Math.cos(E));}
     var x=p.a*(Math.cos(E)-p.e);var y=p.a*Math.sqrt(1-p.e*p.e)*Math.sin(E);
     var px=W/2+x*(W*0.3/3),py=H/2+y*(H*0.3/3);
     i?c.lineTo(px,py):c.moveTo(px,py);}
   c.stroke();},
 ro:function(p){var T=Math.pow(p.a,1.5);return[{k:'周期 T',v:F(T,3)+' 年'},{k:'半长轴 a',v:p.a+' AU'},{k:'离心率 e',v:p.e},{k:'近日点',v:F(p.a*(1-p.e),3)+' AU'},{k:'远日点',v:F(p.a*(1+p.e),3)+' AU'},{k:'T²/a³',v:F(T*T/(p.a*p.a*p.a),3)}];},
 tt:function(p){var T=Math.pow(p.a,1.5);
   return'【模型】开普勒三大定律：椭圆轨道、面积速度守恒、T²∝a³。\n\n【推演】\n· T='+F(T,3)+' 年\n· 近日点='+F(p.a*(1-p.e),3)+' AU\n· 远日点='+F(p.a*(1+p.e),3)+' AU\n\n【结论】牛顿用万有引力定律证明了开普勒定律。水星近日点进动需要用广义相对论解释。';}},

{id:'mv3',name:'混沌-双摆',cat:'物理',tags:['混沌','非线性'],br:'双摆运动对初始条件极端敏感——蝴蝶效应。',
 p:[P('L1','摆长1',0.3,1.5,0.05,0.8,'m'),P('L2','摆长2',0.3,1.5,0.05,0.8,'m'),P('th1','初始角1',0,3.14,0.05,2.5,'rad'),P('th2','初始角2',0,3.14,0.05,2.5,'rad')],
 f:['拉格朗日方程','混沌系统','李雅普诺夫指数'],
 dur:function(p){return 10;},
 pos:function(p,t,W,H){var g=9.8;var L1=p.L1,L2=p.L2;var th1=p.th1,th2=p.th2;
   var w1=0,w2=0;var dt=0.005;var tt=0;
   while(tt<t && tt<10){
     var a1=(-g*(2*Math.sin(th1)+Math.sin(th1-2*th2))-2*Math.sin(th1-th2)*(w2*w2*L2+w1*w1*L1*Math.cos(th1-th2)))/(L1*(2-Math.cos(2*th1-2*th2)));
     var a2=(2*Math.sin(th1-th2)*(w1*w1*L1*2+g*2*Math.cos(th1)+w2*w2*L2*Math.cos(th1-th2)))/(L2*(2-Math.cos(2*th1-2*th2)));
     w1+=a1*dt;w2+=a2*dt;th1+=w1*dt;th2+=w2*dt;tt+=dt;
   }
   var scale=Math.min(W,H)*0.35;
   var x1=W/2+L1*scale*Math.sin(th1);var y1=H*0.3+L1*scale*Math.cos(th1);
   var x2=x1+L2*scale*Math.sin(th2);var y2=y1+L2*scale*Math.cos(th2);
   return{x:x2,y:y2};},
 col:'#f472b6',gr:false,
 ex:function(c,W,H,p,st,pt){
   var g=9.8;var L1=p.L1,L2=p.L2;var th1=p.th1,th2=p.th2;var w1=0,w2=0;var dt=0.005;var tt=0;
   while(tt<Math.min(st.t||0,8)){var a1=(-g*(2*Math.sin(th1)+Math.sin(th1-2*th2))-2*Math.sin(th1-th2)*(w2*w2*L2+w1*w1*L1*Math.cos(th1-th2)))/(L1*(2-Math.cos(2*th1-2*th2)));
     var a2=(2*Math.sin(th1-th2)*(w1*w1*L1*2+g*2*Math.cos(th1)+w2*w2*L2*Math.cos(th1-th2)))/(L2*(2-Math.cos(2*th1-2*th2)));
     w1+=a1*dt;w2+=a2*dt;th1+=w1*dt;th2+=w2*dt;tt+=dt;}
   var sc=Math.min(W,H)*0.35;
   var x1=W/2+L1*sc*Math.sin(th1);var y1=H*0.3+L1*sc*Math.cos(th1);
   var x2=x1+L2*sc*Math.sin(th2);var y2=y1+L2*sc*Math.cos(th2);
   c.strokeStyle='#94a3b8';c.lineWidth=2;c.beginPath();c.moveTo(W/2,H*0.3);c.lineTo(x1,y1);c.lineTo(x2,y2);c.stroke();
   c.fillStyle='#22d3ee';c.beginPath();c.arc(x1,y1,10,0,7);c.fill();
   c.fillStyle='#f472b6';c.beginPath();c.arc(x2,y2,10,0,7);c.fill();},
 ro:function(p){return[{k:'摆长1',v:p.L1+' m'},{k:'摆长2',v:p.L2+' m'},{k:'初始角1',v:F(p.th1,2)+' rad'},{k:'初始角2',v:F(p.th2,2)+' rad'},{k:'系统',v:'混沌'},{k:'李雅普诺夫指数',v:'正（混沌）'}];},
 tt:function(p){return'【模型】双摆是经典的混沌系统，对初始条件极端敏感。\n\n【推演】\n· L1='+p.L1+', L2='+p.L2+'\n· θ1='+F(p.th1,2)+', θ2='+F(p.th2,2)+'\n\n【结论】洛伦兹 1963 年发现混沌——"蝴蝶效应"。天气预报不可能超过 2 周，正是因为大气是混沌系统。';}},

{id:'mv4',name:'傅科摆证明地球自转',cat:'物理',tags:['力学','地球自转'],br:'摆平面在惯性系中不变，地面观察者看到摆平面缓慢旋转。',
 p:[P('L','摆长 L',1,67,1,67,'m'),P('lat','纬度 φ',0,90,1,48.86,'°')],
 f:['Ω=15°·sinφ /小时','进动周期 T=24/sinφ 小时','傅科摆'],
 dur:function(p){return 24*p.L/67;},
 pos:function(p,t,W,H){var ang=t*2*Math.PI/Math.max(p.L,1);return{x:W/2+Math.sin(ang)*W*0.15,y:H/2+Math.sin(ang*3)*H*0.15};},
 col:'#22d3ee',gr:false,
 ex:function(c,W,H,p,st,pt){c.strokeStyle='rgba(167,139,250,.3)';c.lineWidth=1;c.beginPath();c.arc(W/2,H/2,W*0.15,0,7);c.stroke();
   c.strokeStyle='#f472b6';c.lineWidth=2;c.beginPath();c.moveTo(W/2,H/2);c.lineTo(pt.x,pt.y);c.stroke();
   c.fillStyle='#fbbf24';c.beginPath();c.arc(W/2,H/2,6,0,7);c.fill();},
 ro:function(p){return[{k:'摆长 L',v:p.L+' m'},{k:'纬度 φ',v:p.lat+'°'},{k:'进动速度',v:F(15*Math.sin(p.lat*Math.PI/180),2)+' °/h'},{k:'进动周期',v:F(24/Math.max(Math.sin(p.lat*Math.PI/180),0.001),2)+' h'},{k:'周期(小角度)',v:F(2*Math.PI*Math.sqrt(p.L/9.8),2)+' s'},{k:'验证',v:'地球自转'}];},
 tt:function(p){var sn=Math.sin(p.lat*Math.PI/180);
   return'【模型】傅科摆：摆平面在惯性系中不变，地面观察者看到旋转。\n\n【推演】\n· 进动='+F(15*sn,2)+' °/h\n· 周期='+F(24/Math.max(sn,0.001),2)+' h\n\n【结论】1851 年傅科在巴黎先贤祠悬挂 67m 长摆，直接证明了地球自转。这是物理史上最优美的实验之一。';}},

{id:'mv5',name:'洛伦兹吸引子',cat:'物理',tags:['混沌','非线性'],br:'洛伦兹方程的三个变量随时间演化成蝴蝶形吸引子。',
 p:[P('sigma','σ',1,20,0.5,10,''),P('rho','ρ',1,50,0.5,28,''),P('beta','β',0.5,5,0.1,2.67,'')],
 f:['dx/dt=σ(y−x)','dy/dt=x(ρ−z)−y','dz/dt=xy−βz'],
 dur:function(p){return 20;},
 pos:function(p,t,W,H){var dt=0.005;var x=1,y=1,z=1;var tt=0;
   while(tt<t && tt<15){var dx=p.sigma*(y-x);var dy=x*(p.rho-z)-y;var dz=x*y-p.beta*z;
     x+=dx*dt;y+=dy*dt;z+=dz*dt;tt+=dt;}
   var scale=Math.min(W,H)*0.02;
   return{x:W/2+x*scale,y:H/2-z*scale+100};},
 col:'#a78bfa',gr:false,
 ex:function(c,W,H,p,st,pt){
   c.strokeStyle='rgba(167,139,250,.5)';c.lineWidth=1;c.beginPath();
   var dt=0.005;var x=1,y=1,z=1;var tt=0;var scale=Math.min(W,H)*0.02;
   for(var i=0;i<800;i++){var dx=p.sigma*(y-x);var dy=x*(p.rho-z)-y;var dz=x*y-p.beta*z;
     x+=dx*dt;y+=dy*dt;z+=dz*dt;tt+=dt;
     var px=W/2+x*scale,py=H/2-z*scale+100;
     i?c.lineTo(px,py):c.moveTo(px,py);}
   c.stroke();
   c.fillStyle='#fbbf24';c.beginPath();c.arc(pt.x,pt.y,6,0,7);c.fill();},
 ro:function(p){return[{k:'σ',v:p.sigma},{k:'ρ',v:p.rho},{k:'β',v:p.beta},{k:'ρ>24.74 混沌',v:p.rho>24.74?'是':'否'},{k:'吸引子维度',v:'≈2.06'},{k:'系统',v:'混沌'}];},
 tt:function(p){return'【模型】洛伦兹方程：三个耦合非线性微分方程，产生蝴蝶形吸引子。\n\n【推演】\n· σ='+p.sigma+', ρ='+p.rho+', β='+p.beta+'\n· ρ='+(p.rho>24.74?'超过临界值，混沌':'低于临界值，稳定')+'\n\n【结论】洛伦兹 1963 年研究大气对流发现——"蝴蝶效应"的数学原型。这是混沌理论的开山之作。';}}
];
for(var i=0;i<C6.length;i++){EXP.push(mkMotion(C6[i]));}
