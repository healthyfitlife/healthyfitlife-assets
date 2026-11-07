// Healthy Fit Life pin renderer – runs inside the Pinterest page.
window.HFL = window.HFL || {};
HFL.C = { bg:'#F6F1E7', ink:'#24392D', green:'#2F4A3A', sage:'#A9B89B', sageL:'#DCE3D3', terra:'#C8643B', sand:'#E9DFCC', white:'#FFFFFF' };

HFL.loadFonts = async function(){
  if (HFL.fontsReady) return 'cached';
  const fonts = [
    ['Montserrat','https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.woff2','100 900'],
    ['Playfair Display','https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiunDXbtPK-F2qC0s.woff2','700']];
  for (const [fam,url,w] of fonts){ const f=new FontFace(fam,`url(${url})`,{weight:w}); await f.load(); document.fonts.add(f); }
  HFL.fontsReady = true; return 'loaded';
};

HFL.wrap = function(x, text, maxW){
  const words = text.split(' '); const lines=[]; let cur='';
  for (const w of words){ const t = cur? cur+' '+w : w; if (x.measureText(t).width > maxW && cur){ lines.push(cur); cur=w; } else cur=t; }
  if (cur) lines.push(cur); return lines;
};
HFL.fitTitle = function(x, text, maxW, maxLines, start, min){
  let s=start; let lines;
  while (s>=min){ x.font=`700 ${s}px "Playfair Display"`; lines=HFL.wrap(x,text,maxW); if(lines.length<=maxLines && lines.every(l=>x.measureText(l).width<=maxW)) break; s-=4; }
  return {size:s, lines};
};
HFL.rr = function(x,X,Y,W,H,r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+W,Y,X+W,Y+H,r); x.arcTo(X+W,Y+H,X,Y+H,r); x.arcTo(X,Y+H,X,Y,r); x.arcTo(X,Y,X+W,Y,r); x.closePath(); };
HFL.leaf = function(x,cx,cy,len,ang,col){ x.save(); x.translate(cx,cy); x.rotate(ang); x.fillStyle=col; x.beginPath(); x.moveTo(0,0); x.quadraticCurveTo(len*0.5,-len*0.32,len,0); x.quadraticCurveTo(len*0.5,len*0.32,0,0); x.fill(); x.strokeStyle='rgba(255,255,255,0.45)'; x.lineWidth=2; x.beginPath(); x.moveTo(4,0); x.lineTo(len*0.9,0); x.stroke(); x.restore(); };
HFL.sprig = function(x,cx,cy,s,col){ x.save(); x.strokeStyle=col; x.lineWidth=3*s; x.beginPath(); x.moveTo(cx,cy); x.quadraticCurveTo(cx+30*s,cy-90*s,cx+10*s,cy-190*s); x.stroke(); for(let i=0;i<5;i++){ const t=i/5; const py=cy-30*s-t*150*s; const px=cx+18*s*Math.sin(t*2.2); HFL.leaf(x,px,py,55*s,-0.5-0.2*i,col); HFL.leaf(x,px,py,50*s,Math.PI+0.5+0.2*i,col);} x.restore(); };

