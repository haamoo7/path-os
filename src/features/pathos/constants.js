export const PAL = {
  bg: "#b8c9bd", bgTop: "#c6d4c8", paper: "#f3eede", paperDark: "#e6dfc9",
  ink: "#3c4a43", inkSoft: "#5a6a61", terra: "#c0473a", terraDark: "#9a3a30",
  teal: "#5b8a78", tealDark: "#3f6b5b", cream: "#f4efe2", creamMid: "#e2dac4",
  creamLow: "#cabf9f", gold: "#d99a2b", goldDeep: "#3a2c00", warn: "#a96a12",
  warnBg: "#f7ebd4", gap: "#9a3a30", gapBg: "#f6e2de", good: "#3f6b5b", goodBg: "#e2ece6",
  blue: "#3a6b8a", blueBg: "#dde8ef",
};

/* ─── assessment frameworks ─── */
export const MBTI = ["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"];
export const ENNEAGRAM = ["1 · Reformer","2 · Helper","3 · Achiever","4 · Individualist","5 · Investigator","6 · Loyalist","7 · Enthusiast","8 · Challenger","9 · Peacemaker"];
export const DISC = ["D · Dominance","I · Influence","S · Steadiness","C · Conscientiousness"];
export const ENERGY = ["Morning Surge","Steady All-Day","Afternoon Peak","Night Owl","Variable / Sprint-Rest"];
export const DRIVES = ["Verify (need to know)","Authenticate (need to be true to self)","Complete (need to finish)","Improvise (need flexibility)"];
export const CLIFTON = ["Achiever","Activator","Analytical","Arranger","Communication","Competition","Connectedness","Deliberative","Developer","Discipline","Empathy","Focus","Futuristic","Harmony","Ideation","Includer","Individualization","Input","Intellection","Learner","Maximizer","Positivity","Relator","Responsibility","Significance","Strategic","Woo"];
export const VIA = ["Creativity","Curiosity","Judgment","Love of Learning","Perspective","Bravery","Perseverance","Honesty","Zest","Love","Kindness","Social Intelligence","Teamwork","Fairness","Leadership","Forgiveness","Humility","Prudence","Self-Regulation","Gratitude","Hope","Humor","Spirituality"];
export const ASSESS_DEFS = [
  { key:"mbti", icon:"🧭", name:"16 Personalities", sub:"Type preference", kind:"single", opts:MBTI },
  { key:"energy", icon:"⚡", name:"The Energy Rhythm", sub:"When you perform best", kind:"single", opts:ENERGY },
  { key:"enneagram", icon:"🔵", name:"Enneagram", sub:"Core motivation", kind:"single", opts:ENNEAGRAM },
  { key:"disc", icon:"🟥", name:"DISC", sub:"Behavioural style", kind:"single", opts:DISC },
  { key:"drives", icon:"🧬", name:"Instinctive Drives", sub:"Cultural fit", kind:"multi", opts:DRIVES, max:2 },
  { key:"clifton", icon:"💪", name:"CliftonStrengths", sub:"Top 5 themes", kind:"multi", opts:CLIFTON, max:5 },
  { key:"via", icon:"🌟", name:"VIA Character Strengths", sub:"Top strengths", kind:"multi", opts:VIA, max:5 },
];

