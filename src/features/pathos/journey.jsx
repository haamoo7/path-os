import { PAL } from "./constants";

/* ─── isometric helpers (journey map) ─── */
const ANG = Math.PI / 6, COS = Math.cos(ANG), SIN = Math.sin(ANG);
const iso = (x, y, z) => [(x - y) * COS, (x + y) * SIN - z];
const pts = (a) => a.map(p => p.join(",")).join(" ");
function Box({ w, d, h, top, right, left, line }) {
  return (<g stroke={line} strokeWidth="1.4" strokeLinejoin="round">
    <polygon points={pts([iso(0,0,0),iso(0,d,0),iso(0,d,h),iso(0,0,h)])} fill={left} />
    <polygon points={pts([iso(0,0,0),iso(w,0,0),iso(w,0,h),iso(0,0,h)])} fill={right} />
    <polygon points={pts([iso(0,0,h),iso(w,0,h),iso(w,d,h),iso(0,d,h)])} fill={top} /></g>);
}
function Roof({ w, d, h, rise, fill, fillDark, line }) {
  const apex = iso(w/2, d/2, h+rise);
  return (<g stroke={line} strokeWidth="1.4" strokeLinejoin="round">
    <polygon points={pts([iso(0,0,h),iso(w,0,h),apex])} fill={fill} />
    <polygon points={pts([iso(0,0,h),iso(0,d,h),apex])} fill={fillDark} /></g>);
}
function Win({ x, z, w, h, fill, line }) {
  return <polygon points={pts([iso(x,0,z),iso(x+w,0,z),iso(x+w,0,z+h),iso(x,0,z+h)])} fill={fill} stroke={line} strokeWidth="0.8" />;
}
function Shadow({ w, d }) { const c = iso(w/2,d/2,0); return <ellipse cx={c[0]} cy={c[1]+6} rx={(w+d)*0.42} ry={(w+d)*0.2} fill="rgba(40,55,48,0.16)" />; }
export const LANDMARKS = { cottage:{w:70,d:70,rise:118}, academy:{w:120,d:78,rise:132}, workshop:{w:92,d:70,rise:112}, office:{w:68,d:68,rise:178}, bridge:{w:150,d:44,rise:96}, tower:{w:54,d:54,rise:210}, gallery:{w:112,d:80,rise:124}, studio:{w:96,d:74,rise:120}, summit:{w:122,d:100,rise:196} };
export function Landmark({ type }) {
  const meta = LANDMARKS[type] || LANDMARKS.office; const co = iso(meta.w/2, meta.d/2, 0); const P = PAL; let body;
  if (type==="cottage") body=(<><Box w={70} d={70} h={48} top={P.cream} right={P.creamMid} left={P.creamLow} line={P.ink}/><Roof w={70} d={70} h={48} rise={36} fill={P.terra} fillDark={P.terraDark} line={P.ink}/><Win x={14} z={12} w={18} h={18} fill={P.teal} line={P.ink}/><Win x={40} z={12} w={16} h={22} fill={P.tealDark} line={P.ink}/></>);
  else if (type==="academy") body=(<><Box w={120} d={78} h={50} top={P.cream} right={P.creamMid} left={P.creamLow} line={P.ink}/>{[14,38,62,86].map((x,i)=><Win key={i} x={x} z={6} w={9} h={40} fill={P.paperDark} line={P.ink}/>)}<Roof w={120} d={78} h={50} rise={30} fill={P.terra} fillDark={P.terraDark} line={P.ink}/></>);
  else if (type==="workshop") body=(<><Box w={92} d={70} h={44} top={P.cream} right={P.creamMid} left={P.creamLow} line={P.ink}/><polygon points={pts([iso(0,0,44),iso(92,0,44),iso(92,0,62),iso(0,0,58)])} fill={P.tealDark} stroke={P.ink} strokeWidth="1.4"/><Win x={18} z={10} w={20} h={22} fill={P.teal} line={P.ink}/><Win x={52} z={10} w={24} h={22} fill={P.tealDark} line={P.ink}/></>);
  else if (type==="office") body=(<><Box w={68} d={68} h={130} top={P.creamMid} right={P.cream} left={P.creamLow} line={P.ink}/>{[18,46,74,102].map((z)=>[10,34,52].map((x,i)=><Win key={z+"-"+i} x={x} z={z} w={14} h={16} fill={i%2?P.teal:P.tealDark} line={P.ink}/>))}</>);
  else if (type==="tower") body=(<><Box w={54} d={54} h={160} top={P.terra} right={P.cream} left={P.creamLow} line={P.ink}/>{[20,50,80,110,140].map((z)=>[10,32].map((x,i)=><Win key={z+"-"+i} x={x} z={z} w={12} h={18} fill={i%2?P.teal:P.tealDark} line={P.ink}/>))}<Roof w={54} d={54} h={160} rise={26} fill={P.terra} fillDark={P.terraDark} line={P.ink}/></>);
  else if (type==="bridge") body=(<><Box w={26} d={44} h={70} top={P.creamMid} right={P.cream} left={P.creamLow} line={P.ink}/><g transform={`translate(${iso(124,0,0)[0]},${iso(124,0,0)[1]})`}><Box w={26} d={44} h={70} top={P.creamMid} right={P.cream} left={P.creamLow} line={P.ink}/></g><polygon points={pts([iso(0,0,70),iso(150,0,70),iso(150,44,70),iso(0,44,70)])} fill={P.terra} stroke={P.ink} strokeWidth="1.4"/></>);
  else if (type==="gallery") body=(<><Box w={112} d={80} h={48} top={P.cream} right={P.creamMid} left={P.creamLow} line={P.ink}/>{(()=>{const c=iso(56,40,48);return <ellipse cx={c[0]} cy={c[1]-2} rx={34} ry={20} fill={P.teal} stroke={P.ink} strokeWidth="1.4"/>;})()}<Win x={16} z={10} w={20} h={26} fill={P.tealDark} line={P.ink}/><Win x={48} z={10} w={20} h={26} fill={P.teal} line={P.ink}/><Win x={80} z={10} w={20} h={26} fill={P.tealDark} line={P.ink}/></>);
  else if (type==="studio") body=(<><Box w={96} d={74} h={56} top={P.cream} right={P.creamMid} left={P.creamLow} line={P.ink}/><polygon points={pts([iso(0,0,56),iso(96,0,56),iso(96,0,82),iso(0,0,70)])} fill={P.terra} stroke={P.ink} strokeWidth="1.4"/><Win x={16} z={12} w={26} h={28} fill={P.teal} line={P.ink}/><Win x={56} z={12} w={26} h={28} fill={P.tealDark} line={P.ink}/></>);
  else body=(<><Box w={122} d={100} h={86} top={P.cream} right={P.creamMid} left={P.creamLow} line={P.ink}/>{[14,50,86].map((x,i)=><Win key={i} x={x} z={14} w={22} h={30} fill={i%2?P.teal:P.tealDark} line={P.ink}/>)}<Roof w={122} d={100} h={86} rise={46} fill={P.terra} fillDark={P.terraDark} line={P.ink}/>{(()=>{const b=iso(61,50,132),t=iso(61,50,178);return(<g stroke={P.ink} strokeWidth="2"><line x1={b[0]} y1={b[1]} x2={t[0]} y2={t[1]}/><polygon points={`${t[0]},${t[1]} ${t[0]+30},${t[1]+8} ${t[0]},${t[1]+18}`} fill={P.terra} stroke={P.ink} strokeWidth="1.4"/></g>);})()}</>);
  return <g transform={`translate(${-co[0]},${-co[1]})`}><Shadow w={meta.w} d={meta.d}/>{body}</g>;
}
export function Tree({ x, y, s=1 }) { return (<g transform={`translate(${x},${y}) scale(${s})`} opacity="0.5"><ellipse cx="0" cy="6" rx="12" ry="5" fill="rgba(40,55,48,0.12)"/><rect x="-2" y="-6" width="4" height="12" fill={PAL.terraDark}/><circle cx="0" cy="-14" r="13" fill={PAL.tealDark} stroke={PAL.ink} strokeWidth="1"/><circle cx="0" cy="-14" r="6" fill={PAL.teal}/></g>); }
export function mulberry(seed){return function(){seed|=0;seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
export function layoutNodes(count,W){const top=96,gap=188,center=W/2,amp=W*0.24,nodes=[];for(let k=0;k<count;k++)nodes.push({x:center+amp*Math.sin(k*1.05+0.4),y:top+k*gap});return{nodes,height:top+(count-1)*gap+170};}
export function segPath(a,b,flip){const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,off=34*(flip?-1:1);return `M ${a.x} ${a.y} Q ${mx+nx*off} ${my+ny*off} ${b.x} ${b.y}`;}
export const slug=(s)=>(s||"user").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