HFL.renderList = async function(p){
  await HFL.loadFonts();
  const W=1000,H=1500, C=HFL.C; const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
  const accent = p.accent || C.terra;
  // background
  x.fillStyle=C.bg; x.fillRect(0,0,W,H);
  x.fillStyle=C.sageL; x.beginPath(); x.arc(W+60,170,300,0,Math.PI*2); x.fill();
  x.fillStyle=C.sand; x.beginPath(); x.arc(-80,H-120,260,0,Math.PI*2); x.fill();
  // label pill
  x.font='700 26px Montserrat'; const lab=p.label.toUpperCase(); x.letterSpacing='4px';
  const lw=x.measureText(lab).width+56; x.fillStyle=accent; HFL.rr(x,70,90,lw,58,29); x.fill();
  x.fillStyle=C.white; x.textBaseline='middle'; x.fillText(lab,98,120); x.letterSpacing='0px';
  // title
  const t=HFL.fitTitle(x,p.title,860,4,100,56); x.fillStyle=C.ink; x.textBaseline='alphabetic';
  let y=190+t.size; t.lines.forEach(l=>{ x.font=`700 ${t.size}px "Playfair Display"`; x.fillText(l,70,y); y+=t.size*1.12; });
  // subtitle
  if (p.subtitle){ y+=8; x.font='600 32px Montserrat'; x.fillStyle=C.green; HFL.wrap(x,p.subtitle,820).forEach(l=>{ x.fillText(l,70,y); y+=44; }); }
  // meta chips
  if (p.meta && p.meta.length){ y+=18; let cx=70; x.font='700 25px Montserrat'; p.meta.forEach(m=>{ const w=x.measureText(m).width+44; if(cx+w>W-60){cx=70;y+=66;} x.fillStyle=C.white; HFL.rr(x,cx,y,w,52,26); x.fill(); x.strokeStyle=C.sage; x.lineWidth=2; x.stroke(); x.fillStyle=C.green; x.textBaseline='middle'; x.fillText(m,cx+22,y+27); x.textBaseline='alphabetic'; cx+=w+14; }); y+=52; }
  // card
  const cardY=y+44, maxCardH=H-cardY-210;
  const items=p.items; let fs=42; let lh;
  const measure=(s)=>{ x.font=`500 ${s}px Montserrat`; let tot=0; items.forEach(it=>{ tot+=HFL.wrap(x,it,W-300).length*s*1.3+s*0.55; }); return tot; };
  while (fs>22 && measure(fs)>maxCardH-150) fs-=2; lh=fs*1.3;
  const cardH=maxCardH;
  HFL.sprig(x, W-95, cardY+cardH+150, 1.0, C.sage);
  x.save(); x.shadowColor='rgba(36,57,45,0.12)'; x.shadowBlur=30; x.shadowOffsetY=10; x.fillStyle=C.white; HFL.rr(x,60,cardY,W-120,cardH,36); x.fill(); x.restore();
  x.font='800 26px Montserrat'; x.fillStyle=accent; x.letterSpacing='3px'; x.fillText(p.listTitle.toUpperCase(),110,cardY+70); x.letterSpacing='0px';
  let iy=cardY+110+Math.max(0,(cardH-130-measure(fs))/2)+fs;
  items.forEach((it,i)=>{
    const lines=HFL.wrap(x,it,W-300);
    if (p.style==='numbers'){ x.fillStyle=C.sageL; x.beginPath(); x.arc(132,iy-fs*0.35,fs*0.78,0,Math.PI*2); x.fill(); x.fillStyle=C.green; x.font=`800 ${fs*0.8}px Montserrat`; x.textAlign='center'; x.textBaseline='middle'; x.fillText(String(i+1),132,iy-fs*0.33); x.textAlign='left'; x.textBaseline='alphabetic'; }
    else if (p.style==='checks'){ x.strokeStyle=accent; x.lineWidth=5; x.lineCap='round'; x.lineJoin='round'; x.beginPath(); x.moveTo(116,iy-fs*0.35); x.lineTo(128,iy-fs*0.12); x.lineTo(150,iy-fs*0.66); x.stroke(); }
    else { x.fillStyle=C.sage; x.beginPath(); x.arc(132,iy-fs*0.36,7,0,Math.PI*2); x.fill(); }
    x.fillStyle=C.ink; x.font=`500 ${fs}px Montserrat`; lines.forEach(l=>{ x.fillText(l,180,iy); iy+=lh; }); iy+=fs*0.55;
  });
  // CTA
  if (p.cta){ x.font='800 32px Montserrat'; const cw=x.measureText(p.cta).width+90; const cxp=(W-cw)/2, cyp=cardY+cardH+38; x.fillStyle=C.green; HFL.rr(x,cxp,cyp,cw,74,37); x.fill(); x.fillStyle=C.white; x.textBaseline='middle'; x.textAlign='center'; x.fillText(p.cta,W/2,cyp+38); x.textAlign='left'; x.textBaseline='alphabetic'; }
  // footer
  x.font='700 26px Montserrat'; x.fillStyle=C.green; x.textAlign='center'; x.letterSpacing='3px'; x.fillText('HEALTHYFITLIFESHOP.NET',W/2,H-48); x.letterSpacing='0px'; x.textAlign='left';
  if (p.ad){ x.font='700 22px Montserrat'; x.fillStyle=C.green; x.textAlign='right'; x.textBaseline='middle'; x.fillText('WERBUNG',W-70,120); x.textAlign='left'; x.textBaseline='alphabetic'; }
  const blob = await new Promise(r=>c.toBlob(r,'image/jpeg',0.92));
  return {canvas:c, blob};
};


