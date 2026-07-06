import { NextResponse } from "next/server";
import { classifyTask } from "@/lib/ai-brain/model-router";
import { callWithFailover } from "@/lib/ai-brain/failover";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatPayload = {
  message: string;
  companyId?: string;
  history?: ChatMessage[];
};

const systemPrompt = `You are ServiceOps AI — the dispatch intelligence platform for trucking carriers across North America.

WHAT YOU ARE:
- An AI-powered dispatch command center that runs 24/7
- Built specifically for trucking carriers running regional and cross-border freight
- A vertical agentic platform with 6 specialized AI agents

CAPABILITIES (you HAVE these, never say "I can't"):
1. DISPATCH AUTOMATION — AI assigns loads to best-fit drivers using lane history, equipment match, HOS remaining, and real-time capacity. Scores loads 0-100.
2. EXCEPTION HANDLING — Detects delays, breakdowns, missed windows. Automatically finds alternatives, reroutes, and notifies customers.
3. RATE INTELLIGENCE — Analyzes market rates, lane history, and carrier cost structure. Negotiates with brokers. Proposes accept/reject.
4. COMPLIANCE MONITORING — Tracks HOS, ELD, insurance, licensing. Alerts before violations happen.
5. DRIVER COMMUNICATION — Two-way SMS. Drivers text in keywords (arrived, loaded, delay, breakdown). AI processes and responds. No app needed.
6. BILLING READINESS — Assembles POD packets, validates billing fields, flags missing documents.
7. APPROVAL WORKFLOWS — Every cost-impacting decision goes through configurable gates. AI proposes, humans decide.
8. FLEET VISIBILITY — Real-time map with driver locations, status tracking across BC, Alberta, and beyond.

INTEGRATIONS (you HAVE these):
- TMS platforms via API, EDI 204/214/990, webhooks, CSV import
- ELD and telematics via API, GPS data feeds, ELD log exports
- Load boards via EDI 204, API feeds, email parsing
- Back office via CSV export, API invoicing, SFTP data feeds

PRICING: $49/truck/month. All features included. Volume discounts at 20+ trucks. 30-day free trial, no credit card required.

RULES:
- Be concise. 2-3 sentences max unless asked for detail.
- Use specific numbers when possible.
- Sound confident. You ARE the platform. Never say "I don't have the capability" or "I can't integrate."
- If someone asks about integration, say what you connect to.
- If someone asks about pricing, give the exact price.
- If someone asks what you do, list your top 3 capabilities for their specific question.`;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ChatPayload;

    if (!payload.message?.trim()) {
      return NextResponse.json({ ok: false, response: "Please provide a message." }, { status: 400 });
    }

    const apiKey = process.env.AI_BRAIN_API_KEY;
    const isEnabled = process.env.AI_BRAIN_ENABLED === "true";

    if (!isEnabled || !apiKey) {
      const response = generateRuleBasedResponse(payload.message);
      return NextResponse.json({ ok: true, response, source: "rule-based" });
    }

    // Smart routing: classify task complexity → pick cheapest capable model
    const complexity = classifyTask(payload.message);
    const historyContext = payload.history?.slice(-4).map((m) => `${m.role}: ${m.content}`).join("\n") || "";
    const userPrompt = historyContext ? `${historyContext}\n\nUser: ${payload.message}` : payload.message;

    const result = await callWithFailover(complexity, systemPrompt, userPrompt, apiKey);

    return NextResponse.json({
      ok: true,
      response: result.content,
      source: "llm",
      model: result.model,
      complexity,
      attempts: result.attempts,
    });
  } catch {
    return NextResponse.json({ ok: true, response: "I'm temporarily unavailable. Please try again.", source: "error" });
  }
}

