export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AICompletionResponse {
  text: string;
  provider: string;
  model: string;
  usage?: { inputTokens?: number; outputTokens?: number };
}

export interface AIProvider {
  readonly providerName: string;
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
}

/** Safe deterministic mock for tests and local development. Never calls external services. */
export class MockAIProvider implements AIProvider {
  readonly providerName = "mock";

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const latestUser = [...request.messages].reverse().find((message) => message.role === "user");
    return {
      text: latestUser ? `Mock response: ${latestUser.content}` : "Mock response: no user message provided.",
      provider: this.providerName,
      model: "mock-v1",
    };
  }
}
