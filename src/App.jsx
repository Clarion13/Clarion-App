import { useState, useEffect, useRef } from "react";

// ── PASTEL GREEN + CREAM — SOLID PROFESSIONAL ────────────────────
const LIGHT = {
  bg:"#FFFFFF", surface:"#F5F5F5", card:"#FFFFFF", border:"#E5E5E5",
  divider:"#EDE9E0", text:"#1A1A18", sub:"#4A4A44", muted:"#9A9689",
  orange:"#E8956D", accent:"#D4784A", accentSoft:"#FBEEE6",
  left:"#7BAFC4", right:"#C47B7B", center:"#E8956D", breaking:"#C47B7B",
};
const DARK = {
  bg:"#0F0F0F", surface:"#1A1A1A", card:"#1E1E1E", border:"#2A2A2A",
  divider:"#252525", text:"#F0EDE8", sub:"#B0ACA6", muted:"#666260",
  orange:"#E8956D", accent:"#D4784A", accentSoft:"#2A1A12",
  left:"#7BAFC4", right:"#C47B7B", center:"#E8956D", breaking:"#C47B7B",
};
// C is set dynamically — see App component
// C is a mutable ref — components always read the latest theme
const C = { ...LIGHT };

const F = {
  display: "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif",
  text:    "-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif",
};

// Solid card style — no glass, no blur
const card = () => ({
  background: C.card,
  border: `1px solid ${C.border}`,
  boxShadow: "none",
});

