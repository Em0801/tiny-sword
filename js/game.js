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
 tiles1:'assets/terrain/tilemap_color1.png',
 tiles2:'assets/terrain/tilemap_color2.png',
 tiles3:'assets/terrain/tilemap_color3.png',
 tiles4:'assets/terrain/tilemap_color4.png',
 tiles5:'assets/terrain/tilemap_color5.png'
};
const img={};let loaded=0;const names=Object.keys(A);
names.forEach(k=>{const i=new Image();i.onload=()=>{if(++loaded==names.length)start()};i.src=A[k];img[k]=i});
const W=960,H=600,T=64;
const cv=document.getElementById('c'),ctx=cv.getContext('2d');cv.width=W;cv.height=H;
ctx.imageSmoothingEnabled=false;

// ---------- Arenas ----------
// t: tileset de hierba · w,h: tamaño en tiles · o: obstáculos [tipo,cantidad] · mult: tamaño de oleadas · arch: peso de arqueros
const AR_=[
 {n:'Prado del Alba',d:'Campo abierto con pocos árboles. Ideal para aprender los controles.',t:'tiles1',w:26,h:16,o:[['tree',14],['rock',3]],sheep:3,mult:1,arch:1},
 {n:'Bosque Espeso',d:'Árboles por todas partes: úsalos de cobertura contra los arqueros.',t:'tiles2',w:24,h:16,o:[['tree',32],['rock',4]],sheep:2,mult:1,arch:1,tint:'rgba(10,50,20,.18)'},
 {n:'Ruinas al Atardecer',d:'Casas y torres derruidas. Muchos rincones donde esconderse.',t:'tiles4',w:28,h:18,o:[['house',5],['tower',3],['rock',6],['tree',4]],sheep:2,mult:1.2,arch:1.3,tint:'rgba(255,120,40,.14)'},
 {n:'Fortaleza',d:'Un castillo en el centro y torres. Aquí abundan los arqueros.',t:'tiles3',w:26,h:18,o:[['castle',1],['towerB',4],['tree',6]],sheep:1,mult:1.2,arch:2.5},
 {n:'Islote Helado',d:'Espacio reducido y noche cerrada. Combate a corta distancia.',t:'tiles5',w:18,h:12,o:[['rock',10],['tree',5]],sheep:2,mult:.8,arch:.8,tint:'rgba(20,30,90,.28)'}
];
const OD={tree:{r:26},rock:{r:24,ox:32,oy:49},house:{r:52,ox:64,oy:168},tower:{r:46,ox:64,oy:225},towerB:{r:46,ox:64,oy:225},castle:{r:100,ox:160,oy:243}};
let AC=AR_[0],MW,MH,BX,BY,IX=2,IY=2,IW,IH,scene='menu',sel=0,mt=0;

// ---------- Animaciones por familia: [sprite, frames, fps] ----------
const FAM={
 w:{fw:192,ox:96,oy:130,a:{Idle:['',8,8],Run:['',6,12],Atk1:['',4,14],Atk2:['',4,14],Guard:['',6,12]}},
 k:{fw:192,ox:96,oy:130,a:{Idle:['kIdle',8,8],Run:['kRun',6,12],Atk1:['kAtk',4,8],Atk2:['kAtk',4,8]}},
 a:{fw:192,ox:96,oy:130,a:{Idle:['aIdle',6,8],Run:['aRun',4,12],Atk1:['aShoot',8,12]}},
 l:{fw:320,ox:160,oy:192,a:{Idle:['lIdle',12,8],Run:['lRun',6,12],Atk1:['lAtk',3,10]}},
 m:{fw:192,ox:96,oy:130,a:{Idle:['mIdle',6,8],Run:['mRun',4,12],Atk1:['mHeal',11,14]}}
};
const PT={
 str:{ic:'⚔️',c:'#ff7a5e',n:'Fuerza',d:10},spd:{ic:'⚡',c:'#ffe066',n:'Velocidad',d:10},
 shd:{ic:'🛡️',c:'#7ec8ff',n:'Escudo',d:6},nova:{ic:'💥',c:'#ffb347',n:'Onda',d:0}};
