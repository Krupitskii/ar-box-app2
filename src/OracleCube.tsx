import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const VERT = `
uniform float uTime; uniform float uPhase; attribute vec3 aSeed; varying float vAlpha;
float hash11(float p){ return fract(sin(p*127.1)*43758.5453123); }
float noise3(vec3 x){ vec3 p=floor(x), f=fract(x); f=f*f*(3.0-2.0*f); float n=p.x+p.y*57.0+113.0*p.z;
float n000=hash11(n+0.0), n100=hash11(n+1.0); float n010=hash11(n+57.0), n110=hash11(n+58.0);
float n001=hash11(n+113.0), n101=hash11(n+114.0); float n011=hash11(n+170.0), n111=hash11(n+171.0);
float nx00=mix(n000,n100,f.x), nx10=mix(n010,n110,f.x); float nx01=mix(n001,n101,f.x), nx11=mix(n011,n111,f.x);
float nxy0=mix(nx00,nx10,f.y), nxy1=mix(nx01,nx11,f.y); return mix(nxy0,nxy1,f.z); }
void main(){ vec3 p = position; vec3 sd = aSeed; float t = uTime; if(uPhase < 0.5){
  float layer = floor(sd.x*5.0); float planeZ = mix(-6.0, -0.5, layer/4.0);
  vec2 grid = vec2(mod(sd.y*120.0,120.0), mod(sd.z*120.0,120.0)); vec2 uv = (grid-60.0)/30.0;
  float ang = t*0.35 + layer*0.25; mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)); uv = R*uv;
  float w = sin(uv.x*2.0 + t*1.5)*0.25 + cos(uv.y*1.7 - t*1.2)*0.25; p = vec3(uv*2.2, planeZ + w);
  p.z += t*0.6; float explode = smoothstep(0.8, 1.0, t); p += normalize(vec3(uv, 0.2))*explode*1.6;
} else {
  vec3 q = p*0.65; float n1 = noise3(q + vec3(t*0.25,0.0,0.0)); float n2 = noise3(q*1.7 + vec3(0.0,t*0.22,0.0));
  float n3 = noise3(q*2.3 + vec3(0.0,0.0,t*0.18)); float disp = (n1*0.7 + n2*0.5 + n3*0.6);
  p += vec3( sin(q.y*2.0 + t*0.9)*0.6, cos(q.x*2.2 - t*0.8)*0.6, (disp-0.5)*2.2 ); }
 p *= (1.0 + sin(t*0.6 + sd.x*6.2831)*0.03); float blink = noise3(p*1.2 + t*0.8) * noise3(p*2.1 - t*0.5);
 vAlpha = smoothstep(0.35, 0.8, blink); vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
 float sz = mix(1.2, 2.4, clamp(1.0 - (mv.z/-10.0), 0.0, 1.0)); gl_PointSize = sz; }
`;
const FRAG = `precision mediump float; varying float vAlpha; void main(){ float d=distance(gl_PointCoord, vec2(0.5)); if(d>0.5) discard; vec3 col=vec3(0.85,0.86,0.95); gl_FragColor=vec4(col, vAlpha);} `;

function Scene({ isMobile, showAnswer, sphereScale }: { isMobile:boolean; showAnswer:boolean; sphereScale:number }){
  const mountRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  
  useEffect(() => {
    const mount = mountRef.current!; const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    const pr = Math.max(1, Math.min(2, window.devicePixelRatio||1)); renderer.setPixelRatio(pr);
    const size = () => ({ w: mount.clientWidth, h: mount.clientHeight });
    const { w, h } = size(); renderer.setSize(w,h); mount.appendChild(renderer.domElement);
    const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 200); camera.position.set(0,0,10);

    const COUNT = isMobile ? 24000 : 42000; const pos = new Float32Array(COUNT*3); const seed = new Float32Array(COUNT*3);
    for(let i=0;i<COUNT;i++){ const r = Math.cbrt(Math.random())*6.0; const th=Math.random()*Math.PI*2.0; const ph=Math.acos(2*Math.random()-1);
      const x=r*Math.sin(ph)*Math.cos(th), y=r*Math.sin(ph)*Math.sin(th), z=r*Math.cos(ph);
      pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z; seed[i*3]=Math.random(); seed[i*3+1]=Math.random(); seed[i*3+2]=Math.random(); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos,3)); geo.setAttribute("aSeed", new THREE.BufferAttribute(seed,3));
    const uniforms:any = { uTime:{value:0}, uPhase:{value:1} };
    const mat = new THREE.ShaderMaterial({ vertexShader:VERT, fragmentShader:FRAG, uniforms, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending });
    const points = new THREE.Points(geo, mat); scene.add(points);

    const cubeRT = new THREE.WebGLCubeRenderTarget(256, { generateMipmaps:true, minFilter:THREE.LinearMipmapLinearFilter, encoding:THREE.sRGBEncoding });
    const cubeCam = new THREE.CubeCamera(0.1, 50, cubeRT); scene.add(cubeCam);
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.35, 128, 128), new THREE.MeshPhysicalMaterial({ metalness:1, roughness:0.07, reflectivity:1, clearcoat:1, clearcoatRoughness:0.1, envMap:cubeRT.texture, envMapIntensity:1.2 }));
    sphere.position.set(0, 2.6, 0); const baseScale = isMobile ? 1.25 : 1.0; (sphere.scale as any).setScalar(baseScale);
    sphereRef.current = sphere;
    scene.add(sphere);

    const onResize = () => { const { w, h } = size(); renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix(); };
    window.addEventListener("resize", onResize);

    const start = performance.now();
    const loop = () => { const t = (performance.now()-start)/1000; uniforms.uTime.value = t;
      sphere.visible=false; cubeCam.update(renderer, scene); sphere.visible=true;
      renderer.render(scene, camera); rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => { if(rafRef.current) cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", onResize); renderer.dispose(); geo.dispose(); mat.dispose(); (sphere.material as any).dispose?.(); scene.clear(); if(renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); };
  }, [isMobile]);
  
  // Анимация сферы при изменении showAnswer
  useEffect(() => {
    if (sphereRef.current) {
      const baseScale = isMobile ? 1.25 : 1.0;
      const targetScale = showAnswer ? baseScale * sphereScale : baseScale;
      sphereRef.current.scale.setScalar(targetScale);
    }
  }, [showAnswer, sphereScale, isMobile]);
  
  return <div ref={mountRef} style={{ position:"fixed", inset:0, zIndex:0 }} />;
}

