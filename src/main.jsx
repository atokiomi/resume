import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import GlassHero from './GlassHero';

const image = n => `/portfolio/page-${String(n).padStart(2, '0')}.webp`;
const range = (a,b) => Array.from({length:b-a+1},(_,i)=>a+i);
const projects = [
 {id:'01',title:'智能黄金 · 品牌的全新想象',en:'SMART GOLD STORE',category:'品牌设计',cover:3,pages:range(3,16),tags:'品牌识别 / 空间视觉 / IP 形象',desc:'从品牌识别到线下空间，以金色为视觉线索，探索黄金零售的智能化表达。'},
 {id:'02',title:'今生金饰 · 东方的当代表达',en:'KINGHOOD JEWELRY',category:'品牌设计',cover:17,pages:range(17,26),tags:'视觉识别 / 包装 / 品牌传播',desc:'以东方美学为灵感，让品牌识别、产品包装与珠宝视觉形成完整的表达。'},
 {id:'03',title:'霞飞 · 让色彩自由发生',en:'SOFEA BEAUTY',category:'品牌设计',cover:27,pages:range(27,30),tags:'品牌焕新 / 美妆视觉 / 包装',desc:'将落日的温度与自由的色彩融入美妆品牌，呈现轻盈、鲜活的视觉体验。'},
 {id:'04',title:'岚萃里 · 自然之间',en:'LANCUILI',category:'品牌设计',cover:31,pages:range(31,35),tags:'品牌识别 / 生活方式 / 包装',desc:'从自然与日常中寻找灵感，用沉静的色彩和简洁的图形构建品牌的生活气息。'},
 {id:'05',title:'把能量，带去更远的地方',en:'POWER YOUR OUTDOORS',category:'电商设计',cover:37,pages:range(37,38),tags:'产品视觉 / 电商详情 / 户外场景',desc:'围绕户外电源的使用场景，以光影、材质与环境传递产品能量。'},
 {id:'06',title:'小体积，大能量',en:'QBAN · POWER BANK',category:'电商设计',cover:39,pages:range(39,40),tags:'数码产品 / 电商视觉 / 详情页',desc:'用富有力量感的材质对比与清晰的产品信息，呈现移动电源的设计细节。'},
 {id:'07',title:'让每一次操作，都有回应',en:'POWER YOUR PLAY',category:'电商设计',cover:41,pages:range(41,44),tags:'产品叙事 / 海外电商 / 页面设计',desc:'围绕产品功能与使用体验，构建适用于海外电商的视觉叙事。'},
 {id:'08',title:'自由伸展，回到身体本身',en:'MADE TO MOVE',category:'电商设计',cover:48,pages:range(45,49),tags:'运动服饰 / 生活方式 / 电商视觉',desc:'以柔和的自然色调、真实的运动状态，表达服饰的舒适感与身体的自由。'},
 {id:'09',title:'PHOTON X · 无限可能',en:'PHOTON X',category:'潮玩设计',cover:51,pages:range(51,55),tags:'IP 设计 / 潮玩 / 衍生应用',desc:'以鲜明的橙色与模块化造型打造 PHOTON X，将角色延伸至多种潮流衍生品。'},
 {id:'10',title:'把快乐装进每一种日常',en:'HUI · 悦汇城',category:'潮玩设计',cover:57,pages:range(56,64),tags:'IP 形象 / 插画 / 文创设计',desc:'充满个性的角色与明快的色彩，在图形、文创和空间之间连接城市生活。'},
 {id:'11',title:'FRISBEE GO · 一起出发',en:'FRISBEE CITY ACTION',category:'潮玩设计',cover:65,pages:range(65,68),tags:'潮流视觉 / 活动设计 / 衍生应用',desc:'让荧光色、趣味角色与自由排版碰撞，记录飞盘运动中的活力与相遇。'},
 {id:'12',title:'不设限的创意实验',en:'MARKETING & CREATIVITY',category:'潮玩设计',cover:69,pages:range(69,70),tags:'视觉实验 / 创意传播 / 图形设计',desc:'以高饱和色彩和大胆图形，探索日常物件与品牌传播的更多可能。'},
];
const categories = ['全部作品','品牌设计','电商设计','潮玩设计'];
function Arrow({diagonal=false,...props}) {return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}>{diagonal?<path d="M5 19 19 5M5 5h14v14"/>:<path d="M4 12h16m-6-6 6 6-6 6"/>}</svg>}
function App(){
 const [filter,setFilter]=useState('全部作品');
 const [active,setActive]=useState(null);
 const [slide,setSlide]=useState(0);
 const [copied,setCopied]=useState(false);
 const opener=useRef(null),closeButton=useRef(null),modalRef=useRef(null);
 const open=(p,e)=>{opener.current=e.currentTarget;setSlide(0);setActive(p)};
 const close=()=>{setActive(null);opener.current?.focus()};
 useEffect(()=>{if(!active)return; const before=document.body.style.overflow;document.body.style.overflow='hidden';closeButton.current?.focus(); const key=e=>{if(e.key==='Escape')close();if(e.key==='ArrowRight')setSlide(s=>(s+1)%active.pages.length);if(e.key==='ArrowLeft')setSlide(s=>(s-1+active.pages.length)%active.pages.length);if(e.key==='Tab'){const items=modalRef.current.querySelectorAll('button,a');const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};window.addEventListener('keydown',key);return()=>{document.body.style.overflow=before;window.removeEventListener('keydown',key)}},[active]);
 const copyEmail=async()=>{try{await navigator.clipboard.writeText('414218814@qq.com');setCopied(true);setTimeout(()=>setCopied(false),2400)}catch{window.location.href='mailto:414218814@qq.com'}};
 return <>
 <main>
 <GlassHero/>
 <section className="work section" id="work"><div className="section-top"><div className="section-kicker"><span>01 / SELECTED WORK</span><p>用设计，讲一个好故事。</p></div><h2>精选作品<span className="serif">Selected work.</span></h2><span className="section-note">不同领域，同样的热爱。<br/>每一次创作，都是新的探索。</span></div><div className="work-toolbar"><div className="filters" role="group" aria-label="作品分类">{categories.map((c,i)=><button key={c} aria-pressed={filter===c} className={filter===c?'selected':''} onClick={()=>setFilter(c)}>{c}<sup>{i===0?'12':String(projects.filter(p=>p.category===c).length).padStart(2,'0')}</sup></button>)}</div><span className="work-count">{String(projects.filter(p=>filter==='全部作品'||p.category===filter).length).padStart(2,'0')} PROJECTS</span></div><div className="project-grid">{projects.filter(p=>filter==='全部作品'||p.category===filter).map(p=><button className="project" key={p.id} onClick={e=>open(p,e)} aria-label={`查看${p.title}`}><div className="project-visual"><img src={image(p.cover)} alt={p.title} loading="lazy"/><span className="project-category">{p.category}</span><span className="project-open"><Arrow diagonal/></span></div><div className="project-meta"><div><span className="project-en">{p.en}</span><h3>{p.title}</h3><p>{p.tags}</p></div><span className="project-number">/{p.id}</span></div></button>)}</div><div className="work-end"><span>更多创意，藏在每一个细节里。</span><a href="/portfolio/LINWEI-Portfolio.pdf" download>下载完整作品集 <span>PDF · 71 PAGES</span> <Arrow diagonal/></a></div></section>
 <section className="about section" id="about"><div className="about-left"><span className="section-kicker">02 / A LITTLE ABOUT ME</span><div className="about-art"><span className="about-letter">lw.</span><span className="about-star">✳</span><span className="about-tag">ALWAYS<br/>CURIOUS.</span><span className="about-art-foot">DESIGN IS A WAY OF SEEING.</span></div></div><div className="about-content"><span className="eyebrow">设计不止于好看</span><h2>保持好奇，<br/>创造<span className="underlined">不一样。</span></h2><p className="about-hello">你好，我是 <strong>LINWEI</strong>，一名视觉设计师。</p><p>在品牌、数字与创意之间，探索有温度的视觉表达。</p><p>我关注品牌与人的连接，也喜欢在不同领域之间寻找灵感。从品牌识别、电商视觉到潮玩 IP，用清晰的设计思考和鲜明的视觉语言，让每个想法找到适合自己的表达。</p><p>相信好的设计，既能回应需求，也能带来一点意料之外的惊喜。</p><div className="skills"><span>品牌视觉 Brand Identity</span><span>电商设计 E-commerce</span><span>IP / 潮玩 Character Design</span><span>包装设计 Packaging</span></div><a className="text-link" href="/portfolio/LINWEI-Portfolio.pdf" download>认识更多作品 <Arrow diagonal/></a></div></section>
 <section className="contact section" id="contact"><div className="contact-top"><span className="section-kicker">03 / LET’S MAKE SOMETHING GREAT</span><span className="availability"><i/> 期待新的创意合作</span></div><p>有个好想法？一起让它发生。</p><a href="mailto:414218814@qq.com" className="contact-title">Let’s talk<span className="serif">ideas.</span><Arrow diagonal/></a><div className="contact-bottom"><a className="email" href="mailto:414218814@qq.com">414218814@qq.com <Arrow diagonal/></a><button onClick={copyEmail} className="copy-button" aria-live="polite">{copied?'已复制 ✓':'复制邮箱 ⧉'}</button><a className="phone" href="tel:18520492324">TEL. 185 2049 2324</a></div></section>
 </main><footer><a href="#" className="footer-brand">LINWEI<span>®</span></a><p>© 2026 LINWEI. 用心设计，保持热爱。</p><a href="#">回到顶部 ↑</a></footer>
 {active&&<div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)close()}}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={modalRef}><header className="modal-header"><div><span className="section-kicker">{active.category} / {active.en}</span><h2 id="modal-title">{active.title}</h2></div><button ref={closeButton} className="close-button" onClick={close} aria-label="关闭项目">✕</button></header><p className="modal-description">{active.desc}</p><div className="modal-image" key={active.id+'-'+slide}><img src={image(active.pages[slide])} alt={`${active.title} — 作品第 ${slide+1} 页`}/></div><div className="modal-controls"><button onClick={()=>setSlide(s=>(s-1+active.pages.length)%active.pages.length)} aria-label="上一页">← 上一页</button><span aria-live="polite">{String(slide+1).padStart(2,'0')} / {String(active.pages.length).padStart(2,'0')}</span><button onClick={()=>setSlide(s=>(s+1)%active.pages.length)} aria-label="下一页">下一页 →</button></div><div className="thumbnails">{active.pages.map((n,i)=><button key={n} onClick={()=>setSlide(i)} className={i===slide?'current':''} aria-label={`第 ${i+1} 页`} aria-pressed={i===slide}><img src={image(n)} alt="" loading="lazy"/></button>)}</div></div></div>}
 </>;
}

createRoot(document.getElementById('root')).render(<App/>);
