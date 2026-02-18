import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

/* ================================================
   PDF CONTENT DATA GENERATORS
   ================================================ */

function getDisplacementRisk(r) { return r <= 3 ? "HIGH" : r <= 6 ? "MEDIUM" : "LOW"; }
function getTimeline(r) { return r <= 3 ? "6-12 months" : r <= 6 ? "3-6 months" : r <= 8 ? "1-3 months" : "0-1 month"; }
function getBudgetLabel(b) { if (!b) return "$0/month"; return b.replace("Up to ","").replace("$0 (free)","$0/month").replace("$100+","$100+/month"); }

function getThreats(job) {
  if (job === "Software Engineer" || (job && job.includes("Engineer"))) return [
    ["AI Code Generation Is Accelerating Fast","Tools like GitHub Copilot, Cursor, and Claude Code already write production-quality boilerplate, tests, and documentation. The tasks you currently handle overlap heavily with what these tools automate today."],
    ["Junior/Mid Roles Are Shrinking","Companies are hiring fewer entry-to-mid engineers and expecting remaining staff to 10x output with AI. Demonstrate AI-augmented productivity within 12 months or your position becomes harder to justify."],
    ["The Skill Gap Compounds Quickly","Professionals who adopt AI tools now gain compounding advantages in speed, quality, and scope. Every month of delay widens the gap between you and AI-fluent peers."],
  ];
  return [
    ["AI Automation Is Accelerating in Your Field","AI tools are rapidly learning to handle routine tasks in your role. The overlap between your daily work and what AI can automate grows month by month."],
    ["Companies Are Consolidating Headcount","Organizations are using AI to do more with fewer people. Roles that don't demonstrate AI-augmented productivity face increasing pressure."],
    ["The Skill Gap Compounds Quickly","Professionals who adopt AI tools now gain compounding advantages. Every month of delay widens the gap between you and AI-fluent peers competing for the same opportunities."],
  ];
}

function getTaskBreakdown(job) {
  if (job === "Software Engineer" || (job && job.includes("Engineer"))) return [
    ["Boilerplate code","90%","LLMs produce scaffolding faster","Focus on architecture decisions"],
    ["Basic debugging","75%","AI pinpoints common bugs","Learn complex system-level debugging"],
    ["Unit test writing","85%","AI generates tests from signatures","Focus on integration/E2E strategy"],
    ["Code documentation","80%","AI auto-generates docs","Own doc strategy and API design"],
    ["Simple refactoring","70%","AI handles rename/extract/lint","Lead large-scale domain refactors"],
    ["System architecture","10%","Requires deep business context","Double down - highest leverage"],
    ["Creative problem-solving","15%","Needs lateral thinking","Practice first-principles thinking"],
    ["Stakeholder comms","5%","Trust-building is human","Build relationships"],
    ["Strategic planning","10%","Long-horizon needs judgment","Develop product/business sense"],
    ["Mentoring/review","15%","Teaching nuance is human","Become go-to mentor"],
  ];
  return [
    ["Data entry/processing","85%","AI handles structured data","Focus on interpretation"],
    ["Email/comms drafting","75%","AI generates professional comms","Own stakeholder relationships"],
    ["Report generation","80%","AI creates reports from data","Focus on insights/recommendations"],
    ["Scheduling/coordination","70%","AI agents manage logistics","Lead strategic planning"],
    ["Research/info gathering","75%","AI searches and synthesizes","Develop domain expertise"],
    ["Strategic decisions","10%","Requires business judgment","Double down - highest leverage"],
    ["Creative problem-solving","15%","Needs human lateral thinking","Practice cross-domain matching"],
    ["Client relationships","5%","Trust-building is human","Become the trusted advisor"],
    ["Team leadership","10%","Managing humans needs EQ","Develop emotional intelligence"],
    ["Innovation","15%","Pioneering needs vision","Own the innovation pipeline"],
  ];
}

