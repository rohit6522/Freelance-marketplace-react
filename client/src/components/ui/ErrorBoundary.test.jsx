import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

function Boom({ explode }) {
  if (explode) throw new Error("kaboom");
  return <div>All good</div>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {})); // React logs caught errors
  afterEach(() => vi.restoreAllMocks());

  it("renders its children normally", () => {
    render(<ErrorBoundary><Boom explode={false} /></ErrorBoundary>);
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("shows a fallback with a reload button when a child crashes", () => {
    render(<ErrorBoundary><Boom explode /></ErrorBoundary>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument();
  });

  it("recovers when the reset key changes (navigating away)", () => {
    const { rerender } = render(<ErrorBoundary resetKey="a"><Boom explode /></ErrorBoundary>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(<ErrorBoundary resetKey="b"><Boom explode={false} /></ErrorBoundary>);
    expect(screen.getByText("All good")).toBeInTheDocument();
  });
});