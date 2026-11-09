import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

const { login } = vi.hoisted(() => ({ login: vi.fn() }));
vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ login }) }));

const setup = () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
  return {
    user,
    email: screen.getByLabelText(/corporate email/i),
    password: screen.getByLabelText(/access key/i),
    submit: screen.getByRole("button", { name: /sign in to workspace/i }),
  };
};

beforeEach(() => login.mockReset());

describe("LoginPage", () => {
  it("shows validation errors for an empty form and does not call the API", async () => {
    const { user, submit } = setup();
    await user.click(submit);
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("rejects an invalid email address", async () => {
    const { user, email, password, submit } = setup();
    await user.type(email, "not-an-email");
    await user.type(password, "Secret123");
    await user.click(submit);
    expect(await screen.findByText("Please enter a valid email")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("submits the credentials and the keep-me-signed-in choice", async () => {
    login.mockResolvedValue({});
    const { user, email, password, submit } = setup();
    await user.type(email, "me@example.com");
    await user.type(password, "Secret123");
    await user.click(submit);
    await screen.findByText(/authorization token verified/i);
    expect(login).toHaveBeenCalledWith({ email: "me@example.com", password: "Secret123", remember: true });
  });

  it("shows the server's error message", async () => {
    login.mockRejectedValue({ message: "Invalid email or password" });
    const { user, email, password, submit } = setup();
    await user.type(email, "me@example.com");
    await user.type(password, "wrong-password");
    await user.click(submit);
    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  });

  it("can show and hide the password", async () => {
    const { user, password } = setup();
    expect(password).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(password).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: /hide password/i }));
    expect(password).toHaveAttribute("type", "password");
  });
});
