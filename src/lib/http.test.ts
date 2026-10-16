import { delay, http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { fetchJson, HttpError } from "@/lib/http";
import { server } from "@/testing/server";

/** fetchJson が投げたものを受け取る (投げなければ undefined) */
async function catchError(promise: Promise<unknown>) {
  return promise.then(
    () => undefined,
    (error: unknown) => error,
  );
}

describe("fetchJson", () => {
  it("応答の JSON を返す", async () => {
    server.use(http.get("/api/test", () => HttpResponse.json({ value: 1 })));

    await expect(fetchJson("/api/test")).resolves.toEqual({ value: 1 });
  });

  it("ネットワーク断は network", async () => {
    server.use(http.get("/api/test", () => HttpResponse.error()));

    const error = await catchError(fetchJson("/api/test"));

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ kind: "network" });
  });

  it.each([404, 500])("HTTP の状態 %i は status", async (status) => {
    server.use(http.get("/api/test", () => HttpResponse.json({}, { status })));

    const error = await catchError(fetchJson("/api/test"));

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ kind: "status", status });
  });

  it("JSON として読めない応答は parse", async () => {
    server.use(
      http.get(
        "/api/test",
        () =>
          new HttpResponse("not json", {
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    const error = await catchError(fetchJson("/api/test"));

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ kind: "parse" });
  });

  it("上限までに応答が無ければ timeout", async () => {
    server.use(
      http.get("/api/test", async () => {
        await delay(200);
        return HttpResponse.json({});
      }),
    );

    const error = await catchError(fetchJson("/api/test", { timeoutMs: 50 }));

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ kind: "timeout" });
  });

  it("呼び出し元の中断は HttpError にせず、AbortError のまま投げる", async () => {
    server.use(
      http.get("/api/test", async () => {
        await delay(200);
        return HttpResponse.json({});
      }),
    );
    const controller = new AbortController();

    const pending = catchError(
      fetchJson("/api/test", { signal: controller.signal }),
    );
    controller.abort();
    const error = await pending;

    expect(error).not.toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ name: "AbortError" });
  });
});
