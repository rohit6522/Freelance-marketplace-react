import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "./ThemeContext";
import ThemeToggle from "../components/ui/ThemeToggle";

function TestConsumer() {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={toggleTheme}>Toggle</button>
      <button onClick={() => setTheme("dark")}>SetDark</button>
      <button onClick={() => setTheme("light")}>SetLight</button>
    </div>
  );
}

describe("ThemeContext & ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("defaults to system theme and adapts to media query", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("system");
  });

  it("toggles between light and dark modes", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestConsumer />
        <ThemeToggle />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByRole("button", { name: /switch to dark mode|switch to light mode/i });
    expect(toggleBtn).toBeInTheDocument();

    await user.click(toggleBtn);
    expect(localStorage.getItem("gigcraft-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await user.click(toggleBtn);
    expect(localStorage.getItem("gigcraft-theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
