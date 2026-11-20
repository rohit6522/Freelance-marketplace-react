import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { RealtimeProvider } from "./RealtimeContext";
import { useRealtime } from "../hooks/useRealtime";

const { fake, auth } = vi.hoisted(() => {
  const handlers = {};
  return {
    auth: { user: { _id: "u1" } },
    fake: {
      on: (e, fn) => { (handlers[e] ||= new Set()).add(fn); },
      off: (e, fn) => { handlers[e]?.delete(fn); },
      receive: (e, ...args) => { [...(handlers[e] || [])].forEach((fn) => fn(...args)); },
      connect: vi.fn(),
      disconnect: vi.fn(),
    },
  };
});
vi.mock("../realtime/socket", () => ({ socket: fake }));
vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ user: auth.user }) }));

function Probe() {
  const { connected } = useRealtime();
  return <div>{connected ? "live" : "offline"}</div>;
}
const mount = () => render(<RealtimeProvider><Probe /></RealtimeProvider>);

beforeEach(() => {
  vi.useFakeTimers();
  auth.user = { _id: "u1" };
  fake.connect.mockClear();
  fake.disconnect.mockClear();
});
afterEach(() => vi.useRealTimers());

describe("RealtimeProvider", () => {
  it("connects when logged in and follows the connection state", () => {
    mount();
    expect(fake.connect).toHaveBeenCalledTimes(1);
    expect(screen.getByText("offline")).toBeInTheDocument();
    act(() => fake.receive("connect"));
    expect(screen.getByText("live")).toBeInTheDocument();
    act(() => fake.receive("disconnect", "transport close"));
    expect(screen.getByText("offline")).toBeInTheDocument();
  });

  it("does not connect when logged out", () => {
    auth.user = null;
    mount();
    expect(fake.connect).not.toHaveBeenCalled();
    expect(fake.disconnect).toHaveBeenCalled();
  });

  it("reconnects by itself after the SERVER closes the connection on purpose", () => {
    mount();
    act(() => fake.receive("connect"));
    fake.connect.mockClear();
    act(() => fake.receive("disconnect", "io server disconnect"));
    expect(fake.connect).toHaveBeenCalledTimes(1);
  });

  it("leaves ordinary network drops to the library's own retry", () => {
    mount();
    act(() => fake.receive("connect"));
    fake.connect.mockClear();
    act(() => fake.receive("disconnect", "transport close"));
    act(() => fake.receive("disconnect", "ping timeout"));
    expect(fake.connect).not.toHaveBeenCalled();
  });

  it("retries a rejected login with growing delays, then gives up after 5 tries", () => {
    mount();
    fake.connect.mockClear();
    const delays = [2000, 4000, 6000, 8000, 10000];
    delays.forEach((ms) => {
      act(() => fake.receive("connect_error", new Error("unauthorized")));
      act(() => { vi.advanceTimersByTime(ms - 1); });
      expect(fake.connect).toHaveBeenCalledTimes(delays.indexOf(ms));
      act(() => { vi.advanceTimersByTime(1); });
      expect(fake.connect).toHaveBeenCalledTimes(delays.indexOf(ms) + 1);
    });
    act(() => fake.receive("connect_error", new Error("unauthorized")));
    act(() => { vi.advanceTimersByTime(60000); });
    expect(fake.connect).toHaveBeenCalledTimes(5);
  });

  it("a successful connection resets the retry counter", () => {
    mount();
    fake.connect.mockClear();
    act(() => fake.receive("connect_error", new Error("unauthorized")));
    act(() => { vi.advanceTimersByTime(2000); });
    act(() => fake.receive("connect"));
    act(() => fake.receive("connect_error", new Error("unauthorized")));
    act(() => { vi.advanceTimersByTime(2000); }); // back to the first, shortest delay
    expect(fake.connect).toHaveBeenCalledTimes(2);
  });
});