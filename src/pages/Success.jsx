import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

/* ── DATA GENERATORS ── */
function getDisplacementRisk(r){return r<=3?"HIGH":r<=6?"MEDIUM":"LOW";}
function getTimeline(r){return r<=3?"6-12 months":r<=6?"3-6 months":r<=8?"1-3 months":"0-1 month";}
function getBudgetLabel(b){if(!b)return"$0/month";return b.replace("Up to ","").replace("$0 (free)","$0/month").replace("$100+","$100+/month");}

function getThreats(j){
  const eng=j==="Software Engineer"||(j&&j.includes("Engineer"));
  if(eng)return[["AI Code Generation Is Accelerating Fast","Tools like GitHub Copilot, Cursor, and Claude Code already write production-quality boilerplate, tests, and documentation. The tasks you currently handle overlap heavily with what these tools automate today."],["Junior/Mid Roles Are Shrinking","Companies are hiring fewer entry-to-mid engineers and expecting remaining staff to 10x output with AI. Demonstrate AI-augmented productivity within 12 months or your position becomes harder to justify."],["The Skill Gap Compounds Quickly","Professionals who adopt AI tools now gain compounding advantages in speed, quality, and scope. Every month of delay widens the gap between you and AI-fluent peers."]];
  return[["AI Automation Is Accelerating in Your Field","AI tools are rapidly learning to handle routine tasks in your role. The overlap between your daily work and what AI can automate grows month by month."],["Companies Are Consolidating Headcount","Organizations are using AI to do more with fewer people. Roles that don't demonstrate AI-augmented productivity face increasing pressure."],["The Skill Gap Compounds Quickly","Professionals who adopt AI tools now gain compounding advantages. Every month of delay widens the gap between you and AI-fluent peers competing for the same opportunities."]];
}

function getTaskBreakdown(j){
  const eng=j==="Software Engineer"||(j&&j.includes("Engineer"));
  if(eng)return[["Boilerplate code","90%","LLMs produce scaffolding faster","Focus on architecture decisions"],["Basic debugging","75%","AI pattern-matches common bugs","Debug complex system-level issues"],["Unit test writing","85%","AI generates test suites","Focus on integration/E2E testing"],["Code documentation","80%","AI auto-generates docs","Own API design docs and ADRs"],["Simple refactoring","70%","AI handles rename/extract","Lead large-scale domain refactors"],["System architecture","10%","Requires deep business context","Double down - highest leverage"],["Creative problem-solving","15%","Novel solutions need lateral thinking","Practice first-principles thinking"],["Stakeholder communication","5%","Persuasion/trust are human","Build cross-functional relationships"],["Strategic planning","10%","Long-horizon judgment","Develop product sense"],["Mentoring / code review","15%","Teaching nuance is human","Become go-to mentor on team"]];
  return[["Data entry/processing","85%","AI handles structured data","Focus on interpretation"],["Email/comms drafting","75%","AI generates professional comms","Own stakeholder relationships"],["Report generation","80%","AI creates reports from data","Focus on insights/recommendations"],["Scheduling/coordination","70%","AI agents manage logistics","Lead strategic planning"],["Research/info gathering","75%","AI searches and synthesizes","Develop domain expertise"],["Strategic decisions","10%","Requires business judgment","Double down - highest leverage"],["Creative problem-solving","15%","Needs human lateral thinking","Practice cross-domain matching"],["Client relationships","5%","Trust-building is human","Become the trusted advisor"],["Team leadership","10%","Managing humans needs EQ","Develop emotional intelligence"],["Innovation","15%","Pioneering needs vision","Own the innovation pipeline"]];
}