// tipo, peso, oleada mínima
const WT=[['r',4,1],['k',2,1],['y',1.5,2],['a',2,2],['p',1.2,3],['l',1.3,3],['m',1,4]];

const keys={};let want=0,P,E,M,PU,FX,TX,OB,AR,HF,SH,G={over:false,time:0},cam={x:0,y:0},last=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mk=(x,y,col,hp)=>({x,y,col,ty:'w',hp,max:hp,fx:1,st:'Idle',t:0,kx:0,ky:0,hit:0,cd:.6+Math.random(),dealt:false,combo:0,iv:0,guard:false});
const set=(e,s)=>{if(e.st!=s){e.st=s;e.t=0}};
const atk=e=>e.st[0]=='A';
const pop=(x,y,s,c)=>TX.push({x,y,s,c,t:0});

// ---------- Entrada: teclado ----------
addEventListener('keydown',e=>{keys[e.code]=1;
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
 if(scene=='menu'){if(e.repeat)return;
  if(e.code=='ArrowLeft'||e.code=='KeyA')sel=(sel+AR_.length-1)%AR_.length;
  if(e.code=='ArrowRight'||e.code=='KeyD')sel=(sel+1)%AR_.length;
  if(e.code=='Enter'||e.code=='Space')startArena(sel);
  return}
 if(e.code=='Escape'||e.code=='KeyM'){scene='menu';return}
 if((e.code=='Space'||e.code=='KeyJ')&&!e.repeat)want=1;
 if(e.code=='Enter'&&G.over)reset()});
addEventListener('keyup',e=>keys[e.code]=0);
addEventListener('blur',()=>{for(const k in keys)keys[k]=0});
// ---------- Entrada: ratón (menú) ----------
const cardAt=ev=>{const r=cv.getBoundingClientRect(),x=(ev.clientX-r.left)*W/r.width,y=(ev.clientY-r.top)*H/r.height;
 for(let i=0;i<AR_.length;i++){const cx=26+i*184;if(x>=cx&&x<=cx+172&&y>=170&&y<=520)return i}return -1};
cv.addEventListener('mousemove',e=>{if(scene=='menu'){const i=cardAt(e);if(i>=0)sel=i}});
cv.addEventListener('click',e=>{if(scene=='menu'){const i=cardAt(e);if(i>=0)startArena(i)}});
// ---------- Entrada: mando ----------
let pad={x:0,y:0,guard:false},pb=[],gp=null,toast={s:'',t:0};
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
 pad={x,y,guard:b(1)||b(4)||b(6)};
 const cur=[b(0),b(2),b(7),b(9),b(14)||x<-.6,b(15)||x>.6,b(3)];
 cur.forEach((v,i)=>{if(!v||pb[i])return;
  if(scene=='menu'){if(i==4)sel=(sel+AR_.length-1)%AR_.length;else if(i==5)sel=(sel+1)%AR_.length;else if(i==0||i==3)startArena(sel)}
  else if(i==6)scene='menu';
  else if(G.over){if(i==0||i==3)reset()}
  else if(i<3)want=1});
 pb=cur;
}
function rumble(s,ms){try{if(gp&&gp.vibrationActuator)gp.vibrationActuator.playEffect('dual-rumble',{duration:ms,strongMagnitude:s,weakMagnitude:s}).catch(()=>{})}catch(e){}}

