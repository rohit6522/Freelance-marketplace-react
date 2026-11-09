import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TRANSITIONS, applyTransition, revisionsLeft, nextStatusesFor } from "../src/services/order.service.js";

const order = (status, extra = {}) => ({ status, statusHistory: [], revisionsUsed: 0, packageSnapshot: { revisions: 2 }, ...extra });

describe("order workflow", () => {
  it("lets the freelancer accept a pending order and records history", () => {
    const o = order("pending");
    applyTransition(o, "freelancer", "in_progress", "user1", "Order accepted");
    assert.equal(o.status, "in_progress");
    assert.equal(o.statusHistory.length, 1);
    assert.equal(o.statusHistory[0].status, "in_progress");
    assert.equal(o.statusHistory[0].by, "user1");
  });

  it("rejects transitions that are not allowed (409)", () => {
    assert.throws(() => applyTransition(order("pending"), "client", "completed", "u", ""), (e) => e.statusCode === 409);
    assert.throws(() => applyTransition(order("completed"), "client", "cancelled", "u", ""), (e) => e.statusCode === 409);
  });

  it("rejects the wrong role (403)", () => {
    assert.throws(() => applyTransition(order("pending"), "client", "in_progress", "u", ""), (e) => e.statusCode === 403);
    assert.throws(() => applyTransition(order("delivered"), "freelancer", "completed", "u", ""), (e) => e.statusCode === 403);
  });

  it("does not change the order when a transition is refused", () => {
    const o = order("pending");
    assert.throws(() => applyTransition(o, "client", "completed", "u", ""));
    assert.equal(o.status, "pending");
    assert.equal(o.statusHistory.length, 0);
  });

  it("completed and cancelled orders are final", () => {
    assert.deepEqual(TRANSITIONS.completed, {});
    assert.deepEqual(TRANSITIONS.cancelled, {});
  });

  it("every other state has a way forward", () => {
    for (const s of ["pending", "in_progress", "delivered", "revision_requested"]) {
      assert.ok(Object.keys(TRANSITIONS[s]).length > 0, `${s} has no exits`);
    }
  });

  it("only the client can approve or ask for a revision on a delivery", () => {
    const o = order("delivered");
    assert.deepEqual(nextStatusesFor(o, "client").sort(), ["completed", "revision_requested"]);
    assert.deepEqual(nextStatusesFor(o, "freelancer"), []);
  });

  it("counts remaining revisions", () => {
    assert.equal(revisionsLeft(order("delivered", { revisionsUsed: 1 })), 1);
    assert.equal(revisionsLeft(order("delivered", { revisionsUsed: 5 })), 0);
    assert.equal(revisionsLeft(order("delivered", { packageSnapshot: { revisions: -1 } })), null); // unlimited
  });
});