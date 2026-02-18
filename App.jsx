import { useState, useEffect, useRef } from "react";

/* ===========================================
   MOCK DATA — 5 sample roles + default
   =========================================== */

const MOCK_DATA = {
  "Uber Driver": {
    replacement: "January 01, 2028 – June 30, 2028",
    confidence:
      "High confidence: Based on current trends in autonomous vehicle tech and regulatory timelines",
    when: "Mid-2028 window: Autonomous vehicle models reach Level 4+ maturity by late 2027; full regulatory clearance for routine urban routes expected by Q1 2028. Confidence: High in major urban metros (SF, Phoenix, Austin), Medium in suburban/rural areas where infrastructure lags.",
    how: [
      "Routing & logistics optimization via AI-powered apps — already happening (Uber/Lyft real-time dispatch AI)",
      "Passenger interaction via voice agents (Claude 4 / GPT-5 conversational AI handles ride preferences, complaints, accessibility requests) — within 12 months",
      "Partial autonomous driving in geo-fenced urban corridors (Waymo, Cruise expansion) — 12–18 months",
      "Full vehicle autonomy via robotaxis and humanoid-assisted fleet maintenance (Tesla FSD v14+, Figure AI robotics) — 24–36 months",
    ],
    companies:
      "Waymo (Alphabet) operating 100K+ weekly robotaxi rides in SF/Phoenix; Tesla FSD v13 targeting unsupervised highway driving by mid-2026; Uber partnering with Aurora for autonomous freight & rides; Amazon/Zoox expanding autonomous delivery; Cruise (GM) relaunching with enhanced safety stack; Mobileye (Intel) licensing L4 systems to OEMs.",
    jobsNow:
      "1.1M US ride-share drivers active (BLS Q1 2025) → projected 400K by 2030 (Goldman Sachs AI & Labor Report 2025). Displacement concentrated in top-20 metros first. Transition paths: fleet supervisors, remote vehicle monitors, accessibility/special-needs transport, or exit to unrelated gigs.",
    brutal:
      "Right now: AI still struggles with edge cases — construction zones, severe weather, unpredictable pedestrians, unmarked rural roads. Within 12 months: Agentic AI (Claude/Gemini) handles 60%+ of dispatch, customer service, and route optimization queries with no human. Logical trajectory: Regulations like the proposed SELF DRIVE Act and state-level AV frameworks enable AI-first deployment for routine urban rides by 2028. Humans retained only for appeals, special-needs transport, and regulatory-mandated oversight in complex zones.",
    timelineMilestones: [
      { label: "Now", desc: "AI-assisted routing & dispatch" },
      { label: "Q3 2026", desc: "Voice agents handle 60% passenger queries" },
      { label: "Q1 2027", desc: "Robotaxis expand to 30+ cities" },
      { label: "Q1 2028", desc: "Full replacement range begins" },
    ],
  },
  "Sales Rep": {
    replacement: "July 01, 2027 – December 31, 2028",
    confidence:
      "Medium-High confidence: Depends on enterprise adoption speed and deal complexity",
    when: "Late 2027–2028 window: AI sales agents (Salesforce Einstein GPT, HubSpot AI) handle full pipeline from lead gen to close for transactional B2B/B2C deals by late 2027. Complex enterprise sales with relationship-heavy cycles persist longer. Confidence: High for inside sales/SDR roles, Medium for field/enterprise sales.",
    how: [
      "Lead generation & qualification via AI prospecting tools (Apollo AI, ZoomInfo) — already happening",
      "Personalized outreach at scale via AI copywriting and sequencing (Outreach AI, Salesloft GPT) — now to 6 months",
      "Full discovery calls & demos via conversational AI agents (Salesforce Agentforce, Bland.ai) — 12–18 months",
      "Autonomous deal negotiation & closing for standardized contracts (AI + CRM integration) — 24–30 months",
    ],
    companies:
      "Salesforce (Agentforce platform automating full sales cycles); HubSpot (AI-first CRM rewrite); Gong (AI revenue intelligence replacing sales coaching); Outreach (AI sequencing replacing SDR workflows); Bland.ai & Air AI (autonomous AI phone agents); Klarna (already replaced 700 customer service FTEs with AI).",
    jobsNow:
      "1.7M B2B sales reps in US (BLS 2025) → projected 900K by 2030 (McKinsey Global Institute). SDR/BDR roles most exposed. Survivors shift to strategic account management, AI-augmented relationship selling, or sales engineering.",
    brutal:
      "Right now: AI can generate emails and qualify leads but can't navigate nuanced objection handling or read a room. Within 12 months: AI agents conduct full discovery calls with human-level conversational ability. Logical trajectory: By 2028, 70% of transactional sales cycles (deals under $50K) are AI-managed end-to-end. Human reps become 'deal architects' for complex enterprise relationships or get displaced entirely.",
    timelineMilestones: [
      { label: "Now", desc: "AI lead gen & email sequences" },
      { label: "Q1 2027", desc: "AI agents run discovery calls" },
      { label: "Q3 2027", desc: "Autonomous deal closing (transactional)" },
      { label: "Q4 2028", desc: "Full replacement for inside sales" },
    ],
  },
  Nurse: {
    replacement: "January 01, 2032 – December 31, 2035",
    confidence:
      "Low-Medium confidence: Physical care, empathy, and regulatory barriers create significant runway",
    when: "2032–2035 window: AI handles diagnostics, triage, medication management, and documentation by 2028. Physical patient care (IVs, wound care, mobility assistance) requires robotics maturity not expected before 2032+. Nursing shortages actually increase near-term demand. Confidence: Low for bedside/acute care, Medium-High for administrative nursing tasks.",
    how: [
      "Documentation & charting via ambient AI scribes (Nuance DAX, Abridge) — already happening",
      "AI-powered triage & symptom assessment (Babylon Health, Ada Health) — now to 12 months",
      "Medication management & dosage optimization via clinical AI (Epic AI, Tempus) — 12–24 months",
      "Robotic-assisted physical care (Diligent Robotics Moxi, Toyota nursing bots) — 5–8 years",
      "Full autonomous nursing for routine care in controlled settings — 8–12 years",
    ],
    companies:
      "Epic Systems (AI-first EHR integration); Nuance/Microsoft (DAX Copilot for clinical documentation); Google DeepMind (Med-PaLM medical AI); Diligent Robotics (Moxi hospital robot); Intuitive Surgical (Da Vinci robotic surgery expanding to routine procedures); Hippocratic AI (AI nurses for non-critical patient communication).",
    jobsNow:
      "3.2M registered nurses in US (BLS 2025) → projected 3.4M by 2030 due to aging population demand (despite AI). Administrative nursing roles decline 40%. Net displacement begins post-2032 as robotics mature. Transition: AI-augmented 'super nurses' handling 3× patient loads, informatics, telehealth coordination.",
    brutal:
      "Right now: AI is excellent at pattern recognition (reading scans, flagging drug interactions) but terrible at physical care — changing bandages, comforting dying patients, handling combative individuals. Within 2 years: AI eliminates 80% of nursing paperwork, freeing time but also reducing headcount justification. Logical trajectory: Nursing is one of the safest careers near-term due to physical requirements and shortage-driven demand. However, by 2032+, robotic nursing assistants handle routine physical tasks in hospitals. Nurses evolve into care coordinators and AI system overseers.",
    timelineMilestones: [
      { label: "Now", desc: "AI scribes handle documentation" },
      { label: "Q2 2027", desc: "AI triage handles 70% of assessments" },
      { label: "2030", desc: "Nursing robots deployed in major hospitals" },
      { label: "2032–35", desc: "Routine care automation begins" },
    ],
  },
  "Graphic Designer": {
    replacement: "July 01, 2026 – June 30, 2027",
    confidence:
      "High confidence: Generative AI already performing most production design tasks",
    when: "Mid-2026 to mid-2027: AI image/video generation (Midjourney v7, DALL-E 4, Adobe Firefly 3) already handles 80%+ of production design. Remaining creative direction and brand strategy roles shrink as AI improves taste/consistency. Confidence: Very High for production/template designers, Medium for senior creative directors.",
    how: [
      "Template-based design (social posts, ads, banners) via AI tools (Canva AI, Adobe Express) — already replaced",
      "Custom illustration & brand asset generation via Midjourney/DALL-E/Stable Diffusion — happening now",
      "Full brand identity systems generated by AI with human prompt direction — within 6 months",
      "Video/motion design via AI (Runway Gen-3, Pika, Sora) replacing motion designers — 6–12 months",
      "AI creative directors that iterate on brand feedback autonomously — 12–18 months",
    ],
    companies:
      "Adobe (Firefly deeply integrated across Creative Cloud, making Photoshop/Illustrator AI-first); Canva (AI-powered design replacing 90% of SMB design needs); Midjourney (dominant in high-quality image generation); Figma (AI auto-layout and design generation); Runway ML (AI video production); Jasper (AI brand voice + visual consistency).",
    jobsNow:
      "270K graphic designers in US (BLS 2025) → projected 110K by 2030 (WEF Future of Jobs). Freelance/production designers hit hardest. Survivors pivot to AI creative direction, UX strategy, or become 'prompt artists' bridging human taste with AI execution.",
    brutal:
      "Right now: AI generates stunning visuals in seconds that would take a designer hours. It still struggles with precise typography, complex layouts, and brand consistency across 50+ assets. Within 6 months: Multimodal AI models handle end-to-end brand systems with style transfer and consistency controls. Logical trajectory: The $50/hr production designer is already obsolete. The $200/hr creative director has 18–24 months. Design becomes a taste & prompt skill, not a craft skill.",
    timelineMilestones: [
      { label: "Now", desc: "AI handles 80% of production design" },
      { label: "Q4 2026", desc: "Full brand systems via AI" },
      { label: "Q2 2027", desc: "Senior design roles shrink 50%" },
      { label: "2028", desc: "Design = prompt engineering" },
    ],
  },
  "Data Analyst": {
    replacement: "January 01, 2027 – December 31, 2027",
    confidence:
      "High confidence: AI already performing core data analysis tasks end-to-end",
    when: "2027 window: AI data agents (Claude Artifacts, ChatGPT Code Interpreter, Google Gemini Advanced) already perform SQL queries, build dashboards, run statistical analyses, and generate insights from natural language prompts. Full replacement of junior/mid analysts when AI achieves reliable autonomous data pipeline management. Confidence: Very High for reporting/dashboard analysts, High for insight analysts, Medium for senior strategic analysts.",
    how: [
      "SQL queries & data extraction from natural language prompts — already happening (ChatGPT, Claude)",
      "Automated dashboard creation & visualization (Tableau GPT, Power BI Copilot) — now",
      "Statistical analysis & hypothesis testing via AI agents — within 6 months",
      "Full data pipeline management: ingestion → cleaning → analysis → insight → recommendation — 12–18 months",
      "Strategic data interpretation with business context (AI + domain knowledge bases) — 18–24 months",
    ],
    companies:
      "Microsoft (Copilot in Power BI, Excel AI); Tableau/Salesforce (GPT-powered analytics); Google (Gemini in BigQuery, Looker AI); Databricks (AI-first lakehouse with natural language querying); ThoughtSpot (AI-powered business intelligence); Claude/Anthropic (Artifacts for instant data analysis and visualization).",
    jobsNow:
      "105K data analysts in US (BLS 2025) → projected 45K dedicated analyst roles by 2030 (McKinsey). However, 'data analysis' becomes embedded skill in every knowledge worker role. Survivors become 'data strategists' who define questions, not answer them.",
    brutal:
      "Right now: AI can analyze a dataset, find patterns, build charts, and write summaries better than 70% of junior analysts — in minutes vs. days. It still hallucinates numbers occasionally and misses business context. Within 12 months: AI agents reliably manage full analysis pipelines with human-level accuracy and zero hallucination on structured data. Logical trajectory: 'Data Analyst' as a standalone role largely vanishes by 2028. Every PM, marketer, and exec becomes their own analyst via AI tools. Remaining human analysts focus on ambiguous strategic questions and AI governance.",
    timelineMilestones: [
      { label: "Now", desc: "AI handles SQL, dashboards, basic analysis" },
      { label: "Q3 2026", desc: "Autonomous data pipelines" },
      { label: "Q1 2027", desc: "Junior analyst roles eliminated" },
      { label: "Q4 2027", desc: "Full replacement for standard analytics" },
    ],
  },
};

