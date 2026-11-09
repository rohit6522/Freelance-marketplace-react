import { describe, it, expect } from "vitest";
import { assessPassword } from "./passwordStrength";

describe("assessPassword", () => {
  it("returns None for an empty value", () => {
    expect(assessPassword("")).toEqual({ score: 0, label: "None" });
  });
  it("rates short passwords as Fair", () => {
    expect(assessPassword("abc")).toEqual({ score: 1, label: "Fair" });
  });
  it("rates 8+ plain characters as Fair", () => {
    expect(assessPassword("abcdefgh").label).toBe("Fair");
  });
  it("rates 10+ characters with upper case and a digit as Strong", () => {
    expect(assessPassword("Abcdefgh12")).toEqual({ score: 2, label: "Strong" });
  });
  it("rates 12+ characters with a symbol as Enterprise Grade", () => {
    expect(assessPassword("Abcdefgh12!x")).toEqual({ score: 3, label: "Enterprise Grade" });
  });
});