function FontsAndGlitchCSS(){
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
      :root{ --fg:#e6e9f2; --fg-dim:rgba(226,232,240,.85) }
      html,body{ font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,'Noto Sans',sans-serif; background:#000; }
      .glitch{ position:relative; font-weight:900; font-size:28px; line-height:1.1; letter-spacing:-0.01em; text-align:center; color:var(--fg); text-shadow:0 2px 12px rgba(0,0,0,.6); }
      .glitch span{ position:absolute; top:0; left:0; right:0; }
      .glitch .r{ mix-blend-mode:screen; color:var(--fg); text-shadow:-1px 0 #ff3b3b; animation:shiftR 2s infinite steps(2); }
      .glitch .c{ mix-blend-mode:screen; color:var(--fg); text-shadow:1px 0 #38e8ff; animation:shiftC 2s infinite steps(2); }
      .glitch .slice{ position:absolute; left:0; right:0; color:var(--fg); animation:glSlice 2s infinite; opacity:.9 }
      @keyframes shiftR{ 0%{transform:translate(0,0)} 50%{transform:translate(-0.6px,0)} 100%{transform:translate(0,0)} }
      @keyframes shiftC{ 0%{transform:translate(0,0)} 50%{transform:translate(0.6px,0)} 100%{transform:translate(0,0)} }
      @keyframes glSlice{ 0%{clip-path:inset(0 0 80% 0);opacity:.85} 10%{clip-path:inset(10% 0 65% 0)} 20%{clip-path:inset(40% 0 40% 0)} 30%{clip-path:inset(65% 0 15% 0)} 40%{clip-path:inset(25% 0 55% 0)} 50%{clip-path:inset(5% 0 75% 0)} 60%{clip-path:inset(55% 0 25% 0)} 70%{clip-path:inset(35% 0 45% 0)} 80%{clip-path:inset(75% 0 5% 0)} 90%{clip-path:inset(20% 0 60% 0)} 100%{clip-path:inset(0 0 80% 0);opacity:.85} }
      .btn{ background:rgba(0,0,0,.6); color:#fff; border:1px solid rgba(255,255,255,.12); border-radius:12px; padding:12px 16px; font-weight:800; box-shadow:0 0 0 1px rgba(255,255,255,.06) inset, 0 8px 40px rgba(0,0,0,.45); }
      .btn.glow{ box-shadow:0 0 0 1px rgba(255,255,255,.1) inset, 0 0 0 2px rgba(255,255,255,.06), 0 10px 50px rgba(0,0,0,.5); }
      .back{ position:relative; background:transparent; border:none; color:#cbd5e1; font-weight:700; cursor:pointer; }
    `}</style>
  );
}

function GlitchTitle({ text }:{ text:string }){
  return (
    <div className="glitch" aria-label={text}>
      {text}
      <span className="r" aria-hidden>{text}</span>
      <span className="c" aria-hidden>{text}</span>
      <span className="slice" aria-hidden>{text}</span>
    </div>
  );
}

function Foreground({ input, setInput, showAnswer, answerText, textVisible, onSend, onBack }:{ input:string; setInput:(v:string)=>void; showAnswer:boolean; answerText:string|null; textVisible:boolean; onSend:()=>void; onBack:()=>void; }){
  return (
    <div className="foreground-container" style={{ position:"fixed", inset:0, zIndex:10, display:"flex", alignItems:showAnswer ? "center" : "flex-start", justifyContent:"center", color:"white", paddingTop:showAnswer ? "0" : "48vh" }}>
      <div style={{ width:"88vw", maxWidth:420, display:"flex", flexDirection:"column", gap:16, alignItems:"center", position: "relative" }}>
        {!showAnswer && (<>
          <GlitchTitle text="Welcome to The Oracle Cube." />
          <p style={{ color:"var(--fg-dim)", textAlign:"center" }}>Ask your question. Type your message to the stars.</p>
          <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Type here…" style={{ width:"100%", background:"rgba(0,0,0,.4)", border:"1px solid rgba(255,255,255,.18)", borderRadius:10, padding:"12px 14px", outline:"none", color:"var(--fg)", fontSize:"16px", WebkitAppearance:"none", appearance:"none" }} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10, width:"100%" }}>
            <button className="btn glow" onClick={onSend}>
              <span className="glitch" style={{fontSize:18,fontWeight:800}}>
                <span className="r" aria-hidden>Ask for answer</span>
                <span className="c" aria-hidden>Ask for answer</span>
                <span className="slice" aria-hidden>Ask for answer</span>
                Ask for answer
              </span>
            </button>
          </div>
          <div style={{ fontSize:10, color:"rgba(148,163,184,.9)", textAlign:"center" }}>Anonymous. No data saved without consent.</div>
          <a href="https://www.instagram.com/vesselvibe" target="_blank" rel="noopener noreferrer" style={{ fontSize:10, opacity:.8, textAlign:"center", color:"#cbd5e1", textDecoration:"none" }}>The Oracle Cube — ARC 2025 · By The Vessel</a>
        </>)}
        {showAnswer && (
          <>
            <div className={`oracle-answer ${textVisible ? 'visible' : 'hidden'}`}>
              <GlitchTitle text={answerText || ""} />
            </div>
            <button className="back" onClick={onBack} aria-label="Back">← Back</button>
            <a href="https://www.instagram.com/vesselvibe" target="_blank" rel="noopener noreferrer" style={{ fontSize:10, opacity:.8, textAlign:"center", color:"#cbd5e1", textDecoration:"none", marginTop:8 }}>The Oracle Cube — ARC 2025 · By The Vessel</a>
          </>
        )}
      </div>
    </div>
  );
}

export default function OracleCube(){
  const [input, setInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [answer, setAnswer] = useState<string|null>(null);
  const [sphereScale, setSphereScale] = useState(1);
  const [textVisible, setTextVisible] = useState(false);
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const phrases = useMemo(() => ([
    "Kill your ego.",
    "You are not your thoughts.",
    "Everything you seek is already inside.",
    "Time is an illusion.",
    "The reflection is the reality.",
    "Let go",
    "Nothing changes until you do.",
    "You are the question and the answer.",
    "Love is the only frequency.",
    "I see you",
    "Breathe.",
    "Expand.",
    "Awaken.",
    "Surrender.",
    "Remember.",
    "Heal.",
    "Reflect.",
    "Listen.",
    "Flow.",
    "Love.",
    "You are fine.",
    "Reboot your heart.",
    "Who are you without your story?",
    "You were always the answer.",
    "You are becoming.",
    "Transformation is messy—so are you.",
    "Endings are portals.",
    "Trust the process",
    "Die a little, live a lot.",
    "Shed what no longer fits.",
    "The answer is always love.",
    "You are already loved.",
    "Choose love over fear.",
    "Your future is buffering…",
    "You came here for a selfie, but left with your soul.",
    "Warning: May cause transformation.",
    "This is not content, this is you.",
    "Someone is looking at you right now.",
    "Your karma has been delivered.",
    "Artificial? Or just art ?",
    "It’s not magic.",
    "You are the algorithm.",
    "This oracle runs on your energy.",
    "Don’t worship the oracle",
    "Human Made.",
    "Try again later.",
    "yes",
    "no",
    "you already know.",
    "In another timeline, you are here too."
  ]), []);

  const onSend = () => {
    const phrase = phrases[Math.floor(Math.random()*phrases.length)];
    setAnswer(phrase);
    setShowAnswer(true);
    setTextVisible(false);
    // Анимация увеличения сферы (еще более уменьшенный масштаб)
    setSphereScale(1.4);
    
    // Показываем текст после анимации сферы с задержкой
    setTimeout(() => {
      setTextVisible(true);
    }, 800);
  };
  const onBack = () => { 
    setShowAnswer(false); 
    setTextVisible(false);
    // Возвращаем сферу к исходному размеру
    setSphereScale(1);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"radial-gradient(ellipse at 50% 50%, #020617 0%, #000 60%)" }}>
      <FontsAndGlitchCSS />
      <Scene isMobile={isMobile} showAnswer={showAnswer} sphereScale={sphereScale} />
      <Foreground input={input} setInput={setInput} showAnswer={showAnswer} answerText={answer} textVisible={textVisible} onSend={onSend} onBack={onBack} />
    </div>
  );
}
