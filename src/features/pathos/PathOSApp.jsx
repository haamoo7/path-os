import { useEffect, useMemo, useRef, useState } from "react";
import {
  APPLICANTS_SEED,
  APP_STATUSES,
  APPS_SEED,
  ASSESS_DEFS,
  CANDIDATE_POOL,
  GRADUATES,
  JOBS_SEED,
  PAL,
  PROGRAMS,
  STAFF,
  STATUS_COLOR,
} from "./constants";
import {
  ASSESS_SYS,
  DEEPSEEK_UNSUPPORTED_UPLOAD,
  PROFILE_SYS,
  SYS,
  buildProfileHTML,
  createDeepSeekMessage,
  parseJSON,
} from "./ai";
import { Bars, Donut, St } from "./charts.jsx";
import { LANDMARKS, Landmark, Tree, layoutNodes, mulberry, segPath, slug } from "./journey.jsx";
import PostJobForm from "./components/PostJobForm.jsx";
import { PATHOS_CSS } from "./styles.js";
import { neonConfigError, neonEnabled } from "../../lib/neon";
import {
  fetchAccountProfile,
  getSessionBundle,
  signInWithEmail,
  signInWithGoogle,
  signOutAccount,
  signUpWithEmail,
  upsertAccountProfile,
} from "./neonBackend";

const DEFAULT_CURRENT_ROLE = "Commercial Manager";
const DEFAULT_TARGET_ROLE = "CEO of a Creative Agency";
const OAUTH_CONTEXT_KEY = "pathos-google-oauth-context";

const createAuthForm = () => ({
  name: "",
  email: "",
  password: "",
  organization: "",
});

const readOAuthContext = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(OAUTH_CONTEXT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeOAuthContext = (context) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(OAUTH_CONTEXT_KEY, JSON.stringify(context));
};

const clearOAuthContext = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(OAUTH_CONTEXT_KEY);
};

const normalizeWorkspace = (workspace = {}) => ({
  currentRole: typeof workspace.currentRole === "string" && workspace.currentRole.trim() ? workspace.currentRole : DEFAULT_CURRENT_ROLE,
  experience: typeof workspace.experience === "string" ? workspace.experience : "",
  education: typeof workspace.education === "string" ? workspace.education : "",
  skills: Array.isArray(workspace.skills) ? workspace.skills : [],
  targetRole: typeof workspace.targetRole === "string" && workspace.targetRole.trim() ? workspace.targetRole : DEFAULT_TARGET_ROLE,
  targetIndustry: typeof workspace.targetIndustry === "string" ? workspace.targetIndustry : "",
  data: workspace.data || null,
  done: Array.isArray(workspace.done) ? workspace.done : [],
  profile: workspace.profile || null,
  openToWork: typeof workspace.openToWork === "boolean" ? workspace.openToWork : true,
  assess: workspace.assess && typeof workspace.assess === "object" ? workspace.assess : {},
  assessOut: workspace.assessOut || null,
  apps: Array.isArray(workspace.apps) ? workspace.apps : APPS_SEED,
  appView: workspace.appView === "one" ? "one" : "all",
  appSel: typeof workspace.appSel === "string" ? workspace.appSel : null,
  view: typeof workspace.view === "string" ? workspace.view : "profile",
  cView: typeof workspace.cView === "string" ? workspace.cView : "dashboard",
  uView: typeof workspace.uView === "string" ? workspace.uView : "graduates",
  postedJobs: Array.isArray(workspace.postedJobs) ? workspace.postedJobs : JOBS_SEED,
  hhFilter: typeof workspace.hhFilter === "string" ? workspace.hhFilter : "",
  applicants: Array.isArray(workspace.applicants) ? workspace.applicants : APPLICANTS_SEED,
});

