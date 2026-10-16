import { useQuery } from "@tanstack/react-query";
import { facilitatorsQueryOptions } from "@/features/facilitators/api/facilitators-query";
import type { ListParams } from "@/features/facilitators/lib/list-params";
import { getListView } from "@/features/facilitators/lib/list-view";

/**
 * 一覧の条件で先生を取得し、TanStack Query の状態を画面の言葉に直して返す。
 * - result: 手元の結果。いまの条件のものか、次の条件を取っているあいだ引き継いだ前の結果
 * - isCurrent: result がいまの条件の結果か (引き継いだ前の結果なら false。最終ページへの移動が読む)
 * - view: 画面に出すもの (本体・ローダー・エラーダイアログ)
 * - retry: 同じ条件で取り直す (エラーダイアログの「リトライ」)
 */
export function useFacilitators(params: ListParams) {
  const query = useQuery(facilitatorsQueryOptions(params));
  return {
    result: query.data,
    isCurrent: query.data !== undefined && !query.isPlaceholderData,
    view: getListView({
      result: query.data,
      isFetching: query.isFetching,
      isError: query.isError,
    }),
    retry: () => {
      void query.refetch();
    },
  };
}
