import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateSellerLevel } from "../src/services/rating.service.js";

describe("calculateSellerLevel", () => {
  it("defaults new or low-activity sellers to rising tier", () => {
    assert.equal(calculateSellerLevel({ completedOrders: 0, ratingAverage: 0, ratingCount: 0 }), "rising");
    assert.equal(calculateSellerLevel({ completedOrders: 4, ratingAverage: 5.0, ratingCount: 4 }), "rising");
    assert.equal(calculateSellerLevel({ completedOrders: 10, ratingAverage: 3.8, ratingCount: 5 }), "rising");
  });

  it("upgrades to level2 when achieving 5+ orders, >= 4.0 rating and >= 1 review", () => {
    assert.equal(calculateSellerLevel({ completedOrders: 5, ratingAverage: 4.0, ratingCount: 1 }), "level2");
    assert.equal(calculateSellerLevel({ completedOrders: 8, ratingAverage: 4.3, ratingCount: 4 }), "level2");
  });

  it("upgrades to pro when achieving 10+ orders, >= 4.5 rating and >= 3 reviews", () => {
    assert.equal(calculateSellerLevel({ completedOrders: 10, ratingAverage: 4.5, ratingCount: 3 }), "pro");
    assert.equal(calculateSellerLevel({ completedOrders: 18, ratingAverage: 4.7, ratingCount: 8 }), "pro");
  });

  it("upgrades to top_rated when achieving 20+ orders, >= 4.8 rating and >= 5 reviews", () => {
    assert.equal(calculateSellerLevel({ completedOrders: 20, ratingAverage: 4.8, ratingCount: 5 }), "top_rated");
    assert.equal(calculateSellerLevel({ completedOrders: 50, ratingAverage: 4.9, ratingCount: 25 }), "top_rated");
  });
});
