import { QueryClient } from "@tanstack/react-query";

/**
 * 本体とテストが同じ作り方で QueryClient を得るための関数。
 *
 * 何も渡さずに作るので、TanStack Query v5 の既定の動きがすべての取得に当たる。
 * - 失敗したら 3 回まで再試行する (retry)
 * - タブに戻ったとき、ネットワークが再接続したときに取り直す (refetchOnWindowFocus / refetchOnReconnect)
 * - オフラインを検知すると、取得を失敗させずに止める (networkMode: 'online')
 * - 使われなくなった結果は 5 分で捨てる (gcTime。一覧もこのまま使う)
 *
 * 一覧は、再試行・取り直し・networkMode を変える。変えるのはここではなく、
 * 機能の queryOptions (features/facilitators/api/facilitators-query.ts) にする。
 * 一覧の要件を機能のファイルで読めるようにし、アプリ全体の既定を一覧の都合で変えないため。
 *
 * @see https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults
 * @see https://tanstack.com/query/v5/docs/framework/react/guides/network-mode
 */
export function createQueryClient() {
  return new QueryClient();
}
