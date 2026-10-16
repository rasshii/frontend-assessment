import {
  type FacilitatorListKind,
  PAGE_SIZE,
} from "@/features/facilitators/lib/facilitator";
import { getTotalPages } from "@/lib/pagination";

/**
 * 取得結果を分類する。判定は上から順に行う (順はテストで固定する)。
 * 1. 行が 1 件以上 → 一覧
 * 2. 総件数が 0 → 0 件
 * 3. 要求したページが最終ページより後ろ → 範囲外 (API は 200・空の行・元の総件数を返す)
 * 4. 残り (行が空なのに総件数があり、ページは範囲内) → 矛盾。取得関数が失敗として投げる
 */
export function classifyListResult({
  rowCount,
  totalCount,
  page,
}: {
  rowCount: number;
  totalCount: number;
  page: number;
}): FacilitatorListKind | "inconsistent" {
  if (rowCount > 0) return "list";
  if (totalCount === 0) return "empty";
  if (page > getTotalPages(totalCount, PAGE_SIZE)) return "outOfRange";
  return "inconsistent";
}
