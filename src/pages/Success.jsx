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

export function generatePDF(data) {
  const { email, jobTitle, industry, rating, quizAnswers } = data;
  const role = jobTitle || "Professional";
  const ind = industry || "General";
  const budget = quizAnswers?.budget || "$0 (free)";
  const doc = new jsPDF("portrait", "mm", "a4");
  const W = doc.internal.pageSize.getWidth(); // 210
  const H = doc.internal.pageSize.getHeight(); // 297
  const M = 20; // margin
  const CW = W - M * 2; // content width
  const RED = [210, 4, 45];
  const BLK = [30, 30, 30];
  const GRY = [120, 120, 120];
  const LGRY = [180, 180, 180];
  let pageNum = 0;
  let y = 0;

  // ── Helpers ──
  const footer = () => {
    pageNum++;
    doc.setFontSize(9);
    doc.setTextColor(...GRY);
    doc.text("NatSel.ai \u2014 Career Survival Kit", M, H - 10);
    doc.text("Page " + pageNum, W - M, H - 10, { align: "right" });
  };

  const newPage = () => {
    doc.addPage();
    y = M + 5;
    footer();
  };

  const need = (n) => {
    if (y + n > H - 18) newPage();
  };

  const heading = (text, size) => {
    need(size * 0.6 + 6);
    doc.setFontSize(size);
    doc.setTextColor(...RED);
    doc.setFont("helvetica", "bold");
    doc.text(text, M, y);
    y += size * 0.45 + 4;
  };

  const subheading = (text) => {
    need(12);
    doc.setFontSize(11);
    doc.setTextColor(...BLK);
    doc.setFont("helvetica", "italic");
    doc.text(text, M, y);
    y += 6;
    doc.setFont("helvetica", "normal");
  };

  const para = (text, indent) => {
    const x = indent ? M + 4 : M;
    const w = indent ? CW - 4 : CW;
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, w);
    lines.forEach((line) => {
      need(5);
      doc.text(line, x, y);
      y += 4.8;
    });
    y += 2;
  };

  const promptBlock = (text) => {
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.setFont("courier", "normal");
    const lines = doc.splitTextToSize(text, CW - 10);
    const bh = lines.length * 4 + 6;
    need(bh + 4);
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(M, y - 2, CW, bh, 1.5, 1.5, "FD");
    y += 2;
    lines.forEach((line) => {
      doc.text(line, M + 5, y);
      y += 4;
    });
    y += 4;
    doc.setFont("helvetica", "normal");
  };

  const divider = () => {
    y += 2;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);
    y += 5;
  };

  // ── Shared autoTable theme ──
  const tableTheme = {
    styles: { fontSize: 9, textColor: [40, 40, 40], cellPadding: 3, lineColor: [200, 200, 200], lineWidth: 0.2 },
    headStyles: { fillColor: RED, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    didDrawPage: () => { footer(); },
  };

  // ══════════════════════════════════════════
  // PAGE 1: COVER
  // ══════════════════════════════════════════
  pageNum = 0; // cover is not numbered

  doc.setFontSize(48);
  doc.setTextColor(...RED);
  doc.setFont("helvetica", "bold");
  doc.text("NATSEL.AI", W / 2, 80, { align: "center" });

  doc.setFontSize(24);
  doc.setTextColor(...BLK);
  doc.text("Career Survival Kit", W / 2, 100, { align: "center" });

  doc.setFontSize(13);
  doc.setTextColor(...GRY);
  doc.setFont("helvetica", "normal");
  doc.text("Your Personalized Guide to Thriving in the AI Era", W / 2, 120, { align: "center" });

  doc.setFontSize(13);
  doc.setTextColor(...BLK);
  doc.setFont("helvetica", "bold");
  doc.text((email || "User") + "\u2019s Playbook", W / 2, 150, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(...GRY);
  doc.setFont("helvetica", "normal");
  doc.text(role + " \u00B7 " + ind + " \u00B7 Skill Level " + rating + "/10", W / 2, 162, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(...LGRY);
  doc.text("\u00A9 NatSel.ai \u2014 All Rights Reserved", W / 2, H - 20, { align: "center" });

  // ══════════════════════════════════════════
  // PAGE 2: EXECUTIVE SUMMARY
  // ══════════════════════════════════════════
  newPage();

  heading("Executive Summary", 22);
  y += 2;

  const risk = getDisplacementRisk(rating);
  const timeline = getTimeline(rating);
  const budgetLabel = getBudgetLabel(budget);

  doc.setFontSize(11);
  doc.setTextColor(...BLK);
  doc.setFont("helvetica", "bold");
  doc.text("AI Displacement Risk: " + risk, M, y); y += 7;
  doc.text("Timeline to Intermediate AI Proficiency: " + timeline, M, y); y += 7;
  doc.text("Current Skill Level: " + rating + "/10 | Monthly Budget: " + budgetLabel, M, y); y += 12;

  heading("3 Biggest Threats to Your Role", 14);
  y += 2;

  getThreats(jobTitle).forEach(([title, desc]) => {
    need(24);
    doc.setFontSize(11);
    doc.setTextColor(...BLK);
    doc.setFont("helvetica", "bold");
    doc.text("\u25A0 " + title + " \u2014", M, y);
    y += 5.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(desc, CW - 2);
    lines.forEach((l) => { need(5); doc.text(l, M + 2, y); y += 4.8; });
    y += 4;
  });

  // ══════════════════════════════════════════
  // PAGE 3: TASK BREAKDOWN
  // ══════════════════════════════════════════
  newPage();

  heading("Detailed Role Breakdown", 18);
  subheading("Which parts of your job are most vulnerable to AI \u2014 and which give you a lasting edge.");
  y += 3;

  doc.autoTable({
    startY: y,
    margin: { left: M, right: M },
    head: [["Task", "% Automatable", "Why", "Action to Mitigate"]],
    body: getTaskBreakdown(jobTitle),
    ...tableTheme,
    columnStyles: { 0: { cellWidth: 32, fontStyle: "bold" }, 1: { cellWidth: 18, halign: "center" }, 2: { cellWidth: 50 }, 3: { cellWidth: 52 } },
  });
  y = doc.lastAutoTable.finalY + 6;

  need(14);
  doc.setFillColor(240, 248, 240);
  doc.setDrawColor(100, 200, 100);
  doc.roundedRect(M, y, CW, 14, 2, 2, "FD");
  doc.setFontSize(9);
  doc.setTextColor(30, 100, 30);
  doc.setFont("helvetica", "bold");
  doc.text("Key Takeaway: Your automatable tasks overlap with what current AI tools handle well.", M + 4, y + 5.5);
  doc.setFont("helvetica", "normal");
  doc.text("Your survival strategy: migrate toward architecture, strategy, and human-centric skills \u2014 fast.", M + 4, y + 10.5);
  y += 20;

  // ══════════════════════════════════════════
  // PAGE 4: TOOL STACK
  // ══════════════════════════════════════════
  newPage();

  heading("Recommended AI Tools Stack", 18);
  subheading("Curated for " + ind + " \u00B7 Skill Level " + rating + "/10 \u00B7 Budget " + budgetLabel);
  y += 3;

  doc.autoTable({
    startY: y,
    margin: { left: M, right: M },
    head: [["Tool", "Use Case", "Link", "Cost"]],
    body: getToolStack(jobTitle, rating, budget),
    ...tableTheme,
    columnStyles: { 0: { cellWidth: 30, fontStyle: "bold" }, 1: { cellWidth: 62 }, 2: { cellWidth: 40 }, 3: { cellWidth: 26 } },
  });
  y = doc.lastAutoTable.finalY + 6;

  need(14);
  doc.setFillColor(240, 248, 240);
  doc.setDrawColor(100, 200, 100);
  doc.roundedRect(M, y, CW, 12, 2, 2, "FD");
  doc.setFontSize(9);
  doc.setTextColor(30, 100, 30);
  doc.setFont("helvetica", "bold");
  doc.text("Budget Fit: Start with free tiers of Claude, Cursor, and Perplexity. Add one paid tool with highest ROI.", M + 4, y + 7.5);
  y += 18;

  // ══════════════════════════════════════════
  // PAGES 5-6: PROMPTS
  // ══════════════════════════════════════════
  newPage();

  heading("10 Core Prompts for " + role + "s", 18);
  subheading("Tailored to " + ind + " \u00B7 Skill Level " + rating + "/10");
  y += 3;

  getPrompts(jobTitle).forEach((p, i) => {
    need(30);
    doc.setFontSize(10);
    doc.setTextColor(...RED);
    doc.setFont("helvetica", "bold");
    doc.text("[" + p.tag + "] #" + (i + 1) + " \u2014 " + p.title, M, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    promptBlock(p.p);
  });

  // ══════════════════════════════════════════
  // PAGES 7-8: 90-DAY PLAN
  // ══════════════════════════════════════════
  newPage();

  heading("90-Day Action Plan", 18);
  subheading("Personalized for: " + role + " \u00B7 " + ind + " \u00B7 Skill Level " + rating + "/10");
  y += 3;

  get90DayPlan(jobTitle).forEach((phase) => {
    need(22);
    doc.setFontSize(13);
    doc.setTextColor(...RED);
    doc.setFont("helvetica", "bold");
    doc.text(phase.phase, M, y);
    y += 7;

    doc.autoTable({
      startY: y,
      margin: { left: M, right: M },
      head: [["Week", "Goals", "Tools / Prompts", "Time"]],
      body: phase.rows,
      ...tableTheme,
      columnStyles: { 0: { cellWidth: 12, halign: "center" }, 1: { cellWidth: 78 }, 2: { cellWidth: 44 }, 3: { cellWidth: 18, halign: "center" } },
    });
    y = doc.lastAutoTable.finalY + 6;
  });

  need(14);
  doc.setFillColor(240, 248, 240);
  doc.setDrawColor(100, 200, 100);
  doc.roundedRect(M, y, CW, 12, 2, 2, "FD");
  doc.setFontSize(9);
  doc.setTextColor(30, 100, 30);
  doc.setFont("helvetica", "bold");
  doc.text("Total Commitment: ~5\u20136 hours per week for 12 weeks. Less than 1 hour per workday.", M + 4, y + 7.5);
  y += 18;

  // ══════════════════════════════════════════
  // PAGE 9: FRAMEWORK INTRO
  // ══════════════════════════════════════════
  newPage();

  heading("Master AI Prompting", 22);
  doc.setFontSize(14);
  doc.setTextColor(...BLK);
  doc.setFont("helvetica", "bold");
  doc.text("The ROCA Framework & Beyond", M, y); y += 8;

  doc.setFont("helvetica", "normal");
  para("The following pages contain NatSel.ai\u2019s proprietary prompt engineering system \u2014 from beginner (ROCA) to the most advanced level (DROCASTLE-AI). Each framework builds on the last. Start with your current skill level and progress upward.");
  y += 2;
  para("\u2605 Look for arrows (--> <--) \u2014 those mark the spots where you customize the prompt with your own details.");
  y += 6;

  // Framework Index Table
  heading("Prompt Framework Index", 14);
  subheading("Choose the right level of prompting power for your task.");
  y += 2;

  doc.autoTable({
    startY: y,
    margin: { left: M, right: M },
    head: [["Level", "Framework", "Best For", "When to Use"]],
    body: [
      ["1", "ROCA", "Basic structured prompts with clear output format", "Simple research, lists, summaries"],
      ["2", "ROCAS", "Structured prompts with step-by-step reasoning", "When the AI needs to think through logically"],
      ["3", "ROCAST", "ROCAS + sharp, no-fluff tone (Feynman-style)", "When clarity and directness matter"],
      ["4", "ROCASTLE", "Deep analysis with logic checks and evidence", "High-stakes questions requiring scrutiny"],
      ["5", "DROCASTLE", "Domain-locked expert analysis", "Recurring topic areas"],
      ["6", "DROCASTLE-AI", "Full power + audience tailoring + iteration", "Polished, reader-specific answers"],
    ],
    ...tableTheme,
    columnStyles: { 0: { cellWidth: 12, halign: "center" }, 1: { cellWidth: 30, fontStyle: "bold" }, 2: { cellWidth: 55 }, 3: { cellWidth: 55 } },
  });
  y = doc.lastAutoTable.finalY + 8;

  // ══════════════════════════════════════════
  // PAGES 10+: FRAMEWORK DETAILS
  // ══════════════════════════════════════════
  FRAMEWORKS.forEach((f) => {
    need(40);
    doc.setFontSize(14);
    doc.setTextColor(...RED);
    doc.setFont("helvetica", "bold");
    doc.text(f.lvl, M, y); y += 6;

    doc.setFontSize(10);
    doc.setTextColor(...GRY);
    doc.setFont("helvetica", "italic");
    doc.text(f.desc, M, y); y += 6;

    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);
    doc.setFont("helvetica", "normal");
    para("\u2605 Customize all text inside --> [ ] <-- brackets with your own details.");
    promptBlock(f.text);
    y += 2;
  });

  // ══════════════════════════════════════════
  // BONUS PROMPTS
  // ══════════════════════════════════════════
  newPage();

  heading("Bonus: Ready-to-Use Power Prompts", 18);
  para("Three battle-tested prompts you can copy-paste immediately. Each uses the ROCA+ framework principles.");
  y += 4;

  BONUS.forEach((b) => {
    need(35);
    doc.setFontSize(13);
    doc.setTextColor(...BLK);
    doc.setFont("helvetica", "bold");
    doc.text(b.title, M, y); y += 6;

    doc.setFontSize(10);
    doc.setTextColor(...GRY);
    doc.setFont("helvetica", "italic");
    doc.text(b.desc, M, y); y += 6;

    doc.setFont("helvetica", "normal");
    promptBlock(b.text);
    y += 2;
  });

  // ══════════════════════════════════════════
  // BACK COVER
  // ══════════════════════════════════════════
  newPage();

  const cy = H / 2 - 40;
  doc.setFontSize(42);
  doc.setTextColor(...RED);
  doc.setFont("helvetica", "bold");
  doc.text("NATSEL.AI", W / 2, cy, { align: "center" });

  doc.setFontSize(20);
  doc.setTextColor(...BLK);
  doc.text("Your Career Evolution Starts", W / 2, cy + 24, { align: "center" });
  doc.text("Now", W / 2, cy + 36, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(...GRY);
  doc.setFont("helvetica", "normal");
  doc.text("You now have the tools, the frameworks, and the plan.", W / 2, cy + 58, { align: "center" });
  doc.text("The only variable left is execution.", W / 2, cy + 68, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(...BLK);
  doc.text("Questions? Reach out at support@natsel.ai", W / 2, cy + 88, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(...LGRY);
  doc.text("\u00A9 NatSel.ai \u2014 All Rights Reserved", W / 2, H - 20, { align: "center" });

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
