const A={
 bIdle:'assets/units/blue_warrior_idle.png',
 bRun:'assets/units/blue_warrior_run.png',
 bAtk1:'assets/units/blue_warrior_attack1.png',
 bAtk2:'assets/units/blue_warrior_attack2.png',
 bGuard:'assets/units/blue_warrior_guard.png',
 rIdle:'assets/units/red_warrior_idle.png',
 rRun:'assets/units/red_warrior_run.png',
 rAtk1:'assets/units/red_warrior_attack1.png',
 rAtk2:'assets/units/red_warrior_attack2.png',
 rGuard:'assets/units/red_warrior_guard.png',
 yIdle:'assets/units/yellow_warrior_idle.png',
 yRun:'assets/units/yellow_warrior_run.png',
 yAtk1:'assets/units/yellow_warrior_attack1.png',
 yAtk2:'assets/units/yellow_warrior_attack2.png',
 pIdle:'assets/units/purple_warrior_idle.png',
 pRun:'assets/units/purple_warrior_run.png',
 pAtk1:'assets/units/purple_warrior_attack1.png',
 pAtk2:'assets/units/purple_warrior_attack2.png',
 water:'assets/terrain/water_background.png',
 tree:'assets/terrain/tree1.png',
 meat:'assets/items/meat.png',
 boom:'assets/fx/explosion_01.png',
 aIdle:'assets/units/red_archer_idle.png',
 aRun:'assets/units/red_archer_run.png',
 aShoot:'assets/units/red_archer_shoot.png',
 arrow:'assets/units/red_arrow.png',
 lIdle:'assets/units/red_lancer_idle.png',
 lRun:'assets/units/red_lancer_run.png',
 lAtk:'assets/units/red_lancer_attack.png',
 mIdle:'assets/units/red_monk_idle.png',
 mRun:'assets/units/red_monk_run.png',
 mHeal:'assets/units/red_monk_heal.png',
 mFx:'assets/units/monk_heal_effect.png',
 kIdle:'assets/units/red_pawn_idle.png',
 kRun:'assets/units/red_pawn_run.png',
 kAtk:'assets/units/red_pawn_attack.png',
 shIdle:'assets/creatures/sheep_idle.png',
 shMove:'assets/creatures/sheep_move.png',
 rock1:'assets/terrain/rock1.png',
 rock2:'assets/terrain/rock2.png',
 house:'assets/buildings/black_house1.png',
 tower:'assets/buildings/black_tower.png',
 towerB:'assets/buildings/blue_tower.png',
 castle:'assets/buildings/blue_castle.png',
 bossIdle:'assets/boss/boss_idle.png',
 bossWalk:'assets/boss/boss_walk.png',
 bossPunch:'assets/boss/boss_punch.png',
 bossBrace:'assets/boss/boss_brace.png',
 bFist:'assets/boss/boss_fist.png',
 bArm:'assets/boss/boss_arm.png',
 bRing:'assets/boss/boss_ring.png',
 tiles1:'assets/terrain/tilemap_color1.png',
 tiles2:'assets/terrain/tilemap_color2.png',
 tiles3:'assets/terrain/tilemap_color3.png',
 tiles4:'assets/terrain/tilemap_color4.png',
 tiles5:'assets/terrain/tilemap_color5.png'
};
const img={};let loaded=0;const names=Object.keys(A);
names.forEach(k=>{const i=new Image();i.onload=()=>{if(++loaded==names.length)start()};i.src=A[k];img[k]=i});
const W=960,H=600,T=64;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');cv.width=W;cv.height=H;ctx.imageSmoothingEnabled=false;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ls=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}};
const lsj=(k,d)=>{try{return Object.assign(d,JSON.parse(ls(k)||'{}'))}catch(e){return d}};
// Ajustes y progreso permanente (Taller)
const SET=lsj('tinyswords_set',{shake:1,flash:1,dmg:1,rumble:1,tips:1});
const META=lsj('tinyswords_meta',{gold:0,vid:0,dmg:0,vel:0,loot:0});
const saveSet=()=>ls('tinyswords_set',JSON.stringify(SET)),saveMeta=()=>ls('tinyswords_meta',JSON.stringify(META));
// Aleatoriedad con semilla (oleadas, obstáculos y mejoras: el reto diario es igual para todos)
let sd=1;const rs=()=>(sd=(sd*16807)%2147483647)/2147483647,seedTo=n=>{sd=Math.abs(Math.floor(n))%2147483646+1};
const dayNum=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/86400000);

// ---------- Arenas ----------
// t: tileset · w,h: tiles · o: obstáculos · mult: tamaño de oleadas · arch: peso de arqueros · fog: niebla · ice: suelo helado
const AR_=[
 {n:'Prado del Alba',d:'Campo abierto con pocos árboles. Ideal para aprender los controles.',t:'tiles1',w:26,h:16,o:[['tree',14],['rock',3]],sheep:3,mult:1,arch:1},
 {n:'Bosque Espeso',d:'Árboles y niebla: ves menos, pero te cubres de las flechas.',t:'tiles2',w:24,h:16,o:[['tree',32],['rock',4]],sheep:2,mult:1,arch:1,tint:'rgba(10,50,20,.18)',fog:1},
 {n:'Ruinas al Atardecer',d:'Casas y torres derruidas. Muchos rincones donde esconderse.',t:'tiles4',w:28,h:18,o:[['house',5],['tower',3],['rock',6],['tree',4]],sheep:2,mult:1.2,arch:1.3,tint:'rgba(255,120,40,.14)'},
 {n:'Fortaleza',d:'Un castillo en el centro y torres. Aquí abundan los arqueros.',t:'tiles3',w:26,h:18,o:[['castle',1],['towerB',4],['tree',6]],sheep:1,mult:1.2,arch:2.5},
 {n:'Islote Helado',d:'Suelo helado: patinas al moverte. Espacio reducido y noche cerrada.',t:'tiles5',w:18,h:12,o:[['rock',10],['tree',5]],sheep:2,mult:.8,arch:.8,tint:'rgba(20,30,90,.28)',ice:1}
];
const OD={tree:{r:26},rock:{r:24,ox:32,oy:49},house:{r:52,ox:64,oy:168},tower:{r:46,ox:64,oy:225},towerB:{r:46,ox:64,oy:225},castle:{r:100,ox:160,oy:243}};
const FAM={
 w:{fw:192,ox:96,oy:130,a:{Idle:['',8,8],Run:['',6,12],Atk1:['',4,14],Atk2:['',4,14],Guard:['',6,12]}},
 k:{fw:192,ox:96,oy:130,a:{Idle:['kIdle',8,8],Run:['kRun',6,12],Atk1:['kAtk',4,8],Atk2:['kAtk',4,8]}},
 a:{fw:192,ox:96,oy:130,a:{Idle:['aIdle',6,8],Run:['aRun',4,12],Atk1:['aShoot',8,12]}},
 l:{fw:320,ox:160,oy:192,a:{Idle:['lIdle',12,8],Run:['lRun',6,12],Atk1:['lAtk',3,10]}},
 m:{fw:192,ox:96,oy:130,a:{Idle:['mIdle',6,8],Run:['mRun',4,12],Atk1:['mHeal',11,14]}},
 b:{fw:208,ox:104,oy:145,sh:36,a:{Idle:['bossIdle',6,6],Run:['bossWalk',6,7],Atk1:['bossPunch',6,8],Atk2:['bossBrace',4,1]}}
};
const BSH=[[-18, -33, 14, -33, -2], [-19, -32, 12, -32, -4], [-9, -34, 22, -34, 8], [-13, -33, 18, -33, 3]];
const PT={
 str:{ic:'⚔️',c:'#ff7a5e',n:'Fuerza',d:10},spd:{ic:'⚡',c:'#ffe066',n:'Velocidad',d:10},
 shd:{ic:'🛡️',c:'#7ec8ff',n:'Escudo',d:6},nova:{ic:'💥',c:'#ffb347',n:'Onda',d:0}};
const PTS={r:100,k:60,y:200,p:150,a:150,l:250,m:200,b:1500}; // puntos por tipo de enemigo
const WT=[['r',4,1],['k',2,1],['y',1.5,2],['a',2,2],['p',1.2,3],['l',1.3,3],['m',1,4]];
const DIFS=[{n:'Fácil',m:.6,s:.75,c:'#8dff8d'},{n:'Normal',m:1,s:1,c:'#f5e3b0'},{n:'Difícil',m:1.5,s:1.5,c:'#ff8a78'}];
const THEMES={horda:'¡Horda de peones!',arqueros:'Lluvia de flechas',blindados:'Legión blindada'};
// Mejoras de partida (se eligen 1 de 3 al terminar cada oleada)
const UPG=[
 {k:'fue',n:'Fuerza',ic:'⚔️',c:'#ff7a5e',d:'Tus golpes hacen un 20% más de daño.',max:6},
 {k:'vel',n:'Velocidad',ic:'⚡',c:'#ffe066',d:'Te mueves un 10% más rápido y atacas más deprisa.',max:5},
 {k:'vid',n:'Vida',ic:'❤️',c:'#ff8fa0',d:'Vida máxima +25 y recuperas 25 ahora mismo.',max:99},
 {k:'dod',n:'Esquiva',ic:'💨',c:'#9fd3ff',d:'Una carga de esquiva más y recarga más rápida.',max:3},
 {k:'ran',n:'Alcance',ic:'🗡️',c:'#d6dbe6',d:'Tu ataque llega un 20% más lejos y cubre más ángulo.',max:3},
 {k:'vam',n:'Vampirismo',ic:'🩸',c:'#e06a5a',d:'Recuperas 2 de vida por cada enemigo derrotado.',max:4},
 {k:'cri',n:'Crítico',ic:'🎯',c:'#ffb347',d:'+12% de probabilidad de hacer el doble de daño.',max:4},
 {k:'cor',n:'Esquiva cortante',ic:'🌀',c:'#b48cff',d:'Tu esquiva hiere a los enemigos que atraviesas.',max:3}];
const SHOP=[
 {k:'vid',n:'Vitalidad',d:'+10 de vida inicial por nivel',max:5,cost:l=>100*(l+1)},
 {k:'dmg',n:'Fuerza inicial',d:'+5% de daño por nivel',max:5,cost:l=>120*(l+1)},
 {k:'vel',n:'Agilidad',d:'+4% de velocidad por nivel',max:5,cost:l=>100*(l+1)},
 {k:'loot',n:'Botín',d:'+10% de oro al final de cada partida por nivel',max:5,cost:l=>150*(l+1)}];
const SETS=[['shake','Sacudida de cámara'],['flash','Destellos y viñetas de daño'],['dmg','Números de daño'],['rumble','Vibración del mando'],['tips','Consejos de ayuda']];
const KB=['ABCDEFGHIJ','KLMNOPQRST','UVWXYZÑ.-_','0123456789'],OSKB=['Espacio','Borrar','Guardar','Omitir'];
const PMENU=['Continuar','Reiniciar partida','Ajustes','Salir al menú'];

let AC=AR_[0],MW,MH,BX,BY,IX=2,IY=2,IW,IH,scene='menu',sel=0,mt=0,DIF=1,DAILY=false,setFrom='menu',shopSel=0,setSel=0,stF=0;
let P,E=[],M=[],PU=[],FX=[],TX=[],OB=[],AR=[],HF=[],SH=[],PA=[],SL=[],RG=[],G={over:false,time:0,play:0},cam={x:0,y:0},last=0,HS=0,want=0,wantD=0,gp=null,toast={s:'',t:0};
let wantT=0,wantDT=0;const pressAtk=()=>{want=1;wantT=.22},pressDod=()=>{wantD=1;wantDT=.22};
const keys={},tc={x:0,y:0,guard:false};let touchSeen=false,pad={x:0,y:0,guard:false},pb=[];
const mk=(x,y,col,hp)=>({x,y,col,ty:'w',hp,max:hp,fx:1,st:'Idle',t:0,kx:0,ky:0,hit:0,cd:.6+Math.random(),dealt:false,combo:0,iv:0,guard:false,stun:0});
const set=(e,s)=>{if(e.st!=s){e.st=s;e.t=0}};
const atk=e=>e.st[0]=='A';
const pop=(x,y,s,c,dm)=>{if(dm&&!SET.dmg)return;TX.push({x,y,s,c,t:0})};
const shake=v=>{if(SET.shake)G.shake=Math.max(G.shake||0,v)};
const hitstop=s=>{HS=Math.max(HS,s)};
const setDif=d=>{DIF=(d+3)%3;ls('tinyswords_dif',DIF)};
const dmgMul=()=>(1+.2*P.lv.fue)*(1+.05*META.dmg)*(P.buf.str>0?2:1);
const comboMul=()=>1+Math.min(12,Math.floor(G.combo/4))*.25;
function burst(x,y,z,n,col,sp,life,size,g){ // partículas con altura (z)
 for(let i=0;i<n&&PA.length<500;i++){const a=Math.random()*6.283,s=sp*(.35+Math.random()*.65);
  PA.push({x,y,z,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.5,vz:40+Math.random()*sp,life:life*(.6+Math.random()*.6),max:life,c:col,s:size||4,g:g||500})}}
