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
    const messages: AICompletionRequest["messages"] = [
      { role: "system", content: "You are ARJUNA X. Be helpful, concise, and do not perform transactions without explicit user confirmation." },
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
