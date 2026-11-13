import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryFormModal from "./CategoryFormModal";
import { adminService } from "../../services/adminService";
import { refreshCategories } from "../../hooks/useCategories";

vi.mock("../../services/adminService", () => ({
  adminService: { createCategory: vi.fn(), updateCategory: vi.fn() },
}));
vi.mock("../../hooks/useCategories", () => ({ refreshCategories: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  adminService.createCategory.mockResolvedValue({});
  adminService.updateCategory.mockResolvedValue({});
});

const setup = (props = {}) => {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  render(<CategoryFormModal open onClose={onClose} category={null} onSaved={onSaved} {...props} />);
  return { onClose, onSaved, user: userEvent.setup(), name: screen.getByLabelText(/^name/i) };
};

describe("CategoryFormModal", () => {
  it("requires a name", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /add category/i }));
    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(adminService.createCategory).not.toHaveBeenCalled();
  });

  it("rejects names that are too short", async () => {
    const { user, name } = setup();
    await user.type(name, "A");
    await user.click(screen.getByRole("button", { name: /add category/i }));
    expect(await screen.findByText("Name must be 2-40 characters")).toBeInTheDocument();
  });

  it("rejects unsupported characters", async () => {
    const { user, name } = setup();
    await user.type(name, "Bad #name");
    await user.click(screen.getByRole("button", { name: /add category/i }));
    expect(await screen.findByText(/use letters, numbers, spaces/i)).toBeInTheDocument();
    expect(adminService.createCategory).not.toHaveBeenCalled();
  });

  it("creates a category with a tidied-up name, then refreshes the shared list", async () => {
    const { user, name, onClose, onSaved } = setup();
    await user.type(name, "  Photo   Editing ");
    await user.type(screen.getByLabelText(/description/i), " Retouching and colour ");
    await user.click(screen.getByRole("button", { name: /add category/i }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(adminService.createCategory).toHaveBeenCalledWith({ name: "Photo Editing", description: "Retouching and colour" });
    expect(refreshCategories).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("edits an existing category, shows its link name, and updates by id", async () => {
    const category = { _id: "c1", name: "Web Development", slug: "web-development", description: "Sites" };
    const { user, name, onSaved } = setup({ category });
    expect(screen.getByText("web-development")).toBeInTheDocument();
    expect(name).toHaveValue("Web Development");
    await user.clear(name);
    await user.type(name, "Web Dev");
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(adminService.updateCategory).toHaveBeenCalledWith("c1", { name: "Web Dev", description: "Sites" });
  });

  it("shows the server's message when the name is taken", async () => {
    adminService.createCategory.mockRejectedValue(new Error("A category with this name (or a very similar one) already exists"));
    const { user, name, onSaved } = setup();
    await user.type(name, "Business");
    await user.click(screen.getByRole("button", { name: /add category/i }));
    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });
});