import { screen, waitFor } from "@testing-library/react";
import { useLocation, useNavigationType } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { useFacilitatorListParams } from "@/features/facilitators/hooks/use-facilitator-list-params";
import { useFacilitators } from "@/features/facilitators/hooks/use-facilitators";
import { useLastPageCorrection } from "@/features/facilitators/hooks/use-last-page-correction";
import type {
  FacilitatorListKind,
  FacilitatorListResult,
} from "@/features/facilitators/lib/facilitator";
import { renderWithProviders } from "@/testing/render";

/** 分類だけを変えた結果 (総件数 30 は 2 ページまで) */
function resultOf(kind: FacilitatorListKind): FacilitatorListResult {
  return { kind, facilitators: [], totalCount: 30, page: 5 };
}

/** hook に渡す値をそのまま受け取って呼ぶ */
function Probe(props: Parameters<typeof useLastPageCorrection>[0]) {
  useLastPageCorrection(props);
  return null;
}

/** 一覧のページと同じ組み方で 3 つの hook をつなぎ、URL と結果を表示する */
function ListProbe() {
  const { params, replacePage } = useFacilitatorListParams();
  const { result, isCurrent } = useFacilitators(params);
  useLastPageCorrection({ result, isCurrent, replacePage });
  const location = useLocation();
  const navigationType = useNavigationType();
  return (
    <p data-testid="state">
      {JSON.stringify({
        search: location.search,
        navigationType,
        kind: result?.kind,
        rows: result?.facilitators.length,
      })}
    </p>
  );
}

describe("useLastPageCorrection", () => {
  it("いまの条件の結果が範囲外なら、最終ページに置き換える", () => {
    const replacePage = vi.fn();
    renderWithProviders(
      <Probe
        result={resultOf("outOfRange")}
        isCurrent={true}
        replacePage={replacePage}
      />,
    );

    expect(replacePage).toHaveBeenCalledWith(2);
  });

  it("引き継いだ前の結果なら、範囲外でも動かない", () => {
    const replacePage = vi.fn();
    renderWithProviders(
      <Probe
        result={resultOf("outOfRange")}
        isCurrent={false}
        replacePage={replacePage}
      />,
    );

    expect(replacePage).not.toHaveBeenCalled();
  });

  it("範囲外でなければ動かない", () => {
    const replacePage = vi.fn();
    renderWithProviders(
      <Probe
        result={resultOf("list")}
        isCurrent={true}
        replacePage={replacePage}
      />,
    );

    expect(replacePage).not.toHaveBeenCalled();
  });

  it("存在しないページの URL で開くと、最終ページの URL に置き換わり、その行が出る", async () => {
    renderWithProviders(<ListProbe />, {
      initialEntry: "/?page=5&sort=loginId",
    });

    await waitFor(() =>
      expect(JSON.parse(screen.getByTestId("state").textContent ?? "")).toEqual(
        {
          search: "?page=2&sort=loginId",
          navigationType: "REPLACE",
          kind: "list",
          rows: 10,
        },
      ),
    );
  });
});
