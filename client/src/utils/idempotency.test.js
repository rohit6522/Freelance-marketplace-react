import { describe, it, expect, afterEach, vi } from "vitest";
import { newIdempotencyKey } from "./idempotency";

const SERVER_FORMAT = /^[A-Za-z0-9_-]{8,64}$/; // the rule the API applies to the Idempotency-Key header

afterEach(() => vi.unstubAllGlobals());

describe("newIdempotencyKey", () => {
  it("produces a UUID that passes the server's format rule", () => {
    const key = newIdempotencyKey();
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(key).toMatch(SERVER_FORMAT);
  });

  it("is different every time", () => {
    const keys = new Set(Array.from({ length: 200 }, () => newIdempotencyKey()));
    expect(keys.size).toBe(200);
  });

  it("falls back to random hex when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", { getRandomValues: (arr) => globalThis.crypto && arr.fill(7) });
    const key = newIdempotencyKey();
    expect(key).toBe("07".repeat(16));
    expect(key).toMatch(SERVER_FORMAT);
  });

  it("still works when the crypto API is missing entirely", () => {
    vi.stubGlobal("crypto", undefined);
    const key = newIdempotencyKey();
    expect(key).toMatch(/^[0-9a-f]{32}$/);
    expect(key).toMatch(SERVER_FORMAT);
  });
});