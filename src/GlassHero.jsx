import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeVertices, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import './glass.css';

const MODEL_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260929_212926_92423081-b0e4-4f5a-b650-14af6c05c058.glb';
const vertexShader = `
varying vec3 vNormal;
varying vec3 vEye;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 mvPos = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPos;
  vNormal = normalize(normalMatrix * normal);
  vEye = normalize(mvPos.xyz);
}`;
const fragmentShader = `
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uIorR, uIorY, uIorG, uIorC, uIorB, uIorP;
uniform float uRefractPower, uChromatic, uSaturation;
uniform float uShininess, uDiffuseness, uFresnelPower, uBackside;
uniform vec3 uLight;
varying vec3 vNormal;
varying vec3 vEye;
float specular(vec3 light, float shininess, float diffuseness, vec3 n, vec3 eye) {
  vec3 lightVec = normalize(-light);
  vec3 halfVec = normalize(lightVec - eye);
  return pow(max(dot(n, halfVec), 0.0), shininess) + max(0.0, dot(n, lightVec)) * diffuseness;
}
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 n = normalize(vNormal);
  if (uBackside > 0.5) n = -n;
  vec3 eye = normalize(vEye);
  vec3 color = vec3(0.0);
  const int LOOP = 16;
  for (int i = 0; i < LOOP; i++) {
    float slide = float(i) / float(LOOP) * 0.045;
    vec2 R = uv + refract(eye,n,1.0/uIorR).xy * (uRefractPower + slide) * uChromatic;
    vec2 Y = uv + refract(eye,n,1.0/uIorY).xy * (uRefractPower + slide) * uChromatic;
    vec2 G = uv + refract(eye,n,1.0/uIorG).xy * (uRefractPower + slide*2.0) * uChromatic;
    vec2 C = uv + refract(eye,n,1.0/uIorC).xy * (uRefractPower + slide*2.5) * uChromatic;
    vec2 B = uv + refract(eye,n,1.0/uIorB).xy * (uRefractPower + slide*3.0) * uChromatic;
    vec2 P = uv + refract(eye,n,1.0/uIorP).xy * (uRefractPower + slide) * uChromatic;
    vec3 ty = texture2D(uTexture,Y).rgb;
    vec3 tc = texture2D(uTexture,C).rgb;
    vec3 tp = texture2D(uTexture,P).rgb;
    float r = texture2D(uTexture,R).r * 0.5;
    float y = (ty.r*2.0 + ty.g*2.0 - ty.b)/6.0;
    float g = texture2D(uTexture,G).g * 0.5;
    float c = (tc.g*2.0 + tc.b*2.0 - tc.r)/6.0;
    float b = texture2D(uTexture,B).b * 0.5;
    float p = (tp.b*2.0 + tp.r*2.0 - tp.g)/6.0;
    color += vec3(r+(2.0*p+2.0*y-c)/3.0,g+(2.0*y+2.0*c-p)/3.0,b+(2.0*c+2.0*p-y)/3.0);
  }
  color /= float(LOOP);
  color = mix(vec3(dot(color,vec3(0.2125,0.7154,0.0721))),color,uSaturation);
  float spec = specular(uLight,uShininess,uDiffuseness,n,eye)
    + 0.6*specular(vec3(1.0,1.0,-1.0),uShininess*0.6,uDiffuseness*0.5,n,eye);
  color += spec * (uBackside > 0.5 ? 0.35 : 1.0);
  float f = pow(clamp(1.0+dot(eye,n),0.0,1.0),uFresnelPower);
  color = mix(color,vec3(1.0),f*(uBackside > 0.5 ? 0.25 : 0.55));
  color += vec3(0.004,0.005,0.007);
  gl_FragColor = vec4(color,1.0);
  #include <colorspace_fragment>
}`;

