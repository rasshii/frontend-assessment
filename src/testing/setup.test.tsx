import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, test } from "vitest";
import { server } from "@/testing/server";

/*
 * setup.ts の afterEach (描画の片付けと、差し替えた応答の戻し) を確かめる。
 * 1 つ目のテストが残したものを、後ろのテストが見る。
 * Vitest はファイルの中のテストを上から順に流すので、この並びに頼っている。
 */
describe("setup.ts の片付け (afterEach)", () => {
  test("描画し、応答を 0 件に差し替える", async () => {
    render(<p>前のテストの描画</p>);
    server.use(
      http.get("/api/facilitators", () =>
        HttpResponse.json({ data: [], totalCount: 0 }),
      ),
    );
    const response = await fetch("/api/facilitators");
    expect((await response.json()).totalCount).toBe(0);
  });

  test("次のテストでは、前のテストの描画が残っていない", () => {
    expect(screen.queryByText("前のテストの描画")).not.toBeInTheDocument();
  });

  test("次のテストでは、応答が既定の 30 件に戻っている", async () => {
    const response = await fetch("/api/facilitators");
    expect((await response.json()).totalCount).toBe(30);
  });
});
