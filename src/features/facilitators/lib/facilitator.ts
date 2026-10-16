/** 1 ページに出す先生の数 (API に limit として送る) */
export const PAGE_SIZE = 20;

/** 先生の 1 行 (API の応答の data の 1 件) */
export type Facilitator = {
  id: number;
  name: string;
  loginId: string;
};

/**
 * 取得結果の分類。
 * - list: 行が 1 件以上ある
 * - empty: 条件に合う先生が 0 件
 * - outOfRange: 要求したページが最終ページより後ろ (最終ページへ移す)
 *
 * 行が空なのに総件数があり、ページも範囲内という矛盾した応答は、
 * 取得関数が失敗として投げるので、ここには無い。
 */
export type FacilitatorListKind = "list" | "empty" | "outOfRange";

/** 取得結果。分類は取得関数が 1 回だけ決め、表示と最終ページへの移動はそれを読むだけにする。 */
export type FacilitatorListResult = {
  kind: FacilitatorListKind;
  facilitators: Facilitator[];
  totalCount: number;
  /** この結果を取るときに要求したページ。前の結果を出しているあいだも、件数表示を行と合わせるため */
  page: number;
};
