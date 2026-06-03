import { useState } from "react";
import { PAL } from "../constants";

/* ─── post-job form (company) ─── */
export default function PostJobForm({ onPost }) {
  const [title, setTitle] = useState(""); const [loc, setLoc] = useState(""); const [level, setLevel] = useState("Mid"); const [salary, setSalary] = useState(""); const [sk, setSk] = useState(""); const [skills, setSkills] = useState([]);
  const add = () => { const s = sk.trim(); if (s && !skills.includes(s)) setSkills(p => [...p, s]); setSk(""); };
  return (<div className="px-card">
    <div className="px-field"><label>Job title *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Brand Strategist" /></div>
    <div className="px-field"><label>Location</label><input value={loc} onChange={e => setLoc(e.target.value)} placeholder="e.g. Kuala Lumpur" /></div>
    <div style={{display:"flex",gap:10}}><div className="px-field" style={{flex:1}}><label>Level</label><select value={level} onChange={e => setLevel(e.target.value)}>{["Junior","Mid","Senior","Lead"].map(l => <option key={l}>{l}</option>)}</select></div><div className="px-field" style={{flex:1}}><label>Salary range</label><input value={salary} onChange={e => setSalary(e.target.value)} placeholder="RM 6–8k" /></div></div>
    <div className="px-field"><label>Required skills</label><div className="px-skillrow"><input value={sk} onChange={e => setSk(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Type a skill, press Enter" /><button className="px-add" onClick={add}>Add</button></div>{skills.length > 0 && <div className="px-tags">{skills.map(s => <span key={s} className="px-tag">{s}<button onClick={() => setSkills(p => p.filter(x => x !== s))}>×</button></span>)}</div>}</div>
    <button className="px-go" disabled={!title.trim()} onClick={() => { onPost({ title, company:"Hatch & Co", location: loc || "Kuala Lumpur", level, salary: salary || "Negotiable", skills }); setTitle(""); setLoc(""); setSalary(""); setSkills([]); }}>Post job opening ✦</button>
  </div>);
}
