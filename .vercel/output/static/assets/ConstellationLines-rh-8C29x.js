import{r as e}from"./rolldown-runtime-S-ySWqyJ.js";import{X as t,Y as n,bt as r,d as i,f as a,ht as o,k as s,l as c,y as l}from"./vendor-drei-controls-D7FWcZ2G.js";import{t as u}from"./useStore-1KAzaB4U.js";import{t as d}from"./vendor-drei-ui3d-C3dtzHLg.js";import{c as f,i as p,n as m,s as h,t as g}from"./skyTargets-DUZr01il.js";var _=e(r(),1),v=350,y=300,b=v/1e3,x=y/1e3;function S(e){let t=(0,_.useRef)(null),n=(0,_.useRef)(null),r=(0,_.useRef)(`idle`),i=(0,_.useRef)(0),[a,o]=(0,_.useState)(null),[s,l]=(0,_.useState)(0);return(0,_.useEffect)(()=>{t.current=a},[a]),(0,_.useEffect)(()=>{i.current=s},[s]),(0,_.useEffect)(()=>{let a=t.current;if(!e){if(n.current=null,!a){r.current=`idle`,i.current=0,l(0);return}r.current=`fadeOut`;return}if(!a){t.current=e,o(e),i.current=0,l(0),r.current=`fadeIn`;return}a!==e&&(n.current=e,r.current=`fadeOut`)},[e]),c((e,a)=>{let s=r.current;if(s===`fadeOut`){let e=b<=1e-6?0:Math.max(0,i.current-a/b);i.current=e,l(e)}else if(s===`fadeIn`){let e=x<=1e-6?1:Math.min(1,i.current+a/x);i.current=e,l(e)}if(s===`fadeOut`&&i.current<=.001){let e=n.current;e?(n.current=null,t.current=e,o(e),i.current=0,l(0),r.current=`fadeIn`):(t.current=null,o(null),r.current=`idle`)}else s===`fadeIn`&&i.current>=.999&&(i.current=1,l(1),r.current=`idle`)}),{displayedId:a,displayedIdRef:t,opacity:s,opacityRef:i}}var C=a(),w=2450,T=new o(0,0,-1),E=new t,D=new t,O=new o,k=new t,A=`#8ec5ff`,j=8,M=1.2,N=new o(.85,.93,1),P=`
uniform float uSize;
uniform float uPixelRatio;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize * uPixelRatio;
}
`,F=`
uniform vec3 uColor;
uniform float uOpacity;
void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float dist = length(centered);
  if (dist > 0.5) discard;

  float core = smoothstep(0.2, 0.0, dist);
  float glow = smoothstep(0.5, 0.0, dist) * 0.9;
  float alpha = max(core, glow) * uOpacity;
  vec3 color = uColor * (0.95 + core * 0.9);
  gl_FragColor = vec4(color, alpha);
}
`,I=(e,t)=>{let n=f[e],{quaternion:r}=m(n,t),i=new Map;for(let e of n.stars){let t=h({rightAscensionHours:e.rightAscensionHours,declinationDeg:e.declinationDeg});t.applyQuaternion(r).multiplyScalar(w),i.set(e.id,t)}let a=new Float32Array(n.stars.length*3);n.stars.forEach((e,t)=>{let n=i.get(e.id);if(!n)return;let r=t*3;a[r]=n.x,a[r+1]=n.y,a[r+2]=n.z});let o=new l;o.setAttribute(`position`,new s(a,3));let c=[];for(let[e,t]of n.segments){let n=i.get(e),r=i.get(t);!n||!r||c.push([n.clone(),r.clone()])}return{lineSegments:c,starGeometry:o,starSize:j}},L=()=>{let e=i(e=>e.camera),t=i(e=>e.size),r=i(e=>e.gl.getPixelRatio()),a=e instanceof n?e.aspect:t.width/Math.max(1,t.height),o=u(e=>e.selectedConstellation),s=u(e=>e.constellationLinesVisible),l=(0,_.useRef)(null),f=(0,_.useRef)(null),{displayedId:m,displayedIdRef:h,opacity:v,opacityRef:y}=S(o),b=(0,_.useMemo)(()=>m?I(m,a):null,[m,a]);if((0,_.useEffect)(()=>()=>{b?.starGeometry.dispose()},[b]),c(()=>{let e=l.current,t=h.current;if(e&&t){let n=g[t];if(!n){console.warn(`ConstellationLines: no sky target for "${t}" — figure will not be oriented`);return}E.setFromUnitVectors(T,n);let r=p(t)+u.getState().constellationUserSpinRad;O.copy(n),D.setFromAxisAngle(O,r),k.multiplyQuaternions(D,E),e.quaternion.copy(k),e.position.set(0,0,0)}let n=f.current;if(!n||!b)return;let i=y.current;n.uniforms.uSize.value=b.starSize,n.uniforms.uPixelRatio.value=r,n.uniforms.uOpacity.value=i}),!b)return null;let x=v,w=s?x*.95:0;return(0,C.jsxs)(`group`,{ref:l,renderOrder:5,children:[b.lineSegments.map(([e,t],n)=>(0,C.jsx)(d,{points:[e,t],color:A,lineWidth:M,transparent:!0,opacity:w,depthWrite:!1,depthTest:!1,blending:2},`${e.x}:${e.y}:${e.z}:${n}`)),(0,C.jsx)(`points`,{geometry:b.starGeometry,children:(0,C.jsx)(`shaderMaterial`,{ref:f,transparent:!0,depthWrite:!1,depthTest:!1,blending:2,uniforms:{uColor:{value:N},uSize:{value:b.starSize},uPixelRatio:{value:r},uOpacity:{value:x}},vertexShader:P,fragmentShader:F})})]})};export{L as ConstellationLines};