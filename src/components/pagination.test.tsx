import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "@/components/pagination";

function pageButtons() {
  return screen.getAllByRole("listitem").map((item) => item.textContent ?? "");
}

describe("Pagination", () => {
  it("名前つきの nav に、現在のページを中心に 5 個の番号を出し、現在のページに aria-current を付ける", () => {
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />,
    );

    expect(
      screen.getByRole("navigation", { name: "ページ送り" }),
    ).toBeInTheDocument();
    expect(pageButtons()).toEqual(["3", "4", "5", "6", "7"]);
    expect(screen.getByRole("button", { name: "5" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: "4" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("先頭のページでは戻る、最終ページでは次へを押せない", () => {
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={2} onPageChange={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "前のページ" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "次のページ" })).toBeEnabled();

    rerender(
      <Pagination currentPage={2} totalPages={2} onPageChange={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "前のページ" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "次のページ" })).toBeDisabled();
  });

  it("押されたページを知らせる (番号、戻る、次へ)", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: "前のページ" }));
    await user.click(screen.getByRole("button", { name: "次のページ" }));

    expect(onPageChange.mock.calls).toEqual([[5], [2], [4]]);
  });

  it("現在のページが総ページ数を超えたら、総ページ数までの番号で、選択中の番号は無く、戻るだけ押せる", () => {
    render(
      <Pagination currentPage={3} totalPages={2} onPageChange={vi.fn()} />,
    );

    expect(pageButtons()).toEqual(["1", "2"]);
    expect(screen.queryByRole("button", { current: "page" })).toBeNull();
    expect(screen.getByRole("button", { name: "前のページ" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "次のページ" })).toBeDisabled();
  });
});
