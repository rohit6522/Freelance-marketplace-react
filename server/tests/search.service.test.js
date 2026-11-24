import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  levenshtein,
  escapeRegex,
  findFuzzyMatch,
  correctQuery,
} from "../src/services/search.service.js";

describe("search.service", () => {
  it("calculates accurate Levenshtein distance", () => {
    assert.equal(levenshtein("react", "react"), 0);
    assert.equal(levenshtein("react", "reactt"), 1);
    assert.equal(levenshtein("desing", "design"), 2);
    assert.equal(levenshtein("", "node"), 4);
    assert.equal(levenshtein("figma", ""), 5);
  });

  it("escapes regex control characters safely", () => {
    assert.equal(escapeRegex("c++"), "c\\+\\+");
    assert.equal(escapeRegex("node.js (v18)"), "node\\.js \\(v18\\)");
    assert.equal(escapeRegex("price: $100?"), "price: \\$100\\?");
  });

  it("finds fuzzy matches for common typos and prefixes", () => {
    const dict = ["Design", "React", "WordPress", "Figma", "Fullstack"];

    // Typo within distance 2
    assert.equal(findFuzzyMatch("desing", dict), "Design");
    assert.equal(findFuzzyMatch("reactt", dict), "React");
    assert.equal(findFuzzyMatch("wordpres", dict), "WordPress");

    // Prefix match
    assert.equal(findFuzzyMatch("figm", dict), "Figma");

    // Exact match returns null (no typo)
    assert.equal(findFuzzyMatch("react", dict), null);

    // Completely different word returns null
    assert.equal(findFuzzyMatch("xyzabc", dict), null);
  });

  it("corrects multi-word query string when typos exist", () => {
    const dict = ["React", "Developer", "Figma", "Design"];

    const r1 = correctQuery("reactt developer", dict);
    assert.equal(r1.hasCorrection, true);
    assert.equal(r1.corrected.toLowerCase(), "react developer");

    const r2 = correctQuery("figm desing", dict);
    assert.equal(r2.hasCorrection, true);
    assert.equal(r2.corrected.toLowerCase(), "figma design");

    const r3 = correctQuery("react developer", dict);
    assert.equal(r3.hasCorrection, false);
    assert.equal(r3.corrected, "react developer");
  });
});
