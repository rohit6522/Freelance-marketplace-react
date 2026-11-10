import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import DeleteAccountCard from "./DeleteAccountCard";
import { profileService } from "../../services/profileService";

const { setUser } = vi.hoisted(() => ({ setUser: vi.fn() }));
vi.mock("../../hooks/useAuth", () => ({ useAuth: () => ({ setUser }) }));
vi.mock("../../services/profileService", () => ({ profileService: { deleteAccount: vi.fn() } }));

beforeEach(() => {
  setUser.mockClear();
  profileService.deleteAccount.mockClear();
  profileService.deleteAccount.mockResolvedValue(undefined);
});

async function openDialog() {
  const user = userEvent.setup();
  render(<MemoryRouter><DeleteAccountCard /></MemoryRouter>);
  await user.click(screen.getByRole("button", { name: /delete my account/i }));
  return {
    user,
    password: screen.getByLabelText(/your password/i),
    confirm: screen.getByLabelText(/type delete/i),
    submit: screen.getByRole("button", { name: /delete account permanently/i }),
  };
}

describe("DeleteAccountCard", () => {
  it("does nothing until the word DELETE is typed exactly", async () => {
    const { user, password, confirm, submit } = await openDialog();
    await user.type(password, "Secret123");
    await user.type(confirm, "delete");
    await user.click(submit);
    expect(await screen.findByText("Type DELETE exactly")).toBeInTheDocument();
    expect(profileService.deleteAccount).not.toHaveBeenCalled();
  });

  it("requires the password", async () => {
    const { user, confirm, submit } = await openDialog();
    await user.type(confirm, "DELETE");
    await user.click(submit);
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
    expect(profileService.deleteAccount).not.toHaveBeenCalled();
  });

  it("deletes the account and drops the session", async () => {
    const { user, password, confirm, submit } = await openDialog();
    await user.type(password, "Secret123");
    await user.type(confirm, "DELETE");
    await user.click(submit);
    await waitFor(() => expect(setUser).toHaveBeenCalledWith(null));
    expect(profileService.deleteAccount).toHaveBeenCalledWith({ password: "Secret123", confirm: "DELETE" });
  });

  it("shows the server's reason and keeps the session", async () => {
    profileService.deleteAccount.mockRejectedValue(new Error("You have 1 active order. Complete or cancel it before deleting your account."));
    const { user, password, confirm, submit } = await openDialog();
    await user.type(password, "Secret123");
    await user.type(confirm, "DELETE");
    await user.click(submit);
    expect(await screen.findByText(/you have 1 active order/i)).toBeInTheDocument();
    expect(setUser).not.toHaveBeenCalled();
  });
});