function getToolStack(job, rating, budget) {
  const bn = budget?.includes("100+") ? 150 : budget?.includes("100") ? 100 : budget?.includes("50") ? 50 : budget?.includes("20") ? 20 : 0;
  const isEng = job === "Software Engineer" || (job && job.includes("Engineer"));
  const tools = [
    ["Claude (Anthropic)","Deep reasoning, code gen, analysis","claude.ai","Free / $20/mo"],
    ["ChatGPT (OpenAI)","General assistant, brainstorming, coding","chat.openai.com","Free / $20/mo"],
    ["Perplexity AI","AI-powered research with sources","perplexity.ai","Free / $20/mo"],
    ["NotebookLM","Upload docs, AI summaries and Q&A","notebooklm.google.com","Free"],
  ];
  if (isEng) {
    tools.splice(1,0,["GitHub Copilot","Real-time code suggestions in IDE","github.com/features/copilot","$10/mo"]);
    tools.splice(2,0,["Cursor IDE","AI-native editor, chat with codebase","cursor.com","Free / $20/mo"]);
    if (bn>=20) tools.push(["Replit Agent","Build/deploy apps from natural language","replit.com","Free / $25/mo"]);
    if (bn>=20) tools.push(["v0 by Vercel","Generate UI components from text","v0.dev","Free tier"]);
  } else {
    tools.splice(1,0,["Canva AI","AI-powered design and presentations","canva.com","Free / $13/mo"]);
    if (bn>=20) tools.push(["Zapier","No-code automation, 6000+ apps","zapier.com","Free / $20/mo"]);
  }
  return tools;
}

function getPrompts(job) {
  const r = job || "professional";
  return [
    {tag:"Daily",title:"Task Accelerator",p:`You are a senior ${r} with 15 years of experience. I need to complete this task:\n\n--> [DESCRIBE YOUR TASK HERE] <--\n\nGive me: (1) Fastest approach, (2) Common pitfalls, (3) Quality checklist. Be specific.`},
    {tag:"Daily",title:"Error/Problem Solver",p:`You are an expert debugger. I have this issue:\n\n--> [DESCRIBE PROBLEM OR PASTE ERROR] <--\n\nContext:\n--> [PASTE RELEVANT DETAILS] <--\n\nExplain cause, why it happens, and give the exact fix.`},
    {tag:"Daily",title:"Work Review Partner",p:`You are a senior ${r} doing quality review. Review for: errors, improvements, best practices, clarity. Give line-by-line feedback. Rate 1-10.\n\n--> [PASTE YOUR WORK HERE] <--`},
    {tag:"Daily",title:"Communication Drafter",p:`Draft a professional --> [EMAIL/SLACK/REPORT] <-- about:\n--> [TOPIC AND KEY POINTS] <--\nTone: --> [FORMAL/FRIENDLY/DIRECT] <--. Concise and action-oriented.`},
    {tag:"Upskill",title:"Concept Deep-Dive",p:`Teach me --> [CONCEPT] <-- in 3 levels:\n1. ELI5 (2 sentences)\n2. Intermediate (1 paragraph + analogy)\n3. Advanced (technical details, trade-offs, when to use)`},
    {tag:"Upskill",title:"Strategy Advisor",p:`You are a principal-level ${r}. I need strategy for:\n--> [DESCRIBE SITUATION] <--\n\nGive: (1) High-level approach, (2) Key decisions + trade-offs, (3) Top 3 risks + mitigations, (4) Recommended path + why.`},
    {tag:"Upskill",title:"AI Tool Mastery",p:`You are an AI productivity coach. I'm a ${r} at skill level --> [LEVEL] <--. Give me a concrete 30-min daily routine using --> [TOOL NAME] <-- to improve proficiency in 2 weeks. Specific exercises only.`},
    {tag:"Career",title:"Resume Bulletizer",p:`You are a hiring manager. Rewrite these experiences as quantified resume bullets (XYZ formula: Accomplished [X] measured by [Y] by doing [Z]). ATS-friendly.\n\n--> [PASTE RAW EXPERIENCE NOTES] <--`},
    {tag:"Career",title:"Interview Prep",p:`I'm preparing for a --> [ROLE TYPE] <-- interview. Give:\n1. 5 most likely technical questions\n2. 3 common behavioral questions + STAR frameworks\n3. 1-week study plan by impact`},
    {tag:"Prompts",title:"Prompt Optimizer",p:`I wrote this prompt but output isn't great:\n--> [PASTE YOUR WEAK PROMPT] <--\n\nRewrite using ROCA (Role, Objective, Context, Answer). Explain what was wrong and why yours is better.`},
  ];
}