// ---------- Arena y oleadas ----------
function startArena(i){AC=AR_[i];reset();want=0;scene='play'}
function reset(){
 IW=AC.w;IH=AC.h;MW=IW+4;MH=IH+4;
 BX=[IX*T+24,(IX+IW)*T-24];BY=[IY*T+24,(IY+IH)*T-16];
 const cx=(IX+IW/2)*T,cy=(IY+IH/2)*T;
 P=mk(cx,cy,'b',100);P.buf={str:0,spd:0,shd:0};
 E=[];M=[];PU=[];FX=[];TX=[];AR=[];HF=[];SH=[];OB=[];
 G={wave:0,kills:0,over:false,banner:0,time:0,gap:2};
 let s=7+AR_.indexOf(AC)*13;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
 const place=(k,x,y)=>OB.push({k,x,y,r:OD[k].r,ph:rnd()*8,fl:k=='tree'&&rnd()<.5?-1:1,im:k=='rock'?(rnd()<.5?'rock1':'rock2'):k});
 for(const [k] of AC.o)if(k=='castle')place('castle',cx,cy-3*T);
 for(const [k,n] of AC.o){if(k=='castle')continue;
  for(let i=0;i<n;i++){let x,y,t=0,ok;
   do{x=BX[0]+40+rnd()*(BX[1]-BX[0]-80);y=BY[0]+90+rnd()*(BY[1]-BY[0]-90);
    ok=Math.hypot(x-cx,y-cy)>210&&OB.every(o=>Math.hypot(x-o.x,y-o.y)>o.r+OD[k].r+40)}while(!ok&&++t<60);
   if(ok)place(k,x,y)}}
 nextWave();
}
const rndPos=()=>({x:BX[0]+Math.random()*(BX[1]-BX[0]),y:BY[0]+Math.random()*(BY[1]-BY[0])});
function roll(){
 const w=WT.filter(t=>G.wave>=t[2]&&!(t[0]=='m'&&E.filter(e=>e.ty=='m').length>=2)),f=t=>t[1]*(t[0]=='a'?AC.arch:1);
 let r=Math.random()*w.reduce((a,t)=>a+f(t),0);
 for(const t of w){r-=f(t);if(r<=0)return t[0]}return 'r'}
function enemy(t,x,y){
 const w=G.wave,hp=45+w*4,sp=90+w*5;
 const D={r:['r','w',hp,sp,12,1.1],y:['y','w',hp*2,sp*.8,18,1.4],p:['p','w',hp*.7,sp*1.5,8,.8],
  k:['r','k',16+w*2,sp*1.7,6,.7],a:['r','a',28+w*3,105,10,1.8],l:['r','l',hp*1.4,115,22,2.2],m:['r','m',26+w*2,100,0,3]}[t];
 const e=mk(x,y,D[0],Math.round(D[2]));
 return Object.assign(e,{ty:D[1],sp:D[3],dmg:D[4],rest:D[5],elite:t!='r'&&t!='k'})}
function nextWave(){
 G.wave++;G.banner=2.4;
 const n=Math.min(Math.round((1+G.wave*2)*AC.mult),16);
 for(let i=0;i<n;i++){let p,k=0;
  do p=rndPos();while(Math.hypot(p.x-P.x,p.y-P.y)<420&&++k<40);
  const e=enemy(roll(),p.x,p.y);push(e);E.push(e)}
 if(G.wave>1){const p=rndPos();spawnPU(p.x,p.y)}
 while(SH.length<AC.sheep){const p=rndPos();SH.push({x:p.x,y:p.y,fx:1,st:'Idle',t:0,wt:1+Math.random()*3});push(SH[SH.length-1])}
}
function spawnPU(x,y){const k=Object.keys(PT);PU.push({x,y,k:k[Math.floor(Math.random()*k.length)],t:0})}
function push(e){
 for(const t of OB){const dx=e.x-t.x,dy=e.y-t.y,d=Math.hypot(dx,dy),m=t.r+18;
  if(d<m&&d>0){e.x=t.x+dx/d*m;e.y=t.y+dy/d*m}}
 e.x=clamp(e.x,BX[0],BX[1]);e.y=clamp(e.y,BY[0],BY[1]);
}

