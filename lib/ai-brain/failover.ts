// ═══════════════════════════════════════════════════════════════
// FAILOVER HANDLER — Try models in order until one succeeds
// ═══════════════════════════════════════════════════════════════

import { getFailoverChain, type ModelConfig, type TaskComplexity } from "./model-router";

type LLMResponse = {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callModel(
  model: ModelConfig,
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
): Promise<LLMResponse> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://serviceops-ai.vercel.app",
      "X-Title": "ServiceOps AI",
    },
    body: JSON.stringify({
      model: model.id,
      temperature: 0.2,
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "unknown");
    throw new Error(`Model ${model.id} failed (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error(`Model ${model.id} returned empty response`);

  return {
    content,
    model: model.id,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
  };
}

export async function callWithFailover(
  complexity: TaskComplexity,
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
): Promise<LLMResponse & { attempts: number }> {
  const chain = getFailoverChain(complexity);
  let lastError: Error | null = null;

  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    try {
      const response = await callModel(model, systemPrompt, userPrompt, apiKey);
      return { ...response, attempts: i + 1 };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[AI-Failover] Model ${model.id} failed, trying next...`);
    }
  }

  throw new Error(`All models failed. Last error: ${lastError?.message}`);
}
