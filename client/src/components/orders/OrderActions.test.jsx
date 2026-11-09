import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderActions from "./OrderActions";
import { orderService } from "../../services/orderService";

vi.mock("../../services/orderService", () => ({
  orderService: { accept: vi.fn(), complete: vi.fn(), cancel: vi.fn(), requestRevision: vi.fn(), deliver: vi.fn() },
}));

const baseOrder = { _id: "o1", status: "delivered", price: 280 };
const perms = (over = {}) => ({ nextStatuses: [], revisionsLeft: null, canReview: false, ...over });
const renderActions = (props) =>
  render(<OrderActions order={baseOrder} role="client" permissions={perms()} onChanged={() => {}} {...props} />);

beforeEach(() => vi.clearAllMocks());

describe("OrderActions", () => {
  it("offers a client approve, revision and cancel on a delivered order", () => {
    renderActions({ permissions: perms({ nextStatuses: ["completed", "revision_requested", "cancelled"], revisionsLeft: 2 }) });
    expect(screen.getByRole("button", { name: /approve & release funds \(\u20B9280\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /request revision\s*\(2 left\)/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /cancel order/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /accept order/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /deliver work/i })).not.toBeInTheDocument();
  });

  it("disables the revision button when none are left", () => {
    renderActions({ permissions: perms({ nextStatuses: ["completed", "revision_requested"], revisionsLeft: 0 }) });
    expect(screen.getByRole("button", { name: /no revisions left/i })).toBeDisabled();
  });

  it("lets a freelancer accept or reject a pending order", () => {
    renderActions({
      role: "freelancer",
      order: { ...baseOrder, status: "pending" },
      permissions: perms({ nextStatuses: ["in_progress", "cancelled"] }),
    });
    expect(screen.getByRole("button", { name: /accept order/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject order/i })).toBeInTheDocument();
  });

  it("lets a freelancer deliver, or re-deliver after a revision request", () => {
    const { unmount } = renderActions({
      role: "freelancer",
      order: { ...baseOrder, status: "in_progress" },
      permissions: perms({ nextStatuses: ["delivered", "cancelled"] }),
    });
    expect(screen.getByRole("button", { name: /deliver work/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel order/i })).toBeInTheDocument();
    unmount();

    renderActions({
      role: "freelancer",
      order: { ...baseOrder, status: "revision_requested" },
      permissions: perms({ nextStatuses: ["delivered", "cancelled"] }),
    });
    expect(screen.getByRole("button", { name: /submit revision/i })).toBeInTheDocument();
  });

  it("offers a review once the order is complete and not yet reviewed", () => {
    renderActions({ order: { ...baseOrder, status: "completed" }, permissions: perms({ canReview: true }) });
    expect(screen.getByRole("button", { name: /leave a review/i })).toBeInTheDocument();
  });

  it("says so when there is nothing to do", () => {
    renderActions({ order: { ...baseOrder, status: "completed" } });
    expect(screen.getByText(/no actions available/i)).toBeInTheDocument();
  });

  it("asks for confirmation before releasing funds, then calls the API", async () => {
    orderService.complete.mockResolvedValue({});
    const onChanged = vi.fn();
    const user = userEvent.setup();
    renderActions({ permissions: perms({ nextStatuses: ["completed"] }), onChanged });

    await user.click(screen.getByRole("button", { name: /approve & release funds/i }));
    expect(orderService.complete).not.toHaveBeenCalled(); // nothing happens until confirmed

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /approve & release/i }));

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(orderService.complete).toHaveBeenCalledWith("o1");
  });
});

  