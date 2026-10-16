import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FacilitatorSearchForm } from "@/features/facilitators/components/facilitator-search-form";

function searchBox() {
  return screen.getByRole("textbox", { name: "名前、ログインIDで検索" });
}

describe("FacilitatorSearchForm", () => {
  it("打っているあいだは知らせず、Enter で入力を知らせる。フォーカスは検索欄に残る", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FacilitatorSearchForm search="" onSubmit={onSubmit} />);

    await user.type(searchBox(), "先生");
    expect(onSubmit).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("先生");
    expect(searchBox()).toHaveFocus();
  });

  it("検索アイコンでも確定する", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<FacilitatorSearchForm search="" onSubmit={onSubmit} />);

    await user.type(searchBox(), "abc");
    await user.click(screen.getByRole("button", { name: "検索" }));

    expect(onSubmit).toHaveBeenCalledWith("abc");
  });

  it("URL の検索語が外から変わったら、入力をそれに合わせる", () => {
    const { rerender } = render(
      <FacilitatorSearchForm search="abc" onSubmit={vi.fn()} />,
    );
    expect(searchBox()).toHaveValue("abc");

    rerender(<FacilitatorSearchForm search="先生" onSubmit={vi.fn()} />);

    expect(searchBox()).toHaveValue("先生");
  });

  it("URL の検索語が変わらなければ、打っている文字を残す", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <FacilitatorSearchForm search="" onSubmit={vi.fn()} />,
    );
    await user.type(searchBox(), "打ちかけ");

    rerender(<FacilitatorSearchForm search="" onSubmit={vi.fn()} />);

    expect(searchBox()).toHaveValue("打ちかけ");
  });

  it("search の役割を持つ", () => {
    render(<FacilitatorSearchForm search="" onSubmit={vi.fn()} />);

    expect(screen.getByRole("search")).toBeInTheDocument();
  });
});