HFL.img = function(src){ return new Promise((res,rej)=>{ const i=new Image(); i.crossOrigin='anonymous'; i.onload=()=>res(i); i.onerror=()=>rej(new Error('img '+src)); i.src=src; }); };
HFL.renderPhoto = async function(p){
  await HFL.loadFonts();
  const W=1000,H=1500,C=HFL.C; const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
  const PH=980; // photo height
  x.fillStyle=C.bg; x.fillRect(0,0,W,H);
  const im=await HFL.img(p.src || `https://images.unsplash.com/photo-${p.photo}?w=1400&q=85`);
  const sc=Math.max(W/im.naturalWidth, PH/im.naturalHeight); const dw=im.naturalWidth*sc, dh=im.naturalHeight*sc;
  const fx=p.fx??0.5, fy=p.fy??0.5;
  x.drawImage(im, (W-dw)*fx, (PH-dh)*fy, dw, dh);
  // top shade for pills
  let g=x.createLinearGradient(0,0,0,220); g.addColorStop(0,'rgba(0,0,0,0.28)'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(0,0,W,220);
  // label pill
  x.font='700 24px Montserrat'; x.letterSpacing='4px'; const lab=p.label.toUpperCase(); const lw=x.measureText(lab).width+52;
  x.fillStyle='rgba(246,241,231,0.95)'; HFL.rr(x,56,56,lw,56,28); x.fill(); x.fillStyle=C.green; x.textBaseline='middle'; x.fillText(lab,82,85);
  if (p.ad){ const aw=x.measureText('WERBUNG').width+48; x.fillStyle='rgba(246,241,231,0.95)'; HFL.rr(x,W-56-aw,56,aw,56,28); x.fill(); x.fillStyle=C.green; x.fillText('WERBUNG',W-56-aw+24,85); }
  x.letterSpacing='0px'; x.textBaseline='alphabetic';
  // panel
  const top=PH-70; x.save(); x.shadowColor='rgba(0,0,0,0.18)'; x.shadowBlur=40; x.shadowOffsetY=-6; x.fillStyle=C.bg;
  x.beginPath(); x.moveTo(0,top+56); x.arcTo(0,top,56,top,56); x.lineTo(W-56,top); x.arcTo(W,top,W,top+56,56); x.lineTo(W,H); x.lineTo(0,H); x.closePath(); x.fill(); x.restore();
  // small leaf ornament + kicker
  x.textAlign='center';
  HFL.leaf(x,W/2-6,top+62,34,Math.PI*0.85,C.sage); HFL.leaf(x,W/2+6,top+62,34,Math.PI*0.15,C.sage);
  x.font='800 22px Montserrat'; x.letterSpacing='5px'; x.fillStyle=p.accent||C.terra; x.fillText(p.kicker.toUpperCase(),W/2,top+118); x.letterSpacing='0px';
  // title
  const t=HFL.fitTitle(x,p.title,860,2,78,48); let y=top+118+22+t.size;
  x.fillStyle=C.ink; t.lines.forEach(l=>{ x.font=`700 ${t.size}px "Playfair Display"`; x.fillText(l,W/2,y); y+=t.size*1.1; });
  // subtitle
  if (p.subtitle){ y+=6; x.font='500 30px Montserrat'; x.fillStyle=C.green; HFL.wrap(x,p.subtitle,820).forEach(l=>{ x.fillText(l,W/2,y); y+=42; }); }
  // chips
  if (p.meta){ x.font='700 23px Montserrat'; const ws=p.meta.map(m=>x.measureText(m).width+40); const tot=ws.reduce((a,b)=>a+b,0)+12*(ws.length-1); let cx=(W-tot)/2; const cy=Math.min(y+16, H-150);
    p.meta.forEach((m,i)=>{ x.strokeStyle=C.sage; x.lineWidth=2; HFL.rr(x,cx,cy,ws[i],48,24); x.stroke(); x.fillStyle=C.green; x.textBaseline='middle'; x.fillText(m,cx+ws[i]/2,cy+25); x.textBaseline='alphabetic'; cx+=ws[i]+12; }); }
  // footer
  x.font='700 22px Montserrat'; x.letterSpacing='4px'; x.fillStyle=C.green; x.globalAlpha=0.75; x.fillText('HEALTHYFITLIFESHOP.NET',W/2,H-44); x.globalAlpha=1; x.letterSpacing='0px'; x.textAlign='left';
  const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',0.9));
  return {canvas:c, blob};
};

HFL.render = p => p.type==='list' ? HFL.renderList(p) : HFL.renderPhoto(p);
HFL.preview = async function(list, big){
  document.getElementById('hfl-prev')?.remove();
  const d=document.createElement('div'); d.id='hfl-prev'; d.style.cssText='position:fixed;inset:0;z-index:999999;background:#1b1b1b;display:flex;flex-wrap:wrap;gap:6px;padding:6px;justify-content:center;align-content:flex-start;overflow:auto';
  for (const p of list){ const {canvas}=await HFL.render(p); canvas.style.cssText=big?'width:500px;height:750px':'width:240px;height:360px'; d.appendChild(canvas); }
  document.body.appendChild(d); return 'shown '+list.length;
};
HFL.toFile = async function(p){ const {blob}=await HFL.render(p); return new File([blob], p.file, {type:'image/jpeg'}); };

'HFL2 ready';
