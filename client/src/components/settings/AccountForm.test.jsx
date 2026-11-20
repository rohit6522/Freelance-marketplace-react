import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountForm from "./AccountForm";
import { profileService } from "../../services/profileService";

const { auth } = vi.hoisted(() => ({ auth: { user: null, setUser: vi.fn() } }));
vi.mock("../../hooks/useAuth", () => ({ useAuth: () => auth }));
vi.mock("../../services/profileService", () => ({ profileService: { updateAccount: vi.fn() } }));

const baseUser = { _id: "u1", firstName: "Mia", lastName: "Client", email: "mia@example.com", role: "client", createdAt: "2026-01-01T00:00:00Z" };
const checkbox = () => screen.getByRole("checkbox", { name: /typing and read status/i });

beforeEach(() => {
  vi.clearAllMocks();
  auth.user = { ...baseUser };
  profileService.updateAccount.mockImplementation(async (payload) => ({ ...baseUser, ...payload }));
});

describe("AccountForm: typing and read status setting", () => {
  it("is ON for accounts that never chose (the field does not exist yet)", () => {
    render(<AccountForm />);
    expect(checkbox()).toBeChecked();
  });

  it("is ON when the account has it enabled, OFF when it was switched off", () => {
    auth.user = { ...baseUser, shareMessageStatus: true };
    const first = render(<AccountForm />);
    expect(checkbox()).toBeChecked();
    first.unmount();
    auth.user = { ...baseUser, shareMessageStatus: false };
    render(<AccountForm />);
    expect(checkbox()).not.toBeChecked();
  });

  it("nothing can be saved until something changes", () => {
    render(<AccountForm />);
    expect(screen.getByRole("button", { name: /save changes/i })).toBeDisabled();
  });

  it("turning it off sends false and updates the signed-in user", async () => {
    const user = userEvent.setup();
    render(<AccountForm />);
    await user.click(checkbox());
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => expect(auth.setUser).toHaveBeenCalled());
    expect(profileService.updateAccount).toHaveBeenCalledWith(expect.objectContaining({ shareMessageStatus: false }));
    expect(auth.setUser).toHaveBeenCalledWith(expect.objectContaining({ shareMessageStatus: false }));
  });

  it("turning it back on sends true", async () => {
    auth.user = { ...baseUser, shareMessageStatus: false };
    const user = userEvent.setup();
    render(<AccountForm />);
    await user.click(checkbox());
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => expect(profileService.updateAccount).toHaveBeenCalled());
    expect(profileService.updateAccount).toHaveBeenCalledWith(expect.objectContaining({ shareMessageStatus: true }));
  });

  it("still sends the name fields, trimmed, along with the setting", async () => {
    const user = userEvent.setup();
    render(<AccountForm />);
    const first = screen.getByLabelText("First name");
    await user.clear(first);
    await user.type(first, "  Maya ");
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => expect(profileService.updateAccount).toHaveBeenCalled());
    expect(profileService.updateAccount).toHaveBeenCalledWith({
      firstName: "Maya", lastName: "Client", companyName: "", domainFocus: "", shareMessageStatus: true,
    });
  });
});