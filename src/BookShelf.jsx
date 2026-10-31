import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const colors = ['#c4a365','#7d1917','#e85472','#536748','#e3a91e','#5c76b3','#adb8b7','#89867e','#f27322','#83aebb','#c2d448','#7a5da8'];
const order = [0,8,2,10,3,5,9,1,7,11,4,6,2,9,0,7,10,3,5,8,1,11,6,4,0,9,2,8,3,10,5,11];
const imagePath = n => `/portfolio/page-${String(n).padStart(2,'0')}.webp`;

function pageTexture(vertical = false) {
 const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
 const ctx = canvas.getContext('2d'); ctx.fillStyle = '#efe7d6'; ctx.fillRect(0,0,256,256);
 for (let i=0;i<256;i+=2) { ctx.fillStyle = `rgba(98,76,47,${.05+(i%7)*.02})`; ctx.fillRect(vertical?i:0,vertical?0:i,vertical?1:256,vertical?256:1); }
 const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

export default function BookShelf({ projects, onOpen, onHover, paused, focused }) {
 const host = useRef(null);
 const callbacks = useRef({onOpen,onHover}); callbacks.current = {onOpen,onHover};
 const interaction = useRef({paused,focused}); interaction.current = {paused,focused};
 const [fallback, setFallback] = useState(false);
 useEffect(() => {
  const element = host.current;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'}); }
  catch { setFallback(true); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000,0);
  renderer.domElement.setAttribute('aria-hidden','true'); element.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(19.5,1,.1,100);
  camera.position.set(3.6,2.15,7.4); camera.lookAt(-1.4,.05,-.6);
  const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment();
  const environment = pmrem.fromScene(room,.04); scene.environment = environment.texture;
  const key = new THREE.DirectionalLight('#fff3e4',2.4); key.position.set(-4,6,6); scene.add(key);
  const rim = new THREE.DirectionalLight('#bfd2ff',1.1); rim.position.set(6,3,-4); scene.add(rim);
  scene.add(new THREE.AmbientLight('#ffffff',.12));
  const geometry = new THREE.BoxGeometry(1,1.5,.2);
  const textureA = pageTexture(), textureB = pageTexture(true);
  const paperA = new THREE.MeshStandardMaterial({map:textureA,roughness:.9,envMapIntensity:.55});
  const paperB = new THREE.MeshStandardMaterial({map:textureB,roughness:.9,envMapIntensity:.55});
  const covers = [], materials = [], images = [], books = [];
  let disposed = false;
  projects.forEach((project,index) => {
   const canvas = document.createElement('canvas'); canvas.width=512; canvas.height=768;
   const ctx = canvas.getContext('2d');
   const draw = image => {
    ctx.fillStyle=colors[index]; ctx.fillRect(0,0,512,768);
    if(image) {
     // Keep each original artwork intact in the middle of its portfolio volume.
     const height=512*image.height/image.width;
     ctx.drawImage(image,0,235,512,height);
     ctx.save(); ctx.globalAlpha=.19; ctx.drawImage(image,0,530,512,288); ctx.restore();
    }
    ctx.fillStyle=index===0||index===4||index===10?'#191710':'#fff9ef';
    ctx.font='500 16px Arial';ctx.fillText('LINWEI  /  SELECTED WORK',32,43);
    ctx.fillRect(32,62,448,1);
    ctx.font='400 48px Georgia';
    let y=122,line='';
    project.en.split(' ').forEach(word=>{if(ctx.measureText(line+word).width>448&&line){ctx.fillText(line,32,y);y+=53;line='';}line+=word+' ';});ctx.fillText(line,32,y);
    ctx.font='500 19px sans-serif';ctx.fillText(project.category,32,680);
    ctx.font='400 14px Arial';ctx.fillText(`VOL. ${project.id}                 BRAND / DIGITAL / CREATIVE`,32,724);
   };
   draw(null);
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();covers.push(texture);
   const img=new Image();images.push(img);img.onload=()=>{if(!disposed){draw(img);texture.needsUpdate=true;}};img.src=imagePath(project.cover);
   const spineColor=new THREE.Color(colors[index]).multiplyScalar(.62);
   const spine=new THREE.MeshPhysicalMaterial({color:spineColor,roughness:.55,clearcoat:.3,envMapIntensity:.55});
   const cover=new THREE.MeshPhysicalMaterial({map:texture,roughness:.42,clearcoat:.55,clearcoatRoughness:.35,envMapIntensity:.55});
   const back=new THREE.MeshStandardMaterial({color:spineColor,roughness:.6,envMapIntensity:.55});
   materials.push([paperA,spine,paperB,paperB,cover,back]);
  });
  order.forEach((projectIndex,i)=>{
   const group=new THREE.Group();group.position.set(1.55-i*.5,-1.12,.9-i*.2);group.rotation.y=.32;
   const mesh=new THREE.Mesh(geometry,materials[projectIndex]);mesh.userData={projectIndex,index:i};group.add(mesh);scene.add(group);
   books.push({group,mesh,y:-3,v:0,z:0,vz:0,screen:new THREE.Vector3()});
  });
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)'),coarse=window.matchMedia('(pointer: coarse)');
  let width=1,height=1,visible=true,frame,last=performance.now(),elapsed=0,startTime=performance.now(),lastMove=-10000,hover=-1,down=null;
  const pointer={x:-10000,y:-10000,active:false}, raycaster=new THREE.Raycaster(),ndc=new THREE.Vector2();
  const resize=()=>{
   const rect=element.getBoundingClientRect();width=rect.width;height=rect.height;
   camera.aspect=width/height;camera.fov=width<height?40:19.5;camera.updateProjectionMatrix();renderer.setSize(width,height);
  };
  const observer=new ResizeObserver(resize);observer.observe(element);resize();
  const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});visibility.observe(element);
  const updatePointer=e=>{
   const rect=element.getBoundingClientRect();pointer.x=e.clientX-rect.left;pointer.y=e.clientY-rect.top;
   pointer.active=pointer.x>=0&&pointer.x<=width&&pointer.y>=0&&pointer.y<=height;lastMove=performance.now();
  };
  const leave=()=>{pointer.active=false;lastMove=performance.now();};
  const hit=()=>{
   if(!pointer.active)return null;
   ndc.set(pointer.x/width*2-1,-pointer.y/height*2+1);raycaster.setFromCamera(ndc,camera);
   return raycaster.intersectObjects(books.map(book=>book.mesh),false)[0];
  };
  const pointerDown=e=>{updatePointer(e);down={x:e.clientX,y:e.clientY};};
  const pointerUp=e=>{
   updatePointer(e);
   if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>8||e.target.closest('a,button,.modal-backdrop,.studio-drawer')){down=null;return;}
   const intersection=hit();down=null;
   if(intersection){const index=intersection.object.userData.projectIndex;const button=element.parentElement.querySelector(`[data-volume="${index}"]`);callbacks.current.onOpen(projects[index],{currentTarget:button});}
  };
  window.addEventListener('pointermove',updatePointer,{passive:true});window.addEventListener('pointerdown',pointerDown,{passive:true});window.addEventListener('pointerup',pointerUp);
  document.documentElement.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);
  const onContextLost=e=>{e.preventDefault();setFallback(true);};renderer.domElement.addEventListener('webglcontextlost',onContextLost);
  const tick=now=>{
   frame=requestAnimationFrame(tick);const dt=Math.min((now-last)/1000,.05);last=now;
   if(!visible||document.hidden)return;
   elapsed=(now-startTime)/1000;
   books.forEach(book=>{book.screen.set(0,.1,0);book.group.localToWorld(book.screen);book.screen.project(camera);book.screen.x=(book.screen.x+1)*width/2;book.screen.y=(1-book.screen.y)*height/2;});
   const active=interaction.current;
   let x=pointer.x,y=pointer.y,enabled=pointer.active;
   if(!active.paused&&!motion.matches&&(coarse.matches||now-lastMove>4000)){
    const u=(Math.sin(elapsed*.45)+1)/2,a=books[29].screen,b=books[1].screen;x=a.x+(b.x-a.x)*u;y=a.y+(b.y-a.y)*u;enabled=true;
   }
   const spread=Math.max(width,height)*.085;
   books.forEach((book,i)=>{
    const distance=(book.screen.x-x)**2+((book.screen.y-y)*.55)**2;
    let lift=enabled&&!active.paused&&!motion.matches?.78*Math.exp(-distance/spread**2):0;
    if(active.focused===book.mesh.userData.projectIndex)lift=.65;
    const target=!motion.matches&&elapsed<.25+(32-i)*.035?-3:lift;
    if(motion.matches){book.y=target;book.v=book.z=book.vz=0;}
    else for(let step=0;step<4;step++) {const h=dt/4;book.v+=((target-book.y)*70-book.v*12.5)*h;book.y+=book.v*h;book.vz+=((lift*.35-book.z)*70-book.vz*12.5)*h;book.z+=book.vz*h;}
    book.mesh.position.set(0,book.y,book.z);book.mesh.rotation.x=-book.v*.012;
   });
   const intersection=hit(),newHover=intersection?intersection.object.userData.projectIndex:-1;
   if(hover!==newHover){hover=newHover;element.parentElement.classList.toggle('over-book',hover>=0);callbacks.current.onHover(hover<0?null:projects[hover]);}
   renderer.render(scene,camera);
  };
  frame=requestAnimationFrame(tick);
  return()=>{
   disposed=true;cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();
   window.removeEventListener('pointermove',updatePointer);window.removeEventListener('pointerdown',pointerDown);window.removeEventListener('pointerup',pointerUp);window.removeEventListener('blur',leave);document.documentElement.removeEventListener('pointerleave',leave);
   renderer.domElement.removeEventListener('webglcontextlost',onContextLost);
   images.forEach(image=>{image.onload=null;});geometry.dispose();covers.forEach(texture=>texture.dispose());textureA.dispose();textureB.dispose();
   new Set(materials.flat()).forEach(material=>material.dispose());environment.dispose();room.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();
  };
 },[projects]);
 return <div className="book-stage" ref={host} data-renderer={fallback?'fallback':'webgl'}>{fallback&&<div className="book-fallback">{projects.map((project,i)=><button key={project.id} style={{'--i':i,'--book-color':colors[i]}} onClick={e=>onOpen(project,e)} aria-label={`查看${project.title}`}><img src={imagePath(project.cover)} alt=""/><span>{project.en}</span></button>)}</div>}</div>;
}