const DEFAULT_MOCK = {
  replacement: "2028 – 2031",
  confidence:
    "Medium confidence: Varies significantly by specific role, industry, and region",
  when: "2028–2031 window: AI agents and automation tools will progressively absorb core tasks in this role. The timeline depends on the physical vs. cognitive nature of work, regulatory environment, and adoption speed in your industry.",
  how: [
    "Administrative and repetitive tasks automated via AI assistants — already happening",
    "Decision-support and analysis augmented by AI copilots — within 12 months",
    "Core knowledge work performed by specialized AI agents — 18–36 months",
    "Full autonomous operation for standardized workflows — 3–5 years",
  ],
  companies:
    "Microsoft (Copilot across Office suite); Google (Gemini workspace integration); Salesforce (Agentforce); OpenAI (ChatGPT Enterprise); Anthropic (Claude for business); various industry-specific AI startups targeting your sector.",
  jobsNow:
    "Exact figures vary. General trend: 30–50% of current roles in this category expected to be significantly transformed or eliminated by 2030 (WEF Future of Jobs Report 2025, McKinsey Global Institute).",
  brutal:
    "Right now: AI handles the easy, repetitive parts of your job but stumbles on nuance, judgment, and relationships. Within 18 months: AI agents chain together multi-step workflows that currently require human coordination. Logical trajectory: The role doesn't vanish overnight — it compresses. Companies need fewer people doing more with AI. Those who master AI tools become 10× more productive and valuable. Those who don't become redundant.",
  timelineMilestones: [
    { label: "Now", desc: "AI assists with routine tasks" },
    { label: "Q4 2026", desc: "AI agents handle core workflows" },
    { label: "2028", desc: "Significant role compression" },
    { label: "2030", desc: "Transformation largely complete" },
  ],
};

/* ===========================================
   OPTION LISTS
   =========================================== */

const JOB_TITLES = [
  "Account Manager","Accountant","Actor","Actuary","Administrative Assistant","Analyst",
  "Artist","Athlete","Auditor","Bookkeeper","Business Analyst","Call Center Agent",
  "Carpenter","Chef","Coach","Compliance Officer","Consultant","Content Creator",
  "Copywriter","Corporate Worker","Counselor","Customer Service Rep","Data Analyst",
  "Data Entry Clerk","Dentist","Digital Marketer","Doctor","Economist","Editor",
  "Electrician","Engineer - Aerospace","Engineer - Biomedical","Engineer - Chemical",
  "Engineer - Civil","Engineer - Electrical","Engineer - Environmental",
  "Engineer - Industrial","Engineer - Mechanical","Engineer - Nuclear",
  "Engineer - Petroleum","Event Planner","Executive Assistant","Farmer","Finance",
  "Firefighter","General Manager","Graphic Designer","Help Desk Support","HR Manager",
  "Interpreter","Investment Banker","IT Support","Journalist","Lawyer",
  "Loss-Prevention Analyst","Management","Market Research Analyst","Marketing",
  "Marketing Coordinator","Mechanic","Musician","Nurse","Office Administrator",
  "Operations Manager","Paralegal","Paramedic","Pharmacist","Pilot","Plumber",
  "Police Officer","Policy Analyst","Procurement Specialist","Product Manager",
  "Project Manager","Public Relations Specialist","Radiologist","Recruiter",
  "Risk Manager","Sales Rep","SEO Specialist","Social Media Manager","Software Engineer",
  "Statistician","Supply Chain Analyst","Surgeon","Teacher","Therapist","Trader",
  "Translator","Truck Driver","Uber Driver","UX/UI Designer","Veterinarian",
  "Virtual Assistant","Welder","Writer","Other",
];

const INDUSTRIES = [
  "Agriculture","Construction","Creative/Media","Customer Service","Education",
  "Energy/Utilities","Finance/Banking","Government/Public Sector","Healthcare",
  "Hospitality","Legal","Manufacturing","Media/Entertainment","Nonprofit",
  "Real Estate","Retail","Sales/Marketing","Tech/Software",
  "Transportation/Ride-Share","Other",
];

/* ===========================================
   SMALL COMPONENTS
   =========================================== */

