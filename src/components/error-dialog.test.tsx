import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorDialog } from "@/components/error-dialog";

describe("ErrorDialog", () => {
  it("開いているときは、文言を名前に持つ alertdialog と「リトライ」が出る", () => {
    render(<ErrorDialog open={true} onRetry={vi.fn()} />);

    expect(
      screen.getByRole("alertdialog", { name: "通信エラーが発生しました。" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "リトライ" }),
    ).toBeInTheDocument();
  });

  it("閉じているときは出ない", () => {
    render(<ErrorDialog open={false} onRetry={vi.fn()} />);

    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("「リトライ」で知らせる", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorDialog open={true} onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: "リトライ" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("Esc と外側のクリックでは閉じない", async () => {
    const user = userEvent.setup();
    render(<ErrorDialog open={true} onRetry={vi.fn()} />);

    await user.keyboard("{Escape}");
    await user.click(document.body);

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("開くと「リトライ」にフォーカスが移る", async () => {
    render(<ErrorDialog open={true} onRetry={vi.fn()} />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "リトライ" })).toHaveFocus(),
    );
  });
});
