import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PlatformStatsPanel from "./PlatformStatsPanel";
import { publicService } from "../../services/publicService";

vi.mock("../../services/publicService", () => ({ publicService: { stats: vi.fn() } }));

const stats = {
  freelancers: 3, gigs: 6, completedOrders: 4,
  reviews: { count: 2, average: 4.5 }, simulatedVolume: 1840,
  latestReview: { rating: 5, comment: "Great work and fast", author: "Marcus V.", gigTitle: "Landing page" },
};

beforeEach(() => publicService.stats.mockClear());

describe("PlatformStatsPanel", () => {
  it("shows live numbers and the latest review", async () => {
    publicService.stats.mockResolvedValue(stats);
    render(<PlatformStatsPanel />);
    expect(await screen.findByText("$1,840")).toBeInTheDocument();
    expect(screen.getByText("4.5 ★")).toBeInTheDocument();
    expect(screen.getByText(/Great work and fast/)).toBeInTheDocument();
    expect(screen.getByText("LIVE DATA")).toBeInTheDocument();
  });

  it("hides the review quote in compact mode", async () => {
    publicService.stats.mockResolvedValue(stats);
    render(<PlatformStatsPanel compact />);
    await screen.findByText("$1,840");
    expect(screen.queryByText(/Great work and fast/)).not.toBeInTheDocument();
  });

  it("shows a dash instead of a rating when there are no reviews", async () => {
    publicService.stats.mockResolvedValue({ ...stats, reviews: { count: 0, average: 0 }, latestReview: null });
    render(<PlatformStatsPanel />);
    await screen.findByText("$1,840");
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("says stats are unavailable when the request fails", async () => {
    publicService.stats.mockRejectedValue(new Error("down"));
    render(<PlatformStatsPanel />);
    expect(await screen.findByText(/stats are unavailable/i)).toBeInTheDocument();
  });
});