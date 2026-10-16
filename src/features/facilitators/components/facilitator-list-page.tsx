import { EmptyMessage } from "@/components/empty-message";
import { ErrorDialog } from "@/components/error-dialog";
import { TeacherIcon } from "@/components/icons";
import { Loader } from "@/components/loader";
import { Pagination } from "@/components/pagination";
import { ResultCount } from "@/components/result-count";
import { FacilitatorRows } from "@/features/facilitators/components/facilitator-rows";
import { FacilitatorSearchForm } from "@/features/facilitators/components/facilitator-search-form";
import { FacilitatorTable } from "@/features/facilitators/components/facilitator-table";
import { useFacilitatorListParams } from "@/features/facilitators/hooks/use-facilitator-list-params";
import { useFacilitators } from "@/features/facilitators/hooks/use-facilitators";
import { useLastPageCorrection } from "@/features/facilitators/hooks/use-last-page-correction";
import { PAGE_SIZE } from "@/features/facilitators/lib/facilitator";
import { normalizeSearch } from "@/features/facilitators/lib/list-params";
import { getTotalPages } from "@/lib/pagination";

/**
 * 先生の一覧のページ。hook を呼び、返った値を部品に渡すだけで、出し分けの規則と取得の仕組みは持たない。
 * 操作部品 (ソートの列、選択中のページ、検索欄) は URL の条件から、行と件数表示は取得結果から決める。
 */
export function FacilitatorListPage() {
  const { params, changePage, replacePage, toggleSort, submitSearch } =
    useFacilitatorListParams();
  const { result, isCurrent, view, retry } = useFacilitators(params);
  useLastPageCorrection({ result, isCurrent, replacePage });

  /** 確定した条件がいまと同じなら取り直す (同じ検索語で確定しても、取得し直す) */
  function handleSearch(input: string) {
    if (normalizeSearch(input) === params.search && params.page === 1) {
      retry();
      return;
    }
    submitSearch(input);
  }

  /*
   * 行の要素は取得結果だけから先に作る。下の条件の中に書くと、React Compiler が表のまとまりと一緒に覚え、
   * ページ番号やソートが変わるたびに行の要素も作り直す (行のデータが同じでも、行の部品が描き直される)。
   */
  const rows = result !== undefined && (
    <FacilitatorRows facilitators={result.facilitators} />
  );

  return (
    <main className="mx-auto w-200 pt-6 pb-10">
      <div className="flex h-10 items-center justify-between">
        <h1 className="flex items-center gap-4 text-2xl font-semibold text-on-surface">
          <TeacherIcon />
          先生
        </h1>
        <FacilitatorSearchForm search={params.search} onSubmit={handleSearch} />
      </div>
      <section
        aria-label="検索結果"
        aria-busy={view.showLoader}
        className="mt-6"
      >
        {view.body === "table" && result !== undefined && (
          <>
            <FacilitatorTable
              sort={params.sort}
              order={params.order}
              onSortChange={toggleSort}
            >
              {rows}
            </FacilitatorTable>
            <div className="mt-6 flex items-center justify-between">
              <ResultCount
                totalCount={result.totalCount}
                page={result.page}
                pageSize={PAGE_SIZE}
              />
              <Pagination
                currentPage={params.page}
                totalPages={getTotalPages(result.totalCount, PAGE_SIZE)}
                onPageChange={changePage}
              />
            </div>
          </>
        )}
        {view.body === "empty" && (
          <div className="pt-4 pl-4">
            <EmptyMessage />
          </div>
        )}
      </section>
      {view.showLoader && <Loader />}
      <ErrorDialog open={view.showErrorDialog} onRetry={retry} />
    </main>
  );
}
