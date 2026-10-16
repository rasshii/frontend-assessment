import { AngleLeftIcon, AngleRightIcon } from "@/components/icons";
import { getPagerState } from "@/lib/pagination";

const edgeButtonClass =
  "flex h-6 w-12 items-center justify-center rounded bg-primary-4 text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-1 disabled:opacity-30";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

/**
 * ページャ。戻る・番号 (現在のページを中心に最大 5 個)・次へ。
 * 押されたページを onPageChange で知らせるだけで、URL は知らない。
 * 端のページでは戻る・次へを押せなくする。
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const { pageNumbers, canGoPrevious, canGoNext } = getPagerState(
    currentPage,
    totalPages,
  );
  return (
    <nav aria-label="ページ送り" className="flex items-center gap-4">
      <button
        type="button"
        aria-label="前のページ"
        disabled={!canGoPrevious}
        onClick={() => onPageChange(currentPage - 1)}
        className={edgeButtonClass}
      >
        <AngleLeftIcon />
      </button>
      <ul className="flex gap-2">
        {pageNumbers.map((page) => {
          const current = page === currentPage;
          return (
            <li key={page}>
              <button
                type="button"
                aria-current={current ? "page" : undefined}
                onClick={() => onPageChange(page)}
                className={`size-6 rounded text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-1 ${current ? "bg-primary-1 text-white" : "bg-primary-4 text-on-surface"}`}
              >
                {page}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        aria-label="次のページ"
        disabled={!canGoNext}
        onClick={() => onPageChange(currentPage + 1)}
        className={edgeButtonClass}
      >
        <AngleRightIcon />
      </button>
    </nav>
  );
}
