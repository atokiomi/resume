import React, { useEffect, useRef, useState } from 'react';
import './portfolio.css';

function Mark(){return <svg width="28" height="28" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z"/></svg>}
const links=[['作品','Work','#work'],['项目索引','Index','#work'],['关于我','About','#about'],['联系','Contact','#contact']];

export default function PortfolioHero({projects,onOpen}){
 const [menu,setMenu]=useState(false),[dragging,setDragging]=useState(false),[paused,setPaused]=useState(false);
 const track=useRef(null),strip=useRef(null),openButton=useRef(null),closeButton=useRef(null),panel=useRef(null);
 const physics=useRef({offset:-180,velocity:0,drag:false,pointer:null,startX:0,lastX:0,startOffset:0,lastTime:0,moved:false,target:null});
 const featured=[projects[0],projects[2],projects[8],projects[9],projects[3],projects[10]];
 useEffect(()=>{
  if(!menu)return;
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';closeButton.current?.focus();
  const key=e=>{
   if(e.key==='Escape'){setMenu(false);openButton.current?.focus();}
   if(e.key==='Tab'){const items=panel.current.querySelectorAll('a,button');const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  };
  window.addEventListener('keydown',key);
  return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',key)};
 },[menu]);
 useEffect(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let raf,previous=performance.now(),visible=true,halfWidth=0;
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting});observer.observe(strip.current);
  const resize=new ResizeObserver(()=>{halfWidth=track.current.scrollWidth/2;});resize.observe(track.current);
  const animate=now=>{
   raf=requestAnimationFrame(animate);const dt=Math.min((now-previous)/16.667,3);previous=now;
   if(!visible||document.hidden||!halfWidth)return;
   const p=physics.current;
   if(!p.drag&&!paused&&!motion.matches){if(Math.abs(p.velocity)>.1){p.offset+=p.velocity*dt;p.velocity*=Math.pow(.95,dt)}else{p.velocity=0;p.offset-=.8*dt}}
   // The two equal groups each include a trailing gap, so the seam has the same spacing.
   const normalized=((p.offset%halfWidth)-halfWidth)%halfWidth;
   track.current.style.transform=`translate3d(${normalized}px,0,0)`;
  };
  raf=requestAnimationFrame(animate);
  return()=>{cancelAnimationFrame(raf);observer.disconnect();resize.disconnect()};
 },[paused]);
 const start=e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  const p=physics.current;if(p.pointer!==null)return;
  p.drag=true;p.pointer=e.pointerId;p.velocity=0;p.startX=p.lastX=e.clientX;p.startOffset=p.offset;p.lastTime=performance.now();p.moved=false;p.target=e.target.closest('[data-project]');
  e.currentTarget.setPointerCapture(e.pointerId);setDragging(true);
 };
 const move=e=>{
  const p=physics.current;if(!p.drag||p.pointer!==e.pointerId)return;
  const now=performance.now(),elapsed=Math.max(8,now-p.lastTime);p.velocity=(e.clientX-p.lastX)/elapsed*16;
  p.offset=p.startOffset+e.clientX-p.startX;p.lastX=e.clientX;p.lastTime=now;
  if(Math.abs(e.clientX-p.startX)>6)p.moved=true;
 };
 const finish=(e,cancel=false)=>{
  const p=physics.current;if(p.pointer!==e.pointerId)return;
  const target=p.target,shouldOpen=!cancel&&!p.moved&&target;
  p.drag=false;p.pointer=null;setDragging(false);
  if(performance.now()-p.lastTime>100||cancel)p.velocity=0;
  if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  if(shouldOpen){const project=featured.find(item=>item.id===target.dataset.project);if(project)onOpen(project,{currentTarget:target});}
 };
 const closeMenu=()=>{setMenu(false);openButton.current?.focus()};
 return <>
  <header className="studio-nav"><a href="#hero" className="studio-brand" aria-label="LINWEI 首页"><Mark/><span>LINWEI</span></a><button ref={openButton} className="menu-toggle" aria-label="打开菜单" aria-controls="site-menu" aria-expanded={menu} onClick={()=>setMenu(true)}><span/><span/></button><a className="meeting-pill" href="mailto:414218814@qq.com">聊聊你的想法 <span>↗</span></a><span className="mobile-spacer"/></header>
  <div className={`menu-overlay${menu?' is-open':''}`} onClick={closeMenu} aria-hidden="true"/>
  <aside ref={panel} id="site-menu" className={`studio-drawer${menu?' is-open':''}`} role="dialog" aria-modal={menu?'true':undefined} aria-label="网站导航" inert={menu?undefined:true}>
   <div className="drawer-header"><a href="#hero" className="studio-brand" onClick={()=>setMenu(false)} aria-label="LINWEI 首页"><Mark/><span>LINWEI</span></a><button ref={closeButton} className="menu-close" aria-label="关闭菜单" onClick={closeMenu}><span/><span/></button></div>
   <nav className="drawer-links" aria-label="主导航">{links.map(([zh,en,href],i)=><a key={en} href={href} style={{transitionDelay:menu?`${150+i*60}ms`:'0ms'}} onClick={()=>setMenu(false)}><span>{en}</span><small>{zh}</small></a>)}</nav>
   <div className="drawer-cta" style={{transitionDelay:menu?'400ms':'0ms'}}><a className="meeting-pill" href="mailto:414218814@qq.com" onClick={()=>setMenu(false)}>聊聊你的想法 ↗</a></div>
   <div className="drawer-footer"><span>视觉设计师 · VISUAL DESIGNER</span><a href="mailto:414218814@qq.com" onClick={()=>setMenu(false)}>414218814@qq.com</a><a href="/portfolio/LINWEI-Portfolio.pdf" download>下载完整作品集 ↗</a></div>
  </aside>
  <section className="studio-hero" id="hero" aria-labelledby="studio-title"><h1 id="studio-title">Design with<br/>personality.</h1><p>让想法有形，让品牌被看见。</p></section>
  <section ref={strip} className="image-marquee" aria-label="精选设计作品，可水平拖动浏览">
   <div className="marquee-mask mask-top" aria-hidden="true"><svg viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 0H1440V50C1440 50 1200 100 720 100C240 100 0 50 0 50V0Z"/></svg></div>
   <div className={`marquee-track${dragging?' is-dragging':''}`} ref={track} onPointerDown={start} onPointerMove={move} onPointerUp={e=>finish(e)} onPointerCancel={e=>finish(e,true)} onLostPointerCapture={e=>finish(e,true)}>
    {[0,1].map(group=><div key={group} className="marquee-group" aria-hidden={group===1?true:undefined}>{featured.map((p,i)=><button key={p.id} className={`marquee-slide marquee-slide-${i}`} data-project={p.id} aria-label={`查看${p.title}`} tabIndex={group===1?-1:0} onClick={e=>{if(e.detail===0)onOpen(p,e)}} onFocus={()=>setPaused(true)} onBlur={()=>setPaused(false)}><img src={`/portfolio/page-${String(p.cover).padStart(2,'0')}.webp`} alt={p.title} loading={i<4?'eager':'lazy'} draggable={false}/></button>)}</div>)}
   </div>
   <div className="marquee-mask mask-bottom" aria-hidden="true"><svg viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 100H1440V50C1440 50 1200 0 720 0C240 0 0 50 0 50V100Z"/></svg></div>
  </section>
  <section className="studio-bottom" aria-label="个人介绍"><p>你好，我是 LINWEI，一名视觉设计师。<br/>在品牌、数字与创意之间，探索有温度的视觉表达。</p><div className="studio-bottom-links"><a href="mailto:414218814@qq.com">聊聊你的想法 ↗</a><a href="#work">探索我的作品 ↗</a></div><div className="marquee-help"><span>拖动探索 · DRAG TO EXPLORE</span><button onClick={()=>setPaused(p=>!p)} aria-pressed={paused}>{paused?'继续轮播 ▶':'暂停轮播 Ⅱ'}</button></div></section>
 </>;
}
