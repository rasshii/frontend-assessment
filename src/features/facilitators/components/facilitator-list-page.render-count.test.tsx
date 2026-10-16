import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { Profiler, type ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FacilitatorListPage } from "@/features/facilitators/components/facilitator-list-page";
import { defaultFacilitators, respondFacilitators } from "@/testing/handlers";
import { renderWithProviders } from "@/testing/render";
import { server } from "@/testing/server";

/*
 * 行の部品 (FacilitatorRows) が描画された回数を数える。
 * 行の部品を Profiler で包んだものに差し替え、描画が確定するたびに onRender で数える。
 * ページが行の部品に同じ要素を渡し続ける (React Compiler が要素を覚えている) あいだは、
 * 包んだ部品ごと描画されないので、数は増えない。
 */
const rowsRenders = vi.hoisted(() => ({ count: 0 }));

vi.mock(
  "@/features/facilitators/components/facilitator-rows",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/features/facilitators/components/facilitator-rows")
      >();
    function CountedFacilitatorRows(
      props: ComponentProps<typeof actual.FacilitatorRows>,
    ) {
      return (
        <Profiler
          id="facilitator-rows"
          onRender={() => {
            rowsRenders.count += 1;
          }}
        >
          <actual.FacilitatorRows {...props} />
        </Profiler>
      );
    }
    return { FacilitatorRows: CountedFacilitatorRows };
  },
);

/** 最初の 1 回だけすぐ返し、そのあとは遅らせる。fail が true を返す要求は 500 にする。受けた要求の数を返す */
function respondWith(fail: (url: URL, count: number) => boolean = () => false) {
  let count = 0;
  server.use(
    http.get("/api/facilitators", async ({ request }) => {
      count += 1;
      const url = new URL(request.url);
      if (count > 1) await delay(50);
      if (fail(url, count)) return HttpResponse.json({}, { status: 500 });
      return HttpResponse.json(respondFacilitators(url, defaultFacilitators));
    }),
  );
  return () => count;
}

beforeEach(() => {
  rowsRenders.count = 0;
});

describe("行の部品の描画回数", () => {
  it("(a) 検索欄に打っているあいだは増えず、取得も始まらない", async () => {
    const user = userEvent.setup();
    const requests = respondWith();
    renderWithProviders(<FacilitatorListPage />);
    await screen.findByText("30件中 1〜20件を表示");
    const before = rowsRenders.count;

    await user.type(
      screen.getByRole("textbox", { name: "名前、ログインIDで検索" }),
      "先生",
    );

    expect(rowsRenders.count).toBe(before);
    // 入力のたびに取得が始まる形でも、応答 (50ms 遅れる) が届く前は行の描画回数が増えないので、取得が始まっていないことを要求の数で確かめる
    expect(requests()).toBe(1);
  });

  it("(b) ページ送りでは、結果が届くまで増えず、届いたときに 1 回増える", async () => {
    const user = userEvent.setup();
    respondWith();
    renderWithProviders(<FacilitatorListPage />);
    await screen.findByText("30件中 1〜20件を表示");
    const before = rowsRenders.count;

    await user.click(screen.getByRole("button", { name: "次のページ" }));
    // 取得中 (ローダーが出ていて、前の行を出している)
    expect(
      screen.getByRole("status", { name: "読み込み中" }),
    ).toBeInTheDocument();
    expect(rowsRenders.count).toBe(before);

    await screen.findByText("30件中 21〜30件を表示");
    expect(rowsRenders.count).toBe(before + 1);
  });

  it("(c) ソートの切り替えでも、結果が届くまで増えず、届いたときに 1 回増える", async () => {
    const user = userEvent.setup();
    respondWith();
    renderWithProviders(<FacilitatorListPage />);
    await screen.findByText("30件中 1〜20件を表示");
    const before = rowsRenders.count;

    await user.click(screen.getByRole("button", { name: "ログインID" }));
    expect(
      screen.getByRole("status", { name: "読み込み中" }),
    ).toBeInTheDocument();
    expect(rowsRenders.count).toBe(before);

    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    expect(rowsRenders.count).toBe(before + 1);
  });

  it("(d) 結果のある条件を取り直すとき、リトライの開始では増えない", async () => {
    const user = userEvent.setup();
    // 1 ページ目の 2 回目の取得 (2 ページ目から戻ったときの取り直し) だけ失敗させる
    let page1Requests = 0;
    respondWith((url) => {
      if ((url.searchParams.get("page") ?? "1") !== "1") return false;
      page1Requests += 1;
      return page1Requests === 2;
    });
    renderWithProviders(<FacilitatorListPage />);
    await screen.findByText("30件中 1〜20件を表示");
    await user.click(screen.getByRole("button", { name: "次のページ" }));
    await screen.findByText("30件中 21〜30件を表示");

    // キャッシュのある 1 ページ目へ戻る → すぐ前の結果が出て、裏の取り直しが失敗する
    await user.click(screen.getByRole("button", { name: "前のページ" }));
    await screen.findByRole("alertdialog");
    expect(screen.getByText("30件中 1〜20件を表示")).toBeInTheDocument();
    const before = rowsRenders.count;

    await user.click(screen.getByRole("button", { name: "リトライ" }));
    // 取り直しの開始 (ダイアログが閉じてローダーが出る)
    expect(
      screen.getByRole("status", { name: "読み込み中" }),
    ).toBeInTheDocument();
    expect(rowsRenders.count).toBe(before);
  });
});
