import math, json, os
from PIL import Image, ImageDraw, ImageFilter, ImageChops
FW,FH,OX,OY=416,320,208,290
OUT=(38,24,36,255)
C=dict(steel=(112,120,142,255),steelL=(168,178,198,255),steelD=(72,78,100,255),dark=(50,48,70,255),darkL=(82,80,110,255),
 red=(196,64,58,255),redL=(232,112,90,255),redD=(128,40,50,255),gold=(226,176,64,255),goldL=(248,224,120,255),goldD=(170,120,40,255),
 skin=(224,150,108,255),skinL=(242,186,142,255),skinD=(172,104,82,255),glow=(255,214,120,255))
def part(img,fn,col,lo=None,hi=None,ol=3):
    m=Image.new('L',img.size,0);fn(ImageDraw.Draw(m))
    img.paste(OUT,(0,0),m.filter(ImageFilter.MaxFilter(2*(ol+1)+1)))
    img.paste(col,(0,0),m)
    if lo:img.paste(lo,(0,0),ImageChops.subtract(m,ImageChops.offset(m,-5,-7)))
    if hi:img.paste(hi,(0,0),ImageChops.subtract(m,ImageChops.offset(m,4,6)))
P=lambda x,y:(OX+x,OY+y)
def poly(pts): return lambda d:d.polygon([P(*p) for p in pts],fill=255)
def ell(cx,cy,rx,ry=None):
    ry=ry or rx; return lambda d:d.ellipse([OX+cx-rx,OY+cy-ry,OX+cx+rx,OY+cy+ry],fill=255)
def rect(x0,y0,x1,y1,r=6): return lambda d:d.rounded_rectangle([OX+x0,OY+y0,OX+x1,OY+y1],radius=r,fill=255)
def cap(p0,p1,w):
    def f(d):
        a,b=P(*p0),P(*p1);d.line([a,b],fill=255,width=w)
        for q in (a,b):d.ellipse([q[0]-w/2,q[1]-w/2,q[0]+w/2,q[1]+w/2],fill=255)
    return f
def fist(img,cx,cy,r=34):
    for a in (-72,-30,30,72):
        ar=math.radians(a);bx,by=cx+math.cos(ar)*(r-8),cy+math.sin(ar)*(r-8)
        tx,ty=cx+math.cos(ar)*(r+16),cy+math.sin(ar)*(r+16);px,py=-math.sin(ar)*9,math.cos(ar)*9
        part(img,poly([(bx-px,by-py),(tx,ty),(bx+px,by+py)]),C['steelL'],C['steel'],ol=2)
    part(img,ell(cx,cy,r),C['steel'],C['steelD'],C['steelL'])
    part(img,rect(cx-r-7,cy-17,cx-r+9,cy+17,4),C['dark'],ol=2)
    d=ImageDraw.Draw(img)
    d.rectangle([OX+cx-r-2,OY+cy-15,OX+cx-r+2,OY+cy+15],fill=C['red'])
    for dx,dy in ((6,-11),(11,5),(-3,13),(-6,-4)):
        d.ellipse([OX+cx+dx-2,OY+cy+dy-2,OX+cx+dx+2,OY+cy+dy+2],fill=C['steelL'])
def arm(img,S,F):
    part(img,cap(S,F,26),C['skin'],C['skinD'],C['skinL'])
    a=(S[0]+(F[0]-S[0])*.6,S[1]+(F[1]-S[1])*.6);b=(S[0]+(F[0]-S[0])*.78,S[1]+(F[1]-S[1])*.78)
    part(img,cap(a,b,34),C['steel'],C['steelD'],C['steelL'],ol=2)
def leg(img,x,lift):
    part(img,rect(x-20,-64-lift,x+20,-20-lift,8),C['steel'],C['steelD'],C['steelL'])
    part(img,ell(x+6,-44-lift,10,9),C['steelL'],C['steel'],ol=2)
    part(img,rect(x-24,-22-lift,x+38,-lift,8),C['dark'],C['steelD'],C['darkL'])
    part(img,rect(x+22,-20-lift,x+38,-2-lift,6),C['steel'],C['steelD'],C['steelL'],ol=2)
def pauld(img,sx,b,lx):
    cx=sx+lx(-142);part(img,ell(cx,-142+b,27),C['steel'],C['steelD'],C['steelL'])
    part(img,poly([(cx-8,-160+b),(cx+2,-184+b),(cx+10,-160+b)]),C['steelL'],C['steel'],ol=2)
    ImageDraw.Draw(img).arc([OX+cx-22,OY-142+b-22,OX+cx+22,OY-142+b+22],200,340,fill=C['red'],width=4)
