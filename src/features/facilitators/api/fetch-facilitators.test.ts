import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import {
  fetchFacilitators,
  InvalidResponseError,
} from "@/features/facilitators/api/fetch-facilitators";
import { DEFAULT_LIST_PARAMS } from "@/features/facilitators/lib/list-params";
import { HttpError } from "@/lib/http";
import { server } from "@/testing/server";

/** fetchFacilitators が投げたものを受け取る (投げなければ undefined) */
async function catchError(promise: Promise<unknown>) {
  return promise.then(
    () => undefined,
    (error: unknown) => error,
  );
}

describe("fetchFacilitators", () => {
  it("条件を API のクエリにして送る (1 ページの件数は 20)", async () => {
    let requested: URLSearchParams | undefined;
    server.use(
      http.get("/api/facilitators", ({ request }) => {
        requested = new URL(request.url).searchParams;
        return HttpResponse.json({ data: [], totalCount: 0 });
      }),
    );

    await fetchFacilitators({
      page: 2,
      sort: "loginId",
      order: "desc",
      search: "abc",
    });

    expect(Object.fromEntries(requested ?? [])).toEqual({
      page: "2",
      limit: "20",
      sort: "loginId",
      order: "desc",
      search: "abc",
    });
  });

  it("検索語が無ければ search を送らない", async () => {
    let requested: URLSearchParams | undefined;
    server.use(
      http.get("/api/facilitators", ({ request }) => {
        requested = new URL(request.url).searchParams;
        return HttpResponse.json({ data: [], totalCount: 0 });
      }),
    );

    await fetchFacilitators(DEFAULT_LIST_PARAMS);

    expect(requested?.has("search")).toBe(false);
  });

  it("行があれば一覧で、要求したページを持つ", async () => {
    const result = await fetchFacilitators({ ...DEFAULT_LIST_PARAMS, page: 2 });

    expect(result).toMatchObject({ kind: "list", totalCount: 30, page: 2 });
    expect(result.facilitators).toHaveLength(10);
  });

  it("該当が無ければ 0 件", async () => {
    const result = await fetchFacilitators({
      ...DEFAULT_LIST_PARAMS,
      search: "該当なし",
    });

    expect(result).toMatchObject({ kind: "empty", totalCount: 0 });
  });

  it("最終ページより後ろなら範囲外", async () => {
    const result = await fetchFacilitators({ ...DEFAULT_LIST_PARAMS, page: 3 });

    expect(result).toMatchObject({
      kind: "outOfRange",
      totalCount: 30,
      page: 3,
    });
  });

  it("応答がスキーマに合わなければ InvalidResponseError (schema)", async () => {
    server.use(
      http.get("/api/facilitators", () =>
        HttpResponse.json({ data: [{ id: "1" }], totalCount: 1 }),
      ),
    );

    const error = await catchError(fetchFacilitators(DEFAULT_LIST_PARAMS));

    expect(error).toBeInstanceOf(InvalidResponseError);
    expect(error).toMatchObject({ reason: "schema" });
  });

  it("行が空なのに総件数があり、ページが範囲内なら InvalidResponseError (inconsistent)", async () => {
    server.use(
      http.get("/api/facilitators", () =>
        HttpResponse.json({ data: [], totalCount: 30 }),
      ),
    );

    const error = await catchError(fetchFacilitators(DEFAULT_LIST_PARAMS));

    expect(error).toBeInstanceOf(InvalidResponseError);
    expect(error).toMatchObject({ reason: "inconsistent" });
  });

  it("通信の失敗は HttpError のまま通す", async () => {
    server.use(http.get("/api/facilitators", () => HttpResponse.error()));

    const error = await catchError(fetchFacilitators(DEFAULT_LIST_PARAMS));

    expect(error).toBeInstanceOf(HttpError);
  });
});
