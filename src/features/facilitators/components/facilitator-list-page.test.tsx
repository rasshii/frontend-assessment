import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { FacilitatorListPage } from "@/features/facilitators/components/facilitator-list-page";
import { defaultFacilitators, respondFacilitators } from "@/testing/handlers";
import { renderWithProviders } from "@/testing/render";
import { server } from "@/testing/server";

const DIALOG_NAME = "通信エラーが発生しました。";

/** 既定の応答を返す前に、受けた要求を数える。respond が値を返したら、それを応答にする */
function countRequests(
  respond?: (count: number, url: URL) => Response | undefined,
) {
  let count = 0;
  server.use(
    http.get("/api/facilitators", async ({ request }) => {
      count += 1;
      const url = new URL(request.url);
      // 取得中の表示を確かめられるよう、応答を少し遅らせる
      await delay(30);
      return (
        respond?.(count, url) ??
        HttpResponse.json(respondFacilitators(url, defaultFacilitators))
      );
    }),
  );
  return () => count;
}

function bodyRows() {
  // 見出しの行を除いた、データの行
  return screen.queryAllByRole("row").slice(1);
}

describe("FacilitatorListPage", () => {
  it("取得中はローダーを出し、結果領域を aria-busy にする。届いたら消して表と件数を出す", async () => {
    countRequests();
    renderWithProviders(<FacilitatorListPage />);

    expect(
      screen.getByRole("status", { name: "読み込み中" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "検索結果" })).toHaveAttribute(
      "aria-busy",
      "true",
    );

    expect(await screen.findByText("30件中 1〜20件を表示")).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(20);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("region", { name: "検索結果" })).toHaveAttribute(
      "aria-busy",
      "false",
    );
  });

  it.each([
    ["ネットワーク断", () => HttpResponse.error()],
    ["404", () => HttpResponse.json({}, { status: 404 })],
    ["500", () => HttpResponse.json({}, { status: 500 })],
    [
      "JSON として読めない応答",
      () =>
        new HttpResponse("not json", {
          headers: { "Content-Type": "application/json" },
        }),
    ],
    [
      "スキーマに合わない応答",
      () => HttpResponse.json({ data: [{ id: "1" }], totalCount: 1 }),
    ],
    ["矛盾した応答", () => HttpResponse.json({ data: [], totalCount: 30 })],
  ])("%s ではダイアログを出す", async (_, respond) => {
    countRequests(() => respond());
    renderWithProviders(<FacilitatorListPage />);

    expect(
      await screen.findByRole("alertdialog", { name: DIALOG_NAME }),
    ).toBeInTheDocument();
    // ダイアログが開くと外側の要素に aria-hidden が付くので、hidden: true で探す (付けないと、表があっても見つからない)
    expect(screen.queryByRole("table", { hidden: true })).toBeNull();
  });

  it("失敗してリトライすると、同じ条件を取り直し、成功したらダイアログを閉じる", async () => {
    const user = userEvent.setup();
    const requests = countRequests((count) =>
      count === 1 ? HttpResponse.json({}, { status: 500 }) : undefined,
    );
    renderWithProviders(<FacilitatorListPage />);

    await user.click(await screen.findByRole("button", { name: "リトライ" }));

    expect(await screen.findByText("30件中 1〜20件を表示")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(requests()).toBe(2);
  });

  it("条件を変えた先で失敗してリトライすると、背後の一覧が「出る → 消える → 出る」と往復する", async () => {
    const user = userEvent.setup();
    let failPage2 = true;
    countRequests((_, url) =>
      url.searchParams.get("page") === "2" && failPage2
        ? HttpResponse.json({}, { status: 500 })
        : undefined,
    );
    renderWithProviders(<FacilitatorListPage />);
    expect(await screen.findByText("30件中 1〜20件を表示")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "次のページ" }));

    // 失敗すると、前の一覧は消える (前の結果の引き継ぎは、データが無く取得中のあいだだけ)
    await screen.findByRole("alertdialog", { name: DIALOG_NAME });
    expect(screen.queryByRole("table", { hidden: true })).toBeNull();
    expect(screen.queryByText(/件中/)).toBeNull();

    failPage2 = false;
    await user.click(screen.getByRole("button", { name: "リトライ" }));

    // 取り直しているあいだは、前の一覧がまた出る
    expect(await screen.findByText("30件中 1〜20件を表示")).toBeInTheDocument();
    expect(
      await screen.findByText("30件中 21〜30件を表示"),
    ).toBeInTheDocument();
  });

  it("0 件なら、表・件数・ページャを出さずに文言を出す", async () => {
    countRequests();
    renderWithProviders(<FacilitatorListPage />, {
      initialEntry: "/?search=該当なし",
    });

    expect(
      await screen.findByText("該当するデータはありません"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText(/件中/)).toBeNull();
    expect(screen.queryByRole("navigation", { name: "ページ送り" })).toBeNull();
  });

  it("存在しないページで開くと、表を出さずにローダーを出し、最終ページに移る", async () => {
    // 最終ページの応答を止めておき、範囲外の結果が届いたあとの画面を確かめてから返す
    let releaseLastPage = () => {};
    const lastPageHeld = new Promise<void>((resolve) => {
      releaseLastPage = resolve;
    });
    let lastPageRequested = false;
    server.use(
      http.get("/api/facilitators", async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("page") === "2") {
          lastPageRequested = true;
          await lastPageHeld;
        }
        return HttpResponse.json(respondFacilitators(url, defaultFacilitators));
      }),
    );
    renderWithProviders(<FacilitatorListPage />, {
      initialEntry: "/?page=5",
    });

    // 範囲外の結果が届き、最終ページを取得している時点: ローダーだけで、本体は何も出ない
    await waitFor(() => expect(lastPageRequested).toBe(true));
    expect(
      screen.getByRole("status", { name: "読み込み中" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText(/件中/)).toBeNull();
    expect(screen.queryByText("該当するデータはありません")).toBeNull();

    releaseLastPage();
    expect(
      await screen.findByText("30件中 21〜30件を表示"),
    ).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("同じ検索語のまま確定しても、取り直す", async () => {
    const user = userEvent.setup();
    const requests = countRequests();
    renderWithProviders(<FacilitatorListPage />, {
      initialEntry: "/?search=先生2",
    });
    await screen.findByText("11件中 1〜11件を表示");
    expect(requests()).toBe(1);

    await user.click(
      screen.getByRole("textbox", { name: "名前、ログインIDで検索" }),
    );
    await user.keyboard("{Enter}");

    await waitFor(() => expect(requests()).toBe(2));
  });
});
