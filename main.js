let firstLoad = true;

function setMasksToFullRect(){
  const full = 'path("M0% 0% H100% V100% H0% Z")';
  document.querySelectorAll('.text-mask,.mask-photo').forEach(el => { try{ el.style.webkitClipPath = full; el.style.clipPath = full }catch{} });
}

function morphVisualTo(i){
  return new Promise(resolve => {
    const shapes = [
      "M0,100 L0,0 L100,0 L100,100 Z",
      "M0,100 C18,60 38,96 60,80 C82,64 100,100 100,100 L100,0 L0,0 Z",
      "M0,100 L100,100 C86,74 60,30 40,44 C20,58 0,10 0,0 Z",
      "M0,0 C26,12 70,0 100,20 L100,100 L0,100 Z",
      "M0,0 L100,0 C80,18 64,72 38,66 C20,60 0,88 0,100 Z",
      "M0,100 L100,100 L100,0 C70,28 40,30 0,0 Z"
    ];
    const morphPath = document.getElementById('morphPath');
    const shape = shapes[i % shapes.length];
    anime.remove(morphPath);
    anime({
      targets: morphPath,
      d: [{ value: shape }],
      duration: 700,
      easing: 'cubicBezier(.22,.9,.38,1)',
      update(){},
      complete(){ resolve() }
    });
  });
}

function splitTitleIntoWordsAndChars(el){
  if(!el || el.dataset.split) return;
  const txt = el.textContent;
  el.innerHTML = '';
  const tokens = txt.split(/(\s+)/);
  tokens.forEach(tok=>{
    if(/\s+/.test(tok)){
      const sp = document.createElement('span');
      sp.innerHTML = '&nbsp;';
      sp.className = 'space';
      el.appendChild(sp);
    } else {
      const w = document.createElement('span');
      w.className = 'word';
      for(const ch of tok){
        const c = document.createElement('span');
        c.className = 'char';
        c.textContent = ch;
        w.appendChild(c);
      }
      el.appendChild(w);
    }
  });
  el.dataset.split = '1';
}

function hideElements(slide){
  if(!slide) return;
  const title = slide.querySelector('.title');
  const lead = slide.querySelector('.lead');
  const photo = slide.querySelector('.photo');
  const madebyText = slide.querySelector('.madeby-text');
  const groupNames = slide.querySelectorAll('.group-names .name-tag');

  if(title){ title.style.visibility='hidden'; title.style.opacity='0'; title.style.transform='translateY(14px) scale(0.98)'; }
  if(lead){ lead.style.visibility='hidden'; lead.style.opacity='0'; lead.style.transform='translateY(14px) scale(0.98)'; }
  if(photo){ photo.style.visibility='hidden'; photo.style.opacity='0'; photo.style.transform='scale(0.96)'; }
  if(madebyText){ madebyText.style.visibility='hidden'; madebyText.style.opacity='0'; madebyText.style.transform='translateY(14px) scale(0.98)'; }
  if(groupNames && groupNames.length) Array.from(groupNames).forEach(n => { n.style.visibility='hidden'; n.style.opacity='0'; n.style.transform='translateY(14px) scale(0.98)'; });
}

