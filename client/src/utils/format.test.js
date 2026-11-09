import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { money, daysLabel, revisionsLabel, publicName, statusLabel, formatBytes, dueText } from "./format";

describe("formatters", () => {
  it("formats money", () => {
    expect(money(120)).toBe("\u20B9120");
    expect(money(1234.5)).toBe("\u20B91,234.5");
    expect(money(undefined)).toBe("\u20B90");
  });
  it("labels days and revisions", () => {
    expect(daysLabel(1)).toBe("1 Day");
    expect(daysLabel(3)).toBe("3 Days");
    expect(revisionsLabel(-1)).toBe("Unlimited");
    expect(revisionsLabel(1)).toBe("1 Round");
    expect(revisionsLabel(2)).toBe("2 Rounds");
  });
  it("shortens reviewer names for privacy", () => {
    expect(publicName({ firstName: "Marcus", lastName: "Vance" })).toBe("Marcus V.");
  });
  it("shows the client-friendly label for delivered orders", () => {
    expect(statusLabel("delivered", "client")).toBe("Awaiting Review");
    expect(statusLabel("delivered", "freelancer")).toBe("Delivered");
    expect(statusLabel("completed", "client")).toBe("Completed");
  });
  it("formats file sizes", () => {
    expect(formatBytes(0)).toBe("");
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(25 * 1024 * 1024)).toBe("25 MB");
  });
});

describe("dueText", () => {
  const H = 3600000;
  const D = 24 * H;
  const from = (ms) => new Date(Date.now() + ms).toISOString();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("is empty without a date", () => expect(dueText(null)).toBe(""));
  it("counts whole days ahead", () => expect(dueText(from(3 * D))).toMatch(/^Due in 3 days/));
  it("says tomorrow between one and two days out", () => expect(dueText(from(1.5 * D))).toMatch(/^Due tomorrow/));
  it("says today with under a day left", () => expect(dueText(from(5 * H))).toMatch(/^Due today/));
  it("says overdue (not today) when slightly late", () => expect(dueText(from(-5 * H))).toMatch(/^Overdue \(/));
  it("counts overdue days", () => expect(dueText(from(-2 * D - H))).toMatch(/^Overdue 2d/));
});
