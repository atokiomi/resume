import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
const BookShelf = lazy(() => import('./BookShelf'));
import './portfolio.css';

function Mark(){return <span className="folio-mark" aria-hidden="true"><span/></span>}
const links=[['作品','Work','#work'],['项目索引','Index','#work'],['关于我','About','#about'],['联系','Contact','#contact']];

export default function PortfolioHero({projects,onOpen,onSelectCategory}){
 const [menu,setMenu]=useState(false),[paused,setPaused]=useState(false),[hovered,setHovered]=useState(null),[focused,setFocused]=useState(null);
 const openButton=useRef(null),mobileOpenButton=useRef(null),closeButton=useRef(null),panel=useRef(null);
 useEffect(()=>{
  if(!menu)return;
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';closeButton.current?.focus();
  const key=e=>{
   if(e.key==='Escape'){setMenu(false);(window.innerWidth<=760?mobileOpenButton:openButton).current?.focus();}
   if(e.key==='Tab'){const items=panel.current.querySelectorAll('a,button');const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  };
  window.addEventListener('keydown',key);
  return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',key)};
 },[menu]);
 const closeMenu=()=>{setMenu(false);(window.innerWidth<=760?mobileOpenButton:openButton).current?.focus()};
 const selected=hovered||(focused===null?null:projects[focused]);
 return <>
  <section className="folio-hero" id="hero" aria-labelledby="studio-title">
   <header className="studio-nav">
    <a href="#hero" className="studio-brand" aria-label="LINWEI 首页"><Mark/><span><b>LINWEI</b><small>visual designer</small></span></a>
    <nav className="hero-navigation" aria-label="主导航"><a href="#work">精选作品 <span>⌄</span></a><a href="#about">关于我</a><a href="/portfolio/LINWEI-Portfolio.pdf" download>作品集 ↗</a><button ref={openButton} className="menu-toggle" aria-label="打开菜单" aria-controls="site-menu" aria-expanded={menu} onClick={()=>setMenu(true)}>更多 <span>⌄</span></button></nav>
    <a className="meeting-pill" href="mailto:414218814@qq.com">聊聊你的想法 <span>↗</span></a>
    <button ref={mobileOpenButton} className="mobile-menu-toggle" aria-label="打开移动菜单" aria-controls="site-menu" aria-expanded={menu} onClick={()=>setMenu(true)}><span/><span/></button>
   </header>
   <div className="wordmark-wrap"><span className="hero-eyebrow">BRAND · DIGITAL · CREATIVE</span><h1 id="studio-title">LINWEI</h1><p className="hero-tagline">让想法有形，让品牌被看见。</p></div>
   <nav className="hero-categories" aria-label="作品领域"><a href="#work" onClick={()=>onSelectCategory('全部作品')}>全部作品 <small>12</small></a><span/><a href="#work" onClick={()=>onSelectCategory('品牌设计')}>品牌设计</a><a href="#work" onClick={()=>onSelectCategory('电商设计')}>电商设计</a><a href="#work" onClick={()=>onSelectCategory('潮玩设计')}>潮玩设计</a><a href="/portfolio/LINWEI-Portfolio.pdf" download>下载作品集 ↗</a></nav>
   <Suspense fallback={<div className="book-stage" aria-hidden="true"/>}><BookShelf projects={projects} onOpen={onOpen} onHover={setHovered} paused={paused||menu} focused={focused}/></Suspense>
   <div className="volume-access" aria-label="浏览三维作品集">{projects.map((project,i)=><button data-volume={i} key={project.id} onFocus={()=>setFocused(i)} onBlur={()=>setFocused(null)} onClick={e=>onOpen(project,e)}>查看{project.title}</button>)}</div>
   <div className={`book-caption${selected?' is-active':''}`} aria-live="polite"><span>{selected?`VOL. ${selected.id} / ${selected.category}`:'THE SELECTED COLLECTION'}</span><p>{selected?selected.en:'Design with personality.'}</p></div>
   <div className="hero-bottom-bar"><span className="wave-hint"><span className="wave-dot"/>移动鼠标，翻阅创意 <span className="hint-en">MOVE TO EXPLORE</span></span><button className="motion-toggle" onClick={()=>setPaused(p=>!p)} aria-pressed={paused} aria-label={paused?'继续书列动画':'暂停书列动画'}>{paused?'继续动画 ▷':'暂停动画 Ⅱ'}</button><a className="scroll-link" href="#work">探索全部作品 <span>↓</span></a></div>
  </section>
  <div className={`menu-overlay${menu?' is-open':''}`} onClick={closeMenu} aria-hidden="true"/>
  <aside ref={panel} id="site-menu" className={`studio-drawer${menu?' is-open':''}`} role="dialog" aria-modal={menu?'true':undefined} aria-label="网站导航" inert={menu?undefined:true}>
   <div className="drawer-header"><a href="#hero" className="studio-brand" onClick={()=>setMenu(false)} aria-label="LINWEI 首页"><Mark/><span><b>LINWEI</b><small>visual designer</small></span></a><button ref={closeButton} className="menu-close" aria-label="关闭菜单" onClick={closeMenu}>✕</button></div>
   <nav className="drawer-links" aria-label="菜单导航">{links.map(([zh,en,href],i)=><a key={en} href={href} style={{'--delay':`${i*60}ms`}} onClick={()=>setMenu(false)}><span>{en}</span><small>{zh}</small></a>)}</nav>
   <div className="drawer-footer"><span>视觉设计师 · VISUAL DESIGNER</span><a href="mailto:414218814@qq.com" onClick={()=>setMenu(false)}>414218814@qq.com</a><a href="/portfolio/LINWEI-Portfolio.pdf" download>下载完整作品集 ↗</a></div>
  </aside>
  <section className="studio-bottom" aria-label="个人介绍"><span className="intro-index">A LITTLE INTRODUCTION / 01</span><div><h2>Design with<br/><em>personality.</em></h2><p>你好，我是 LINWEI，一名视觉设计师。<br/>在品牌、数字与创意之间，探索有温度的视觉表达。</p><a href="mailto:414218814@qq.com">聊聊你的想法 ↗</a></div><span className="intro-note">让想法有形，<br/>让品牌被看见。</span></section>
 </>;
}