function animateIn(slide){
  try {
    const title = slide.querySelector('.title');
    const lead = slide.querySelector('.lead');
    const photo = slide.querySelector('.photo');
    const madebyText = slide.querySelector('.madeby-text');
    const groupNamesNodeList = slide.querySelectorAll('.group-names .name-tag');
    const groupNames = Array.from(groupNamesNodeList);

    if(title){ title.style.visibility='visible'; splitTitleIntoWordsAndChars(title); }

    const chars = title ? title.querySelectorAll('.char') : [];
    if(chars && chars.length){
      anime.remove(chars);
      anime({ targets: chars, translateY:[24,0], opacity:[0,1], rotate:[6,0], duration:520, delay: anime.stagger(12), easing:'cubicBezier(.22,.9,.38,1)', complete:function(){ chars.forEach(c=>{ c.style.opacity='1'; c.style.transform='none' }); if(title){ title.style.opacity='1'; title.style.transform='none'; title.style.visibility='visible' } }});
    } else if(title){
      anime.remove(title);
      anime({ targets: title, translateY:[18,0], opacity:[0,1], duration:420, easing:'easeOutCubic', complete:function(){ title.style.opacity='1'; title.style.transform='none'; title.style.visibility='visible' }});
    }

    if(photo){ photo.style.visibility='visible'; anime.remove(photo); anime({ targets: photo, scale:[0.96,1.02,1], opacity:[0,1], duration:560, easing:'spring(1,80,12,8)', complete:function(){ photo.style.opacity='1'; photo.style.transform='none' } }); }

    if(lead){ lead.style.visibility='visible'; anime.remove(lead); anime({ targets: lead, translateY:[14,0], opacity:[0,1], duration:460, easing:'easeOutQuad', delay:160, complete:function(){ lead.style.opacity='1'; lead.style.transform='none' } }); }

    // Critical fix: ensure visibility is set to 'visible' for each name-tag BEFORE animating
    if(!firstLoad){
      if(madebyText){
        madebyText.style.visibility='visible';
        anime.remove(madebyText);
        anime({ targets: madebyText, translateY:[12,0], opacity:[0,1], duration:360, easing:'easeOutCubic', delay:240 });
      }
      if(groupNames && groupNames.length){
        groupNames.forEach(n => n.style.visibility = 'visible'); // <-- ensure visible
        anime.remove(groupNames);
        const tl = anime.timeline();
        tl.add({ targets: groupNames, translateY:[12,0], opacity:[0,1], duration:420, easing:'easeOutCubic', delay: anime.stagger(80) });
      }
    } else {
      // firstLoad: show immediately without animation
      if(madebyText){ madebyText.style.visibility='visible'; madebyText.style.opacity='1'; madebyText.style.transform='none'; }
      if(groupNames && groupNames.length) groupNames.forEach(n => { n.style.visibility='visible'; n.style.opacity='1'; n.style.transform='none'; });
    }

    setTimeout(()=> scaleContentToFit(slide), 380);
  } catch(e){ console.error('animateIn error', e); }
}

function particleBurst(x,y){
  const layer = document.getElementById('particle-layer');
  const count = 6, items = [];
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.style.position='absolute'; el.style.left=(x-4)+'px'; el.style.top=(y-4)+'px';
    el.style.width=el.style.height=(4+Math.random()*6)+'px'; el.style.borderRadius='50%';
    el.style.background='rgba(31,166,160,0.9)'; el.style.pointerEvents='none'; el.style.zIndex=2000;
    layer.appendChild(el); items.push(el);
  }
  anime({ targets: items, translateX: ()=> (Math.random()-0.5)*160, translateY: ()=> (Math.random()-0.5)*120-10, opacity:[1,0], scale:[1,0.2], duration:520, delay: anime.stagger(12), easing:'easeOutQuad', complete: ()=> items.forEach(i=>i.remove()) });
}

function scaleContentToFit(slide){
  if(!slide) return;
  const panel = slide.querySelector('.text-panel');
  const title = slide.querySelector('.title');
  const lead = slide.querySelector('.lead');
  if(!panel) return;
  if(title && !title.dataset.baseSize) title.dataset.baseSize = window.getComputedStyle(title).fontSize;
  if(lead && !lead.dataset.baseSize) lead.dataset.baseSize = window.getComputedStyle(lead).fontSize;
  if(title && title.dataset.baseSize) title.style.fontSize = title.dataset.baseSize;
  if(lead && lead.dataset.baseSize) lead.style.fontSize = lead.dataset.baseSize;
  const maxH = window.innerHeight - 140;
  let panelH = panel.scrollHeight;
  if(panelH <= maxH) return;
  let titleSize = title ? parseFloat(title.dataset.baseSize) : 22;
  let leadSize = lead ? parseFloat(lead.dataset.baseSize) : 16;
  const minTitle = 12; const minLead = 11;
  let iter = 0;
  while(panelH > maxH && iter < 20){
    titleSize = Math.max(minTitle, titleSize * 0.94);
    leadSize = Math.max(minLead, leadSize * 0.94);
    if(title) title.style.fontSize = titleSize + 'px';
    if(lead) lead.style.fontSize = leadSize + 'px';
    panelH = panel.scrollHeight;
    iter++;
    if(titleSize === minTitle && leadSize === minLead) break;
  }
}

