import { useState, useEffect } from "react";

// ── PASTEL GREEN + CREAM — SOLID PROFESSIONAL ────────────────────
const C = {
  bg:       "#FFFFFF",        // white
  surface:  "#F5F5F5",        // light grey surface
  card:     "#FFFFFF",        // pure white cards — crisp
  border:   "#E5E5E5",        // neutral border
  divider:  "#EDE9E0",        // subtle warm divider
  text:     "#1A1A18",        // near-black, warm toned
  sub:      "#4A4A44",        // warm dark grey
  muted:    "#9A9689",        // warm muted
  orange:   "#E8956D",        // pastel orange — primary
  accent:   "#D4784A",        // deeper pastel orange
  accentSoft:"#FBEEE6",       // very light orange tint
  left:     "#7BAFC4",        // muted steel blue
  right:    "#C47B7B",        // muted rose
  center:   "#E8956D",        // pastel orange
  breaking: "#C47B7B",        // muted rose-red
};

const F = {
  display: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif",
  text:    "-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif",
};

// Solid card style — no glass, no blur
const card = () => ({
  background: C.card,
  border: `1px solid ${C.border}`,
  boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)",
});

// Solid button style
const solidBtn = (active) => ({
  background: active ? "rgba(0,0,0,0.08)" : C.surface,
  border: `1px solid ${active ? "rgba(0,0,0,0.18)" : C.border}`,
  borderRadius: 980,
  color: active ? C.text : C.muted,
  fontWeight: active ? 600 : 400,
  cursor: "pointer",
  fontFamily: F.text,
  transition: "all 0.15s",
});

// For backwards compat with glass() calls — just return solid card style
const glass = () => card();
const glassBtn = solidBtn;

const ARTICLES = [];

const CATS = ["All","Breaking","Politics","Tech","Business","Science","World","Health","Uplifting"];
const NAV  = [
  {id:"feed",       label:"Feed"},
  {id:"map",        label:"Map"},
  {id:"balance",    label:"Balance"},
  {id:"dna",        label:"DNA"},
  {id:"profile",    label:"Profile"},
];

const JOURNALISTS = {
  "Reuters":          { outlet:"Reuters",          beat:"World News, Politics, Finance",      trustScore:91, accuracyScore:94, leanHistory:{left:8,center:78,right:14},  corrections:3,  retractions:0, articlesThisYear:12400, bio:"Reuters is an international news organisation owned by Thomson Reuters. Its editorial standards require independent verification before publication.", notableWork:"Breaking coverage of major geopolitical events with verified sourcing.", verified:true },
  "Financial Times":  { outlet:"Financial Times",  beat:"Business, Economics, Policy",        trustScore:88, accuracyScore:91, leanHistory:{left:18,center:68,right:14}, corrections:5,  retractions:1, articlesThisYear:6800,  bio:"The Financial Times is a British daily newspaper focused on business and economic news. Known for rigorous financial reporting.", notableWork:"In-depth investigative reporting on global financial markets.", verified:true },
  "The Atlantic":     { outlet:"The Atlantic",     beat:"Politics, Culture, Ideas",           trustScore:74, accuracyScore:79, leanHistory:{left:62,center:30,right:8},  corrections:9,  retractions:1, articlesThisYear:2100,  bio:"The Atlantic is an American magazine covering news, politics, and cultural issues. Known for long-form journalism and opinion writing.", notableWork:"Award-winning long-form features on American political and social issues.", verified:true },
  "National Review":  { outlet:"National Review",  beat:"Politics, Conservative Commentary", trustScore:68, accuracyScore:72, leanHistory:{left:4,center:22,right:74},  corrections:11, retractions:2, articlesThisYear:1800,  bio:"National Review is an American conservative opinion magazine founded by William F. Buckley Jr. in 1955.", notableWork:"Consistent conservative policy analysis and political commentary.", verified:true },
  "NEJM":             { outlet:"NEJM",             beat:"Medicine, Clinical Research",        trustScore:98, accuracyScore:99, leanHistory:{left:5,center:92,right:3},   corrections:2,  retractions:0, articlesThisYear:890,   bio:"The New England Journal of Medicine is a weekly peer-reviewed medical journal, considered among the most prestigious in the world.", notableWork:"Landmark clinical trial publications shaping modern medical practice.", verified:true },
  "Chicago Tribune":  { outlet:"Chicago Tribune",  beat:"Local News, Politics, Culture",      trustScore:82, accuracyScore:85, leanHistory:{left:22,center:60,right:18}, corrections:7,  retractions:1, articlesThisYear:4200,  bio:"The Chicago Tribune is a daily newspaper based in Chicago, Illinois. Founded in 1847, it is one of the largest newspapers in the US.", notableWork:"Pulitzer Prize-winning local investigative journalism.", verified:true },
  "LA Times":         { outlet:"LA Times",         beat:"West Coast, Politics, Entertainment",trustScore:79, accuracyScore:83, leanHistory:{left:38,center:50,right:12}, corrections:10, retractions:2, articlesThisYear:5600,  bio:"The Los Angeles Times is a daily newspaper based in El Segundo, California. One of the largest metropolitan newspapers in the US.", notableWork:"Award-winning coverage of California politics and entertainment industry.", verified:true },
  "WSJ":              { outlet:"WSJ",              beat:"Business, Finance, Politics",        trustScore:85, accuracyScore:89, leanHistory:{left:10,center:55,right:35}, corrections:6,  retractions:1, articlesThisYear:8900,  bio:"The Wall Street Journal is a US business-focused daily newspaper. Its news reporting is broadly centrist while its opinion section leans right.", notableWork:"Definitive reporting on Wall Street, corporate America, and economic policy.", verified:true },
};

function leanColor(l){ return l==="left"?C.left:l==="right"?C.right:C.center; }

// Format ISO date → "Mar 3, 2026 · 2:14 PM"
function formatDate(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })
      + " · "
      + d.toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit", hour12:true });
  } catch { return null; }
}

function callClaude(prompt) {
  return fetch("https://clarion-proxy.vercel.app/api/claude", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:8000,
      system:"Return ONLY valid JSON. No markdown, no backticks, no preamble.",
      messages:[{role:"user",content:prompt}] })
  }).then(r=>r.json()).then(d=>d.content?.[0]?.text||"");
}

