import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "@/testing/server";

/*
 * handler の無い通信は失敗させ、MSW がエラーを出力する。
 * 本物の API へ出ていく通信や、URL の書き間違いに気づくため。
 * 失敗を画面で受け止めるテスト (エラーダイアログなど) は、この失敗でも通りうるので、出力も見る。
 */
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));

afterEach(() => {
  // Vitest の globals を使っていないので、Testing Library は描画を自動では片付けない
  cleanup();
  // テストの中で server.use で差し替えた応答を、既定の応答に戻す
  server.resetHandlers();
});

afterAll(() => server.close());