function AnimatedClock() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const sec = (tick % 60) * 6;
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      style={{ opacity: 0.85, marginTop: 8 }}
      aria-label="Countdown clock animation"
    >
      <circle cx="60" cy="60" r="56" fill="none" stroke="#D2042D" strokeWidth="3" opacity="0.3" />
      <circle
        cx="60" cy="60" r="56" fill="none" stroke="#D2042D" strokeWidth="3"
        strokeDasharray={`${(tick % 60) * 5.86} 352`}
        style={{ transition: "stroke-dasharray 1s linear" }}
      />
      <line
        x1="60" y1="60" x2="60" y2="20" stroke="#F0F0F0" strokeWidth="2.5" strokeLinecap="round"
        transform={`rotate(${(tick % 720) * 0.5}, 60, 60)`}
        style={{ transition: "transform 1s linear" }}
      />
      <line
        x1="60" y1="60" x2="60" y2="28" stroke="#D2042D" strokeWidth="1.8" strokeLinecap="round"
        transform={`rotate(${sec}, 60, 60)`}
        style={{ transition: "transform 0.3s ease" }}
      />
      <circle cx="60" cy="60" r="4" fill="#D2042D" />
      <text x="60" y="82" textAnchor="middle" fill="#F0F0F0" fontSize="9" fontFamily="monospace" opacity="0.7">
        TIME LEFT
      </text>
    </svg>
  );
}

