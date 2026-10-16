import { useEffect } from "react";
import {
  type FacilitatorListResult,
  PAGE_SIZE,
} from "@/features/facilitators/lib/facilitator";
import { getTotalPages } from "@/lib/pagination";

/**
 * いまの条件の結果が範囲外のとき、URL を最終ページに置き換える (履歴は積まない)。
 * 引き継いだ前の結果 (isCurrent が false) では動かない。前の条件の結果で移すと、
 * いまの条件の正しいページを書き換えてしまうため。
 * URL の書き換えは描画の外で行う副作用なので、effect の中で呼ぶ。
 */
export function useLastPageCorrection({
  result,
  isCurrent,
  replacePage,
}: {
  result: FacilitatorListResult | undefined;
  isCurrent: boolean;
  replacePage: (page: number) => void;
}) {
  const lastPage =
    isCurrent && result?.kind === "outOfRange"
      ? getTotalPages(result.totalCount, PAGE_SIZE)
      : undefined;

  useEffect(() => {
    if (lastPage !== undefined) replacePage(lastPage);
  }, [lastPage, replacePage]);
}