function updPA(dt){for(const p of PA){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz-=p.g*dt;if(p.z<0){p.z=0;p.vz*=-.3;p.vx*=.6;p.vy*=.6}}PA=PA.filter(p=>p.life>0)}
function rumble(s,ms){try{if(SET.rumble&&gp&&gp.vibrationActuator)gp.vibrationActuator.playEffect('dual-rumble',{duration:ms,strongMagnitude:s,weakMagnitude:s}).catch(()=>{})}catch(e){}}

// ---------- Acciones de interfaz (compartidas por teclado, ratón, mando y táctil) ----------
const menuNav=d=>{sel=(sel+d+AR_.length)%AR_.length};
function startArena(i){AC=AR_[i];DAILY=false;reset();want=wantD=0;scene='play'}
function startDaily(){AC=AR_[dayNum()%AR_.length];DAILY=true;reset();want=wantD=0;scene='play'}
function openStats(){scene='stats';SC.ready=false;loadScores()}
function openShop(){scene='shop'}
function openSet(from){setFrom=from;scene='set'}
const statsTab=d=>{stF=(stF+d+5)%5};
const shopMove=d=>{shopSel=(shopSel+d+SHOP.length)%SHOP.length};
function shopBuy(){const it=SHOP[shopSel],l=META[it.k];
 if(l>=it.max){toast={s:'Nivel máximo',t:1.5};return}
 const c=it.cost(l);if(META.gold<c){toast={s:'Oro insuficiente',t:1.5};return}
 META.gold-=c;META[it.k]++;saveMeta();toast={s:it.n+' → Nv. '+META[it.k],t:1.5}}
const setMove=d=>{setSel=(setSel+d+SETS.length+1)%(SETS.length+1)};
function setToggle(){if(setSel>=SETS.length){scene=setFrom;return}
 const k=SETS[setSel][0];SET[k]=SET[k]?0:1;if(k=='tips'&&SET.tips)ls('tinyswords_tuto','0');saveSet()}
const pauseMove=d=>{G.pm=(G.pm+d+4)%4;G.conf=false};
function pauseAct(i){
 if(i==0)G.paused=false;
 else if(i==1){reset();want=wantD=0}
 else if(i==2)openSet('play');
 else if(G.conf){scene='menu'}else G.conf=true}
function pickKey(e,L,R,OK){
 if(L)G.ps=(G.ps+2)%3;else if(R)G.ps=(G.ps+1)%3;
 else if(/^Digit[1-3]$/.test(e.code))applyUp(+e.code.slice(5)-1);else if(OK)applyUp(G.ps)}
const addChar=c=>{if(G.name.length<14)G.name+=c};
function oskMove(dx,dy){
 if(dy){const o=G.kr;G.kr=(G.kr+dy+5)%5;
  if(G.kr==4&&o!=4)G.kc=Math.min(3,Math.floor(G.kc*.4));else if(o==4&&G.kr!=4)G.kc=Math.min(9,Math.floor(G.kc*2.5+1))}
 if(dx){const n=G.kr==4?4:10;G.kc=(G.kc+dx+n)%n}}
function oskPress(){
 if(G.kr<4)addChar(KB[G.kr][G.kc]);
 else if(G.kc==0)addChar(' ');else if(G.kc==1)G.name=G.name.slice(0,-1);
 else if(G.kc==2)saveScore(G.name||'Jugador');else G.stage='done'}
function nameKey(e){
 if(e.key=='Enter')saveScore(G.name||'Jugador');
 else if(e.key=='Escape')G.stage='done';
 else if(e.key=='Backspace'){e.preventDefault();G.name=G.name.slice(0,-1)}
 else if(e.key.length==1&&G.name.length<14&&/[\p{L}\p{N} _.\-]/u.test(e.key))G.name+=e.key}

// ---------- Teclado ----------
addEventListener('keydown',e=>{
 const c=e.code;keys[c]=1;
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(c))e.preventDefault();
 const L=c=='ArrowLeft'||c=='KeyA',R=c=='ArrowRight'||c=='KeyD',U=c=='ArrowUp'||c=='KeyW',D=c=='ArrowDown'||c=='KeyS',OK=c=='Enter'||c=='Space',BK=c=='Escape'||c=='Backspace';
 if(scene=='menu'){if(e.repeat)return;
  if(L)menuNav(-1);else if(R)menuNav(1);else if(U)setDif(DIF-1);else if(D)setDif(DIF+1);
  else if(OK)startArena(sel);else if(c=='KeyE')openStats();else if(c=='KeyT')openShop();else if(c=='KeyR')startDaily();else if(c=='KeyO')openSet('menu');return}
 if(scene=='stats'){if(L)statsTab(-1);else if(R)statsTab(1);else if(OK||BK)scene='menu';return}
 if(scene=='shop'){if(U)shopMove(-1);else if(D)shopMove(1);else if(OK)shopBuy();else if(BK)scene='menu';return}
 if(scene=='set'){if(U)setMove(-1);else if(D)setMove(1);else if(OK)setToggle();else if(BK)scene=setFrom;return}
 if(G.pick){if(!e.repeat)pickKey(e,L,R,OK);return}
 if(G.over&&G.stage=='name'){nameKey(e);return}
 if(G.over){if(e.repeat)return;if(c=='Enter')reset();else if(c=='KeyT')openStats();else if(c=='Escape')scene='menu';return}
 if(G.paused){if(e.repeat)return;if(U)pauseMove(-1);else if(D)pauseMove(1);else if(OK)pauseAct(G.pm);else if(c=='Escape'||c=='KeyP')G.paused=false;return}
 if(e.repeat)return;
 if(c=='Escape'||c=='KeyP'){G.paused=true;G.pm=0;G.conf=false}
 else if(c=='Space'||c=='KeyJ')pressAtk();else if(c=='KeyL'||c=='KeyE')pressDod()});
addEventListener('keyup',e=>keys[e.code]=0);
const autoPause=()=>{for(const k in keys)keys[k]=0;if(scene=='play'&&!G.over&&!G.pick&&!G.paused){G.paused=true;G.pm=0;G.conf=false}};
addEventListener('blur',autoPause);
if(typeof document.addEventListener=='function')document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause()});

// ---------- Ratón ----------
const mpos=ev=>{const r=cv.getBoundingClientRect();return[(ev.clientX-r.left)*W/r.width,(ev.clientY-r.top)*H/r.height]};
const inR=(x,y,q)=>x>=q.x&&x<=q.x+q.w&&y>=q.y&&y<=q.y+q.h;
const cardR=i=>({x:26+i*184,y:170,w:172,h:350}),difR=i=>({x:326+i*106,y:130,w:96,h:28}),mbR=i=>({x:62+i*212,y:534,w:200,h:34});
const listR=(i,y0)=>({x:W/2-170,y:y0+i*54,w:340,h:44}),shopR=i=>({x:60,y:140+i*80,w:840,h:70}),tabR=i=>({x:110+i*148,y:88,w:140,h:26});
const pickR=i=>({x:126+i*244,y:210,w:220,h:250}),backR={x:W/2-90,y:536,w:180,h:38};
const hit=(ev,n,f)=>{const[x,y]=mpos(ev);for(let i=0;i<n;i++)if(inR(x,y,f(i)))return i;return -1};
function oskAt(ev){const[x,y]=mpos(ev);for(let r=0;r<5;r++)for(let c=0;c<(r<4?10:4);c++)if(inR(x,y,oskRect(r,c)))return[r,c];return null}
const MBACT=[()=>openStats(),()=>openShop(),()=>startDaily(),()=>openSet('menu')];
cv.addEventListener('mousemove',e=>{
 if(scene=='menu'){const i=hit(e,AR_.length,cardR);if(i>=0)sel=i;const b=hit(e,4,mbR);mt=mt;G.hovB=b}
 else if(scene=='shop'){const i=hit(e,SHOP.length,shopR);if(i>=0)shopSel=i}
 else if(scene=='set'){const i=hit(e,SETS.length+1,i=>i<SETS.length?listR(i,150):{x:W/2-90,y:150+SETS.length*54,w:180,h:44});if(i>=0)setSel=i}
 else if(scene=='play'){
  if(G.pick){const i=hit(e,3,pickR);if(i>=0)G.ps=i}
  else if(G.over&&G.stage=='name'){const k=oskAt(e);if(k){G.kr=k[0];G.kc=k[1]}}
  else if(G.paused){const i=hit(e,4,i=>listR(i,230));if(i>=0){G.pm=i}}}});
cv.addEventListener('click',e=>{
 if(scene=='menu'){const d=hit(e,3,difR),b=hit(e,4,mbR);
  if(d>=0)setDif(d);else if(b>=0)MBACT[b]();else{const i=hit(e,AR_.length,cardR);if(i>=0)startArena(i)}}
 else if(scene=='stats'){const t=hit(e,5,tabR);if(t>=0)stF=t;else scene='menu'}
 else if(scene=='shop'){const i=hit(e,SHOP.length,shopR);if(i>=0){shopSel=i;shopBuy()}else if(inR(...mpos(e),backR))scene='menu'}
 else if(scene=='set'){const i=hit(e,SETS.length+1,i=>i<SETS.length?listR(i,150):{x:W/2-90,y:150+SETS.length*54,w:180,h:44});if(i>=0){setSel=i;setToggle()}}
 else if(G.pick){const i=hit(e,3,pickR);if(i>=0)applyUp(i)}
 else if(G.over&&G.stage=='name'){const k=oskAt(e);if(k){G.kr=k[0];G.kc=k[1];oskPress()}}
 else if(G.paused){const i=hit(e,4,i=>listR(i,230));if(i>=0){G.pm=i;pauseAct(i)}}});

// ---------- Mando (Xbox / estándar) ----------
addEventListener('gamepadconnected',()=>{toast={s:'Mando conectado',t:3}});
addEventListener('gamepaddisconnected',()=>{gp=null;toast={s:'Mando desconectado',t:3}});
function pollPad(){
 pad={x:0,y:0,guard:false};
 gp=[...(navigator.getGamepads?navigator.getGamepads():[])].find(g=>g&&g.connected)||null;
 if(!gp)return;
 const b=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed);
 let x=gp.axes[0]||0,y=gp.axes[1]||0;const m=Math.hypot(x,y);
 if(m<.25)x=y=0;else{const k=(Math.min(m,1)-.25)/.75/m;x*=k;y*=k}
 if(b(14))x=-1;if(b(15))x=1;if(b(12))y=-1;if(b(13))y=1;
 pad={x,y,guard:b(4)||b(6)};
 // A,X,RT,Start,izq,der,Y,B,arriba,abajo,RB,LB
 const cur=[b(0),b(2),b(7),b(9),b(14)||x<-.6,b(15)||x>.6,b(3),b(1),b(12)||y<-.6,b(13)||y>.6,b(5),b(4)];
 cur.forEach((v,i)=>{if(!v||pb[i])return;
  if(scene=='menu'){if(i==4)menuNav(-1);else if(i==5)menuNav(1);else if(i==8)setDif(DIF-1);else if(i==9)setDif(DIF+1);
   else if(i==1)openStats();else if(i==6)openShop();else if(i==11)startDaily();else if(i==10)openSet('menu');else if(i==0||i==3)startArena(sel)}
  else if(scene=='stats'){if(i==4)statsTab(-1);else if(i==5)statsTab(1);else if(i==0||i==3||i==7)scene='menu'}
  else if(scene=='shop'){if(i==8)shopMove(-1);else if(i==9)shopMove(1);else if(i==0)shopBuy();else if(i==7||i==3)scene='menu'}
  else if(scene=='set'){if(i==8)setMove(-1);else if(i==9)setMove(1);else if(i==0)setToggle();else if(i==7||i==3)scene=setFrom}
  else if(G.pick){if(i==4)G.ps=(G.ps+2)%3;else if(i==5)G.ps=(G.ps+1)%3;else if(i==0||i==3)applyUp(G.ps)}
  else if(G.over&&G.stage=='name'){
   if(i==4)oskMove(-1,0);else if(i==5)oskMove(1,0);else if(i==8)oskMove(0,-1);else if(i==9)oskMove(0,1);
   else if(i==0)oskPress();else if(i==6)addChar(' ');else if(i==7)G.name=G.name.slice(0,-1);else if(i==3)saveScore(G.name||'Jugador')}
  else if(G.over){if(G.stage=='done'){if(i==0||i==3)reset();else if(i==1)openStats();else if(i==6)scene='menu'}}
  else if(G.paused){if(i==8)pauseMove(-1);else if(i==9)pauseMove(1);else if(i==0)pauseAct(G.pm);else if(i==3||i==7)G.paused=false}
  else if(i==3){G.paused=true;G.pm=0;G.conf=false}
  else if(i<3)pressAtk();else if(i==7||i==10)pressDod()});
 pb=cur;
}

