import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePWA } from "./usePWA";
import InstallAppButton from "../components/ui/InstallAppButton";

function TestConsumer() {
  const { isInstallable, isInstalled } = usePWA();
  return (
    <div>
      <span data-testid="installable">{String(isInstallable)}</span>
      <span data-testid="installed">{String(isInstalled)}</span>
      <InstallAppButton />
    </div>
  );
}

describe("usePWA & InstallAppButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("initially is not installable without beforeinstallprompt event", () => {
    render(<TestConsumer />);
    expect(screen.getByTestId("installable")).toHaveTextContent("false");
    expect(screen.queryByRole("button", { name: /install gigcraft app/i })).toBeNull();
  });

  it("becomes installable when beforeinstallprompt event fires", async () => {
    const user = userEvent.setup();
    render(<TestConsumer />);

    const mockPrompt = vi.fn();
    const event = new Event("beforeinstallprompt");
    event.prompt = mockPrompt;
    event.userChoice = Promise.resolve({ outcome: "accepted" });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(screen.getByTestId("installable")).toHaveTextContent("true");
    const installBtn = screen.getByRole("button", { name: /install gigcraft app/i });
    expect(installBtn).toBeInTheDocument();

    await user.click(installBtn);
    expect(mockPrompt).toHaveBeenCalled();
  });
});
