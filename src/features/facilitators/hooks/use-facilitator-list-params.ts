import { useSearchParams } from "react-router";
import {
  getNextSort,
  type ListParams,
  normalizeSearch,
  parseListParams,
  type SortKey,
  toSearchParams,
} from "@/features/facilitators/lib/list-params";

/**
 * 一覧の条件を URL から読み、4 つの操作で URL を書き換える。
 * URL を書き換える口はここだけにする (条件の正本は URL で、React の state に写さない)。
 */
export function useFacilitatorListParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = parseListParams(searchParams);

  /**
   * 1 回の操作は 1 回の書き換えにまとめる
   * (setSearchParams は、同じタイミングでの複数回の呼び出しを積み上げないため)。
   * 条件が変わらない操作 (いまのページの番号を押した、同じ検索語で確定した) では、同じ条件の履歴を積まない。
   * いまの URL は既定値を書いていたり並びが違ったりしうるので、条件を書き出した形どうしで比べる。
   * 書き換えたかを返す。同じ条件かの判定はここだけに置き、呼び出し側は返り値で分ける。
   */
  function navigate(next: ListParams, { replace = false } = {}): boolean {
    const nextSearchParams = toSearchParams(next);
    if (nextSearchParams.toString() === toSearchParams(params).toString()) {
      return false;
    }
    setSearchParams(nextSearchParams, { replace });
    return true;
  }

  return {
    params,
    /** ページを変える (履歴に積む) */
    changePage: (page: number) => navigate({ ...params, page }),
    /** ページを置き換える (履歴を置き換える。範囲外から最終ページへ移すときに使う) */
    replacePage: (page: number) =>
      navigate({ ...params, page }, { replace: true }),
    /** 列見出しのソートを切り替え、1 ページ目に戻す */
    toggleSort: (key: SortKey) =>
      navigate({ ...params, ...getNextSort(params, key), page: 1 }),
    /** 検索を確定する。前後の空白を除き、1 ページ目に戻す。いまと同じ条件なら URL を書き換えず false を返す */
    submitSearch: (input: string) =>
      navigate({ ...params, search: normalizeSearch(input), page: 1 }),
  };
}