// ---------- Táctil ----------
const TB={atk:{x:W-96,y:H-130,r:52},dod:{x:W-214,y:H-84,r:38},grd:{x:W-86,y:H-252,r:38},pau:{x:W/2,y:30,r:18}};
const tt={};let stick=null;
const tpos=t=>{const r=cv.getBoundingClientRect();return[(t.clientX-r.left)*W/r.width,(t.clientY-r.top)*H/r.height]};
const inC=(x,y,c)=>Math.hypot(x-c.x,y-c.y)<=c.r+10;
const playing=()=>scene=='play'&&!G.over&&!G.pick&&!G.paused;
cv.addEventListener('touchstart',e=>{touchSeen=true;if(!playing())return;e.preventDefault();
 for(const t of e.changedTouches){const[x,y]=tpos(t);
  if(inC(x,y,TB.atk)){pressAtk();tt[t.identifier]='atk'}
  else if(inC(x,y,TB.dod)){pressDod();tt[t.identifier]='dod'}
  else if(inC(x,y,TB.grd)){tc.guard=true;tt[t.identifier]='grd'}
  else if(inC(x,y,TB.pau)){G.paused=true;G.pm=0;G.conf=false}
  else if(x<W*.5&&!stick){stick={id:t.identifier,ox:x,oy:y,x,y};tt[t.identifier]='stk'}}},{passive:false});
cv.addEventListener('touchmove',e=>{if(!playing())return;e.preventDefault();
 for(const t of e.changedTouches)if(stick&&t.identifier==stick.id){const[x,y]=tpos(t);stick.x=x;stick.y=y;
  const dx=x-stick.ox,dy=y-stick.oy,l=Math.hypot(dx,dy),k=Math.min(1,l/60);tc.x=l>8?dx/l*k:0;tc.y=l>8?dy/l*k:0}},{passive:false});
const tend=e=>{for(const t of e.changedTouches){const k=tt[t.identifier];delete tt[t.identifier];
 if(k=='grd')tc.guard=false;if(k=='stk'){stick=null;tc.x=tc.y=0}}};
cv.addEventListener('touchend',tend);cv.addEventListener('touchcancel',tend);

// ---------- Partida ----------
function reset(){
 IW=AC.w;IH=AC.h;MW=IW+4;MH=IH+4;
 BX=[IX*T+24,(IX+IW)*T-24];BY=[IY*T+24,(IY+IH)*T-16];
 const cx=(IX+IW/2)*T,cy=(IY+IH/2)*T,seed=DAILY?dayNum()*97+5:Math.floor(Math.random()*2e9);
 P=mk(cx,cy,'b',100+10*META.vid);
 Object.assign(P,{buf:{str:0,spd:0,shd:0},lv:{fue:0,vel:0,vid:0,dod:0,ran:0,vam:0,cri:0,cor:0},vx:0,vy:0,aim:{x:1,y:0},ch:2,chMax:2,dash:null,gm:100,gmd:0,gt:9,gbk:0,dustT:0});
 E=[];M=[];PU=[];FX=[];TX=[];AR=[];HF=[];SH=[];OB=[];PA=[];SL=[];RG=[];
 G={wave:0,kills:0,over:false,banner:0,time:0,play:0,gap:1.5,shake:0,flash:0,score:0,stage:'',name:'',rank:0,saved:false,
  dif:DAILY?1:DIF,pick:false,pickAt:0,ps:1,ch:[],pk:'',kr:0,kc:0,paused:false,pm:0,conf:false,combo:0,ct:0,bestCombo:0,need:false,hurtW:false,
  slow:0,tok:0,lim:2,tuto:!!SET.tips&&ls('tinyswords_tuto')!=='1',ts:0,tt:0,moved:0,dodged:0,parries:0,perfects:0,daily:DAILY,seed,theme:'',gold:0,tip:''};
 seedTo(seed);
 const place=(k,x,y)=>OB.push({k,x,y,r:OD[k].r,ph:rs()*8,fl:k=='tree'&&rs()<.5?-1:1,im:k=='rock'?(rs()<.5?'rock1':'rock2'):k});
 for(const [k] of AC.o)if(k=='castle')place('castle',cx,cy-3*T);
 for(const [k,n] of AC.o){if(k=='castle')continue;
  for(let i=0;i<n;i++){let x,y,t=0,ok;
   do{x=BX[0]+40+rs()*(BX[1]-BX[0]-80);y=BY[0]+90+rs()*(BY[1]-BY[0]-90);
    ok=Math.hypot(x-cx,y-cy)>210&&OB.every(o=>Math.hypot(x-o.x,y-o.y)>o.r+OD[k].r+40)}while(!ok&&++t<60);
   if(ok)place(k,x,y)}}
 updCam(0,true);nextWave();
}
const rndPos=()=>({x:BX[0]+rs()*(BX[1]-BX[0]),y:BY[0]+rs()*(BY[1]-BY[0])});
function roll(){
 const th=G.theme,mul={r:1,k:th=='horda'?6:1,y:th=='blindados'?4:1,a:(th=='arqueros'?4:1)*AC.arch,p:1,l:th=='blindados'?3:1,m:1};
 const w=WT.filter(t=>G.wave>=t[2]&&!(t[0]=='m'&&E.filter(e=>e.ty=='m').length>=2));
 let r=rs()*w.reduce((a,t)=>a+t[1]*mul[t[0]],0);
 for(const t of w){r-=t[1]*mul[t[0]];if(r<=0)return t[0]}return 'r'}
function enemy(t,x,y){
 const w=G.wave,hp=45+w*4,sp=90+w*5;
 const D={r:['r','w',hp,sp,12,1.1],y:['y','w',hp*2,sp*.8,18,1.4],p:['p','w',hp*.7,sp*1.5,8,.8],
  k:['r','k',16+w*2,sp*1.7,6,.7],a:['r','a',28+w*3,105,10,1.8],l:['r','l',hp*1.4,115,22,2.2],m:['r','m',26+w*2,100,0,3],B:['r','b',450,68,28,1.6]}[t];
 const e=mk(x,y,D[0],Math.round(D[2]));
 Object.assign(e,{ty:D[1],sp:D[3],dmg:D[4],rest:D[5],elite:t!='r'&&t!='k'});
 if(t=='B')Object.assign(e,{rad:24,gb:.5,sd:32,scd:5,ext:0,bf:0,lf:0,slcd:99,fury:false});
 return e}
function nextWave(){
 G.wave++;G.banner=2.6;G.need=true;G.hurtW=false;seedTo(G.seed+G.wave*7919);
 if(G.wave>1){G.score+=100*(G.wave-1);pop(P.x,P.y-140,'+'+100*(G.wave-1),'#ffd76a')}
 const bw=G.wave%5==0,r=rs();
 G.theme=bw||G.wave<2?'':r<.4?'':r<.6?'horda':r<.8?'arqueros':'blindados';
 const n0=Math.min(Math.round((1+G.wave*2)*AC.mult*(G.theme=='horda'?1.3:G.theme=='blindados'?.75:1)),18),n=bw?Math.ceil(n0*.5):n0;
 for(let i=0;i<n;i++){let p,k=0;
  do p=rndPos();while(Math.hypot(p.x-P.x,p.y-P.y)<420&&++k<40);
  const e=enemy(roll(),p.x,p.y);push(e);E.push(e)}
 if(bw){let p,k=0;do p=rndPos();while(Math.hypot(p.x-P.x,p.y-P.y)<460&&++k<40);
  const b=enemy('B',p.x,p.y);b.hp=b.max=450+(G.wave/5-1)*250;push(b);E.push(b);G.banner=3.4}
 if(G.wave>1){const p=rndPos();spawnPU(p.x,p.y)}
 while(SH.length<AC.sheep){const p=rndPos();SH.push({x:p.x,y:p.y,fx:1,st:'Idle',t:0,wt:1+Math.random()*3});push(SH[SH.length-1])}
}
function spawnPU(x,y){const k=Object.keys(PT);PU.push({x,y,k:k[Math.floor(Math.random()*k.length)],t:0})}
function push(e){
 for(const t of OB){const dx=e.x-t.x,dy=e.y-t.y,d=Math.hypot(dx,dy),m=t.r+(e.rad||18);
  if(d<m&&d>0){e.x=t.x+dx/d*m;e.y=t.y+dy/d*m}}
 e.x=clamp(e.x,BX[0],BX[1]);e.y=clamp(e.y,BY[0],BY[1]);
}
function updCam(dt,snap){
 const A=P.aim,tx=clamp(P.x+A.x*34-W/2,0,MW*T-W),ty=clamp(P.y+A.y*24-H/2,0,MH*T-H),k=snap?1:Math.min(1,dt*7);
 cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k}

// ---------- Mejoras (1 de 3 tras cada oleada; el jefe ofrece Fuerza/Velocidad/Vida) ----------
function openPick(kind){
 let ch;
 if(kind=='boss')ch=['fue','vel','vid'].map(k=>UPG.find(u=>u.k==k));
 else{seedTo(G.seed+G.wave*31);const pool=UPG.filter(u=>P.lv[u.k]<u.max);ch=[];
  while(ch.length<3&&pool.length)ch.push(pool.splice(Math.floor(rs()*pool.length),1)[0]);
  while(ch.length<3)ch.push(UPG[2])}
 G.ch=ch;G.pk=kind;G.pick=true;G.ps=1;want=wantD=0}
function applyUp(i){const u=G.ch[i];if(!u)return;P.lv[u.k]++;
 if(u.k=='vid'){P.max+=25;P.hp=Math.min(P.max,P.hp+25)}
 if(u.k=='dod')P.chMax++;
 pop(P.x,P.y-130,u.n+' Nv.'+P.lv[u.k],u.c);burst(P.x,P.y,30,20,u.c,220,.6,4,300);G.pick=false;rumble(.4,150)}

// ---------- Combate ----------
function heal(n){const h=Math.min(n,P.max-P.hp);if(h>0){P.hp+=h;pop(P.x,P.y-110,'+'+h,'#8dff8d')}}
function die(){
 G.over=true;G.stage='name';G.name=ls('tinyswords_nombre')||'';FX.push({x:P.x,y:P.y,t:0,s:1});hitstop(.25);shake(8);
 G.gold=Math.floor((G.score/40+G.wave*8)*(1+.1*META.loot));META.gold+=G.gold;saveMeta()}
function parry(from){
 G.parries++;G.score+=60;P.iv=.3;hitstop(.12);shake(4);rumble(.5,100);
 pop(P.x,P.y-130,'¡Parada! +60','#9fd3ff');burst(P.x+P.fx*30,P.y,45,18,'#d6f0ff',260,.4,4,500);
 if(from.hp!==undefined){from.stun=from.ty=='b'?.5:1.3;from.mode=null;if(atk(from))set(from,'Idle');from.kx=Math.sign(from.x-P.x)*140}}
function perfectDodge(){
 P.iv=.35;G.perfects++;G.score+=40;P.ch=Math.min(P.chMax,P.ch+1);G.slow=.6;hitstop(.05);
 pop(P.x,P.y-130,'¡Esquiva perfecta! +40','#9fd3ff');burst(P.x,P.y,30,18,'#9fd3ff',240,.5,4,300)}
