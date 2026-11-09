import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeBody } from "../src/middleware/sanitize.js";
import { pick } from "../src/utils/pick.js";

const run = (body) => {
  const req = { body };
  let called = false;
  sanitizeBody(req, {}, () => { called = true; });
  return { req, called };
};

describe("sanitizeBody", () => {
  it("removes MongoDB operator keys at any depth", () => {
    const { req, called } = run({ email: { $ne: "" }, nested: { a: 1, $where: "x" }, list: [{ $gt: 1, ok: true }] });
    assert.deepEqual(req.body, { email: {}, nested: { a: 1 }, list: [{ ok: true }] });
    assert.ok(called);
  });

  it("removes dotted keys", () => {
    assert.deepEqual(run({ "a.b": 1, ok: 2 }).req.body, { ok: 2 });
  });

  it("keeps normal data unchanged", () => {
    const body = { title: "Hello", tags: ["a", "b"], price: 10, nested: { x: true } };
    assert.deepEqual(run(body).req.body, body);
  });

  it("copes with a missing body", () => {
    assert.ok(run(undefined).called);
  });
});

describe("pick", () => {
  it("keeps only whitelisted, defined fields", () => {
    assert.deepEqual(pick({ a: 1, b: 2, c: undefined, role: "admin" }, ["a", "c", "d"]), { a: 1 });
  });

  it("handles a missing object", () => {
    assert.deepEqual(pick(undefined, ["a"]), {});
  });
});