function getToolStack(j){
  const eng=j==="Software Engineer"||(j&&j.includes("Engineer"));
  if(eng)return[["Claude (Anthropic)","Deep reasoning, code generation, analysis","claude.ai","Free / $20/mo"],["GitHub Copilot","Real-time code suggestions in IDE","github.com/features/copilot","$10/mo"],["Cursor IDE","AI-native code editor, chat with codebase","cursor.com","Free / $20/mo"],["Perplexity AI","AI-powered research with sources","perplexity.ai","Free / $20/mo"],["ChatGPT (OpenAI)","General assistant, brainstorming, coding","chat.openai.com","Free / $20/mo"],["Replit Agent","Build full apps from natural language","replit.com","Free / $25/mo"],["v0 by Vercel","Generate UI components from text","v0.dev","Free tier"],["NotebookLM","Upload docs, AI summaries and Q&A","notebooklm.google.com","Free"]];
  return[["Claude (Anthropic)","Deep reasoning, code gen, analysis","claude.ai","Free / $20/mo"],["Canva AI","AI-powered design and presentations","canva.com","Free / $13/mo"],["ChatGPT (OpenAI)","General assistant, brainstorming, coding","chat.openai.com","Free / $20/mo"],["Perplexity AI","AI-powered research with sources","perplexity.ai","Free / $20/mo"],["NotebookLM","Upload docs, AI summaries and Q&A","notebooklm.google.com","Free"],["Zapier","No-code automation, 6000+ apps","zapier.com","Free / $20/mo"]];
}

function getPrompts(j){
  const eng=j==="Software Engineer"||(j&&j.includes("Engineer"));
  const r=eng?"Software Engineer":(j||"Professional");
  return[
    {tag:"Daily",title:eng?"Code Explanation":"Task Accelerator",p:eng?"You are a senior software engineer and patient teacher. Explain the following code line by line as if I'm a junior developer. Use plain language and highlight any potential bugs or improvements.\n--> [PASTE YOUR CODE HERE] <--":"You are a senior "+r+" with 15 years of experience. I need to complete this task:\n--> [DESCRIBE YOUR TASK HERE] <--\nGive me: (1) Fastest approach, (2) Common pitfalls, (3) Quality checklist. Be specific."},
    {tag:"Daily",title:eng?"Bug Detective":"Error/Problem Solver",p:eng?"You are an expert debugger. I'm getting the following error:\n--> [PASTE ERROR MESSAGE] <--\nHere is the relevant code:\n--> [PASTE CODE] <--\nExplain what's causing it, why it happens, and give me the exact fix. Show the corrected code.":"You are an expert debugger. I have this issue:\n--> [DESCRIBE PROBLEM OR PASTE ERROR] <--\nContext:\n--> [PASTE RELEVANT DETAILS] <--\nExplain cause, why it happens, and give the exact fix."},
    {tag:"Daily",title:eng?"Code Review Partner":"Work Review Partner",p:eng?"You are a staff-level engineer doing a code review. Review for: bugs, security issues, performance problems, readability, and best practices. Give specific line-by-line feedback and rate overall quality 1-10.\n--> [PASTE CODE] <--":"You are a senior "+r+" doing quality review. Review for: errors, improvements, best practices, clarity. Give line-by-line feedback. Rate 1-10.\n--> [PASTE YOUR WORK HERE] <--"},
    {tag:"Daily",title:eng?"Test Generator":"Communication Drafter",p:eng?"You are a QA engineer. Write comprehensive unit tests for this function using --> [TESTING FRAMEWORK, e.g. Jest/pytest] <--. Include edge cases, error cases, and boundary conditions. Explain why each test matters.\n--> [PASTE FUNCTION] <--":"Draft a professional --> [EMAIL/SLACK/REPORT] <-- about:\n--> [TOPIC AND KEY POINTS] <--\nTone: --> [FORMAL/FRIENDLY/DIRECT] <--. Concise and action-oriented."},
    {tag:"Upskill",title:"Concept Deep-Dive",p:"Teach me --> [CONCEPT] <-- in 3 levels:\n1. ELI5 (2 sentences)\n2. Intermediate (1 paragraph + analogy)\n3. Advanced (technical details, trade-offs, when to use)"},
    {tag:"Upskill",title:eng?"Architecture Advisor":"Strategy Advisor",p:eng?"You are a principal engineer. I need to design a system for:\n--> [DESCRIBE YOUR SYSTEM] <--\nGive: (1) High-level architecture (describe components), (2) Technology choices with trade-offs, (3) Top 3 things that will break at scale, (4) Recommended approach and why.":"You are a principal-level "+r+". I need strategy for:\n--> [DESCRIBE SITUATION] <--\nGive: (1) High-level approach, (2) Key decisions + trade-offs, (3) Top 3 risks + mitigations, (4) Recommended path + why."},
    {tag:"Upskill",title:"AI Tool Mastery",p:"You are an AI productivity coach. I'm a "+r+" at skill level --> [LEVEL] <--. Give me a concrete 30-min daily routine using --> [TOOL NAME] <-- to improve proficiency in 2 weeks. Specific exercises only."},
    {tag:"Career",title:"Resume Bulletizer",p:"You are a hiring manager. Rewrite these experiences as quantified resume bullets (XYZ formula: Accomplished [X] measured by [Y] by doing [Z]). ATS-friendly.\n--> [PASTE RAW EXPERIENCE NOTES] <--"},
    {tag:"Career",title:"Interview Prep",p:"I'm preparing for a --> [ROLE TYPE] <-- interview. Give:\n1. 5 most likely technical questions\n2. 3 common behavioral questions + STAR frameworks\n3. 1-week study plan by impact"},
    {tag:"Prompts",title:"Prompt Optimizer",p:"I wrote this prompt but output isn't great:\n--> [PASTE YOUR WEAK PROMPT] <--\nRewrite using ROCA (Role, Objective, Context, Answer). Explain what was wrong and why yours is better."},
  ];
}

