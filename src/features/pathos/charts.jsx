import { PAL, STATUS_COLOR } from "./constants";

/* ─── tiny chart helpers ─── */
export function Bars({ data, color }) {
  const max = Math.max(...data.map(d=>d.v), 1);
  return (<div style={{display:"flex",flexDirection:"column",gap:8}}>{data.map((d,i)=>(
    <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:12,width:120,flexShrink:0,color:PAL.ink}}>{d.k}</span>
      <div style={{flex:1,height:18,background:PAL.paperDark,borderRadius:5,overflow:"hidden"}}><div style={{width:(d.v/max*100)+"%",height:"100%",background:color||PAL.teal,borderRadius:5}}/></div>
      <span style={{fontSize:12,fontWeight:600,width:42,textAlign:"right"}}>{d.label||d.v}</span>
    </div>))}</div>);
}
export function Donut({ pct, color, label }) {
  const r=34, c=2*Math.PI*r, off=c*(1-pct/100);
  return (<div style={{display:"flex",alignItems:"center",gap:14}}>
    <svg width="86" height="86" viewBox="0 0 86 86"><circle cx="43" cy="43" r={r} fill="none" stroke={PAL.paperDark} strokeWidth="10"/><circle cx="43" cy="43" r={r} fill="none" stroke={color||PAL.good} strokeWidth="10" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 43 43)"/><text x="43" y="48" textAnchor="middle" fontFamily="Fredoka" fontWeight="700" fontSize="18" fill={PAL.ink}>{pct}%</text></svg>
    {label && <span style={{fontSize:13,color:PAL.inkSoft,lineHeight:1.5}}>{label}</span>}
  </div>);
}
export const St = ({ s }) => <span style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",padding:"3px 9px",borderRadius:10,color:"#fff",background:STATUS_COLOR[s]||PAL.inkSoft}}>{s}</span>;
