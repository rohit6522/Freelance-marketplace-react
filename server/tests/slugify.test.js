import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { slugify } from "../src/utils/slugify.js";

describe("slugify", () => {
  it("builds URL-safe slugs", () => {
    assert.equal(slugify("Graphics & Design"), "graphics-and-design");
    assert.equal(slugify("Data & AI"), "data-and-ai");
    assert.equal(slugify("  Web  Development "), "web-development");
    assert.equal(slugify("C++/Rust"), "c-rust");
  });

  it("treats '&' and 'and' alike, which is why look-alike names clash", () => {
    assert.equal(slugify("Data & AI"), slugify("Data and AI"));
  });

  it("never starts or ends with a dash", () => {
    assert.equal(slugify("--Hello--"), "hello");
  });

  it("returns an empty string when there are no letters or digits", () => {
    assert.equal(slugify("***"), "");
  });
});