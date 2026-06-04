import { PAL } from "./constants";

/* ─── styles ─── */
export const PATHOS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=DM+Sans:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.px{font-family:'DM Sans',system-ui,sans-serif;color:${PAL.ink};background:${PAL.bg};min-height:100vh;}
.px-head{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;background:${PAL.paper};border-bottom:2px solid ${PAL.ink};flex-wrap:wrap;gap:8px;}
.px-logo{font-family:'Fredoka';font-size:23px;font-weight:700;color:${PAL.terra};letter-spacing:-.01em;}
.px-logo span{color:${PAL.ink};font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;margin-left:8px;}
.px-rolechip{font-size:12px;background:${PAL.paperDark};border-radius:20px;padding:5px 12px;display:flex;gap:8px;align-items:center;}
.px-rolechip button{border:none;background:none;color:${PAL.terra};font-weight:600;cursor:pointer;font-size:12px;}
.px-chipmini{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;background:${PAL.creamMid};font-size:11px;color:${PAL.inkSoft};}
.px-chipmini.ok{background:${PAL.goodBg};color:${PAL.good};}
.px-chipmini.err{background:${PAL.gapBg};color:${PAL.gap};}
/* login */
.px-login{max-width:880px;margin:0 auto;padding:2.5rem 1.5rem 3rem;}
.px-login h1{font-family:'Fredoka';font-weight:700;font-size:32px;text-align:center;margin-bottom:.3rem;}
.px-login p.sub{text-align:center;font-size:14px;color:${PAL.inkSoft};margin-bottom:2rem;}
.px-roles{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
@media(max-width:760px){.px-roles{grid-template-columns:1fr;}}
.px-role{background:${PAL.paper};border:2px solid ${PAL.ink};border-radius:16px;padding:1.5rem;cursor:pointer;transition:.15s;display:flex;flex-direction:column;gap:8px;}
.px-role:hover{transform:translateY(-3px);box-shadow:0 8px 22px rgba(40,55,48,.18);}
.px-role .ic{font-size:34px;}
.px-role h3{font-family:'Fredoka';font-weight:700;font-size:19px;}
.px-role p{font-size:12.5px;color:${PAL.inkSoft};line-height:1.55;}
.px-role .go{margin-top:auto;font-family:'Fredoka';font-weight:600;font-size:13px;color:${PAL.terra};}
.px-signin{max-width:420px;margin:0 auto;padding:3rem 1.5rem;}
.px-signin .card{background:${PAL.paper};border:2px solid ${PAL.ink};border-radius:16px;padding:2rem;}
.px-signin .ic{font-size:40px;text-align:center;}
.px-signin h2{font-family:'Fredoka';font-weight:700;font-size:22px;text-align:center;margin:.5rem 0 1.25rem;}
.px-role-note{text-align:center;font-size:12px;color:${PAL.tealDark};font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin:-.55rem 0 1rem;}
.px-alert{margin-bottom:1rem;padding:10px 12px;border:1.5px solid #dfb6ac;border-radius:10px;background:${PAL.gapBg};color:${PAL.gap};font-size:12.5px;line-height:1.55;}
.px-alert.warn{background:${PAL.warnBg};border-color:#e5d39d;color:${PAL.goldDeep};}
.px-auth-switch{text-align:center;font-size:12px;color:${PAL.inkSoft};margin-top:12px;line-height:1.5;}
.px-linkbtn{border:none;background:none;color:${PAL.terra};font:inherit;font-weight:600;cursor:pointer;padding:0;}
.px-linkbtn:hover{text-decoration:underline;}
/* generic */
.px-field{margin-bottom:1.1rem;}
.px-field label{display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:${PAL.tealDark};margin-bottom:5px;}
.px-field input,.px-field textarea,.px-field select{width:100%;padding:10px 12px;border:1.5px solid ${PAL.creamLow};border-radius:8px;font:inherit;font-size:13px;background:#fff;outline:none;}
.px-field input:focus,.px-field textarea:focus,.px-field select:focus{border-color:${PAL.terra};}
.px-field textarea{resize:vertical;min-height:74px;line-height:1.5;}
.px-go{width:100%;padding:13px;background:${PAL.terra};color:#fff;border:none;border-radius:10px;font-family:'Fredoka';font-weight:600;font-size:15px;cursor:pointer;}
.px-go:hover:not(:disabled){background:${PAL.terraDark};}.px-go:disabled{opacity:.5;cursor:not-allowed;}
.px-google-btn{width:100%;margin-top:10px;padding:11px 14px;border:1.5px solid #dadce0;border-radius:10px;background:#fff;color:#3c4043;font-family:'DM Sans',system-ui,sans-serif;font-weight:500;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:12px;box-shadow:0 1px 2px rgba(60,64,67,.1);}
.px-google-btn:hover:not(:disabled){background:#f8f9fa;border-color:#c7c9cc;box-shadow:0 1px 3px rgba(60,64,67,.18);}
.px-google-btn:focus-visible{outline:2px solid #1a73e8;outline-offset:2px;}
.px-google-btn:disabled{opacity:.6;cursor:not-allowed;box-shadow:none;}
.px-google-mark{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;flex-shrink:0;}
.px-google-mark svg{display:block;width:20px;height:20px;}
.px-google-text{line-height:1;}
.px-card{background:${PAL.paper};border:2px solid ${PAL.ink};border-radius:16px;padding:1.5rem;}
.px-skillrow{display:flex;gap:6px;}.px-skillrow input{flex:1;}
.px-add{padding:8px 14px;border:1.5px solid ${PAL.creamLow};border-radius:8px;background:${PAL.paperDark};font:inherit;font-weight:500;font-size:13px;cursor:pointer;}
.px-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
.px-tag{display:inline-flex;align-items:center;gap:5px;background:${PAL.creamMid};border-radius:20px;padding:4px 10px;font-size:12px;}
.px-tag button{border:none;background:none;cursor:pointer;color:${PAL.inkSoft};font-size:14px;}
.px-divider{border:none;border-top:1.5px dashed ${PAL.creamLow};margin:1.25rem 0;}
.px-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;min-height:380px;padding:2rem;text-align:center;}
.px-spin{width:38px;height:38px;border:3px solid ${PAL.creamLow};border-top-color:${PAL.terra};border-radius:50%;animation:sp .8s linear infinite;}
@keyframes sp{to{transform:rotate(360deg);}}
.px-state h3{font-family:'Fredoka';font-weight:600;font-size:20px;}
.px-state p{font-size:13px;color:${PAL.tealDark};max-width:360px;line-height:1.6;}
.px-stream{background:${PAL.paper};border:1px solid ${PAL.creamLow};border-radius:10px;padding:1rem;font-size:12px;line-height:1.7;white-space:pre-wrap;max-width:520px;max-height:220px;overflow-y:auto;text-align:left;}
.px-nav{position:sticky;top:0;z-index:20;background:${PAL.paper};border-bottom:2px solid ${PAL.ink};display:flex;align-items:center;gap:1rem;padding:.6rem 1.5rem;flex-wrap:wrap;}
.px-nav-title{font-family:'Fredoka';font-weight:700;font-size:15px;flex:1;min-width:90px;}
.px-tabs{display:flex;background:${PAL.paperDark};border-radius:10px;padding:3px;gap:2px;flex-wrap:wrap;}
.px-tab{border:none;background:none;padding:6px 11px;border-radius:8px;font-family:'Fredoka';font-weight:600;font-size:12px;cursor:pointer;color:${PAL.inkSoft};}
.px-tab.on{background:${PAL.terra};color:#fff;}
.px-readpill{display:flex;align-items:center;gap:8px;font-size:12px;background:${PAL.paperDark};border-radius:20px;padding:5px 12px;}
.px-readpill b{font-family:'Fredoka';font-size:14px;}
.px-readpill .dotbar{width:50px;height:7px;border-radius:4px;background:${PAL.creamLow};overflow:hidden;}
.px-readpill .dotbar i{display:block;height:100%;background:${PAL.terra};}
.px-wrap{max-width:820px;margin:0 auto;padding:1.5rem 1.5rem 3rem;display:flex;flex-direction:column;gap:1.1rem;}
.px-intro h1{font-family:'Fredoka';font-weight:700;font-size:27px;line-height:1.15;margin-bottom:.4rem;}
.px-intro p.sub{font-size:14px;color:${PAL.inkSoft};line-height:1.6;margin-bottom:1.25rem;}
.px-read{background:${PAL.paper};border:2px solid ${PAL.ink};border-radius:14px;padding:1.4rem;}
.px-read-top{display:flex;align-items:center;gap:16px;}
.px-read-pct{font-family:'Fredoka';font-weight:700;font-size:46px;line-height:1;}
.px-read-barwrap{flex:1;}
.px-bigtrack{height:11px;background:${PAL.creamMid};border-radius:6px;overflow:hidden;}
.px-bigfill{height:100%;border-radius:6px;transition:width .7s cubic-bezier(.4,1.3,.5,1);}
.px-read-sum{font-size:13px;line-height:1.6;margin-top:8px;}
.px-read-hint{font-size:11.5px;color:${PAL.tealDark};margin-top:10px;font-style:italic;}
.px-sec{background:${PAL.paper};border:2px solid ${PAL.ink};border-radius:14px;overflow:hidden;}
.px-sec-h{display:flex;align-items:center;gap:8px;padding:.85rem 1.2rem;border-bottom:1.5px solid ${PAL.creamLow};}
.px-sec-h b{font-family:'Fredoka';font-weight:600;font-size:14px;}
.px-sec-h .ct{margin-left:auto;font-size:11px;background:${PAL.paperDark};padding:2px 9px;border-radius:10px;color:${PAL.inkSoft};}
.px-sec-h .act{margin-left:auto;}
.px-sec-b{padding:1.1rem 1.2rem;display:flex;flex-direction:column;gap:10px;}
.px-verd{background:${PAL.goodBg};border:1.5px solid #b8d3c6;border-radius:14px;padding:1.2rem;}
.px-verd b{display:block;font-family:'Fredoka';font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:${PAL.tealDark};margin-bottom:5px;}
.px-verd p{font-size:14px;line-height:1.7;}
.px-gap{display:grid;grid-template-columns:1fr auto;gap:5px 10px;padding:11px;background:${PAL.gapBg};border-left:3px solid ${PAL.gap};border-radius:8px;transition:.3s;}
.px-gap.closed{background:${PAL.goodBg};border-left-color:${PAL.good};}
.px-gap-n{font-size:13px;font-weight:500;color:${PAL.gap};}
.px-gap.closed .px-gap-n{color:${PAL.good};text-decoration:line-through;}
.px-gap-d{grid-column:1/-1;font-size:12px;line-height:1.55;color:${PAL.inkSoft};}
.px-pri{font-size:10px;font-weight:600;text-transform:uppercase;padding:2px 7px;border-radius:10px;white-space:nowrap;align-self:start;}
.px-pri.high{background:#f3cfca;color:${PAL.gap};}.px-pri.medium{background:${PAL.warnBg};color:${PAL.warn};}.px-pri.low{background:${PAL.goodBg};color:${PAL.good};}
.px-pri.closed{background:${PAL.good};color:#fff;}
.px-str{display:flex;gap:10px;padding:10px 12px;background:${PAL.goodBg};border-radius:8px;}
.px-str .ck{color:${PAL.good};font-size:16px;}
.px-str b{display:block;font-size:13px;font-weight:600;}.px-str span{font-size:12.5px;color:${PAL.inkSoft};line-height:1.5;}
.px-cert{display:flex;gap:11px;padding:11px;border:1.5px solid ${PAL.creamLow};border-radius:8px;background:#fff;}
.px-cert .ic{width:34px;height:34px;border-radius:8px;background:${PAL.goodBg};display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
.px-cert .nm{font-size:13px;font-weight:600;}.px-cert .pv{font-size:11px;color:${PAL.inkSoft};}.px-cert .wy{font-size:12px;color:${PAL.inkSoft};margin-top:3px;line-height:1.5;}
.px-cta{padding:14px;background:${PAL.ink};color:#fff;border:none;border-radius:12px;font-family:'Fredoka';font-weight:600;font-size:15px;cursor:pointer;}
.px-cta:hover{background:#2c3833;}
.px-stage{display:grid;grid-template-columns:1fr 300px;}
@media(max-width:880px){.px-stage{grid-template-columns:1fr;}}
.px-mapwrap{position:relative;overflow:hidden;}.px-map{display:block;width:100%;height:auto;}
.px-rail{background:${PAL.paper};border-left:2px solid ${PAL.ink};padding:1.25rem;display:flex;flex-direction:column;gap:1rem;}
@media(max-width:880px){.px-rail{border-left:none;border-top:2px solid ${PAL.ink};}}
.px-rail-link{font-size:12px;color:${PAL.tealDark};cursor:pointer;font-weight:500;}.px-rail-link:hover{color:${PAL.terra};}
.px-prog-l{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:${PAL.tealDark};display:flex;justify-content:space-between;}
.px-track{height:10px;background:${PAL.paperDark};border-radius:5px;overflow:hidden;border:1px solid ${PAL.creamLow};}
.px-fill{height:100%;background:${PAL.terra};border-radius:5px;}
.px-xp{font-family:'Fredoka';font-weight:600;font-size:13px;color:${PAL.gold};margin-top:6px;}
.px-key{font-family:'Fredoka';font-weight:700;font-size:15px;color:${PAL.terra};letter-spacing:.05em;border-bottom:2px solid ${PAL.creamLow};padding-bottom:4px;}
.px-keylist{display:flex;flex-direction:column;gap:2px;list-style:none;}
.px-keyitem{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;line-height:1.4;padding:6px 8px;border-radius:6px;cursor:pointer;}
.px-keyitem:hover{background:${PAL.paperDark};}.px-keyitem.done{opacity:.55;}
.px-keynum{flex-shrink:0;width:18px;height:18px;border-radius:50%;background:${PAL.terra};color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;font-family:'Fredoka';}
.px-keyitem.done .px-keynum{background:${PAL.tealDark};}
.px-sheet{position:absolute;left:0;right:0;bottom:0;background:${PAL.paper};border-top:3px solid ${PAL.ink};border-radius:18px 18px 0 0;box-shadow:0 -8px 30px rgba(40,55,48,.25);padding:1.25rem 1.5rem 1.5rem;animation:rise .28s cubic-bezier(.2,1,.4,1);max-height:80%;overflow-y:auto;}
@keyframes rise{from{transform:translateY(100%);}to{transform:translateY(0);}}
.px-sheet-x{position:absolute;top:12px;right:14px;border:none;background:${PAL.paperDark};width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;}
.px-sheet-tag{display:inline-block;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#fff;background:${PAL.tealDark};padding:3px 9px;border-radius:10px;margin-bottom:6px;}
.px-sheet-nm{font-family:'Fredoka';font-weight:700;font-size:22px;line-height:1.1;margin-bottom:4px;}
.px-sheet-ac{font-size:14px;font-weight:500;color:${PAL.terra};margin-bottom:8px;}
.px-sheet-dt{font-size:13.5px;line-height:1.65;margin-bottom:12px;}
.px-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}
.px-chip{font-size:12px;background:${PAL.paperDark};border:1px solid ${PAL.creamLow};border-radius:8px;padding:6px 10px;}
.px-chip b{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:${PAL.tealDark};font-weight:600;margin-bottom:2px;}
.px-reach{width:100%;padding:12px;border:none;border-radius:10px;font-family:'Fredoka';font-weight:600;font-size:15px;cursor:pointer;}
.px-reach.todo{background:${PAL.terra};color:#fff;}.px-reach.done{background:${PAL.tealDark};color:#fff;}
.px-banner{background:${PAL.gold};color:${PAL.goldDeep};font-family:'Fredoka';font-weight:600;text-align:center;padding:10px;border-radius:10px;font-size:14px;}
.px-prof-head{background:${PAL.paper};border:2px solid ${PAL.ink};border-radius:14px;padding:1.5rem;}
.px-prof-name{font-family:'Fredoka';font-weight:700;font-size:28px;line-height:1.1;}
.px-prof-headline{color:${PAL.terra};font-weight:600;font-size:15px;margin-top:2px;}
.px-prof-meta{font-size:12.5px;color:${PAL.inkSoft};margin-top:4px;}
.px-prof-sum{font-size:13.5px;line-height:1.7;margin-top:10px;}
.px-prof-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}
.px-pill-btn{padding:9px 15px;border:1.5px solid ${PAL.ink};border-radius:9px;background:${PAL.paperDark};font-family:'Fredoka';font-weight:600;font-size:13px;cursor:pointer;color:${PAL.ink};}
.px-pill-btn.primary{background:${PAL.terra};color:#fff;border-color:${PAL.terra};}
.px-pill-btn.primary:hover{background:${PAL.terraDark};}
.px-share{display:flex;gap:6px;margin-top:10px;}
.px-share input{flex:1;padding:9px 11px;border:1.5px solid ${PAL.creamLow};border-radius:8px;font-size:12px;background:#fff;color:${PAL.inkSoft};}
.px-toast{font-size:12px;color:${PAL.good};font-weight:600;margin-top:6px;}
.px-up{border:2px dashed ${PAL.creamLow};border-radius:14px;padding:2rem 1.5rem;text-align:center;background:${PAL.paper};}
.px-up .ic{font-size:40px;}.px-up h3{font-family:'Fredoka';font-size:19px;margin:.5rem 0 .3rem;}
.px-up p{font-size:13px;color:${PAL.inkSoft};max-width:380px;margin:0 auto 1rem;line-height:1.6;}
.px-up-btn{display:inline-block;padding:11px 22px;background:${PAL.terra};color:#fff;border:none;border-radius:10px;font-family:'Fredoka';font-weight:600;font-size:14px;cursor:pointer;}
.px-or{font-size:12px;color:${PAL.inkSoft};margin:1rem 0 .5rem;}
.px-badges{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;}
.px-badge{display:flex;gap:10px;align-items:flex-start;background:#fff;border:1.5px solid ${PAL.creamLow};border-radius:10px;padding:11px;}
.px-badge.locked{opacity:.62;border-style:dashed;background:${PAL.paperDark};}
.px-badge.earned{border-color:${PAL.gold};box-shadow:0 0 0 2px ${PAL.warnBg};}
.px-badge .em{width:38px;height:38px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:19px;background:${PAL.goodBg};}
.px-badge.ach .em{background:${PAL.warnBg};}
.px-badge .bl{font-size:13px;font-weight:600;line-height:1.25;}
.px-badge .bs{font-size:11.5px;color:${PAL.inkSoft};line-height:1.45;margin-top:3px;}
.px-skchips{display:flex;flex-wrap:wrap;gap:6px;}
.px-skchip{background:${PAL.creamMid};border-radius:20px;padding:5px 12px;font-size:12.5px;}
.px-skchip.on{background:${PAL.terra};color:#fff;cursor:pointer;}
.px-skchip.off{cursor:pointer;}
.px-exp{display:flex;flex-direction:column;gap:14px;}
.px-exp-item{border-left:2px solid ${PAL.creamLow};padding-left:12px;}
.px-exp-r{font-size:13.5px;font-weight:600;}.px-exp-c{font-size:12px;color:${PAL.inkSoft};margin-bottom:4px;}
.px-exp-hl{font-size:12.5px;line-height:1.6;margin:2px 0 0 16px;}
/* row lists */
.px-row{display:flex;gap:12px;align-items:center;padding:12px;border:1.5px solid ${PAL.creamLow};border-radius:10px;background:#fff;}
.px-row .av{width:40px;height:40px;border-radius:50%;background:${PAL.creamMid};display:flex;align-items:center;justify-content:center;font-family:'Fredoka';font-weight:700;color:${PAL.tealDark};flex-shrink:0;}
.px-row .main{flex:1;min-width:0;}
.px-row .t{font-size:13.5px;font-weight:600;}
.px-row .s{font-size:12px;color:${PAL.inkSoft};}
.px-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;}
.px-stat{background:#fff;border:1.5px solid ${PAL.creamLow};border-radius:10px;padding:14px;}
.px-stat .v{font-family:'Fredoka';font-weight:700;font-size:26px;}
.px-stat .l{font-size:11.5px;color:${PAL.inkSoft};margin-top:2px;}
.px-job{border:1.5px solid ${PAL.creamLow};border-radius:10px;padding:13px;background:#fff;}
.px-job-t{font-size:14px;font-weight:600;}.px-job-c{font-size:12px;color:${PAL.inkSoft};}
.px-match{font-family:'Fredoka';font-weight:700;font-size:15px;}
.px-kanban{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;overflow-x:auto;}
@media(max-width:760px){.px-kanban{grid-template-columns:repeat(5,150px);}}
.px-kcol{background:${PAL.paperDark};border-radius:10px;padding:8px;min-height:60px;}
.px-kcol-h{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:${PAL.inkSoft};margin-bottom:6px;padding:0 4px;}
.px-kcard{background:#fff;border:1px solid ${PAL.creamLow};border-radius:8px;padding:8px;margin-bottom:6px;font-size:12px;}
.px-kcard .n{font-weight:600;}
.px-asm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;}
.px-asm{border:1.5px solid ${PAL.creamLow};border-radius:12px;padding:14px;background:#fff;}
.px-asm .ic{font-size:24px;}
.px-asm .nm{font-family:'Fredoka';font-weight:600;font-size:14px;margin-top:4px;}
.px-asm .sb{font-size:11.5px;color:${PAL.inkSoft};margin-bottom:8px;}
.px-asm select{width:100%;padding:7px 9px;border:1.5px solid ${PAL.creamLow};border-radius:7px;font:inherit;font-size:12px;background:#fff;}
.px-asm .res{margin-top:8px;font-size:12px;font-weight:600;color:${PAL.tealDark};}
.px-mini{font-size:11px;color:${PAL.inkSoft};line-height:1.5;}
.px-editrow{display:flex;gap:6px;align-items:center;}
.px-editrow input{flex:1;padding:7px 9px;border:1.5px solid ${PAL.creamLow};border-radius:7px;font:inherit;font-size:12px;}
.px-xbtn{border:none;background:${PAL.gapBg};color:${PAL.gap};width:26px;height:26px;border-radius:6px;cursor:pointer;font-size:14px;flex-shrink:0;}
`;
