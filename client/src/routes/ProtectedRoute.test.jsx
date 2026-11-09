import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const auth = vi.hoisted(() => ({ value: { user: null, loading: false } }));
vi.mock("../hooks/useAuth", () => ({ useAuth: () => auth.value }));

function renderAt(path, roles) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/dashboard" element={<div>Dashboard page</div>} />
        <Route element={<ProtectedRoute roles={roles} />}>
          <Route path="/secret" element={<div>Secret page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("shows a loader while the session is being restored", () => {
    auth.value = { user: null, loading: true };
    renderAt("/secret");
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Secret page")).not.toBeInTheDocument();
  });

  it("sends logged-out visitors to the login page", () => {
    auth.value = { user: null, loading: false };
    renderAt("/secret");
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("lets any logged-in user in when no roles are required", () => {
    auth.value = { user: { role: "client" }, loading: false };
    renderAt("/secret");
    expect(screen.getByText("Secret page")).toBeInTheDocument();
  });

  it("lets a user with an allowed role in", () => {
    auth.value = { user: { role: "freelancer" }, loading: false };
    renderAt("/secret", ["freelancer"]);
    expect(screen.getByText("Secret page")).toBeInTheDocument();
  });

  it("redirects a user with the wrong role to the dashboard", () => {
    auth.value = { user: { role: "client" }, loading: false };
    renderAt("/secret", ["freelancer"]);
    expect(screen.getByText("Dashboard page")).toBeInTheDocument();
    expect(screen.queryByText("Secret page")).not.toBeInTheDocument();
  });
});