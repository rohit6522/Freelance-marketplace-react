import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import InfoPage from "./InfoPage";
import { PAGES, PAGE_ORDER } from "../content/infoPages";

describe("InfoPage", () => {
  it.each(PAGE_ORDER)("renders the %s page with a heading and its sections", (key) => {
    render(<MemoryRouter><InfoPage pageKey={key} /></MemoryRouter>);
    expect(screen.getByRole("heading", { level: 1, name: PAGES[key].title })).toBeInTheDocument();
    PAGES[key].sections.forEach((s) => expect(screen.getByRole("heading", { level: 2, name: s.heading })).toBeInTheDocument());
  });

  it("marks the current page in the side navigation", () => {
    render(<MemoryRouter><InfoPage pageKey="terms" /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("aria-current", "page");
  });

  it("states that payments are simulated", () => {
    render(<MemoryRouter><InfoPage pageKey="escrow" /></MemoryRouter>);
    expect(screen.getByRole("note")).toHaveTextContent(/simulated/i);
  });
});