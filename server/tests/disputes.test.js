import test from "node:test";
import assert from "node:assert/strict";
import { ORDER_STATUSES } from "../src/models/Order.js";
import { disputeRules } from "../src/validators/order.validators.js";
import { resolveDisputeRules } from "../src/validators/admin.validators.js";
import { validationResult } from "express-validator";

async function runRules(rules, body) {
  const req = { body };
  for (const rule of rules) {
    await rule.run(req);
  }
  return validationResult(req);
}

test("Disputes & Admin Refund Specifications", async (t) => {
  await t.test("ORDER_STATUSES includes 'disputed'", () => {
    assert.equal(ORDER_STATUSES.includes("disputed"), true);
  });

  await t.test("disputeRules requires at least 10 characters reason", async () => {
    const invalid = await runRules(disputeRules, { reason: "Too short" });
    assert.equal(invalid.isEmpty(), false);
    assert.equal(invalid.array().some((e) => e.path === "reason"), true);

    const valid = await runRules(disputeRules, { reason: "The seller did not deliver the agreed features and stopped responding." });
    assert.equal(valid.isEmpty(), true);
  });

  await t.test("resolveDisputeRules validates action values", async () => {
    const invalidAction = await runRules(resolveDisputeRules, { action: "invalid_action" });
    assert.equal(invalidAction.isEmpty(), false);

    const refund = await runRules(resolveDisputeRules, { action: "refund", note: "Client is in the right" });
    assert.equal(refund.isEmpty(), true);

    const release = await runRules(resolveDisputeRules, { action: "release", note: "Work was verified" });
    assert.equal(release.isEmpty(), true);

    const dismiss = await runRules(resolveDisputeRules, { action: "dismiss" });
    assert.equal(dismiss.isEmpty(), true);
  });
});
