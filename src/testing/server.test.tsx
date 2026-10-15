import { http, HttpResponse } from "msw";
import { describe, expect, test } from "vitest";
import { server } from "@/testing/server";

async function fetchFacilitators(query = "") {
  const response = await fetch(`/api/facilitators${query}`);
  return response.json();
}

describe("MSW の既定の応答 (GET /api/facilitators)", () => {
  test("パラメータなしでは、30 件のうち 1 ページ目の 20 件が返る", async () => {
    const body = await fetchFacilitators();
    expect(body.data).toHaveLength(20);
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
