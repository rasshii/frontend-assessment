import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { fetchFacilitators } from "@/features/facilitators/api/fetch-facilitators";
import type { ListParams } from "@/features/facilitators/lib/list-params";

/**
 * 先生の一覧の取得の設定。アプリ全体の既定 (app/query-client.ts) から、一覧の要件で変える項目:
 * - networkMode: "always": 既定の "online" では、オフラインを検知すると取得が失敗せずに止まり、
 *   ローダーもダイアログも出ない。オフラインでも取得して、失敗としてダイアログを出す
 * - retry: false: 失敗はすぐダイアログで知らせ、やり直しは利用者の「リトライ」に任せる
 * - refetchOnWindowFocus: false: タブに戻ったときに取り直さない
 * - refetchOnReconnect: false: 再接続のときに取り直さない (networkMode が "always" のときは既定でも false。
 *   networkMode を変えても再接続で取り直さないよう、明示しておく)
 * - placeholderData: keepPreviousData: 次の条件を取っているあいだ、前の一覧を残す
 *
 * キーは条件そのもの。条件が変わるとキーが変わり、取得が走る。
 *
 * @see https://tanstack.com/query/v5/docs/framework/react/guides/network-mode
 */
export function facilitatorsQueryOptions(params: ListParams) {
  return queryOptions({
    queryKey: ["facilitators", params],
    queryFn: ({ signal }) => fetchFacilitators(params, { signal }),
    networkMode: "always",
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: keepPreviousData,
  });
}
