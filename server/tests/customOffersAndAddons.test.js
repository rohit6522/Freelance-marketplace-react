import test from "node:test";
import assert from "node:assert/strict";
import { customOfferRules } from "../src/validators/conversation.validators.js";
import { createOrderRules } from "../src/validators/order.validators.js";
import { validationResult } from "express-validator";

async function runRules(rules, body) {
  const req = { body };
  for (const rule of rules) {
    await rule.run(req);
  }
  return validationResult(req);
}

test("Custom Offers and Add-ons Specifications", async (t) => {
  await t.test("customOfferRules validates title, description, price, deliveryDays", async () => {
    const invalid = await runRules(customOfferRules, {
      title: "Hi",
      description: "Short",
      price: 20, // Min is 50
      deliveryDays: 0,
    });
    assert.equal(invalid.isEmpty(), false);
    const errors = invalid.array().map((e) => e.path);
    assert.equal(errors.includes("title"), true);
    assert.equal(errors.includes("description"), true);
    assert.equal(errors.includes("price"), true);
    assert.equal(errors.includes("deliveryDays"), true);

    const valid = await runRules(customOfferRules, {
      title: "Full Website Redesign",
      description: "Complete design overhaul in Figma with 5 pages and mobile mockups.",
      price: 4500,
      deliveryDays: 5,
      revisions: 2,
    });
    assert.equal(valid.isEmpty(), true);
  });

  await t.test("createOrderRules accepts optional addonIds array", async () => {
    const res = await runRules(createOrderRules, {
      gigId: "507f1f77bcf86cd799439011",
      tier: "standard",
      requirements: "Here are all my project requirements in full detail for the developer.",
      expectedPrice: 1500,
      addonIds: ["607f1f77bcf86cd799439012"],
    });
    assert.equal(res.isEmpty(), true);
  });
});