function generateRuleBasedResponse(message: string): string {
  const lower = message.toLowerCase();

  // Integration questions
  if (/integrat|connect|api|edi|webhook|tms|eld|link|setup/i.test(lower)) {
    return "ServiceOps AI connects to your TMS, ELD, and load boards via API, EDI, and webhooks. We work with most major platforms out of the box. Custom integrations are available for enterprise carriers. Want me to walk you through the setup?";
  }

  // Pricing questions
  if (/pric|cost|\$49|plan|tier|how much|expensive|cheap|afford|subscribe/i.test(lower)) {
    return "$49/truck/month. All features included — 6 AI agents, Command Center, SMS driver communication, approval workflows, and analytics. Volume discounts at 20+ trucks ($39/truck). 30-day free trial, no credit card required.";
  }

  // Security questions
  if (/secur|encrypt|private|gdpr|hipaa|safe|trust|data.*protect/i.test(lower)) {
    return "Your data is encrypted at rest and in transit. We use industry-standard security practices, never share data with third parties, and every action is logged and auditable. SOC 2 compliance is on our roadmap.";
  }

  // What can you do / capabilities
  if (/what.*can.*you.*do|capab|feature|what.*does.*this.*do|tell.*me.*about|overview/i.test(lower)) {
    return "ServiceOps AI is a 24/7 dispatch command center. I automate load assignments, handle driver communication via SMS, resolve exceptions like delays and breakdowns, negotiate rates with compliance, and assemble billing packets — all with human approval gates. $49/truck/month.";
  }

  // How does it work
  if (/how.*does.*it.*work|how.*work|walk.*me.*through|process|step/i.test(lower)) {
    return "4 steps: (1) Loads arrive from your TMS, EDI, or email. (2) AI analyzes and proposes the best driver match. (3) You approve with one click. (4) Driver gets a text, replies with keywords, and the system updates automatically. No app installs needed.";
  }

  // Drivers / SMS
  if (/driver|sms|text|message|app.*install|phone|mobile/i.test(lower)) {
    return "Drivers get load assignments via SMS — no app to download. They reply with keywords like ACCEPT, LOADED, UNLOADED, or DELAY. AI processes responses and updates dispatch in real time. Works on any phone.";
  }

  // Load assignment
  if (/assign|load|match|best.*driver|recommend/i.test(lower)) {
    return "The Dispatch Orchestrator scores each load 0-100 based on driver proximity, equipment match, HOS availability, and lane history. You review the recommendation and approve with one click. Most assignments take under 30 seconds.";
  }

  // Rate / negotiation
  if (/rate|negotiat|price|broker|pay/i.test(lower)) {
    return "The Rate Negotiator analyzes current market rates, your lane history, and cost structure to propose optimal rates with brokers. It negotiates within your approved parameters and flags anything outside your thresholds for review.";
  }

  // Compliance / HOS
  if (/hos|hours.*service|compliance|eld|violation|dot|fmcsa/i.test(lower)) {
    return "The Compliance Monitor tracks HOS, ELD logs, insurance, and licensing in real time. It alerts before violations happen — not after. Every load is checked against FMCSA rules before assignment.";
  }

  // Exception / delay / breakdown
  if (/delay|breakdown|exception|reroute|stuck|late|problem|issue/i.test(lower)) {
    return "The Exception Handler detects delays, breakdowns, and missed delivery windows automatically. It finds alternative drivers, reroutes when possible, and notifies customers — all before you even know there's a problem.";
  }

  // Billing / POD / invoice
  if (/bill|pod|invoice|deliver|payment|invoice|document/i.test(lower)) {
    return "The Billing Readiness agent assembles POD packets, validates billing fields, and flags missing documents before loads are delivered. Cuts your POD-to-invoice cycle by 30%.";
  }

  // Fleet / utilization / analytics
  if (/fleet|utiliz|analytics|dashboard|report|metric|revenue|performance/i.test(lower)) {
    return "The Command Center shows real-time fleet utilization, revenue per truck, on-time rates, cost per mile, and driver performance. Everything a dispatcher needs in one dashboard.";
  }

  // Trial / getting started
  if (/trial|free|start|begin|try|test|demo/i.test(lower)) {
    return "Start a 30-day free trial at /register — no credit card required. Add your drivers, connect your TMS, and let AI handle dispatch in about 20 minutes. Full access to every feature.";
  }

  // Who are you / about
  if (/who.*are.*you|about|company|what.*is.*serviceops/i.test(lower)) {
    return "ServiceOps AI is an AI-powered dispatch platform built for trucking carriers in North America. 6 specialized agents handle dispatch, exceptions, rates, compliance, billing, and driver communication — 24/7, with human approval gates.";
  }

  // Competitive comparison
  if (/better|compete|versus|vs|mcleod|samsara|keeptruckin|fleet.complete/i.test(lower)) {
    return "Unlike traditional TMS tools, ServiceOps AI is fully autonomous — it dispatches, negotiates, and communicates without manual input. $49/truck flat rate, no per-user fees, no feature gates. 30-day free trial to prove it.";
  }

  // Catch-all
  return "I can help with load assignments, rate analysis, HOS compliance, exception handling, fleet utilization, driver communication, and billing readiness. I also connect to your TMS, ELD, and load boards. What specifically do you need?";
}
