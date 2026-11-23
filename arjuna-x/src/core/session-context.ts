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
    context.facts[key] = value;
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