/* ─── shared mock data ─── */
export const JOBS_SEED = [
  { id:"j1", title:"Creative Strategy Lead", company:"Hatch & Co (Agency)", location:"Kuala Lumpur", level:"Senior", salary:"RM 9–12k", skills:["Brand strategy","Client management","Team leadership","Pitching"], by:"company" },
  { id:"j2", title:"Account Director", company:"Ember Creative", location:"Petaling Jaya", level:"Senior", salary:"RM 8–11k", skills:["Account management","Budgeting","Client relationships"], by:"company" },
  { id:"j3", title:"Head of Growth", company:"Tinta Studio", location:"Remote (MY)", level:"Lead", salary:"RM 12–16k", skills:["Growth","P&L","Leadership","Marketing"], by:"company" },
  { id:"j4", title:"Brand Manager", company:"Nusantara Foods", location:"Shah Alam", level:"Mid", salary:"RM 6–8k", skills:["Brand strategy","Campaigns","Analytics"], by:"company" },
  { id:"j5", title:"Studio Operations Manager", company:"Kanvas Agency", location:"Penang", level:"Mid", salary:"RM 7–9k", skills:["Operations","Team leadership","Finance"], by:"company" },
];
export const CANDIDATE_POOL = [
  { id:"c1", name:"Aisyah Rahman", headline:"Senior Brand Strategist", location:"KL", readiness:78, target:"Creative Director", skills:["Brand strategy","Copywriting","Client management"], open:true },
  { id:"c2", name:"Daniel Tan", headline:"Account Manager", location:"PJ", readiness:64, target:"Account Director", skills:["Account management","Budgeting","Pitching"], open:true },
  { id:"c3", name:"Priya Nair", headline:"Marketing Lead", location:"Penang", readiness:71, target:"Head of Growth", skills:["Growth","Analytics","Leadership"], open:false },
  { id:"c4", name:"Wei Jie Lim", headline:"Operations Exec", location:"KL", readiness:52, target:"Ops Manager", skills:["Operations","Finance","Process"], open:true },
];
export const STAFF = [
  { id:"s1", name:"Sarah Lee", role:"Creative Director", dept:"Creative", disc:"I", energy:"Morning Surge", top:"Strategic" },
  { id:"s2", name:"Arif Hassan", role:"Account Director", dept:"Accounts", disc:"D", energy:"Steady All-Day", top:"Achiever" },
  { id:"s3", name:"Mei Ling", role:"Senior Designer", dept:"Creative", disc:"S", energy:"Afternoon Peak", top:"Ideation" },
  { id:"s4", name:"Kumar Raj", role:"Finance Manager", dept:"Ops", disc:"C", energy:"Morning Surge", top:"Deliberative" },
  { id:"s5", name:"Nadia Omar", role:"Growth Lead", dept:"Marketing", disc:"I", energy:"Variable / Sprint-Rest", top:"Activator" },
  { id:"s6", name:"James Wong", role:"Project Manager", dept:"Ops", disc:"C", energy:"Steady All-Day", top:"Responsibility" },
];
export const APPLICANTS_SEED = [
  { id:"a1", name:"Daniel Tan", role:"Account Director", stage:"Reviewed", match:82, applied:"3 days ago" },
  { id:"a2", name:"Farah Idris", role:"Brand Manager", stage:"Interview", match:74, applied:"1 week ago" },
  { id:"a3", name:"Leong Ka Wai", role:"Studio Operations Manager", stage:"Applied", match:69, applied:"yesterday" },
  { id:"a4", name:"Siti Aminah", role:"Creative Strategy Lead", stage:"Offer", match:88, applied:"2 weeks ago" },
];
export const GRADUATES = [
  { id:"g1", name:"Tan Mei Xin", program:"BBA Marketing", year:2023, status:"Employed", employer:"Hatch & Co", role:"Brand Executive", skills:["Marketing","Analytics"] },
  { id:"g2", name:"Rajesh Kumar", program:"BBA Marketing", year:2023, status:"Employed", employer:"Nusantara Foods", role:"Account Exec", skills:["Account management"] },
  { id:"g3", name:"Nurul Huda", program:"BSc Computer Science", year:2024, status:"Seeking", employer:"", role:"", skills:["Python","Data"] },
  { id:"g4", name:"Brandon Lee", program:"BBA Marketing", year:2024, status:"Further study", employer:"", role:"MBA candidate", skills:["Strategy"] },
  { id:"g5", name:"Aishah Zainal", program:"BSc Computer Science", year:2023, status:"Employed", employer:"Tinta Studio", role:"Frontend Dev", skills:["React","UI"] },
  { id:"g6", name:"Kevin Ng", program:"BSc Computer Science", year:2024, status:"Employed", employer:"GrabTech", role:"Data Analyst", skills:["SQL","Python","Viz"] },
  { id:"g7", name:"Farah Idris", program:"BBA Marketing", year:2024, status:"Employed", employer:"Ember Creative", role:"Brand Manager", skills:["Brand","Campaigns"] },
  { id:"g8", name:"Lim Wei", program:"BBA Marketing", year:2023, status:"Seeking", employer:"", role:"", skills:["Sales"] },
];
export const PROGRAMS = [
  { name:"BBA Marketing", skills:["Brand strategy","Consumer behaviour","Analytics","Campaign management","Market research","Communication"] },
  { name:"BSc Computer Science", skills:["Programming","Data structures","Databases","Web development","Machine learning basics","Software engineering"] },
];
export const APP_STATUSES = ["Draft","Applied","Reviewed","Interview","Offer","Rejected"];
export const STATUS_COLOR = { Draft:PAL.inkSoft, Applied:PAL.blue, Reviewed:PAL.gold, Interview:PAL.teal, Offer:PAL.good, Rejected:PAL.gap };
export const APPS_SEED = [
  { id:"ap1", title:"Brand Manager", company:"Nusantara Foods", status:"Reviewed", date:"2026-05-20", notes:"Recruiter viewed profile." },
  { id:"ap2", title:"Account Director", company:"Ember Creative", status:"Interview", date:"2026-05-12", notes:"1st round on 6 Jun, 3pm." },
];