// Solid button style
const solidBtn = (active) => ({
  background: active ? "rgba(0,0,0,0.08)" : C.surface,
  border: `1px solid ${C.border}`,
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

// Decode HTML entities in article text (e.g. &#8216; -> ' , &amp; -> &)
function decodeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&ndash;/g, "–").replace(/&mdash;/g, "—")
    .replace(/&lsquo;/g, "'").replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, "“").replace(/&rdquo;/g, "”")
    .replace(/&hellip;/g, "…").replace(/&bull;/g, "•")
    .replace(/<[^>]+>/g, "").trim();
}

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
function Spinner({ size=20, color=C.accent }) {
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
function ArticleCard({ a, onRead, bookmarks, setBookmarks, setVerifying, onJournalist, isLead, isGrid, onCompare }) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [imgOk, setImgOk] = useState(!!a.image);
  const saved = bookmarks.includes(a.id);
  const lc = leanColor(a.lean);
  const dateStr = formatDate(a.publishedAt);
  const imgH = isLead ? 210 : isGrid ? 110 : 150;

  // Update imgOk if article image prop changes
  useEffect(() => { setImgOk(!!a.image); }, [a.image]);

  const handleImgError = () => setImgOk(false);

  const Fallback = () => (
    <div style={{ height:imgH, flexShrink:0, background:`linear-gradient(135deg,${lc}18,${lc}08)`, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:4 }}>
      <div style={{ fontSize: isGrid ? 22 : 30, fontWeight:700, color:lc, opacity:0.6, fontFamily:"'Times New Roman',serif", lineHeight:1 }}>{(a.source||"?")[0].toUpperCase()}</div>
      <div style={{ fontSize:10, color:lc, opacity:0.45, fontFamily:F.text }}>{a.source}</div>
    </div>
  );

  return (
    <div style={{ borderRadius:20, overflow:"hidden", ...glass(0.68), boxShadow:"none", display:"flex", flexDirection:"column" }}>

      {/* ── COLLAPSED ── */}
      <div onClick={()=>{ setOpen(v=>!v); onRead(a.id); }} style={{ cursor:"pointer", flex:1, display:"flex", flexDirection:"column" }}>

        {/* Image */}
        {a.image && imgOk ? (
          <div style={{ height:imgH, flexShrink:0, overflow:"hidden", background:C.surface }}>
            <img src={a.image} alt=""
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
              onError={handleImgError}/>
          </div>
        ) : (
          <Fallback/>
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
          }}>{decodeHTML(a.headline)}</p>
          {isLead && a.summary && (
            <p style={{ fontFamily:F.text, fontSize:13, color:C.muted, margin:"6px 0 0", lineHeight:1.6,
              display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
              {decodeHTML(a.summary)}
            </p>
          )}
        </div>
      </div>

      {/* ── EXPANDED ── */}
      {open && (
        <div style={{ padding:"0 16px 16px" }}>
          <div style={{ height:1, background:"rgba(0,0,0,0.06)", marginBottom:12 }}/>
          <p style={{ fontFamily:F.text, fontSize:14, color:C.sub, lineHeight:1.75, margin:"0 0 12px" }}>{decodeHTML(a.summary)}</p>
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
            {onCompare && <button onClick={e=>{e.stopPropagation();onCompare(a);}} style={{
              ...glassBtn(false), padding:"7px 12px", fontSize:12,
            }}>⚖ Compare</button>}
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
// HEATMAP — Mapbox interactive map
// ─────────────────────────────────────────────────────────────────
const MAPBOX_TOKEN = "pk.eyJ1IjoiY2xhcmlvbjEzIiwiYSI6ImNtbWNxMmxuOTA4dnQycXE1a2h0OWV1ZHUifQ.Vix6Aa28lbFYADZP1uOkFA";

const CITIES = [
  // US Cities
  {name:"New York",lat:40.7128,lng:-74.0060},
  {name:"Los Angeles",lat:34.0522,lng:-118.2437},
  {name:"Chicago",lat:41.8781,lng:-87.6298},
  {name:"Houston",lat:29.7604,lng:-95.3698},
  {name:"Washington D.C.",lat:38.9072,lng:-77.0369},
  {name:"San Francisco",lat:37.7749,lng:-122.4194},
  {name:"Seattle",lat:47.6062,lng:-122.3321},
  {name:"Miami",lat:25.7617,lng:-80.1918},
  {name:"Boston",lat:42.3601,lng:-71.0589},
  {name:"Atlanta",lat:33.7490,lng:-84.3880},
  {name:"Dallas",lat:32.7767,lng:-96.7970},
  {name:"Denver",lat:39.7392,lng:-104.9903},
  {name:"Las Vegas",lat:36.1699,lng:-115.1398},
  {name:"Austin",lat:30.2672,lng:-97.7431},
  {name:"Phoenix",lat:33.4484,lng:-112.0740},
  {name:"Nashville",lat:36.1627,lng:-86.7816},
  {name:"Portland",lat:45.5051,lng:-122.6750},
  {name:"Minneapolis",lat:44.9778,lng:-93.2650},
  {name:"Detroit",lat:42.3314,lng:-83.0458},
  {name:"Philadelphia",lat:39.9526,lng:-75.1652},
  {name:"San Diego",lat:32.7157,lng:-117.1611},
  {name:"Tampa",lat:27.9506,lng:-82.4572},
  {name:"Baltimore",lat:39.2904,lng:-76.6122},
  {name:"Salt Lake City",lat:40.7608,lng:-111.8910},
  {name:"New Orleans",lat:29.9511,lng:-90.0715},
  // Europe
  {name:"London",lat:51.5074,lng:-0.1278},
  {name:"Paris",lat:48.8566,lng:2.3522},
  {name:"Berlin",lat:52.5200,lng:13.4050},
  {name:"Moscow",lat:55.7558,lng:37.6173},
  {name:"Kyiv",lat:50.4501,lng:30.5234},
  {name:"Brussels",lat:50.8503,lng:4.3517},
  {name:"Rome",lat:41.9028,lng:12.4964},
  {name:"Madrid",lat:40.4168,lng:-3.7038},
  {name:"Amsterdam",lat:52.3676,lng:4.9041},
  {name:"Warsaw",lat:52.2297,lng:21.0122},
  {name:"Stockholm",lat:59.3293,lng:18.0686},
  {name:"Zurich",lat:47.3769,lng:8.5417},
  {name:"Athens",lat:37.9838,lng:23.7275},
  {name:"Vienna",lat:48.2082,lng:16.3738},
  // Middle East & Africa
  {name:"Tel Aviv",lat:32.0853,lng:34.7818},
  {name:"Gaza",lat:31.5017,lng:34.4668},
  {name:"Beirut",lat:33.8938,lng:35.5018},
  {name:"Tehran",lat:35.6892,lng:51.3890},
  {name:"Riyadh",lat:24.7136,lng:46.6753},
  {name:"Dubai",lat:25.2048,lng:55.2708},
  {name:"Istanbul",lat:41.0082,lng:28.9784},
  {name:"Cairo",lat:30.0444,lng:31.2357},
  {name:"Nairobi",lat:-1.2921,lng:36.8219},
  {name:"Lagos",lat:6.5244,lng:3.3792},
  {name:"Johannesburg",lat:-26.2041,lng:28.0473},
  // Asia Pacific
  {name:"Beijing",lat:39.9042,lng:116.4074},
  {name:"Shanghai",lat:31.2304,lng:121.4737},
  {name:"Hong Kong",lat:22.3193,lng:114.1694},
  {name:"Tokyo",lat:35.6762,lng:139.6503},
  {name:"Seoul",lat:37.5665,lng:126.9780},
  {name:"Taipei",lat:25.0330,lng:121.5654},
  {name:"Singapore",lat:1.3521,lng:103.8198},
  {name:"Mumbai",lat:19.0760,lng:72.8777},
  {name:"New Delhi",lat:28.6139,lng:77.2090},
  {name:"Islamabad",lat:33.6844,lng:73.0479},
  {name:"Kabul",lat:34.5553,lng:69.2075},
  {name:"Sydney",lat:-33.8688,lng:151.2093},
  {name:"Canberra",lat:-35.2809,lng:149.1300},
  // Americas
  {name:"Ottawa",lat:45.4215,lng:-75.6972},
  {name:"Toronto",lat:43.6532,lng:-79.3832},
  {name:"Vancouver",lat:49.2827,lng:-123.1207},
  {name:"Mexico City",lat:19.4326,lng:-99.1332},
  {name:"Havana",lat:23.1136,lng:-82.3666},
  {name:"Caracas",lat:10.4806,lng:-66.9036},
  {name:"Bogota",lat:4.7110,lng:-74.0721},
  {name:"Brasilia",lat:-15.8267,lng:-47.9218},
  {name:"Buenos Aires",lat:-34.6037,lng:-58.3816},
  {name:"Santiago",lat:-33.4489,lng:-70.6693},
];

// Keyword map: location name -> keywords that should map to it
const CITY_KEYWORDS = {
  // US
  "New York":         ["new york","nyc","manhattan","brooklyn","bronx","queens","wall street","times square","new york city"],
  "Los Angeles":      ["los angeles","l.a.","hollywood","beverly hills","compton","dodgers","lakers"],
  "Chicago":          ["chicago","windy city","wrigley","cubs","bears","bulls"],
  "Houston":          ["houston","harris county","nasa","texans","astros"],
  "Washington D.C.":  ["washington d.c","washington dc","white house","congress","senate","capitol hill","pentagon","state department","supreme court","federal government","federal reserve","oval office","cia","fbi","treasury department","justice department","defense department"],
  "San Francisco":    ["san francisco","sf bay","silicon valley","palo alto","menlo park","sunnyvale","santa clara","oakland","berkeley","golden gate","big tech","apple inc","google","meta ","openai","anthropic"],
  "Seattle":          ["seattle","puget sound","seahawks","mariners","amazon hq","microsoft campus"],
  "Miami":            ["miami","south beach","miami beach","dade county"],
  "Boston":           ["boston","cambridge ma","harvard","mit ","celtics","patriots","red sox"],
  "Atlanta":          ["atlanta","atl ","georgia capital","braves","falcons","hartsfield"],
  "Dallas":           ["dallas","fort worth","dfw","cowboys","rangers","mavericks"],
  "Denver":           ["denver","mile high","broncos","rockies","nuggets"],
  "Las Vegas":        ["las vegas","sin city","the strip","raiders","golden knights"],
  "Austin":           ["austin tx","sxsw","tesla texas","university of texas"],
  "Phoenix":          ["phoenix","scottsdale","tempe","suns","cardinals az","diamondbacks"],
  "Nashville":        ["nashville","country music","titans","predators","music city"],
  "Portland":         ["portland or","trail blazers","pdx"],
  "Minneapolis":      ["minneapolis","saint paul","twin cities","vikings","timberwolves"],
  "Detroit":          ["detroit","motor city","motown","lions","tigers","michigan"],
  "Philadelphia":     ["philadelphia","philly","eagles","phillies","76ers"],
  "San Diego":        ["san diego","padres"],
  "Tampa":            ["tampa","st. petersburg","buccaneers","tampa bay"],
  "Baltimore":        ["baltimore","ravens","orioles"],
  "Salt Lake City":   ["salt lake city","utah jazz"],
  "New Orleans":      ["new orleans","nola","saints new orleans","mardi gras"],
  // Europe
  "London":           ["london","uk ","united kingdom","england","britain","british","westminster","parliament uk","downing street","buckingham","bank of england","premier league","scotland","wales","northern ireland"],
  "Paris":            ["paris","france","french","macron","elysee","notre dame","louvre"],
  "Berlin":           ["berlin","germany","german","bundestag","bundesbank","munich","hamburg","frankfurt","volkswagen","bmw","mercedes"],
  "Moscow":           ["moscow","russia","russian","kremlin","putin","st petersburg ru","siberia","ukraine war","rosneft"],
  "Kyiv":             ["kyiv","kiev","ukraine","ukrainian","zelensky","donbas","zaporizhzhia","kharkiv","odessa","mariupol","kherson"],
  "Brussels":         ["brussels","belgium","european union","eu ","nato","european commission","european parliament"],
  "Rome":             ["rome","italy","italian","vatican","pope","milan","naples","sicily","mario draghi"],
  "Madrid":           ["madrid","spain","spanish","barcelona","catalonia","iberia"],
  "Amsterdam":        ["amsterdam","netherlands","dutch","holland","rotterdam"],
  "Warsaw":           ["warsaw","poland","polish","krakow"],
  "Stockholm":        ["stockholm","sweden","swedish","nordic","scandinavia","oslo","norway","denmark","copenhagen","helsinki","finland"],
  "Zurich":           ["zurich","switzerland","swiss","geneva","davos","imf","world economic forum"],
  "Athens":           ["athens","greece","greek","acropolis","mediterranean"],
  "Vienna":           ["vienna","austria","austrian","opec","iaea"],
  // Middle East & Africa
  "Tel Aviv":         ["tel aviv","israel","israeli","netanyahu","idf","jerusalem","west bank","haifa","iron dome"],
  "Gaza":             ["gaza","hamas","palestin","rafah","west bank","idf strike","ceasefire"],
  "Beirut":           ["beirut","lebanon","lebanese","hezbollah"],
  "Tehran":           ["tehran","iran","iranian","ayatollah","irgc","nuclear deal","persian"],
  "Riyadh":           ["riyadh","saudi arabia","saudi","mbs","aramco","opec","crown prince"],
  "Dubai":            ["dubai","uae","united arab emirates","abu dhabi","emirates airline"],
  "Istanbul":         ["istanbul","turkey","turkish","ankara","erdogan","bosphorus"],
  "Cairo":            ["cairo","egypt","egyptian","suez","al-sisi"],
  "Nairobi":          ["nairobi","kenya","kenyan","east africa"],
  "Lagos":            ["lagos","nigeria","nigerian","west africa","abuja"],
  "Johannesburg":     ["johannesburg","south africa","pretoria","cape town","african national congress","anc "],
  // Asia Pacific
  "Beijing":          ["beijing","china","chinese","xi jinping","ccp","communist party","pla ","xinjiang","tibet","taiwan strait","south china sea","huawei","alibaba","tencent","byd"],
  "Shanghai":         ["shanghai","yangtze","pudong"],
  "Hong Kong":        ["hong kong","hk ","carrie lam","john lee","national security law"],
  "Tokyo":            ["tokyo","japan","japanese","abe","kishida","nikkei","fujisan","osaka","hiroshima","nagasaki","kyoto"],
  "Seoul":            ["seoul","south korea","korean","north korea","kim jong","pyongyang","dmz","samsung","hyundai","kpop","bts "],
  "Taipei":           ["taipei","taiwan","taiwanese","tsai","dpp","kuomintang","strait","chip","tsmc","semiconductor"],
  "Singapore":        ["singapore","singaporean","asean","straits times"],
  "Mumbai":           ["mumbai","india","indian","modi","bjp","delhi","bangalore","hyderabad","chennai","kolkata","rupee","tata ","infosys","hindustan"],
  "New Delhi":        ["new delhi","india ","modi ","parliament india","supreme court india"],
  "Islamabad":        ["islamabad","pakistan","pakistani","imran khan","lahore","karachi","isi pak"],
  "Kabul":            ["kabul","afghanistan","afghan","taliban","kandahar"],
  "Sydney":           ["sydney","australia","australian","melbourne","queensland","aukus","reef","asx"],
  "Canberra":         ["canberra","australia government","albanese","australian parliament"],
  // Americas
  "Ottawa":           ["ottawa","canada","canadian","trudeau","liberal party canada","ontario","alberta","quebec","bank of canada"],
  "Toronto":          ["toronto","ontario","maple leafs","raptors","blue jays"],
  "Vancouver":        ["vancouver","british columbia","bc "],
  "Mexico City":      ["mexico city","mexico","mexican","cdmx","amlo","pemex","cartels","guadalajara","monterrey"],
  "Havana":           ["havana","cuba","cuban","castro","embargo"],
  "Caracas":          ["caracas","venezuela","venezuelan","maduro","chavez"],
  "Bogota":           ["bogota","colombia","colombian","medellin","farc","petro"],
  "Brasilia":         ["brasilia","brazil","brazilian","lula","bolsonaro","sao paulo","amazon rainforest","rio de janeiro"],
  "Buenos Aires":     ["buenos aires","argentina","argentine","milei","peronist","peso crisis"],
  "Santiago":         ["santiago","chile","chilean","boric"],
};

: city name -> keywords that should map to it
const CITY_KEYWORDS = {
  "New York":         ["new york","nyc","manhattan","brooklyn","bronx","queens","staten island","wall street","times square","harlem","the bronx","new york city"],
  "Los Angeles":      ["los angeles","la ","l.a.","hollywood","beverly hills","compton","watts","pasadena","long beach","malibu","venice beach","dodgers","lakers","rams","clippers"],
  "Chicago":          ["chicago","windy city","o'hare","midway","wrigley","south side","north side","cubs","bears","bulls","white sox","blackhawks"],
  "Houston":          ["houston","harris county","nasa","texans","astros","rockets","space center"],
  "Phoenix":          ["phoenix","scottsdale","tempe","mesa","chandler","glendale az","suns","cardinals","coyotes","diamondbacks"],
  "Philadelphia":     ["philadelphia","philly","city of brotherly love","eagles","phillies","76ers","flyers","independence hall"],
  "San Antonio":      ["san antonio","alamo","spurs","fiesta"],
  "San Diego":        ["san diego","padres","chargers","tijuana border"],
  "Dallas":           ["dallas","fort worth","dfw","irving","plano","arlington tx","cowboys","rangers","mavericks","stars","AT&T stadium"],
  "San Francisco":    ["san francisco","sf ","bay area","silicon valley","palo alto","menlo park","sunnyvale","santa clara","oakland","berkeley","golden gate","tenderloin","soma","tech industry","tech sector","big tech","apple inc","google","meta ","apple park"],
  "Seattle":          ["seattle","puget sound","seahawks","mariners","sounders","amazon hq","microsoft campus","bellevue wa","redmond wa"],
  "Denver":           ["denver","mile high","broncos","rockies","nuggets","avalanche","colorado springs","boulder co"],
  "Washington D.C.":  ["washington d.c","washington dc","d.c.","the white house","white house","congress","senate","house of representatives","capitol hill","pentagon","state department","supreme court","federal government","federal reserve","trump administration","biden administration","oval office","homeland security","fbi headquarters","cia headquarters","national security","u.s. government","us government","federal bureau","treasury department","justice department","defense department","nato headquarters"],
  "Nashville":        ["nashville","tennessee music","country music","titans","predators","music city"],
  "Atlanta":          ["atlanta","atl","georgia capital","braves","falcons","hawks","atlanta united","hartsfield"],
  "Miami":            ["miami","south beach","miami beach","dade county","broward","heat ","marlins","dolphins miami","inter miami"],
  "Boston":           ["boston","cambridge ma","harvard","mit ","celtics","patriots","red sox","bruins","fenway"],
  "Austin":           ["austin","austin tx","sxsw","tesla texas","university of texas","longhorns","austin fc"],
  "Las Vegas":        ["las vegas","sin city","the strip","henderson nv","raiders","golden knights","aces las vegas"],
  "Portland":         ["portland","portland or","trail blazers","rose city","pdx"],
  "Minneapolis":      ["minneapolis","saint paul","twin cities","minnesota","vikings","twins","timberwolves","wild mn"],
  "Detroit":          ["detroit","motor city","motown","lions","tigers","pistons","red wings","michigan"],
  "New Orleans":      ["new orleans","nola","bourbon street","saints new orleans","pelicans nola","mardi gras","cajun","bayou"],
  "Kansas City":      ["kansas city","chiefs","royals","sporting kc"],
  "Salt Lake City":   ["salt lake city","utah jazz","real salt lake","provo","byu"],
  "Sacramento":       ["sacramento","kings sacramento","california capital","california governor","gavin newsom"],
  "Pittsburgh":       ["pittsburgh","steelers","pirates","penguins","three rivers"],
  "Charlotte":        ["charlotte","panthers","hornets","bank of america stadium"],
  "Indianapolis":     ["indianapolis","indy","colts","pacers","indy 500"],
  "Columbus":         ["columbus oh","ohio state","crew sc","blue jackets"],
  "San Jose":         ["san jose","silicon valley","apple ","google campus","nvidia","intel ","amd ","openai","anthropic","startup","venture capital","tech startup","artificial intelligence","ai company","ai startup","ai model","chatgpt","microsoft ai","tesla ","spacex","elon musk"],
  "Memphis":          ["memphis","grizzlies","fedex hub"],
  "Baltimore":        ["baltimore","ravens","orioles","inner harbor"],
  "Oklahoma City":    ["oklahoma city","okc","thunder okc"],
  "Albuquerque":      ["albuquerque","new mexico","sandia"],
  "Tucson":           ["tucson","arizona wildcats"],
  "Milwaukee":        ["milwaukee","bucks","brewers","packers"],
  "Anchorage":        ["anchorage","alaska"],
  "Honolulu":         ["honolulu","hawaii","maui","oahu"],
  "Boise":            ["boise","idaho"],
  "Richmond":         ["richmond va","virginia capital"],
  "Tampa":            ["tampa","st. petersburg","rays","lightning tb","buccaneers","tampa bay","clearwater"],
  "Orlando":          ["orlando","disney world","universal studios","magic orlando","solar bears"],
  "Cincinnati":       ["cincinnati","bengals","reds cincinnati"],
  "Cleveland":        ["cleveland","browns","guardians","cavaliers"],
  "St. Louis":        ["st. louis","saint louis","cardinals stl","blues stl"],
  "Omaha":            ["omaha","nebraska","warren buffett","berkshire"],
  "Buffalo":          ["buffalo","bills","sabres","niagara"],
};

function geoTagArticle(article) {
  const text = ((article.headline || "") + " " + (article.summary || "")).toLowerCase();
  for (const [cityName, keywords] of Object.entries(CITY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        return cityName;
      }
    }
  }
  return article.region || "National";
}

function fuzzyMatch(region) {
  if (!region) return null;
  const r = region.toLowerCase().trim();
  return CITIES.find(c => {
    const n = c.name.toLowerCase();
    if (n === r || r.includes(n) || n.includes(r)) return true;
    // Special cases
    if (r.includes("d.c") && c.name === "Washington D.C.") return true;
    if ((r === "washington" || r === "washington, d.c.") && c.name === "Washington D.C.") return true;
    if ((r === "uk" || r === "united kingdom" || r === "england" || r === "britain") && c.name === "London") return true;
    if ((r === "france") && c.name === "Paris") return true;
    if ((r === "germany") && c.name === "Berlin") return true;
    if ((r === "russia") && c.name === "Moscow") return true;
    if ((r === "ukraine") && c.name === "Kyiv") return true;
    if ((r === "china" || r === "prc") && c.name === "Beijing") return true;
    if ((r === "japan") && c.name === "Tokyo") return true;
    if ((r === "south korea" || r === "korea") && c.name === "Seoul") return true;
    if ((r === "taiwan") && c.name === "Taipei") return true;
    if ((r === "india") && c.name === "New Delhi") return true;
    if ((r === "australia") && c.name === "Canberra") return true;
    if ((r === "canada") && c.name === "Ottawa") return true;
    if ((r === "israel") && c.name === "Tel Aviv") return true;
    if ((r === "iran") && c.name === "Tehran") return true;
    if ((r === "saudi arabia") && c.name === "Riyadh") return true;
    if ((r === "turkey") && c.name === "Istanbul") return true;
    if ((r === "brazil") && c.name === "Brasilia") return true;
    if ((r === "pakistan") && c.name === "Islamabad") return true;
    if ((r === "afghanistan") && c.name === "Kabul") return true;
    return false;
  });
}

function HeatMap({ articles, onRegion }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [selected, setSelected] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const cityCount = {};
  articles.forEach(a => {
    const geoRegion = geoTagArticle(a);
    const city = fuzzyMatch(geoRegion);
    if (city) cityCount[city.name] = (cityCount[city.name] || 0) + 1;
  });

  useEffect(() => {
    if (mapInstance.current) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js";
    script.onload = () => {
      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      const map = new window.mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [15, 25],
        zoom: 1.5,
        minZoom: 1,
        maxZoom: 10,
      });
      map.on("load", () => { setMapLoaded(true); mapInstance.current = map; });
    };
    document.head.appendChild(script);
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapInstance.current) return;
    const map = mapInstance.current;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    CITIES.forEach(city => {
      const count = cityCount[city.name] || 0;
      if (count === 0) return;
      const size = Math.min(14 + count * 6, 44);
      const el = document.createElement("div");
      el.style.cssText = `width:${size}px;height:${size}px;background:#E8956D;border:2.5px solid #fff;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:${size > 24 ? 11 : 9}px;font-weight:700;color:#fff;box-shadow:0 2px 12px rgba(232,149,109,0.5);`;
      el.innerHTML = count;
      el.addEventListener("click", () => {
        setSelected(city.name);
        onRegion && onRegion(city.name);
        map.flyTo({ center: [city.lng, city.lat], zoom: 6, speed: 1.2 });
      });
      const marker = new window.mapboxgl.Marker({ element: el })
        .setLngLat([city.lng, city.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [mapLoaded, articles]);

  const selectedArticles = selected ? articles.filter(a => fuzzyMatch(geoTagArticle(a))?.name === selected) : [];

  return (
    <div>
      <h2 style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:C.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>News Heatmap</h2>
      <p style={{fontFamily:F.text,fontSize:14,color:C.muted,margin:"0 0 14px"}}>Stories mapped worldwide. Tap any dot to see local coverage.</p>
      <div ref={mapRef} style={{width:"100%",height:400,borderRadius:20,overflow:"hidden",marginBottom:16}}/>
      {!mapLoaded && <div style={{display:"flex",gap:10,alignItems:"center",justifyContent:"center",padding:"20px 0"}}><Spinner/><span style={{fontFamily:F.text,fontSize:13,color:C.muted}}>Loading map…</span></div>}
      {selected && selectedArticles.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <p style={{fontFamily:F.display,fontSize:16,fontWeight:700,color:C.text,margin:0}}>📍 {selected}</p>
            <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.muted}}>✕</button>
          </div>
          {selectedArticles.map((a,i)=>(
            <div key={i} style={{...glass(0.7),borderRadius:14,padding:"12px 14px",marginBottom:8,cursor:"pointer"}} onClick={()=>onRegion&&onRegion(a)}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <div style={{width:3,height:14,background:leanColor(a.lean),borderRadius:2,flexShrink:0}}/>
                <span style={{fontFamily:F.text,fontSize:11,color:C.muted}}>{a.source}</span>
              </div>
              <p style={{fontFamily:F.text,fontSize:13,fontWeight:600,color:C.text,margin:0,lineHeight:1.4}}>{decodeHTML(a.headline)}</p>
            </div>
          ))}
        </div>
      )}
      {Object.keys(cityCount).length === 0 && (
        <p style={{fontFamily:F.text,fontSize:14,color:C.muted,textAlign:"center",padding:"20px 0"}}>Stories loading — map will populate shortly.</p>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────
// DNA TREE — Live sourcing via NewsData.io + Claude analysis
// ─────────────────────────────────────────────────────────────────
const NEWSDATA_KEY = "pub_9bd9b65fe1654838ae735506c126e32e";

// Build a flat list of levels for the tree: level 0 = root, level 1 = children, level 2 = grandchildren
function buildLevels(tree) {
  if (!tree) return [];
  const levels = [];
  // BFS
  const queue = [{ id:"r", node:tree.root, parentId:null }];
  const visited = new Set();
  while (queue.length) {
    const batch = [...queue]; queue.length = 0;
    const level = [];
    for (const item of batch) {
      if (visited.has(item.id)) continue;
      visited.add(item.id);
      level.push(item);
      (item.node.children||[]).forEach(cid => {
        if (tree.nodes[cid] && !visited.has(cid))
          queue.push({ id:cid, node:tree.nodes[cid], parentId:item.id });
      });
    }
    if (level.length) levels.push(level);
  }
  return levels;
}

function DNATree({ articles }) {
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [tree, setTree] = useState(null);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [provOpen, setProvOpen] = useState(new Set());


  const togProv = (e, id) => { e.stopPropagation(); setProvOpen(p => { const n = new Set(p); n.has(id)?n.delete(id):n.add(id); return n; }); };

  const traceDNA = async (searchQuery) => {
    setLoading(true); setError(null); setTree(null); setSelectedId(null); setProvOpen(new Set());
    try {
      const q = encodeURIComponent(searchQuery.split(" ").slice(0,5).join(" "));
      const res = await fetch(`https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&q=${q}&language=en&size=10`);
      const json = await res.json();
      const rawArticles = (json.results || []).filter(a => a.title && a.source_id).slice(0, 8);
      if (rawArticles.length === 0) { setError("No sources found. Try a different search."); setLoading(false); return; }

      const articleList = rawArticles.map((a,i) =>
        `${i+1}. Source: ${a.source_id} | Title: "${a.title}" | Published: ${a.pubDate||"unknown"} | URL: ${a.link||""} | Snippet: ${a.description||""}`
      ).join("\n");

      const result = await callClaude(`You are analyzing how a news story spread. Here are ${rawArticles.length} articles:\n\n${articleList}\n\nReturn ONLY valid JSON:\n{"storyTitle":"short title","root":{"source":"outlet","date":"date","label":"Original Report","lean":"left/center/right","text":"1 sentence","quote":"key phrase","url":"url","wayback":"https://web.archive.org/web/2025/[url]","children":["a","b"]},"nodes":{"a":{"source":"outlet","date":"date","label":"Follow-up or Reframe or Opinion or Local Angle","lean":"left/center/right","text":"how they covered it differently","quote":"key phrase","quoteChange":"note — start with ⚠ if spin detected","url":"url","wayback":"https://web.archive.org/web/2025/[url]","children":["c"]},"b":{"source":"outlet","date":"date","label":"Follow-up","lean":"left/center/right","text":"coverage note","quote":"phrase","quoteChange":"","url":"url","wayback":"url","children":[]}}}\n\nRules: root = earliest article. Flag spin with ⚠. Try to create a branching tree where root has 2-4 direct children, and some children have their own children. Include all ${rawArticles.length} articles.`);

      const cleaned = result.replace(/```json|```/g,"").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Parse failed");
      const parsed = JSON.parse(match[0]);
      setTree(parsed);
      setSelectedId("r");
    } catch(e) {
      setError("Could not trace this story. Try a simpler search term.");
    }
    setLoading(false);
  };

  const hasWarning = node => node && node.quoteChange && node.quoteChange.startsWith("⚠");
  const allNodes = tree ? [tree.root, ...Object.values(tree.nodes||{})] : [];
  const warningCount = allNodes.filter(hasWarning).length;
  const levels = buildLevels(tree);

  // Selected node detail
  const getNode = (id) => id === "r" ? tree?.root : tree?.nodes?.[id];
  const selNode = selectedId ? getNode(selectedId) : null;
  const selWarn = hasWarning(selNode);
  const selIsRoot = selectedId === "r";
  const selColor = selIsRoot ? C.accent : leanColor(selNode?.lean||"center");
  const pOpen = selectedId ? provOpen.has(selectedId) : false;

  return (
    <div>
      <h2 style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:C.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Story DNA</h2>
      <p style={{fontFamily:F.text,fontSize:14,color:C.muted,margin:"0 0 16px",lineHeight:1.5}}>Trace how a story spreads — who published first, what changed, and where spin entered.</p>

      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <div style={{flex:1,...card(),borderRadius:14,display:"flex",alignItems:"center",padding:"0 14px"}}>
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

      {loading&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:"50px 0"}}>
          <Spinner/>
          <p style={{fontFamily:F.text,fontSize:14,color:C.muted,margin:0}}>Building DNA strand…</p>
          {/* Animated DNA helix preview */}
          <svg width="60" height="80" viewBox="0 0 60 80">
            <style>{`@keyframes dnaFloat{0%,100%{opacity:0.3}50%{opacity:1}} .ds{animation:dnaFloat 1.2s ease-in-out infinite;}`}</style>
            {[0,1,2,3,4,5,6].map(i=>{
              const y=6+i*11; const wave=Math.sin(i*0.9)*18;
              return <g key={i}>
                <line x1={30+wave} y1={y} x2={30-wave} y2={y} stroke={C.divider} strokeWidth="1.5" strokeLinecap="round" className="ds" style={{animationDelay:`${i*0.15}s`}}/>
                <circle cx={30+wave} cy={y} r="3.5" fill={i%3===0?C.accent:i%3===1?C.left:C.right} className="ds" style={{animationDelay:`${i*0.15}s`}}/>
                <circle cx={30-wave} cy={y} r="3.5" fill={i%3===0?C.right:i%3===1?C.accent:C.left} className="ds" style={{animationDelay:`${i*0.15+0.05}s`}}/>
              </g>;
            })}
          </svg>
        </div>
      )}
      {error&&<p style={{fontFamily:F.text,fontSize:14,color:C.breaking,padding:"20px 0"}}>{error}</p>}

      {tree&&!loading&&(
        <>
          {/* Stats row */}
          <div style={{display:"flex",gap:10,marginBottom:20}}>
            <div style={{flex:1,background:C.surface,borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontFamily:F.display,fontSize:20,fontWeight:700,color:C.text}}>{allNodes.length}</div>
              <div style={{fontFamily:F.text,fontSize:11,color:C.muted,marginTop:2}}>Sources</div>
            </div>
            <div style={{flex:1,background:warningCount>0?C.breaking+"10":C.surface,borderRadius:10,padding:"12px 14px",textAlign:"center",border:warningCount>0?`1px solid ${C.breaking}30`:"none"}}>
              <div style={{fontFamily:F.display,fontSize:20,fontWeight:700,color:warningCount>0?C.breaking:C.text}}>{warningCount}</div>
              <div style={{fontFamily:F.text,fontSize:11,color:warningCount>0?C.breaking:C.muted,marginTop:2}}>Spin flags</div>
            </div>
            <div style={{flex:1,background:"#FFF0E8",borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontFamily:F.display,fontSize:20,fontWeight:700,color:C.orange}}>{levels.length}</div>
              <div style={{fontFamily:F.text,fontSize:11,color:C.muted,marginTop:2}}>Generations</div>
            </div>
          </div>

          {/* Story title */}
          <div style={{marginBottom:16,paddingBottom:12,borderBottom:`1px solid ${C.divider}`,display:"flex",alignItems:"center",gap:10}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round">
              <path d="M7 3c0 4 10 4 10 8S7 15 7 19M17 3c0 4-10 4-10 8s10 4 10 8"/>
            </svg>
            <p style={{fontFamily:F.display,fontSize:15,fontWeight:700,color:C.text,margin:0}}>{tree.storyTitle}</p>
          </div>

          {/* Visual SVG Tree — fully calculated positions, no DOM measurements */}
          {(() => {
            const NODE_W = 128, NODE_H = 78, H_GAP = 14, V_GAP = 56;
            // Assign (col, row) to each node
            const posMap = {}; // id -> {row, col, x, y}
            levels.forEach((level, li) => {
              const totalW = level.length * NODE_W + (level.length-1) * H_GAP;
              level.forEach((item, ci) => {
                const x = ci * (NODE_W + H_GAP) - totalW/2 + NODE_W/2; // center offset
                const y = li * (NODE_H + V_GAP);
                posMap[item.id] = { x, y, row:li, col:ci };
              });
            });

            const maxCols = levels.reduce((m,l)=>Math.max(m,l.length),1);
            const svgW = Math.max(340, maxCols * (NODE_W + H_GAP) + 40);
            const svgH = levels.length * (NODE_H + V_GAP) + 20;
            const cx = svgW / 2; // center x of SVG

            // Collect edges
            const edges = [];
            levels.forEach((level, li) => {
              if (li === 0) return;
              const parentLevel = levels[li-1];
              level.forEach(item => {
                const par = parentLevel.find(p => (p.node.children||[]).includes(item.id));
                if (!par) return;
                const pp = posMap[par.id], cp = posMap[item.id];
                if (!pp || !cp) return;
                const x1 = cx + pp.x, y1 = pp.y + NODE_H;
                const x2 = cx + cp.x, y2 = cp.y;
                const midY = (y1+y2)/2;
                edges.push({ key:`${par.id}-${item.id}`, x1,y1,x2,y2,midY, warn:hasWarning(item.node), nc:leanColor(item.node?.lean||"center") });
              });
            });

            return (
              <div style={{overflowX:"auto",marginBottom:20,borderRadius:14,background:C.surface,border:`1px solid ${C.border}`,padding:"12px 0 8px"}}>
                <svg width={svgW} height={svgH} style={{display:"block",margin:"0 auto"}}>
                  <defs>
                    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    {/* Subtle grid pattern */}
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke={C.divider} strokeWidth="0.5"/>
                    </pattern>
                  </defs>

                  {/* Background grid */}
                  <rect width={svgW} height={svgH} fill="url(#grid)" opacity="0.5"/>

                  {/* Edges */}
                  {edges.map(e => (
                    <g key={e.key}>
                      {/* Glow line for spin */}
                      {e.warn && <path d={`M${e.x1},${e.y1} C${e.x1},${e.midY} ${e.x2},${e.midY} ${e.x2},${e.y2}`}
                        fill="none" stroke={C.breaking} strokeWidth="4" opacity="0.15" strokeLinecap="round"/>}
                      <path d={`M${e.x1},${e.y1} C${e.x1},${e.midY} ${e.x2},${e.midY} ${e.x2},${e.y2}`}
                        fill="none"
                        stroke={e.warn ? C.breaking : e.nc}
                        strokeWidth={e.warn ? 2 : 1.5}
                        strokeDasharray={e.warn ? "5,3" : "none"}
                        opacity={0.45}
                        strokeLinecap="round"/>
                    </g>
                  ))}

                  {/* Nodes */}
                  {levels.map(level => level.map(item => {
                    const n = item.node;
                    const pos = posMap[item.id];
                    if (!pos) return null;
                    const isRoot = item.id==="r";
                    const warn = hasWarning(n);
                    const nc = isRoot ? C.accent : leanColor(n.lean||"center");
                    const isSel = selectedId===item.id;
                    const nx = cx + pos.x - NODE_W/2;
                    const ny = pos.y;
                    const src = (n.source||"").slice(0,16);
                    const lbl = (n.label||"").slice(0,18);
                    const dt = (n.date||"").slice(0,10);

                    return (
                      <g key={item.id} onClick={()=>setSelectedId(isSel?null:item.id)} style={{cursor:"pointer"}}>
                        {/* Selection halo */}
                        {isSel && <rect x={nx-3} y={ny-3} width={NODE_W+6} height={NODE_H+6} rx={isSel?16:14} fill={nc} opacity={0.12}/>}

                        {/* Card */}
                        <rect x={nx} y={ny} width={NODE_W} height={NODE_H} rx={isRoot?14:11}
                          fill={isSel ? nc : C.card}
                          stroke={warn ? C.breaking : (isSel ? nc : nc+"55")}
                          strokeWidth={isSel ? 0 : (warn ? 1.5 : 1)}
                        />
                        {/* Left accent stripe */}
                        {!isSel && <rect x={nx} y={ny+8} width={3.5} height={NODE_H-16} rx={2} fill={nc} opacity={0.8}/>}

                        {/* Source name */}
                        <text x={nx+14} y={ny+22} fontSize={isRoot?12:11} fontWeight="700"
                          fill={isSel?"#fff":C.text} fontFamily={F.text}>{src}</text>

                        {/* Label pill bg */}
                        <rect x={nx+12} y={ny+29} width={Math.min(lbl.length*5.5+10, NODE_W-20)} height={16} rx={4}
                          fill={isSel?"rgba(255,255,255,0.2)":nc+"20"}/>
                        <text x={nx+17} y={ny+41} fontSize={9} fontWeight="600"
                          fill={isSel?"rgba(255,255,255,0.9)":nc} fontFamily={F.text}>{lbl}</text>

                        {/* Date */}
                        {dt && <text x={nx+14} y={ny+61} fontSize={9}
                          fill={isSel?"rgba(255,255,255,0.6)":C.muted} fontFamily={F.text}>{dt}</text>}

                        {/* Spin badge */}
                        {warn && (
                          <g>
                            <circle cx={nx+NODE_W-8} cy={ny+8} r={8} fill={C.breaking}/>
                            <text x={nx+NODE_W-8} y={ny+12} fontSize={8} textAnchor="middle" fill="#fff" fontWeight="700">!</text>
                          </g>
                        )}

                        {/* Root crown */}
                        {isRoot && (
                          <text x={nx+NODE_W/2} y={ny-6} fontSize={9} textAnchor="middle"
                            fill={C.accent} fontWeight="600" fontFamily={F.text}>⬟ ORIGIN</text>
                        )}

                        {/* Children indicator dot */}
                        {(n.children||[]).length > 0 && !isSel && (
                          <circle cx={nx+NODE_W/2} cy={ny+NODE_H+5} r={3} fill={nc} opacity={0.5}/>
                        )}
                      </g>
                    );
                  }))}
                </svg>
              </div>
            );
          })()}

          {/* Selected node detail panel */}
          {selNode&&(
            <div style={{...card(),borderRadius:16,padding:"16px",marginBottom:16,borderLeft:`4px solid ${selColor}`,animation:"fadeIn 0.2s ease"}}>
              <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:10}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontFamily:F.text,fontSize:14,fontWeight:700,color:selColor}}>{selNode.source}</span>
                    {selNode.date&&<span style={{fontSize:11,color:C.muted,fontFamily:F.text}}>· {selNode.date}</span>}
                    <span style={{fontSize:10,fontWeight:600,fontFamily:F.text,color:selColor,background:selColor+"18",borderRadius:4,padding:"2px 7px"}}>{selNode.label}</span>
                    {selWarn&&<span style={{fontSize:11,color:C.breaking,fontWeight:600}}>⚠ Spin detected</span>}
                  </div>
                </div>
                <button onClick={()=>setSelectedId(null)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,padding:"2px 6px"}}>✕</button>
              </div>
              <p style={{fontFamily:F.text,fontSize:13,color:C.sub,margin:"0 0 12px",lineHeight:1.6}}>{selNode.text}</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:pOpen?12:0}}>
                <button onClick={e=>togProv(e,selectedId)} style={{fontSize:11,fontFamily:F.text,color:pOpen?C.accent:C.muted,background:pOpen?C.accentSoft:C.surface,border:`1px solid ${pOpen?C.accent+"40":C.border}`,borderRadius:6,padding:"5px 12px",cursor:"pointer"}}>{pOpen?"Hide":"🔍 Verify"}</button>
                {selNode.url&&<button onClick={e=>{e.stopPropagation();window.open(selNode.url,"_blank","noopener,noreferrer");}} style={{fontSize:11,fontFamily:F.text,color:C.muted,background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 12px",cursor:"pointer"}}>Article ↗</button>}
                {selNode.wayback&&<button onClick={e=>{e.stopPropagation();window.open(selNode.wayback,"_blank","noopener,noreferrer");}} style={{fontSize:11,fontFamily:F.text,color:C.muted,background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 12px",cursor:"pointer"}}>📦 Archive</button>}
              </div>
              {pOpen&&(
                <div style={{background:C.surface,borderRadius:10,padding:"14px 16px",border:`1px solid ${selWarn?C.breaking+"30":C.border}`}}>
                  {selNode.quote&&<div style={{marginBottom:10}}>
                    <p style={{fontFamily:F.text,fontSize:10,fontWeight:600,color:C.muted,letterSpacing:"0.06em",textTransform:"uppercase",margin:"0 0 5px"}}>{selIsRoot?"Original Quote":"As Reported"}</p>
                    <p style={{fontFamily:F.text,fontSize:13,color:C.sub,margin:0,lineHeight:1.6,paddingLeft:10,borderLeft:`3px solid ${selColor}`,fontStyle:"italic"}}>"{selNode.quote}"</p>
                  </div>}
                  {selNode.quoteChange&&<div>
                    <p style={{fontFamily:F.text,fontSize:10,fontWeight:600,color:selWarn?C.breaking:C.muted,letterSpacing:"0.06em",textTransform:"uppercase",margin:"0 0 5px"}}>{selWarn?"⚠ Narrative Shift":"Editorial Note"}</p>
                    <p style={{fontFamily:F.text,fontSize:12,color:selWarn?C.breaking:C.sub,margin:0,lineHeight:1.6,background:selWarn?C.breaking+"08":"transparent",borderRadius:6,padding:selWarn?"6px 10px":0}}>{selNode.quoteChange.replace("⚠ ","")}</p>
                  </div>}
                  {selNode.wayback&&<div style={{marginTop:10,paddingTop:8,borderTop:`1px solid ${C.divider}`,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:11,color:C.muted,fontFamily:F.text}}>📦 Archived:</span>
                    <span onClick={e=>{e.stopPropagation();window.open(selNode.wayback,"_blank","noopener,noreferrer");}} style={{fontSize:11,color:C.accent,fontFamily:F.text,cursor:"pointer",textDecoration:"underline"}}>Wayback Machine ↗</span>
                  </div>}
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div style={{display:"flex",gap:16,flexWrap:"wrap",paddingTop:8,borderTop:`1px solid ${C.divider}`}}>
            {[["Left-leaning",C.left],["Center",C.accent],["Right-leaning",C.right]].map(([label,color])=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:color}}/>
                <span style={{fontFamily:F.text,fontSize:11,color:C.muted}}>{label}</span>
              </div>
            ))}
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:C.breaking}}/>
              <span style={{fontFamily:F.text,fontSize:11,color:C.muted}}>⚠ Spin detected</span>
            </div>
          </div>
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
// ─────────────────────────────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────────────────────────────
const ONBOARDING_SLIDES = [
  {
    icon: "◎",
    title: "Welcome to Clarion.",
    color: C.orange,
  },
  {
    icon: "⚖",
    title: "Know Your Bias",
    body: "Clarion tracks which perspectives you read and shows your Balance Score over time. See when you're drifting into an echo chamber.",
    color: C.left,
  },
  {
    icon: "🧬",
    title: "Trace Every Story",
    body: "Use Story DNA to see who broke a story, how it spread, and where spin was introduced across the political spectrum.",
    color: C.right,
  },
  {
    icon: "★",
    title: "Follow Topics",
    body: "Pick the topics you care about most and Clarion will surface those stories first — while still keeping your feed balanced.",
    color: C.accent,
  },
];

function OnboardingScreen({ onDone }) {
  const [slide, setSlide] = useState(0);
  const s = ONBOARDING_SLIDES[slide];
  const isLast = slide === ONBOARDING_SLIDES.length - 1;
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background: C.bg,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"40px 32px",
    }}>
      {/* Progress dots */}
      <div style={{display:"flex", gap:6, marginBottom:48}}>
        {ONBOARDING_SLIDES.map((_,i) => (
          <div key={i} onClick={()=>setSlide(i)} style={{
            width: i===slide ? 24 : 6, height:6, borderRadius:3,
            background: i===slide ? s.color : C.border,
            transition:"all 0.3s", cursor:"pointer",
          }}/>
        ))}
      </div>

      {/* Icon */}
      <div style={{
        width:96, height:96, borderRadius:28, marginBottom:32,
        background: s.color+"15", border:`2px solid ${s.color}30`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:40,
      }}>{s.icon}</div>

      {/* Text */}
      <h1 style={{
        fontFamily:"'Times New Roman', Times, serif",
        fontSize:28, fontWeight:700, color:C.text,
        textAlign:"center", margin:"0 0 16px",
        letterSpacing:"-0.04em", lineHeight:1.2,
      }}>
        {slide === 0 ? (
          <>Welcome to Clar<span style={{fontStyle:"italic"}}>i</span>on.</>
        ) : s.title}
      </h1>
      <p style={{
        fontFamily:F.text, fontSize:16, color:C.sub,
        textAlign:"center", lineHeight:1.7, margin:"0 0 48px",
        maxWidth:300,
      }}>{s.body}</p>

      {/* Buttons */}
      <div style={{display:"flex", gap:12, width:"100%", maxWidth:300}}>
        {!isLast && (
          <button onClick={onDone} style={{
            flex:1, padding:"14px", fontFamily:F.text, fontSize:14,
            color:C.muted, background:"transparent", border:`1px solid ${C.border}`,
            borderRadius:14, cursor:"pointer",
          }}>Skip</button>
        )}
        <button onClick={()=>isLast ? onDone() : setSlide(s=>s+1)} style={{
          flex:2, padding:"14px", fontFamily:F.text, fontSize:15, fontWeight:600,
          color:"#fff", background:s.color, border:"none",
          borderRadius:14, cursor:"pointer",
          boxShadow:`0 4px 16px ${s.color}40`,
        }}>{isLast ? "Start Reading" : "Next"}</button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────
// COMPARE COVERAGE — side by side left/center/right on one story
// ─────────────────────────────────────────────────────────────────
function CompareView({ story, allArticles, onClose }) {
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const result = await callClaude(
          `A news story: "${story.headline}" (Source: ${story.source}).
Find or imagine how a left-leaning, center, and right-leaning outlet would cover this SAME story differently.
Return ONLY valid JSON:
{
  "topic": "short topic label",
  "left":   { "source": "outlet name", "headline": "how left outlet headlines it", "angle": "1 sentence on their framing", "quote": "key phrase they'd use" },
  "center": { "source": "outlet name", "headline": "neutral headline", "angle": "1 sentence on their framing", "quote": "key phrase" },
  "right":  { "source": "outlet name", "headline": "how right outlet headlines it", "angle": "1 sentence on their framing", "quote": "key phrase they'd use" }
}`
        );
        const clean = result.replace(/\`\`\`json|\`\`\`/g,"").trim();
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) setComparison(JSON.parse(match[0]));
      } catch(e) {}
      setLoading(false);
    };
    run();
  }, [story.headline]);

  const cols = comparison ? [
    { key:"left",   label:"Left",   color:C.left,   data:comparison.left },
    { key:"center", label:"Center", color:C.center, data:comparison.center },
    { key:"right",  label:"Right",  color:C.right,  data:comparison.right },
  ] : [];

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:500,
      background: C.bg, overflowY:"auto",
      display:"flex", flexDirection:"column",
    }}>
      {/* Header */}
      <div style={{
        position:"sticky", top:0, zIndex:10,
        background: C.bg, borderBottom:`1px solid ${C.border}`,
        padding:"16px 20px", display:"flex", alignItems:"center", gap:12,
      }}>
        <button onClick={onClose} style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:99, width:32, height:32,
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", fontSize:16, color:C.muted, flexShrink:0,
        }}>←</button>
        <div>
          <p style={{fontFamily:F.text, fontSize:11, fontWeight:600, color:C.muted, margin:0, textTransform:"uppercase", letterSpacing:"0.06em"}}>Compare Coverage</p>
          <p style={{fontFamily:F.display, fontSize:14, fontWeight:700, color:C.text, margin:0, lineHeight:1.3}}>{story.headline.slice(0,60)}…</p>
        </div>
      </div>

      <div style={{padding:"20px 16px", maxWidth:640, margin:"0 auto", width:"100%"}}>
        {loading && (
          <div style={{display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", gap:16}}>
            <Spinner/>
            <p style={{fontFamily:F.text, fontSize:14, color:C.muted, margin:0}}>Analysing how each side covers this…</p>
          </div>
        )}

        {comparison && !loading && (
          <>
            <p style={{fontFamily:F.text, fontSize:13, color:C.muted, margin:"0 0 20px", textAlign:"center"}}>
              How <strong style={{color:C.text}}>{comparison.topic}</strong> is framed across the spectrum
            </p>

            {/* Three columns stacked on mobile */}
            <div style={{display:"flex", flexDirection:"column", gap:12}}>
              {cols.map(col => (
                <div key={col.key} style={{
                  background: C.card, borderRadius:16,
                  border:`1px solid ${C.border}`,
                  borderLeft:`4px solid ${col.color}`,
                  padding:"16px",
                }}>
                  <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:10}}>
                    <span style={{
                      fontSize:10, fontWeight:700, fontFamily:F.text,
                      color:col.color, background:col.color+"18",
                      borderRadius:20, padding:"3px 10px",
                      textTransform:"uppercase", letterSpacing:"0.05em",
                    }}>{col.label}</span>
                    <span style={{fontFamily:F.text, fontSize:12, color:C.muted}}>{col.data?.source}</span>
                  </div>
                  <p style={{
                    fontFamily:F.display, fontSize:15, fontWeight:700,
                    color:C.text, margin:"0 0 8px", lineHeight:1.35,
                  }}>{col.data?.headline}</p>
                  <p style={{fontFamily:F.text, fontSize:13, color:C.sub, margin:"0 0 10px", lineHeight:1.6}}>
                    {col.data?.angle}
                  </p>
                  {col.data?.quote && (
                    <p style={{
                      fontFamily:F.text, fontSize:12, color:col.color,
                      margin:0, fontStyle:"italic",
                      paddingLeft:10, borderLeft:`2px solid ${col.color}40`,
                    }}>"{col.data.quote}"</p>
                  )}
                </div>
              ))}
            </div>

            {/* Key differences summary */}
            <div style={{marginTop:20, background:C.surface, borderRadius:14, padding:"16px"}}>
              <p style={{fontFamily:F.text, fontSize:11, fontWeight:600, color:C.muted, margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.06em"}}>What this shows</p>
              <p style={{fontFamily:F.text, fontSize:13, color:C.sub, margin:0, lineHeight:1.6}}>
                The same story can be framed very differently depending on the outlet's perspective. Clarion shows you all three so you can form your own view.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [followedTopics, setFollowedTopics] = useState(["Politics","Tech","World"]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [compareStory, setCompareStory] = useState(null);

  // Wire C to darkMode — mutate in place so all components see the update
  const theme = darkMode ? DARK : LIGHT;
  Object.assign(C, theme);

  const all=[...aiArticles,...ARTICLES];

  // Sort: followed topics float to top, then rest
  const sortedAll = followedTopics.length > 0
    ? [...all.filter(a => followedTopics.includes(a.category)), ...all.filter(a => !followedTopics.includes(a.category))]
    : all;

  const feed=sortedAll.filter(a=>{
    if(category!=="All"&&a.category!==category) return false;
    if(search&&!a.headline.toLowerCase().includes(search.toLowerCase())&&!a.source.toLowerCase().includes(search.toLowerCase())) return false;
    if(regionFilter&&a.region!==regionFilter) return false;
    return true;
  });

  const onRead=id=>{
    setHistory(v=>v.includes(id)?v:[...v,id]);
  };

  const loadAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("https://clarion-proxy.vercel.app/api/gnews");
      const json = await res.json();
      const articles = (json.articles || []).filter(a => a.title && a.url).slice(0, 40);

      if (articles.length > 0) {
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

        // Build prompt for Claude enrichment — now also asks for image search query
        const lineList = articles.map((a, i) =>
          `${i+1}. Source: "${a.source?.name||"Unknown"}" | Headline: "${a.title}"`
        ).join("\n");

        const prompt = `Analyze these ${articles.length} news headlines. Return ONLY a JSON array with ${articles.length} objects in the same order. Each object: {"lean":"left OR center OR right","category":"Politics OR Tech OR Business OR Science OR World OR Health OR Uplifting OR Breaking","region":"US city name OR National OR country name","breaking":true or false}. Base lean on source: Fox News/WSJ/Breitbart=right, NYT/Guardian/NPR/CNN=left, Reuters/AP/BBC/Bloomberg=center.\n\n${lineList}`;

        const enriched = await callClaude(prompt);
        const clean = enriched.replace(/\`\`\`json|\`\`\`/g, "").trim();
        const match = clean.match(/\[[\s\S]*\]/);
        if (match) {
          const tags = JSON.parse(match[0]);
          if (tags.length > 0) {
            // Build enriched articles with lean/category/region from Claude
            const enrichedArticles = initial.map((a, i) => ({
              ...a,
              lean: tags[i]?.lean || "center",
              category: tags[i]?.category || "Breaking",
              region: tags[i]?.region || "National",
              breaking: tags[i]?.breaking || false,
            }));

            // Use original RSS/GNews images directly
            setAiArticles(enrichedArticles);
          } else {
            setAiArticles(initial);
          }
        } else {
          setAiArticles(initial);
        }
      }
    } catch (e) {
      console.error("loadAI failed:", e);
    }
    setLastUpdated(new Date());
    setAiLoading(false);
  };

  useEffect(()=>{ loadAI(); },[]);

  // Human-readable "last updated" string
  const lastUpdatedLabel = lastUpdated ? (() => {
    const mins = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins/60)}h ago`;
  })() : null;

  // Refresh countdown (re-render every 30s to keep label fresh)
  useEffect(()=>{
    const t = setInterval(()=>setLastUpdated(v=>v?new Date(v):v), 30000);
    return ()=>clearInterval(t);
  },[]);

  // Live search — fetches from NewsData.io by query
  const NEWSDATA_KEY = "pub_9bd9b65fe1654838ae735506c126e32e";
  const doSearch = async (query) => {
    if (!query.trim()) { setSearchResults(null); return; }
    setSearchLoading(true);
    try {
      const q = encodeURIComponent(query.trim().split(" ").slice(0,5).join(" "));
      const res = await fetch(`https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&q=${q}&language=en&size=10`);
      const json = await res.json();
      const results = (json.results || []).filter(a => a.title && a.link).map((a, i) => ({
        id: 900 + i,
        headline: a.title,
        summary: a.description || "",
        source: a.source_id || "Unknown",
        url: a.link,
        image: a.image_url || null,
        publishedAt: a.pubDate || null,
        lean: "center", category: "Breaking", time: "Live",
        breaking: false, region: "National", verified: true,
      }));
      setSearchResults(results);
    } catch(e) { setSearchResults([]); }
    setSearchLoading(false);
  };

  // Detect breaking stories — any article flagged breaking that hasn't been dismissed

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
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { margin: 0; padding: 0; background: ${C.bg}; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {showOnboarding && <OnboardingScreen onDone={()=>setShowOnboarding(false)}/>}
      {compareStory && <CompareView story={compareStory} allArticles={all} onClose={()=>setCompareStory(null)}/>}

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
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6}}>
            {/* Logo text */}
            <div style={{
              fontFamily: "'Times New Roman', Times, serif",
              fontSize: 34,
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.07em",
              display: "flex",
              alignItems: "baseline",
              userSelect: "none",
              lineHeight: 1,
            }}>
              <span>Clar</span><span style={{ fontStyle: "italic" }}>i</span><span>on.</span>
            </div>
            {/* Search icon + Refresh */}
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <button onClick={()=>setShowSearch(v=>!v)} style={{
                width:36, height:36, borderRadius:980,
                display:"flex", alignItems:"center", justifyContent:"center",
                background:C.surface, border:`1px solid ${C.border}`,
                cursor:"pointer", flexShrink:0, transition:"all 0.2s",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={showSearch ? C.text : C.muted} strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
                </svg>
              </button>
              <button onClick={()=>setDarkMode(v=>!v)} style={{
                width:36, height:36, borderRadius:980,
                display:"flex", alignItems:"center", justifyContent:"center",
                background:C.surface, border:`1px solid ${C.border}`,
                cursor:"pointer", flexShrink:0, fontSize:16,
              }}>{darkMode ? "☀️" : "🌙"}</button>
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

          {/* Last updated indicator */}
          {lastUpdatedLabel && (
            <div style={{display:"flex", alignItems:"center", gap:5, marginBottom:8}}>
              <div style={{width:6, height:6, borderRadius:"50%", background: aiLoading ? C.muted : "#5CB87A", flexShrink:0,
                animation: aiLoading ? "none" : "pulse-dot 2s ease-in-out infinite"}}/>
              <span style={{fontFamily:F.text, fontSize:11, color:C.muted}}>
                {aiLoading ? "Refreshing…" : `Updated ${lastUpdatedLabel}`}
              </span>
              <style>{`@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
            </div>
          )}

          {/* Search — icon that expands */}
          {showSearch && (
            <div style={{
              background: C.card, border:`1px solid ${C.border}`,
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
                  if(e.key==="Enter"){ doSearch(searchInput); setShowSearch(false); setTab("feed"); }
                  if(e.key==="Escape"){ setSearch(""); setSearchInput(""); setSearchResults(null); setShowSearch(false); }
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
              <div style={{ position:"absolute", left:0, top:0, bottom:0, width:24, zIndex:2, background:`linear-gradient(to right, ${C.bg} 40%, transparent)`, pointerEvents:"none" }}/>
              <div style={{ position:"absolute", right:0, top:0, bottom:0, width:24, zIndex:2, background:`linear-gradient(to left, ${C.bg} 40%, transparent)`, pointerEvents:"none" }}/>

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
                    border: `1px solid ${category===c ? C.border : C.divider}`,
                    background: category===c ? C.card : C.surface,
                    color: category===c ? C.text : C.muted,
                    boxShadow: "none",
                  }}>
                    {c}
                  </button>
                ))}
                {regionFilter && (
                  <button onClick={()=>setRegionFilter(null)} style={{
                    flexShrink:0, padding:"8px 16px", fontSize:12,
                    fontFamily:F.text, fontWeight:500, whiteSpace:"nowrap",
                    cursor:"pointer", borderRadius:980,
                    border:`1px solid ${C.border}`,
                    background:C.surface,
                    color:C.muted, boxShadow:"none",
                  }}>
                    📍 {regionFilter} ✕
                  </button>
                )}
              </div>
            </div>

            {/* Search results view */}
            {searchResults !== null && (
              <div style={{marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <p style={{fontFamily:F.text,fontSize:13,fontWeight:600,color:C.text,margin:0}}>{searchResults.length} results</p>
                  <button onClick={()=>setSearchResults(null)} style={{fontSize:11,color:C.muted,background:C.surface,border:`1px solid ${C.border}`,borderRadius:99,padding:"3px 10px",cursor:"pointer",fontFamily:F.text}}>Clear ✕</button>
                </div>
                {searchLoading && <div style={{display:"flex",gap:10,alignItems:"center",padding:"20px 0"}}><Spinner/><p style={{fontFamily:F.text,fontSize:14,color:C.muted,margin:0}}>Searching…</p></div>}
                {searchResults.map(a=>(
                  <div key={a.id} style={{marginBottom:10}}>
                    <ArticleCard a={a} onRead={onRead} bookmarks={bookmarks} setBookmarks={setBookmarks} setVerifying={setVerifying} onJournalist={setJournalist} isLead={false} isGrid={false} onCompare={setCompareStory}/>
                  </div>
                ))}
              </div>
            )}

            {searchResults === null && feed.length===0 && (
              <div style={{display:"flex", gap:12, alignItems:"center", justifyContent:"center", padding:"60px 0"}}>
                <Spinner/>
                <p style={{fontFamily:F.text, fontSize:14, color:C.muted, margin:0}}>Loading live stories…</p>
              </div>
            )}
            {searchResults === null && feed.length > 0 && (() => {
              const [lead, ...rest] = feed;
              const pairs = [];
              for (let i = 0; i < rest.length; i += 2) pairs.push(rest.slice(i, i+2));
              return (
                <>
                  {/* Lead story — full width */}
                  <div style={{ marginBottom:10 }}>
                    <ArticleCard a={lead} onRead={onRead} bookmarks={bookmarks} setBookmarks={setBookmarks} setVerifying={setVerifying} onJournalist={setJournalist} isLead={true} isGrid={false} onCompare={setCompareStory}/>
                  </div>
                  {/* 2-column grid for the rest */}
                  {pairs.map((pair, pi) => (
                    <div key={pi} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                      {pair.map(a => (
                        <ArticleCard key={a.id} a={a} onRead={onRead} bookmarks={bookmarks} setBookmarks={setBookmarks} setVerifying={setVerifying} onJournalist={setJournalist} isLead={false} isGrid={true} onCompare={setCompareStory}/>
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
            <h2 style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:C.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Balance</h2>
            <p style={{fontFamily:F.text,fontSize:14,color:C.muted,margin:"0 0 20px",lineHeight:1.5}}>Track your reading diet and stay informed across the spectrum.</p>

            <BiasGauge history={history} allArticles={all}/>

            {/* Balance trend chart */}
            {/* Topic following */}
            <div style={{marginBottom:24}}>
              <h3 style={{fontFamily:F.display,fontSize:17,fontWeight:700,color:C.text,margin:"0 0 4px",letterSpacing:"-0.01em"}}>Your Topics</h3>
              <p style={{fontFamily:F.text,fontSize:13,color:C.muted,margin:"0 0 12px"}}>Followed topics appear first in your feed.</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {CATS.filter(c=>c!=="All").map(cat=>{
                  const active = followedTopics.includes(cat);
                  return (
                    <button key={cat} onClick={()=>setFollowedTopics(v=>active?v.filter(x=>x!==cat):[...v,cat])}
                      style={{
                        padding:"8px 14px", fontSize:13, fontWeight:active?600:400,
                        fontFamily:F.text, borderRadius:20, cursor:"pointer",
                        background: active ? C.orange : C.surface,
                        color: active ? "#fff" : C.sub,
                        border: `1px solid ${active ? C.orange : C.border}`,
                        transition:"all 0.15s",
                      }}>
                      {active ? "✓ " : ""}{cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suggested for balance */}
            {history.length>0&&(
              <>
                <h3 style={{fontFamily:F.display,fontSize:17,fontWeight:700,color:C.text,margin:"0 0 4px",letterSpacing:"-0.01em"}}>Suggested for Balance</h3>
                <p style={{fontFamily:F.text,fontSize:13,color:C.muted,margin:"0 0 16px"}}>Stories from perspectives you haven't read yet.</p>
                {all.filter(a=>!history.includes(a.id)).slice(0,5).map(a=>(
                  <div key={a.id} onClick={()=>{ onRead(a.id); setTab("feed"); }} style={{display:"flex",gap:12,padding:"14px 0",borderBottom:`1px solid ${C.divider}`,cursor:"pointer",alignItems:"flex-start"}}>
                    <div style={{width:3,alignSelf:"stretch",borderRadius:2,background:leanColor(a.lean),flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontFamily:F.text,fontSize:14,color:C.text,fontWeight:500,margin:"0 0 3px",lineHeight:1.35}}>{decodeHTML(a.headline)}</p>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <p style={{fontFamily:F.text,fontSize:12,color:C.muted,margin:0}}>{a.source}</p>
                        <span style={{fontSize:10,color:leanColor(a.lean),fontWeight:600,background:leanColor(a.lean)+"18",borderRadius:10,padding:"1px 6px",fontFamily:F.text}}>{a.lean}</span>
                      </div>
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
                <p style={{fontFamily:F.text,fontSize:15,color:C.sub,lineHeight:1.7,margin:"0 0 24px",paddingLeft:14,borderLeft:`3px solid ${C.accent}`}}>{briefing.overview}</p>
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
                  <ArticleCard key={a.id} a={a} onRead={onRead} bookmarks={bookmarks} setBookmarks={setBookmarks} setVerifying={setVerifying} onJournalist={setJournalist} isLead={i===0} isGrid={false} onCompare={setCompareStory}/>
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
        background: C.bg,
        borderTop: `1px solid ${C.border}`,
        borderRadius:"20px 20px 0 0",
        boxShadow: "none",
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