let pagerTimeout = null;
function flashPager(d=3000){ clearTimeout(pagerTimeout); const pager=document.getElementById('pager'); pager.style.opacity='1'; pager.style.pointerEvents='auto'; pagerTimeout = setTimeout(()=>{ pager.style.opacity='0'; pager.style.pointerEvents='none'; }, d); }
function updatePager(i){ document.getElementById('pager').textContent = (i+1) + ' / ' + slides.length; }

const slides = Array.from(document.querySelectorAll('.slide'));
const container = document.getElementById('slides');
let idx = 0;
let isAnimating = false;

async function goTo(target, opts = {}){
  if(isAnimating) return;
  if(target < 0) target = slides.length - 1;
  if(target >= slides.length) target = 0;
  if(target === idx){ flashPager(); return; }

  firstLoad = false; // once user navigates, subsequent reveals animate

  isAnimating = true;
  flashPager();

  if(opts.clickPos) particleBurst(opts.clickPos.x, opts.clickPos.y);
  else { const r = container.getBoundingClientRect(); particleBurst(r.left + r.width/2, r.top + r.height/2); }

  const curr = slides[idx];
  const next = slides[target];

  anime.remove(curr);
  anime({ targets: curr, opacity:[1,0], translateY:[0,12], duration:320, easing:'easeInQuad' });

  setTimeout(async ()=>{
    curr.classList.remove('active');
    next.classList.add('active');

    setMasksToFullRect();
    hideElements(next);

    idx = target;
    updatePager(idx);

    try{ await morphVisualTo(target); } catch(e){ console.error(e) }

    setMasksToFullRect();
    animateIn(next);

    anime.remove(next);
    anime({ targets: next, opacity:[0,1], translateY:[12,0], duration:520, easing:'spring(1,80,12,10)' });

    setTimeout(()=>{ isAnimating=false }, 260);
  }, 140);

  setTimeout(()=>{ isAnimating=false }, 3000);
}

window.addEventListener('load', ()=>{
  try{
    setMasksToFullRect();
    updatePager(0);
    flashPager(2500);

    const first = slides[0];
    const t = first.querySelector('.title');
    const l = first.querySelector('.lead');
    const p = first.querySelector('.photo');
    const madebyText = first.querySelector('.madeby-text');
    const groupNames = first.querySelectorAll('.group-names .name-tag');

    if(t){ t.style.visibility='visible'; t.style.opacity='1'; t.style.transform='none'; }
    if(l){ l.style.visibility='visible'; l.style.opacity='1'; l.style.transform='none'; }
    if(p){ p.style.visibility='visible'; p.style.opacity='1'; p.style.transform='none'; }

    // show madeby & names immediately on first load
    if(madebyText){ madebyText.style.visibility='visible'; madebyText.style.opacity='1'; madebyText.style.transform='none'; }
    if(groupNames && groupNames.length) Array.from(groupNames).forEach(n=>{ n.style.visibility='visible'; n.style.opacity='1'; n.style.transform='none'; });

    scaleContentToFit(first);
  }catch(e){ console.error(e) }
});

container.addEventListener('pointerup', (e)=>{ if(e.button && e.button!==0) return; flashPager(); const rect = container.getBoundingClientRect(); const x = e.clientX - rect.left; if(x < rect.width/2) goTo(idx-1, { clickPos: { x:e.clientX, y:e.clientY } }); else goTo(idx+1, { clickPos: { x:e.clientX, y:e.clientY } }); }, {passive:true});

window.addEventListener('keydown', (e)=>{ if(e.key==='ArrowRight' || e.key==='PageDown'){ flashPager(); goTo(idx+1) } if(e.key==='ArrowLeft' || e.key==='PageUp'){ flashPager(); goTo(idx-1) } });

(function(){ let startX=null; container.addEventListener('touchstart', e=>startX=e.touches[0].clientX, {passive:true}); container.addEventListener('touchend', e=>{ if(startX==null) return; const endX=e.changedTouches[0].clientX; const diff=endX-startX; if(Math.abs(diff)>40){ flashPager(); if(diff<0) goTo(idx+1); else goTo(idx-1); } startX=null; }, {passive:true}); })();

window.addEventListener('resize', ()=>{ const a=slides[idx]; scaleContentToFit(a); });

window.Presentation = { goTo, scaleContentToFit };