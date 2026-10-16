import { describe, expect, it } from "vitest";
import type {
  FacilitatorListKind,
  FacilitatorListResult,
} from "@/features/facilitators/lib/facilitator";
import { getListView } from "@/features/facilitators/lib/list-view";

/** 分類だけを変えた結果を作る (行と件数は出し分けに関わらない) */
function resultOf(kind: FacilitatorListKind): FacilitatorListResult {
  return { kind, facilitators: [], totalCount: 30, page: 1 };
}

describe("getListView", () => {
  it("初回の取得中は、本体を出さずにローダーだけ", () => {
    expect(
      getListView({ result: undefined, isFetching: true, isError: false }),
    ).toEqual({ body: "none", showLoader: true, showErrorDialog: false });
  });

  it("一覧が取れたら表だけ", () => {
    expect(
      getListView({
        result: resultOf("list"),
        isFetching: false,
        isError: false,
      }),
    ).toEqual({ body: "table", showLoader: false, showErrorDialog: false });
  });

  it("次の条件の取得中は、前の表を残してローダーを重ねる", () => {
    expect(
      getListView({
        result: resultOf("list"),
        isFetching: true,
        isError: false,
      }),
    ).toEqual({ body: "table", showLoader: true, showErrorDialog: false });
  });

  it("0 件なら文言", () => {
    expect(
      getListView({
        result: resultOf("empty"),
        isFetching: false,
        isError: false,
      }),
    ).toEqual({ body: "empty", showLoader: false, showErrorDialog: false });
  });

  it("範囲外なら、取得中でなくても本体を出さずにローダーだけ", () => {
    expect(
      getListView({
        result: resultOf("outOfRange"),
        isFetching: false,
        isError: false,
      }),
    ).toEqual({ body: "none", showLoader: true, showErrorDialog: false });
  });

  it("失敗したら、出せる結果だけを残してダイアログ", () => {
    expect(
      getListView({ result: undefined, isFetching: false, isError: true }),
    ).toEqual({ body: "none", showLoader: false, showErrorDialog: true });
    expect(
      getListView({
        result: resultOf("list"),
        isFetching: false,
        isError: true,
      }),
    ).toEqual({ body: "table", showLoader: false, showErrorDialog: true });
  });

  it("リトライで取り直しているあいだは、ダイアログを閉じてローダー", () => {
    expect(
      getListView({
        result: resultOf("list"),
        isFetching: true,
        isError: true,
      }),
    ).toEqual({ body: "table", showLoader: true, showErrorDialog: false });
  });
});
