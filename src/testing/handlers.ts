import { http, HttpResponse } from "msw";
import { createFacilitators, type FacilitatorRecord } from "@/testing/fixtures";

/** 既定の応答に使う先生。本物の API と同じ 30 件 (20 件ずつで 2 ページ)。 */
export const defaultFacilitators = createFacilitators(30);

/**
 * GET /api/facilitators の応答を、本物の API と同じ順 (検索 → ソート → ページ分割) で作る。
 * 本物の API の振る舞いのうち、一覧が頼るものだけを写す (調査メモ 5 節)。
 * - 検索は名前とログインID の部分一致 (OR)。英字の大文字と小文字は区別しない
 * - ソートは文字コード順。sort が無ければ id 順
 * - totalCount は検索のあとの件数。範囲外のページは空の data と元の totalCount
 * 不正なパラメータへの 400 は写していない (アプリは正しいパラメータしか送らない)。
 *
 * @example
 * // リクエスト: GET /api/facilitators?page=2
 * // レスポンス: { data: [{ id: 21, name: "先生21", loginId: "facilitator_21" }, …(先生30 まで 10 件)], totalCount: 30 }
 *
 * // リクエスト: GET /api/facilitators?search=1&sort=loginId&order=desc&limit=3
 * // レスポンス: { data: [facilitator_21, facilitator_19, facilitator_18 の 3 件], totalCount: 12 }
 *
 * // リクエスト: GET /api/facilitators?page=3 (範囲外)
 * // レスポンス: { data: [], totalCount: 30 }
 */
export function respondFacilitators(url: URL, records: FacilitatorRecord[]) {
  // 書かれていない値は、本物の API の既定 (1 ページ目、20 件) にする
  const params = url.searchParams;
  const page = Number(params.get("page") ?? "1");
  const limit = Number(params.get("limit") ?? "20");
  const sort = params.get("sort");
  const order = params.get("order");
  // 英字の大文字・小文字を区別しないよう小文字にそろえる。無ければ "" (全員に一致する)
  const search = (params.get("search") ?? "").toLowerCase();

  // 検索: 名前かログインID に検索語を含む先生だけ残す (filter は新しい配列を返し、元の並びは変えない)
  const matched = records.filter(
    (record) =>
      record.name.toLowerCase().includes(search) ||
      record.loginId.toLowerCase().includes(search),
  );
  // ソート: 文字コード順 (facilitator_1 → facilitator_10 → facilitator_2)。sort が無ければ id 順
  if (sort === "name" || sort === "loginId") {
    matched.sort((a, b) =>
      a[sort] < b[sort] ? -1 : a[sort] > b[sort] ? 1 : 0,
    );
    if (order === "desc") matched.reverse();
  }
  // ページ分割: page 番目の limit 件を切り出す。範囲外なら空。totalCount は切り出す前の件数
  const start = (page - 1) * limit;
  return {
    data: matched.slice(start, start + limit),
    totalCount: matched.length,
  };
}

export const handlers = [
  http.get("/api/facilitators", ({ request }) =>
    HttpResponse.json(
      respondFacilitators(new URL(request.url), defaultFacilitators),
    ),
  ),
];