export default function PathOSApp() {
  const [role, setRole] = useState(null); // null | seeker | company | university
  const [loginRole, setLoginRole] = useState(null);
  const [authReady, setAuthReady] = useState(!neonEnabled);
  const [authMode, setAuthMode] = useState("signin");
  const [authForm, setAuthForm] = useState(createAuthForm());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const [sessionBundle, setSessionBundle] = useState(null);
  const [accountName, setAccountName] = useState("");
  const [accountOrg, setAccountOrg] = useState("");
  const saveResetRef = useRef(null);
  const lastPersistedRef = useRef("");

  // seeker — inputs
  const [currentRole, setCurrentRole] = useState(DEFAULT_CURRENT_ROLE);
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [targetRole, setTargetRole] = useState(DEFAULT_TARGET_ROLE);
  const [targetIndustry, setTargetIndustry] = useState("");
  // seeker — analysis lifecycle
  const [status, setStatus] = useState("idle");
  const [stream, setStream] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(new Set());
  const [editPath, setEditPath] = useState(false);
  // seeker — profile
  const [profile, setProfile] = useState(null);
  const [parseStatus, setParseStatus] = useState("idle");
  const [parseError, setParseError] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [shareMsg, setShareMsg] = useState("");
  const [openToWork, setOpenToWork] = useState(true);
  const fileRef = useRef(null);
  // seeker — assessments
  const [assess, setAssess] = useState({});
  const [assessOut, setAssessOut] = useState(null);
  const [assessLoading, setAssessLoading] = useState(false);
  // seeker — jobs + applications
  const [apps, setApps] = useState(APPS_SEED);
  const [appView, setAppView] = useState("all"); // all | one
  const [appSel, setAppSel] = useState(null);
  // shell views
  const [view, setView] = useState("profile");          // seeker
  const [cView, setCView] = useState("dashboard");        // company
  const [uView, setUView] = useState("graduates");        // university
  const [postedJobs, setPostedJobs] = useState(JOBS_SEED);
  const [hhFilter, setHhFilter] = useState("");
  const [applicants, setApplicants] = useState(APPLICANTS_SEED);

  const streamEnd = useRef(null);
  useEffect(() => { streamEnd.current?.scrollTo(0, 9e9); }, [stream]);

  const workspaceSnapshot = useMemo(
    () => normalizeWorkspace({
      currentRole,
      experience,
      education,
      skills,
      targetRole,
      targetIndustry,
      data,
      done: Array.from(done),
      profile,
      openToWork,
      assess,
      assessOut,
      apps,
      appView,
      appSel,
      view,
      cView,
      uView,
      postedJobs,
      hhFilter,
      applicants,
    }),
    [
      currentRole,
      experience,
      education,
      skills,
      targetRole,
      targetIndustry,
      data,
      done,
      profile,
      openToWork,
      assess,
      assessOut,
      apps,
      appView,
      appSel,
      view,
      cView,
      uView,
      postedJobs,
      hhFilter,
      applicants,
    ]
  );

  const persistableAccount = useMemo(() => {
    if (!sessionBundle?.user?.id || !role) {
      return null;
    }

    return {
      user_id: sessionBundle.user.id,
      email: sessionBundle.user.email || "",
      full_name:
        accountName.trim() ||
        sessionBundle.user.name ||
        sessionBundle.user.email?.split("@")[0] ||
        "PathOS user",
      app_role: role,
      organization: accountOrg.trim() || null,
      workspace: workspaceSnapshot,
    };
  }, [accountName, accountOrg, role, sessionBundle, workspaceSnapshot]);

  const resetWorkspace = () => {
    const defaults = normalizeWorkspace();
    setRole(null);
    setLoginRole(null);
    setCurrentRole(defaults.currentRole);
    setExperience(defaults.experience);
    setEducation(defaults.education);
    setSkills(defaults.skills);
    setSkillInput("");
    setTargetRole(defaults.targetRole);
    setTargetIndustry(defaults.targetIndustry);
    setStatus("idle");
    setStream("");
    setData(defaults.data);
    setError("");
    setSelected(null);
    setDone(new Set(defaults.done));
    setEditPath(false);
    setProfile(defaults.profile);
    setParseStatus("idle");
    setParseError("");
    setPasteText("");
    setShareMsg("");
    setOpenToWork(defaults.openToWork);
    setAssess(defaults.assess);
    setAssessOut(defaults.assessOut);
    setAssessLoading(false);
    setApps(defaults.apps);
    setAppView(defaults.appView);
    setAppSel(defaults.appSel);
    setView(defaults.view);
    setCView(defaults.cView);
    setUView(defaults.uView);
    setPostedJobs(defaults.postedJobs);
    setHhFilter(defaults.hhFilter);
    setApplicants(defaults.applicants);
  };

  const applyAccountProfile = (account, nextSessionBundle) => {
    const normalized = normalizeWorkspace(account?.workspace);
    const nextRole = account?.app_role || loginRole || "seeker";

    setSessionBundle(nextSessionBundle);
    setRole(nextRole);
    setLoginRole(null);
    setAccountName(
      account?.full_name ||
      nextSessionBundle?.user?.name ||
      nextSessionBundle?.user?.email?.split("@")[0] ||
      ""
    );
    setAccountOrg(account?.organization || "");
    setCurrentRole(normalized.currentRole);
    setExperience(normalized.experience);
    setEducation(normalized.education);
    setSkills(normalized.skills);
    setSkillInput("");
    setTargetRole(normalized.targetRole);
    setTargetIndustry(normalized.targetIndustry);
    setStatus("idle");
    setStream("");
    setData(normalized.data);
    setError("");
    setSelected(null);
    setDone(new Set(normalized.done));
    setEditPath(false);
    setProfile(normalized.profile);
    setParseStatus("idle");
    setParseError("");
    setPasteText("");
    setShareMsg("");
    setOpenToWork(normalized.openToWork);
    setAssess(normalized.assess);
    setAssessOut(normalized.assessOut);
    setAssessLoading(false);
    setApps(normalized.apps);
    setAppView(normalized.appView);
    setAppSel(normalized.appSel);
    setView(normalized.view);
    setCView(normalized.cView);
    setUView(normalized.uView);
    setPostedJobs(normalized.postedJobs);
    setHhFilter(normalized.hhFilter);
    setApplicants(normalized.applicants);

    lastPersistedRef.current = JSON.stringify({
      user_id: nextSessionBundle?.user?.id || "",
      email: nextSessionBundle?.user?.email || "",
      full_name:
        account?.full_name ||
        nextSessionBundle?.user?.name ||
        nextSessionBundle?.user?.email?.split("@")[0] ||
        "PathOS user",
      app_role: nextRole,
      organization: account?.organization || null,
      workspace: normalized,
    });
  };

  const hydrateAccount = async (nextSessionBundle, hints = {}) => {
    const existingAccount = await fetchAccountProfile(nextSessionBundle.user.id);
    const account = existingAccount || {
      user_id: nextSessionBundle.user.id,
      email: nextSessionBundle.user.email || "",
      full_name:
        hints.name ||
        nextSessionBundle.user.name ||
        nextSessionBundle.user.email?.split("@")[0] ||
        "PathOS user",
      app_role: hints.role || loginRole || "seeker",
      organization: hints.organization || null,
      workspace: normalizeWorkspace(),
    };

    if (!existingAccount) {
      await upsertAccountProfile(account);
    }

    applyAccountProfile(account, nextSessionBundle);
  };

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      if (!neonEnabled) {
        setAuthReady(true);
        return;
      }

      try {
        const oauthContext = readOAuthContext();
        const nextSessionBundle = await getSessionBundle();
        if (cancelled) {
          return;
        }

        if (!nextSessionBundle) {
          resetWorkspace();
          setSessionBundle(null);
          setAuthReady(true);
          return;
        }

        await hydrateAccount(nextSessionBundle, oauthContext || {});
        if (!cancelled) {
          clearOAuthContext();
          setAuthReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setAuthError(err.message);
          setAuthReady(true);
        }
      }
    };

    loadSession();

    return () => {
      cancelled = true;
      if (saveResetRef.current) {
        clearTimeout(saveResetRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!persistableAccount || !neonEnabled || !authReady) {
      return undefined;
    }

    const serialized = JSON.stringify(persistableAccount);
    if (serialized === lastPersistedRef.current) {
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        setSaveState("saving");
        await upsertAccountProfile(persistableAccount);
        lastPersistedRef.current = serialized;
        setSaveState("saved");

        if (saveResetRef.current) {
          clearTimeout(saveResetRef.current);
        }

        saveResetRef.current = setTimeout(() => setSaveState("idle"), 1600);
      } catch (err) {
        setSaveState("error");
        setAuthError(err.message);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [authReady, persistableAccount]);

  const updateAuthForm = (field, value) => {
    setAuthForm((current) => ({ ...current, [field]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");

    if (!neonEnabled) {
      setAuthError(neonConfigError);
      return;
    }

    if (!authForm.email.trim() || !authForm.password.trim()) {
      setAuthError("Email and password are required.");
      return;
    }

    if (authMode === "signup" && !loginRole) {
      setAuthError("Choose whether this account is for a job seeker, company, or university first.");
      return;
    }

    if (authMode === "signup" && !authForm.name.trim()) {
      setAuthError("Add a name before creating your account.");
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === "signup") {
        await signUpWithEmail({
          email: authForm.email.trim(),
          password: authForm.password,
          name: authForm.name.trim(),
        });
      } else {
        await signInWithEmail({
          email: authForm.email.trim(),
          password: authForm.password,
        });
      }

      const nextSessionBundle = await getSessionBundle();
      if (!nextSessionBundle) {
        throw new Error(
          authMode === "signup"
            ? "Account created, but Neon did not return a session. If email verification is enabled, verify the account and sign in again."
            : "Signed in, but no session was returned."
        );
      }

      await hydrateAccount(nextSessionBundle, {
        name: authForm.name.trim(),
        organization: authForm.organization.trim(),
        role: loginRole || role || "seeker",
      });

      setAuthForm(createAuthForm());
      setAuthMode("signin");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
      setAuthReady(true);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError("");

    if (!neonEnabled) {
      setAuthError(neonConfigError);
      return;
    }

    if (!loginRole) {
      setAuthError("Choose whether this account is for a job seeker, company, or university first.");
      return;
    }

    setAuthLoading(true);

    try {
      writeOAuthContext({
        role: loginRole || role || "seeker",
        name: authForm.name.trim(),
        organization: authForm.organization.trim(),
      });

      await signInWithGoogle({
        callbackURL: `${window.location.origin}${window.location.pathname}`,
      });
    } catch (err) {
      setAuthError(err.message);
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (neonEnabled) {
        await signOutAccount();
      }
    } catch (err) {
      setAuthError(err.message);
    }

    if (saveResetRef.current) {
      clearTimeout(saveResetRef.current);
    }

    lastPersistedRef.current = "";
    clearOAuthContext();
    setSaveState("idle");
    setSessionBundle(null);
    setAccountName("");
    setAccountOrg("");
    setAuthMode("signin");
    setAuthForm(createAuthForm());
    resetWorkspace();
    setAuthReady(true);
  };

  const addSkill = () => { const s = skillInput.trim(); if (s && !skills.includes(s)) setSkills(p => [...p, s]); setSkillInput(""); };
  const removeSkill = (s) => setSkills(p => p.filter(x => x !== s));

  const W = 760;
  const milestones = data?.milestones || [];
  const totalNodes = milestones.length + 2;
  const { nodes, height } = layoutNodes(totalNodes, W);

  /* resume parse */
  const parseResume = async (file) => {
    setParseStatus("parsing"); setParseError("");
    try {
      let content;
      if (file) {
        if (file.type === "application/pdf" || file.type.startsWith("image/")) throw new Error(DEEPSEEK_UNSUPPORTED_UPLOAD);
        const t = await file.text();
        content = `Extract my professional profile from this resume:\n\n${t}`;
      } else { content = `Extract my professional profile from this resume:\n\n${pasteText}`; }
      const res = await createDeepSeekMessage({ max_tokens:3000, system:PROFILE_SYS, messages:[{ role:"user", content }] });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error?.message || "Parse error");
      const txt = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      const p = parseJSON(txt);
      if (!p) throw new Error("Couldn't read that file. Try pasting your resume text instead.");
      setProfile(p);
      if (p.headline) setCurrentRole(p.headline);
      if (p.skills?.length) setSkills(p.skills.slice(0, 12));
      if (p.experience?.length) setExperience(p.experience.map(e => `${e.role} at ${e.company}${e.period ? ` (${e.period})` : ""}`).join("; "));
      if (p.education?.length) setEducation(`${p.education[0].degree}, ${p.education[0].institution}${p.education[0].year ? ", " + p.education[0].year : ""}`);
      setParseStatus("idle");
    } catch (e) { setParseError(e.message); setParseStatus("error"); }
  };
  const onFile = (e) => { const f = e.target.files?.[0]; if (f) parseResume(f); };

  /* analysis */
  const generate = async () => {
    if (!currentRole.trim() || !targetRole.trim()) return;
    setStatus("loading"); setStream(""); setData(null); setError(""); setSelected(null); setDone(new Set()); setView("analysis");
    const msg = `Current role: ${currentRole}\nExperience: ${experience || "not specified"}\nEducation: ${education || "not specified"}\nSkills: ${skills.length ? skills.join(", ") : "not specified"}\nTarget role: ${targetRole}\nTarget industry: ${targetIndustry || "not specified"}\n\nProduce the full analysis and illustrated journey.`;
    try {
      const res = await createDeepSeekMessage({ max_tokens:5000, stream:true, system:SYS, messages:[{ role:"user", content:msg }] });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || "API error"); }
      const reader = res.body.getReader(), dec = new TextDecoder(); let acc = "";
      while (true) { const { done:d, value } = await reader.read(); if (d) break;
        for (const line of dec.decode(value, { stream:true }).split("\n")) { if (!line.startsWith("data: ")) continue; const b = line.slice(6); if (b === "[DONE]") continue; try { const j = JSON.parse(b); if (j.type === "content_block_delta" && j.delta?.text) { acc += j.delta.text; setStream(acc); } } catch {} } }
      const parsed = parseJSON(acc);
      if (parsed?.milestones?.length) { setData(parsed); setStatus("done"); }
      else { setError("Couldn't parse the result. Raw: " + acc.slice(0, 240)); setStatus("error"); }
    } catch (e) { setError(e.message); setStatus("error"); }
  };

  const toggleDone = (i) => setDone(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const reached = (nodeIdx) => nodeIdx === 0 ? true : nodeIdx === totalNodes - 1 ? done.size === milestones.length : done.has(nodeIdx - 1);
  const gapAddressed = (gapName) => milestones.some((m, i) => done.has(i) && m.gap_closed && (m.gap_closed.toLowerCase().includes(gapName.toLowerCase()) || gapName.toLowerCase().includes(m.gap_closed.toLowerCase())));
  const baseScore = data?.readiness_score ?? 0;
  const liveReadiness = milestones.length ? Math.min(100, Math.round(baseScore + (100 - baseScore) * (done.size / milestones.length))) : baseScore;
  const pct = milestones.length ? Math.round((done.size / milestones.length) * 100) : 0;
  const xp = done.size * 150;
  const allDone = milestones.length > 0 && done.size === milestones.length;
  const readColor = (s) => s >= 65 ? PAL.good : s >= 35 ? PAL.gold : PAL.terra;

  const rand = mulberry(Math.round(height)); const scenery = [];
  for (let i = 0; i < Math.floor(height / 90); i++) { const side = rand() > .5 ? 1 : -1; scenery.push({ x: W / 2 + side * (W * .32 + rand() * W * .14), y: 80 + rand() * (height - 120), s: .7 + rand() * .7 }); }
  const sel = selected != null ? milestones[selected] : null;

  /* editable pathway ops */
  const updateMilestone = (i, field, val) => setData(d => { const ms = d.milestones.map((m, k) => k === i ? { ...m, [field]: val } : m); return { ...d, milestones: ms }; });
  const removeMilestone = (i) => setData(d => ({ ...d, milestones: d.milestones.filter((_, k) => k !== i) }));
  const addMilestone = () => setData(d => ({ ...d, milestones: [...d.milestones, { name:"New milestone", scene_type:"office", action:"Describe the action", detail:"", timeline:"1-2 months", skill_unlocked:"", gap_closed:"", cert:"" }] }));

  /* profile badges */
  const skillsList = profile?.skills?.length ? profile.skills : skills;
  const certBadges = profile?.certificates || [];
  const earnedJourneyBadges = milestones.filter((_, i) => done.has(i)).map(m => ({ title: m.skill_unlocked || m.name, story: `Earned at "${m.name}" on your journey.`, metric:"Journey milestone" }));
  const achievementBadges = [...(profile?.achievements || []), ...earnedJourneyBadges];
  const recCertBadges = data?.cert_recommendations || [];
  const expList = profile?.experience || [];
  const eduList = profile?.education || [];
  const shareLink = profile ? `https://pathos.app/p/${slug(profile.name)}` : "";
  const copyLink = async () => { try { await navigator.clipboard.writeText(shareLink); } catch {} setShareMsg("Link copied to clipboard!"); setTimeout(() => setShareMsg(""), 1900); };
  const exportCV = () => { if (!profile) return; const html = buildProfileHTML(profile, certBadges, achievementBadges, skillsList, expList, eduList); const blob = new Blob([html], { type:"text/html" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${slug(profile.name)}-pathos-cv.html`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); };

  /* assessments */
  const setAssessVal = (key, val) => setAssess(p => ({ ...p, [key]: val }));
  const toggleMulti = (key, opt, max) => setAssess(p => { const cur = p[key] || []; if (cur.includes(opt)) return { ...p, [key]: cur.filter(x => x !== opt) }; if (cur.length >= max) return p; return { ...p, [key]: [...cur, opt] }; });
  const synthAssess = async () => {
    setAssessLoading(true); setAssessOut(null);
    const summary = ASSESS_DEFS.map(d => { const v = assess[d.key]; if (!v || (Array.isArray(v) && !v.length)) return null; return `${d.name}: ${Array.isArray(v) ? v.join(", ") : v}`; }).filter(Boolean).join("\n");
    try {
      const res = await createDeepSeekMessage({ max_tokens:1200, system:ASSESS_SYS, messages:[{ role:"user", content:`My assessment results:\n${summary}\n\nMy target role: ${targetRole}. Synthesize my holistic profile.` }] });
      const j = await res.json(); const txt = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      setAssessOut(parseJSON(txt) || { summary: txt });
    } catch (e) { setAssessOut({ summary:"Couldn't synthesize: " + e.message }); }
    setAssessLoading(false);
  };
  const assessCount = ASSESS_DEFS.filter(d => { const v = assess[d.key]; return v && (!Array.isArray(v) || v.length); }).length;

  /* jobs alignment */
  const jobMatch = (job) => { const want = new Set([...(skillsList || []), ...(milestones.map(m => m.skill_unlocked) || [])].map(s => (s || "").toLowerCase())); const hit = job.skills.filter(s => [...want].some(w => w && (w.includes(s.toLowerCase()) || s.toLowerCase().includes(w)))).length; const tgt = (targetRole || "").toLowerCase(); const roleBonus = job.title.toLowerCase().split(" ").some(w => w.length > 3 && tgt.includes(w)) ? 25 : 0; return Math.min(99, 40 + hit * 14 + roleBonus); };
  const applyToJob = (job) => { if (apps.some(a => a.title === job.title && a.company === job.company)) { setView("applications"); return; } const na = { id:"u"+Date.now(), title:job.title, company:job.company, status:"Applied", date:new Date().toISOString().slice(0,10), notes:"Applied via PathOS." }; setApps(p => [na, ...p]); setApplicants(p => [{ id:"x"+Date.now(), name: profile?.name || "You (PathOS user)", role: job.title, stage:"Applied", match: jobMatch(job), applied:"just now" }, ...p]); setView("applications"); };
  const setAppStatus = (id, st) => setApps(p => p.map(a => a.id === id ? { ...a, status: st } : a));

  /* ── role landing / login ── */
  if (!authReady) {
    return (<><style>{PATHOS_CSS}</style><div className="px"><div className="px-state"><div className="px-spin"/><h3>Connecting your account…</h3><p>Checking Neon authentication and loading your saved PathOS workspace.</p></div></div></>);
  }

  if (!role) {
    return (<><style>{PATHOS_CSS}</style><div className="px">
      <div className="px-head"><div className="px-logo">PathOS<span>Career Intelligence</span></div><div className="px-tagline" style={{fontSize:12,color:PAL.tealDark}}>One platform · three roles</div></div>
      {!loginRole ? (
        <div className="px-login">
          <h1>Welcome to PathOS</h1>
          <p className="sub">Choose the workspace you want to connect to Neon. Each account keeps its own saved data and authentication session.</p>
          <div className="px-roles">
            <div className="px-role" onClick={() => { setLoginRole("seeker"); setAuthMode("signup"); setAuthError(""); }}><div className="ic">🧭</div><h3>Job Seeker</h3><p>Build a living profile, map your path to any role, track applications, and find aligned jobs.</p><div className="go">Use seeker account →</div></div>
            <div className="px-role" onClick={() => { setLoginRole("company"); setAuthMode("signup"); setAuthError(""); }}><div className="ic">🏢</div><h3>Company</h3><p>Post jobs, headhunt candidates before they apply, run team assessments, and manage your hiring pipeline.</p><div className="go">Use company account →</div></div>
            <div className="px-role" onClick={() => { setLoginRole("university"); setAuthMode("signup"); setAuthError(""); }}><div className="ic">🎓</div><h3>University</h3><p>Track graduate outcomes, map syllabus skills, and see employment analytics across batches.</p><div className="go">Use university account →</div></div>
          </div>
        </div>
      ) : (
        <div className="px-signin"><form className="card" onSubmit={handleAuthSubmit}>
          <div className="ic">{loginRole === "seeker" ? "🧭" : loginRole === "company" ? "🏢" : "🎓"}</div>
          <h2>{authMode === "signup" ? "Create your PathOS account" : "Sign in to PathOS"}</h2>
          <p className="px-role-note">Workspace: {loginRole === "seeker" ? "Job Seeker" : loginRole === "company" ? "Company" : "University"}</p>
          {!neonEnabled && <div className="px-alert warn">{neonConfigError}</div>}
          {authError && <div className="px-alert">{authError}</div>}
          {authMode === "signup" && (
            <>
              <div className="px-field"><label>Full name</label><input value={authForm.name} onChange={(e) => updateAuthForm("name", e.target.value)} placeholder={loginRole === "company" ? "Hiring manager name" : loginRole === "university" ? "Programme lead name" : "Your full name"} /></div>
              <div className="px-field"><label>Organisation {loginRole === "seeker" ? "(optional)" : ""}</label><input value={authForm.organization} onChange={(e) => updateAuthForm("organization", e.target.value)} placeholder={loginRole === "company" ? "e.g. Hatch & Co" : loginRole === "university" ? "e.g. Universiti Malaya" : "Current employer"} /></div>
            </>
          )}
          <div className="px-field"><label>{loginRole === "company" ? "Work email" : loginRole === "university" ? "Institution email" : "Email"}</label><input type="email" value={authForm.email} onChange={(e) => updateAuthForm("email", e.target.value)} placeholder={loginRole === "company" ? "you@company.com" : loginRole === "university" ? "you@university.edu" : "you@email.com"} autoComplete="email" /></div>
          <div className="px-field"><label>Password</label><input type="password" value={authForm.password} onChange={(e) => updateAuthForm("password", e.target.value)} placeholder="Use at least 8 characters" autoComplete={authMode === "signup" ? "new-password" : "current-password"} /></div>
          <button className="px-go" type="submit" disabled={authLoading || !neonEnabled}>{authLoading ? "Connecting…" : authMode === "signup" ? "Create account & continue →" : "Sign in & load workspace →"}</button>
          <button className="px-google-btn" type="button" onClick={handleGoogleAuth} disabled={authLoading || !neonEnabled}>
            <span className="px-google-mark" aria-hidden="true">
              <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2087 1.125-.8427 2.0782-1.7968 2.7164v2.2582h2.9086c1.7018-1.5664 2.6846-3.8741 2.6846-6.6155z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1791l-2.9086-2.2582c-.8064.54-1.8377.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.0373-3.7091H.9573v2.3291C2.4382 15.9832 5.4818 18 9 18z"/>
                <path fill="#FBBC05" d="M3.9627 10.7127C3.7827 10.1727 3.6818 9.5959 3.6818 9s.1009-1.1727.2809-1.7127V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418l3.0054-2.3291z"/>
                <path fill="#EA4335" d="M9 3.5782c1.3214 0 2.5077.4541 3.4405 1.3459l2.5809-2.5809C13.4632.8918 11.43 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582l3.0054 2.3291C4.6718 5.1614 6.6559 3.5782 9 3.5782z"/>
              </svg>
            </span>
            <span className="px-google-text">{authLoading ? "Opening Google..." : "Continue with Google"}</span>
          </button>
          <button className="px-pill-btn" type="button" style={{ width:"100%", marginTop:10 }} onClick={() => { setLoginRole(null); setAuthError(""); setAuthForm(createAuthForm()); }}>← Back</button>
          <p className="px-auth-switch">{authMode === "signup" ? "Already have an account?" : "Need a new account?"} <button type="button" className="px-linkbtn" onClick={() => { setAuthMode((mode) => mode === "signup" ? "signin" : "signup"); setAuthError(""); }}>{authMode === "signup" ? "Sign in" : "Create one"}</button></p>
        </form></div>
      )}
    </div></>);
  }

  const roleLabel = role === "seeker" ? "Job Seeker" : role === "company" ? "Company" : "University";
  const Header = (
    <div className="px-head">
      <div className="px-logo">PathOS<span>{roleLabel}</span></div>
      <div className="px-rolechip">
        <span>{sessionBundle?.user?.email || `Signed in as ${roleLabel}`}</span>
        {saveState === "saving" && <span className="px-chipmini">Saving…</span>}
        {saveState === "saved" && <span className="px-chipmini ok">Saved</span>}
        {saveState === "error" && <span className="px-chipmini err">Retrying</span>}
        <button onClick={handleSignOut}>Sign out</button>
      </div>
    </div>
  );

  /* ════════ SEEKER ════════ */
  if (role === "seeker") {
    return (<><style>{PATHOS_CSS}</style><div className="px">
      {Header}
      <div className="px-nav">
        <div className="px-nav-title">{data?.journey_title || (profile ? profile.name : "Workspace")}</div>
        <div className="px-tabs">
          {[["profile","📇 Profile"],["assessments","🧠 Assessments"],["analysis","📋 Analysis"],["journey","🗺️ Journey"],["jobs","💼 Jobs"],["applications","📨 Applications"]].map(([k,l]) => (
            <button key={k} className={`px-tab ${view===k?"on":""}`} onClick={() => setView(k)}>{l}</button>
          ))}
        </div>
        {data && <div className="px-readpill" title="Rises as you complete milestones">Ready <b style={{color:readColor(liveReadiness)}}>{liveReadiness}%</b><span className="dotbar"><i style={{width:liveReadiness+"%",background:readColor(liveReadiness)}}/></span></div>}
      </div>

      {/* PROFILE */}
      {view === "profile" && (
        <div className="px-wrap">
          {!profile && parseStatus !== "parsing" && (<>
            <div className="px-intro"><h1>Your profile is your CV</h1><p className="sub">Upload a text resume or paste your resume text and PathOS builds a living profile automatically — certificates become skill badges, achievements become success-story badges. Share it as a link for any job application.</p></div>
            <div className="px-up"><div className="ic">📄</div><h3>Upload your resume / CV</h3><p>Text file or pasted text. PathOS reads it and captures everything into your profile.</p>
              <input ref={fileRef} type="file" accept=".txt,.md" style={{display:"none"}} onChange={onFile} />
              <button className="px-up-btn" onClick={() => fileRef.current?.click()}>Choose file to upload</button>
              {parseStatus === "error" && <p style={{color:PAL.terra,marginTop:12}}>{parseError}</p>}
              <div className="px-or">— or paste your resume text —</div>
              <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} placeholder="Paste resume text here…" style={{width:"100%",minHeight:100,padding:11,border:`1.5px solid ${PAL.creamLow}`,borderRadius:8,fontFamily:"inherit",fontSize:13,lineHeight:1.5}} />
              <button className="px-go" style={{maxWidth:240,margin:"10px auto 0"}} disabled={!pasteText.trim()} onClick={() => parseResume(null)}>Build my profile ✦</button>
            </div>
          </>)}
          {parseStatus === "parsing" && <div className="px-state"><div className="px-spin"/><h3>Reading your resume…</h3><p>Extracting your experience, skills, certificates, and achievements.</p></div>}
          {profile && parseStatus !== "parsing" && (<>
            <div className="px-prof-head">
              <div className="px-prof-name">{profile.name || "Your name"}</div>
              <div className="px-prof-headline">{profile.headline}</div>
              <div className="px-prof-meta">{[profile.location, profile.email].filter(Boolean).join(" · ")}</div>
              {profile.summary && <p className="px-prof-sum">{profile.summary}</p>}
              <div className="px-prof-actions">
                <button className="px-pill-btn primary" onClick={exportCV}>⬇ Export web CV</button>
                <button className="px-pill-btn" onClick={copyLink}>🔗 Copy share link</button>
                <button className="px-pill-btn" onClick={() => { setProfile(null); setPasteText(""); setParseStatus("idle"); }}>↻ Re-upload</button>
                {status !== "loading" && <button className="px-pill-btn" onClick={generate}>📋 Run gap analysis →</button>}
                <button className="px-pill-btn" style={openToWork?{background:PAL.good,color:"#fff",borderColor:PAL.good}:{}} onClick={() => setOpenToWork(o => !o)}>{openToWork ? "🟢 Open to opportunities" : "⚪ Not open"}</button>
              </div>
              <div className="px-share"><input readOnly value={shareLink} onFocus={e => e.target.select()} /></div>
              {shareMsg && <div className="px-toast">{shareMsg}</div>}
              {openToWork && <p className="px-mini" style={{marginTop:8}}>You're visible to companies in PathOS Headhunting. They can see your headline, skills, readiness, and badges — not your contact details until you respond.</p>}
            </div>
            {skillsList.length > 0 && <div className="px-sec"><div className="px-sec-h"><span>🧩</span><b>Skills</b><span className="ct">{skillsList.length}</span></div><div className="px-sec-b"><div className="px-skchips">{skillsList.map((s,i) => <span key={i} className="px-skchip">{s}</span>)}</div></div></div>}
            {(certBadges.length > 0 || recCertBadges.length > 0) && <div className="px-sec"><div className="px-sec-h"><span>🎓</span><b>Certification badges</b><span className="ct">{certBadges.length} earned</span></div><div className="px-sec-b"><div className="px-badges">{certBadges.map((c,i) => <div key={i} className="px-badge"><div className="em">🎓</div><div><div className="bl">{c.name}</div><div className="bs">{[c.provider,c.year].filter(Boolean).join(" · ")}</div></div></div>)}{recCertBadges.map((c,i) => <div key={"r"+i} className="px-badge locked" title="Recommended by your gap analysis"><div className="em">🔒</div><div><div className="bl">{c.name}</div><div className="bs">Recommended · {c.provider}</div></div></div>)}</div></div></div>}
            {achievementBadges.length > 0 && <div className="px-sec"><div className="px-sec-h"><span>🏆</span><b>Achievement badges</b><span className="ct">{achievementBadges.length}</span></div><div className="px-sec-b"><div className="px-badges">{achievementBadges.map((a,i) => { const earned = a.metric === "Journey milestone"; return <div key={i} className={`px-badge ach ${earned?"earned":""}`}><div className="em">{earned?"✦":"🏆"}</div><div><div className="bl">{a.title}</div><div className="bs">{a.story}{a.metric && a.metric !== "Journey milestone" ? ` — ${a.metric}` : ""}</div></div></div>; })}</div></div></div>}
            {assessCount > 0 && <div className="px-sec"><div className="px-sec-h"><span>🧠</span><b>Holistic profile</b><span className="ct">{assessCount}/7</span></div><div className="px-sec-b"><div className="px-skchips">{ASSESS_DEFS.map(d => { const v = assess[d.key]; if (!v || (Array.isArray(v) && !v.length)) return null; return <span key={d.key} className="px-skchip">{d.icon} {Array.isArray(v) ? v.join(", ") : v}</span>; })}</div></div></div>}
            {expList.length > 0 && <div className="px-sec"><div className="px-sec-h"><span>💼</span><b>Experience</b></div><div className="px-sec-b"><div className="px-exp">{expList.map((e,i) => <div key={i} className="px-exp-item"><div className="px-exp-r">{e.role}</div><div className="px-exp-c">{[e.company,e.period].filter(Boolean).join(" · ")}</div>{e.highlights?.map((h,j) => <div key={j} className="px-exp-hl">• {h}</div>)}</div>)}</div></div></div>}
            {eduList.length > 0 && <div className="px-sec"><div className="px-sec-h"><span>🎒</span><b>Education</b></div><div className="px-sec-b"><div className="px-exp">{eduList.map((e,i) => <div key={i} className="px-exp-item"><div className="px-exp-r">{e.degree}</div><div className="px-exp-c">{[e.institution,e.year].filter(Boolean).join(" · ")}</div></div>)}</div></div></div>}
          </>)}
        </div>
      )}

      {/* ASSESSMENTS */}
      {view === "assessments" && (
        <div className="px-wrap">
          <div className="px-intro"><h1>Holistic assessments</h1><p className="sub">Record your results across the frameworks below. PathOS combines them into a holistic snapshot that informs your pathway and helps employers see fit beyond skills.</p></div>
          <div className="px-asm-grid">
            {ASSESS_DEFS.map(d => (
              <div key={d.key} className="px-asm">
                <div className="ic">{d.icon}</div><div className="nm">{d.name}</div><div className="sb">{d.sub}</div>
                {d.kind === "single" ? (
                  <select value={assess[d.key] || ""} onChange={e => setAssessVal(d.key, e.target.value)}>
                    <option value="">Select…</option>{d.opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <><div className="px-skchips">{d.opts.map(o => { const on = (assess[d.key] || []).includes(o); return <span key={o} className={`px-skchip ${on?"on":"off"}`} onClick={() => toggleMulti(d.key, o, d.max)}>{o}</span>; })}</div><div className="px-mini" style={{marginTop:6}}>Pick up to {d.max}.</div></>
                )}
                {assess[d.key] && (Array.isArray(assess[d.key]) ? assess[d.key].length : true) && <div className="res">✓ {Array.isArray(assess[d.key]) ? assess[d.key].join(", ") : assess[d.key]}</div>}
              </div>
            ))}
          </div>
          <button className="px-go" disabled={assessCount < 2 || assessLoading} onClick={synthAssess}>{assessLoading ? "Synthesizing…" : "✦ Synthesize my holistic profile"}</button>
          {assessOut && (
            <div className="px-verd"><b>Holistic snapshot</b><p>{assessOut.summary}</p>
              {assessOut.work_style && <p style={{marginTop:8}}><b style={{display:"inline",color:PAL.tealDark}}>Work style — </b>{assessOut.work_style}</p>}
              {assessOut.ideal_environment && <p style={{marginTop:4}}><b style={{display:"inline",color:PAL.tealDark}}>Ideal environment — </b>{assessOut.ideal_environment}</p>}
              {assessOut.watchouts && <p style={{marginTop:4}}><b style={{display:"inline",color:PAL.tealDark}}>Watch-outs — </b>{assessOut.watchouts}</p>}
              {assessOut.fit_for_target && <p style={{marginTop:4}}><b style={{display:"inline",color:PAL.tealDark}}>Fit for {targetRole} — </b>{assessOut.fit_for_target}</p>}
            </div>
          )}
        </div>
      )}

      {/* ANALYSIS */}
      {view === "analysis" && (<>
        {status === "idle" && (
          <div className="px-wrap"><div className="px-intro"><h1>Where are you, and where do you want to go?</h1><p className="sub">One assessment gives you a readiness score, gaps, and a gamified journey. {profile ? "Fields are pre-filled from your profile." : "Tip: build your Profile first to auto-fill this."}</p></div>
            <div className="px-card">
              <div className="px-field"><label>Current role / title *</label><input value={currentRole} onChange={e => setCurrentRole(e.target.value)} /></div>
              <div className="px-field"><label>Experience & background</label><textarea value={experience} onChange={e => setExperience(e.target.value)} /></div>
              <div className="px-field"><label>Education</label><input value={education} onChange={e => setEducation(e.target.value)} /></div>
              <div className="px-field"><label>Your skills</label><div className="px-skillrow"><input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} placeholder="Type a skill, press Enter" /><button className="px-add" onClick={addSkill}>Add</button></div>{skills.length > 0 && <div className="px-tags">{skills.map(s => <span key={s} className="px-tag">{s}<button onClick={() => removeSkill(s)}>×</button></span>)}</div>}</div>
              <hr className="px-divider" />
              <div className="px-field"><label>Target role *</label><input value={targetRole} onChange={e => setTargetRole(e.target.value)} /></div>
              <div className="px-field"><label>Target industry (optional)</label><input value={targetIndustry} onChange={e => setTargetIndustry(e.target.value)} /></div>
              <button className="px-go" onClick={generate}>Analyse & map my path ✦</button>
            </div>
          </div>
        )}
        {status === "loading" && <div className="px-state"><div className="px-spin"/><h3>Charting your path…</h3><p>Scoring your readiness, finding gaps, and plotting milestones.</p>{stream && <div className="px-stream" ref={streamEnd}>{stream}</div>}</div>}
        {status === "error" && <div className="px-state"><h3 style={{color:PAL.terra}}>Something went wrong</h3><p>{error}</p><button className="px-go" style={{maxWidth:220}} onClick={generate}>Try again</button></div>}
        {status === "done" && data && (
          <div className="px-wrap">
            <div className="px-read"><div className="px-read-top"><span className="px-read-pct" style={{color:readColor(liveReadiness)}}>{liveReadiness}%</span><div className="px-read-barwrap"><div className="px-bigtrack"><div className="px-bigfill" style={{width:liveReadiness+"%",background:readColor(liveReadiness)}}/></div><p className="px-read-sum">{data.readiness_summary}</p></div></div><p className="px-read-hint">Starts at {baseScore}%. Each milestone you reach lifts this toward 100%.</p></div>
            {data.transition_verdict && <div className="px-verd"><b>Transition verdict</b><p>{data.transition_verdict}</p></div>}
            {data.gaps?.length > 0 && <div className="px-sec"><div className="px-sec-h"><span>⚠</span><b>Skill & credential gaps</b><span className="ct">{data.gaps.filter(g => gapAddressed(g.name)).length}/{data.gaps.length} closed</span></div><div className="px-sec-b">{data.gaps.map((g,i) => { const c = gapAddressed(g.name); return <div key={i} className={`px-gap ${c?"closed":""}`}><span className="px-gap-n">{g.name}</span><span className={`px-pri ${c?"closed":g.priority}`}>{c?"✓ closed":g.priority}</span><span className="px-gap-d">{g.description}</span></div>; })}</div></div>}
            {data.strengths?.length > 0 && <div className="px-sec"><div className="px-sec-h"><span>✓</span><b>What you already bring</b><span className="ct">{data.strengths.length}</span></div><div className="px-sec-b">{data.strengths.map((s,i) => <div key={i} className="px-str"><span className="ck">✓</span><div><b>{s.skill}</b><span>{s.reason}</span></div></div>)}</div></div>}
            {data.cert_recommendations?.length > 0 && <div className="px-sec"><div className="px-sec-h"><span>🎓</span><b>Recommended certifications</b></div><div className="px-sec-b">{data.cert_recommendations.map((c,i) => <div key={i} className="px-cert"><div className="ic">🎓</div><div><div className="nm">{c.name}</div><div className="pv">{c.provider}</div><div className="wy">{c.why}</div></div></div>)}</div></div>}
            {/* editable pathway */}
            <div className="px-sec"><div className="px-sec-h"><span>🧗</span><b>Your pathway (editable)</b><button className="px-pill-btn act" style={{padding:"5px 11px"}} onClick={() => setEditPath(e => !e)}>{editPath ? "Done" : "Edit"}</button></div>
              <div className="px-sec-b">{milestones.map((m,i) => editPath ? (
                <div key={i} style={{border:`1.5px solid ${PAL.creamLow}`,borderRadius:8,padding:10,display:"flex",flexDirection:"column",gap:6}}>
                  <div className="px-editrow"><input value={m.name} onChange={e => updateMilestone(i,"name",e.target.value)} /><button className="px-xbtn" onClick={() => removeMilestone(i)}>×</button></div>
                  <input style={{padding:"7px 9px",border:`1.5px solid ${PAL.creamLow}`,borderRadius:7,font:"inherit",fontSize:12}} value={m.action} onChange={e => updateMilestone(i,"action",e.target.value)} />
                  <input style={{padding:"7px 9px",border:`1.5px solid ${PAL.creamLow}`,borderRadius:7,font:"inherit",fontSize:12}} value={m.timeline} onChange={e => updateMilestone(i,"timeline",e.target.value)} />
                </div>
              ) : (
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}><span className="px-keynum" style={{background:done.has(i)?PAL.tealDark:PAL.terra}}>{done.has(i)?"✓":i+1}</span><div><div style={{fontSize:13,fontWeight:600}}>{m.name} <span style={{fontWeight:400,color:PAL.inkSoft}}>· {m.timeline}</span></div><div style={{fontSize:12.5,color:PAL.inkSoft,lineHeight:1.5}}>{m.action}</div></div></div>
              ))}{editPath && <button className="px-pill-btn" onClick={addMilestone}>+ Add milestone</button>}</div>
            </div>
            <button className="px-cta" onClick={() => setView("journey")}>Start your quest →  {data.destination_label || targetRole}</button>
          </div>
        )}
      </>)}

      {/* JOURNEY */}
      {view === "journey" && (!data ? (
        <div className="px-state"><div style={{fontSize:44,opacity:.4}}>🗺️</div><h3>No journey yet</h3><p>Run a gap analysis first and PathOS will plot your illustrated milestone walk.</p><button className="px-go" style={{maxWidth:240}} onClick={() => setView("analysis")}>Go to analysis →</button></div>
      ) : (
        <div className="px-stage">
          <div className="px-mapwrap">
            <svg className="px-map" viewBox={`0 0 ${W} ${height}`} xmlns="http://www.w3.org/2000/svg">
              <defs><filter id="wob"><feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAL.bgTop}/><stop offset="1" stopColor={PAL.bg}/></linearGradient></defs>
              <rect x="0" y="0" width={W} height={height} fill="url(#sky)"/>
              <g opacity="0.18" stroke={PAL.paper} strokeWidth="14">{Array.from({length:Math.ceil(height/220)}).map((_,i) => <line key={i} x1="0" y1={120+i*220} x2={W} y2={60+i*220}/>)}</g>
              <g filter="url(#wob)">{scenery.map((t,i) => <Tree key={i} x={t.x} y={t.y} s={t.s}/>)}</g>
              <g filter="url(#wob)">{nodes.slice(0,-1).map((n,i) => { const lit = reached(i) && reached(i+1); return <path key={i} d={segPath(n,nodes[i+1],i%2===0)} fill="none" stroke={lit?PAL.terra:PAL.terraDark} strokeOpacity={lit?1:.4} strokeWidth="6" strokeLinecap="round" strokeDasharray={lit?"0":"2 12"}/>; })}</g>
              {nodes.map((n,i) => { const isStart = i===0, isDest = i===totalNodes-1, mi = i-1; const type = isStart?"cottage":isDest?"summit":(milestones[mi]?.scene_type||"office"); const r = reached(i), markerY = n.y-(LANDMARKS[type]?.rise||130), clickable = !isStart && !isDest; return (
                <g key={i}><g transform={`translate(${n.x},${n.y})`} filter="url(#wob)"><Landmark type={type}/></g>
                  <g transform={`translate(${n.x},${markerY})`} style={{cursor:clickable?"pointer":"default"}} onClick={() => clickable && setSelected(mi)}><line x1="0" y1="6" x2="0" y2="20" stroke={PAL.ink} strokeWidth="2"/><circle cx="0" cy="0" r="16" fill={r?PAL.tealDark:PAL.terra} stroke={PAL.ink} strokeWidth="2.5"/><text x="0" y="5" textAnchor="middle" fontFamily="Fredoka" fontWeight="700" fontSize="15" fill="#fff">{isStart?"S":isDest?"★":(r?"✓":mi+1)}</text></g>
                  <text x={n.x} y={markerY-24} textAnchor="middle" fontFamily="Fredoka" fontWeight="600" fontSize={isDest?17:13} fill={isDest?PAL.terra:PAL.ink}>{isStart?(data.start_label||currentRole):isDest?(data.destination_label||targetRole):milestones[mi]?.name}</text></g>); })}
            </svg>
            {sel && (<div className="px-sheet"><button className="px-sheet-x" onClick={() => setSelected(null)}>×</button><span className="px-sheet-tag">Stop {selected+1} · {sel.timeline}</span><div className="px-sheet-nm">{sel.name}</div><div className="px-sheet-ac">{sel.action}</div><p className="px-sheet-dt">{sel.detail}</p><div className="px-chips">{sel.skill_unlocked && <div className="px-chip"><b>Skill unlocked</b>{sel.skill_unlocked}</div>}{sel.gap_closed && <div className="px-chip"><b>Closes gap</b>{sel.gap_closed}</div>}{sel.cert && <div className="px-chip"><b>Certification</b>{sel.cert}</div>}</div><button className={`px-reach ${done.has(selected)?"done":"todo"}`} onClick={() => toggleDone(selected)}>{done.has(selected)?"✓ Reached · +150 XP · badge earned":"Mark this milestone reached"}</button></div>)}
          </div>
          <div className="px-rail">
            <span className="px-rail-link" onClick={() => setView("analysis")}>← Back to analysis</span>
            {allDone && <div className="px-banner">🎉 Journey complete — {liveReadiness}% ready for {data.destination_label || targetRole}!</div>}
            {done.size > 0 && <div className="px-rail-link" style={{color:PAL.gold}} onClick={() => setView("profile")}>✦ {done.size} badge{done.size>1?"s":""} earned — view on profile →</div>}
            <div><div className="px-prog-l"><span>Journey progress</span><span>{done.size}/{milestones.length}</span></div><div className="px-track"><div className="px-fill" style={{width:pct+"%"}}/></div><div className="px-xp">✦ {xp} XP earned</div></div>
            <div><div className="px-key">KEY</div><ul className="px-keylist"><li className="px-keyitem done"><span className="px-keynum">S</span><span>{data.start_label||currentRole} — start</span></li>{milestones.map((m,i) => <li key={i} className={`px-keyitem ${done.has(i)?"done":""}`} onClick={() => setSelected(i)}><span className="px-keynum">{done.has(i)?"✓":i+1}</span><span>{m.name}</span></li>)}<li className={`px-keyitem ${allDone?"done":""}`}><span className="px-keynum" style={{background:PAL.gold}}>★</span><span>{data.destination_label||targetRole} — goal</span></li></ul></div>
          </div>
        </div>
      ))}

      {/* JOBS */}
      {view === "jobs" && (
        <div className="px-wrap">
          <div className="px-intro"><h1>Jobs aligned to your path</h1><p className="sub">{data ? `Matched against your target "${data.destination_label || targetRole}" and the skills your journey unlocks.` : "Run a gap analysis to get personalised match scores. Showing all open roles for now."}</p></div>
          {[...postedJobs].sort((a,b) => jobMatch(b)-jobMatch(a)).map(job => { const m = jobMatch(job); const applied = apps.some(a => a.title === job.title && a.company === job.company); return (
            <div key={job.id} className="px-job"><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}>
              <div><div className="px-job-t">{job.title}</div><div className="px-job-c">{job.company} · {job.location} · {job.level} · {job.salary}</div><div className="px-skchips" style={{marginTop:8}}>{job.skills.map((s,i) => <span key={i} className="px-skchip">{s}</span>)}</div></div>
              <div style={{textAlign:"center",flexShrink:0}}><div className="px-match" style={{color:readColor(m)}}>{m}%</div><div className="px-mini">match</div></div>
            </div><button className={`px-pill-btn ${applied?"":"primary"}`} style={{marginTop:10}} disabled={applied} onClick={() => applyToJob(job)}>{applied ? "✓ Applied" : "Apply via PathOS →"}</button></div>
          ); })}
        </div>
      )}

      {/* APPLICATIONS */}
      {view === "applications" && (
        <div className="px-wrap">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div className="px-intro" style={{marginBottom:0}}><h1>Application tracker</h1></div>
            <div className="px-tabs"><button className={`px-tab ${appView==="all"?"on":""}`} onClick={() => setAppView("all")}>All applications</button><button className={`px-tab ${appView==="one"?"on":""}`} onClick={() => { setAppView("one"); if (appSel==null && apps[0]) setAppSel(apps[0].id); }}>Single view</button></div>
          </div>
          {apps.length === 0 && <div className="px-state"><p>No applications yet. Head to Jobs to apply.</p></div>}
          {appView === "all" && apps.length > 0 && (<>
            <div className="px-stats"><div className="px-stat"><div className="v">{apps.length}</div><div className="l">Total</div></div><div className="px-stat"><div className="v">{apps.filter(a => a.status==="Interview").length}</div><div className="l">Interviews</div></div><div className="px-stat"><div className="v">{apps.filter(a => a.status==="Offer").length}</div><div className="l">Offers</div></div><div className="px-stat"><div className="v">{apps.filter(a => a.status==="Reviewed").length}</div><div className="l">Reviewed</div></div></div>
            {apps.map(a => (
              <div key={a.id} className="px-row"><div className="av">{a.company[0]}</div><div className="main"><div className="t">{a.title}</div><div className="s">{a.company} · applied {a.date}</div></div><St s={a.status}/><button className="px-pill-btn" style={{padding:"6px 10px"}} onClick={() => { setAppView("one"); setAppSel(a.id); }}>View</button></div>
            ))}
          </>)}
          {appView === "one" && apps.length > 0 && (() => { const a = apps.find(x => x.id === appSel) || apps[0]; const idx = APP_STATUSES.indexOf(a.status); return (
            <div className="px-sec"><div className="px-sec-h"><b>{a.title}</b><span className="ct">{a.company}</span></div><div className="px-sec-b">
              <div className="px-field"><label>Pick application</label><select value={a.id} onChange={e => setAppSel(e.target.value)}>{apps.map(x => <option key={x.id} value={x.id}>{x.title} — {x.company}</option>)}</select></div>
              <div><div className="px-prog-l" style={{marginBottom:6}}><span>Stage</span><span>{a.status}</span></div>
                <div style={{display:"flex",gap:4}}>{APP_STATUSES.filter(s => s!=="Rejected").map((s,i) => <div key={s} style={{flex:1,textAlign:"center"}}><div style={{height:8,borderRadius:4,background: i<=idx && a.status!=="Rejected" ? STATUS_COLOR[a.status] : PAL.paperDark}}/><div className="px-mini" style={{marginTop:4}}>{s}</div></div>)}</div>
              </div>
              <div className="px-field" style={{marginTop:6}}><label>Update status</label><select value={a.status} onChange={e => setAppStatus(a.id, e.target.value)}>{APP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div style={{fontSize:13,color:PAL.inkSoft,lineHeight:1.6}}><b style={{color:PAL.ink}}>Notes:</b> {a.notes}</div>
            </div></div>
          ); })()}
        </div>
      )}
    </div></>);
  }

  /* ════════ COMPANY ════════ */
  if (role === "company") {
    const discMix = ["D","I","S","C"].map(k => ({ k, v: STAFF.filter(s => s.disc === k).length }));
    const deptMix = [...new Set(STAFF.map(s => s.dept))].map(d => ({ k: d, v: STAFF.filter(s => s.dept === d).length }));
    const pool = CANDIDATE_POOL.filter(c => c.open).concat(openToWork && profile ? [{ id:"me", name: profile.name, headline: profile.headline, location: profile.location || "—", readiness: liveReadiness, target: targetRole, skills: skillsList, open:true }] : []);
    const filtered = pool.filter(c => !hhFilter || (c.skills.join(" ") + c.headline + c.target).toLowerCase().includes(hhFilter.toLowerCase()));
    return (<><style>{PATHOS_CSS}</style><div className="px">
      {Header}
      <div className="px-nav"><div className="px-nav-title">Hatch & Co · Creative Agency</div><div className="px-tabs">{[["dashboard","📊 Dashboard"],["post","➕ Post Jobs"],["headhunt","🎯 Headhunt"],["team","👥 Team"],["staff","🪪 Staff"],["applicants","📨 Applicants"],["hr","🧾 HR"]].map(([k,l]) => <button key={k} className={`px-tab ${cView===k?"on":""}`} onClick={() => setCView(k)}>{l}</button>)}</div></div>
      <div className="px-wrap">
        {cView === "dashboard" && (<>
          <div className="px-intro"><h1>Company dashboard</h1><p className="sub">Hiring, talent pipeline, and team health at a glance.</p></div>
          <div className="px-stats"><div className="px-stat"><div className="v">{postedJobs.length}</div><div className="l">Open roles</div></div><div className="px-stat"><div className="v">{applicants.length}</div><div className="l">Active applicants</div></div><div className="px-stat"><div className="v">{pool.length}</div><div className="l">Headhuntable candidates</div></div><div className="px-stat"><div className="v">{STAFF.length}</div><div className="l">Team members</div></div></div>
          <div className="px-sec"><div className="px-sec-h"><span>📨</span><b>Pipeline by stage</b></div><div className="px-sec-b"><Bars color={PAL.terra} data={["Applied","Reviewed","Interview","Offer"].map(s => ({ k:s, v: applicants.filter(a => a.stage===s).length }))} /></div></div>
          <div className="px-sec"><div className="px-sec-h"><span>👥</span><b>Team DISC mix</b></div><div className="px-sec-b"><Bars color={PAL.teal} data={discMix} /></div></div>
        </>)}
        {cView === "post" && (<>
          <div className="px-intro"><h1>Post a job opening</h1><p className="sub">Posted roles appear instantly on the seeker job board with auto-calculated match scores.</p></div>
          <PostJobForm onPost={(job) => setPostedJobs(p => [{ ...job, id:"p"+Date.now(), by:"company" }, ...p])} />
          <div className="px-sec"><div className="px-sec-h"><span>📋</span><b>Your open roles</b><span className="ct">{postedJobs.length}</span></div><div className="px-sec-b">{postedJobs.map(j => <div key={j.id} className="px-row"><div className="av">{j.company[0]}</div><div className="main"><div className="t">{j.title}</div><div className="s">{j.location} · {j.level} · {j.salary}</div></div></div>)}</div></div>
        </>)}
        {cView === "headhunt" && (<>
          <div className="px-intro"><h1>Headhunting</h1><p className="sub">Search candidates who are open to opportunities — before they ever apply. You see skills, readiness, and target role; contact opens only when they respond.</p></div>
          <div className="px-field"><input placeholder="Filter by skill, headline, or target role…" value={hhFilter} onChange={e => setHhFilter(e.target.value)} /></div>
          {filtered.map(c => (
            <div key={c.id} className="px-row"><div className="av">{c.name[0]}</div><div className="main"><div className="t">{c.name} {c.id==="me" && <span className="px-skchip" style={{fontSize:10}}>you</span>}</div><div className="s">{c.headline} · {c.location} · targeting {c.target}</div><div className="px-skchips" style={{marginTop:6}}>{c.skills.slice(0,5).map((s,i) => <span key={i} className="px-skchip">{s}</span>)}</div></div><div style={{textAlign:"center"}}><div className="px-match" style={{color:readColor(c.readiness)}}>{c.readiness}%</div><div className="px-mini">ready</div></div><button className="px-pill-btn primary" style={{padding:"7px 12px"}}>Reach out</button></div>
          ))}
        </>)}
        {cView === "team" && (<>
          <div className="px-intro"><h1>Team assessments</h1><p className="sub">Aggregate of your staff's behavioural and strengths profiles — useful for balancing teams and planning hires.</p></div>
          <div className="px-sec"><div className="px-sec-h"><span>🟥</span><b>DISC distribution</b></div><div className="px-sec-b"><Bars color={PAL.terra} data={discMix} /></div></div>
          <div className="px-sec"><div className="px-sec-h"><span>🏢</span><b>By department</b></div><div className="px-sec-b"><Bars color={PAL.teal} data={deptMix} /></div></div>
          <div className="px-sec"><div className="px-sec-h"><span>⚡</span><b>Energy rhythms</b></div><div className="px-sec-b"><Bars color={PAL.gold} data={[...new Set(STAFF.map(s => s.energy))].map(e => ({ k:e, v: STAFF.filter(s => s.energy===e).length }))} /></div></div>
        </>)}
        {cView === "staff" && (<>
          <div className="px-intro"><h1>Staff profiles</h1></div>
          {STAFF.map(s => <div key={s.id} className="px-row"><div className="av">{s.name[0]}</div><div className="main"><div className="t">{s.name}</div><div className="s">{s.role} · {s.dept}</div></div><span className="px-skchip">DISC {s.disc}</span><span className="px-skchip">{s.top}</span></div>)}
        </>)}
        {cView === "applicants" && (<>
          <div className="px-intro"><h1>Applicant process</h1><p className="sub">Everyone who applied to your roles, on a stage pipeline. Applications from PathOS seekers flow in here automatically.</p></div>
          <div className="px-kanban">{["Applied","Reviewed","Interview","Offer","Rejected"].map(stage => (
            <div key={stage} className="px-kcol"><div className="px-kcol-h">{stage} ({applicants.filter(a => a.stage===stage).length})</div>{applicants.filter(a => a.stage===stage).map(a => <div key={a.id} className="px-kcard"><div className="n">{a.name}</div><div style={{color:PAL.inkSoft}}>{a.role}</div><div style={{color:readColor(a.match),fontWeight:600,marginTop:3}}>{a.match}% match</div></div>)}</div>
          ))}</div>
          <div className="px-sec"><div className="px-sec-h"><span>📄</span><b>Applicant profiles</b></div><div className="px-sec-b">{applicants.map(a => <div key={a.id} className="px-row"><div className="av">{a.name[0]}</div><div className="main"><div className="t">{a.name}</div><div className="s">{a.role} · applied {a.applied}</div></div><St s={a.stage}/><select value={a.stage} onChange={e => setApplicants(p => p.map(x => x.id===a.id?{...x,stage:e.target.value}:x))} style={{padding:"5px 8px",border:`1.5px solid ${PAL.creamLow}`,borderRadius:7,fontSize:12}}>{["Applied","Reviewed","Interview","Offer","Rejected"].map(s => <option key={s}>{s}</option>)}</select></div>)}</div></div>
        </>)}
        {cView === "hr" && (<>
          <div className="px-intro"><h1>HR — staff management</h1><p className="sub">Lightweight HR view over your team. (Prototype actions are illustrative.)</p></div>
          <div className="px-stats"><div className="px-stat"><div className="v">{STAFF.length}</div><div className="l">Headcount</div></div><div className="px-stat"><div className="v">3</div><div className="l">On leave this month</div></div><div className="px-stat"><div className="v">2</div><div className="l">Reviews due</div></div><div className="px-stat"><div className="v">96%</div><div className="l">Retention (12mo)</div></div></div>
          {STAFF.map(s => <div key={s.id} className="px-row"><div className="av">{s.name[0]}</div><div className="main"><div className="t">{s.name}</div><div className="s">{s.role} · {s.dept}</div></div><button className="px-pill-btn" style={{padding:"6px 10px"}}>Leave</button><button className="px-pill-btn" style={{padding:"6px 10px"}}>Review</button></div>)}
        </>)}
      </div>
    </div></>);
  }

  /* ════════ UNIVERSITY ════════ */
  if (role === "university") {
    const batches = [...new Set(GRADUATES.map(g => g.year))].sort();
    const byBatch = batches.map(y => { const grp = GRADUATES.filter(g => g.year === y); const emp = grp.filter(g => g.status === "Employed").length; return { k: String(y), v: Math.round(emp / grp.length * 100), label: Math.round(emp / grp.length * 100) + "%" }; });
    const overallEmp = Math.round(GRADUATES.filter(g => g.status === "Employed").length / GRADUATES.length * 100);
    const statusMix = ["Employed","Seeking","Further study"].map(s => ({ k:s, v: GRADUATES.filter(g => g.status===s).length }));
    return (<><style>{PATHOS_CSS}</style><div className="px">
      {Header}
      <div className="px-nav"><div className="px-nav-title">Universiti Malaya</div><div className="px-tabs">{[["graduates","🎓 Graduates"],["syllabus","📚 Syllabus Skills"],["batches","📈 Batch Performance"],["analytics","📊 Analytics"]].map(([k,l]) => <button key={k} className={`px-tab ${uView===k?"on":""}`} onClick={() => setUView(k)}>{l}</button>)}</div></div>
      <div className="px-wrap">
        {uView === "graduates" && (<>
          <div className="px-intro"><h1>Graduate tracker</h1><p className="sub">Where your graduates are now. Profiles are visible to you because they're affiliated with your institution.</p></div>
          {GRADUATES.map(g => <div key={g.id} className="px-row"><div className="av">{g.name[0]}</div><div className="main"><div className="t">{g.name}</div><div className="s">{g.program} · Class of {g.year}{g.employer ? ` · ${g.role} @ ${g.employer}` : g.role ? ` · ${g.role}` : ""}</div></div><St s={g.status === "Employed" ? "Offer" : g.status === "Seeking" ? "Applied" : "Reviewed"} /><span className="px-skchip">{g.status}</span></div>)}
        </>)}
        {uView === "syllabus" && (<>
          <div className="px-intro"><h1>Syllabus skillsets</h1><p className="sub">The skills each programme is designed to produce — the basis for matching graduates to industry demand.</p></div>
          {PROGRAMS.map(p => <div key={p.name} className="px-sec"><div className="px-sec-h"><span>📚</span><b>{p.name}</b><span className="ct">{p.skills.length} skills</span></div><div className="px-sec-b"><div className="px-skchips">{p.skills.map((s,i) => <span key={i} className="px-skchip">{s}</span>)}</div></div></div>)}
        </>)}
        {uView === "batches" && (<>
          <div className="px-intro"><h1>Batch performance</h1><p className="sub">Employment rate by graduating class.</p></div>
          <div className="px-sec"><div className="px-sec-h"><span>📈</span><b>Employment rate by batch</b></div><div className="px-sec-b"><Bars color={PAL.good} data={byBatch} /></div></div>
          {batches.map(y => { const grp = GRADUATES.filter(g => g.year === y); return <div key={y} className="px-sec"><div className="px-sec-h"><b>Class of {y}</b><span className="ct">{grp.length} grads</span></div><div className="px-sec-b"><Bars color={PAL.teal} data={["Employed","Seeking","Further study"].map(s => ({ k:s, v: grp.filter(g => g.status===s).length }))} /></div></div>; })}
        </>)}
        {uView === "analytics" && (<>
          <div className="px-intro"><h1>Institution analytics</h1><p className="sub">Outcomes across all tracked graduates.</p></div>
          <div className="px-sec"><div className="px-sec-h"><span>📊</span><b>Overall employment</b></div><div className="px-sec-b" style={{flexDirection:"row",alignItems:"center",gap:24,flexWrap:"wrap"}}><Donut pct={overallEmp} color={PAL.good} label={`${GRADUATES.filter(g=>g.status==="Employed").length} of ${GRADUATES.length} graduates employed`} /><div style={{flex:1,minWidth:200}}><Bars data={statusMix} color={PAL.teal} /></div></div></div>
          <div className="px-stats"><div className="px-stat"><div className="v">{GRADUATES.length}</div><div className="l">Tracked graduates</div></div><div className="px-stat"><div className="v">{overallEmp}%</div><div className="l">Employed</div></div><div className="px-stat"><div className="v">{[...new Set(GRADUATES.filter(g=>g.employer).map(g=>g.employer))].length}</div><div className="l">Employers hiring</div></div><div className="px-stat"><div className="v">{PROGRAMS.length}</div><div className="l">Programmes</div></div></div>
          <div className="px-sec"><div className="px-sec-h"><span>🏢</span><b>Top employers of our graduates</b></div><div className="px-sec-b"><div className="px-skchips">{[...new Set(GRADUATES.filter(g => g.employer).map(g => g.employer))].map((e,i) => <span key={i} className="px-skchip">{e}</span>)}</div></div></div>
        </>)}
      </div>
    </div></>);
  }

  return null;
}