function hurtP(d,from){
 if(P.iv>0||G.over)return;
 if(P.dash){perfectDodge();return}
 if(P.buf.shd>0){pop(P.x,P.y-110,'Inmune','#7ec8ff');P.iv=.3;return}
 const d0=d;d=Math.max(1,Math.round(d*DIFS[G.dif].m));
 const front=P.guard&&(from.x-P.x)*P.fx>0;let blocked=false;
 if(front){
  if(P.gt<.2){parry(from);return}
  blocked=true;d=Math.max(1,Math.round(d*(from.gb||.2)));P.gm-=d0*1.8;P.gmd=.7;
  if(P.gm<=0){P.gm=0;P.gbk=1;P.guard=false;pop(P.x,P.y-130,'¡Guardia rota!','#ff8a78');shake(6)}}
 P.hp=Math.max(0,P.hp-d);P.hit=.2;P.iv=blocked?.25:.6;
 P.kx=Math.sign(P.x-from.x)*(blocked?120:260);
 if(!blocked){G.combo=0;G.hurtW=true;G.flash=1;hitstop(.07);shake(5)}
 burst(P.x,P.y,40,blocked?5:10,blocked?'#9fd3ff':'#ff6b5e',200,.4,4,500);
 rumble(blocked?.3:.9,blocked?90:220);
 pop(P.x,P.y-110,blocked?'Bloqueo -'+d:'-'+d,blocked?'#9fd3ff':'#ff6b5e',1);
 if(P.hp<=0)die();
}
const KCOL={r:'#d94b3c',y:'#e8b84a',p:'#a070e0',k:'#c86a4a',a:'#d97a4c',l:'#c94b6c',m:'#e8e0d0',b:'#8a93aa'};
function killE(e){
 E.splice(E.indexOf(e),1);G.kills++;G.combo++;G.ct=3.2;G.bestCombo=Math.max(G.bestCombo,G.combo);
 G.score+=Math.round((PTS[e.ty=='w'?e.col:e.ty]||100)*comboMul()*DIFS[G.dif].s);
 const big=e.elite||e.ty=='b';
 burst(e.x,e.y,30,big?26:14,KCOL[e.ty=='w'?e.col:e.ty],260,.6,5,500);FX.push({x:e.x,y:e.y,t:0,s:e.ty=='b'?1:big?.75:.5});
 hitstop(e.ty=='b'?.2:.06);shake(big?4:2);
 if(P.lv.vam)heal(2*P.lv.vam);
 if(e.ty=='b'){for(let i=-1;i<=1;i++){spawnPU(e.x+i*70,e.y+40);FX.push({x:e.x+i*50,y:e.y-20*i,t:0,s:1})}
  M.push({x:e.x-40,y:e.y+70,t:0},{x:e.x+40,y:e.y+70,t:0});G.kills+=4;shake(12);pop(e.x,e.y-120,'¡Jefe derrotado!','#ffd76a');if(!G.over)G.pickAt=1.3}
 else{const r=Math.random();if(r<(e.elite?.5:.2))spawnPU(e.x,e.y);else if(r<(e.elite?.8:.55))M.push({x:e.x,y:e.y,t:0})}
}
function hurtE(e,d,crit){
 e.hp-=d;e.hit=.15;const kb=e.ty=='b'?.1:1,a=Math.atan2(e.y-P.y,e.x-P.x);
 e.kx=Math.cos(a)*280*kb;e.ky=Math.sin(a)*280*kb;
 pop(e.x,e.y-110,crit?'¡'+d+'!':'-'+d,crit?'#ffb347':'#fff2a8',1);
 burst(e.x,e.y,40,crit?10:6,crit?'#ffb347':'#fff6c8',220,.35,4,600);
 if(atk(e)&&e.t<.2&&!e.mode&&e.ty!='m'&&e.ty!='b'){set(e,'Idle');e.cd=.6}
 if(e.hp<=0)killE(e)}
function swing(){
 const L=P.lv,R=112*(1+.2*L.ran),ang=(62+10*L.ran)*Math.PI/180,ca=Math.cos(ang),A=P.aim,base=(P.combo?25:20)*dmgMul();
 const inR_=o=>{const dx=o.x-P.x,dy=o.y-P.y,d=Math.hypot(dx,dy);return d<=R+(o.rad||0)&&(d<48||(dx*A.x+dy*A.y)/d>=ca)};
 let hit=0;
 for(const e of E.slice())if(inR_(e)){const c=Math.random()<.12*L.cri;hurtE(e,Math.round(base*(c?2:1)),c);hit++}
 for(const s of SH.slice())if(inR_(s)){SH.splice(SH.indexOf(s),1);M.push({x:s.x,y:s.y,t:0});pop(s.x,s.y-60,'¡Carne!','#ffd08a');hit++}
 SL.push({x:P.x,y:P.y,a:Math.atan2(A.y,A.x),r:R,w:ang,t:0,c:P.combo});
 P.vx+=A.x*90;P.vy+=A.y*90;if(hit)hitstop(.045)}
function take(k){const t=PT[k];pop(P.x,P.y-130,t.n+'!',t.c);burst(P.x,P.y,50,14,t.c,200,.5,4,300);
 if(k=='nova'){FX.push({x:P.x,y:P.y,t:0,s:1});RG.push({x:P.x,y:P.y,t:0});shake(5);for(const e of E.slice())if(Math.hypot(e.x-P.x,e.y-P.y)<240)hurtE(e,45)}
 else P.buf[k]=t.d;rumble(.4,120)}

// ---------- Jugador ----------
function inputVec(){
 let dx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),dy=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);
 dx+=pad.x+tc.x;dy+=pad.y+tc.y;return[dx,dy]}
function updP(dt){
 const p=P;p.iv-=dt;p.hit-=dt;p.t+=dt;p.gt+=dt;p.gbk-=dt;p.gmd-=dt;
 if(want&&(wantT-=dt)<=0)want=0;if(wantD&&(wantDT-=dt)<=0)wantD=0;
 for(const k in p.buf)p.buf[k]=Math.max(0,p.buf[k]-dt);
 p.ch=Math.min(p.chMax,p.ch+dt/(1.6-.3*p.lv.dod));
 if(!p.guard&&p.gmd<=0)p.gm=Math.min(100,p.gm+32*dt);
 if(G.over)return;
 const[ix,iy]=inputVec(),il=Math.hypot(ix,iy);
 if(il>.3)p.aim={x:ix/il,y:iy/il};
 const wasG=p.guard;
 p.guard=!!(keys.ShiftLeft||keys.ShiftRight||keys.KeyK||pad.guard||tc.guard)&&!atk(p)&&!p.dash&&p.gbk<=0;
 if(p.guard&&!wasG)p.gt=0;
 // esquiva: invulnerable mientras dura; se puede cancelar la recuperación de un ataque
 if(wantD&&!p.dash&&p.ch>=1&&p.gbk<=0&&(!atk(p)||p.dealt)){
  wantD=0;p.ch-=1;G.dodged++;const dv=il>.3?[ix/il,iy/il]:[p.aim.x,p.aim.y];
  p.dash={t:0,vx:dv[0],vy:dv[1],id:Math.random()};set(p,'Run');if(Math.abs(dv[0])>.25)p.fx=Math.sign(dv[0]);p.guard=false;
  burst(p.x,p.y,4,8,'#e8dcc0',140,.35,4,300)}
 if(p.dash){const d=p.dash;d.t+=dt;p.x+=d.vx*560*dt;p.y+=d.vy*560*dt;
  if(p.lv.cor)for(const e of E.slice())if(e.dh!==d.id&&Math.hypot(e.x-p.x,e.y-p.y)<54){e.dh=d.id;hurtE(e,Math.round((12+8*p.lv.cor)*dmgMul()))}
  if(Math.random()<.7)burst(p.x,p.y,8,1,'rgba(190,215,255,.8)',30,.3,6,0);
  if(d.t>=.22){p.dash=null;p.iv=Math.max(p.iv,.1);p.vx=d.vx*120;p.vy=d.vy*120}
  push(p);pushBoss(p);return}
 if(p.gbk>0){set(p,'Idle');p.x+=p.kx*dt;p.kx*=Math.exp(-10*dt);push(p);return}
 const slide=AC.ice?1:8;
 if(atk(p)){
  if(p.buf.spd>0)p.t+=dt*.5;
  p.t+=dt*(.06*p.lv.vel+.03*META.vel);
  if(!p.dealt&&p.t>=2/14){p.dealt=true;swing()}
  if(p.t>=4/14)set(p,'Idle');
  p.vx*=1-Math.min(1,slide*dt);p.vy*=1-Math.min(1,slide*dt);
 }else{
  if(want&&!p.guard){want=0;p.combo^=1;set(p,p.combo?'Atk2':'Atk1');p.dealt=false;if(Math.abs(p.aim.x)>.25)p.fx=Math.sign(p.aim.x)}
  else{
   const sp=(p.guard?70:210)*(p.buf.spd>0?1.4:1)*(1+.1*p.lv.vel+.04*META.vel),m=Math.min(1,il);
   const tvx=il>.05?ix/il*sp*m:0,tvy=il>.05?iy/il*sp*m:0,k=Math.min(1,(AC.ice?2.4:18)*dt);
   p.vx+=(tvx-p.vx)*k;p.vy+=(tvy-p.vy)*k;
   if(il>.05&&Math.abs(ix)>.2)p.fx=Math.sign(ix);
   if(il>.05)G.moved+=Math.hypot(p.vx,p.vy)*dt;
   if(il>.05&&!p.guard&&(p.dustT-=dt)<=0){p.dustT=.14;burst(p.x,p.y,0,1,'rgba(225,210,170,.7)',50,.4,3,120)}
   set(p,p.guard?'Guard':il>.05?'Run':'Idle')}}
 p.x+=p.vx*dt+p.kx*dt;p.y+=p.vy*dt;p.kx*=Math.exp(-10*dt);push(p);pushBoss(p);
 for(const m of M.slice()){const dx=p.x-m.x,dy=p.y-m.y,d=Math.hypot(dx,dy);
  if(p.hp<p.max&&d<110&&d>0){m.x+=dx/d*240*dt;m.y+=dy/d*240*dt}
  if(p.hp<p.max&&d<46){M.splice(M.indexOf(m),1);heal(25)}}
 for(const u of PU.slice()){const dx=p.x-u.x,dy=p.y-u.y,d=Math.hypot(dx,dy);
  if(d<110&&d>0){u.x+=dx/d*240*dt;u.y+=dy/d*240*dt}
  if(d<46){PU.splice(PU.indexOf(u),1);take(u.k)}}
}
function pushBoss(p){for(const e of E)if(e.ty=='b'){const bx=p.x-e.x,by=p.y-e.y,bd=Math.hypot(bx,by);if(bd<34&&bd>0){p.x=e.x+bx/bd*34;p.y=e.y+by/bd*34}}}

