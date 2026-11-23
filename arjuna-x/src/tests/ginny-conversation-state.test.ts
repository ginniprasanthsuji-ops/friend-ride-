import { describe, expect, it } from "vitest";
import { createGinnyConversation, updateGinnyConversation } from "../core/ginny-conversation-state";
const user = { id: "u1", role: "user" as const, text: "Hi Ginny", language: "en" as const, timestamp: 1 };
const assistant = { id: "a1", role: "assistant" as const, text: "Hello!", language: "en" as const, timestamp: 2 };
describe("Ginny conversation reducer", () => {
  it("adds a user message and tracks sending state", () => {
    const s = updateGinnyConversation(createGinnyConversation("sid"), { type: "submit-user-message", message: user });
    expect(s.status).toBe("sending"); expect(s.messages).toHaveLength(1);
  });
  it("accepts assistant response only during active send", () => {
    let s = updateGinnyConversation(createGinnyConversation("sid"), { type: "submit-user-message", message: user });
    s = updateGinnyConversation(s, { type: "assistant-response", message: assistant });
    expect(s.status).toBe("idle"); expect(s.messages).toHaveLength(2);
    expect(updateGinnyConversation(createGinnyConversation("sid"), { type: "assistant-response", message: assistant }).messages).toHaveLength(0);
  });
  it("ignores late responses after cancel", () => {
    let s = updateGinnyConversation(createGinnyConversation("sid"), { type: "submit-user-message", message: user });
    s = updateGinnyConversation(s, { type: "cancel" });
    s = updateGinnyConversation(s, { type: "assistant-response", message: assistant });
    expect(s.status).toBe("cancelled"); expect(s.messages).toHaveLength(1);
  });
  it("rejects concurrent submit and trims message text", () => {
    let s = updateGinnyConversation(createGinnyConversation("sid"), { type: "submit-user-message", message: user });
    const concurrent = updateGinnyConversation(s, { type: "submit-user-message", message: { ...user, id: "u2" } });
    expect(concurrent).toBe(s);
    s = updateGinnyConversation(createGinnyConversation("sid"), { type: "submit-user-message", message: { ...user, text: "  hi  " } });
    expect(s.messages[0].text).toBe("hi");
  });
  it("caps message history and errors, and supports reset", () => {
    let s = createGinnyConversation("sid");
    for (let i = 0; i < 60; i++) {
      s = updateGinnyConversation(s, { type: "submit-user-message", message: { ...user, id: "u" + i, timestamp: i } });
      s = updateGinnyConversation(s, { type: "assistant-response", message: { ...assistant, id: "a" + i, timestamp: i } });
    }
    expect(s.messages.length).toBe(100);
    s = updateGinnyConversation(s, { type: "failure", error: "x".repeat(1000) }); expect(s.error?.length).toBe(500);
    s = updateGinnyConversation(s, { type: "reset" }); expect(s.messages).toHaveLength(0); expect(s.status).toBe("idle");
  });
});
