import { describe, expect, it } from "vitest";
import {
  DEFAULT_LIST_PARAMS,
  getNextSort,
  normalizeSearch,
  parseListParams,
  toSearchParams,
} from "@/features/facilitators/lib/list-params";

describe("parseListParams", () => {
  it("クエリが無ければ既定の条件", () => {
    expect(parseListParams(new URLSearchParams())).toEqual(DEFAULT_LIST_PARAMS);
  });

  it("正しい値はそのまま条件になる", () => {
    expect(
      parseListParams(
        new URLSearchParams("page=3&sort=loginId&order=desc&search=abc"),
      ),
    ).toEqual({ page: 3, sort: "loginId", order: "desc", search: "abc" });
  });

  it.each(["0", "-1", "1.5", "01", "abc", ""])(
    "page=%s は解釈できないので 1 ページ目",
    (page) => {
      expect(parseListParams(new URLSearchParams({ page })).page).toBe(1);
    },
  );

  it("解釈できない列と向きは、項目ごとに既定値 (ほかの項目は残る)", () => {
    expect(
      parseListParams(new URLSearchParams("page=2&sort=id&order=up")),
    ).toEqual({ page: 2, sort: "name", order: "asc", search: "" });
  });

  it("検索語の前後の空白を除く", () => {
    expect(
      parseListParams(new URLSearchParams({ search: "  先生 " })).search,
    ).toBe("先生");
  });
});

describe("toSearchParams", () => {
  it("既定の条件は何も書かない", () => {
    expect(toSearchParams(DEFAULT_LIST_PARAMS).toString()).toBe("");
  });

  it("既定と違う項目だけを書く", () => {
    expect(
      toSearchParams({ ...DEFAULT_LIST_PARAMS, order: "desc" }).toString(),
    ).toBe("order=desc");
  });

  it("書き出して解釈し直すと、元の条件に戻る", () => {
    const params = {
      page: 3,
      sort: "loginId",
      order: "desc",
      search: "先生",
    } as const;
    expect(parseListParams(toSearchParams(params))).toEqual(params);
  });
});

describe("getNextSort", () => {
  it("ソート中の列を押すと、向きが入れ替わる", () => {
    expect(getNextSort({ sort: "name", order: "asc" }, "name")).toEqual({
      sort: "name",
      order: "desc",
    });
    expect(getNextSort({ sort: "name", order: "desc" }, "name")).toEqual({
      sort: "name",
      order: "asc",
    });
  });

  it("別の列を押すと、その列の昇順", () => {
    expect(getNextSort({ sort: "name", order: "desc" }, "loginId")).toEqual({
      sort: "loginId",
      order: "asc",
    });
  });
});

describe("normalizeSearch", () => {
  it("前後の空白を除く (全角の空白も)", () => {
    expect(normalizeSearch("  先生 ")).toBe("先生");
    expect(normalizeSearch("　先生　")).toBe("先生");
  });

  it("空白だけなら検索語なし", () => {
    expect(normalizeSearch("   ")).toBe("");
  });

  it("間の空白は残す", () => {
    expect(normalizeSearch(" 先生 1 ")).toBe("先生 1");
  });
});
