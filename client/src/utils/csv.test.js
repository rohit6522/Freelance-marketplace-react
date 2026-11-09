import { describe, it, expect } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("quotes cells and escapes quotes", () => {
    expect(toCsv([["a", 'say "hi"']])).toBe('"a","say ""hi"""');
  });
  it("neutralises spreadsheet formulas", () => {
    expect(toCsv([["=1+1", "+x", "-y", "@z", "ok"]])).toBe(`"'=1+1","'+x","'-y","'@z","ok"`);
  });
  it("handles empty values and zero", () => {
    expect(toCsv([[null, undefined, 0]])).toBe('"","","0"');
  });
  it("joins rows with newlines", () => {
    expect(toCsv([["a"], ["b"]])).toBe('"a"\n"b"');
  });
});