function get90DayPlan(j){
  const eng=j==="Software Engineer"||(j&&j.includes("Engineer"));
  const r=eng?"Software Engineer":(j||"Professional");
  return[
    {phase:"Phase 1: Foundation (Weeks 1-4)",rows:[["1","Set up AI tools: "+(eng?"install Cursor, sign up for Claude & Copilot. Run first 10 AI-generated code completions":"Claude, ChatGPT, Perplexity. Run first 10 AI-assisted tasks")+".",eng?"Cursor, Copilot, Claude":"Claude, ChatGPT, Perplexity","4-5 hrs"],["2","Use AI for every "+(eng?"coding":"routine")+" task. Track time saved. Learn ROCA prompting.","All tools, ROCA Framework","5-6 hrs"],["3",eng?"Have AI explain 3 concepts you've been avoiding. Write tests for one module using AI.":"AI deep-dive: 3 concepts you've avoided. Automate one recurring workflow.",eng?"Claude, Prompts #4 & #5":"Claude, Prompts #5 & #7","5-6 hrs"],["4","Strategy exercise: "+(eng?"design a small system with AI as advisor":"use AI as advisor for a real "+r+" challenge")+". Critique suggestions.","Claude, Prompt #6","5-6 hrs"]]},
    {phase:"Phase 2: Practice (Weeks 5-8)",rows:[["5","Start side project built 80% with AI. Document workflow.",eng?"Cursor, Replit, v0":"All tools","6-7 hrs"],["6","Learn prompt chaining: output of one prompt feeds the next. Master ROCAS.","Claude, ROCAS Framework","5-6 hrs"],["7","Optimize team workflow: identify 3 AI-automatable tasks. Present to lead.","Perplexity, Claude","5-6 hrs"],["8","Complete side project. Deploy. Write case study of AI-augmented process.","All tools, Prompt #8","6-7 hrs"]]},
    {phase:"Phase 3: Integration (Weeks 9-12)",rows:[["9","Advanced prompting: ROCASTLE for complex analysis. AI for "+(eng?"code":"quality")+" reviews.","ROCASTLE, Prompt #3","5-6 hrs"],["10","Mentor a colleague on AI tools. Teaching solidifies knowledge + reputation.","All tools, Prompt #7","4-5 hrs"],["11","Update resume with AI-augmented accomplishments. Prep for AI interviews.","Claude, Prompts #8 & #9","5-6 hrs"],["12","Audit progress: re-measure skill level. Set 6-month goals. Target: 6-7/10.","Prompt #10, self-assessment","4-5 hrs"]]},
  ];
}