function get90DayPlan(job) {
  const r = job || "your role";
  return [
    {phase:"Phase 1: Foundation (Weeks 1-4)",rows:[
      ["1","Set up AI tools: Claude, ChatGPT, Perplexity. Run first 10 AI-assisted tasks.","Claude, ChatGPT, Perplexity","4-5 hrs"],
      ["2","Use AI for every routine task. Track time saved. Learn ROCA prompting.","All tools, ROCA Framework","5-6 hrs"],
      ["3","AI deep-dive: 3 concepts you've avoided. Automate one recurring workflow.","Claude, Prompts #5 & #7","5-6 hrs"],
      ["4",`Strategy exercise: use AI as advisor for a real ${r} challenge. Critique suggestions.`,"Claude, Prompt #6","5-6 hrs"],
    ]},
    {phase:"Phase 2: Practice (Weeks 5-8)",rows:[
      ["5","Start side project built 80% with AI. Document workflow and time savings.","All tools","6-7 hrs"],
      ["6","Learn prompt chaining: output of one prompt feeds the next. Master ROCAS.","Claude, ROCAS Framework","5-6 hrs"],
      ["7","Optimize team workflow: identify 3 AI-automatable tasks. Present to lead.","Perplexity, Claude","5-6 hrs"],
      ["8","Complete side project. Deploy. Write case study of AI-augmented process.","All tools, Prompt #8","6-7 hrs"],
    ]},
    {phase:"Phase 3: Integration (Weeks 9-12)",rows:[
      ["9","Advanced prompting: ROCASTLE for complex analysis. AI for quality reviews.","ROCASTLE, Prompt #3","5-6 hrs"],
      ["10","Mentor a colleague on AI tools. Teaching solidifies knowledge + reputation.","All tools, Prompt #7","4-5 hrs"],
      ["11","Update resume with AI-augmented accomplishments. Prep for AI interviews.","Claude, Prompts #8 & #9","5-6 hrs"],
      ["12","Audit progress: re-measure skill level. Set 6-month goals. Target: 6-7/10.","Prompt #10, self-assessment","4-5 hrs"],
    ]},
  ];
}

const FRAMEWORKS = [
  {lvl:"Level 1: ROCA",desc:"Foundation. Four components for structured, high-quality outputs.",
   text:"[R] Role: You are --> [persona] <--.\n[O] Objective: Your goal is to --> [clear sentence] <--.\n[C] Context: Background: --> [facts] <--. Constraints: --> [limits] <--.\n[A] Answer: 1. Summary (2 sentences). 2. Main points (3-5 bullets). 3. Details per point. 4. Risks. 5. Next steps. Under 500 words."},
  {lvl:"Level 2: ROCAS",desc:"Adds step-by-step reasoning before answering.",
   text:"[R][O][C][A] same as ROCA.\n[S] Steps: 1. Read all constraints. 2. List 2-4 key questions. 3. Generate 3 scenarios. 4. Pick most likely. 5. Self-check weaknesses. 6. Write final answer."},
  {lvl:"Level 3: ROCAST",desc:"Adds tone: Feynman-style, no-fluff, direct.",
   text:"[R][O][C][A][S] same as ROCAS.\n[T] Tone: Clear, direct, active voice. Strip hedging ('may','could'), passive voice, fluff. Concrete numbers, brutal realism, zero optimism bias."},
  {lvl:"Level 4: ROCASTLE",desc:"Adds logic review and evidence citations.",
   text:"[R][O][C][A][S][T] same.\n[L] Logic: 1. Assume opposite conclusion. 2. Find second-order effects. 3. Check data gaps. 4. Adjust.\n[E] Evidence: Cite claims [1],[2] inline. List sources at end."},
  {lvl:"Level 5: DROCASTLE",desc:"Adds domain lock for recurring research areas.",
   text:"[D] Domain: This conversation focuses on --> [topic] <--. Stay practical and fact-based.\n[R][O][C][A][S][T][L][E] same as ROCASTLE."},
  {lvl:"Level 6: DROCASTLE-AI",desc:"Ultimate: adds audience tailoring + iteration.",
   text:"[D][R][O][C][A][S][T][L][E] same.\n[A] Audience: Tailor for --> [audience] <--.\n[I] Iteration: 'Refine by --> [your change] <--.'"},
];