export default function GlassHero() {
  const canvasRef = useRef(null), sectionRef = useRef(null), controls = useRef(null);
  const [ready,setReady] = useState(false), [fallback,setFallback] = useState(false), [view,setView] = useState(1);
  useEffect(() => {
    const canvas = canvasRef.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:false}); }
    catch { setFallback(true); setReady(true); return; }
    renderer.setClearColor(0x000000);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(), bgScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30,1,0.1,100);
    camera.position.set(0,0,10);
    const bgCamera = new THREE.Camera();
    const pivot = new THREE.Group(), spinner = new THREE.Group();
    scene.add(pivot); pivot.add(spinner);
    spinner.rotation.set(-0.42,0.62,0.18);
    const textCanvas = document.createElement('canvas');
    const textContext = textCanvas.getContext('2d');
    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.colorSpace = THREE.SRGBColorSpace;
    textTexture.minFilter = textTexture.magFilter = THREE.LinearFilter;
    textTexture.generateMipmaps = false;
    const bgMaterial = new THREE.ShaderMaterial({
      uniforms:{uTex:{value:textTexture}},
      vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
      fragmentShader:`uniform sampler2D uTex; varying vec2 vUv;
        void main(){gl_FragColor=texture2D(uTex,vUv);
        #include <colorspace_fragment>
        }`,
      depthTest:false,depthWrite:false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2,2),bgMaterial);
    quad.frustumCulled = false; bgScene.add(quad);
    const rtBack = new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});
    const rtFront = new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});
    function glassMaterial(backside) {
      return new THREE.ShaderMaterial({vertexShader,fragmentShader,side:backside?THREE.BackSide:THREE.FrontSide,
        uniforms:{uTexture:{value:backside?rtBack.texture:rtFront.texture},uResolution:{value:new THREE.Vector2()},
          uIorR:{value:1.15},uIorY:{value:1.16},uIorG:{value:1.18},uIorC:{value:1.22},uIorB:{value:1.22},uIorP:{value:1.22},
          uRefractPower:{value:backside?0.22:0.30},uChromatic:{value:0.5},uSaturation:{value:1.08},
          uShininess:{value:90},uDiffuseness:{value:0.02},uFresnelPower:{value:5},uLight:{value:new THREE.Vector3(-1,1,1)},uBackside:{value:backside?1:0}}});
    }
    const frontMat = glassMaterial(false), backMat = glassMaterial(true);
    let cube, disposed=false, frame, resizeFrame, visible=true, modelTimer;
    let dragging=false, lastX=0, lastY=0, lastMove=0, release=performance.now()-2000;
    let velocityX=0, velocityY=0, remaining=0, pointerId=null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const axisX=new THREE.Vector3(1,0,0), axisY=new THREE.Vector3(0,1,0), rotation=new THREE.Quaternion();
    const rotate=(x,y)=>{spinner.quaternion.premultiply(rotation.setFromAxisAngle(axisY,x));spinner.quaternion.premultiply(rotation.setFromAxisAngle(axisX,y));};
    function layout() {
      if(disposed)return;
      const W=sectionRef.current.clientWidth, H=sectionRef.current.clientHeight;
      const mobile=W<768||W/H<1, dpr=Math.min(devicePixelRatio,2);
      renderer.setPixelRatio(dpr);renderer.setSize(W,H,false);
      camera.aspect=W/H;camera.updateProjectionMatrix();
      const size=renderer.getDrawingBufferSize(new THREE.Vector2());
      rtBack.setSize(size.x,size.y);rtFront.setSize(size.x,size.y);
      frontMat.uniforms.uResolution.value.copy(size);backMat.uniforms.uResolution.value.copy(size);
      textCanvas.width=Math.round(W*dpr);textCanvas.height=Math.round(H*dpr);
      textContext.setTransform(dpr,0,0,dpr,0,0);
      textContext.fillStyle='#000';textContext.fillRect(0,0,W,H);
      let fs=Math.min(H*0.21,W*(mobile?0.21:0.118));
      const lines=['Explore','New','Ideas'];
      textContext.font=`800 ${fs}px Poppins, Arial, sans-serif`;
      const maxWidth=Math.max(...lines.map(s=>textContext.measureText(s).width));
      if(maxWidth>W*(mobile?0.9:0.5)){fs*=W*(mobile?0.9:0.5)/maxWidth;textContext.font=`800 ${fs}px Poppins, Arial, sans-serif`;}
      textContext.fillStyle='#e9e9e9';textContext.textAlign='center';textContext.textBaseline='alphabetic';
      const cx=W*(mobile?0.5:0.505),cy=H*(mobile?0.45:0.468);
      lines.forEach((line,i)=>textContext.fillText(line,cx,cy+fs*0.7/2+(i-1)*fs*1.07));
      textTexture.needsUpdate=true;
      const visH=2*Math.tan(THREE.MathUtils.degToRad(30)/2)*10,visW=visH*W/H;
      pivot.position.set(((mobile?0.5:0.517)-0.5)*visW,(0.5-(mobile?0.45:0.488))*visH,0);
      const px=Math.min(H*0.44,W*(mobile?0.45:0.29));pivot.scale.setScalar(px/H*visH);
    }
    const attachGeometry=(geometry,source)=>{
      if(disposed){geometry.dispose();return;}
      geometry.computeBoundingBox();
      const size=geometry.boundingBox.getSize(new THREE.Vector3());
      if(!Number.isFinite(size.length())||Math.max(size.x,size.y,size.z)<=0){geometry.dispose();throw Error('Invalid model geometry');}
      geometry.center();geometry.scale(1/Math.max(size.x,size.y,size.z),1/Math.max(size.x,size.y,size.z),1/Math.max(size.x,size.y,size.z));
      if(cube){spinner.remove(cube);cube.geometry.dispose();}
      cube=new THREE.Mesh(geometry,frontMat);spinner.add(cube);
      canvas.dataset.geometry=source;
      clearTimeout(modelTimer);layout();setReady(true);
    };
    const useRoundedBox=()=>{if(!disposed&&!cube)attachGeometry(new RoundedBoxGeometry(1,1,1,8,0.12),'rounded-box');};
    modelTimer=setTimeout(useRoundedBox,8000);
    new GLTFLoader().load(MODEL_URL,gltf=>{
      const parts=[];
      try {
        gltf.scene.updateMatrixWorld(true);
        gltf.scene.traverse(mesh=>{
          if(!mesh.isMesh)return;
          const cloned=mesh.geometry.clone();
          for(const attribute of Object.keys(cloned.attributes))if(attribute!=='position'&&attribute!=='normal')cloned.deleteAttribute(attribute);
          const g=mergeVertices(cloned,1e-4);cloned.dispose();g.computeVertexNormals();g.applyMatrix4(mesh.matrixWorld);parts.push(g);
        });
        if(!parts.length)throw Error('Empty model');
        const geometry=mergeGeometries(parts,false);
        if(!geometry)throw Error('Could not merge model');
        attachGeometry(geometry,'remote-model');
      } catch { useRoundedBox(); }
      finally {
        parts.forEach(g=>g.dispose());
        gltf.scene.traverse(mesh=>{if(mesh.isMesh){mesh.geometry.dispose();const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];materials.forEach(m=>{for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose();});}});
      }
    },undefined,useRoundedBox);
    const begin=e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;
      if(pointerId!==null)return;
      pointerId=e.pointerId;dragging=true;remaining=0;velocityX=velocityY=0;
      lastX=e.clientX;lastY=e.clientY;lastMove=performance.now();
      canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');
    };
    const move=e=>{
      if(!dragging||e.pointerId!==pointerId)return;
      const now=performance.now(),elapsed=Math.max(8,now-lastMove);
      // Vertical touch gestures scroll the portfolio; horizontal gestures rotate the glass.
      const dx=(e.clientX-lastX)*0.008,dy=(e.clientY-lastY)*0.008;
      rotate(dx,dy);velocityX=dx*16.67/elapsed;velocityY=dy*16.67/elapsed;
      lastX=e.clientX;lastY=e.clientY;lastMove=now;
    };
    const end=e=>{if(e.pointerId!==pointerId)return;dragging=false;pointerId=null;release=performance.now();if(release-lastMove>120)velocityX=velocityY=0;canvas.classList.remove('dragging');if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);};
    const key=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();controls.current?.spin(e.key==='ArrowLeft'?-1:1);}};
    controls.current={spin(direction){velocityX=velocityY=0;remaining=direction*Math.PI/2;release=performance.now();},preset(index){velocityX=velocityY=remaining=0;spinner.rotation.set(...[[-0.2,-0.65,-0.12],[-0.42,0.62,0.18],[0.55,1.2,-0.22]][index]);release=performance.now();}};
    canvas.addEventListener('pointerdown',begin);canvas.addEventListener('pointermove',move);
    canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);canvas.addEventListener('keydown',key);
    const contextLost=e=>{e.preventDefault();setFallback(true);setReady(true);};
    canvas.addEventListener('webglcontextlost',contextLost);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});observer.observe(sectionRef.current);
    const resize=()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(layout);};
    window.addEventListener('resize',resize);document.fonts?.addEventListener('loadingdone',resize);
    let previous=performance.now();
    function animate(now) {
      if(disposed)return;
      frame=requestAnimationFrame(animate);
      const dt=Math.min((now-previous)/1000,0.05);previous=now;
      if(!visible||document.hidden||renderer.getContext().isContextLost())return;
      if(!dragging){
        if(Math.abs(remaining)>0.0005){const step=reduced.matches?remaining:remaining*Math.min(1,0.09*dt*60);rotate(step,0);remaining-=step;release=now;}
        else {remaining=0;if(!reduced.matches){rotate(velocityX*dt*60,velocityY*dt*60);const damping=Math.pow(0.94,dt*60);velocityX*=damping;velocityY*=damping;const blend=THREE.MathUtils.clamp((now-release-600)/1000,0,1);rotate(0.0035*blend*dt*60,0.0012*blend*dt*60);}}
      }
      renderer.autoClear=true;renderer.setRenderTarget(rtBack);renderer.render(bgScene,bgCamera);
      renderer.setRenderTarget(rtFront);renderer.render(bgScene,bgCamera);renderer.autoClear=false;
      if(cube){cube.material=backMat;renderer.render(scene,camera);}
      renderer.setRenderTarget(null);renderer.autoClear=true;renderer.render(bgScene,bgCamera);
      renderer.autoClear=false;renderer.clearDepth();
      if(cube){cube.material=frontMat;renderer.render(scene,camera);}
    }
    layout();
    Promise.race([Promise.all([document.fonts.load('800 100px Poppins'),document.fonts.ready]),new Promise(resolve=>setTimeout(resolve,2500))]).then(()=>{if(!disposed){layout();previous=performance.now();frame=requestAnimationFrame(animate);}});
    return()=>{
      disposed=true;controls.current=null;clearTimeout(modelTimer);cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);observer.disconnect();
      window.removeEventListener('resize',resize);document.fonts?.removeEventListener('loadingdone',resize);
      canvas.removeEventListener('pointerdown',begin);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',end);canvas.removeEventListener('pointercancel',end);canvas.removeEventListener('lostpointercapture',end);canvas.removeEventListener('keydown',key);canvas.removeEventListener('webglcontextlost',contextLost);
      cube?.geometry.dispose();frontMat.dispose();backMat.dispose();quad.geometry.dispose();bgMaterial.dispose();textTexture.dispose();rtBack.dispose();rtFront.dispose();renderer.dispose();
    };
  },[]);
  const setPreset=index=>{setView(index);controls.current?.preset(index);};
  return <section className={`design-hero${fallback?' no-webgl':''}`} id="hero" ref={sectionRef} aria-label="LINWEI 个人设计作品集">
    <canvas id="scene" ref={canvasRef} aria-label="可旋转的玻璃立方体。拖动或使用左右方向键旋转。" tabIndex={0}/>
    {fallback&&<div className="scene-fallback" aria-hidden="true"><span>Explore<br/>New<br/>Ideas</span><div className="fallback-glass"/></div>}
    <div className="glass-ui">
      <h1 className="sr-only">LINWEI — Explore New Ideas · 个人作品集</h1>
      <header className="glass-nav"><a href="#hero" className="glass-logo" aria-label="LINWEI 首页"><i className="logo-mark"/><b>LINWEI</b><span>Design</span></a><nav aria-label="主导航"><ul className="glass-links"><li><a href="#hero">首页 <span>Home</span></a></li><li><a href="#work">作品 <span>Portfolio</span></a></li><li><a href="#about">关于 <span>About</span></a></li><li><a href="#contact">联系 <span>Contact</span></a></li></ul></nav></header>
      <div className="glass-arrows"><button className="glass-arrow" aria-label="向左旋转立方体" onClick={()=>controls.current?.spin(-1)} disabled={fallback}><svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button><button className="glass-arrow" aria-label="向右旋转立方体" onClick={()=>controls.current?.spin(1)} disabled={fallback}><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>
      <div className="glass-dots" role="group" aria-label="立方体视角">{[0,1,2].map(index=><button key={index} className={`glass-dot${view===index?' active':''}`} aria-label={`切换视角 ${index+1}`} aria-pressed={view===index} onClick={()=>setPreset(index)} disabled={fallback}/>)}</div>
      <p className="glass-tagline">Let's Build the<br/>Future of <strong>Design.</strong><span>让想法有形，让品牌被看见。</span></p>
      <div className="glass-cta-row"><a href="#work" className="glass-cta">Explore Now <span>↗</span></a><span className="glass-cta-line"/><span className="glass-count" aria-hidden="true">12</span></div>
      <div className={`glass-loader${ready?' done':''}`} role="status">{ready?'可拖动旋转 · DRAG TO EXPLORE':'LOADING GLASS'}</div>
      <span className="glass-edition">PORTFOLIO — 2026</span>
    </div>
  </section>;
}