const FRAMEWORKS=[
  {lvl:"Level 1: ROCA",desc:"Foundation. Four components for structured, high-quality outputs.",text:"[R] Role: You are --> [persona] <--.\n[O] Objective: Your goal is to --> [clear sentence] <--.\n[C] Context: Background: --> [facts] <--. Constraints: --> [limits] <--.\n[A] Answer: 1. Summary (2 sentences). 2. Main points (3-5 bullets). 3. Details per point. 4. Risks. 5. Next steps. Under 500 words."},
  {lvl:"Level 2: ROCAS",desc:"Adds step-by-step reasoning before answering.",text:"[R][O][C][A] same as ROCA.\n[S] Steps: 1. Read all constraints. 2. List 2-4 key questions. 3. Generate 3 scenarios. 4. Pick most likely. 5. Self-check weaknesses. 6. Write final answer."},
  {lvl:"Level 3: ROCAST",desc:"Adds tone: Feynman-style, no-fluff, direct.",text:"[R][O][C][A][S] same as ROCAS.\n[T] Tone: Clear, direct, active voice. Strip hedging ('may','could'), passive voice, fluff. Concrete numbers, brutal realism, zero optimism bias."},
  {lvl:"Level 4: ROCASTLE",desc:"Adds logic review and evidence citations.",text:"[R][O][C][A][S][T] same.\n[L] Logic: 1. Assume opposite conclusion. 2. Find second-order effects. 3. Check data gaps. 4. Adjust.\n[E] Evidence: Cite claims [1],[2] inline. List sources at end."},
  {lvl:"Level 5: DROCASTLE",desc:"Adds domain lock for recurring research areas.",text:"[D] Domain: This conversation focuses on --> [topic] <--. Stay practical and fact-based.\n[R][O][C][A][S][T][L][E] same as ROCASTLE."},
  {lvl:"Level 6: DROCASTLE-AI",desc:"Ultimate: adds audience tailoring + iteration.",text:"[D][R][O][C][A][S][T][L][E] same.\n[A] Audience: Tailor for --> [audience] <--.\n[I] Iteration: 'Refine by --> [your change] <--.'"},
];

const BONUS=[
  {title:"AI Anti-Hallucinator",desc:"Force fact-check on suspicious AI answers.",text:"[R]: Strict fact-check mode. No opinions, no speculation.\n[O]: Re-answer using only verified facts.\n[C]: Claim to check: --> [paste section] <--. Correct version: --> [your version] <--.\n[A]: 1. Verdict. 2. Correction (1-3 sentences). 3. What was wrong. Under 150 words."},
  {title:"7-Day AI Updates",desc:"Weekly AI landscape briefing.",text:"[R]: AI-obsessed CEO. Hype is poison.\n[O]: Top 3 AI/LLM trends from last 7 days.\n[C]: LLMs, open-source, hardware, regulatory, agents. Since --> [date] <--.\n[A]: Verdict, Top 3, Details, Risks, Next steps. 500 words.\n[S]: Rank by competitive impact. [T]: Feynman-style."},
  {title:"4-Week Stock Outlook",desc:"DROCASTLE-level stock analysis. Not financial advice.",text:"[D]: Short-term forecasting (4 weeks).\n[R]: Hedge fund analyst. Numbers-driven.\n[O]: 4-week outlook for --> [Ticker] <--.\n[C]: EDGAR, earnings, analysts, macro/Fed, geopolitics.\n[A]: Price range + confidence, movers, macro, earnings reaction, consensus, risks, recommendation.\n[S][T][L][E]: Full DROCASTLE."},
];

/* ═══════════════════════════════════════════
   PDF GENERATOR
   ═══════════════════════════════════════════ */

