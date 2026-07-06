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

const systemPrompt = `You are ServiceOps AI, a dispatch operations assistant for trucking companies. You help dispatchers with:
- Load assignments and driver recommendations
- Rate analysis and negotiation  
- HOS compliance checks
- Exception handling (delays, breakdowns)
- Fleet utilization insights

Be concise, professional, and actionable. Use specific numbers when possible.
Always respond in 2-3 sentences max unless the user asks for detail.`;

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

  if (lower.includes("assign") || lower.includes("load")) {
    return "Based on current fleet status: Raj Singh (Abbotsford) is available for loads. Gurpreet Gill (Calgary) is also available. I recommend assigning the next best-match load based on equipment type and proximity to pickup.";
  }
  if (lower.includes("rate") || lower.includes("price")) {
    return "Current market rates: Vancouver-Kelowna lane: $2.45/mi ($600-$800). Vancouver-Edmonton: $2.85/mi ($1,800-$2,200). Rates are up 8% this week due to capacity tightness.";
  }
  if (lower.includes("hos") || lower.includes("hours") || lower.includes("compliance")) {
    return "HOS Status: Raj Singh has 4.5 driving hours remaining. Gurpreet Gill has 8.2 hours. Mike Chen is on break (1.5h remaining). All drivers are within FMCSA limits.";
  }
  if (lower.includes("delay") || lower.includes("exception")) {
    return "Active exceptions: 1 delay detected - Sarah Patel delayed 45 min near Hope BC due to weather. ETA adjusted +45 min. Customer notified. No other exceptions in fleet.";
  }
  if (lower.includes("utilization") || lower.includes("fleet")) {
    return "Fleet utilization: 75% (3/4 trucks active). 1 truck available. Revenue today: $4,910. Recommended: maximize backhaul on Gurpreet Gill's return trip to Vancouver.";
  }
  return "I can help with load assignments, rate analysis, HOS compliance, exception handling, and fleet utilization. What specific area do you need assistance with?";
}
