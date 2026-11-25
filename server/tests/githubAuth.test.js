import test from "node:test";
import assert from "node:assert/strict";
import { validationResult } from "express-validator";
import { githubAuthRules } from "../src/validators/auth.validators.js";

async function runValidation(body) {
  const req = { body };
  for (const rule of githubAuthRules) {
    await rule.run(req);
  }
  return validationResult(req);
}

test("githubAuthRules validator", async (t) => {
  await t.test("accepts valid idToken with valid email", async () => {
    const res = await runValidation({ idToken: "token-123", email: "user@example.com" });
    assert.equal(res.isEmpty(), true);
  });

  await t.test("accepts valid idToken when email is omitted", async () => {
    const res = await runValidation({ idToken: "token-123" });
    assert.equal(res.isEmpty(), true);
  });

  await t.test("accepts valid idToken when email is null (private GitHub email)", async () => {
    const res = await runValidation({ idToken: "token-123", email: null });
    assert.equal(res.isEmpty(), true);
  });

  await t.test("accepts valid idToken when email is an empty string", async () => {
    const res = await runValidation({ idToken: "token-123", email: "" });
    assert.equal(res.isEmpty(), true);
  });

  await t.test("rejects when idToken is missing", async () => {
    const res = await runValidation({ email: "user@example.com" });
    assert.equal(res.isEmpty(), false);
    assert.equal(res.array().some((e) => e.path === "idToken"), true);
  });

  await t.test("rejects when email is an invalid string format", async () => {
    const res = await runValidation({ idToken: "token-123", email: "not-an-email" });
    assert.equal(res.isEmpty(), false);
    assert.equal(res.array().some((e) => e.path === "email"), true);
  });
});
