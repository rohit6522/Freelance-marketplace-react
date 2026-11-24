import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SearchBox from "./SearchBox";
import { gigService } from "../../services/gigService";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../services/gigService", () => ({
  gigService: {
    getSuggestions: vi.fn(),
  },
}));

describe("SearchBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input and button correctly", () => {
    render(
      <MemoryRouter>
        <SearchBox />
      </MemoryRouter>
    );

    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/search services, talent, or gigs/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("navigates on search form submit", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchBox />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/search services, talent, or gigs/i);
    await user.type(input, "fullstack");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/explore?q=fullstack");
  });

  it("displays suggestions dropdown including 'Did you mean' and categories", async () => {
    gigService.getSuggestions.mockResolvedValueOnce({
      query: "reactt",
      didYouMean: "react",
      categories: [{ _id: "c1", name: "Web Development", slug: "web-dev", icon: "code" }],
      tags: ["React", "Redux"],
      gigs: [
        {
          _id: "g1",
          title: "Fullstack React Developer",
          startingPrice: 2000,
          ratingAverage: 4.9,
          thumbnail: "",
        },
      ],
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SearchBox />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/search services, talent, or gigs/i);
    await user.type(input, "reactt");

    await waitFor(() => {
      expect(screen.getByText(/did you mean:/i)).toBeInTheDocument();
      expect(screen.getByText("react")).toBeInTheDocument();
      expect(screen.getByText("Web Development")).toBeInTheDocument();
      expect(screen.getByText("#React")).toBeInTheDocument();
      expect(screen.getByText("Fullstack React Developer")).toBeInTheDocument();
    });

    // Clicking didYouMean suggestion navigates to corrected query
    await user.click(screen.getByText("react"));
    expect(mockNavigate).toHaveBeenCalledWith("/explore?q=react");
  });
});