const BONUS = [
  {title:"AI Anti-Hallucinator",desc:"Force fact-check on suspicious AI answers.",
   text:"[R]: Strict fact-check mode. No opinions, no speculation.\n[O]: Re-answer using only verified facts.\n[C]: Claim to check: --> [paste section] <--. Correct version: --> [your version] <--.\n[A]: 1. Verdict. 2. Correction (1-3 sentences). 3. What was wrong. Under 150 words."},
  {title:"7-Day AI Updates",desc:"Weekly AI landscape briefing.",
   text:"[R]: AI-obsessed CEO. Hype is poison.\n[O]: Top 3 AI/LLM trends from last 7 days.\n[C]: LLMs, open-source, hardware, regulatory, agents. Since --> [date] <--.\n[A]: Verdict, Top 3, Details, Risks, Next steps. 500 words.\n[S]: Rank by competitive impact. [T]: Feynman-style."},
  {title:"4-Week Stock Outlook",desc:"DROCASTLE-level stock analysis. Not financial advice.",
   text:"[D]: Short-term forecasting (4 weeks).\n[R]: Hedge fund analyst. Numbers-driven.\n[O]: 4-week outlook for --> [Ticker] <--.\n[C]: EDGAR, earnings, analysts, macro/Fed, geopolitics.\n[A]: Price range + confidence, movers, macro, earnings reaction, consensus, risks, recommendation.\n[S][T][L][E]: Full DROCASTLE."},
];

/* ================================================
   PDF GENERATOR
   ================================================ */

