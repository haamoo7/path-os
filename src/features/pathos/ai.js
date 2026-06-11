/* ─── prompts ─── */
export const SYS = `You are PathOS's career intelligence engine. Given a user's background and target role, produce a complete analysis AND an illustrated milestone journey from one assessment. Respond with ONLY a JSON object (no markdown) in this exact shape:
{
  "journey_title": "<short evocative title>",
  "start_label": "<2-4 word name for now>",
  "destination_label": "<2-4 word name for target>",
  "readiness_score": <0-100 integer>,
  "readiness_summary": "<2 sentences>",
  "transition_verdict": "<2-3 sentences: timeline + hardest part>",
  "strengths": [ { "skill": "<strength>", "reason": "<why it matters>" } ],
  "gaps": [ { "name": "<gap>", "description": "<why>", "priority": "high|medium|low" } ],
  "cert_recommendations": [ { "name": "<cert>", "provider": "<provider>", "why": "<gap it closes>" } ],
  "milestones": [ { "name": "<landmark name>", "scene_type": "<academy|workshop|office|bridge|tower|gallery|studio>", "action": "<milestone>", "detail": "<2 sentences>", "timeline": "<e.g. 1-2 months>", "skill_unlocked": "<skill>", "gap_closed": "<exact gap.name>", "cert": "<cert/provider or empty>" } ],
  "branches": [ { "from_milestone": <0-based index of the milestone this forks from>, "alt_role": "<an alternative related role reachable with transferable skills>", "label": "<short landmark name for this alternative destination>", "scene_type": "<academy|workshop|office|bridge|tower|gallery|studio>", "transferable_skills": ["<skill that carries over from their path>"], "rationale": "<1-2 sentences: why the skills transfer and what is different about this path>", "extra_steps": ["<one short extra thing needed to pivot here>"] } ]
}
Rules: 3-5 strengths, 3-5 gaps, 2-4 certs, 4-6 milestones (foundational->advanced), and 2-3 branches. Each gap closed by exactly one milestone (gap_closed matches gap.name). Branches are lateral "what-if" possibilities within the same or an adjacent industry where the person's skills transfer — each forks from an existing milestone (valid from_milestone index) and names a DIFFERENT destination role than the main target. Make landmark names reflect their field. Calibrate for the SEA / Malaysian job market.`;
export const PROFILE_SYS = `Extract a structured professional profile from the user's resume/CV. Respond with ONLY a JSON object (no markdown):
{ "name":"", "headline":"<role title>", "location":"", "email":"", "summary":"<2-3 sentences>", "skills":[""], "certificates":[{"name":"","provider":"","year":""}], "achievements":[{"title":"","story":"<success story + impact>","metric":"<number/result or empty>"}], "experience":[{"role":"","company":"","period":"","highlights":[""]}], "education":[{"degree":"","institution":"","year":""}] }
Rules: surface 3-6 achievements as success-story badges. 8-15 skills max. Use empty string/array where missing — never invent credentials.`;
export const ASSESS_SYS = `You synthesize a person's holistic assessment results into a concise career-fit snapshot. Respond with ONLY a JSON object (no markdown):
{ "summary":"<2-3 sentences tying the results together>", "work_style":"<1 sentence>", "ideal_environment":"<1 sentence>", "watchouts":"<1 sentence>", "fit_for_target":"<1-2 sentences on how this profile fits their target role>" }`;

export function parseJSON(text){const m=text.match(/```json\s*([\s\S]*?)```/)||text.match(/\{[\s\S]*\}/);if(m){try{return JSON.parse(m[1]||m[0]);}catch{}}try{return JSON.parse(text);}catch{}return null;}
export function fileToBase64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});}
export const DEEPSEEK_MODEL = "deepseek-v4-flash";
export const DEEPSEEK_MESSAGES_ENDPOINT = "/api/deepseek/v1/messages";
export const DEEPSEEK_UNSUPPORTED_UPLOAD = "DeepSeek is now the active AI provider here, and this integration only accepts pasted or text-based resumes. For PDF or image uploads, please paste the resume text instead.";

