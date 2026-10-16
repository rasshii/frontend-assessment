/** ページャに出す番号の最大の数 */
const MAX_PAGE_NUMBERS = 5;

/** 総件数と 1 ページの件数から、総ページ数を返す。0 件なら 0。 */
export function getTotalPages(totalCount: number, pageSize: number) {
  return Math.ceil(totalCount / pageSize);
}

/**
 * ページャに出す番号の並びと、戻る・次へを押せるかを返す。
 *
 * 番号は現在のページを中心に最大 5 個。端に寄ったら、数を保ったまま内側へずらす。
 * 条件を変えた直後は前の結果を引き継いで出すので、現在のページ (URL) が
 * 総ページ数 (前の結果) を超えることがある。そのときは総ページ数までの番号を出し、
 * 現在のページの番号は並びに入らない (選択中の番号が無い)。
 *
 * @example
 * getPagerState(5, 10) // { pageNumbers: [3, 4, 5, 6, 7], canGoPrevious: true, canGoNext: true }
 * getPagerState(3, 2) // { pageNumbers: [1, 2], canGoPrevious: true, canGoNext: false }
 */
export function getPagerState(currentPage: number, totalPages: number) {
  const count = Math.min(MAX_PAGE_NUMBERS, totalPages);
  const first = Math.min(
    Math.max(currentPage - Math.floor(count / 2), 1),
    totalPages - count + 1,
  );
  return {
    pageNumbers: Array.from({ length: count }, (_, i) => first + i),
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  };
}

/**
 * 件数表示の「a〜b件」の a と b を返す。
 * page には、表示している結果が要求したページを渡す (URL のページではない)。
 * 前の結果を出しているあいだも、件数表示が表の行と食い違わないようにするため。
 */
export function getDisplayRange(
  page: number,
  pageSize: number,
  totalCount: number,
) {
  return {
    from: (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, totalCount),
  };
}
