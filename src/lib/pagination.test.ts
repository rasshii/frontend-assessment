import { describe, expect, it } from "vitest";
import {
  getDisplayRange,
  getPagerState,
  getTotalPages,
} from "@/lib/pagination";

describe("getTotalPages", () => {
  it("端数のページも 1 ページに数える", () => {
    expect(getTotalPages(30, 20)).toBe(2);
    expect(getTotalPages(20, 20)).toBe(1);
    expect(getTotalPages(21, 20)).toBe(2);
  });

  it("0 件なら 0 ページ", () => {
    expect(getTotalPages(0, 20)).toBe(0);
  });
});

describe("getPagerState", () => {
  it("番号は現在のページを中心に 5 個", () => {
    expect(getPagerState(5, 10).pageNumbers).toEqual([3, 4, 5, 6, 7]);
  });

  it("先頭のページでは 1 から 5 個で、戻るは押せない", () => {
    expect(getPagerState(1, 10)).toEqual({
      pageNumbers: [1, 2, 3, 4, 5],
      canGoPrevious: false,
      canGoNext: true,
    });
  });

  it("最終ページでは最後の 5 個で、次へは押せない", () => {
    expect(getPagerState(10, 10)).toEqual({
      pageNumbers: [6, 7, 8, 9, 10],
      canGoPrevious: true,
      canGoNext: false,
    });
  });

  it("総ページ数が 5 より少なければ、全部のページを出す", () => {
    expect(getPagerState(2, 2).pageNumbers).toEqual([1, 2]);
  });

  it("現在のページが総ページ数を超えたら、総ページ数までの番号を出し、戻るだけ押せる", () => {
    expect(getPagerState(3, 2)).toEqual({
      pageNumbers: [1, 2],
      canGoPrevious: true,
      canGoNext: false,
    });
  });

  it("0 ページなら番号は無く、戻るも次へも押せない", () => {
    expect(getPagerState(1, 0)).toEqual({
      pageNumbers: [],
      canGoPrevious: false,
      canGoNext: false,
    });
  });
});

describe("getDisplayRange", () => {
  it("1 ページ目は 1〜20 件", () => {
    expect(getDisplayRange(1, 20, 30)).toEqual({ from: 1, to: 20 });
  });

  it("最終ページの b は総件数", () => {
    expect(getDisplayRange(2, 20, 30)).toEqual({ from: 21, to: 30 });
  });

  it("1 ページに収まるときは 1〜総件数", () => {
    expect(getDisplayRange(1, 20, 5)).toEqual({ from: 1, to: 5 });
  });
});
