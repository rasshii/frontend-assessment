import { getDisplayRange } from "@/lib/pagination";

type ResultCountProps = {
  totalCount: number;
  page: number;
  pageSize: number;
};

/**
 * 件数表示「N件中 a〜b件を表示」。
 * page には表示している結果が要求したページを渡す (前の結果を出しているあいだも、表の行と合わせるため)。
 */
export function ResultCount({ totalCount, page, pageSize }: ResultCountProps) {
  const { from, to } = getDisplayRange(page, pageSize, totalCount);
  return (
    <p className="text-xs font-light text-on-surface">
      {totalCount}件中 {from}〜{to}件を表示
    </p>
  );
}