function generatePDF(data) {
  const { email, jobTitle, industry, rating, quizAnswers } = data;
  const role = jobTitle || "Professional";
  const ind = industry || "General";
  const budget = quizAnswers?.budget || "$0 (free)";
  const doc = new jsPDF("portrait","mm","a4");
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 18;
  const CW = W - M*2;
  const RED = [210,4,45];
  const WHT = [240,240,240];
  const GRY = [140,140,140];
  let y = 0;

  const footer = () => {
    doc.setFontSize(7); doc.setTextColor(...GRY);
    doc.text("NatSel.ai - Career Survival Kit", M, H-8);
    doc.text("Page "+doc.internal.getNumberOfPages(), W-M, H-8, {align:"right"});
  };
  const np = () => { doc.addPage(); y = M; darkBg(); footer(); };
  const darkBg = () => { doc.setFillColor(18,18,18); doc.rect(0,0,W,H,"F"); };
  const chk = (n) => { if (y+n > H-20) np(); };
  const hd = (t, s=16) => { chk(12); doc.setFontSize(s); doc.setTextColor(...RED); doc.setFont("helvetica","bold"); doc.text(t,M,y); y+=s*0.45+4; };
  const bd = (t) => { doc.setFontSize(10); doc.setTextColor(...WHT); doc.setFont("helvetica","normal"); doc.splitTextToSize(t,CW).forEach(l=>{chk(5);doc.text(l,M,y);y+=5;}); y+=2; };
  const mono = (t) => {
    doc.setFontSize(8); doc.setTextColor(190,190,190); doc.setFont("courier","normal");
    const ls = doc.splitTextToSize(t, CW-6);
    const bh = ls.length*3.8+6;
    chk(bh+4);
    doc.setFillColor(28,28,28); doc.roundedRect(M,y-2,CW,bh,2,2,"F");
    y+=2; ls.forEach(l=>{doc.text(l,M+3,y);y+=3.8;}); y+=4;
    doc.setFont("helvetica","normal");
  };

  // === COVER ===
  darkBg();
  doc.setFontSize(52); doc.setTextColor(...RED); doc.setFont("helvetica","bold");
  doc.text("NATSEL.AI", W/2, 65, {align:"center"});
  doc.setFontSize(22); doc.setTextColor(...WHT);
  doc.text("Career Survival Kit", W/2, 85, {align:"center"});
  doc.setFontSize(13); doc.setTextColor(...GRY); doc.setFont("helvetica","normal");
  doc.text("Your Personalized Guide to Thriving in the AI Era", W/2, 105, {align:"center"});
  doc.setFontSize(14); doc.setTextColor(...WHT); doc.setFont("helvetica","bold");
  doc.text((email||"User")+"'s Playbook", W/2, 135, {align:"center"});
  doc.setFontSize(11); doc.setTextColor(...GRY); doc.setFont("helvetica","normal");
  doc.text(role+"  |  "+ind+"  |  Skill Level "+rating+"/10", W/2, 150, {align:"center"});
  doc.setFontSize(8); doc.setTextColor(60,60,60);
  doc.text("(c) NatSel.ai - All Rights Reserved", W/2, H-15, {align:"center"});
  footer();

  // === EXECUTIVE SUMMARY ===
  np();
  hd("Executive Summary", 20); y+=2;
  doc.setFontSize(11); doc.setTextColor(...WHT); doc.setFont("helvetica","normal");
  ["AI Displacement Risk: "+getDisplacementRisk(rating),
   "Timeline to Proficiency: "+getTimeline(rating),
   "Current Skill Level: "+rating+"/10  |  Budget: "+getBudgetLabel(budget)
  ].forEach(s=>{doc.text(s,M,y);y+=7;});
  y+=6;

  hd("3 Biggest Threats to Your Role", 14);
  getThreats(jobTitle).forEach(([title,desc])=>{
    chk(22);
    doc.setFontSize(10); doc.setTextColor(...RED); doc.setFont("helvetica","bold");
    doc.text("> "+title, M, y); y+=6;
    doc.setFont("helvetica","normal"); doc.setTextColor(...WHT);
    doc.splitTextToSize(desc,CW-2).forEach(l=>{chk(5);doc.text(l,M+2,y);y+=5;});
    y+=4;
  });

  // === TASK BREAKDOWN ===
  np();
  hd("Detailed Role Breakdown", 18);
  bd("Which parts of your job are most vulnerable to AI - and which give you a lasting edge.");
  y+=2;
  doc.autoTable({
    startY:y, margin:{left:M,right:M},
    head:[["Task","% Auto","Why","Action to Mitigate"]],
    body: getTaskBreakdown(jobTitle),
    styles:{fontSize:7.5,textColor:[220,220,220],fillColor:[24,24,24],lineColor:[50,50,50],lineWidth:0.2},
    headStyles:{fillColor:RED,textColor:[255,255,255],fontStyle:"bold",fontSize:8},
    alternateRowStyles:{fillColor:[30,30,30]},
    columnStyles:{0:{cellWidth:30},1:{cellWidth:14,halign:"center"},2:{cellWidth:54},3:{cellWidth:54}},
    didDrawPage:()=>{darkBg();footer()},
    willDrawPage:(d)=>{darkBg()},
  });
  y = doc.lastAutoTable.finalY + 6;
  chk(14);
  doc.setFillColor(20,40,20); doc.roundedRect(M,y,CW,12,2,2,"F");
  doc.setFontSize(8); doc.setTextColor(90,255,90);
  doc.text("Key Takeaway: Migrate daily work toward strategy, architecture, and human-centric skills.",M+3,y+8);
  y+=18;

  // === TOOL STACK ===
  np();
  hd("Recommended AI Tools Stack", 18);
  bd("Curated for "+ind+" | Skill Level "+rating+"/10 | Budget "+getBudgetLabel(budget));
  y+=2;
  doc.autoTable({
    startY:y, margin:{left:M,right:M},
    head:[["Tool","Use Case","Link","Cost"]],
    body: getToolStack(jobTitle,rating,budget),
    styles:{fontSize:8,textColor:[220,220,220],fillColor:[24,24,24],lineColor:[50,50,50],lineWidth:0.2},
    headStyles:{fillColor:RED,textColor:[255,255,255],fontStyle:"bold"},
    alternateRowStyles:{fillColor:[30,30,30]},
    columnStyles:{0:{cellWidth:28,fontStyle:"bold"},1:{cellWidth:64},2:{cellWidth:38},3:{cellWidth:26}},
    didDrawPage:()=>{darkBg();footer()},
    willDrawPage:()=>{darkBg()},
  });
  y = doc.lastAutoTable.finalY + 6;
  chk(14);
  doc.setFillColor(20,40,20); doc.roundedRect(M,y,CW,12,2,2,"F");
  doc.setFontSize(8); doc.setTextColor(90,255,90);
  doc.text("Budget Fit: Start with free tiers. Add one paid tool with highest ROI for your daily work.",M+3,y+8);

  // === PROMPTS ===
  np();
  hd("10 Core Prompts for "+role, 18);
  bd("Tailored to "+ind+" | Skill Level "+rating+"/10");
  y+=2;
  getPrompts(jobTitle).forEach((p,i)=>{
    chk(35);
    doc.setFontSize(9); doc.setTextColor(...RED); doc.setFont("helvetica","bold");
    doc.text("["+p.tag+"] #"+(i+1)+" - "+p.title, M, y); y+=5;
    doc.setFont("helvetica","normal");
    mono(p.p); y+=1;
  });

  // === 90-DAY PLAN ===
  np();
  hd("90-Day Action Plan", 18);
  bd("Personalized for: "+role+" | "+ind+" | Skill Level "+rating+"/10");
  y+=4;
  get90DayPlan(jobTitle).forEach(phase=>{
    chk(20);
    doc.setFontSize(12); doc.setTextColor(...RED); doc.setFont("helvetica","bold");
    doc.text(phase.phase, M, y); y+=7;
    doc.autoTable({
      startY:y, margin:{left:M,right:M},
      head:[["Wk","Goals","Tools/Prompts","Time"]],
      body: phase.rows,
      styles:{fontSize:8,textColor:[220,220,220],fillColor:[24,24,24],lineColor:[50,50,50],lineWidth:0.2},
      headStyles:{fillColor:RED,textColor:[255,255,255],fontStyle:"bold"},
      alternateRowStyles:{fillColor:[30,30,30]},
      columnStyles:{0:{cellWidth:10,halign:"center"},1:{cellWidth:80},2:{cellWidth:42},3:{cellWidth:18,halign:"center"}},
      didDrawPage:()=>{darkBg();footer()},
      willDrawPage:()=>{darkBg()},
    });
    y = doc.lastAutoTable.finalY + 6;
  });
  chk(14);
  doc.setFillColor(20,40,20); doc.roundedRect(M,y,CW,12,2,2,"F");
  doc.setFontSize(8); doc.setTextColor(90,255,90);
  doc.text("Total: ~5-6 hours/week for 12 weeks. Less than 1 hour/day to transform your career.",M+3,y+8);

  // === PROMPT FRAMEWORKS ===
  np();
  hd("Master AI Prompting", 20);
  bd("The ROCA Framework & Beyond - from beginner to the most advanced level (DROCASTLE-AI).");
  bd("Each framework builds on the last. Start with your current skill level and progress upward.");
  y+=4;
  FRAMEWORKS.forEach(f=>{
    chk(35);
    doc.setFontSize(12); doc.setTextColor(...RED); doc.setFont("helvetica","bold");
    doc.text(f.lvl, M, y); y+=6;
    doc.setFontSize(9); doc.setTextColor(...GRY); doc.setFont("helvetica","italic");
    doc.text(f.desc, M, y); y+=6;
    doc.setFont("helvetica","normal");
    mono(f.text); y+=2;
  });

  // === BONUS PROMPTS ===
  np();
  hd("Bonus: Ready-to-Use Power Prompts", 18);
  bd("Three battle-tested prompts you can copy-paste immediately.");
  y+=4;
  BONUS.forEach(b=>{
    chk(35);
    doc.setFontSize(12); doc.setTextColor(...RED); doc.setFont("helvetica","bold");
    doc.text(b.title, M, y); y+=5;
    doc.setFontSize(9); doc.setTextColor(...GRY); doc.setFont("helvetica","italic");
    doc.text(b.desc, M, y); y+=6;
    doc.setFont("helvetica","normal");
    mono(b.text); y+=2;
  });

  // === BACK COVER ===
  np(); y = 70;
  doc.setFontSize(42); doc.setTextColor(...RED); doc.setFont("helvetica","bold");
  doc.text("NATSEL.AI", W/2, y, {align:"center"}); y+=25;
  doc.setFontSize(18); doc.setTextColor(...WHT);
  doc.text("Your Career Evolution", W/2, y, {align:"center"}); y+=10;
  doc.text("Starts Now", W/2, y, {align:"center"}); y+=20;
  doc.setFontSize(12); doc.setTextColor(...GRY); doc.setFont("helvetica","normal");
  doc.text("You now have the tools, the frameworks, and the plan.", W/2, y, {align:"center"}); y+=8;
  doc.text("The only variable left is execution.", W/2, y, {align:"center"}); y+=20;
  doc.setFontSize(10); doc.setTextColor(...WHT);
  doc.text("Questions? support@natsel.ai", W/2, y, {align:"center"}); y+=16;
  doc.setFontSize(8); doc.setTextColor(60,60,60);
  doc.text("(c) NatSel.ai - All Rights Reserved", W/2, y, {align:"center"});

  return doc;
}