export function createDeepSeekMessage(body){
  return fetch(DEEPSEEK_MESSAGES_ENDPOINT,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ model:DEEPSEEK_MODEL, ...body }),
  });
}

export function buildProfileHTML(p,certs,achievements,skills,exp,edu){
  const esc=(s)=>(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const badge=(e,l,s)=>`<div style="display:flex;gap:10px;align-items:center;background:#f3eede;border:1px solid #cabf9f;border-radius:10px;padding:10px 12px;"><div style="width:34px;height:34px;border-radius:50%;background:#e2ece6;display:flex;align-items:center;justify-content:center;font-size:17px;">${e}</div><div><div style="font-weight:600;font-size:13px;color:#3c4a43;">${esc(l)}</div><div style="font-size:11px;color:#5a6a61;">${esc(s)}</div></div></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.name)} — PathOS Profile</title><style>body{font-family:system-ui,sans-serif;background:#b8c9bd;margin:0;color:#3c4a43;}.wrap{max-width:740px;margin:0 auto;padding:2rem 1.25rem;}.card{background:#f3eede;border:2px solid #3c4a43;border-radius:16px;padding:1.6rem;margin-bottom:1.1rem;}h1{font-size:30px;margin:0 0 4px;}h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:#3f6b5b;border-bottom:2px solid #cabf9f;padding-bottom:5px;margin:0 0 12px;}.meta{color:#5a6a61;font-size:14px;margin-bottom:10px;}.headline{color:#c0473a;font-weight:600;font-size:16px;}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;}.chip{display:inline-block;background:#e2dac4;border-radius:20px;padding:5px 12px;font-size:13px;margin:0 6px 6px 0;}.exp{margin-bottom:14px;}.exp .r{font-weight:600;font-size:15px;}.exp .c{color:#5a6a61;font-size:13px;margin-bottom:5px;}.exp ul{margin:4px 0 0;padding-left:18px;}.exp li{font-size:13px;line-height:1.6;}.foot{text-align:center;color:#3f6b5b;font-size:12px;padding:1rem;}</style></head><body><div class="wrap"><div class="card"><h1>${esc(p.name)}</h1><div class="headline">${esc(p.headline)}</div><div class="meta">${esc(p.location)}${p.email?" · "+esc(p.email):""}</div><p style="font-size:14px;line-height:1.7;margin:0;">${esc(p.summary)}</p></div>${skills.length?`<div class="card"><h2>Skills</h2>${skills.map(s=>`<span class="chip">${esc(s)}</span>`).join("")}</div>`:""}${certs.length?`<div class="card"><h2>Certification Badges</h2><div class="grid">${certs.map(c=>badge("🎓",c.name,c.provider+(c.year?" · "+c.year:""))).join("")}</div></div>`:""}${achievements.length?`<div class="card"><h2>Achievement Badges</h2><div class="grid">${achievements.map(a=>badge("🏆",a.title,a.story+(a.metric?" ("+a.metric+")":""))).join("")}</div></div>`:""}${exp.length?`<div class="card"><h2>Experience</h2>${exp.map(e=>`<div class="exp"><div class="r">${esc(e.role)}</div><div class="c">${esc(e.company)} · ${esc(e.period)}</div>${e.highlights&&e.highlights.length?`<ul>${e.highlights.map(h=>`<li>${esc(h)}</li>`).join("")}</ul>`:""}</div>`).join("")}</div>`:""}${edu.length?`<div class="card"><h2>Education</h2>${edu.map(e=>`<div class="exp"><div class="r">${esc(e.degree)}</div><div class="c">${esc(e.institution)}${e.year?" · "+esc(e.year):""}</div></div>`).join("")}</div>`:""}<div class="foot">Generated with PathOS · this profile is the CV</div></div></body></html>`;
}
