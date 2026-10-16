import { z } from "zod";

/** ソートできる列 */
export type SortKey = "name" | "loginId";

/** ソートの向き */
export type SortOrder = "asc" | "desc";

/** 一覧の条件。正本は URL のクエリで、この形はそれを解釈したもの */
export type ListParams = {
  page: number;
  sort: SortKey;
  order: SortOrder;
  search: string;
};

/** 既定の条件 (1 ページ目、名前の昇順、検索語なし)。既定値は URL に書かない */
export const DEFAULT_LIST_PARAMS: ListParams = {
  page: 1,
  sort: "name",
  order: "asc",
  search: "",
};

/** 検索語を整える。前後の空白 (全角を含む) を除き、空白だけなら検索語なしにする */
export function normalizeSearch(input: string) {
  return input.trim();
}

/**
 * URL のクエリの解釈。値が無い・解釈できないときは、項目ごとに既定値にする (.catch)。
 * ページは 1 以上の整数の表記だけを受ける ("0"、"1.5"、"01"、"abc" は 1 ページ目)。
 * 安全な整数に収まらない桁数も 1 ページ目にする (数にすると Infinity や指数表記になり、API に送れないため)。
 */
const listParamsSchema = z.object({
  page: z
    .string()
    .regex(/^[1-9][0-9]*$/)
    .transform(Number)
    .refine(Number.isSafeInteger)
    .catch(DEFAULT_LIST_PARAMS.page),
  sort: z.enum(["name", "loginId"]).catch(DEFAULT_LIST_PARAMS.sort),
  order: z.enum(["asc", "desc"]).catch(DEFAULT_LIST_PARAMS.order),
  search: z
    .string()
    .transform(normalizeSearch)
    .catch(DEFAULT_LIST_PARAMS.search),
});

/** URL のクエリを一覧の条件に解釈する */
export function parseListParams(searchParams: URLSearchParams): ListParams {
  return listParamsSchema.parse({
    page: searchParams.get("page"),
    sort: searchParams.get("sort"),
    order: searchParams.get("order"),
    search: searchParams.get("search"),
  });
}

/** 一覧の条件を URL のクエリに書き出す。既定値と同じ項目は書かない */
export function toSearchParams(params: ListParams) {
  const searchParams = new URLSearchParams();
  if (params.page !== DEFAULT_LIST_PARAMS.page) {
    searchParams.set("page", String(params.page));
  }
  if (params.sort !== DEFAULT_LIST_PARAMS.sort) {
    searchParams.set("sort", params.sort);
  }
  if (params.order !== DEFAULT_LIST_PARAMS.order) {
    searchParams.set("order", params.order);
  }
  if (params.search !== DEFAULT_LIST_PARAMS.search) {
    searchParams.set("search", params.search);
  }
  return searchParams;
}

/**
 * 列見出しを押したあとのソート状態。
 * ソート中の列なら向きを入れ替え、別の列ならその列の昇順にする。
 */
export function getNextSort(
  current: Pick<ListParams, "sort" | "order">,
  clicked: SortKey,
): Pick<ListParams, "sort" | "order"> {
  if (current.sort === clicked) {
    return { sort: clicked, order: current.order === "asc" ? "desc" : "asc" };
  }
  return { sort: clicked, order: "asc" };
}