/* ================================================
   SUCCESS PAGE COMPONENT
   ================================================ */

export default function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [userData, setUserData] = useState(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment !== "success") {
      setStatus("invalid");
      return;
    }
    const raw = localStorage.getItem("userPlanData");
    if (!raw) {
      setStatus("nodata");
      return;
    }
    try {
      setUserData(JSON.parse(raw));
      setStatus("ready");
    } catch {
      setStatus("nodata");
    }
  }, [searchParams]);

  const handleDownload = () => {
    if (!userData) return;
    try {
      const doc = generatePDF(userData);
      const name = (userData.jobTitle || "Career").replace(/[^a-zA-Z0-9]/g, "_");
      doc.save(`NatSel_AI_Career_Survival_Kit_${name}.pdf`);
      setDownloaded(true);
      // Clear after download
      setTimeout(() => localStorage.removeItem("userPlanData"), 3000);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Error generating PDF. Please try again.");
    }
  };

  const containerStyle = {
    background: "#121212",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    fontFamily: "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif",
  };

  const cardStyle = {
    maxWidth: "520px",
    width: "100%",
    textAlign: "center",
    padding: "48px 32px",
    background: "#1a1a1a",
    borderRadius: "20px",
    border: "1px solid #2a2a2a",
  };

  if (status === "loading") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>...</div>
          <p style={{ color: "#aaa", fontSize: "16px" }}>Loading your playbook...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid" || status === "nodata") {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ color: "#F0F0F0", fontSize: "22px", fontWeight: 800, margin: "0 0 12px" }}>
            {status === "invalid" ? "Access Required" : "No Data Found"}
          </h2>
          <p style={{ color: "#aaa", fontSize: "14px", margin: "0 0 24px", lineHeight: 1.6 }}>
            {status === "invalid"
              ? "Please complete the quiz on the main page first."
              : "Your quiz data wasn't found. Please complete the quiz and payment again."}
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "14px 36px",
              background: "#D2042D",
              color: "#F0F0F0",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Go to NatSel.ai
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0d2a0d, #1a3a1a)",
            border: "2px solid #2a5a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "28px",
          }}
        >
          ✅
        </div>
        <h2
          style={{
            color: "#5aff5a",
            fontSize: "24px",
            fontWeight: 800,
            margin: "0 0 8px",
          }}
        >
          Your Playbook Is Ready!
        </h2>
        <p style={{ color: "#aaa", fontSize: "14px", margin: "0 0 8px" }}>
          Your NatSel.ai Career Survival Kit is ready.
        </p>
        <p style={{ color: "#666", fontSize: "12px", margin: "0 0 28px" }}>
          {userData.jobTitle} · {userData.industry} · Score: {userData.rating}/10
        </p>

        {!downloaded ? (
          <button
            onClick={handleDownload}
            style={{
              padding: "18px 48px",
              background: "#D2042D",
              color: "#F0F0F0",
              border: "none",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 0 30px rgba(210,4,45,0.3)",
              transition: "all 0.2s",
              animation: "pulse 2s infinite",
            }}
          >
            Download Your Playbook (PDF) ↓
          </button>
        ) : (
          <div>
            <div
              style={{
                padding: "18px 48px",
                background: "#1a3a1a",
                color: "#5aff5a",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: 800,
                border: "1px solid #2a5a2a",
                marginBottom: "16px",
              }}
            >
              ✓ Downloaded Successfully
            </div>
            <button
              onClick={handleDownload}
              style={{
                padding: "10px 24px",
                background: "transparent",
                color: "#D2042D",
                border: "1px solid #D2042D",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Download Again
            </button>
          </div>
        )}

        <p style={{ color: "#444", fontSize: "11px", marginTop: "24px", lineHeight: 1.5 }}>
          Your personalized 20-page playbook includes: AI displacement analysis,
          task breakdown, recommended tools, 10+ prompts, 90-day action plan,
          and 6-level prompt engineering frameworks.
        </p>

        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #2a2a2a" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 24px",
              background: "transparent",
              color: "#888",
              border: "1px solid #333",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            ← Back to NatSel.ai
          </button>
        </div>

        <img src="/icon.svg" alt="NatSel.ai" style={{ width: "24px", height: "24px", margin: "20px auto 0", display: "block", opacity: 0.3 }} />
      </div>
    </div>
  );
}
