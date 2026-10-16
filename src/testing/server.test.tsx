import { http, HttpResponse } from "msw";
import { describe, expect, test } from "vitest";
import { server } from "@/testing/server";

type ResponseBody = {
  data: { id: number; name: string; loginId: string }[];
  totalCount: number;
};

async function fetchFacilitators(query = ""): Promise<ResponseBody> {
  const response = await fetch(`/api/facilitators${query}`);
  return response.json();
}

describe("MSW の既定の応答 (GET /api/facilitators)", () => {
  test("パラメータなしでは、30 件のうち 1 ページ目の 20 件が返る", async () => {
    const body = await fetchFacilitators();
    expect(body.data).toHaveLength(20);
    expect(body.totalCount).toBe(30);
  });

  test("page=2 では、21 件目から 10 件が返る", async () => {
    const body = await fetchFacilitators("?page=2");
    expect(body.data.map((item) => item.id)).toEqual([
      21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    ]);
    expect(body.totalCount).toBe(30);
  });

  test("検索・ソート・件数の指定は、検索 → ソート → ページ分割の順で効く", async () => {
    const body = await fetchFacilitators(
      "?search=1&sort=loginId&order=desc&limit=3",
    );
    expect(body.data.map((item) => item.loginId)).toEqual([
      "facilitator_21",
      "facilitator_19",
      "facilitator_18",
    ]);
    expect(body.totalCount).toBe(12);
  });

  test("検索はログインID にも当たり、英字の大文字と小文字を区別しない", async () => {
    const body = await fetchFacilitators("?search=FACILITATOR_3");
    expect(body.data.map((item) => item.id)).toEqual([3, 30]);
    expect(body.totalCount).toBe(2);
  });

  test("ソートは文字コード順 (数の大きさの順ではない)", async () => {
    const byLoginId = await fetchFacilitators("?sort=loginId&limit=3");
    expect(byLoginId.data.map((item) => item.id)).toEqual([1, 10, 11]);
    const byName = await fetchFacilitators("?sort=name&limit=3");
    expect(byName.data.map((item) => item.id)).toEqual([1, 10, 11]);
  });

  test("検索は名前にも当たる", async () => {
    const body = await fetchFacilitators("?search=先生2");
    expect(body.data.map((item) => item.id)).toEqual([
      2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
    ]);
    expect(body.totalCount).toBe(11);
  });

  test("範囲外のページでは、空の data と元の totalCount が返る", async () => {
    const body = await fetchFacilitators("?page=3");
    expect(body.data).toEqual([]);
    expect(body.totalCount).toBe(30);
  });
});

describe("テストの中だけ応答を差し替える (server.use)", () => {
  test("差し替えた応答が返る", async () => {
    server.use(
      http.get("/api/facilitators", () =>
        HttpResponse.json({ data: [], totalCount: 0 }),
      ),
    );
    const body = await fetchFacilitators();
    expect(body.totalCount).toBe(0);
  });

  test("ネットワーク断を再現すると、fetch が失敗する", async () => {
    server.use(http.get("/api/facilitators", () => HttpResponse.error()));
    await expect(fetchFacilitators()).rejects.toThrow();
  });
});