def boss(bob=0,lean=0,legs=((-24,0),(26,0)),ff=None,bf=None,arms=True,sway=0):
    img=Image.new('RGBA',(FW,FH),(0,0,0,0));b=bob
    lx=lambda y:lean*min(1,max(0,(-58-y)/100))
    Sb=(-62+lx(-140),-140+b);Sf=(64+lx(-140),-140+b)
    if arms and bf:arm(img,Sb,bf);fist(img,*bf)
    for x,l in legs:leg(img,x,l)
    T=lambda pts:[(x+lx(y),y+b) for x,y in pts]
    part(img,poly(T([(-44,-58),(44,-58),(66,-128),(60,-160),(-60,-160),(-66,-128)])),C['steel'],C['steelD'],C['steelL'])
    part(img,poly(T([(-15,-58),(17,-58),(21,-152),(-17,-152)])),C['red'],C['redD'],C['redL'],ol=2)
    part(img,rect(-48,-72+b,48,-54+b,4),C['dark'],C['steelD'],C['darkL'])
    part(img,rect(-12,-74+b,14,-52+b,3),C['gold'],C['goldD'],C['goldL'],ol=2)
    pauld(img,-66,b,lx)
    hx=8+lx(-176)*1.1;hy=-176+b
    part(img,ell(hx-2,hy+26,27,11),C['dark'],C['steelD'],ol=2)
    part(img,poly([(hx+22,hy-12),(hx+44,hy-46),(hx+36,hy-4)]),C['steelL'],C['steel'],ol=2)
    part(img,poly([(hx-24,hy-12),(hx-42,hy-44),(hx-32,hy-4)]),C['steelL'],C['steel'],ol=2)
    part(img,poly([(hx-2,hy-22),(hx+10+sway/2,hy-52),(hx-12+sway,hy-68),(hx-46+sway,hy-54),(hx-26+sway/2,hy-34)]),C['red'],C['redD'],C['redL'],ol=2)
    part(img,ell(hx,hy,31,28),C['steel'],C['steelD'],C['steelL'])
    part(img,rect(hx-26,hy-1,hx+34,hy+25,8),C['steelD'],C['dark'],C['steel'])
    d=ImageDraw.Draw(img)
    d.rectangle([OX+hx-23,OY+hy-6,OX+hx+31,OY+hy+3],fill=OUT);d.rectangle([OX+hx-20,OY+hy-4,OX+hx+28,OY+hy],fill=C['glow'])
    for i in range(3):d.rectangle([OX+hx-6+i*15,OY+hy+8,OX+hx-1+i*15,OY+hy+21],fill=OUT)
    if arms and ff:
        arm(img,Sf,ff);pauld(img,66,b,lx);fist(img,*ff)
    else:pauld(img,66,b,lx)
    return img,[round(Sb[0]),round(Sb[1]),round(Sf[0]),round(Sf[1]),round(lean)]
def half(im):
    r=im.resize((im.width//2,im.height//2),Image.BOX);r.putalpha(r.getchannel('A').point(lambda v:255 if v>=128 else 0));return r
def sheet(frames,name):
    s=Image.new('RGBA',(FW//2*len(frames),FH//2),(0,0,0,0))
    for i,f in enumerate(frames):s.paste(half(f),(i*FW//2,0))
    os.makedirs('../assets/boss',exist_ok=True);s.save(f'../assets/boss/{name}.png')
S=math.sin;PI=math.pi
idle=[]
for i in range(6):
    t=i/6*2*PI;bo=round(3*S(t));dy=round(3*S(t+1))
    idle.append(boss(bo,round(2*S(t)),ff=(88,-74+bo+dy),bf=(-84,-72+bo-dy),sway=round(5*S(t-.5)))[0])
walk=[]
for i in range(6):
    p=i/6*2*PI;bo=round(6*math.cos(2*p));a=16*math.cos(p);la=max(0,S(p))*16;lb=max(0,-S(p))*16
    walk.append(boss(bo,6,legs=((-24+round(-a),round(lb)),(26+round(a),round(la))),ff=(90+round(-14*math.cos(p)),-72+bo),bf=(-84+round(14*math.cos(p)),-72+bo),sway=round(6*S(p)))[0])
pk=[(-12,0,(-8,-190)),(-18,4,(-34,-198)),(22,2,(122,-122)),(30,6,(170,-92)),(16,4,(132,-100)),(4,2,(92,-84))]
punch=[boss(bo,l,ff=ff,bf=(-64+l,-96+bo),sway=-l//2)[0] for l,bo,ff in pk]
brace=[];BSH=[]
for l,bo,lg in ((-10,8,((-32,0),(34,0))),(-18,14,((-36,0),(38,0))),(30,4,((-20,0),(30,0))),(12,8,((-26,0),(30,0)))):
    im,a=boss(bo,l,legs=lg,arms=False,sway=-l);brace.append(im);BSH.append(a)
sheet(idle,'boss_idle');sheet(walk,'boss_walk');sheet(punch,'boss_punch');sheet(brace,'boss_brace')
# fist / arm tile / ring
f=Image.new("RGBA",(128,128),(0,0,0,0));OX0,OY0=OX,OY
import builtins
fist_img=f;OX,OY=64,64;fist(fist_img,0,0);OX,OY=OX0,OY0
half(fist_img).save('../assets/boss/boss_fist.png')
a=Image.new('RGBA',(32,20),(0,0,0,0));d=ImageDraw.Draw(a)
d.rectangle([0,1,31,18],fill=OUT);d.rectangle([0,3,31,16],fill=C['skin']);d.rectangle([0,3,31,5],fill=C['skinL']);d.rectangle([0,14,31,16],fill=C['skinD'])
for x in (5,15,25):d.rectangle([x,9,x+3,9],fill=C['skinD'])
a.save('../assets/boss/boss_arm.png')
r=Image.new('RGBA',(13,22),(0,0,0,0));d=ImageDraw.Draw(r)
d.rectangle([0,0,12,21],fill=OUT);d.rectangle([2,2,10,19],fill=C['steel']);d.rectangle([2,2,3,19],fill=C['steelL']);d.rectangle([9,2,10,19],fill=C['steelD']);d.rectangle([2,9,10,12],fill=C['red']);d.rectangle([2,9,10,9],fill=C['redL'])
r.save('../assets/boss/boss_ring.png')
BSH=[[round(v/2) for v in a] for a in BSH]
json.dump(BSH,open('./bsh.json','w'));print(BSH)