// ---------- IA de enemigos ----------
function aiA(e,dx,dy,d,dt){ // arquero: mantiene distancia y dispara
 if(dx)e.fx=Math.sign(dx);
 if(atk(e)){
  if(!e.dealt&&e.t>=.42){e.dealt=true;const l=Math.hypot(P.x-e.x,P.y-e.y)||1;
   AR.push({x:e.x+e.fx*20,y:e.y,vx:(P.x-e.x)/l*430,vy:(P.y-e.y)/l*430,dmg:e.dmg,life:2.5})}
  if(e.t>=.67){set(e,'Idle');e.cd=e.rest+Math.random()*.6}
 }else if(!G.over){
  let mv=0;
  if(d<190){e.x-=dx/d*e.sp*dt;e.y-=dy/d*e.sp*dt;mv=1}
  else if(d>380){e.x+=dx/d*e.sp*dt;e.y+=dy/d*e.sp*dt;mv=1}
  if(!mv&&e.cd<=0&&d<520){set(e,'Atk1');e.dealt=false}else set(e,mv?'Run':'Idle');
 }else set(e,'Idle');
}
function aiL(e,dx,dy,d,dt){ // lancero: aviso y embestida
 if(e.mode=='tele'){
  set(e,'Idle');
  if(e.t<.45){e.vx=dx/d;e.vy=dy/d;e.fx=Math.sign(dx)||e.fx}
  if(e.t>=.75){e.mode='dash';set(e,'Atk1');e.hd=false}
 }else if(e.mode=='dash'){
  e.x+=e.vx*560*dt;e.y+=e.vy*560*dt;
  if(!e.hd&&Math.hypot(P.x-e.x,P.y-e.y)<60){e.hd=true;hurtP(e.dmg,e)}
  if(e.t>=.5){e.mode='rest';set(e,'Idle')}
 }else if(e.mode=='rest'){set(e,'Idle');if(e.t>=e.rest){e.mode=null;e.cd=.4}}
 else if(!G.over&&d<620){
  e.fx=Math.sign(dx)||e.fx;
  if(d<340&&e.cd<=0){e.mode='tele';set(e,'Idle');e.t=0;e.vx=dx/d;e.vy=dy/d}
  else if(d>90){e.x+=dx/d*e.sp*dt;e.y+=dy/d*e.sp*dt;set(e,'Run')}else set(e,'Idle');
 }else set(e,'Idle');
}
function aiM(e,dx,dy,d,dt){ // monje: cura a los aliados heridos
 if(atk(e)){
  if(!e.dealt&&e.t>=.45){e.dealt=true;const g=e.tg;
   if(g&&E.includes(g)){g.hp=Math.min(g.max,g.hp+20);pop(g.x,g.y-110,'+20','#8dff8d');HF.push({x:g.x,y:g.y,t:0})}}
  if(e.t>=.78){set(e,'Idle');e.cd=e.rest}return}
 if(e.cd<=0){let b=null;
  for(const o of E)if(o!==e&&o.hp<o.max*.75&&Math.hypot(o.x-e.x,o.y-e.y)<420&&(!b||o.hp/o.max<b.hp/b.max))b=o;
  if(b){e.tg=b;e.fx=Math.sign(b.x-e.x)||1;set(e,'Atk1');e.dealt=false;return}}
 if(d<260&&!G.over){e.x-=dx/d*e.sp*dt;e.y-=dy/d*e.sp*dt;e.fx=Math.sign(dx)||1;set(e,'Run')}else set(e,'Idle');
}
function aiB(e,dx,dy,d,dt){ // Coloso Férreo: puño, brazos extensibles (enfriamiento) y, en furia, pisotón
 e.scd-=dt;e.slcd-=dt;
 if(!e.fury&&e.hp<e.max*.5){e.fury=true;e.sp*=1.3;e.rest=.9;e.slcd=1.5;shake(10);hitstop(.1);pop(e.x,e.y-150,'¡FURIA!','#ff5040');burst(e.x,e.y,60,30,'#ff5040',300,.7,5,400)}
 if(e.mode=='slam'){
  const t=e.t;set(e,'Atk2');e.ext=0;
  if(t<.85)e.bf=1;
  else{e.bf=2;if(!e.dealt){e.dealt=true;shake(14);hitstop(.08);RG.push({x:e.x,y:e.y,t:0});burst(e.x,e.y,20,30,'#c9b38a',320,.7,5,400);
   if(Math.hypot(P.x-e.x,P.y-e.y)<150)hurtP(e.sd-4,e)}}
  if(t>=1.3){e.mode=null;set(e,'Idle');e.cd=1.2;e.slcd=6}
 }else if(e.mode=='str'){
  const t=e.t;set(e,'Atk2');
  if(t<.9){e.bf=t<.45?0:1;e.ext=0;if(t<.55){e.vx=dx/d;e.vy=dy/d;e.fx=Math.sign(dx)||e.fx}}
  else if(t<1.05){e.bf=2;e.ext=(t-.9)/.15}
  else if(t<1.35){e.bf=2;e.ext=1}
  else if(t<1.9){e.bf=3;e.ext=1-(t-1.35)/.55}
  else{e.mode=null;e.ext=0;set(e,'Idle');e.cd=1.4;e.scd=e.fury?6:9}
  if(e.mode&&!e.hd&&e.ext>.6){
   const rx=P.x-e.x,ry=P.y-e.y,pr=rx*e.vx+ry*e.vy,lt=Math.abs(-rx*e.vy+ry*e.vx);
   if(pr>14&&pr<220*e.ext+30&&lt<40){e.hd=true;hurtP(e.sd,e);shake(8);FX.push({x:e.x+e.vx*pr,y:e.y+e.vy*pr,t:0,s:.8})}}
 }else if(e.mode=='pun'){
  if(!e.dealt&&e.t>=.375){e.dealt=true;shake(6);FX.push({x:e.x+e.fx*90,y:e.y,t:0,s:.8});
   if(Math.abs(dy)<60&&dx*e.fx>-20&&dx*e.fx<115)hurtP(e.dmg,e)}
  if(e.t>=.75){e.mode=null;set(e,'Idle');e.cd=e.rest}
 }else if(!G.over&&d<1000){
  if(dx)e.fx=Math.sign(dx);
  if(e.fury&&e.slcd<=0&&e.cd<=0&&d<210){e.mode='slam';e.dealt=false;set(e,'Atk2');e.t=0;e.bf=1}
  else if(e.cd<=0&&e.scd<=0&&d>150&&d<300){e.mode='str';e.hd=false;set(e,'Atk2');e.t=0;e.bf=0;e.vx=dx/d;e.vy=dy/d}
  else if(e.cd<=0&&d<100){e.mode='pun';e.dealt=false;set(e,'Atk1')}
  else if(d>72){e.x+=dx/d*e.sp*dt;e.y+=dy/d*e.sp*dt;set(e,'Run');
   const f=Math.floor(e.t*7)%6;if(f!=e.lf){e.lf=f;if(f==0||f==3)shake(3)}}
  else set(e,'Idle');
 }else set(e,'Idle');
}
function updE(e,dt){
 e.hit-=dt;e.t+=dt;e.cd-=dt;
 const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1;
 if(e.stun>0){e.stun-=dt;if(!atk(e))set(e,'Idle')}
 else if(e.ty=='a')aiA(e,dx,dy,d,dt);else if(e.ty=='l')aiL(e,dx,dy,d,dt);else if(e.ty=='m')aiM(e,dx,dy,d,dt);else if(e.ty=='b')aiB(e,dx,dy,d,dt);
 else if(atk(e)){ // cuerpo a cuerpo (guerrero y peón)
  if(!e.dealt&&e.t>=.3){e.dealt=true;
   if(Math.abs(dy)<70&&dx*e.fx>-20&&dx*e.fx<115)hurtP(e.dmg,e)}
  if(e.t>=.5){set(e,'Idle');e.cd=e.rest}
 }else if(!G.over&&d<560){
  if(dx)e.fx=Math.sign(dx);
  const can=G.tok<G.lim;
  if(d<80&&e.cd<=0&&can){set(e,Math.random()<.5?'Atk1':'Atk2');e.dealt=false;G.tok++}
  else if(!can&&d<175){ // sin turno de ataque: rodea al jugador
   e.sd=e.sd||(Math.random()<.5?1:-1);const f=e.sp*.55;
   e.x+=(-dy/d*e.sd+(d<120?-dx/d:0))*f*dt;e.y+=(dx/d*e.sd+(d<120?-dy/d:0))*f*dt;set(e,'Run')}
  else if(d>65){e.x+=dx/d*e.sp*dt;e.y+=dy/d*e.sp*dt;set(e,'Run')}
  else set(e,'Idle');
 }else set(e,'Idle');
 for(const o of E)if(o!==e){const ox=e.x-o.x,oy=e.y-o.y,od=Math.hypot(ox,oy);
  if(od<52&&od>0){e.x+=ox/od*80*dt;e.y+=oy/od*80*dt}}
 e.x+=e.kx*dt;e.y+=e.ky*dt;const f=Math.exp(-10*dt);e.kx*=f;e.ky*=f;push(e);
}
function update(dt){
 if(dt<=0)return;
 G.banner-=dt;G.play+=dt;G.shake=Math.max(0,G.shake-dt*24);G.flash=Math.max(0,G.flash-dt*2.2);
 G.lim=2+(G.wave>=8?1:0)+(G.dif==2?1:0);G.tok=0;
 for(const e of E)if((e.ty=='w'||e.ty=='k')&&atk(e))G.tok++;
 updP(dt);for(const e of E.slice())updE(e,dt);
 for(const a of AR){a.x+=a.vx*dt;a.y+=a.vy*dt;a.life-=dt;
  if(!G.over&&Math.hypot(a.x-P.x,a.y-P.y)<26){hurtP(a.dmg,{x:P.x-Math.sign(a.vx||1)*50});a.life=0}
  else if(OB.some(o=>Math.hypot(a.x-o.x,a.y-o.y)<o.r*.8)||a.x<BX[0]-60||a.x>BX[1]+60||a.y<BY[0]-60||a.y>BY[1]+60)a.life=0}
 AR=AR.filter(a=>a.life>0);
 for(const s of SH){s.t+=dt;s.wt-=dt;
  if(s.st=='Idle'&&s.wt<=0){s.tx=clamp(s.x+(Math.random()-.5)*300,BX[0],BX[1]);s.ty=clamp(s.y+(Math.random()-.5)*300,BY[0],BY[1]);s.st='Move';s.t=0}
  if(s.st=='Move'){const dx=s.tx-s.x,dy=s.ty-s.y,d=Math.hypot(dx,dy);
   if(d<6){s.st='Idle';s.t=0;s.wt=2+Math.random()*3}else{s.x+=dx/d*45*dt;s.y+=dy/d*45*dt;s.fx=Math.sign(dx)||1}}
  push(s)}
 for(const u of PU)u.t+=dt;PU=PU.filter(u=>u.t<18);
 for(const f of FX)f.t+=dt;FX=FX.filter(f=>f.t<.5);
 for(const f of HF)f.t+=dt;HF=HF.filter(f=>f.t<.8);
 for(const s of SL)s.t+=dt;SL=SL.filter(s=>s.t<.16);
 for(const r of RG)r.t+=dt;RG=RG.filter(r=>r.t<.35);
 for(const t of TX){t.t+=dt;t.y-=40*dt}TX=TX.filter(t=>t.t<.9);
 updPA(dt);
 if(G.ct>0&&(G.ct-=dt)<=0)G.combo=0;
 if(G.pickAt>0&&!G.over&&(G.pickAt-=dt)<=0)openPick('boss');
 if(!E.length&&!G.over&&G.banner<0&&!G.pick&&!(G.pickAt>0)){
  if(G.need){G.need=false;if(!G.hurtW){const b=150*G.wave;G.score+=b;pop(P.x,P.y-150,'¡Oleada perfecta! +'+b,'#ffd76a')}openPick('wave')}
  else{G.gap-=dt;if(G.gap<=0){G.gap=1.5;nextWave()}}}
 updCam(dt);updTips(dt);
}
function updTips(dt){ // tutorial contextual (solo la primera vez)
 if(!G.tuto)return;G.tt+=dt;const go=n=>{G.ts=n;G.tt=0};
 switch(G.ts){
  case 0:G.tip='Muévete: WASD / flechas · stick izquierdo';if(G.moved>160)go(1);break;
  case 1:G.tip='Ataca: Espacio / J · botón A (golpeas hacia donde te mueves)';if(G.kills>=1)go(2);break;
  case 2:G.tip='Esquiva: L / E · botón B o RB — eres invulnerable mientras ruedas';if(G.dodged>=1||G.tt>14)go(3);break;
  case 3:G.tip='Guardia: Shift / K · LB. Pulsa justo antes del golpe para pararlo y aturdir al enemigo';if(G.parries>=1||G.tt>12)go(4);break;
  case 4:G.tip=PU.length||M.length?'Recoge orbes y carne: dan potenciadores y vida':'';if(G.tt>10)go(5);break;
  default:G.tip='';G.tuto=false;ls('tinyswords_tuto','1')}}

// ---------- Dibujo ----------
function spr(im,fw,fh,fr,x,y,fx,ox,oy){
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(fx,1);
 ctx.drawImage(im,fr*fw,0,fw,fh,-ox,-oy,fw,fh);ctx.restore();
}
const shadow=(x,y,rx)=>{ctx.fillStyle='rgba(0,0,0,.26)';ctx.beginPath();ctx.ellipse(x,y+2,rx,rx*.35,0,0,7);ctx.fill()};
function bossArm(e,x,y,front){ // brazos extensibles del jefe: se dibujan por código para apuntar en cualquier dirección
 const s=BSH[e.bf],ext=e.ext||0,i=front?1:0,sx=x+e.fx*s[i*2],sy=y+s[i*2+1];
 const rx=x+e.fx*(front?s[4]+31:s[4]-26),ry=y-50,vx=e.vx||e.fx,vy=e.vy||0,off=front?-12:12;
 const tx=x+vx*220-vy*off,ty=y+vy*220+vx*off-20,fx=rx+(tx-rx)*ext,fy=ry+(ty-ry)*ext;
 const a=Math.atan2(fy-sy,fx-sx),len=Math.hypot(fx-sx,fy-sy);
 ctx.save();ctx.translate(Math.round(sx),Math.round(sy));ctx.rotate(a);if(Math.cos(a)<0)ctx.scale(1,-1);
 for(let d=0;d<len;d+=32){const w=Math.min(32,len-d);ctx.drawImage(img.bArm,0,0,w,20,d,-10,w,20)}
 if(len>45)for(const k of [.36,.62,.86])ctx.drawImage(img.bRing,len*k-6,-11);
 ctx.drawImage(img.bFist,len-32,-32);ctx.restore()}
