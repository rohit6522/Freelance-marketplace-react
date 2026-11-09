import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("renders nothing when there are no pages", () => {
    const { container } = render(<Pagination page={1} pages={0} total={0} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("marks the current page and disables Previous on the first page", () => {
    render(<Pagination page={1} pages={3} total={30} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next page/i })).toBeEnabled();
  });

  it("disables Next on the last page", () => {
    render(<Pagination page={3} pages={3} total={30} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /next page/i })).toBeDisabled();
  });

  it("reports the page the user picks", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={3} pages={5} total={50} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "4" }));
    await user.click(screen.getByRole("button", { name: /next page/i }));
    await user.click(screen.getByRole("button", { name: /previous page/i }));
    expect(onChange.mock.calls).toEqual([[4], [4], [2]]);
  });
});