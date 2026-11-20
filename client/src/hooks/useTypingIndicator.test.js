import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTypingIndicator } from "./useTypingIndicator";

const fake = vi.hoisted(() => {
  const handlers = {};
  return {
    on: (e, fn) => { (handlers[e] ||= new Set()).add(fn); },
    off: (e, fn) => { handlers[e]?.delete(fn); },
    receive: (e, p) => { [...(handlers[e] || [])].forEach((fn) => fn(p)); },
    listeners: (e) => handlers[e]?.size || 0,
  };
});
vi.mock("../realtime/socket", () => ({ socket: fake }));

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const typing = (conversationId, value = true) => act(() => fake.receive("typing", { conversationId, userId: "u", typing: value }));

describe("useTypingIndicator", () => {
  it("shows typing for this conversation and hides it when they stop", () => {
    const { result } = renderHook(() => useTypingIndicator("c1"));
    expect(result.current.otherTyping).toBe(false);
    typing("c1", true);
    expect(result.current.otherTyping).toBe(true);
    typing("c1", false);
    expect(result.current.otherTyping).toBe(false);
  });

  it("ignores events for other conversations and malformed payloads", () => {
    const { result } = renderHook(() => useTypingIndicator("c1"));
    typing("c2", true);
    act(() => fake.receive("typing", null));
    act(() => fake.receive("typing", { typing: true }));
    expect(result.current.otherTyping).toBe(false);
  });

  it("hides itself after 6 seconds if the 'stopped' event never arrives", () => {
    const { result } = renderHook(() => useTypingIndicator("c1"));
    typing("c1", true);
    act(() => { vi.advanceTimersByTime(5900); });
    expect(result.current.otherTyping).toBe(true);
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current.otherTyping).toBe(false);
  });

  it("a repeated 'typing' event keeps it showing past the first 6 seconds", () => {
    const { result } = renderHook(() => useTypingIndicator("c1"));
    typing("c1", true);
    act(() => { vi.advanceTimersByTime(4000); });
    typing("c1", true);
    act(() => { vi.advanceTimersByTime(4000); });
    expect(result.current.otherTyping).toBe(true);
  });

  it("clearTyping() hides it straight away (used when their message arrives)", () => {
    const { result } = renderHook(() => useTypingIndicator("c1"));
    typing("c1", true);
    act(() => result.current.clearTyping());
    expect(result.current.otherTyping).toBe(false);
  });

  it("resets when you switch to another conversation, and cleans up its listener", () => {
    const { result, rerender, unmount } = renderHook(({ id }) => useTypingIndicator(id), { initialProps: { id: "c1" } });
    typing("c1", true);
    rerender({ id: "c2" });
    expect(result.current.otherTyping).toBe(false);
    typing("c1", true); // old conversation: ignored
    expect(result.current.otherTyping).toBe(false);
    unmount();
    expect(fake.listeners("typing")).toBe(0);
  });
});