import { describe, expect, it } from "vitest";
import { classifyListResult } from "@/features/facilitators/lib/list-result";

describe("classifyListResult", () => {
  it("行が 1 件以上なら一覧", () => {
    expect(classifyListResult({ rowCount: 20, totalCount: 30, page: 1 })).toBe(
      "list",
    );
  });

  it("総件数が 0 なら 0 件", () => {
    expect(classifyListResult({ rowCount: 0, totalCount: 0, page: 1 })).toBe(
      "empty",
    );
  });

  it("要求したページが最終ページより後ろなら範囲外 (30 件は 2 ページまで)", () => {
    expect(classifyListResult({ rowCount: 0, totalCount: 30, page: 3 })).toBe(
      "outOfRange",
    );
  });

  it("行が空で、総件数があり、ページが範囲内なら矛盾", () => {
    expect(classifyListResult({ rowCount: 0, totalCount: 30, page: 2 })).toBe(
      "inconsistent",
    );
  });

  describe("判定の順", () => {
    it("行があれば、総件数が 0 でも一覧 (1 が 2 より先)", () => {
      expect(classifyListResult({ rowCount: 1, totalCount: 0, page: 1 })).toBe(
        "list",
      );
    });

    it("総件数が 0 なら、ページが後ろでも 0 件 (2 が 3 より先)", () => {
      expect(classifyListResult({ rowCount: 0, totalCount: 0, page: 5 })).toBe(
        "empty",
      );
    });
  });
});