function drawUnit(e){
 const x=e.x-cam.x,y=e.y-cam.y,F=FAM[e.ty],d=F.a[e.st]||F.a.Idle;
 shadow(x,y,F.sh||26);
 if(e===P){let i=0;for(const k in P.buf)if(P.buf[k]>0){ctx.strokeStyle=PT[k].c;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y+2,30+i*7,11+i*3,0,0,7);ctx.stroke();i++}
  if(P.buf.shd>0){ctx.strokeStyle='rgba(126,200,255,.8)';ctx.beginPath();ctx.arc(x,y-40,52,0,7);ctx.stroke()}
  if(P.guard){ctx.strokeStyle=P.gt<.2?'rgba(255,255,255,.95)':'rgba(159,211,255,.55)';ctx.lineWidth=P.gt<.2?5:3;ctx.beginPath();ctx.arc(x+P.fx*26,y-42,40,-1.1+(P.fx<0?Math.PI:0),1.1+(P.fx<0?Math.PI:0));ctx.stroke()}}
 if(e.mode=='tele'){ctx.save();ctx.strokeStyle='rgba(255,60,40,.33)';ctx.lineWidth=34;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x,y-20);ctx.lineTo(x+e.vx*280,y-20+e.vy*280);ctx.stroke();ctx.restore()}
 if(e.mode=='str'&&e.t<.9){ctx.save();ctx.strokeStyle='rgba(255,60,40,.26)';ctx.lineWidth=46;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+e.vx*220,y+e.vy*220);ctx.stroke();ctx.restore()}
 if(e.mode=='slam'&&e.t<.85){ctx.save();ctx.fillStyle='rgba(255,60,40,'+(.1+.25*e.t/.85)+')';ctx.strokeStyle='rgba(255,90,60,.75)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,150,75,0,0,7);ctx.fill();ctx.stroke();ctx.restore()}
 if(e.fury){ctx.strokeStyle='rgba(255,60,40,'+(.4+.3*Math.sin(G.time*8))+')';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(x,y+2,50,18,0,0,7);ctx.stroke()}
 if(e.ty=='a'&&atk(e)&&e.t<.42){ctx.save();ctx.strokeStyle='rgba(255,70,50,.5)';ctx.lineWidth=2;ctx.setLineDash([6,6]);
  ctx.beginPath();ctx.moveTo(x,y-40);ctx.lineTo(P.x-cam.x,P.y-cam.y-35);ctx.stroke();ctx.restore()}
 let fps=d[2];if(e.ty=='w'&&e!==P&&atk(e))fps=8;
 const n=d[1],loop=!atk(e)&&e.st!='Guard';
 const fr=loop?Math.floor(e.t*fps)%n:Math.min(n-1,Math.floor(e.t*fps));
 const im=img[e.ty=='w'?e.col+e.st:d[0]];
 if(e.hit>0)ctx.filter='brightness(2.6) saturate(.4)';
 if(G.over&&e===P)ctx.globalAlpha=.45;
 else if(e===P&&SET.flash&&P.iv>0&&!P.dash&&Math.floor(G.time*20)%2)ctx.globalAlpha=.55;
 else if(e===P&&P.dash)ctx.globalAlpha=.7;
 const bs=e.ty=='b'&&e.st=='Atk2';
 if(bs)bossArm(e,x,y,0);
 spr(im,F.fw,im.height,bs?e.bf:fr,x,y,e.fx,F.ox,F.oy);
 if(bs)bossArm(e,x,y,1);
 ctx.filter='none';ctx.globalAlpha=1;
 if(e.mode=='tele')text('!',x,y-118,34,'#ff5040');
 if(e.mode=='str'&&e.t<.9)text('!',x,y-128,40,'#ff5040');
 if(e!==P&&(e.ty=='w'||e.ty=='k')&&atk(e)&&e.t<.3)text('!',x,y-104,24,'#ffb347');
 if(e!==P&&e.stun>0)text('✦ ✦',x,y-(e.ty=='b'?130:104),18,'#ffe066');
 if(e!==P&&e.ty!='b'&&e.hp<e.max){ctx.fillStyle='#2b1a10';ctx.fillRect(x-24,y-104,48,7);
  ctx.fillStyle='#d94b3c';ctx.fillRect(x-22,y-102,44*e.hp/e.max,3)}
}
function drawObs(o){
 const x=o.x-cam.x,y=o.y-cam.y;shadow(x,y,o.r*1.2);
 if(o.k=='tree')return spr(img.tree,192,256,Math.floor(G.time*6+o.ph)%8,x,y,o.fl,96,235);
 const D=OD[o.k];ctx.drawImage(img[o.im],Math.round(x-D.ox),Math.round(y-D.oy));
}
function drawTerrain(){
 const cx=Math.floor(cam.x/T),cy=Math.floor(cam.y/T),nx=Math.ceil(W/T)+1,ny=Math.ceil(H/T)+1;
 for(let ty=cy;ty<=cy+ny;ty++)for(let tx=cx;tx<=cx+nx;tx++)ctx.drawImage(img.water,tx*T-cam.x,ty*T-cam.y,T,T);
 for(let ty=Math.max(IY,cy);ty<Math.min(IY+IH,cy+ny+1);ty++)
  for(let tx=Math.max(IX,cx);tx<Math.min(IX+IW,cx+nx+1);tx++){
   const c=tx==IX?0:tx==IX+IW-1?2:1,r=ty==IY?0:ty==IY+IH-1?2:1;
   ctx.drawImage(img[AC.t],c*T,r*T,T,T,tx*T-cam.x,ty*T-cam.y,T,T)}
}
function bar(x,y,w,h,v,m,col,label){
 ctx.fillStyle='#2b1a10';ctx.fillRect(x-4,y-4,w+8,h+8);
 ctx.strokeStyle='#e9cf8f';ctx.lineWidth=3;ctx.strokeRect(x-4,y-4,w+8,h+8);
 ctx.fillStyle='#5a2a22';ctx.fillRect(x,y,w,h);
 ctx.fillStyle=col;ctx.fillRect(x,y,w*v/m,h);
 ctx.fillStyle='#fff';ctx.font='bold 16px Georgia,serif';ctx.textAlign='center';
 ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.strokeText(label,x+w/2,y+h-6);ctx.fillText(label,x+w/2,y+h-6);
}
function text(s,x,y,size,col,al){
 ctx.font='bold '+size+'px Georgia,serif';ctx.textAlign=al||'center';ctx.lineWidth=5;ctx.strokeStyle='#1b100a';
 ctx.strokeText(s,x,y);ctx.fillStyle=col;ctx.fillText(s,x,y);
}
function wrap(s,x,y,w,lh,col){
 ctx.font='15px Georgia,serif';ctx.textAlign='left';ctx.fillStyle=col;let line='';
 for(const wd of s.split(' ')){const t=line?line+' '+wd:wd;
  if(ctx.measureText(t).width>w&&line){ctx.fillText(line,x,y);y+=lh;line=wd}else line=t}
 ctx.fillText(line,x,y)}