// ─────────────────────────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────────────────────────
function Spinner({ size=20, color=C.blue }) {
  return (
    <>
      <div style={{ width:size, height:size, border:`2px solid ${C.divider}`, borderTopColor:color, borderRadius:"50%", animation:"clarion-spin 0.8s linear infinite", flexShrink:0 }}/>
      <style>{`@keyframes clarion-spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// SHEET WRAPPER (bottom sheet)
// ─────────────────────────────────────────────────────────────────
function Sheet({ onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.22)", zIndex:500, display:"flex", alignItems:"flex-end" }} onClick={onClose}>
      <div style={{ background:C.bg, width:"100%", maxWidth:560, margin:"0 auto", borderRadius:"20px 20px 0 0", padding:"20px 24px 52px", boxShadow:"0 -4px 48px rgba(0,0,0,0.10)", maxHeight:"88vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:40, height:5, background:"rgba(0,0,0,0.12)", borderRadius:99, margin:"0 auto 22px" }}/>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TRUST METER
// ─────────────────────────────────────────────────────────────────
function TrustMeter({ score, size=72 }) {
  const r = size * 0.38, cx = size / 2;
  const circ = Math.PI * r;
  const color = score >= 85 ? "#3A9E6A" : score >= 65 ? "#5CB87A" : "#80C994";
  return (
    <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
      <path d={`M ${cx-r} ${size*.55} A ${r} ${r} 0 0 1 ${cx+r} ${size*.55}`} fill="none" stroke={C.divider} strokeWidth={size*.09} strokeLinecap="round"/>
      <path d={`M ${cx-r} ${size*.55} A ${r} ${r} 0 0 1 ${cx+r} ${size*.55}`} fill="none" stroke={color} strokeWidth={size*.09} strokeLinecap="round" strokeDasharray={`${(score/100)*circ} ${circ}`}/>
      <text x={cx} y={size*.46} textAnchor="middle" fontFamily={F.display} fontSize={size*.27} fontWeight={700} fill={color}>{score}</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// ARTICLE CARD
// ─────────────────────────────────────────────────────────────────
function ArticleCard({ a, onRead, bookmarks, setBookmarks, setVerifying, onJournalist, isLead, isGrid }) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const saved = bookmarks.includes(a.id);
  const lc = leanColor(a.lean);
  const dateStr = formatDate(a.publishedAt);
  const imgH = isLead ? 210 : isGrid ? 110 : 150;

  return (
    <div style={{ borderRadius:20, overflow:"hidden", ...glass(0.68), boxShadow:"0 2px 16px rgba(0,0,0,0.05)", display:"flex", flexDirection:"column" }}>

      {/* ── COLLAPSED ── */}
      <div onClick={()=>{ setOpen(v=>!v); onRead(a.id); }} style={{ cursor:"pointer", flex:1, display:"flex", flexDirection:"column" }}>

        {/* Image */}
        {a.image ? (
          <div style={{ height:imgH, flexShrink:0, overflow:"hidden" }}>
            <img src={a.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
              onError={e=>{ e.target.parentElement.style.background="rgba(123,175,212,0.1)"; e.target.style.display="none"; }}/>
          </div>
        ) : (
          <div style={{ height:imgH, flexShrink:0, background:"linear-gradient(135deg,rgba(123,175,212,0.12),rgba(232,149,109,0.12))", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize: isGrid ? 24 : 32, opacity:0.2 }}>◎</span>
          </div>
        )}

        {/* Text */}
        <div style={{ padding: isGrid ? "10px 12px 12px" : "14px 16px 16px", flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5, overflow:"hidden" }}>
            {a.breaking && <span style={{ fontSize:8, fontWeight:700, color:"#fff", background:C.breaking, borderRadius:4, padding:"1px 5px", fontFamily:F.text, flexShrink:0 }}>LIVE</span>}
            <span onClick={e=>{ e.stopPropagation(); onJournalist(a.source); }}
              style={{ fontSize:10, fontWeight:600, color:C.accent, fontFamily:F.text, cursor:"pointer", flexShrink:0, whiteSpace:"nowrap", maxWidth:"55%", overflow:"hidden", textOverflow:"ellipsis" }}
            >{a.source}</span>
            <span style={{ fontSize:10, color:"rgba(0,0,0,0.18)", flexShrink:0 }}>·</span>
            <span style={{ fontSize:10, color:C.muted, fontFamily:F.text, flexShrink:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{dateStr || a.time}</span>
            <span style={{ marginLeft:"auto", fontSize:9, color:lc, background:lc+"18", borderRadius:20, padding:"1px 6px", fontFamily:F.text, flexShrink:0, fontWeight:600 }}>
              {a.lean==="left"?"◀ L":a.lean==="right"?"▶ R":"● C"}
            </span>
          </div>
          <p style={{
            fontFamily:F.display, margin:0, color:C.text, lineHeight:1.35, letterSpacing:"-0.02em",
            fontSize: isLead ? 18 : isGrid ? 13 : 15,
            fontWeight: isLead ? 700 : 600,
            display:"-webkit-box", WebkitLineClamp: isGrid ? 3 : 5, WebkitBoxOrient:"vertical", overflow:"hidden",
          }}>{a.headline}</p>
          {isLead && a.summary && (
            <p style={{ fontFamily:F.text, fontSize:13, color:C.muted, margin:"6px 0 0", lineHeight:1.6,
              display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
              {a.summary}
            </p>
          )}
        </div>
      </div>

      {/* ── EXPANDED ── */}
      {open && (
        <div style={{ padding:"0 16px 16px" }}>
          <div style={{ height:1, background:"rgba(0,0,0,0.06)", marginBottom:12 }}/>
          <p style={{ fontFamily:F.text, fontSize:14, color:C.sub, lineHeight:1.75, margin:"0 0 12px" }}>{a.summary}</p>
          {dateStr && <p style={{ fontFamily:F.text, fontSize:11, color:C.muted, margin:"0 0 12px" }}>Published {dateStr}</p>}
          <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:12 }}>
            {a.url && (
              <button onClick={()=>window.open(a.url,"_blank","noopener,noreferrer")} style={{
                ...glassBtn(false), padding:"7px 14px", fontSize:12, fontWeight:600,
              }}>Read ↗</button>
            )}
            <button onClick={()=>setBookmarks(v=>saved?v.filter(x=>x!==a.id):[...v,a.id])} style={{
              ...glassBtn(saved), padding:"7px 12px", fontSize:12,
            }}>{saved?"★ Saved":"☆ Save"}</button>
            <button onClick={()=>setVerifying(a)} style={{
              ...glassBtn(false), padding:"7px 12px", fontSize:12,
            }}>Fact Check</button>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Comment…"
              onKeyDown={e=>{ if(e.key==="Enter"&&comment.trim()){setComments(v=>[...v,comment]);setComment("");} }}
              style={{ flex:1, ...glass(0.5), border:"none", borderRadius:10, padding:"8px 12px", fontSize:13, color:C.text, outline:"none", fontFamily:F.text }}/>
            <button onClick={()=>{ if(comment.trim()){setComments(v=>[...v,comment]);setComment("");} }}
              style={{ ...glassBtn(false), padding:"8px 14px", fontSize:13, borderRadius:10 }}>↑</button>
          </div>
          {comments.map((c,i)=>(
            <p key={i} style={{ fontFamily:F.text, fontSize:13, color:C.sub, margin:"8px 0 0", paddingLeft:10, borderLeft:`2px solid ${C.divider}` }}>{c}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// BIAS GAUGE
// ─────────────────────────────────────────────────────────────────
function BiasGauge({ history, allArticles }) {
  const counts = history.reduce((a,id)=>{
    const art = allArticles.find(x=>x.id===id);
    if(art) a[art.lean]=(a[art.lean]||0)+1;
    return a;
  },{left:0,center:0,right:0});
  const total=(counts.left||0)+(counts.center||0)+(counts.right||0)||1;
  const score=((counts.right||0)-(counts.left||0))/total;
  const pct=((score+1)/2)*100;
  const note = score<-0.3?"You've been reading mostly left-leaning sources. Consider mixing in some centrist perspectives."
             : score>0.3 ?"You've been reading mostly right-leaning sources. Consider mixing in some centrist perspectives."
             : "You're reading a well-balanced mix across the political spectrum.";
  return (
    <div>
      <h2 style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:C.text, margin:"0 0 4px", letterSpacing:"-0.02em" }}>Echo Chamber Meter</h2>
      <p style={{ fontFamily:F.text, fontSize:14, color:C.muted, margin:"0 0 28px" }}>Your reading balance, updated in real time.</p>
      <div style={{ position:"relative", height:6, borderRadius:99, background:`linear-gradient(to right,${C.left},${C.center},${C.right})`, marginBottom:10, opacity:0.55 }}>
        <div style={{ position:"absolute", top:"50%", transform:"translate(-50%,-50%)", width:20, height:20, borderRadius:"50%", background:C.bg, border:`2.5px solid ${C.text}`, boxShadow:"0 2px 8px rgba(0,0,0,0.15)", left:`${pct}%`, transition:"left 0.6s cubic-bezier(.34,1.56,.64,1)" }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:F.text, fontSize:10, color:C.muted, fontWeight:600, letterSpacing:"0.08em", marginBottom:28 }}>
        <span>LEFT</span><span>CENTER</span><span>RIGHT</span>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        {[["Left",counts.left||0,C.left],["Center",counts.center||0,C.center],["Right",counts.right||0,C.right]].map(([l,v,c])=>(
          <div key={l} style={{ flex:1, background:C.surface, borderRadius:12, padding:"16px 10px", textAlign:"center" }}>
            <div style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:c, letterSpacing:"-0.02em" }}>{v}</div>
            <div style={{ fontFamily:F.text, fontSize:11, color:C.muted, marginTop:4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background:C.surface, borderRadius:12, padding:"14px 16px", fontSize:14, color:C.sub, fontFamily:F.text, lineHeight:1.6 }}>
        {history.length===0 ? "Open stories in your feed to start tracking balance." : note}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// HEATMAP
// ─────────────────────────────────────────────────────────────────
function HeatMap({ articles, onRegion }) {
  const [hov, setHov] = useState(null);

  // Real US state paths (simplified, accurate outlines) in a 960x600 viewBox
  const STATES = [
    { name:"Alabama",       abbr:"AL", d:"M 550,370 L 565,370 L 568,430 L 545,432 L 542,400 Z" },
    { name:"Alaska",        abbr:"AK", d:"M 100,480 L 160,480 L 180,520 L 140,540 L 90,520 Z" },
    { name:"Arizona",       abbr:"AZ", d:"M 160,310 L 220,310 L 225,390 L 155,390 L 150,350 Z" },
    { name:"Arkansas",      abbr:"AR", d:"M 510,330 L 555,328 L 558,368 L 510,370 Z" },
    { name:"California",    abbr:"CA", d:"M 80,200 L 130,180 L 148,240 L 155,320 L 100,360 L 78,300 Z" },
    { name:"Colorado",      abbr:"CO", d:"M 250,255 L 340,252 L 342,308 L 252,310 Z" },
    { name:"Connecticut",   abbr:"CT", d:"M 760,178 L 778,176 L 780,192 L 762,194 Z" },
    { name:"Delaware",      abbr:"DE", d:"M 742,210 L 752,208 L 754,225 L 744,226 Z" },
    { name:"Florida",       abbr:"FL", d:"M 570,390 L 620,388 L 650,420 L 620,470 L 580,460 L 560,430 Z" },
    { name:"Georgia",       abbr:"GA", d:"M 570,355 L 610,353 L 615,390 L 570,392 Z" },
    { name:"Hawaii",        abbr:"HI", d:"M 240,530 L 300,530 L 305,550 L 235,552 Z" },
    { name:"Idaho",         abbr:"ID", d:"M 165,130 L 210,120 L 215,200 L 180,215 L 162,195 Z" },
    { name:"Illinois",      abbr:"IL", d:"M 530,245 L 558,243 L 562,315 L 528,318 Z" },
    { name:"Indiana",       abbr:"IN", d:"M 558,245 L 583,244 L 585,310 L 560,312 Z" },
    { name:"Iowa",          abbr:"IA", d:"M 460,220 L 528,218 L 530,258 L 462,260 Z" },
    { name:"Kansas",        abbr:"KS", d:"M 348,285 L 455,282 L 457,322 L 350,325 Z" },
    { name:"Kentucky",      abbr:"KY", d:"M 558,300 L 640,295 L 645,325 L 558,330 Z" },
    { name:"Louisiana",     abbr:"LA", d:"M 490,390 L 545,388 L 548,425 L 505,440 L 488,420 Z" },
    { name:"Maine",         abbr:"ME", d:"M 800,100 L 830,95 L 835,145 L 802,148 Z" },
    { name:"Maryland",      abbr:"MD", d:"M 700,228 L 748,224 L 750,244 L 702,248 Z" },
    { name:"Massachusetts", abbr:"MA", d:"M 760,158 L 808,155 L 810,178 L 762,180 Z" },
    { name:"Michigan",      abbr:"MI", d:"M 558,175 L 608,165 L 615,215 L 560,220 Z" },
    { name:"Minnesota",     abbr:"MN", d:"M 440,125 L 510,120 L 515,195 L 442,198 Z" },
    { name:"Mississippi",   abbr:"MS", d:"M 530,360 L 558,358 L 560,418 L 528,420 Z" },
    { name:"Missouri",      abbr:"MO", d:"M 460,285 L 532,282 L 535,345 L 462,348 Z" },
    { name:"Montana",       abbr:"MT", d:"M 198,100 L 358,92 L 362,178 L 200,185 Z" },
    { name:"Nebraska",      abbr:"NE", d:"M 348,245 L 455,242 L 457,282 L 350,285 Z" },
    { name:"Nevada",        abbr:"NV", d:"M 128,200 L 175,185 L 180,295 L 130,310 Z" },
    { name:"New Hampshire", abbr:"NH", d:"M 780,140 L 798,138 L 800,175 L 782,176 Z" },
    { name:"New Jersey",    abbr:"NJ", d:"M 742,195 L 760,192 L 762,225 L 744,228 Z" },
    { name:"New Mexico",    abbr:"NM", d:"M 225,315 L 300,312 L 302,390 L 227,392 Z" },
    { name:"New York",      abbr:"NY", d:"M 690,148 L 778,140 L 782,195 L 692,200 Z" },
    { name:"North Carolina",abbr:"NC", d:"M 620,305 L 735,298 L 738,328 L 622,335 Z" },
    { name:"North Dakota",  abbr:"ND", d:"M 345,118 L 445,112 L 447,158 L 347,162 Z" },
    { name:"Ohio",          abbr:"OH", d:"M 585,230 L 638,227 L 642,295 L 587,298 Z" },
    { name:"Oklahoma",      abbr:"OK", d:"M 345,328 L 505,323 L 508,368 L 347,372 Z" },
    { name:"Oregon",        abbr:"OR", d:"M 82,148 L 178,138 L 182,210 L 84,218 Z" },
    { name:"Pennsylvania",  abbr:"PA", d:"M 650,195 L 742,190 L 745,228 L 652,233 Z" },
    { name:"Rhode Island",  abbr:"RI", d:"M 790,178 L 802,177 L 803,190 L 791,191 Z" },
    { name:"South Carolina",abbr:"SC", d:"M 620,335 L 670,332 L 673,370 L 622,372 Z" },
    { name:"South Dakota",  abbr:"SD", d:"M 345,160 L 447,155 L 450,205 L 347,208 Z" },
    { name:"Tennessee",     abbr:"TN", d:"M 535,328 L 650,322 L 653,352 L 537,358 Z" },
    { name:"Texas",         abbr:"TX", d:"M 295,330 L 480,325 L 485,445 L 360,470 L 278,420 Z" },
    { name:"Utah",          abbr:"UT", d:"M 198,220 L 255,217 L 258,305 L 200,308 Z" },
    { name:"Vermont",       abbr:"VT", d:"M 762,138 L 782,136 L 784,160 L 764,162 Z" },
    { name:"Virginia",      abbr:"VA", d:"M 645,262 L 742,256 L 745,300 L 647,305 Z" },
    { name:"Washington",    abbr:"WA", d:"M 82,88 L 185,80 L 188,142 L 84,148 Z" },
    { name:"Washington D.C.",abbr:"D.C.",d:"M 722,248 L 732,246 L 733,256 L 723,257 Z" },
    { name:"West Virginia", abbr:"WV", d:"M 638,258 L 680,254 L 682,298 L 640,302 Z" },
    { name:"Wisconsin",     abbr:"WI", d:"M 505,158 L 558,153 L 562,220 L 507,224 Z" },
    { name:"Wyoming",       abbr:"WY", d:"M 245,178 L 358,172 L 360,248 L 247,252 Z" },
  ];

  // Regions with real lat/lon coordinates
  const REGIONS = [
    // National
    { name:"National",        abbr:"US",  lat:39.50, lon:-98.35 },
    // Northeast
    { name:"New York",        abbr:"NYC", lat:40.71, lon:-74.01 },
    { name:"Boston",          abbr:"BOS", lat:42.36, lon:-71.06 },
    { name:"Philadelphia",    abbr:"PHL", lat:39.95, lon:-75.16 },
    { name:"Washington D.C.", abbr:"DC",  lat:38.91, lon:-77.04 },
    { name:"Baltimore",       abbr:"BAL", lat:39.29, lon:-76.61 },
    { name:"Pittsburgh",      abbr:"PIT", lat:40.44, lon:-79.99 },
    { name:"Buffalo",         abbr:"BUF", lat:42.88, lon:-78.88 },
    // Southeast
    { name:"Miami",           abbr:"MIA", lat:25.77, lon:-80.19 },
    { name:"Atlanta",         abbr:"ATL", lat:33.75, lon:-84.39 },
    { name:"Charlotte",       abbr:"CLT", lat:35.22, lon:-80.84 },
    { name:"Orlando",         abbr:"ORL", lat:28.54, lon:-81.38 },
    { name:"Tampa",           abbr:"TPA", lat:27.95, lon:-82.46 },
    { name:"Nashville",       abbr:"NSH", lat:36.17, lon:-86.78 },
    { name:"Memphis",         abbr:"MEM", lat:35.15, lon:-90.05 },
    { name:"New Orleans",     abbr:"NO",  lat:29.95, lon:-90.07 },
    { name:"Richmond",        abbr:"RIC", lat:37.54, lon:-77.43 },
    // Midwest
    { name:"Chicago",         abbr:"CHI", lat:41.88, lon:-87.63 },
    { name:"Detroit",         abbr:"DET", lat:42.33, lon:-83.05 },
    { name:"Minneapolis",     abbr:"MIN", lat:44.98, lon:-93.27 },
    { name:"Cleveland",       abbr:"CLE", lat:41.50, lon:-81.69 },
    { name:"Columbus",        abbr:"CMH", lat:39.96, lon:-82.99 },
    { name:"Indianapolis",    abbr:"IND", lat:39.77, lon:-86.16 },
    { name:"Milwaukee",       abbr:"MKE", lat:43.04, lon:-87.91 },
    { name:"Kansas City",     abbr:"KC",  lat:39.10, lon:-94.58 },
    { name:"St. Louis",       abbr:"STL", lat:38.63, lon:-90.20 },
    { name:"Cincinnati",      abbr:"CIN", lat:39.10, lon:-84.51 },
    { name:"Omaha",           abbr:"OMA", lat:41.26, lon:-95.94 },
    // South / Central
    { name:"Texas",           abbr:"TX",  lat:31.97, lon:-99.90 },
    { name:"Houston",         abbr:"HOU", lat:29.76, lon:-95.37 },
    { name:"Dallas",          abbr:"DAL", lat:32.78, lon:-96.80 },
    { name:"San Antonio",     abbr:"SAT", lat:29.42, lon:-98.49 },
    { name:"Austin",          abbr:"AUS", lat:30.27, lon:-97.74 },
    { name:"Oklahoma City",   abbr:"OKC", lat:35.47, lon:-97.52 },
    // Mountain / Southwest
    { name:"Denver",          abbr:"DEN", lat:39.74, lon:-104.98 },
    { name:"Phoenix",         abbr:"PHX", lat:33.45, lon:-112.07 },
    { name:"Las Vegas",       abbr:"LAS", lat:36.17, lon:-115.14 },
    { name:"Salt Lake City",  abbr:"SLC", lat:40.76, lon:-111.89 },
    { name:"Albuquerque",     abbr:"ABQ", lat:35.08, lon:-106.65 },
    { name:"Tucson",          abbr:"TUS", lat:32.22, lon:-110.97 },
    { name:"Boise",           abbr:"BOI", lat:43.62, lon:-116.20 },
    // West Coast
    { name:"Los Angeles",     abbr:"LA",  lat:34.05, lon:-118.24 },
    { name:"San Francisco",   abbr:"SF",  lat:37.77, lon:-122.42 },
    { name:"Seattle",         abbr:"SEA", lat:47.61, lon:-122.33 },
    { name:"Portland",        abbr:"PDX", lat:45.52, lon:-122.68 },
    { name:"San Diego",       abbr:"SD",  lat:32.72, lon:-117.16 },
    { name:"Sacramento",      abbr:"SAC", lat:38.58, lon:-121.49 },
    { name:"Anchorage",       abbr:"ANC", lat:61.22, lon:-149.90 },
    { name:"Honolulu",        abbr:"HNL", lat:21.31, lon:-157.86 },
    // Extra regions often in news
    { name:"Silicon Valley",  abbr:"SV",  lat:37.39, lon:-122.08 },
    { name:"Wall Street",     abbr:"WST", lat:40.71, lon:-74.01 },
    { name:"Capitol Hill",    abbr:"CAP", lat:38.89, lon:-77.01 },
    { name:"Florida",         abbr:"FL",  lat:27.99, lon:-81.76 },
    { name:"California",      abbr:"CA",  lat:36.78, lon:-119.42 },
  ].map(r => ({ ...r, count: articles.filter(a =>
    a.region === r.name || a.region === r.abbr ||
    (r.name === "New York" && (a.region === "New York City" || a.region === "NYC")) ||
    (r.name === "Washington D.C." && (a.region === "Washington" || a.region === "D.C." || a.region === "DC")) ||
    (r.name === "Los Angeles" && a.region === "LA") ||
    (r.name === "San Francisco" && (a.region === "SF" || a.region === "Bay Area")) ||
    (r.name === "Chicago" && a.region === "CHI")
  ).length }));

  const maxCount = Math.max(1, ...REGIONS.map(r => r.count));

  return (
    <div>
      <h2 style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:C.text, margin:"0 0 4px", letterSpacing:"-0.02em" }}>News Heatmap</h2>
      <p style={{ fontFamily:F.text, fontSize:14, color:C.muted, margin:"0 0 16px" }}>Tap a region to filter stories by location.</p>

      <div style={{ position:"relative", borderRadius:16, overflow:"hidden", marginBottom:20, background:C.surface }}>
        <svg viewBox="0 0 900 560" style={{ width:"100%", display:"block" }}>
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#00000018"/>
            </filter>
          </defs>

          {/* Ocean background */}
          <rect width="900" height="560" fill="#F0F0F0"/>

          {/* ── US STATE PATHS (accurate simplified outlines) ── */}
          {/* Pacific Northwest */}
          <path d="M 90,55 L 195,45 L 200,75 L 205,105 L 195,115 L 135,125 L 88,118 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* WA */}
          <path d="M 88,118 L 195,115 L 200,185 L 190,210 L 88,215 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* OR */}
          <path d="M 88,118 L 135,125 L 130,180 L 88,215 Z" fill="#C8DCF0" stroke="#fff" strokeWidth="1.2"/> {/* ID top */}
          <path d="M 130,180 L 195,175 L 200,240 L 175,260 L 128,258 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* ID */}

          {/* California */}
          <path d="M 88,215 L 190,210 L 195,260 L 188,310 L 168,355 L 138,370 L 100,340 L 85,290 L 88,250 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/>

          {/* Southwest */}
          <path d="M 175,260 L 245,256 L 248,330 L 175,332 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* NV */}
          <path d="M 245,256 L 315,252 L 318,330 L 248,330 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* UT */}
          <path d="M 195,260 L 245,256 L 245,332 L 195,335 Z" fill="#C8DCF0" stroke="#fff" strokeWidth="1.2"/> {/* part */}
          <path d="M 175,332 L 248,330 L 250,410 L 172,412 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* AZ */}
          <path d="M 248,330 L 318,328 L 320,405 L 250,408 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* NM */}

          {/* Mountain */}
          <path d="M 315,190 L 390,186 L 394,255 L 318,258 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* MT south */}
          <path d="M 195,115 L 315,108 L 318,190 L 200,195 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* MT */}
          <path d="M 318,190 L 390,186 L 393,255 L 320,258 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* WY */}
          <path d="M 318,256 L 393,252 L 396,320 L 320,323 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* CO */}

          {/* Plains */}
          <path d="M 390,118 L 468,112 L 472,188 L 393,192 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* ND */}
          <path d="M 393,192 L 472,188 L 475,255 L 396,258 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* SD */}
          <path d="M 396,258 L 475,254 L 478,310 L 398,313 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* NE */}
          <path d="M 398,313 L 478,309 L 481,360 L 400,363 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* KS */}
          <path d="M 320,323 L 398,319 L 400,363 L 322,367 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* OK */}

          {/* Texas */}
          <path d="M 322,367 L 480,360 L 485,432 L 452,468 L 388,480 L 330,455 L 305,420 L 310,390 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/>

          {/* Midwest */}
          <path d="M 468,112 L 548,108 L 552,155 L 470,158 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* MN */}
          <path d="M 475,188 L 548,185 L 552,248 L 478,252 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* IA */}
          <path d="M 478,248 L 552,244 L 556,302 L 480,306 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* MO */}
          <path d="M 548,108 L 612,104 L 615,155 L 550,158 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* WI */}
          <path d="M 552,155 L 612,150 L 616,210 L 554,214 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* MI lower */}
          <path d="M 554,210 L 616,206 L 619,258 L 556,262 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* IL */}
          <path d="M 556,258 L 618,254 L 621,308 L 558,312 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* IN-ish */}
          <path d="M 618,210 L 670,206 L 674,262 L 620,266 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* OH */}
          <path d="M 480,360 L 558,356 L 560,402 L 482,405 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* AR */}
          <path d="M 558,356 L 620,352 L 622,395 L 560,398 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* TN-MS */}
          <path d="M 482,405 L 558,400 L 560,450 L 520,462 L 485,448 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* LA */}

          {/* Southeast */}
          <path d="M 620,352 L 680,348 L 683,392 L 622,395 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* GA-AL */}
          <path d="M 622,392 L 680,388 L 685,430 L 668,468 L 635,480 L 610,455 L 608,425 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* FL */}

          {/* Mid-Atlantic & Northeast */}
          <path d="M 670,262 L 725,258 L 728,305 L 672,308 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* WV-VA */}
          <path d="M 672,305 L 728,300 L 732,340 L 675,344 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* NC */}
          <path d="M 675,340 L 730,336 L 733,370 L 678,373 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* SC */}
          <path d="M 678,370 L 732,366 L 735,395 L 680,398 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* GA */}
          <path d="M 612,155 L 690,148 L 694,175 L 735,172 L 738,210 L 694,214 L 690,230 L 614,235 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* NY-PA */}
          <path d="M 692,230 L 738,226 L 741,265 L 694,268 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* MD-DE-NJ */}
          <path d="M 735,148 L 790,142 L 793,172 L 737,175 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* NE states */}
          <path d="M 790,142 L 835,136 L 838,172 L 792,175 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1.2"/> {/* ME */}

          {/* Great Lakes */}
          <path d="M 548,148 L 612,142 L 615,102 L 580,95 L 548,108 Z" fill="#F0F0F0" stroke="#B8D0E8" strokeWidth="0.8" strokeDasharray="3,2"/> {/* Lake Superior */}
          <path d="M 612,150 L 670,145 L 672,195 L 618,198 Z" fill="#F0F0F0" stroke="#B8D0E8" strokeWidth="0.8" strokeDasharray="3,2"/> {/* Lake Michigan */}
          <path d="M 670,145 L 720,140 L 722,175 L 672,178 Z" fill="#F0F0F0" stroke="#B8D0E8" strokeWidth="0.8" strokeDasharray="3,2"/> {/* Lake Erie */}

          {/* Alaska inset */}
          <rect x="20" y="430" width="130" height="95" rx="6" fill="#F0F0F0" stroke="#B8CDE0" strokeWidth="1"/>
          <path d="M 30,510 L 80,480 L 110,490 L 130,470 L 145,490 L 120,515 L 70,520 Z" fill="#D6E4F0" stroke="#fff" strokeWidth="1"/>
          <text x="75" y="543" fontSize="9" fill={C.muted} textAnchor="middle" fontFamily="-apple-system,sans-serif" fontWeight="500">Alaska</text>

          {/* Hawaii inset */}
          <rect x="175" y="460" width="100" height="60" rx="6" fill="#F0F0F0" stroke="#B8CDE0" strokeWidth="1"/>
          <ellipse cx="200" cy="488" rx="12" ry="7" fill="#D6E4F0" stroke="#fff" strokeWidth="1"/>
          <ellipse cx="220" cy="483" rx="9" ry="6" fill="#D6E4F0" stroke="#fff" strokeWidth="1"/>
          <ellipse cx="238" cy="487" rx="8" ry="5" fill="#D6E4F0" stroke="#fff" strokeWidth="1"/>
          <ellipse cx="254" cy="490" rx="7" ry="5" fill="#D6E4F0" stroke="#fff" strokeWidth="1"/>
          <text x="225" y="508" fontSize="9" fill={C.muted} textAnchor="middle" fontFamily="-apple-system,sans-serif" fontWeight="500">Hawaii</text>

          {/* ── NEWS DOTS ── */}
          {REGIONS.filter(r => r.name !== "National").map(r => {
            const hasStories = r.count > 0;
            const intensity = hasStories ? r.count / maxCount : 0;
            const isHov = hov === r.name;

            const lonToX = lon => ((lon - (-125)) / ((-66) - (-125))) * 900;
            const latToY = lat => ((50 - lat) / (50 - 24)) * 500;
            const x = lonToX(r.lon);
            const y = latToY(r.lat);

            return (
              <g key={r.name} style={{ cursor:"pointer" }}
                onClick={() => onRegion(r.name)}
                onMouseEnter={() => setHov(r.name)}
                onMouseLeave={() => setHov(null)}
              >
                {hasStories && <circle cx={x} cy={y} r={12 + intensity * 16} fill={C.blue} fillOpacity={0.18 + intensity * 0.12}/>}
                <circle cx={x} cy={y} r={hasStories ? 8 : 4}
                  fill={hasStories ? C.blue : "#9BBBCC"} fillOpacity={isHov ? 1 : 0.88}/>
                <circle cx={x} cy={y} r={hasStories ? 8 : 4} fill="none" stroke="#fff" strokeWidth="2"/>
                {(hasStories || isHov) && (
                  <>
                    <rect x={x-24} y={y-26} width={48} height={15} rx={4}
                      fill={isHov ? C.text : C.blue} fillOpacity={0.93}/>
                    <text x={x} y={y-15} fontSize="8" fill="#fff"
                      textAnchor="middle" fontFamily="-apple-system,sans-serif" fontWeight="600">
                      {r.abbr}{hasStories ? ` · ${r.count}` : ""}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Region list */}
      {REGIONS.filter(r => r.count > 0).length === 0 ? (
        <p style={{ fontFamily:F.text, fontSize:14, color:C.muted }}>Load stories to see regional coverage.</p>
      ) : (
        REGIONS.filter(r => r.count > 0)
          .sort((a,b) => b.count - a.count)
          .map(r => (
            <div
              key={r.name}
              onClick={() => onRegion(r.name)}
              style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 0", borderBottom:`1px solid ${C.divider}`, cursor:"pointer" }}
            >
              <span style={{ fontFamily:F.text, fontSize:14, color:C.text, fontWeight:500 }}>📍 {r.name}</span>
              <span style={{ fontFamily:F.text, fontSize:13, color:C.accent }}>{r.count} {r.count===1?"story":"stories"} →</span>
            </div>
          ))
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────
// DNA TREE — Live sourcing via NewsData.io + Claude analysis
// ─────────────────────────────────────────────────────────────────
const NEWSDATA_KEY = "pub_9bd9b65fe1654838ae735506c126e32e";

function DNATree({ articles }) {
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [tree, setTree] = useState(null);
  const [error, setError] = useState(null);
  const [exp, setExp] = useState(new Set());
  const [provOpen, setProvOpen] = useState(new Set());

  const tog = id => setExp(p => { const n = new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  const togProv = (e, id) => { e.stopPropagation(); setProvOpen(p => { const n = new Set(p); n.has(id)?n.delete(id):n.add(id); return n; }); };

  const traceDNA = async (searchQuery) => {
    setLoading(true); setError(null); setTree(null); setExp(new Set());
    try {
      const q = encodeURIComponent(searchQuery.split(" ").slice(0,5).join(" "));
      const res = await fetch(`https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&q=${q}&language=en&size=10`);
      const json = await res.json();
      const rawArticles = (json.results || []).filter(a => a.title && a.source_id).slice(0, 8);
      if (rawArticles.length === 0) { setError("No sources found. Try a different search."); setLoading(false); return; }

      const articleList = rawArticles.map((a,i) =>
        `${i+1}. Source: ${a.source_id} | Title: "${a.title}" | Published: ${a.pubDate||"unknown"} | URL: ${a.link||""} | Snippet: ${a.description||""}`
      ).join("\n");

      const result = await callClaude(`You are analyzing how a news story spread. Here are ${rawArticles.length} articles:\n\n${articleList}\n\nReturn ONLY valid JSON:\n{"storyTitle":"short title","root":{"source":"outlet","date":"date","label":"Original Report","lean":"left/center/right","text":"1 sentence","quote":"key phrase","url":"url","wayback":"https://web.archive.org/web/2025/[url]","children":["a"]},"nodes":{"a":{"source":"outlet","date":"date","label":"Follow-up or Reframe or Opinion or Local Angle","lean":"left/center/right","text":"how they covered it differently","quote":"key phrase","quoteChange":"note — start with ⚠ if spin detected","url":"url","wayback":"https://web.archive.org/web/2025/[url]","children":[]}}}\n\nRules: root = earliest article. Flag spin with ⚠. Include all ${rawArticles.length} articles.`);

      const cleaned = result.replace(/```json|```/g,"").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Parse failed");
      const parsed = JSON.parse(match[0]);
      setTree(parsed);
      setExp(new Set(["r", ...(parsed.root.children||[])]));
    } catch(e) {
      setError("Could not trace this story. Try a simpler search term.");
    }
    setLoading(false);
  };

  const hasWarning = node => node && node.quoteChange && node.quoteChange.startsWith("⚠");
  const isOpinion = node => node && (node.label==="Opinion"||node.label==="Counter Opinion");
  const allNodes = tree ? [tree.root, ...Object.values(tree.nodes||{})] : [];
  const warningCount = allNodes.filter(hasWarning).length;

  function Node({ id, node, depth=0 }) {
    if (!node) return null;
    const isRoot = id==="r";
    const c = isRoot ? C.text : leanColor(node.lean||"center");
    const kids = node.children||[];
    const pOpen = provOpen.has(id);
    const warn = hasWarning(node);
    return (
      <div style={{ marginLeft:depth>0?22:0, position:"relative" }}>
        {depth>0&&<div style={{position:"absolute",left:-13,top:0,bottom:0,width:1,background:C.divider}}/>}
        {depth>0&&<div style={{position:"absolute",left:-13,top:22,width:13,height:1,background:C.divider}}/>}
        <div style={{borderBottom:`1px solid ${C.divider}`,paddingBottom:12}}>
          <div onClick={()=>kids.length&&tog(id)} style={{display:"flex",alignItems:"flex-start",gap:10,paddingTop:14,cursor:kids.length?"pointer":"default"}}>
            <div style={{width:3,minHeight:36,background:c,borderRadius:2,flexShrink:0,marginTop:2}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                <span style={{fontFamily:F.text,fontSize:13,fontWeight:700,color:c}}>{node.source}</span>
                {node.date&&<span style={{fontSize:11,color:C.muted,fontFamily:F.text}}>· {node.date}</span>}
                <span style={{fontSize:10,fontWeight:600,fontFamily:F.text,color:isRoot?C.text:isOpinion(node)?"#9B6B00":c,background:isRoot?C.surface:isOpinion(node)?"#FFF8E7":c+"18",borderRadius:4,padding:"2px 7px"}}>{node.label}</span>
                {warn&&<span style={{fontSize:11,color:C.breaking}}>⚠ Spin</span>}
                {kids.length>0&&<span style={{marginLeft:"auto",fontSize:12,color:C.muted}}>{exp.has(id)?"↑":"↓"} {kids.length}</span>}
              </div>
              <p style={{fontFamily:F.text,fontSize:13,color:C.sub,margin:"0 0 8px",lineHeight:1.55}}>{node.text}</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={e=>togProv(e,id)} style={{fontSize:11,fontFamily:F.text,color:pOpen?C.accent:C.muted,background:pOpen?C.accentSoft:C.surface,border:`1px solid ${pOpen?C.accent+"40":C.border}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>{pOpen?"Hide":"🔍 Verify"}</button>
                {node.url&&<button onClick={e=>{e.stopPropagation();window.open(node.url,"_blank","noopener,noreferrer");}} style={{fontSize:11,fontFamily:F.text,color:C.muted,background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>Article ↗</button>}
                {node.wayback&&<button onClick={e=>{e.stopPropagation();window.open(node.wayback,"_blank","noopener,noreferrer");}} style={{fontSize:11,fontFamily:F.text,color:C.muted,background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>📦 Archive</button>}
              </div>
              {pOpen&&(
                <div style={{marginTop:12,background:C.surface,borderRadius:10,padding:"14px 16px",border:`1px solid ${warn?C.breaking+"30":C.border}`}}>
                  {node.quote&&<div style={{marginBottom:10}}><p style={{fontFamily:F.text,fontSize:10,fontWeight:600,color:C.muted,letterSpacing:"0.06em",textTransform:"uppercase",margin:"0 0 5px"}}>{isRoot?"Original Quote":"As Reported"}</p><p style={{fontFamily:F.text,fontSize:13,color:C.sub,margin:0,lineHeight:1.6,paddingLeft:10,borderLeft:`3px solid ${c}`,fontStyle:"italic"}}>"{node.quote}"</p></div>}
                  {node.quoteChange&&<div><p style={{fontFamily:F.text,fontSize:10,fontWeight:600,color:warn?C.breaking:C.muted,letterSpacing:"0.06em",textTransform:"uppercase",margin:"0 0 5px"}}>{warn?"⚠ Narrative Shift":"Editorial Note"}</p><p style={{fontFamily:F.text,fontSize:12,color:warn?C.breaking:C.sub,margin:0,lineHeight:1.6,background:warn?C.breaking+"08":"transparent",borderRadius:6,padding:warn?"6px 10px":0}}>{node.quoteChange.replace("⚠ ","")}</p></div>}
                  {node.wayback&&<div style={{marginTop:10,paddingTop:8,borderTop:`1px solid ${C.divider}`,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,color:C.muted,fontFamily:F.text}}>📦 Archived:</span><span onClick={e=>{e.stopPropagation();window.open(node.wayback,"_blank","noopener,noreferrer");}} style={{fontSize:11,color:C.accent,fontFamily:F.text,cursor:"pointer",textDecoration:"underline"}}>Wayback Machine ↗</span></div>}
                </div>
              )}
            </div>
          </div>
        </div>
        {exp.has(id)&&kids.map(cid=><Node key={cid} id={cid} node={tree.nodes[cid]} depth={depth+1}/>)}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:C.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Story DNA</h2>
      <p style={{fontFamily:F.text,fontSize:14,color:C.muted,margin:"0 0 16px",lineHeight:1.5}}>Search any story to trace how it spread — who published first, what changed, and where spin was introduced.</p>

      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <div style={{flex:1,...glass(0.7),borderRadius:14,display:"flex",alignItems:"center",padding:"0 14px"}}>
          <input value={inputVal} onChange={e=>setInputVal(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&inputVal.trim())traceDNA(inputVal);}}
            placeholder="Type a headline or topic…"
            style={{flex:1,background:"transparent",border:"none",padding:"12px 0",fontSize:14,color:C.text,outline:"none",fontFamily:F.text}}/>
          {inputVal&&<button onClick={()=>setInputVal("")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13}}>✕</button>}
        </div>
        <button onClick={()=>inputVal.trim()&&traceDNA(inputVal)} disabled={loading||!inputVal.trim()}
          style={{background:"#E8956D",border:"none",borderRadius:14,padding:"0 18px",fontSize:13,fontWeight:600,color:"#fff",cursor:"pointer",fontFamily:F.text,opacity:loading||!inputVal.trim()?0.5:1}}>
          {loading?"…":"Trace"}
        </button>
      </div>

      {articles&&articles.length>0&&!tree&&!loading&&(
        <div style={{marginBottom:20}}>
          <p style={{fontFamily:F.text,fontSize:11,fontWeight:600,color:C.muted,letterSpacing:"0.06em",textTransform:"uppercase",margin:"0 0 8px"}}>Quick picks from your feed</p>
          {articles.slice(0,4).map((a,i)=>(
            <button key={i} onClick={()=>{const q=a.headline.split(" ").slice(0,6).join(" ");setInputVal(q);traceDNA(q);}}
              style={{display:"block",width:"100%",textAlign:"left",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 14px",cursor:"pointer",fontFamily:F.text,fontSize:13,color:C.text,lineHeight:1.4,marginBottom:8}}>
              🔍 {a.headline.split(" ").slice(0,9).join(" ")}…
            </button>
          ))}
        </div>
      )}

      {loading&&<div style={{display:"flex",gap:12,alignItems:"center",padding:"40px 0",justifyContent:"center"}}><Spinner/><p style={{fontFamily:F.text,fontSize:14,color:C.muted,margin:0}}>Searching sources & building chain…</p></div>}
      {error&&<p style={{fontFamily:F.text,fontSize:14,color:C.breaking,padding:"20px 0"}}>{error}</p>}

      {tree&&!loading&&(
        <>
          <div style={{display:"flex",gap:10,marginBottom:20}}>
            <div style={{flex:1,background:C.surface,borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontFamily:F.display,fontSize:20,fontWeight:700,color:C.text}}>{allNodes.length}</div>
              <div style={{fontFamily:F.text,fontSize:11,color:C.muted,marginTop:2}}>Sources tracked</div>
            </div>
            <div style={{flex:1,background:warningCount>0?C.breaking+"10":C.surface,borderRadius:10,padding:"12px 14px",textAlign:"center",border:warningCount>0?`1px solid ${C.breaking}30`:"none"}}>
              <div style={{fontFamily:F.display,fontSize:20,fontWeight:700,color:warningCount>0?C.breaking:C.text}}>{warningCount}</div>
              <div style={{fontFamily:F.text,fontSize:11,color:warningCount>0?C.breaking:C.muted,marginTop:2}}>Narrative shifts</div>
            </div>
            <div style={{flex:1,background:"#FFF0E8",borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontFamily:F.display,fontSize:20,fontWeight:700,color:C.orange}}>{allNodes.length}</div>
              <div style={{fontFamily:F.text,fontSize:11,color:C.muted,marginTop:2}}>Archived proofs</div>
            </div>
          </div>
          <div style={{marginBottom:12,paddingBottom:8,borderBottom:`2px solid ${C.divider}`}}>
            <p style={{fontFamily:F.display,fontSize:16,fontWeight:700,color:C.text,margin:0}}>{tree.storyTitle}</p>
          </div>
          <Node id="r" node={tree.root} depth={0}/>
          {Object.entries(tree.nodes||{}).map(([id,node])=>(
            <Node key={id} id={id} node={node} depth={0}/>
          ))}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// FACT CHECK SHEET
// ─────────────────────────────────────────────────────────────────
function FactSheet({ article, onClose }) {
  const [res,setRes]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    callClaude(`Analyze for misinformation. Return JSON: verdict (Verified/Likely Accurate/Needs Context/Disputed), confidence (0-100), bias_rating (left/center/right), red_flags (string array max 2), missing_context (1 sentence), recommendation (1 sentence). Headline: "${article.headline}". Source: ${article.source}.`)
      .then(t=>{
        try{setRes(JSON.parse(t.replace(/```json|```/g,"").trim()));}
        catch{setRes({verdict:"Likely Accurate",confidence:75,bias_rating:article.lean,red_flags:[],missing_context:"Cross-reference with additional sources.",recommendation:"Seek multiple perspectives."});}
        setLoading(false);
      });
  },[]);
  const vc=res?(res.verdict==="Verified"?C.center:res.verdict==="Disputed"?C.right:C.breaking):C.muted;
  return(
    <Sheet onClose={onClose}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <h3 style={{fontFamily:F.display,fontSize:20,fontWeight:700,color:C.text,margin:0,letterSpacing:"-0.02em"}}>Fact Check</h3>
          <p style={{fontFamily:F.text,fontSize:12,color:C.muted,margin:"2px 0 0"}}>Clarion AI Analysis</p>
        </div>
        <button onClick={onClose} style={{background:C.surface,border:"none",borderRadius:99,width:30,height:30,fontSize:14,cursor:"pointer",color:C.muted}}>✕</button>
      </div>
      <p style={{fontFamily:F.text,fontSize:13,color:C.sub,margin:"0 0 20px",lineHeight:1.5,fontStyle:"italic",paddingLeft:12,borderLeft:`2px solid ${C.divider}`}}>"{article.headline}"</p>
      {loading?(
        <div style={{display:"flex",gap:12,alignItems:"center",padding:"28px 0"}}>
          <Spinner/><p style={{fontFamily:F.text,fontSize:13,color:C.muted,margin:0}}>Analyzing…</p>
        </div>
      ):res&&(
        <>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            {[[res.verdict,vc,"Verdict"],[`${res.confidence}%`,C.text,"Confidence"],[res.bias_rating,leanColor(res.bias_rating),"Lean"]].map(([v,c,l])=>(
              <div key={l} style={{flex:1,background:C.surface,borderRadius:12,padding:"13px 10px",textAlign:"center"}}>
                <div style={{fontFamily:F.text,fontSize:12,fontWeight:600,color:c,textTransform:"capitalize"}}>{v}</div>
                <div style={{fontFamily:F.text,fontSize:10,color:C.muted,marginTop:3}}>{l}</div>
              </div>
            ))}
          </div>
          {res.red_flags?.length>0&&(
            <div style={{background:"#FFF5F5",borderRadius:12,padding:"12px 14px",marginBottom:12}}>
              <p style={{fontFamily:F.text,fontSize:11,fontWeight:600,color:C.right,margin:"0 0 6px"}}>⚠ Red Flags</p>
              {res.red_flags.map((f,i)=><p key={i} style={{fontFamily:F.text,fontSize:13,color:C.sub,margin:i>0?"4px 0 0":0}}>· {f}</p>)}
            </div>
          )}
          <div style={{background:C.surface,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
            <p style={{fontFamily:F.text,fontSize:10,fontWeight:600,color:C.muted,margin:"0 0 4px",letterSpacing:"0.06em"}}>MISSING CONTEXT</p>
            <p style={{fontFamily:F.text,fontSize:13,color:C.sub,margin:0,lineHeight:1.5}}>{res.missing_context}</p>
          </div>
          <p style={{fontFamily:F.text,fontSize:13,color:C.sub,margin:0,lineHeight:1.5}}>💡 {res.recommendation}</p>
        </>
      )}
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────────
// JOURNALIST SHEET
// ─────────────────────────────────────────────────────────────────
function JournalistSheet({ source, onClose }) {
  const [aiInsight,setAiInsight]=useState("");
  const [loadingAI,setLoadingAI]=useState(false);
  const j=JOURNALISTS[source];
  const loadInsight=async()=>{
    setLoadingAI(true);
    const t=await callClaude(`In 2 sentences, give a neutral assessment of ${j?.outlet}'s journalistic reputation, editorial approach, and notable strengths or weaknesses. Be factual and balanced.`);
    setAiInsight(t.replace(/```/g,"").trim());
    setLoadingAI(false);
  };
  if(!j) return(
    <Sheet onClose={onClose}>
      <p style={{fontFamily:F.text,fontSize:14,color:C.muted,textAlign:"center",padding:"20px 0"}}>No profile available for this source yet.</p>
    </Sheet>
  );
  const totalLean=j.leanHistory.left+j.leanHistory.center+j.leanHistory.right;
  const trustColor=j.trustScore>=85?"#3A9E6A":j.trustScore>=65?"#5CB87A":"#80C994";
  return(
    <Sheet onClose={onClose}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <h3 style={{fontFamily:F.display,fontSize:20,fontWeight:700,color:C.text,margin:0,letterSpacing:"-0.02em"}}>{j.outlet}</h3>
            {j.verified&&<span style={{fontSize:11,color:C.center,fontWeight:600}}>✓</span>}
          </div>
          <p style={{fontFamily:F.text,fontSize:12,color:C.muted,margin:0}}>{j.beat}</p>
        </div>
        <button onClick={onClose} style={{background:C.surface,border:"none",borderRadius:99,width:30,height:30,fontSize:14,cursor:"pointer",color:C.muted}}>✕</button>
      </div>
      <div style={{display:"flex",gap:12,marginBottom:22}}>
        {[["Trust Score",j.trustScore,trustColor,j.trustScore>=85?"High Trust":j.trustScore>=65?"Moderate Trust":"Low Trust"],["Accuracy",j.accuracyScore,j.accuracyScore>=85?"#3A9E6A":"#5CB87A",j.accuracyScore>=85?"Highly Accurate":"Generally Accurate"]].map(([label,score,color,sublabel])=>(
          <div key={label} style={{flex:1,background:C.surface,borderRadius:14,padding:"16px 10px",textAlign:"center"}}>
            <TrustMeter score={score} size={68}/>
            <p style={{fontFamily:F.text,fontSize:11,fontWeight:600,color,margin:"5px 0 0"}}>{sublabel}</p>
            <p style={{fontFamily:F.text,fontSize:10,color:C.muted,margin:"1px 0 0"}}>{label}</p>
          </div>
        ))}
      </div>
      <div style={{marginBottom:20}}>
        <p style={{fontFamily:F.text,fontSize:10,fontWeight:600,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",margin:"0 0 8px"}}>Political Lean</p>
        <div style={{display:"flex",height:7,borderRadius:99,overflow:"hidden",marginBottom:7}}>
          <div style={{width:`${(j.leanHistory.left/totalLean)*100}%`,background:C.left}}/>
          <div style={{width:`${(j.leanHistory.center/totalLean)*100}%`,background:C.center}}/>
          <div style={{width:`${(j.leanHistory.right/totalLean)*100}%`,background:C.right}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontFamily:F.text,fontSize:11}}>
          <span style={{color:C.left}}>Left {j.leanHistory.left}%</span>
          <span style={{color:C.center}}>Center {j.leanHistory.center}%</span>
          <span style={{color:C.right}}>Right {j.leanHistory.right}%</span>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:18}}>
        {[["Articles/yr",j.articlesThisYear.toLocaleString()],["Corrections",j.corrections],["Retractions",j.retractions]].map(([l,v])=>(
          <div key={l} style={{flex:1,background:C.surface,borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
            <div style={{fontFamily:F.display,fontSize:17,fontWeight:700,color:C.text}}>{v}</div>
            <div style={{fontFamily:F.text,fontSize:10,color:C.muted,marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>
      <p style={{fontFamily:F.text,fontSize:13,color:C.sub,lineHeight:1.65,margin:"0 0 16px"}}>{j.bio}</p>
      <div style={{background:C.surface,borderRadius:12,padding:"13px 14px",marginBottom:16}}>
        <p style={{fontFamily:F.text,fontSize:10,fontWeight:600,color:C.muted,letterSpacing:"0.06em",textTransform:"uppercase",margin:"0 0 4px"}}>Notable Work</p>
        <p style={{fontFamily:F.text,fontSize:13,color:C.sub,margin:0,lineHeight:1.5}}>{j.notableWork}</p>
      </div>
      {!aiInsight&&!loadingAI&&(
        <button onClick={loadInsight} style={{width:"100%",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"11px",fontSize:13,color:C.sub,cursor:"pointer",fontFamily:F.text}}>Get AI Assessment</button>
      )}
      {loadingAI&&<div style={{display:"flex",gap:10,alignItems:"center",padding:"12px 0"}}><Spinner/><p style={{fontFamily:F.text,fontSize:13,color:C.muted,margin:0}}>Analyzing…</p></div>}
      {aiInsight&&(
        <div style={{background:C.surface,borderRadius:12,padding:"13px 14px"}}>
          <p style={{fontFamily:F.text,fontSize:10,fontWeight:600,color:C.muted,letterSpacing:"0.06em",textTransform:"uppercase",margin:"0 0 6px"}}>AI Assessment</p>
          <p style={{fontFamily:F.text,fontSize:13,color:C.sub,margin:0,lineHeight:1.6}}>{aiInsight}</p>
        </div>
      )}
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────────
// PUBLISH SHEET
// ─────────────────────────────────────────────────────────────────
function PublishSheet({ onClose }) {
  const [title,setTitle]=useState("");
  const [body,setBody]=useState("");
  const [done,setDone]=useState(false);
  return(
    <Sheet onClose={onClose}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <h3 style={{fontFamily:F.display,fontSize:20,fontWeight:700,color:C.text,margin:0,letterSpacing:"-0.02em"}}>Write</h3>
          <p style={{fontFamily:F.text,fontSize:12,color:C.muted,margin:"2px 0 0"}}>Publish your perspective to the community</p>
        </div>
        <button onClick={onClose} style={{background:C.surface,border:"none",borderRadius:99,width:30,height:30,fontSize:14,cursor:"pointer",color:C.muted}}>✕</button>
      </div>
      {!done?(
        <>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Headline"
            style={{width:"100%",background:C.surface,border:"none",borderRadius:12,padding:"13px 14px",fontSize:16,fontWeight:600,color:C.text,outline:"none",fontFamily:F.display,marginBottom:10,boxSizing:"border-box",letterSpacing:"-0.01em"}}/>
          <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your perspective…" rows={5}
            style={{width:"100%",background:C.surface,border:"none",borderRadius:12,padding:"13px 14px",fontSize:14,color:C.text,outline:"none",fontFamily:F.text,resize:"none",boxSizing:"border-box",marginBottom:16,lineHeight:1.6}}/>
          <button onClick={()=>{if(title&&body)setDone(true);}}
            style={{width:"100%",background:C.text,border:"none",borderRadius:10,padding:"14px",fontSize:15,color:"#fff",cursor:"pointer",fontFamily:F.text,fontWeight:600}}>
            Publish
          </button>
        </>
      ):(
        <div style={{textAlign:"center",padding:"24px 0"}}>
          <p style={{fontFamily:F.display,fontSize:20,fontWeight:700,color:C.text,margin:"0 0 6px",letterSpacing:"-0.02em"}}>Published.</p>
          <p style={{fontFamily:F.text,fontSize:14,color:C.muted,margin:0}}>Your take is live in the community feed.</p>
        </div>
      )}
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────
export default function ClarionFinal() {
  const [tab,setTab]=useState("feed");
  const [category,setCategory]=useState("All");
  const [searchInput,setSearchInput]=useState("");
  const [search,setSearch]=useState("");
  const [bookmarks,setBookmarks]=useState([]);
  const [history,setHistory]=useState([]);
  const [verifying,setVerifying]=useState(null);
  const [showWrite,setShowWrite]=useState(false);
  const [journalist,setJournalist]=useState(null);
  const [regionFilter,setRegionFilter]=useState(null);
  const [aiArticles,setAiArticles]=useState([]);
  const [aiLoading,setAiLoading]=useState(false);
  const [briefing,setBriefing]=useState(null);
  const [briefingLoading,setBriefingLoading]=useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const all=[...aiArticles,...ARTICLES];
  const feed=all.filter(a=>{
    if(category!=="All"&&a.category!==category) return false;
    if(search&&!a.headline.toLowerCase().includes(search.toLowerCase())&&!a.source.toLowerCase().includes(search.toLowerCase())) return false;
    if(regionFilter&&a.region!==regionFilter) return false;
    return true;
  });

  const onRead=id=>setHistory(v=>v.includes(id)?v:[...v,id]);

  const loadAI = async () => {
    setAiLoading(true);
    try {
      // Fetch from multiple categories in parallel via proxy
      const res = await fetch("https://clarion-proxy.vercel.app/api/gnews");
      const json = await res.json();
      const articles = (json.articles || []).filter(a => a.title && a.url).slice(0, 40);

      if (articles.length > 0) {
        // Show articles immediately
        const initial = articles.map((a, i) => ({
          id: 200 + i,
          headline: a.title,
          summary: a.description || "",
          source: a.source?.name || "Unknown",
          url: a.url,
          image: a.image || null,
          publishedAt: a.publishedAt || null,
          lean: "center",
          category: "Breaking",
          time: "Live",
          breaking: false,
          region: "National",
          verified: true,
        }));
        setAiArticles(initial);

        // Enrich with Claude — lean, category, region, breaking
        const lineList = articles.map((a, i) =>
          `${i+1}. Source: "${a.source?.name||"Unknown"}" | Headline: "${a.title}" | Desc: "${(a.description||"").slice(0,120)}"`
        ).join("\n");

        const enriched = await callClaude(
          `You are a news editor. Analyze these ${articles.length} real headlines and return ONLY a JSON array (same order, no extra text). Each object must have:
- lean: "left" / "center" / "right" (based on source reputation AND headline framing — e.g. Fox/WSJ/Breitbart lean right, NYT/Guardian/NPR lean left, Reuters/AP/BBC are center)
- category: one of Politics / Tech / Business / Science / Uplifting / Breaking / World / Health
- region: most specific US city (e.g. "Washington D.C.", "New York", "Los Angeles") or country name for international, or "National"
- breaking: true only if genuinely urgent breaking news

Headlines:
${lineList}`
        );

        const clean = enriched.replace(/\`\`\`json|\`\`\`/g, "").trim();
        const match = clean.match(/\[[\s\S]*\]/);
        if (match) {
          const tags = JSON.parse(match[0]);
          setAiArticles(initial.map((a, i) => ({
            ...a,
            lean: tags[i]?.lean || "center",
            category: tags[i]?.category || "Breaking",
            region: tags[i]?.region || "National",
            breaking: tags[i]?.breaking || false,
          })));
        }
      }
    } catch (e) {
      console.error("loadAI failed:", e);
    }
    setAiLoading(false);
  };

  useEffect(()=>{ loadAI(); },[]);

  const loadBriefing=async()=>{
    setBriefingLoading(true);
    try{
      const t=await callClaude("Daily news briefing. Return JSON: overview (2 sentences), stories ([{headline,insight}]×3), uplifting (1 warm closing sentence).");
      setBriefing(JSON.parse(t.replace(/```json|```/g,"").trim()));
    }catch(e){}
    setBriefingLoading(false);
  };

  return(
    <div style={{
      background: C.bg,
      minHeight: "100vh",
      fontFamily: F.text,
    }}>
      <style>{`
        @keyframes clarion-spin { to { transform: rotate(360deg); } }
        @keyframes tab-pop { 0% { transform: scale(0.85); opacity:0.5; } 100% { transform: scale(1); opacity:1; } }
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {verifying  && <FactSheet article={verifying} onClose={()=>setVerifying(null)}/>}
      {showWrite  && <PublishSheet onClose={()=>setShowWrite(false)}/>}
      {journalist && <JournalistSheet source={journalist} onClose={()=>setJournalist(null)}/>}

      {/* ── HEADER ── */}
      <div style={{
        position:"sticky", top:0, zIndex:100,
        background: C.bg,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{maxWidth:640, margin:"0 auto", padding:"16px 20px 12px"}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
            {/* Logo image */}
            <img
              src="data:image/png;base64,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"
              alt="Clarion."
              style={{ height:60, width:"auto", display:"block", objectFit:"contain" }}
            />

            {/* Search icon + Refresh */}
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <button onClick={()=>setShowSearch(v=>!v)} style={{
                width:36, height:36, borderRadius:980,
                display:"flex", alignItems:"center", justifyContent:"center",
                ...glass(0.65), border:"1px solid rgba(0,0,0,0.08)",
                cursor:"pointer", flexShrink:0, transition:"all 0.2s",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={showSearch ? C.text : C.muted} strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
                </svg>
              </button>
              <button onClick={loadAI} disabled={aiLoading} style={{
              background: "#E8956D",
              border:"none", borderRadius:980,
              padding:"8px 18px", fontSize:12, fontWeight:600,
              color:"#fff", cursor:"pointer", fontFamily:F.text,
              boxShadow:"0 2px 10px rgba(232,149,109,0.45)",
              opacity: aiLoading ? 0.6 : 1,
              transition:"all 0.2s",
              letterSpacing:"0.01em",
            }}>
              {aiLoading ? "Loading…" : "↻ Refresh"}
            </button>
            </div>
          </div>

          {/* Search — icon that expands */}
          {showSearch && (
            <div style={{
              ...glass(0.75),
              borderRadius: 16,
              display:"flex", alignItems:"center", gap:8,
              padding:"0 14px",
              marginBottom: 2,
              animation: "tab-pop 0.15s ease",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
              </svg>
              <input
                autoFocus
                value={searchInput}
                onChange={e=>setSearchInput(e.target.value)}
                onKeyDown={e=>{
                  if(e.key==="Enter"){ setSearch(searchInput); setShowSearch(false); }
                  if(e.key==="Escape"){ setSearch(""); setSearchInput(""); setShowSearch(false); }
                }}
                placeholder="Search stories, topics, sources…"
                style={{
                  flex:1, background:"transparent", border:"none",
                  padding:"12px 0", fontSize:14, color:C.text,
                  outline:"none", fontFamily:F.text,
                }}
              />
              <button onClick={()=>{ setSearch(""); setSearchInput(""); setShowSearch(false); }}
                style={{background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:15, lineHeight:1}}>✕</button>
            </div>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{maxWidth:640, margin:"0 auto", padding:"8px 16px 120px"}}>

        {/* FEED */}
        {tab==="feed" && (
          <>
            {/* Category pills — polished scrollable row */}
            <div style={{ position:"relative", margin:"12px -16px 8px" }}>
              {/* Soft fade on both edges */}
              <div style={{ position:"absolute", left:0, top:0, bottom:0, width:24, zIndex:2, background:"linear-gradient(to right, #FFFFFF 40%, transparent)", pointerEvents:"none" }}/>
              <div style={{ position:"absolute", right:0, top:0, bottom:0, width:24, zIndex:2, background:"linear-gradient(to left, #FFFFFF 40%, transparent)", pointerEvents:"none" }}/>

              <div style={{ display:"flex", gap:8, overflowX:"auto", padding:"6px 24px 10px", scrollbarWidth:"none" }}>
                {CATS.map(c => (
                  <button key={c} onClick={()=>setCategory(c)} style={{
                    flexShrink: 0,
                    padding: "8px 20px",
                    fontSize: 12,
                    fontFamily: F.text,
                    fontWeight: category===c ? 600 : 400,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    borderRadius: 980,
                    transition: "all 0.2s",
                    border: category===c
                      ? "1px solid rgba(0,0,0,0.13)"
                      : "1px solid rgba(0,0,0,0.07)",
                    background: category===c
                      ? "rgba(255,255,255,0.96)"
                      : "rgba(255,255,255,0.42)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    color: category===c ? C.text : C.muted,
                    boxShadow: category===c
                      ? "0 2px 14px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,1)"
                      : "none",
                  }}>
                    {c}
                  </button>
                ))}
                {regionFilter && (
                  <button onClick={()=>setRegionFilter(null)} style={{
                    flexShrink:0, padding:"8px 16px", fontSize:12,
                    fontFamily:F.text, fontWeight:500, whiteSpace:"nowrap",
                    cursor:"pointer", borderRadius:980,
                    border:"1px solid rgba(0,0,0,0.08)",
                    background:"rgba(255,255,255,0.6)",
                    backdropFilter:"blur(14px)",
                    color:C.muted, boxShadow:"none",
                  }}>
                    📍 {regionFilter} ✕
                  </button>
                )}
              </div>
            </div>

            {feed.length===0 && (
              <div style={{display:"flex", gap:12, alignItems:"center", justifyContent:"center", padding:"60px 0"}}>
                <Spinner/>
                <p style={{fontFamily:F.text, fontSize:14, color:C.muted, margin:0}}>Loading live stories…</p>
              </div>
            )}
            {feed.length > 0 && (() => {
              const [lead, ...rest] = feed;
              const pairs = [];
              for (let i = 0; i < rest.length; i += 2) pairs.push(rest.slice(i, i+2));
              return (
                <>
                  {/* Lead story — full width */}
                  <div style={{ marginBottom:10 }}>
                    <ArticleCard a={lead} onRead={onRead} bookmarks={bookmarks} setBookmarks={setBookmarks} setVerifying={setVerifying} onJournalist={setJournalist} isLead={true} isGrid={false}/>
                  </div>
                  {/* 2-column grid for the rest */}
                  {pairs.map((pair, pi) => (
                    <div key={pi} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                      {pair.map(a => (
                        <ArticleCard key={a.id} a={a} onRead={onRead} bookmarks={bookmarks} setBookmarks={setBookmarks} setVerifying={setVerifying} onJournalist={setJournalist} isLead={false} isGrid={true}/>
                      ))}
                    </div>
                  ))}
                </>
              );
            })()}
          </>
        )}

        {tab==="map" && (
          <div style={{paddingTop:20}}>
            <HeatMap articles={all} onRegion={r=>{setRegionFilter(r===regionFilter?null:r);setTab("feed");}}/>
          </div>
        )}

        {tab==="balance" && (
          <div style={{paddingTop:20}}>
            <BiasGauge history={history} allArticles={all}/>
            {history.length>0&&(
              <>
                <h3 style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text,margin:"32px 0 4px",letterSpacing:"-0.01em"}}>Suggested for Balance</h3>
                <p style={{fontFamily:F.text,fontSize:13,color:C.muted,margin:"0 0 16px"}}>Stories you haven't read yet.</p>
                {all.filter(a=>!history.includes(a.id)).slice(0,5).map(a=>(
                  <div key={a.id} onClick={()=>onRead(a.id)} style={{display:"flex",gap:12,padding:"14px 0",borderBottom:`1px solid ${C.divider}`,cursor:"pointer",alignItems:"flex-start"}}>
                    <span style={{fontSize:11,color:leanColor(a.lean),fontWeight:600,fontFamily:F.text,paddingTop:2,flexShrink:0}}>{a.lean}</span>
                    <div>
                      <p style={{fontFamily:F.text,fontSize:14,color:C.text,fontWeight:500,margin:"0 0 3px",lineHeight:1.35}}>{a.headline}</p>
                      <p style={{fontFamily:F.text,fontSize:12,color:C.muted,margin:0}}>{a.source}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}


        {tab==="dna" && <div style={{paddingTop:20}}><DNATree articles={all}/></div>}

        {tab==="profile" && (
          <div style={{paddingTop:20}}>

            {/* ── DAILY BRIEFING ── */}
            <h2 style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:C.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Daily Briefing</h2>
            <p style={{fontFamily:F.text,fontSize:14,color:C.muted,margin:"0 0 20px"}}>
              {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
            </p>
            {!briefing&&!briefingLoading&&(
              <button onClick={loadBriefing} style={{
                background:"#E8956D", border:"none", borderRadius:12,
                padding:"12px 24px", fontSize:14, fontWeight:600,
                color:"#fff", cursor:"pointer", fontFamily:F.text,
                boxShadow:"0 2px 10px rgba(232,149,109,0.35)", marginBottom:24,
              }}>Generate Briefing</button>
            )}
            {briefingLoading&&<div style={{display:"flex",gap:12,alignItems:"center",padding:"20px 0",marginBottom:16}}><Spinner/><p style={{fontFamily:F.text,fontSize:14,color:C.muted,margin:0}}>Crafting your briefing…</p></div>}
            {briefing&&(
              <div style={{marginBottom:32}}>
                <p style={{fontFamily:F.text,fontSize:15,color:C.sub,lineHeight:1.7,margin:"0 0 24px",paddingLeft:14,borderLeft:`3px solid ${C.blue}`}}>{briefing.overview}</p>
                {(briefing.stories||[]).map((s,i)=>(
                  <div key={i} style={{...glass(0.6),borderRadius:14,padding:"14px 16px",marginBottom:10}}>
                    <p style={{fontFamily:F.display,fontSize:15,fontWeight:600,color:C.text,margin:"0 0 6px"}}>{s.headline}</p>
                    <p style={{fontFamily:F.text,fontSize:13,color:C.muted,margin:0,lineHeight:1.6}}>{s.insight}</p>
                  </div>
                ))}
                <p style={{fontFamily:F.text,fontSize:14,color:C.sub,margin:"16px 0 0",lineHeight:1.6,fontStyle:"italic"}}>{briefing.uplifting}</p>
                <button onClick={loadBriefing} style={{...glassBtn(false),marginTop:14,padding:"9px 18px",fontSize:12}}>Regenerate</button>
              </div>
            )}

            {/* ── DIVIDER ── */}
            <div style={{height:1,background:C.divider,margin:"8px 0 24px"}}/>

            {/* ── SAVED STORIES ── */}
            <h2 style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:C.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Saved</h2>
            <p style={{fontFamily:F.text,fontSize:14,color:C.muted,margin:"0 0 20px"}}>{bookmarks.length} {bookmarks.length===1?"story":"stories"}</p>
            {bookmarks.length===0
              ? <p style={{fontFamily:F.text,fontSize:14,color:C.muted}}>Tap "Save" on any story to find it here.</p>
              : all.filter(a=>bookmarks.includes(a.id)).map((a,i)=>(
                  <ArticleCard key={a.id} a={a} onRead={onRead} bookmarks={bookmarks} setBookmarks={setBookmarks} setVerifying={setVerifying} onJournalist={setJournalist} isLead={i===0} isGrid={false}/>
                ))
            }

            {/* ── DIVIDER ── */}
            <div style={{height:1,background:C.divider,margin:"24px 0"}}/>

            {/* ── JOURNALIST PROFILES ── */}
            <h2 style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:C.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Sources</h2>
            <p style={{fontFamily:F.text,fontSize:14,color:C.muted,margin:"0 0 20px"}}>Tap any source to see their trust profile.</p>
            {Object.values(JOURNALISTS).map(j => {
              const trustColor = j.trustScore>=85?"#3A9E6A":j.trustScore>=65?"#5CB87A":"#80C994";
              return (
                <div key={j.outlet} onClick={()=>setJournalist(j.outlet)}
                  style={{...glass(0.65),borderRadius:16,padding:"14px 16px",marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
                  <TrustMeter score={j.trustScore} size={48}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <span style={{fontFamily:F.display,fontSize:15,fontWeight:700,color:C.text}}>{j.outlet}</span>
                      {j.verified&&<span style={{fontSize:11,color:"#3A9E6A",fontWeight:600}}>✓</span>}
                    </div>
                    <p style={{fontFamily:F.text,fontSize:12,color:C.muted,margin:0}}>{j.beat}</p>
                  </div>
                  <div style={{textAlign:"center",flexShrink:0}}>
                    <div style={{fontFamily:F.display,fontSize:18,fontWeight:700,color:trustColor}}>{j.trustScore}</div>
                    <div style={{fontFamily:F.text,fontSize:9,color:C.muted}}>Trust</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── INSTAGRAM-STYLE BOTTOM NAV ── */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:200,
        background: C.card,
        borderTop: `1px solid ${C.border}`,
        borderRadius:"20px 20px 0 0",
        boxShadow: "0 -2px 20px rgba(0,0,0,0.06)",
        padding:"10px 8px 20px",
      }}>
        <div style={{
          display:"flex", justifyContent:"space-around", alignItems:"center",
          maxWidth:480, margin:"0 auto",
        }}>
          {[
            { id:"feed",    label:"Feed",    svg:<path d="M3 5h18M3 10h18M3 15h12" strokeWidth="1.8" strokeLinecap="round"/> },
            { id:"map",     label:"Map",     svg:<><path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" strokeWidth="1.6" strokeLinejoin="round"/><path d="M9 3v15M15 6v15" strokeWidth="1.6"/></> },
            { id:"balance", label:"Balance", svg:<><circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M12 12 L6 7 M12 12 L18 7 M5 17h14M12 4v2" strokeWidth="1.7" strokeLinecap="round"/></> },
            { id:"dna",     label:"DNA",     svg:<><path d="M7 3c0 4 10 4 10 8S7 15 7 19M17 3c0 4-10 4-10 8s10 4 10 8" strokeWidth="1.7" strokeLinecap="round"/></> },
            { id:"profile", label:"Profile", svg:<><circle cx="12" cy="8" r="4" strokeWidth="1.7"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeWidth="1.7" strokeLinecap="round"/></> },
          ].map(n => {
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                style={{
                  display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                  background:"none", border:"none", cursor:"pointer",
                  padding:"6px 8px", borderRadius:16,
                  transition:"all 0.2s",
                  animation: active ? "tab-pop 0.2s ease" : "none",
                }}
              >
                {/* Icon bubble */}
                <div style={{
                  width:40, height:30,
                  borderRadius:10,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"all 0.2s",
                  ...(active ? {
                    background: C.accentSoft,
                    border: "1px solid rgba(0,0,0,0.12)",
                  } : {
                    background:"transparent",
                    border: "1px solid transparent",
                  }),
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={active ? C.text : C.muted} strokeWidth="1.7"
                    style={{ transition:"all 0.2s" }}>
                    {n.svg}
                  </svg>
                </div>
                <span style={{
                  fontFamily:F.text, fontSize:9, fontWeight: active ? 600 : 400,
                  color: active ? C.text : C.muted,
                  letterSpacing:"0.02em",
                  transition:"all 0.2s",
                }}>
                  {n.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
