import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTypingEmitter } from "./useTypingEmitter";

const fake = vi.hoisted(() => ({ connected: true, volatile: { emit: vi.fn() } }));
vi.mock("../realtime/socket", () => ({ socket: fake }));

const calls = () => fake.volatile.emit.mock.calls.map(([ev, p]) => [ev, p.conversationId, p.typing]);
const advance = (ms) => act(() => { vi.advanceTimersByTime(ms); });

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
  fake.connected = true;
  fake.volatile.emit.mockClear();
});
afterEach(() => vi.useRealTimers());

describe("useTypingEmitter", () => {
  it("tells the other side as soon as typing starts", () => {
    const { result } = renderHook(() => useTypingEmitter("c1"));
    act(() => result.current.onInput("h"));
    expect(calls()).toEqual([["typing", "c1", true]]);
  });

  it("does not repeat the signal on every keystroke, only about every 2.5 seconds", () => {
    const { result } = renderHook(() => useTypingEmitter("c1"));
    act(() => result.current.onInput("h"));
    for (let i = 0; i < 4; i++) { advance(500); act(() => result.current.onInput("hello".slice(0, i + 2))); }
    expect(calls()).toHaveLength(1);
    advance(600);
    act(() => result.current.onInput("hello there"));
    expect(calls()).toEqual([["typing", "c1", true], ["typing", "c1", true]]);
  });

  it("says 'stopped' once after 3 seconds without typing", () => {
    const { result } = renderHook(() => useTypingEmitter("c1"));
    act(() => result.current.onInput("h"));
    advance(2900);
    expect(calls()).toHaveLength(1);
    advance(200);
    expect(calls()).toEqual([["typing", "c1", true], ["typing", "c1", false]]);
    advance(10000);
    expect(calls()).toHaveLength(2);
  });

  it("each keystroke postpones the 'stopped' signal", () => {
    const { result } = renderHook(() => useTypingEmitter("c1"));
    act(() => result.current.onInput("a"));
    advance(2000);
    act(() => result.current.onInput("ab"));
    advance(2000);
    expect(calls().filter((c) => c[2] === false)).toHaveLength(0);
    advance(1100);
    expect(calls().filter((c) => c[2] === false)).toHaveLength(1);
  });

  it("emptying the box stops immediately, and only once", () => {
    const { result } = renderHook(() => useTypingEmitter("c1"));
    act(() => result.current.onInput("h"));
    act(() => result.current.onInput(""));
    act(() => result.current.onInput(""));
    expect(calls()).toEqual([["typing", "c1", true], ["typing", "c1", false]]);
  });

  it("stop() sends nothing when the person was not typing", () => {
    const { result } = renderHook(() => useTypingEmitter("c1"));
    act(() => result.current.stop());
    expect(calls()).toEqual([]);
  });

  it("stop() after a message is sent says 'stopped'", () => {
    const { result } = renderHook(() => useTypingEmitter("c1"));
    act(() => result.current.onInput("hi"));
    act(() => result.current.stop());
    expect(calls()).toEqual([["typing", "c1", true], ["typing", "c1", false]]);
  });

  it("leaving the page while typing says 'stopped'", () => {
    const { result, unmount } = renderHook(() => useTypingEmitter("c1"));
    act(() => result.current.onInput("h"));
    unmount();
    expect(calls()).toEqual([["typing", "c1", true], ["typing", "c1", false]]);
  });

  it("switching conversation while typing stops the old one, not the new one", () => {
    const { result, rerender } = renderHook(({ id }) => useTypingEmitter(id), { initialProps: { id: "c1" } });
    act(() => result.current.onInput("h"));
    rerender({ id: "c2" });
    expect(calls()).toEqual([["typing", "c1", true], ["typing", "c1", false]]);
  });

  it("sends nothing while the live connection is down (never queued for later)", () => {
    fake.connected = false;
    const { result } = renderHook(() => useTypingEmitter("c1"));
    act(() => result.current.onInput("h"));
    advance(5000);
    expect(calls()).toEqual([]);
  });
});