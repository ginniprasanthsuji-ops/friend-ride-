export interface ContextMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface SessionContext {
  sessionId: string;
  messages: ContextMessage[];
  facts: Record<string, string>;
  updatedAt: string;
}

/** In-memory context store. Each session ID maps to an independent context. */
export class SessionContextStore {
  constructor(private readonly maxMessagesPerSession = 100, private readonly maxMessageChars = 8000) {
    if (!Number.isInteger(maxMessagesPerSession) || maxMessagesPerSession < 1) throw new Error("maxMessagesPerSession must be a positive integer");
    if (!Number.isInteger(maxMessageChars) || maxMessageChars < 1) throw new Error("maxMessageChars must be a positive integer");
  }
  private readonly sessions = new Map<string, SessionContext>();

  create(sessionId: string): SessionContext {
    if (!sessionId.trim()) throw new Error("sessionId is required");
    if (this.sessions.has(sessionId)) throw new Error("Session already exists");
    const context: SessionContext = {
      sessionId,
      messages: [],
      facts: {},
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, context);
    return context;
  }

  get(sessionId: string): SessionContext | undefined {
    return this.sessions.get(sessionId);
  }

  /** Returns a bounded, detached history window for prompt construction. */
  getRecentMessages(sessionId: string, limit = 12): ContextMessage[] {
    if (!Number.isInteger(limit) || limit < 0 || limit > this.maxMessagesPerSession) {
      throw new Error(`limit must be an integer between 0 and ${this.maxMessagesPerSession}`);
    }
    return this.requireSession(sessionId).messages.slice(-limit).map((message) => ({ ...message }));
  }

  /** Returns a detached bounded fact snapshot, preventing callers from mutating session state. */
  getFactsSnapshot(sessionId: string, maxFacts = 20, maxValueChars = 500): Record<string, string> {
    if (!Number.isInteger(maxFacts) || maxFacts < 0 || maxFacts > 100) throw new Error("maxFacts must be between 0 and 100");
    if (!Number.isInteger(maxValueChars) || maxValueChars < 1 || maxValueChars > this.maxMessageChars) throw new Error("maxValueChars is out of bounds");
    return Object.fromEntries(
      Object.entries(this.requireSession(sessionId).facts).slice(-maxFacts)
        .map(([key, value]) => [key.slice(0, 80), value.slice(0, maxValueChars)]),
    );
  }

  appendMessage(sessionId: string, role: ContextMessage["role"], content: string): ContextMessage {
    const context = this.requireSession(sessionId);
    if (typeof content !== "string" || !content.trim()) throw new Error("Message content cannot be empty");
    if (content.length > this.maxMessageChars) throw new Error(`Message exceeds ${this.maxMessageChars} character limit`);
    const message = { role, content, timestamp: new Date().toISOString() } satisfies ContextMessage;
    context.messages.push(message);
    if (context.messages.length > this.maxMessagesPerSession) {
      context.messages.splice(0, context.messages.length - this.maxMessagesPerSession);
    }
    context.updatedAt = message.timestamp;
    return message;
  }

  setFact(sessionId: string, key: string, value: string): void {
    const context = this.requireSession(sessionId);
    if (typeof key !== "string" || !key.trim() || key.length > 200) throw new Error("Fact key must be non-empty and at most 200 characters");
    if (typeof value !== "string" || !value.trim() || value.length > this.maxMessageChars) throw new Error("Fact value must be non-empty and within the message limit");
    context.facts[key.trim()] = value;
    context.updatedAt = new Date().toISOString();
  }

  clear(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  private requireSession(sessionId: string): SessionContext {
    const context = this.sessions.get(sessionId);
    if (!context) throw new Error(`Unknown session: ${sessionId}`);
    return context;
  }
}