export function generatePDF(data) {
  const { email, jobTitle, industry, rating, quizAnswers } = data;
  const role = jobTitle || "Professional";
  const ind = industry || "General";
  const budget = quizAnswers?.budget || "$0 (free)";
  const doc = new jsPDF("portrait","mm","a4");
  const W=210, H=297, M=20, CW=W-2*M;
  const RED=[210,4,45], WHT=[235,235,235], GRY=[140,140,140], DGRY=[70,70,70];
  const TOP=24, STOP=278;
  let y=TOP;

  /* ── helpers ── */
  const dark=()=>{doc.setFillColor(18,18,18);doc.rect(0,0,W,H,"F");};
  const newPg=()=>{doc.addPage();dark();y=TOP;};
  const chk=(h)=>{if(y+h>STOP)newPg();};

  const icon=(cx,cy,sz)=>{
    const s=sz/200;doc.setFillColor(...RED);
    [[30,30,28,140],[58,138,22,32],[80,110,22,32],[102,82,22,32],[124,54,22,32],[146,30,28,140]]
      .forEach(([a,b,c,d])=>doc.rect(cx+a*s,cy+b*s,c*s,d*s,"F"));
  };

  const sf=(sz,col,st)=>{doc.setFontSize(sz);doc.setTextColor(...col);doc.setFont("helvetica",st||"normal");};
  const hd=(t,sz)=>{chk(sz*0.5);sf(sz,RED,"bold");doc.text(t,M,y);y+=sz*0.4+3;};
  const sub=(t)=>{sf(9.5,GRY,"italic");doc.splitTextToSize(t,CW).forEach(l=>{chk(5);doc.text(l,M,y);y+=4;});y+=2;sf(10,WHT);};
  const bd=(t)=>{sf(10,WHT);doc.splitTextToSize(t,CW).forEach(l=>{chk(5);doc.text(l,M,y);y+=4.6;});y+=1;};

  const codeH=(t)=>{doc.setFont("courier","normal");doc.setFontSize(8.5);const n=doc.splitTextToSize(t,CW-10).length;doc.setFont("helvetica","normal");return n*3.6+9;};
  const code=(t)=>{
    doc.setFont("courier","normal");doc.setFontSize(8.5);
    const ls=doc.splitTextToSize(t,CW-10),bh=ls.length*3.6+7;
    doc.setFillColor(28,28,28);doc.setDrawColor(50,50,50);doc.roundedRect(M,y,CW,bh,2,2,"FD");
    doc.setTextColor(195,195,195);let cy=y+4;ls.forEach(l=>{doc.text(l,M+4,cy);cy+=3.6;});
    y+=bh+3;doc.setFont("helvetica","normal");
  };

  const grn=(t1,t2)=>{
    const h=t2?15:11;chk(h);
    doc.setFillColor(20,40,20);doc.setDrawColor(40,80,40);doc.roundedRect(M,y,CW,h,2,2,"FD");
    sf(8.5,[90,255,90],"bold");doc.text(t1,M+4,y+(t2?5.5:6.5));
    if(t2){doc.setFont("helvetica","normal");doc.text(t2,M+4,y+11);}y+=h+3;
  };

  let _tblFirstPage=true;
  const tblStyles={
    styles:{fontSize:8,textColor:[215,215,215],fillColor:[24,24,24],cellPadding:2.5,lineColor:[50,50,50],lineWidth:0.2},
    headStyles:{fillColor:RED,textColor:[255,255,255],fontStyle:"bold",fontSize:8.5},
    alternateRowStyles:{fillColor:[32,32,32]},
    margin:{left:M,right:M,top:TOP,bottom:20},
    willDrawPage:()=>{if(!_tblFirstPage){dark();}else{_tblFirstPage=false;}},
  };
  const tbl=(opts)=>{_tblFirstPage=true;doc.autoTable({...tblStyles,...opts});y=doc.lastAutoTable.finalY+4;};

  /* ══ COVER ══ */
  dark();icon(W/2-15,40,30);
  sf(48,RED,"bold");doc.text("NATSEL.AI",W/2,95,{align:"center"});
  sf(22,WHT,"bold");doc.text("Career Survival Kit",W/2,114,{align:"center"});
  sf(12,GRY);doc.text("Your Personalized Guide to Thriving in the AI Era",W/2,132,{align:"center"});
  sf(14,WHT,"bold");doc.text((email||"User")+"\u2019s Playbook",W/2,158,{align:"center"});
  sf(11,GRY);doc.text(role+" \u00B7 "+ind+" \u00B7 Skill Level "+rating+"/10",W/2,170,{align:"center"});
  sf(8,DGRY);doc.text("\u00A9 NatSel.ai \u2014 All Rights Reserved",W/2,H-25,{align:"center"});

  /* ══ EXECUTIVE SUMMARY ══ */
  newPg();hd("Executive Summary",20);y+=2;
  const rsk=getDisplacementRisk(rating),tln=getTimeline(rating),bgt=getBudgetLabel(budget);
  sf(11,WHT,"bold");
  doc.text("AI Displacement Risk: "+rsk,M,y);y+=7;
  doc.text("Timeline to Intermediate AI Proficiency: "+tln,M,y);y+=7;
  doc.text("Current Skill Level: "+rating+"/10 | Monthly Budget: "+bgt,M,y);y+=12;
  hd("3 Biggest Threats to Your Role",14);y+=2;
  getThreats(jobTitle).forEach(([t,d])=>{
    chk(25);sf(11,WHT,"bold");doc.text("\u2022 "+t+" \u2014",M,y);y+=5.5;
    sf(10,[195,195,195]);doc.splitTextToSize(d,CW-4).forEach(l=>{chk(5);doc.text(l,M+3,y);y+=4.6;});y+=4;
  });

  /* ══ TASK BREAKDOWN ══ */
  newPg();hd("Detailed Role Breakdown",18);
  sub("Which parts of your job are most vulnerable to AI \u2014 and which give you a lasting edge.");y+=1;
  tbl({startY:y,head:[["Task","% Automatable","Why","Action to Mitigate"]],body:getTaskBreakdown(jobTitle),
    columnStyles:{0:{cellWidth:32,fontStyle:"bold"},1:{cellWidth:20,halign:"center"},2:{cellWidth:48},3:{cellWidth:52}}});
  grn("Key Takeaway: Your automatable tasks overlap with what current AI handles well.",
    "Survival strategy: migrate toward architecture, strategy, and human-centric skills \u2014 fast.");

  /* ══ TOOL STACK ══ */
  newPg();hd("Recommended AI Tools Stack",18);
  sub("Curated for "+ind+" \u00B7 Skill Level "+rating+"/10 \u00B7 Budget "+bgt);y+=1;
  tbl({startY:y,head:[["Tool","Use Case","Link","Cost"]],body:getToolStack(jobTitle,rating,budget),
    columnStyles:{0:{cellWidth:30,fontStyle:"bold"},1:{cellWidth:60},2:{cellWidth:38},3:{cellWidth:24}}});
  grn("Budget Fit: Start with free tiers. Add one paid tool with highest ROI for your daily work.");

  /* ══ PROMPTS ══ */
  newPg();hd("10 Core Prompts for "+role+"s",18);
  sub("Tailored to "+ind+" \u00B7 Skill Level "+rating+"/10");y+=2;
  getPrompts(jobTitle).forEach((p,i)=>{
    chk(8+codeH(p.p));
    sf(10,RED,"bold");doc.text("["+p.tag+"] #"+(i+1)+" \u2014 "+p.title,M,y);y+=7;
    code(p.p);
  });

  /* ══ 90-DAY PLAN ══ */
  newPg();hd("90-Day Action Plan",18);
  sub("Personalized for: "+role+" \u00B7 "+ind+" \u00B7 Skill Level "+rating+"/10");y+=2;
  get90DayPlan(jobTitle).forEach(ph=>{
    chk(18);sf(12,RED,"bold");doc.text(ph.phase,M,y);y+=7;
    tbl({startY:y,head:[["Week","Goals","Tools / Prompts","Time"]],body:ph.rows,
      columnStyles:{0:{cellWidth:12,halign:"center"},1:{cellWidth:78},2:{cellWidth:44},3:{cellWidth:18,halign:"center"}}});
  });
  grn("Total: ~5\u20136 hours/week for 12 weeks. Less than 1 hour per workday to transform your career.");

  /* ══ MASTER AI PROMPTING ══ */
  newPg();hd("Master AI Prompting",20);y+=2;
  sf(14,WHT,"bold");doc.text("The ROCA Framework & Beyond",M,y);y+=9;
  doc.setFont("helvetica","normal");
  bd("The following pages contain NatSel.ai\u2019s proprietary prompt engineering system \u2014 from beginner (ROCA) to the most advanced level (DROCASTLE-AI). Each framework builds on the last.");y+=2;
  bd("Look for arrows ( --> <-- ) throughout \u2014 those mark the spots where you customize the prompt with your own details.");y+=5;
  hd("Prompt Framework Index",13);sub("Choose the right level of prompting power for your task.");y+=1;
  tbl({startY:y,head:[["Level","Framework","Best For","When to Use"]],body:[
    ["1","ROCA","Basic structured prompts","Simple research, lists, summaries"],
    ["2","ROCAS","Step-by-step reasoning","AI needs to think logically"],
    ["3","ROCAST","ROCAS + Feynman-style tone","Clarity and directness matter"],
    ["4","ROCASTLE","Logic checks + evidence","High-stakes analysis"],
    ["5","DROCASTLE","Domain-locked expert analysis","Recurring topic areas"],
    ["6","DROCASTLE-AI","Full power + audience + iteration","Polished reader-specific answers"],
  ],columnStyles:{0:{cellWidth:12,halign:"center"},1:{cellWidth:32,fontStyle:"bold"},2:{cellWidth:52},3:{cellWidth:52}}});
  y+=4;

  /* ══ FRAMEWORK DETAILS ══ */
  FRAMEWORKS.forEach(f=>{
    chk(20+codeH(f.text));
    sf(13,RED,"bold");doc.text(f.lvl,M,y);y+=6;
    sf(9.5,GRY,"italic");doc.splitTextToSize(f.desc,CW).forEach(l=>{doc.text(l,M,y);y+=4;});y+=2;
    sf(8.5,[180,180,180]);doc.text("Customize all text inside --> [ ] <-- brackets with your own details.",M,y);y+=5;
    code(f.text);y+=1;
  });

  /* ══ BONUS PROMPTS ══ */
  newPg();hd("Bonus: Ready-to-Use Power Prompts",18);
  bd("Three battle-tested prompts you can copy-paste immediately. Each uses the ROCA+ framework principles.");y+=3;
  BONUS.forEach(b=>{
    chk(14+codeH(b.text));
    sf(13,WHT,"bold");doc.text(b.title,M,y);y+=6;
    sf(9.5,GRY,"italic");doc.text(b.desc,M,y);y+=6;
    doc.setFont("helvetica","normal");code(b.text);y+=2;
  });

  /* ══ BACK COVER ══ */
  newPg();const mid=H/2;
  icon(W/2-15,mid-70,30);
  sf(42,RED,"bold");doc.text("NATSEL.AI",W/2,mid-20,{align:"center"});
  sf(18,WHT,"bold");doc.text("Your Career Evolution Starts",W/2,mid+4,{align:"center"});
  doc.text("Now",W/2,mid+16,{align:"center"});
  sf(11,GRY);doc.text("You now have the tools, the frameworks, and the plan.",W/2,mid+40,{align:"center"});
  doc.text("The only variable left is execution.",W/2,mid+50,{align:"center"});
  sf(8,DGRY);doc.text("\u00A9 NatSel.ai \u2014 All Rights Reserved",W/2,H-25,{align:"center"});

  /* ══ FINAL PASS: footers on content pages (skip cover + back cover) ══ */
  const tot=doc.internal.getNumberOfPages();
  for(let i=2;i<tot;i++){
    doc.setPage(i);
    sf(8,GRY);doc.text("NatSel.ai \u2014 Career Survival Kit",M,H-10);
    doc.text("Page "+(i-1),W-M,H-10,{align:"right"});
  }

  return doc;
}