// ---------- Combate ----------
function hurtP(d,from){
 if(P.iv>0||G.over)return;
 if(P.buf.shd>0){pop(P.x,P.y-110,'Inmune','#7ec8ff');P.iv=.3;return}
 const blocked=P.guard&&(from.x-P.x)*P.fx>0;
 if(blocked)d=Math.round(d*.2);
 P.hp=Math.max(0,P.hp-d);P.hit=.2;P.iv=blocked?.25:.6;
 P.kx=Math.sign(P.x-from.x)*(blocked?120:260);
 rumble(blocked?.3:.9,blocked?90:220);
 pop(P.x,P.y-110,blocked?'Bloqueo -'+d:'-'+d,blocked?'#9fd3ff':'#ff6b5e');
 if(P.hp<=0){G.over=true;FX.push({x:P.x,y:P.y,t:0})}
}
function hurtE(e,d){
 e.hp-=d;e.hit=.15;e.kx=(Math.sign(e.x-P.x)||P.fx)*280;pop(e.x,e.y-110,'-'+d,'#fff2a8');
 if(atk(e)&&e.t<.2&&!e.mode&&e.ty!='m'){set(e,'Idle');e.cd=.6}
 if(e.hp<=0){E.splice(E.indexOf(e),1);G.kills++;FX.push({x:e.x,y:e.y,t:0});
  const r=Math.random();
  if(r<(e.elite?.5:.2))spawnPU(e.x,e.y);else if(r<(e.elite?.8:.55))M.push({x:e.x,y:e.y,t:0})}
}
function swing(){
 const d=(P.combo?25:20)*(P.buf.str>0?2:1),inR=o=>{const dx=(o.x-P.x)*P.fx,dy=o.y-P.y;return dx>-20&&dx<110&&Math.abs(dy)<65};
 for(const e of E.slice())if(inR(e))hurtE(e,d);
 for(const s of SH.slice())if(inR(s)){SH.splice(SH.indexOf(s),1);M.push({x:s.x,y:s.y,t:0});pop(s.x,s.y-60,'¡Carne!','#ffd08a')}
}
function take(k){const t=PT[k];pop(P.x,P.y-130,t.n+'!',t.c);
 if(k=='nova'){FX.push({x:P.x,y:P.y,t:0});for(const e of E.slice())if(Math.hypot(e.x-P.x,e.y-P.y)<240)hurtE(e,45)}
 else P.buf[k]=t.d;
 rumble(.4,120)}

// ---------- Jugador ----------
function updP(dt){
 const p=P;p.iv-=dt;p.hit-=dt;p.t+=dt;
 for(const k in p.buf)p.buf[k]=Math.max(0,p.buf[k]-dt);
 if(G.over)return;
 p.guard=!!(keys.ShiftLeft||keys.ShiftRight||keys.KeyK||pad.guard)&&!atk(p);
 if(atk(p)){
  if(p.buf.spd>0)p.t+=dt*.5;
  if(!p.dealt&&p.t>=2/14){p.dealt=true;swing()}
  if(p.t>=4/14)set(p,'Idle');
  else if(p.t<.15)p.x+=p.fx*60*dt;
 }else if(want&&!p.guard){p.combo^=1;set(p,p.combo?'Atk2':'Atk1');p.dealt=false}
 want=0;
 if(!atk(p)){
  let dx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
  let dy=(keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.ArrowUp?1:0);
  dx+=pad.x;dy+=pad.y;
  const l=Math.hypot(dx,dy),m=Math.min(1,l),sp=(p.guard?70:210)*(p.buf.spd>0?1.4:1);
  if(l){p.x+=dx/l*sp*m*dt;p.y+=dy/l*sp*m*dt;if(Math.abs(dx)>.2)p.fx=Math.sign(dx)}
  set(p,p.guard?'Guard':l?'Run':'Idle');
 }
 p.x+=p.kx*dt;p.kx*=Math.exp(-10*dt);push(p);
 for(const m of M.slice())if(p.hp<p.max&&Math.hypot(m.x-p.x,m.y-p.y)<50){
  M.splice(M.indexOf(m),1);const h=Math.min(25,p.max-p.hp);p.hp+=h;pop(p.x,p.y-110,'+'+h,'#8dff8d')}
 for(const u of PU.slice())if(Math.hypot(u.x-p.x,u.y-p.y)<50){PU.splice(PU.indexOf(u),1);take(u.k)}
}

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
function updE(e,dt){
 e.hit-=dt;e.t+=dt;e.cd-=dt;
 const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1;
 if(e.ty=='a')aiA(e,dx,dy,d,dt);else if(e.ty=='l')aiL(e,dx,dy,d,dt);else if(e.ty=='m')aiM(e,dx,dy,d,dt);
 else if(atk(e)){ // cuerpo a cuerpo (guerrero y peón)
  if(!e.dealt&&e.t>=.3){e.dealt=true;
   if(Math.abs(dy)<70&&dx*e.fx>-20&&dx*e.fx<115)hurtP(e.dmg,e)}
  if(e.t>=.5){set(e,'Idle');e.cd=e.rest}
 }else if(!G.over&&d<560){
  if(dx)e.fx=Math.sign(dx);
  if(d<80&&e.cd<=0){set(e,Math.random()<.5?'Atk1':'Atk2');e.dealt=false}
  else if(d>65){e.x+=dx/d*e.sp*dt;e.y+=dy/d*e.sp*dt;set(e,'Run')}
  else set(e,'Idle');
 }else set(e,'Idle');
 for(const o of E)if(o!==e){const ox=e.x-o.x,oy=e.y-o.y,od=Math.hypot(ox,oy);
  if(od<52&&od>0){e.x+=ox/od*80*dt;e.y+=oy/od*80*dt}}
 e.x+=e.kx*dt;e.kx*=Math.exp(-10*dt);push(e);
}
function update(dt){
 pollPad();toast.t-=dt;G.time+=dt;G.banner-=dt;
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
 for(const t of TX){t.t+=dt;t.y-=40*dt}TX=TX.filter(t=>t.t<.9);
 if(!E.length&&!G.over&&G.banner<0){G.gap-=dt;if(G.gap<=0){G.gap=2;nextWave()}}
}

