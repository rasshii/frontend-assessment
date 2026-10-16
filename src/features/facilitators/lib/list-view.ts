import type { FacilitatorListResult } from "@/features/facilitators/lib/facilitator";

/** 一覧の本体として出すもの。table は表・件数表示・ページャ、empty は 0 件の文言 */
export type ListBody = "none" | "table" | "empty";

/** 画面に出すもの */
export type ListView = {
  body: ListBody;
  showLoader: boolean;
  showErrorDialog: boolean;
};

/**
 * 手元の結果と取得の状態から、画面に出すものを決める。
 * - 本体: 結果が無い、または範囲外なら出さない。一覧なら表、0 件なら文言
 * - ローダー: 取得中か、結果が範囲外 (最終ページへ移るまで)。本体があればその上に重ねる
 * - エラーダイアログ: 失敗していて、取り直し中でない。
 *   リトライで取り直しているあいだは閉じてローダーを出し、また失敗したら開き直す
 */
export function getListView({
  result,
  isFetching,
  isError,
}: {
  result: FacilitatorListResult | undefined;
  isFetching: boolean;
  isError: boolean;
}): ListView {
  return {
    body: getBody(result),
    showLoader: isFetching || result?.kind === "outOfRange",
    showErrorDialog: isError && !isFetching,
  };
}

function getBody(result: FacilitatorListResult | undefined): ListBody {
  if (result === undefined || result.kind === "outOfRange") return "none";
  return result.kind === "list" ? "table" : "empty";
}