function radial(x,y,r0,r1,col0,col1){const g=ctx.createRadialGradient(x,y,r0,x,y,r1);g.addColorStop(0,col0);g.addColorStop(1,col1);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
function drawMini(){
 const s=Math.min(150/(MW*T),100/(MH*T)),mw=MW*T*s,mh=MH*T*s,x0=W-24-mw,y0=H-24-mh,X=v=>x0+v*s,Y=v=>y0+v*s;
 ctx.globalAlpha=.85;ctx.fillStyle='#2b1a10';ctx.fillRect(x0-3,y0-3,mw+6,mh+6);
 ctx.fillStyle='#3d5a3a';ctx.fillRect(X(IX*T),Y(IY*T),IW*T*s,IH*T*s);
 ctx.fillStyle='#1d2a1c';for(const o of OB)ctx.fillRect(X(o.x)-1.5,Y(o.y)-1.5,3,3);
 ctx.fillStyle='#fff';for(const o of SH)ctx.fillRect(X(o.x)-1,Y(o.y)-1,2,2);
 ctx.fillStyle='#ffd76a';for(const o of PU)ctx.fillRect(X(o.x)-2,Y(o.y)-2,4,4);
 ctx.fillStyle='#ff9a9a';for(const o of M)ctx.fillRect(X(o.x)-2,Y(o.y)-2,4,4);
 for(const e of E){ctx.fillStyle=e.ty=='b'?'#ff3030':'#d94b3c';const r=e.ty=='b'?4:2;ctx.fillRect(X(e.x)-r/2,Y(e.y)-r/2,r,r)}
 ctx.fillStyle='#7ec8ff';ctx.fillRect(X(P.x)-2.5,Y(P.y)-2.5,5,5);
 ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1;ctx.strokeRect(X(cam.x),Y(cam.y),W*s,H*s);ctx.globalAlpha=1}
function drawTouch(){
 if(!touchSeen)return;ctx.globalAlpha=.55;
 const b=(c,l,col)=>{ctx.fillStyle='rgba(20,12,8,.6)';ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,7);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=4;ctx.stroke();
  ctx.font='bold 14px Georgia,serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(l,c.x,c.y+5)};
 b(TB.atk,'Atacar','#ff9a7a');b(TB.dod,'Esquiva','#9fd3ff');b(TB.grd,'Guardia','#ffe066');b(TB.pau,'II','#f5e3b0');
 if(stick){ctx.strokeStyle='#f5e3b0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(stick.ox,stick.oy,60,0,7);ctx.stroke();ctx.fillStyle='rgba(245,227,176,.6)';ctx.beginPath();ctx.arc(stick.x,stick.y,22,0,7);ctx.fill()}
 ctx.globalAlpha=1}
function draw(){
 const cx0=cam.x,cy0=cam.y,sk=SET.shake&&G.shake>0?G.shake:0;
 cam.x=Math.round(cam.x+(sk?(Math.random()-.5)*sk:0));cam.y=Math.round(cam.y+(sk?(Math.random()-.5)*sk:0));
 drawTerrain();
 for(const m of M){const b=Math.sin(G.time*4+m.x)*3;ctx.drawImage(img.meat,m.x-cam.x-32,m.y-cam.y-44+b)}
 for(const u of PU){if(u.t>14&&Math.floor(u.t*6)%2)continue;
  const c=PT[u.k],x=u.x-cam.x,y=u.y-cam.y-30+Math.sin(G.time*4+u.x)*4;
  shadow(x,u.y-cam.y,16);
  ctx.fillStyle=c.c;ctx.globalAlpha=.35+.15*Math.sin(G.time*6);ctx.beginPath();ctx.arc(x,y,27,0,7);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle='#2b1a10';ctx.beginPath();ctx.arc(x,y,17,0,7);ctx.fill();ctx.strokeStyle=c.c;ctx.lineWidth=3;ctx.stroke();
  ctx.font='20px serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(c.ic,x,y+7)}
 const L=[...E.map(e=>({y:e.y,f:()=>drawUnit(e)})),{y:P.y,f:()=>drawUnit(P)},...OB.map(o=>({y:o.y,f:()=>drawObs(o)})),
  ...SH.map(s=>({y:s.y,f:()=>{const x=s.x-cam.x,y=s.y-cam.y,mv=s.st=='Move',n=mv?4:6;shadow(x,y,20);
   spr(img[mv?'shMove':'shIdle'],128,128,Math.floor(s.t*(mv?8:6))%n,x,y,s.fx,64,82)}})),
  ...AR.map(a=>({y:a.y,f:()=>{ctx.save();ctx.translate(a.x-cam.x,a.y-cam.y-45);ctx.rotate(Math.atan2(a.vy,a.vx));
   ctx.drawImage(img.arrow,-32,-32);ctx.restore()}}))];
 L.sort((a,b)=>a.y-b.y).forEach(o=>o.f());
 for(const r of RG){const k=r.t/.35;ctx.strokeStyle='rgba(255,230,190,'+(1-k)+')';ctx.lineWidth=6*(1-k)+1;ctx.beginPath();ctx.ellipse(r.x-cam.x,r.y-cam.y,170*k,85*k,0,0,7);ctx.stroke()}
 for(const s of SL){const k=s.t/.16;ctx.save();ctx.translate(s.x-cam.x,s.y-cam.y-38);ctx.lineCap='round';
  ctx.strokeStyle='rgba('+(s.c?'255,220,140':'255,255,255')+','+(1-k)+')';ctx.lineWidth=12*(1-k)+2;
  ctx.beginPath();ctx.arc(0,0,s.r*.78,s.a-s.w*(1-k*.3),s.a+s.w*(1-k*.3));ctx.stroke();ctx.restore()}
 for(const f of HF)spr(img.mFx,192,192,Math.min(10,Math.floor(f.t*14)),f.x-cam.x,f.y-cam.y,1,96,130);
 for(const f of FX){const s=f.s||1;ctx.drawImage(img.boom,Math.min(7,Math.floor(f.t*16))*192,0,192,192,f.x-cam.x-96*s,f.y-cam.y-131*s,192*s,192*s)}
 for(const p of PA){ctx.globalAlpha=Math.min(1,p.life/(p.max*.5));ctx.fillStyle=p.c;ctx.fillRect(Math.round(p.x-cam.x),Math.round(p.y-cam.y-p.z),p.s,p.s)}ctx.globalAlpha=1;
 for(const t of TX){ctx.globalAlpha=Math.min(1,(.9-t.t)*3);text(t.s,t.x-cam.x,t.y-cam.y,18,t.c)}ctx.globalAlpha=1;
 if(AC.tint){ctx.fillStyle=AC.tint;ctx.fillRect(0,0,W,H)}
 if(AC.fog){radial(P.x-cam.x,P.y-cam.y-30,220,560,'rgba(6,14,10,0)','rgba(6,14,10,.85)')}
 if(SET.flash){const low=P.hp<P.max*.3&&!G.over?.14+.08*Math.sin(G.time*6):0,a=G.flash*.5+low;
  if(a>.01)radial(W/2,H/2,H*.3,H*.9,'rgba(200,30,30,0)','rgba(200,30,30,'+a+')')}
 // --- HUD ---
 bar(24,24,260,24,P.hp,P.max,'#d94b3c','Vida  '+P.hp+' / '+P.max);
 ctx.fillStyle='#2b1a10';ctx.fillRect(20,56,170,12);ctx.fillStyle=P.gbk>0?'#ff8a78':'#6aa8e8';ctx.fillRect(22,58,166*P.gm/100,8);
 ctx.fillStyle='#cdb98a';ctx.font='bold 11px Georgia,serif';ctx.textAlign='left';ctx.fillText('GUARDIA',196,66);
 for(let i=0;i<P.chMax;i++){const f=clamp(P.ch-i,0,1);ctx.fillStyle='#2b1a10';ctx.beginPath();ctx.arc(32+i*24,88,9,0,7);ctx.fill();
  ctx.fillStyle=f>=1?'#9fd3ff':'#4a6a8a';ctx.beginPath();ctx.arc(32+i*24,88,7*(.35+.65*f),0,7);ctx.fill()}
 ctx.fillStyle='#cdb98a';ctx.fillText('ESQUIVA',32+P.chMax*24,92);
 {let i=0;for(const k in P.buf)if(P.buf[k]>0){const c=PT[k],y=108+i++*28;
  ctx.font='20px serif';ctx.textAlign='left';ctx.fillStyle='#fff';ctx.fillText(c.ic,24,y+18);
  ctx.fillStyle='#2b1a10';ctx.fillRect(56,y+4,150,12);ctx.fillStyle=c.c;ctx.fillRect(58,y+6,146*P.buf[k]/c.d,8);
  ctx.font='bold 14px Georgia,serif';ctx.fillStyle='#f5e3b0';ctx.fillText(c.n+' '+Math.ceil(P.buf[k])+'s',214,y+16)}}
 text('Oleada '+G.wave+'  ·  Bajas '+G.kills+'  ·  Quedan '+E.length,W-24,44,22,'#f5e3b0','right');
 text((G.daily?'Reto diario · ':'')+AC.n+' · '+DIFS[G.dif].n,W-24,68,15,DIFS[G.dif].c,'right');
 text('Puntos '+G.score,W-24,94,20,'#ffd76a','right');
 if(G.combo>=2){text('Combo '+G.combo+' · x'+comboMul().toFixed(2),W-24,120,17,'#ffb347','right');
  ctx.fillStyle='#2b1a10';ctx.fillRect(W-184,128,160,6);ctx.fillStyle='#ffb347';ctx.fillRect(W-184,128,160*clamp(G.ct/3.2,0,1),6)}
 {const up=UPG.filter(u=>P.lv[u.k]>0);if(up.length)text(up.map(u=>u.n.replace('Esquiva cortante','Cortante')+' '+P.lv[u.k]).join(' · '),24,H-24,14,'#cdb98a','left')}
 {const bo=E.find(e=>e.ty=='b');if(bo)bar(W/2-210,H-70,420,20,Math.max(0,bo.hp),bo.max,bo.fury?'#ff3a2a':'#b03a48','Coloso Férreo'+(bo.fury?' · FURIA':''))}
 if(G.banner>0&&!G.over){if(G.wave%5==0)text('¡JEFE!  Coloso Férreo',W/2,150,44,'#ff8a78');else text('Oleada '+G.wave,W/2,150,44,'#f5e3b0');
  if(G.theme)text(THEMES[G.theme],W/2,186,22,'#ff9a7a');else if(G.wave==1)text(AC.n,W/2,186,22,'#cdb98a')}
 if(G.tip&&!G.pick&&!G.paused&&!G.over){ctx.font='bold 16px Georgia,serif';const w=ctx.measureText(G.tip).width+36;
  ctx.fillStyle='rgba(20,12,8,.78)';ctx.fillRect(W/2-w/2,H-128,w,32);ctx.strokeStyle='#e9cf8f';ctx.lineWidth=2;ctx.strokeRect(W/2-w/2,H-128,w,32);
  ctx.textAlign='center';ctx.fillStyle='#f5e3b0';ctx.fillText(G.tip,W/2,H-107)}
 if(G.play<10&&!G.tuto)text(gp?'Mando: stick mover · A atacar · B/RB esquiva · LB guardia · Start pausa':'WASD mover · Espacio/J atacar · L/E esquiva · Shift/K guardia · Esc pausa',W/2,H-24,15,'#f5e3b0');
 if(toast.t>0)text(toast.s,W/2,90,22,'#9fd3ff');
 drawMini();drawTouch();
 cam.x=cx0;cam.y=cy0;
 if(G.over)drawOver();
 if(G.pick)drawPick();
 if(G.paused)drawPause();
}

// ---------- Pantallas: fin de partida, mejoras, pausa ----------
function oskRect(r,c){return r<4?{x:233+c*50,y:214+r*40,w:44,h:34,r,c}:{x:232+c*126,y:374,w:118,h:34,r,c}}
function btn(q,label,on,col,size){ctx.fillStyle=on?'#4a2f1c':'#2b1a10';ctx.fillRect(q.x,q.y,q.w,q.h);ctx.strokeStyle=on?(col||'#ffd76a'):'#a98d5a';ctx.lineWidth=on?3:2;ctx.strokeRect(q.x,q.y,q.w,q.h);
 ctx.font='bold '+(size||18)+'px Georgia,serif';ctx.textAlign='center';ctx.fillStyle=on?'#fff':'#f5e3b0';ctx.fillText(label,q.x+q.w/2,q.y+q.h/2+6)}
function drawOver(){
 ctx.fillStyle='rgba(10,5,3,.64)';ctx.fillRect(0,0,W,H);
 const nm=G.stage=='name';
 text('Has caído',W/2,nm?66:96,nm?44:52,'#ff8a78');
 text('Oleada '+G.wave+' · '+G.kills+' bajas · '+(G.daily?'Reto diario':DIFS[G.dif].n),W/2,nm?98:134,nm?18:22,'#f5e3b0');
 text('Puntuación: '+G.score,W/2,nm?136:178,nm?28:36,'#ffd76a');
 if(nm){
  ctx.fillStyle='#2b1a10';ctx.fillRect(W/2-170,150,340,42);ctx.strokeStyle='#ffd76a';ctx.lineWidth=3;ctx.strokeRect(W/2-170,150,340,42);
  ctx.font='bold 24px Georgia,serif';ctx.textAlign='center';ctx.fillStyle=G.name?'#fff':'rgba(255,255,255,.35)';
  ctx.fillText((G.name||'Jugador')+(Math.floor(G.time*2)%2&&G.name.length<14?'|':''),W/2,181);
  for(let r=0;r<5;r++)for(let c=0;c<(r<4?10:4);c++){const q=oskRect(r,c);btn(q,r<4?KB[r][c]:OSKB[c],G.kr==r&&G.kc==c,0,r<4?18:15)}
  text(gp?'Stick/cruceta: mover · A: escribir · Y: espacio · B: borrar · Start: guardar':'Teclado o clic en las teclas · Enter: guardar · Esc: omitir',W/2,440,16,'#cdb98a')}
 else{
  const t=Math.floor(G.play),mm=String(Math.floor(t/60)).padStart(2,'0'),ss=String(t%60).padStart(2,'0');
  text('Tiempo '+mm+':'+ss+' · Mejor combo '+G.bestCombo+' · Esquivas perfectas '+G.perfects+' · Paradas '+G.parries,W/2,222,17,'#cdb98a');
  text('Oro ganado: +'+G.gold+'   (total '+META.gold+')',W/2,256,22,'#ffd76a');
  if(G.saved)text('Guardado · puesto #'+G.rank+(G.rank<=20?' del ranking':''),W/2,304,24,'#9fd3ff');
  text('Enter / A: reintentar  ·  T / X: estadísticas  ·  Esc / Y: menú',W/2,356,18,'#f5e3b0')}
}
function drawPick(){
 ctx.fillStyle='rgba(10,5,3,.74)';ctx.fillRect(0,0,W,H);
 text(G.pk=='boss'?'¡Jefe derrotado!':'Oleada '+G.wave+' superada',W/2,110,44,'#ffd76a');text('Elige una mejora para esta partida',W/2,158,22,'#f5e3b0');
 G.ch.forEach((u,i)=>{const q=pickR(i),x=q.x,y=q.y,on=G.ps==i,lv=P.lv[u.k];
  ctx.fillStyle=on?'#4a2f1c':'#2b1a10';ctx.fillRect(x,y,220,250);ctx.strokeStyle=on?u.c:'#a98d5a';ctx.lineWidth=on?5:3;ctx.strokeRect(x,y,220,250);
  ctx.font='56px serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(u.ic,x+110,y+80);
  text(u.n,x+110,y+120,u.n.length>12?21:26,u.c);wrap(u.d,x+18,y+148,184,20,'#d8c9a3');
  text('Nv. '+lv+' → '+(lv+1),x+110,y+232,18,'#9fd3ff');text(String(i+1),x+14,y+22,16,'#cdb98a','left')});
 text(gp?'← → elegir · A confirmar':'← → elegir · Enter / clic · o pulsa 1, 2, 3',W/2,500,18,'#cdb98a')}
function drawPause(){
 ctx.fillStyle='rgba(10,5,3,.7)';ctx.fillRect(0,0,W,H);
 text('Pausa',W/2,120,50,'#f5e3b0');
 PMENU.forEach((l,i)=>btn(listR(i,230),i==3&&G.conf?'¿Seguro? Pulsa otra vez':l,G.pm==i));
 text(gp?'↑ ↓ elegir · A aceptar · Start continuar':'↑ ↓ elegir · Enter aceptar · Esc / P continuar',W/2,500,17,'#cdb98a');
 text('Esquiva: L/E · B/RB   Guardia: Shift/K · LB (pulsa justo antes del golpe para parar)',W/2,530,15,'#cdb98a')}

// ---------- Estadísticas y partidas guardadas (partidas.txt vía server.py / server.js) ----------
const SC={list:[],src:'',ready:false},LSK='tinyswords_partidas',FILT=['Todas','Fácil','Normal','Difícil','Diario'];
const cmp=(a,b)=>(Number(b.puntos)||0)-(Number(a.puntos)||0)||String(a.fecha||'').localeCompare(String(b.fecha||''));
const stamp=()=>{const d=new Date(),z=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())+'T'+z(d.getHours())+':'+z(d.getMinutes())+':'+z(d.getSeconds())};
async function loadScores(){
 try{const r=await fetch('api/scores',{cache:'no-store'});if(!r.ok)throw 0;SC.list=await r.json();SC.src='archivo'}
 catch(e){try{SC.list=JSON.parse(ls(LSK)||'[]')}catch(x){SC.list=[]}SC.src='navegador'}
 if(!Array.isArray(SC.list))SC.list=[];SC.list.sort(cmp);SC.ready=true}
async function saveScore(name){
 if(G.stage!='name')return;G.stage='saving';
 const rec={nombre:String(name).trim().slice(0,14)||'Anónimo',puntos:G.score,nivel:AC.n,oleada:G.wave,dificultad:DIFS[G.dif].n,modo:G.daily?'diario':'normal',fecha:stamp()};
 try{const r=await fetch('api/scores',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(rec)});
  if(!r.ok)throw 0;G.rank=(await r.json()).rank}
 catch(e){let l=[];try{l=JSON.parse(ls(LSK)||'[]')}catch(x){}l.push(rec);l.sort(cmp);G.rank=l.indexOf(rec)+1;ls(LSK,JSON.stringify(l))}
 ls('tinyswords_nombre',rec.nombre);G.saved=true;G.stage='done'}
const filtered=()=>SC.list.filter(r=>stF==0||(stF==4?r.modo=='diario':r.modo!='diario'&&(r.dificultad||'Normal')==FILT[stF])).slice(0,20);
function bg(){for(let ty=-1;ty<=Math.ceil(H/T);ty++)for(let tx=-1;tx<=Math.ceil(W/T);tx++)ctx.drawImage(img.water,tx*T,ty*T,T,T);
 ctx.fillStyle='rgba(10,20,30,.62)';ctx.fillRect(0,0,W,H)}
function drawStats(){
 bg();text('Estadísticas',W/2,50,42,'#f5e3b0');
 FILT.forEach((f,i)=>btn(tabR(i),f,stF==i,0,15));
 ctx.fillStyle='#2b1a10';ctx.fillRect(30,122,900,440);ctx.strokeStyle='#e9cf8f';ctx.lineWidth=3;ctx.strokeRect(30,122,900,440);
 ctx.font='bold 14px Georgia,serif';ctx.fillStyle='#ffd76a';
 [[50,'#','left'],[90,'Nombre','left'],[350,'Puntos','right'],[380,'Nivel','left'],[660,'Dificultad','left'],[780,'Día','left']].forEach(c=>{ctx.textAlign=c[2];ctx.fillText(c[1],c[0],146)});
 ctx.fillRect(44,153,872,2);
 const L=filtered();
 if(!SC.ready)text('Cargando…',W/2,330,22,'#f5e3b0');
 else if(!L.length)text(SC.list.length?'No hay partidas con este filtro.':'Aún no hay partidas guardadas. ¡Juega una y guarda tu puntaje!',W/2,330,20,'#f5e3b0');
 L.forEach((r,i)=>{const y=176+i*19.5;
  if(i%2==0){ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(44,y-14,872,19)}
  ctx.font=(i<3?'bold ':'')+'14px Georgia,serif';ctx.fillStyle=['#ffd76a','#d6dbe6','#e0a070'][i]||'#f5e3b0';
  const f=String(r.fecha||''),dia=f.length>=10?f.slice(8,10)+'/'+f.slice(5,7)+'/'+f.slice(0,4):'—';
  ctx.textAlign='left';ctx.fillText(i+1,50,y);ctx.fillText(String(r.nombre||'Anónimo'),90,y);
  ctx.textAlign='right';ctx.fillText((Number(r.puntos)||0).toLocaleString('es-ES'),350,y);
  ctx.textAlign='left';ctx.fillText((r.modo=='diario'?'★ ':'')+String(r.nivel||'—')+(r.oleada?' · Oleada '+r.oleada:''),380,y);ctx.fillText(String(r.dificultad||'Normal'),660,y);ctx.fillText(dia,780,y)});
 text('← → filtrar · Esc / Enter / A: volver · Datos: '+(SC.src=='archivo'?'partidas.txt':'este navegador (sin servidor)'),W/2,588,15,'#f5e3b0')}

// ---------- Taller (mejoras permanentes) y ajustes ----------
function drawShop(){
 bg();text('Taller',W/2,56,44,'#f5e3b0');text('Oro: '+META.gold,W/2,92,24,'#ffd76a');
 SHOP.forEach((it,i)=>{const q=shopR(i),on=shopSel==i,l=META[it.k],mx=l>=it.max;
  ctx.fillStyle=on?'#4a2f1c':'#2b1a10';ctx.fillRect(q.x,q.y,q.w,q.h);ctx.strokeStyle=on?'#ffd76a':'#a98d5a';ctx.lineWidth=on?3:2;ctx.strokeRect(q.x,q.y,q.w,q.h);
  text(it.n,q.x+20,q.y+30,22,'#f5e3b0','left');ctx.font='15px Georgia,serif';ctx.textAlign='left';ctx.fillStyle='#d8c9a3';ctx.fillText(it.d,q.x+20,q.y+54);
  for(let k=0;k<it.max;k++){ctx.fillStyle=k<l?'#ffd76a':'#3a2a1c';ctx.fillRect(q.x+420+k*28,q.y+22,22,22);ctx.strokeStyle='#a98d5a';ctx.lineWidth=1;ctx.strokeRect(q.x+420+k*28,q.y+22,22,22)}
  const c=mx?'MÁX':it.cost(l)+' oro',can=!mx&&META.gold>=it.cost(l);
  text(c,q.x+q.w-24,q.y+42,20,mx?'#8dff8d':can?'#ffd76a':'#a06a5a','right')});
 btn(backR,'Volver',false);
 text(toast.t>0?toast.s:'↑ ↓ elegir · Enter / clic comprar · Esc volver',W/2,596,16,toast.t>0?'#9fd3ff':'#cdb98a')}
function drawSet(){
 bg();text('Ajustes',W/2,80,44,'#f5e3b0');
 SETS.forEach((s,i)=>{const q=listR(i,150),on=setSel==i;btn(q,'',on);
  ctx.font='bold 16px Georgia,serif';ctx.textAlign='left';ctx.fillStyle=on?'#fff':'#f5e3b0';ctx.fillText(s[1],q.x+14,q.y+28);
  ctx.textAlign='right';ctx.fillStyle=SET[s[0]]?'#8dff8d':'#ff8a78';ctx.fillText(SET[s[0]]?'Sí':'No',q.x+q.w-14,q.y+28)});
 btn({x:W/2-90,y:150+SETS.length*54,w:180,h:44},'Volver',setSel==SETS.length);
 text('↑ ↓ elegir · Enter / clic cambiar · Esc volver',W/2,560,16,'#cdb98a')}

// ---------- Menú principal ----------
function drawMenu(){
 bg();
 text('Tiny Swords',W/2,70,54,'#f5e3b0');text('Elige tu arena',W/2,108,22,'#cdb98a');
 text('Oro: '+META.gold,W-24,40,20,'#ffd76a','right');
 text('Dificultad',316,150,15,'#cdb98a','right');
 DIFS.forEach((d,i)=>{const q=difR(i),on=DIF==i;btn(q,d.n,on,d.c,15);if(on){ctx.strokeStyle=d.c;ctx.lineWidth=3;ctx.strokeRect(q.x,q.y,q.w,q.h)}});
 AR_.forEach((a,i)=>{const q=cardR(i),x=q.x,y=q.y,on=i==sel,b=on?Math.sin(mt*5)*3:0;
  ctx.fillStyle='#2b1a10';ctx.fillRect(x,y+b,172,350);ctx.strokeStyle=on?'#ffd76a':'#a98d5a';ctx.lineWidth=on?5:3;ctx.strokeRect(x,y+b,172,350);
  ctx.drawImage(img[a.t],64,64,64,64,x+12,y+12+b,148,110);
  if(a.tint){ctx.fillStyle=a.tint;ctx.fillRect(x+12,y+12+b,148,110)}
  ctx.strokeStyle='#e9cf8f';ctx.lineWidth=2;ctx.strokeRect(x+12,y+12+b,148,110);
  ctx.textAlign='left';let fs=18;ctx.font='bold 18px Georgia,serif';
  while(ctx.measureText(a.n).width>148&&fs>10){fs--;ctx.font='bold '+fs+'px Georgia,serif'}
  ctx.fillStyle='#f5e3b0';ctx.fillText(a.n,x+12,y+150+b);
  wrap(a.d,x+12,y+178+b,148,19,'#d8c9a3');
  wrap('Tamaño: '+(a.w*a.h>400?'grande':a.w*a.h>300?'medio':'pequeño')+(a.fog?' · niebla':'')+(a.ice?' · hielo':''),x+12,y+318+b,148,19,'#9fd3ff')});
 const lab=['Estadísticas','Taller','Reto diario','Ajustes'],kk=gp?['X','Y','LB','RB']:['E','T','R','O'];
 lab.forEach((l,i)=>{const q=mbR(i),hv=G.hovB===i;ctx.fillStyle=hv?'#4a2f1c':'#2b1a10';ctx.fillRect(q.x,q.y,q.w,q.h);ctx.strokeStyle=hv?'#ffd76a':'#a98d5a';ctx.lineWidth=3;ctx.strokeRect(q.x,q.y,q.w,q.h);
  ctx.fillStyle='#ffd76a';const ix=q.x+14,iy=q.y+17;
  if(i==0)[[0,8],[9,15],[18,22]].forEach(([dx,h])=>ctx.fillRect(ix+dx,iy+10-h+4,7,h));
  else if(i==1){ctx.beginPath();ctx.arc(ix+12,iy,10,0,7);ctx.fill();ctx.fillStyle='#b8860b';ctx.fillRect(ix+10,iy-5,4,10)}
  else if(i==2){ctx.beginPath();ctx.moveTo(ix+12,iy-11);ctx.lineTo(ix+16,iy-2);ctx.lineTo(ix+25,iy-2);ctx.lineTo(ix+18,iy+4);ctx.lineTo(ix+21,iy+13);ctx.lineTo(ix+12,iy+7);ctx.lineTo(ix+3,iy+13);ctx.lineTo(ix+6,iy+4);ctx.lineTo(ix-1,iy-2);ctx.lineTo(ix+8,iy-2);ctx.closePath();ctx.fill()}
  else{ctx.strokeStyle='#ffd76a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(ix+12,iy,7,0,7);ctx.stroke();for(let k=0;k<8;k++){const a=k*Math.PI/4;ctx.fillRect(ix+12+Math.cos(a)*10-2,iy+Math.sin(a)*10-2,4,4)}}
  ctx.textAlign='left';ctx.font='bold 15px Georgia,serif';ctx.fillStyle='#f5e3b0';ctx.fillText(l,q.x+50,q.y+22);
  ctx.textAlign='right';ctx.font='bold 12px Georgia,serif';ctx.fillStyle='#cdb98a';ctx.fillText(kk[i],q.x+q.w-10,q.y+22)});
 text('← → arena · ↑ ↓ dificultad · '+(gp?'A iniciar':'Enter jugar'),W/2,594,16,'#f5e3b0');
 if(toast.t>0)text(toast.s,W/2,150,18,'#9fd3ff')}

// ---------- Bucle principal ----------
function start(){
 {const v=ls('tinyswords_dif');if(v!==null&&v!==undefined&&+v>=0&&+v<=2)DIF=+v}
 requestAnimationFrame(function f(t){
  const rdt=Math.min(.05,(t-last)/1000||0);last=t;
  pollPad();toast.t-=rdt;mt+=rdt;
  if(scene=='play'){
   G.time+=rdt;if(G.slow>0)G.slow-=rdt;
   let dt=rdt*(G.slow>0?.45:1);if(HS>0){HS-=rdt;dt=0}
   if(!G.paused&&!G.pick)update(dt);
   draw()}
  else if(scene=='menu')drawMenu();else if(scene=='stats')drawStats();else if(scene=='shop')drawShop();else if(scene=='set')drawSet();
  requestAnimationFrame(f)})}