// ---------- Dibujo ----------
function spr(im,fw,fh,fr,x,y,fx,ox,oy){
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(fx,1);
 ctx.drawImage(im,fr*fw,0,fw,fh,-ox,-oy,fw,fh);ctx.restore();
}
const shadow=(x,y,rx)=>{ctx.fillStyle='rgba(0,0,0,.26)';ctx.beginPath();ctx.ellipse(x,y+2,rx,rx*.35,0,0,7);ctx.fill()};
function drawUnit(e){
 const x=e.x-cam.x,y=e.y-cam.y,F=FAM[e.ty],d=F.a[e.st]||F.a.Idle;
 shadow(x,y,26);
 if(e===P){let i=0;for(const k in P.buf)if(P.buf[k]>0){ctx.strokeStyle=PT[k].c;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y+2,30+i*7,11+i*3,0,0,7);ctx.stroke();i++}
  if(P.buf.shd>0){ctx.strokeStyle='rgba(126,200,255,.8)';ctx.beginPath();ctx.arc(x,y-40,52,0,7);ctx.stroke()}}
 if(e.mode=='tele'){ctx.save();ctx.strokeStyle='rgba(255,60,40,.33)';ctx.lineWidth=34;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x,y-20);ctx.lineTo(x+e.vx*280,y-20+e.vy*280);ctx.stroke();ctx.restore()}
 let fps=d[2];if(e.ty=='w'&&e!==P&&atk(e))fps=8;
 const n=d[1],loop=!atk(e)&&e.st!='Guard';
 const fr=loop?Math.floor(e.t*fps)%n:Math.min(n-1,Math.floor(e.t*fps));
 const im=img[e.ty=='w'?e.col+e.st:d[0]];
 if(e.hit>0)ctx.filter='brightness(2.6) saturate(.4)';
 if(G.over&&e===P)ctx.globalAlpha=.45;
 spr(im,F.fw,im.height,fr,x,y,e.fx,F.ox,F.oy);
 ctx.filter='none';ctx.globalAlpha=1;
 if(e.mode=='tele')text('!',x,y-118,34,'#ff5040');
 if(e!==P&&e.hp<e.max){ctx.fillStyle='#2b1a10';ctx.fillRect(x-24,y-104,48,7);
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
function draw(){
 cam.x=Math.round(clamp(P.x-W/2,0,MW*T-W));cam.y=Math.round(clamp(P.y-H/2,0,MH*T-H));
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
 for(const f of HF)spr(img.mFx,192,192,Math.min(10,Math.floor(f.t*14)),f.x-cam.x,f.y-cam.y,1,96,130);
 for(const f of FX)spr(img.boom,192,192,Math.min(7,Math.floor(f.t*16)),f.x-cam.x,f.y-cam.y,1,96,131);
 for(const t of TX){ctx.globalAlpha=Math.min(1,(.9-t.t)*3);text(t.s,t.x-cam.x,t.y-cam.y,18,t.c)}ctx.globalAlpha=1;
 if(AC.tint){ctx.fillStyle=AC.tint;ctx.fillRect(0,0,W,H)}
 bar(24,24,260,24,P.hp,P.max,'#d94b3c','Vida  '+P.hp+' / '+P.max);
 {let i=0;for(const k in P.buf)if(P.buf[k]>0){const c=PT[k],y=66+i++*30;
  ctx.font='20px serif';ctx.textAlign='left';ctx.fillStyle='#fff';ctx.fillText(c.ic,24,y+18);
  ctx.fillStyle='#2b1a10';ctx.fillRect(56,y+4,150,12);ctx.fillStyle=c.c;ctx.fillRect(58,y+6,146*P.buf[k]/c.d,8);
  ctx.font='bold 14px Georgia,serif';ctx.fillStyle='#f5e3b0';ctx.fillText(c.n+' '+Math.ceil(P.buf[k])+'s',214,y+16)}}
 text('Oleada '+G.wave+'  ·  Bajas '+G.kills+'  ·  Quedan '+E.length,W-24,44,22,'#f5e3b0','right');
 text(AC.n,W-24,68,15,'#cdb98a','right');
 if(G.banner>0&&!G.over){text('Oleada '+G.wave,W/2,150,44,'#f5e3b0');if(G.wave==1)text(AC.n,W/2,186,22,'#cdb98a')}
 if(G.time<10)text(gp?'Mando: stick mover · A/X/RT atacar · B/LB guardia · Y cambiar arena':'WASD/flechas mover · Espacio/J atacar · Shift/K guardia · Esc arenas',W/2,H-24,16,'#f5e3b0');
 if(toast.t>0)text(toast.s,W/2,90,22,'#9fd3ff');
 if(G.over){ctx.fillStyle='rgba(10,5,3,.6)';ctx.fillRect(0,0,W,H);
  text('Has caído',W/2,H/2-20,56,'#ff8a78');
  text('Oleada '+G.wave+' · '+G.kills+' bajas',W/2,H/2+24,24,'#f5e3b0');
  text('Enter / A: reintentar   ·   Esc / Y: cambiar de arena',W/2,H/2+64,20,'#f5e3b0')}
}
function drawMenu(){
 for(let ty=-1;ty<=Math.ceil(H/T);ty++)for(let tx=-1;tx<=Math.ceil(W/T);tx++)ctx.drawImage(img.water,tx*T,ty*T,T,T);
 ctx.fillStyle='rgba(10,20,30,.55)';ctx.fillRect(0,0,W,H);
 text('Tiny Swords',W/2,84,58,'#f5e3b0');text('Elige tu arena',W/2,124,24,'#cdb98a');
 AR_.forEach((a,i)=>{const x=26+i*184,y=170,on=i==sel,b=on?Math.sin(mt*5)*3:0;
  ctx.fillStyle='#2b1a10';ctx.fillRect(x,y+b,172,350);
  ctx.strokeStyle=on?'#ffd76a':'#a98d5a';ctx.lineWidth=on?5:3;ctx.strokeRect(x,y+b,172,350);
  ctx.drawImage(img[a.t],64,64,64,64,x+12,y+12+b,148,110);
  if(a.tint){ctx.fillStyle=a.tint;ctx.fillRect(x+12,y+12+b,148,110)}
  ctx.strokeStyle='#e9cf8f';ctx.lineWidth=2;ctx.strokeRect(x+12,y+12+b,148,110);
  ctx.textAlign='left';ctx.font='bold 18px Georgia,serif';ctx.fillStyle='#f5e3b0';ctx.fillText(a.n,x+12,y+150+b);
  wrap(a.d,x+12,y+178+b,148,19,'#d8c9a3');
  wrap('Tamaño: '+(a.w*a.h>400?'grande':a.w*a.h>300?'medio':'pequeño'),x+12,y+318+b,148,19,'#9fd3ff')});
 text(gp?'← → elegir  ·  A iniciar':'← → elegir  ·  Enter / clic para jugar',W/2,566,18,'#f5e3b0');
 if(toast.t>0)text(toast.s,W/2,556-24,18,'#9fd3ff');
}
function start(){requestAnimationFrame(function f(t){
 const dt=Math.min(.05,(t-last)/1000||0);last=t;
 if(scene=='menu'){mt+=dt;toast.t-=dt;pollPad();drawMenu()}else{update(dt);draw()}
 requestAnimationFrame(f)})}