/* ═══════════════════════════════════════════
   SUCCESS PAGE COMPONENT
   ═══════════════════════════════════════════ */

export default function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [userData, setUserData] = useState(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment !== "success") { setStatus("invalid"); return; }
    const raw = localStorage.getItem("userPlanData");
    if (!raw) { setStatus("nodata"); return; }
    try { setUserData(JSON.parse(raw)); setStatus("ready"); } catch { setStatus("nodata"); }
  }, [searchParams]);

  const handleDownload = () => {
    if (!userData) return;
    try {
      const doc = generatePDF(userData);
      const name = (userData.jobTitle || "Career").replace(/[^a-zA-Z0-9]/g, "_");
      doc.save("NatSel_AI_Career_Survival_Kit_" + name + ".pdf");
      setDownloaded(true);
    } catch (err) { console.error("PDF generation error:", err); alert("Error generating PDF. Please try again."); }
  };

  const cs = { minHeight:"100vh", background:"#121212", color:"#F0F0F0", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" };
  const card = { background:"#1a1a1a", borderRadius:"16px", border:"1px solid #333", padding:"40px", maxWidth:"500px", width:"100%", textAlign:"center" };

  if (status === "loading") return <div style={cs}><div style={card}><p>Loading...</p></div></div>;
  if (status === "invalid" || status === "nodata") return (
    <div style={cs}><div style={card}>
      <div style={{fontSize:"40px",marginBottom:"16px"}}>{"\u26A0\uFE0F"}</div>
      <h2 style={{color:"#F0F0F0",fontSize:"22px",fontWeight:800,margin:"0 0 12px"}}>{status==="invalid"?"Access Required":"No Data Found"}</h2>
      <p style={{color:"#aaa",fontSize:"14px",margin:"0 0 24px",lineHeight:1.6}}>{status==="invalid"?"Please complete the quiz on the main page first.":"We couldn't find your assessment data. Please retake the quiz."}</p>
      <button onClick={()=>navigate("/")} style={{padding:"12px 32px",background:"#D2042D",color:"#F0F0F0",border:"none",borderRadius:"10px",fontSize:"16px",fontWeight:700,cursor:"pointer"}}>Go to NatSel.ai</button>
    </div></div>
  );

  return (
    <div style={cs}><div style={card}>
      <div style={{width:"56px",height:"56px",borderRadius:"50%",background:"linear-gradient(135deg,#0d2a0d,#1a3a1a)",border:"2px solid #2a5a2a",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:"24px"}}>{"\u2705"}</div>
      <h2 style={{color:"#5aff5a",fontSize:"22px",fontWeight:800,margin:"0 0 8px"}}>Your Playbook Is Ready!</h2>
      <p style={{color:"#aaa",fontSize:"14px",margin:"0 0 24px",lineHeight:1.6}}>Your personalized Career Survival Kit has been generated. Click below to download.</p>
      <button onClick={handleDownload} style={{padding:"16px 40px",background:downloaded?"#1a3a1a":"#D2042D",color:"#F0F0F0",border:"none",borderRadius:"12px",fontSize:"18px",fontWeight:800,cursor:"pointer",boxShadow:downloaded?"none":"0 0 25px rgba(210,4,45,0.3)",transition:"all 0.2s"}}>{downloaded?"\u2713 Downloaded":"Download PDF Playbook \u2193"}</button>
      <p style={{color:"#555",fontSize:"12px",marginTop:"16px"}}>PDF generates instantly in your browser</p>
      <button onClick={()=>navigate("/")} style={{marginTop:"20px",padding:"10px 24px",background:"transparent",color:"#888",border:"1px solid #444",borderRadius:"8px",fontSize:"13px",cursor:"pointer"}}>{"\u2190 Back to NatSel.ai"}</button>
    </div></div>
  );
}
