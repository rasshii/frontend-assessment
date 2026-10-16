import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FacilitatorRows } from "@/features/facilitators/components/facilitator-rows";
import { FacilitatorTable } from "@/features/facilitators/components/facilitator-table";

describe("FacilitatorTable", () => {
  it("ソート中の列見出しに向きを、ほかの列に none を aria-sort で付ける", () => {
    render(
      <FacilitatorTable sort="loginId" order="desc" onSortChange={vi.fn()}>
        <tbody />
      </FacilitatorTable>,
    );

    expect(screen.getByRole("columnheader", { name: "名前" })).toHaveAttribute(
      "aria-sort",
      "none",
    );
    expect(
      screen.getByRole("columnheader", { name: "ログインID" }),
    ).toHaveAttribute("aria-sort", "descending");
  });

  it("列見出しを押すと、その列を知らせる", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <FacilitatorTable sort="name" order="asc" onSortChange={onSortChange}>
        <tbody />
      </FacilitatorTable>,
    );

    await user.click(screen.getByRole("button", { name: "ログインID" }));

    expect(onSortChange).toHaveBeenCalledWith("loginId");
  });

  it("行に名前とログインID を出す", () => {
    render(
      <FacilitatorTable sort="name" order="asc" onSortChange={vi.fn()}>
        <FacilitatorRows
          facilitators={[{ id: 1, name: "先生1", loginId: "facilitator_1" }]}
        />
      </FacilitatorTable>,
    );

    expect(
      screen.getByRole("table", { name: "先生の一覧" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "先生1" })).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "facilitator_1" }),
    ).toBeInTheDocument();
  });
});
