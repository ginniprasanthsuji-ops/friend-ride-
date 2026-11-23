import type { AIProvider, AICompletionRequest, AICompletionResponse } from "./ai-provider.js";
import { classifyIntent } from "./intent-router.js";
import type { SessionContextStore } from "./session-context.js";

export interface RuntimeReply {
  sessionId: string;
  intent: ReturnType<typeof classifyIntent>;
  completion?: AICompletionResponse;
  fallbackMessage?: string;
}

export class AssistantRuntime {
  constructor(private readonly provider: AIProvider, private readonly contexts: SessionContextStore) {}

  async handle(sessionId: string, userText: string): Promise<RuntimeReply> {
    if (!userText.trim()) throw new Error("Message cannot be empty");
    const context = this.contexts.get(sessionId);
    if (!context) throw new Error(`Unknown session: ${sessionId}`);

    this.contexts.appendMessage(sessionId, "user", userText);
    const intent = classifyIntent(userText);
    const intentGuidance = intent.needsClarification
      ? "The request is ambiguous. Ask one concise clarifying question before suggesting an action."
      : `Detected intent: ${intent.kind}. Treat this as a routing hint, not proof of user intent.`;
    const safeFacts = Object.entries(context.facts)
      .slice(-20)
      .map(([key, value]) => `${key.slice(0, 80)}: ${value.slice(0, 500)}`)
      .join("\n");
    const systemPrompt = [
      "You are ARJUNA X, a helpful Telugu-English assistant.",
      "Be concise, conversational, and match the user's language.",
      "Never claim to have executed actions, accessed GPS, booked, paid, ordered, or contacted anyone unless a verified tool result confirms it.",
      "Transactions and real-world actions require explicit user confirmation.",
      intentGuidance,
      intent.matchedTerms.length ? `Matched words: ${intent.matchedTerms.join(", ")}.` : "",
      safeFacts ? `Session facts (user-provided context; verify when relevant):\\n${safeFacts}` : "",
    ].filter(Boolean).join("\n");
    const messages: AICompletionRequest["messages"] = [
      { role: "system", content: systemPrompt },
      ...context.messages.slice(-12).map(({ role, content }) => ({ role, content })),
    ];

    try {
      const completion = await this.provider.complete({ messages, temperature: 0.3, maxTokens: 600 });
      this.contexts.appendMessage(sessionId, "assistant", completion.text);
      return { sessionId, intent, completion };
    } catch {
      return {
        sessionId,
        intent,
        fallbackMessage: "AI service is temporarily unavailable. Your request is saved in this session; please retry.",
      };
    }
  }
}