function TimelineBar({ milestones }) {
  return (
    <div style={{ margin: "24px 0", padding: "0 0", overflowX: "auto" }}>
      {/* Horizontal padding inside the scrollable area keeps first/last labels visible */}
      <div style={{ minWidth: "520px", padding: "0 60px" }}>
        <div
          style={{
            position: "relative",
            height: "6px",
            background: "#2a2a2a",
            borderRadius: "3px",
            margin: "32px 0 0",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "100%",
              borderRadius: "3px",
              background: "linear-gradient(90deg, #D2042D 0%, #D2042D 25%, #ff4d4d 100%)",
            }}
          />
          {milestones.map((m, i) => {
            const pct = (i / (milestones.length - 1)) * 100;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${pct}%`,
                  top: "-8px",
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    background: i === milestones.length - 1 ? "#D2042D" : "#F0F0F0",
                    borderRadius: "50%",
                    border: "2px solid #D2042D",
                    margin: "2px auto",
                  }}
                />
                <div style={{ textAlign: "center", marginTop: "10px", minWidth: "110px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#D2042D" }}>{m.label}</div>
                  <div style={{ fontSize: "11px", color: "#aaa", maxWidth: "130px", margin: "2px auto 0" }}>
                    {m.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ height: "74px" }} />
      </div>
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid #2a2a2a", marginBottom: "4px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          padding: "16px 0",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#D2042D", fontSize: "clamp(16px, 2.5vw, 20px)", fontWeight: 700 }}>{title}</span>
        <span
          style={{
            color: "#D2042D",
            fontSize: "24px",
            transition: "transform 0.25s",
            transform: open ? "rotate(180deg)" : "rotate(0)",
          }}
        >
          ▾
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? "2000px" : "0",
          overflow: "hidden",
          transition: "max-height 0.35s ease",
        }}
      >
        <div style={{ padding: "0 0 20px", color: "#F0F0F0", lineHeight: 1.7, fontSize: "15px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SelectDropdown({ label, options, value, onChange, required, allowCustom, placeholder }) {
  const [custom, setCustom] = useState(false);
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", marginBottom: "6px", color: "#ccc", fontSize: "14px", fontWeight: 600 }}>
        {label} {required && <span style={{ color: "#D2042D" }}>*</span>}
      </label>
      {!custom ? (
        <div style={{ display: "flex", gap: "8px" }}>
          <select value={value} onChange={(e) => onChange(e.target.value)} required={required} style={inputStyle}>
            <option value="">{placeholder || "Select..."}</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {allowCustom && (
            <button
              type="button"
              onClick={() => {
                setCustom(true);
                onChange("");
              }}
              style={{ ...btnSmall, flexShrink: 0 }}
            >
              Custom
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type custom entry..."
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => {
              setCustom(false);
              onChange("");
            }}
            style={{ ...btnSmall, flexShrink: 0 }}
          >
            List
          </button>
        </div>
      )}
    </div>
  );
}

/* ===========================================
   PAYWALL SUCCESS MOCK
   =========================================== */

function PaywallSuccess({ rating, quizAnswers, jobTitle }) {
  const interests = quizAnswers.interests || [];
  const llms = quizAnswers.llms || [];
  const budget = quizAnswers.budget || "";
  const hasInterest = (kw) => interests.some((i) => i.toLowerCase().includes(kw.toLowerCase()));
  const usesLLM = (kw) => llms.some((l) => l.toLowerCase().includes(kw.toLowerCase()));
  const budgetNum = budget.includes("100+") ? 150 : budget.includes("100") ? 100 : budget.includes("50") ? 50 : budget.includes("20") ? 20 : 0;
  const isHighAmbition = hasInterest("agent") || hasInterest("coding") || hasInterest("local") || hasInterest("ML");

  const getTimeline = () => {
    if (rating <= 3) return "6–12 months to intermediate";
    if (rating <= 6) return "3–6 months to advanced";
    if (rating <= 8) return "1–3 months to mastery";
    return "0–1 month to expert/lead";
  };

  const getToolRecs = () => {
    const recs = [];

    if (rating <= 3) {
      // Low rating — prioritize free/low-cost, 1-3 primary
      recs.push({
        tool: "ChatGPT Free Tier",
        cost: "Free",
        note: "Start here — learn prompting fundamentals with the most widely-used LLM. Best for general learning.",
        primary: true,
      });
      if (hasInterest("research") || hasInterest("content")) {
        recs.push({
          tool: "Claude.ai (Free)",
          cost: "Free",
          note: "Excellent for deep analysis, long documents, and writing tasks. Great second LLM to compare outputs.",
          primary: true,
        });
      }
      recs.push({
        tool: "Grok (Free)",
        cost: "Free",
        note: "Real-time information access, good for research practice and staying current on AI trends.",
        primary: !hasInterest("research"),
      });
      if (budgetNum >= 20) {
        recs.push({
          tool: "Coursera Plus (or free audit)",
          cost: "Free–$59/mo",
          note: "Structured AI/ML courses from Stanford, Google, DeepLearning.AI. Audit for free or subscribe for certificates.",
        });
      } else {
        recs.push({
          tool: "Coursera AI Courses (free audit)",
          cost: "Free",
          note: "Audit mode gives full access to lecture content. Start with 'AI For Everyone' by Andrew Ng.",
        });
      }
      if (hasInterest("no-code") || hasInterest("automation")) {
        recs.push({ tool: "Zapier (Free tier)", cost: "Free", note: "No-code automation — connect apps and create workflows without coding." });
      }
    } else if (rating <= 6) {
      // Mid rating — paid tools, tailored to interests
      if (hasInterest("agent") || hasInterest("research") || hasInterest("strategy")) {
        recs.push({
          tool: "Claude Pro",
          cost: "$20/mo",
          note: "Primary pick: Artifacts for instant data viz, agent workflows, deep reasoning. Best for strategy and analysis tasks.",
          primary: true,
        });
      }
      if (hasInterest("coding") || hasInterest("content") || (!hasInterest("agent") && !recs.length)) {
        recs.push({
          tool: "ChatGPT Plus",
          cost: "$20/mo",
          note: `${hasInterest("coding") ? "Primary pick: " : ""}Code Interpreter, GPT-4o, DALL-E image gen, Codex for code generation. Best all-rounder.`,
          primary: hasInterest("coding") || !recs.some((r) => r.primary),
        });
      }
      if (budgetNum < 20 && !recs.some((r) => r.primary)) {
        recs.push({
          tool: "Grok Premium",
          cost: "$8/mo",
          note: "Budget-friendly advanced AI access with real-time info. Great value at half the price of competitors.",
          primary: true,
        });
      } else if (budgetNum >= 20 && !usesLLM("grok")) {
        recs.push({ tool: "Grok Premium", cost: "$8/mo", note: "Add as budget-friendly second opinion LLM with real-time search." });
      }
      if (hasInterest("coding") && budgetNum >= 50) {
        recs.push({ tool: "Cursor Pro", cost: "$20/mo", note: "AI-powered code editor — dramatically accelerates development if you're learning to code." });
      }
      if (hasInterest("automation") || hasInterest("no-code")) {
        recs.push({ tool: "Zapier (Free–$19.99/mo)", cost: "Free–$20/mo", note: "No-code automation workflows. Connect 6,000+ apps. Free tier handles basic automations." });
        if (budgetNum >= 50) {
          recs.push({ tool: "Replit Agent", cost: "$10/mo", note: "Build and deploy apps with AI assistance — no deep coding knowledge required." });
        }
      }
      if (hasInterest("no-code") && budgetNum >= 50) {
        recs.push({ tool: "Bubble.io", cost: "Free–$29/mo", note: "Full-featured no-code app builder. Build production apps without writing code." });
      }
    } else if (rating <= 8) {
      // High rating — power user tools
      recs.push({
        tool: "Claude Pro",
        cost: "$20/mo",
        note: "Primary: Artifacts + agent workflows + deep analysis. Essential for power users moving toward mastery.",
        primary: true,
      });
      if (hasInterest("coding") || hasInterest("agent")) {
        recs.push({
          tool: "ChatGPT Plus + Codex",
          cost: "$20/mo",
          note: `${hasInterest("coding") ? "Primary for code: " : ""}Full-stack AI coding, code generation, and advanced reasoning. Pair with Claude for best results.`,
          primary: hasInterest("coding"),
        });
        if (budgetNum >= 50) {
          recs.push({ tool: "Cursor Pro", cost: "$20/mo", note: "Professional AI development environment. Best-in-class for AI-assisted coding workflows." });
        }
      }
      if (hasInterest("agent") || hasInterest("automation")) {
        recs.push({ tool: "Replit Agent", cost: "$10/mo", note: "Rapid prototyping & deployment of AI-powered apps and agent workflows." });
      }
      if (hasInterest("no-code")) {
        recs.push({ tool: "Bubble.io", cost: "Free–$29/mo", note: "Scale no-code apps to production. Combine with AI APIs for powerful automated products." });
      }
      if (budgetNum >= 100 && (hasInterest("ML") || hasInterest("data"))) {
        recs.push({ tool: "Weights & Biases", cost: "Free tier", note: "ML experiment tracking and model monitoring. Industry standard for serious practitioners." });
      }
    } else {
      // 9-10 — expert/lead level
      recs.push({
        tool: "Claude Pro",
        cost: "$20/mo",
        note: "Essential: Agent workflows, Artifacts, deep reasoning chains. Use for complex strategy and system design.",
        primary: true,
      });
      if (hasInterest("coding") || hasInterest("agent")) {
        recs.push({
          tool: "Cursor Pro + Claude/OpenAI API",
          cost: "$20/mo + usage",
          note: "Professional agentic coding setup. API access enables custom integrations and automated pipelines.",
          primary: true,
        });
      }
      if (!usesLLM("grok")) {
        recs.push({ tool: "Grok Premium", cost: "$8/mo", note: "Keep for real-time intelligence and as a fast secondary LLM for quick checks." });
      }
      if (hasInterest("ML") || hasInterest("local")) {
        recs.push({ tool: "Weights & Biases", cost: "Free tier", note: "ML experiment tracking — essential for anyone training or fine-tuning models." });
      }
    }

    // Hardware recs for high rating + high ambition
    if (rating >= 7 && isHighAmbition && budgetNum >= 50) {
      recs.push({ tool: "", cost: "", note: "", divider: true });
      if (hasInterest("local") || hasInterest("ML")) {
        recs.push({
          tool: "Mac Mini M4 Pro 48GB",
          cost: "$1,299+",
          note: "Run Llama 70B+ and other open-source models locally. Best value for serious local AI work.",
          hardware: true,
        });
        recs.push({
          tool: "Mac Studio M4 Max 64GB+",
          cost: "$3,999+",
          note: "Super advanced ML workstation — local training, fine-tuning, and running 100B+ parameter models.",
          hardware: true,
        });
        recs.push({
          tool: "Used RTX 4090 Laptop",
          cost: "$2K–$3K",
          note: "Best GPU value for ML training on a budget. 24GB VRAM handles most fine-tuning tasks.",
          hardware: true,
        });
      } else if (hasInterest("agent") || hasInterest("coding")) {
        recs.push({
          tool: "Mac Mini M4 Pro 48GB",
          cost: "$1,299+",
          note: "Recommended for running local Llama models alongside your development environment for offline AI access.",
          hardware: true,
        });
      }
    }

    return recs;
  };

  // Build prompts tailored to top interests
  const getPrompts = () => {
    const base = [
      `"Act as a senior ${jobTitle || "professional"} with 15 years of experience. Analyze this [document/data] and identify the top 3 strategic risks I'm missing."`,
      `"Build me a 90-day learning roadmap for mastering AI tools in my role as a ${jobTitle || "professional"}. Break it into weekly milestones with specific exercises."`,
      `"Review my work output below and rate it 1-10 on [clarity/accuracy/impact]. Then rewrite the weakest sections to be top-tier quality."`,
    ];
    const interestPrompts = [];
    if (hasInterest("agent") || hasInterest("automation")) {
      interestPrompts.push(
        `"Design an autonomous AI agent workflow that handles [specific repetitive task] end-to-end. Include: trigger conditions, decision logic, error handling, and human escalation rules. Output as a step-by-step implementation plan."`,
        `"I want to build an AI agent that monitors [data source], analyzes changes, and takes action via [tool/API]. Design the architecture, list required tools (Claude API, Zapier, etc.), and give me the implementation steps."`,
        `"Create a multi-agent system prompt where Agent A researches [topic], Agent B synthesizes findings, and Agent C drafts recommendations. Define each agent's role, inputs, outputs, and handoff logic."`,
      );
    }
    if (hasInterest("coding") || hasInterest("app")) {
      interestPrompts.push(
        `"I'm building a [web app/tool] that [does X]. Generate the full stack: React frontend, Node.js backend, database schema, and API endpoints. Start with the MVP scope and architecture."`,
        `"Debug this code: [paste code]. Explain what's wrong, why it fails, the fix, and how to prevent similar issues. Then refactor for production quality."`,
        `"Generate a complete CI/CD pipeline configuration for a [React/Python/Node] project deploying to [Vercel/AWS/GCP]. Include testing, linting, and automated deployment steps."`,
      );
    }
    if (hasInterest("prompt")) {
      interestPrompts.push(
        `"Act as a prompt engineering expert. I want to achieve [specific output]. Show me 3 different prompting strategies (chain-of-thought, few-shot, role-based) and compare their likely outputs. Then recommend the best approach."`,
        `"Create a prompt template library for a ${jobTitle || "professional"}: 5 daily-use prompts, 3 weekly strategic prompts, and 2 monthly deep-analysis prompts. Each should include placeholders I fill in."`,
      );
    }
    if (hasInterest("data") || hasInterest("analysis")) {
      interestPrompts.push(
        `"Analyze this dataset and produce: (1) key patterns with statistical significance, (2) anomalies and outliers, (3) 3 actionable recommendations ranked by confidence level and expected impact."`,
        `"I have a CSV with [columns]. Write Python/SQL code to: clean the data, handle missing values, create 3 key visualizations, and generate a summary report with insights a non-technical executive would understand."`,
      );
    }
    if (hasInterest("content") || hasInterest("creation")) {
      interestPrompts.push(
        `"Create a content calendar for [brand/topic] covering 4 weeks. Include: 3 long-form pieces, 12 social posts, 2 email newsletters. For each, provide the hook, key points, target audience, and CTA."`,
        `"Write a [blog post/article] about [topic] in the style of [publication/tone]. Include: compelling headline options (3), meta description, subheadings, and a strong conclusion with CTA. Target length: [X] words."`,
      );
    }
    if (hasInterest("strategy") || hasInterest("business")) {
      interestPrompts.push(
        `"Act as a McKinsey-level strategy consultant. Analyze [company/product/market] using Porter's Five Forces + AI disruption lens. Identify the top 3 strategic moves for the next 12 months with risk assessments."`,
        `"Create a decision matrix comparing [Option A] vs [Option B] for [context]. Weight 8 factors by importance, score each option, and recommend with clear reasoning and sensitivity analysis."`,
      );
    }
    if (hasInterest("research") || hasInterest("synthesis")) {
      interestPrompts.push(
        `"Research [topic] comprehensively. Provide: executive summary (3 sentences), key findings (5-7 points with sources), competing perspectives, knowledge gaps, and recommended next steps for deeper investigation."`,
      );
    }
    if (hasInterest("no-code") || hasInterest("low-code")) {
      interestPrompts.push(
        `"I want to automate [specific workflow] using no-code tools. Design the complete system using Zapier/Make/Bubble: list each step, the tool/integration used, trigger logic, and estimated setup time. Assume zero coding ability."`,
      );
    }
    // Fill to 10+ with remaining general prompts
    const general = [
      `"I'm preparing for a meeting about [topic]. Give me 10 high-impact questions that would demonstrate strategic thinking and domain expertise."`,
      `"Act as a career strategist. Based on current AI trends in [industry], what 3 skills should I develop in the next 6 months to become irreplaceable? Include specific learning resources."`,
      `"Write a compelling executive summary of [project/report] that a C-suite executive would read in 60 seconds and immediately approve."`,
      `"Create a weekly automation workflow for my top 5 repetitive tasks as a ${jobTitle || "professional"}. Include tool suggestions, implementation steps, and estimated time savings per week."`,
    ];
    const all = [...base, ...interestPrompts];
    for (const g of general) {
      if (all.length >= 12) break;
      if (!all.includes(g)) all.push(g);
    }
    return all.slice(0, 12);
  };

  const hiringTrends = [
    { role: "Prompt Engineer", salary: "$95K – $160K", demand: "Very High" },
    { role: "AI Agent Developer", salary: "$130K – $200K+", demand: "Explosive" },
    { role: "AI Product Manager", salary: "$140K – $190K", demand: "High" },
    { role: "ML Operations Engineer", salary: "$120K – $180K", demand: "High" },
    { role: "AI Solutions Architect", salary: "$150K – $220K", demand: "Very High" },
    { role: "AI-Augmented " + (jobTitle || "Specialist"), salary: "+25–40% premium", demand: "Growing" },
  ];

  const toolRecs = getToolRecs();
  const softwareRecs = toolRecs.filter((r) => !r.hardware && !r.divider);
  const hardwareRecs = toolRecs.filter((r) => r.hardware);
  const prompts = getPrompts();

  return (
    <div style={{ animation: "fadeInUp 0.5s ease" }}>
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          padding: "32px 24px",
          background: "linear-gradient(135deg, #0d1a0d 0%, #121212 100%)",
          borderRadius: "16px",
          border: "1px solid #2a5a2a",
          marginBottom: "20px",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>✅</div>
        <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#5aff5a", margin: "0 0 8px" }}>
          Payment Successful — Plan Unlocked
        </h3>
        <p style={{ color: "#aaa", fontSize: "14px", margin: 0 }}>
          Here's your personalized AI career plan based on your score of{" "}
          <strong style={{ color: "#F0F0F0" }}>{rating}/10</strong>
          {budget && <> · Monthly budget: <strong style={{ color: "#F0F0F0" }}>{budget}</strong></>}
        </p>
      </div>

      {/* Timeline to Proficiency */}
      <div style={{ ...cardStyle, marginBottom: "16px" }}>
        <h4 style={cardHeader}>📅 Your Timeline to Proficiency</h4>
        <div
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "#D2042D",
            margin: "8px 0 12px",
          }}
        >
          {getTimeline()}
        </div>
        <p style={{ color: "#aaa", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
          Based on your current skill level ({rating}/10), AI tool usage ({llms.filter(l => l !== "None").length} LLMs),
          and {interests.length} stated interest{interests.length !== 1 ? "s" : ""}.
          This timeline assumes 5–10 hours/week of focused practice with the recommended tools below.
        </p>
      </div>

      {/* Tool Recommendations — Software */}
      <div style={{ ...cardStyle, marginBottom: "16px" }}>
        <h4 style={cardHeader}>🛠 Recommended Tools & Costs</h4>
        <p style={{ color: "#666", fontSize: "12px", margin: "4px 0 8px" }}>
          Tailored to your interests, current LLM usage, and {budget || "stated"} monthly budget
        </p>
        <div style={{ marginTop: "8px" }}>
          {softwareRecs.map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "12px 0",
                borderBottom: i < softwareRecs.length - 1 ? "1px solid #2a2a2a" : "none",
                flexWrap: "wrap",
                gap: "4px",
                borderLeft: t.primary ? "3px solid #D2042D" : "3px solid transparent",
                paddingLeft: "12px",
              }}
            >
              <div style={{ flex: 1, minWidth: "180px" }}>
                <div style={{ fontWeight: 700, color: "#F0F0F0", fontSize: "15px" }}>
                  {t.primary && <span style={{ color: "#D2042D", fontSize: "11px", fontWeight: 800, marginRight: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>★ PRIMARY</span>}
                  {t.tool}
                </div>
                <div style={{ color: "#888", fontSize: "13px", marginTop: "2px", lineHeight: 1.5 }}>{t.note}</div>
              </div>
              <div
                style={{
                  color: t.cost === "Free" ? "#5aff5a" : "#ffa500",
                  fontWeight: 700,
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                {t.cost}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hardware Recommendations (if applicable) */}
      {hardwareRecs.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: "16px", borderColor: "#333" }}>
          <h4 style={cardHeader}>💻 Hardware Recommendations</h4>
          <p style={{ color: "#666", fontSize: "12px", margin: "4px 0 8px" }}>
            For your interest in {[hasInterest("local") && "local AI", hasInterest("ML") && "ML/training", hasInterest("agent") && "agent deployment", hasInterest("coding") && "development"].filter(Boolean).join(", ") || "advanced AI work"}
          </p>
          <div style={{ marginTop: "8px" }}>
            {hardwareRecs.map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "12px 0",
                  borderBottom: i < hardwareRecs.length - 1 ? "1px solid #2a2a2a" : "none",
                  flexWrap: "wrap",
                  gap: "4px",
                }}
              >
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <div style={{ fontWeight: 700, color: "#F0F0F0", fontSize: "15px" }}>{t.tool}</div>
                  <div style={{ color: "#888", fontSize: "13px", marginTop: "2px", lineHeight: 1.5 }}>{t.note}</div>
                </div>
                <div style={{ color: "#ff6b6b", fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap" }}>
                  {t.cost}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Library */}
      <div style={{ ...cardStyle, marginBottom: "16px" }}>
        <h4 style={cardHeader}>📝 Your Custom Prompt Library ({prompts.length} Prompts)</h4>
        <p style={{ color: "#888", fontSize: "13px", margin: "4px 0 16px" }}>
          Tailored for <strong style={{ color: "#ccc" }}>{jobTitle || "your role"}</strong>
          {interests.length > 0 && <> + your interests in <strong style={{ color: "#ccc" }}>{interests.slice(0, 3).join(", ")}{interests.length > 3 ? ` +${interests.length - 3} more` : ""}</strong></>}
          {" "}— copy & paste into any LLM
        </p>
        {prompts.map((p, i) => (
          <div
            key={i}
            style={{
              background: "#0a0a0a",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "8px",
              fontSize: "13px",
              color: "#ccc",
              lineHeight: 1.6,
              fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
            }}
          >
            <span style={{ color: "#555", marginRight: "8px" }}>#{i + 1}</span>
            {p}
          </div>
        ))}
      </div>

      {/* Hiring Trends */}
      <div style={{ ...cardStyle }}>
        <h4 style={cardHeader}>💼 AI-Fluent Hiring Trends (2025–2026)</h4>
        <div style={{ marginTop: "12px" }}>
          {hiringTrends.map((h, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: i < hiringTrends.length - 1 ? "1px solid #2a2a2a" : "none",
                flexWrap: "wrap",
                gap: "4px",
              }}
            >
              <div style={{ fontWeight: 700, color: "#F0F0F0", fontSize: "15px", minWidth: "160px" }}>
                {h.role}
              </div>
              <div style={{ color: "#5aff5a", fontSize: "14px", fontWeight: 600, minWidth: "120px" }}>
                {h.salary}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: h.demand === "Explosive" ? "#D2042D" : h.demand === "Very High" ? "#ff6b6b" : "#ffa500",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {h.demand}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===========================================
   SHARED STYLES
   =========================================== */

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  background: "#1e1e1e",
  border: "1px solid #333",
  borderRadius: "8px",
  color: "#F0F0F0",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
  WebkitAppearance: "none",
};

const btnSmall = {
  padding: "10px 16px",
  background: "#2a2a2a",
  border: "1px solid #444",
  borderRadius: "8px",
  color: "#F0F0F0",
  fontSize: "13px",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const qBlock = { marginBottom: "28px" };
const qLabel = { color: "#F0F0F0", fontSize: "15px", fontWeight: 700, margin: "0 0 10px" };
const qHint = { color: "#666", fontSize: "12px", fontWeight: 400 };
const featureTag = {
  padding: "6px 14px",
  background: "#222",
  borderRadius: "20px",
  border: "1px solid #333",
};
const cardStyle = {
  background: "#1a1a1a",
  borderRadius: "12px",
  padding: "24px",
  border: "1px solid #2a2a2a",
};
const cardHeader = {
  color: "#D2042D",
  fontSize: "18px",
  fontWeight: 700,
  margin: 0,
};

/* ===========================================
   MAIN APP
   =========================================== */

export default function App() {
  // ── Form ──
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [workDesc, setWorkDesc] = useState("");
  const [location, setLocation] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const resultsRef = useRef(null);

  // ── Quiz ──
  const [quizAnswers, setQuizAnswers] = useState({
    experience: "",
    llms: [],
    interaction: [],
    promptSkill: 0,
    automated: "",
    automatedExample: "",
    holdingBack: "",
    holdingBackOther: "",
    useCases: [],
    interests: [],
    interestsOther: "",
    techBg: "",
    techBgDetails: "",
    worry: "",
    budget: "",
  });
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallUnlocked, setPaywallUnlocked] = useState(false);
  const [paywallProcessing, setPaywallProcessing] = useState(false);

  // ── Email ──
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  /* ── Handlers ── */

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobTitle || !industry) return;
    setLoading(true);
    setShowResults(false);
    setShowRating(false);
    setShowPaywall(false);
    setPaywallUnlocked(false);
    setTimeout(() => {
      const key = Object.keys(MOCK_DATA).find(
        (k) =>
          jobTitle.toLowerCase().includes(k.toLowerCase()) ||
          k.toLowerCase().includes(jobTitle.toLowerCase())
      );
      setResultData(key ? MOCK_DATA[key] : DEFAULT_MOCK);
      setShowResults(true);
      setLoading(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, 1800);
  };

  const computeRating = () => {
    let score = 0;
    const exp = quizAnswers.experience;
    if (exp.includes("15+")) score += 1.5;
    else if (exp.includes("5-15")) score += 1.2;
    else if (exp.includes("0-5")) score += 1;
    else if (exp.includes("college")) score += 0.5;
    else score += 0.3;
    score += Math.min(quizAnswers.llms.filter((l) => l !== "None").length * 0.5, 2);
    score += Math.min(
      quizAnswers.interaction.filter((l) => l !== "None yet").length * 0.5,
      2
    );
    score += (quizAnswers.promptSkill || 0) * 0.4;
    if (quizAnswers.automated === "Yes") score += 1;
    score += Math.min(quizAnswers.interests.length * 0.2, 1.5);
    // Budget willingness as a proxy for commitment
    const b = quizAnswers.budget || "";
    if (b.includes("100+")) score += 1.2;
    else if (b.includes("100")) score += 1;
    else if (b.includes("50")) score += 0.7;
    else if (b.includes("20")) score += 0.4;
    return Math.max(1, Math.min(10, Math.round(score)));
  };

  const handleQuizSubmit = () => {
    const r = computeRating();
    setRating(r);
    setShowRating(true);
    setTimeout(() => setShowPaywall(true), 600);
  };

  const handlePaywallClick = () => {
    setPaywallProcessing(true);
    // In production, replace this with actual Stripe Checkout redirect:
    // window.location.href = 'https://checkout.stripe.com/pay/cs_test_...'
    // or use Stripe.js: stripe.redirectToCheckout({ sessionId: '...' })
    //
    // Stripe test mode simulation:
    // 1. Show "Redirecting to Stripe..." state
    // 2. Simulate successful payment callback
    setTimeout(() => {
      // Simulating Stripe Checkout redirect + return
      // In production: Stripe redirects to your success_url after payment
      // success_url would set a query param like ?payment=success
      // Then your app reads that param and unlocks the plan
      setPaywallProcessing(false);
      setPaywallUnlocked(true);
    }, 2500);
  };

  const toggleMulti = (field, value) => {
    setQuizAnswers((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const chipStyle = (selected) => ({
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    cursor: "pointer",
    border: "1px solid",
    borderColor: selected ? "#D2042D" : "#444",
    background: selected ? "rgba(210,4,45,0.12)" : "#1e1e1e",
    color: selected ? "#ff6b6b" : "#ccc",
    transition: "all 0.2s",
    userSelect: "none",
    display: "inline-block",
  });

  /* ===========================================
     RENDER
     =========================================== */

  return (
    <div style={{ background: "#121212", minHeight: "100vh" }}>
      {/* ─── HERO SECTION ─── */}
      <section
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            background: "radial-gradient(circle at 50% 30%, #D2042D 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: "900px" }}>
          <h1
            style={{
              fontSize: "clamp(56px, 10vw, 120px)",
              fontWeight: 900,
              margin: "0 0 8px",
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            <span style={{ color: "#D2042D" }}>Nat</span>
            <span style={{ color: "#F0F0F0" }}>ural </span>
            <span style={{ color: "#D2042D" }}>Sel</span>
            <span style={{ color: "#F0F0F0" }}>ection</span>
          </h1>

          <h2
            style={{
              fontSize: "clamp(22px, 4vw, 48px)",
              fontWeight: 700,
              color: "#D2042D",
              margin: "12px 0 24px",
            }}
          >
            When AI Will Replace You
          </h2>

          <p
            style={{
              fontSize: "clamp(15px, 2vw, 24px)",
              color: "#F0F0F0",
              margin: "0 0 24px",
              lineHeight: 1.5,
              opacity: 0.9,
            }}
          >
            See the exact timeline, how it happens, which companies drive it, job impacts now vs 5
            years out — and how to get ahead and harness AI tools before it's too late.
          </p>

          <p
            style={{
              fontSize: "clamp(13px, 1.5vw, 18px)",
              color: "#F0F0F0",
              margin: "0 auto 32px",
              maxWidth: "800px",
              lineHeight: 1.7,
              opacity: 0.65,
            }}
          >
            AI is evolving faster than humans can adapt. The gap is closing. Natsel.ai gives you the
            brutal truth on your career's survival — and the tools to level up and thrive in the
            selection process.
          </p>

          <AnimatedClock />
        </div>
      </section>

      {/* ─── INPUT FORM ─── */}
      <section style={{ maxWidth: "640px", margin: "0 auto", padding: "20px 20px 60px" }}>
        <form onSubmit={handleSubmit}>
          <SelectDropdown
            label="Job Title"
            options={JOB_TITLES}
            value={jobTitle}
            onChange={setJobTitle}
            required
            allowCustom
            placeholder="Select your role..."
          />
          <SelectDropdown
            label="Industry"
            options={INDUSTRIES}
            value={industry}
            onChange={setIndustry}
            required
            allowCustom
            placeholder="Select your industry..."
          />

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#ccc",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Work Description <span style={{ opacity: 0.5 }}>(optional)</span>
            </label>
            <textarea
              value={workDesc}
              onChange={(e) => setWorkDesc(e.target.value)}
              placeholder="Describe your daily tasks in 1-2 sentences for more accurate results, e.g., 'Drive passengers in urban areas, handle cash tips, deal with navigation issues.'"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                color: "#ccc",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Location <span style={{ opacity: 0.5 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City/State/Country — optional for regional timelines"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "18px",
              background: loading ? "#8b021d" : "#D2042D",
              color: "#F0F0F0",
              border: "none",
              borderRadius: "10px",
              fontSize: "clamp(16px, 3vw, 20px)",
              fontWeight: 800,
              cursor: loading ? "wait" : "pointer",
              letterSpacing: "1px",
              textTransform: "uppercase",
              transition: "all 0.3s",
              boxShadow: loading ? "none" : "0 0 30px rgba(210,4,45,0.3)",
              animation: !loading ? "pulse 2s infinite" : "none",
            }}
          >
            {loading ? "⏳ Analyzing..." : "🕐 Run the Clock"}
          </button>
        </form>
      </section>

      {/* ─── RESULTS OUTPUT ─── */}
      {showResults && resultData && (
        <section
          ref={resultsRef}
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "0 20px 60px",
            animation: "fadeInUp 0.6s ease",
          }}
        >
          {/* Countdown box */}
          <div
            style={{
              background: "linear-gradient(135deg, #1a0a0a 0%, #121212 100%)",
              border: "1px solid rgba(210,4,45,0.2)",
              borderRadius: "16px",
              padding: "clamp(20px, 4vw, 32px) clamp(16px, 3vw, 28px)",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "#D2042D",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              ⚠ Countdown Projection
            </div>
            <h3
              style={{
                fontSize: "clamp(18px, 3vw, 28px)",
                fontWeight: 800,
                color: "#F0F0F0",
                margin: "0 0 8px",
                lineHeight: 1.3,
              }}
            >
              You will be completely replaced by{" "}
              <span style={{ color: "#D2042D" }}>{resultData.replacement}</span>
            </h3>
            <p style={{ color: "#aaa", fontSize: "14px", margin: 0 }}>{resultData.confidence}</p>
          </div>

          {/* Timeline */}
          <TimelineBar milestones={resultData.timelineMilestones} />

          {/* Accordion sections */}
          <div
            style={{
              background: "#1a1a1a",
              borderRadius: "12px",
              padding: "8px clamp(14px, 3vw, 20px)",
              marginTop: "16px",
            }}
          >
            <Accordion title="📅 When — Exact Projection" defaultOpen>
              <p style={{ margin: 0 }}>{resultData.when}</p>
            </Accordion>
            <Accordion title="⚙ How — Step-by-Step Breakdown">
              <ol style={{ margin: 0, paddingLeft: "20px" }}>
                {resultData.how.map((s, i) => (
                  <li key={i} style={{ marginBottom: "10px" }}>
                    {s}
                  </li>
                ))}
              </ol>
            </Accordion>
            <Accordion title="🏢 Which Companies">
              <p style={{ margin: 0 }}>{resultData.companies}</p>
            </Accordion>
            <Accordion title="📊 Jobs Now vs 5 Years">
              <p style={{ margin: 0 }}>{resultData.jobsNow}</p>
            </Accordion>
            <Accordion title="💀 Brutal Reality">
              <p style={{ margin: 0 }}>{resultData.brutal}</p>
            </Accordion>
          </div>

          {/* Empowering hook */}
          <div
            style={{
              background: "#0d1a0d",
              border: "1px solid #2a5a2a",
              borderRadius: "12px",
              padding: "24px",
              marginTop: "24px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "18px", fontWeight: 700, color: "#5aff5a", margin: "0 0 8px" }}>
              This is your window. Ready to get ahead?
            </p>
            <p style={{ color: "#aaa", fontSize: "14px", margin: 0 }}>
              Take the 10-question assessment below to see where you stand.
            </p>
          </div>
        </section>
      )}

      {/* ─── QUIZ ─── (only after results) */}
      {showResults && (
        <section
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "20px 20px 60px",
            animation: "fadeIn 0.4s ease",
          }}
        >
          <h2
            style={{
              color: "#D2042D",
              fontSize: "clamp(22px, 3.5vw, 28px)",
              fontWeight: 800,
              textAlign: "center",
              margin: "0 0 32px",
            }}
          >
            How to Get Ahead — Assess Your Readiness
          </h2>

          {/* Q1: Work Experience */}
          <div style={qBlock}>
            <p style={qLabel}>1. Work Experience</p>
            <select
              value={quizAnswers.experience}
              onChange={(e) => setQuizAnswers((p) => ({ ...p, experience: e.target.value }))}
              style={inputStyle}
            >
              <option value="">Select...</option>
              {[
                "Student pre-college",
                "Student in college",
                "Workforce 0-5 years",
                "Workforce 5-15 years",
                "Workforce 15+ years",
                "Retired",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* Q2: LLMs */}
          <div style={qBlock}>
            <p style={qLabel}>
              2. Do you use LLMs? <span style={qHint}>(select all that apply)</span>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {["ChatGPT", "Claude", "Grok", "Gemini", "Perplexity", "Llama/local models", "None"].map(
                (o) => (
                  <span
                    key={o}
                    onClick={() => toggleMulti("llms", o)}
                    style={chipStyle(quizAnswers.llms.includes(o))}
                  >
                    {o}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Q3: AI Interaction Level */}
          <div style={qBlock}>
            <p style={qLabel}>
              3. Level of AI Interaction <span style={qHint}>(select all that apply)</span>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                "Basic questions/summaries",
                "Deep research/analysis",
                "Automate routines",
                "Build tools/apps",
                "Advanced prompting for strategy",
                "None yet",
              ].map((o) => (
                <span
                  key={o}
                  onClick={() => toggleMulti("interaction", o)}
                  style={chipStyle(quizAnswers.interaction.includes(o))}
                >
                  {o}
                </span>
              ))}
            </div>
          </div>

          {/* Q4: Prompt Skill */}
          <div style={qBlock}>
            <p style={qLabel}>4. Rate your AI/prompt engineering ability (1–5)</p>
            <div style={{ display: "flex", gap: "8px" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuizAnswers((p) => ({ ...p, promptSkill: n }))}
                  style={{
                    ...chipStyle(quizAnswers.promptSkill === n),
                    width: "48px",
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#666",
                marginTop: "4px",
                padding: "0 4px",
                maxWidth: "280px",
              }}
            >
              <span>Never used</span>
              <span>Build automations daily</span>
            </div>
          </div>

          {/* Q5: Automated */}
          <div style={qBlock}>
            <p style={qLabel}>5. Have you automated any part of your job with AI?</p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              {["Yes", "No"].map((o) => (
                <span
                  key={o}
                  onClick={() => setQuizAnswers((p) => ({ ...p, automated: o }))}
                  style={chipStyle(quizAnswers.automated === o)}
                >
                  {o}
                </span>
              ))}
            </div>
            {quizAnswers.automated === "Yes" && (
              <input
                type="text"
                placeholder="Brief example (optional)..."
                value={quizAnswers.automatedExample}
                onChange={(e) =>
                  setQuizAnswers((p) => ({ ...p, automatedExample: e.target.value }))
                }
                style={{ ...inputStyle, marginTop: "8px" }}
              />
            )}
          </div>

          {/* Q6: Holding Back */}
          <div style={qBlock}>
            <p style={qLabel}>6. What's holding you back from harnessing AI?</p>
            <select
              value={quizAnswers.holdingBack}
              onChange={(e) => setQuizAnswers((p) => ({ ...p, holdingBack: e.target.value, holdingBackOther: e.target.value === "Other" ? p.holdingBackOther : "" }))}
              style={inputStyle}
            >
              <option value="">Select...</option>
              {[
                "Cost of tools",
                "Don't know where to start",
                "Fear of replacement",
                "Lack of time",
                "Not interested",
                "Skill gaps",
                "Other",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            {quizAnswers.holdingBack === "Other" && (
              <input
                type="text"
                placeholder="Please specify..."
                value={quizAnswers.holdingBackOther}
                onChange={(e) => setQuizAnswers((p) => ({ ...p, holdingBackOther: e.target.value }))}
                style={{ ...inputStyle, marginTop: "8px" }}
              />
            )}
          </div>

          {/* Q7: Use Cases — multi-select */}
          <div style={qBlock}>
            <p style={qLabel}>
              7. Preferred AI use case in your role? <span style={qHint}>(select all that apply)</span>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {["Automation", "Content creation", "Data analysis", "Research", "Strategy", "Other"].map(
                (o) => (
                  <span
                    key={o}
                    onClick={() => toggleMulti("useCases", o)}
                    style={chipStyle(quizAnswers.useCases.includes(o))}
                  >
                    {o}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Q8: Interests — multi-select with Other */}
          <div style={qBlock}>
            <p style={qLabel}>
              8. What are you most eager to learn? <span style={qHint}>(select all that apply)</span>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                "Agent deployment & automation",
                "AI ethics/governance",
                "App/web coding & dev",
                "Business strategy with AI",
                "Content creation",
                "Data analysis & viz",
                "Hardware & local AI setup",
                "ML basics/models",
                "No-code/low-code tools",
                "Prompt engineering",
                "Research & synthesis",
                "Other",
              ].map((o) => (
                <span
                  key={o}
                  onClick={() => toggleMulti("interests", o)}
                  style={chipStyle(quizAnswers.interests.includes(o))}
                >
                  {o}
                </span>
              ))}
            </div>
            {quizAnswers.interests.includes("Other") && (
              <input
                type="text"
                placeholder="Please specify what you'd like to learn..."
                value={quizAnswers.interestsOther}
                onChange={(e) => setQuizAnswers((p) => ({ ...p, interestsOther: e.target.value }))}
                style={{ ...inputStyle, marginTop: "10px" }}
              />
            )}
          </div>

          {/* Q9: Worry — sorted alphabetically */}
          <div style={qBlock}>
            <p style={qLabel}>9. Biggest AI worry for your career?</p>
            <select
              value={quizAnswers.worry}
              onChange={(e) => setQuizAnswers((p) => ({ ...p, worry: e.target.value }))}
              style={inputStyle}
            >
              <option value="">Select...</option>
              {["Bias", "Ethical issues", "How to start", "Job loss speed", "Other", "Skill gap"].map(
                (o) => (
                  <option key={o}>{o}</option>
                )
              )}
            </select>
          </div>

          {/* Q10: Budget */}
          <div style={qBlock}>
            <p style={qLabel}>
              10. How much are you willing to spend per month on software (non-hardware) to level up your AI skill set?{" "}
              <span style={qHint}>(this can change over time as you progress)</span>
            </p>
            <select
              value={quizAnswers.budget}
              onChange={(e) => setQuizAnswers((p) => ({ ...p, budget: e.target.value }))}
              style={inputStyle}
            >
              <option value="">Select...</option>
              {["$0 (free)", "Up to $20", "Up to $50", "Up to $100", "$100+"].map(
                (o) => (
                  <option key={o}>{o}</option>
                )

              )}
            </select>
          </div>

          {/* Submit Quiz */}
          {!showRating && (
            <button
              type="button"
              onClick={handleQuizSubmit}
              style={{
                width: "100%",
                padding: "18px",
                background: "#D2042D",
                color: "#F0F0F0",
                border: "none",
                borderRadius: "10px",
                fontSize: "18px",
                fontWeight: 800,
                cursor: "pointer",
                letterSpacing: "1px",
                marginTop: "12px",
                boxShadow: "0 0 25px rgba(210,4,45,0.25)",
                transition: "all 0.2s",
              }}
            >
              Get Your Rating
            </button>
          )}

          {/* ── Rating Display ── */}
          {showRating && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                background: "linear-gradient(135deg, #1a0a0a, #121212)",
                borderRadius: "16px",
                border: "1px solid rgba(210,4,45,0.25)",
                marginTop: "24px",
                animation: "fadeInUp 0.5s ease",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#D2042D",
                  letterSpacing: "2px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Your AI Readiness Score
              </div>
              <div
                style={{
                  fontSize: "clamp(64px, 12vw, 96px)",
                  fontWeight: 900,
                  color: rating >= 7 ? "#5aff5a" : rating >= 4 ? "#ffa500" : "#D2042D",
                  lineHeight: 1.1,
                  margin: "8px 0",
                }}
              >
                {rating}
                <span style={{ fontSize: "clamp(24px, 4vw, 36px)", color: "#666" }}>/10</span>
              </div>
              <p
                style={{
                  color: "#aaa",
                  fontSize: "15px",
                  maxWidth: "500px",
                  margin: "12px auto 0",
                  lineHeight: 1.6,
                }}
              >
                {rating <= 3 &&
                  "You're at high risk. AI is advancing fast and you need to start building skills immediately. The good news: with the right plan, you can catch up in 6–12 months."}
                {rating >= 4 &&
                  rating <= 6 &&
                  "You're aware but not yet leveraging AI's full potential. With focused effort over 3–6 months, you can move from user to power user and future-proof your career."}
                {rating >= 7 &&
                  rating <= 8 &&
                  "You're ahead of most. Fine-tune your skills over the next 1–3 months to reach mastery level and become indispensable in your organization."}
                {rating >= 9 &&
                  "You're in the top tier. Consider leading AI initiatives, mentoring others, or transitioning into AI-specialized roles for maximum career leverage."}
              </p>
            </div>
          )}

          {/* ── Paywall / Unlock ── */}
          {showPaywall && !paywallUnlocked && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 24px",
                background: "#1a1a1a",
                borderRadius: "16px",
                border: "1px solid #333",
                marginTop: "24px",
                animation: "fadeInUp 0.5s ease",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#D2042D",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                Unlock Your Full Plan
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: 800, margin: "12px 0 8px" }}>
                Personalized AI Career Plan
              </h3>
              <p
                style={{
                  color: "#aaa",
                  fontSize: "14px",
                  margin: "0 auto 20px",
                  maxWidth: "450px",
                }}
              >
                Get your custom roadmap: timeline to proficiency, tool recommendations, prompt
                library, and hiring trends — all tailored to your score and interests.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  justifyContent: "center",
                  marginBottom: "24px",
                  fontSize: "13px",
                  color: "#ccc",
                }}
              >
                <span style={featureTag}>📅 Proficiency Timeline</span>
                <span style={featureTag}>🛠 Tool Recommendations</span>
                <span style={featureTag}>📝 10+ Custom Prompts</span>
                <span style={featureTag}>💼 Hiring Trends & Salaries</span>
              </div>
              <button
                type="button"
                onClick={handlePaywallClick}
                disabled={paywallProcessing}
                style={{
                  padding: "16px 48px",
                  background: paywallProcessing ? "#8b021d" : "#D2042D",
                  color: "#F0F0F0",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "18px",
                  fontWeight: 800,
                  cursor: paywallProcessing ? "wait" : "pointer",
                  boxShadow: "0 0 25px rgba(210,4,45,0.3)",
                  transition: "all 0.2s",
                }}
              >
                {paywallProcessing ? "Redirecting to Stripe..." : "Unlock for $5 →"}
              </button>
              <p style={{ color: "#555", fontSize: "12px", marginTop: "12px" }}>
                One-time payment · Stripe Checkout (test mode) · Instant delivery
              </p>
            </div>
          )}

          {/* ── Unlocked Plan ── */}
          {paywallUnlocked && (
            <div style={{ marginTop: "24px" }}>
              <PaywallSuccess rating={rating} quizAnswers={quizAnswers} jobTitle={jobTitle} />
            </div>
          )}
        </section>
      )}

      {/* ─── SUBSCRIBE / WAITLIST ─── */}
      <section
        style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 20px 60px", textAlign: "center" }}
      >
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: "16px",
            padding: "clamp(24px, 4vw, 40px) clamp(16px, 3vw, 28px)",
            border: "1px solid #2a2a2a",
          }}
        >
          <h3 style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 800, margin: "0 0 8px" }}>
            Stay Ahead of the Curve
          </h3>
          <p style={{ color: "#aaa", fontSize: "15px", margin: "0 0 24px" }}>
            Join for updates on AI career tools, new projections, and exclusive content.
          </p>

          {!emailSubmitted ? (
            <div
              style={{
                display: "flex",
                gap: "8px",
                maxWidth: "440px",
                margin: "0 auto 20px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ ...inputStyle, flex: "1 1 220px" }}
              />
              <button
                type="button"
                onClick={() => {
                  if (email.includes("@")) setEmailSubmitted(true);
                }}
                style={{
                  padding: "12px 24px",
                  background: "#D2042D",
                  color: "#F0F0F0",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontSize: "14px",
                  flex: "0 0 auto",
                }}
              >
                Join for Updates
              </button>
            </div>
          ) : (
            <div
              style={{
                color: "#5aff5a",
                fontSize: "16px",
                fontWeight: 700,
                margin: "0 0 20px",
              }}
            >
              ✓ You're in. We'll be in touch.
            </div>
          )}

          <div style={{ color: "#777", fontSize: "13px", lineHeight: 1.8 }}>
            <strong style={{ color: "#aaa" }}>What you get:</strong> Honest projections + actionable
            steps. Built for real people facing AI change.
          </div>
        </div>
      </section>

      {/* ─── ENTERPRISE TEASER ─── */}
      <section style={{ maxWidth: "700px", margin: "0 auto", padding: "0 20px 40px", textAlign: "center" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #121212 100%)",
            borderRadius: "16px",
            padding: "32px 24px",
            border: "1px solid #2a2a4a",
          }}
        >
          <div style={{ fontSize: "13px", color: "#7b7bf7", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
            Enterprise
          </div>
          <h3 style={{ fontSize: "clamp(18px, 3vw, 22px)", fontWeight: 800, margin: "0 0 8px", color: "#F0F0F0" }}>
            For Teams & Companies
          </h3>
          <p style={{ color: "#aaa", fontSize: "14px", margin: "0 0 20px", maxWidth: "450px", marginLeft: "auto", marginRight: "auto" }}>
            Bulk assessments, team dashboards, and custom AI readiness reports for your organization.
          </p>
          <a
            href="mailto:enterprise@natsel.ai?subject=Enterprise%20Inquiry%20-%20Natsel.ai&body=Hi%2C%20I'm%20interested%20in%20Natsel.ai%20for%20my%20team%2Fcompany.%20Please%20share%20details%20on%20bulk%20pricing%20and%20enterprise%20dashboard%20access."
            style={{
              display: "inline-block",
              padding: "14px 36px",
              background: "transparent",
              color: "#7b7bf7",
              border: "2px solid #7b7bf7",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            Contact for Bulk Pricing / Enterprise Dashboard Waitlist →
          </a>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: "1px solid #1e1e1e", padding: "32px 20px", textAlign: "center" }}>
        <p
          style={{
            color: "#555",
            fontSize: "13px",
            maxWidth: "700px",
            margin: "0 auto 12px",
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: "#777" }}>Data sources:</strong> World Economic Forum (WEF) Future
          of Jobs Report 2025, Goldman Sachs AI & Labor Economics Report, McKinsey Global Institute,
          U.S. Bureau of Labor Statistics (BLS).
        </p>
        <p style={{ color: "#444", fontSize: "12px", maxWidth: "700px", margin: "0 auto" }}>
          <strong>Disclaimer:</strong> Projections are estimates based on publicly available data and
          current AI trends. Actual timelines may vary based on regulatory, economic, and
          technological factors. This tool is for informational purposes only and does not constitute
          career or financial advice.
        </p>
        <p style={{ color: "#333", fontSize: "12px", marginTop: "20px" }}>
          © 2025 Natsel.ai — All rights reserved.
        </p>
      </footer>
    </div>
  );
}
