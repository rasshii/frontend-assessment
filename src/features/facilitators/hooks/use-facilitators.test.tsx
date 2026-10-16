import { focusManager, onlineManager } from "@tanstack/react-query";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";
import { useFacilitators } from "@/features/facilitators/hooks/use-facilitators";
import {
  DEFAULT_LIST_PARAMS,
  type ListParams,
} from "@/features/facilitators/lib/list-params";
import { defaultFacilitators, respondFacilitators } from "@/testing/handlers";
import { renderWithProviders } from "@/testing/render";
import { server } from "@/testing/server";

/** hook が返す値を 1 つの JSON で表示し、リトライをボタンで呼ぶ */
function Probe({ params }: { params: ListParams }) {
  const { result, isCurrent, view, retry } = useFacilitators(params);
  return (
    <>
      <p data-testid="state">
        {JSON.stringify({
          page: result?.page,
          kind: result?.kind,
          rows: result?.facilitators.length,
          isCurrent,
          ...view,
        })}
      </p>
      <button type="button" onClick={retry}>
        リトライ
      </button>
    </>
  );
}

function currentState() {
  return JSON.parse(screen.getByTestId("state").textContent ?? "") as unknown;
}

/** 既定の応答の前に、受けた要求を数える */
function countRequests(respond?: (count: number) => Response | undefined) {
  let count = 0;
  server.use(
    http.get("/api/facilitators", ({ request }) => {
      count += 1;
      return (
        respond?.(count) ??
        HttpResponse.json(
          respondFacilitators(new URL(request.url), defaultFacilitators),
        )
      );
    }),
  );
  return () => count;
}

afterEach(() => {
  onlineManager.setOnline(true);
  focusManager.setFocused(undefined);
});

describe("useFacilitators", () => {
  it("取得中はローダー、届いたら表 (いまの条件の結果)", async () => {
    renderWithProviders(<Probe params={DEFAULT_LIST_PARAMS} />);

    expect(currentState()).toMatchObject({ body: "none", showLoader: true });
    await waitFor(() =>
      expect(currentState()).toMatchObject({
        kind: "list",
        rows: 20,
        isCurrent: true,
        body: "table",
        showLoader: false,
      }),
    );
  });

  it("条件を変えると、次の結果が届くまで前の結果を引き継ぐ", async () => {
    server.use(
      http.get("/api/facilitators", async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("page") === "2") await delay(100);
        return HttpResponse.json(respondFacilitators(url, defaultFacilitators));
      }),
    );
    const { rerender } = renderWithProviders(
      <Probe params={DEFAULT_LIST_PARAMS} />,
    );
    await waitFor(() => expect(currentState()).toMatchObject({ page: 1 }));

    rerender(<Probe params={{ ...DEFAULT_LIST_PARAMS, page: 2 }} />);

    expect(currentState()).toMatchObject({
      page: 1,
      isCurrent: false,
      body: "table",
      showLoader: true,
    });
    await waitFor(() =>
      expect(currentState()).toMatchObject({
        page: 2,
        rows: 10,
        isCurrent: true,
        showLoader: false,
      }),
    );
  });

  it("失敗したら再試行せずにダイアログを出し、リトライで取り直す", async () => {
    const user = userEvent.setup();
    const requests = countRequests((count) =>
      count === 1 ? HttpResponse.json({}, { status: 500 }) : undefined,
    );
    renderWithProviders(<Probe params={DEFAULT_LIST_PARAMS} />);

    await waitFor(() =>
      expect(currentState()).toMatchObject({ showErrorDialog: true }),
    );
    expect(requests()).toBe(1);

    await user.click(screen.getByRole("button", { name: "リトライ" }));

    await waitFor(() =>
      expect(currentState()).toMatchObject({
        kind: "list",
        showErrorDialog: false,
      }),
    );
    expect(requests()).toBe(2);
  });

  it("オフラインでも取得を止めず、失敗としてダイアログを出す", async () => {
    server.use(http.get("/api/facilitators", () => HttpResponse.error()));
    onlineManager.setOnline(false);

    renderWithProviders(<Probe params={DEFAULT_LIST_PARAMS} />);

    await waitFor(() =>
      expect(currentState()).toMatchObject({ showErrorDialog: true }),
    );
  });

  it("タブに戻っても取り直さない", async () => {
    const requests = countRequests();
    renderWithProviders(<Probe params={DEFAULT_LIST_PARAMS} />);
    await waitFor(() => expect(currentState()).toMatchObject({ kind: "list" }));

    act(() => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });
    await delay(50);

    expect(requests()).toBe(1);
  });
});
