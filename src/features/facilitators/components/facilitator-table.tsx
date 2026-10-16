import type { ReactNode } from "react";
import {
  SortHeaderButton,
  type SortState,
} from "@/components/sort-header-button";
import type {
  SortKey,
  SortOrder,
} from "@/features/facilitators/lib/list-params";

type FacilitatorTableProps = {
  sort: SortKey;
  order: SortOrder;
  onSortChange: (key: SortKey) => void;
  /** 行 (tbody)。行は別の部品にし、見出しの状態が変わっても行を描き直さないようにする */
  children: ReactNode;
};

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "名前" },
  { key: "loginId", label: "ログインID" },
];

/**
 * 先生の表の枠と見出しの行。列の幅は 288 / 288 / 224 (3 列目は見出しも中身も空)。
 * 見出しのセルには、ボタンと同じソートの状態を aria-sort で付ける。
 */
export function FacilitatorTable({
  sort,
  order,
  onSortChange,
  children,
}: FacilitatorTableProps) {
  function sortStateOf(key: SortKey): SortState {
    if (key !== sort) return "none";
    return order === "asc" ? "ascending" : "descending";
  }

  return (
    <table
      aria-label="先生の一覧"
      className="w-200 table-fixed border-collapse"
    >
      <colgroup>
        <col className="w-72" />
        <col className="w-72" />
        <col className="w-56" />
      </colgroup>
      <thead>
        <tr>
          {COLUMNS.map(({ key, label }) => (
            <th
              key={key}
              scope="col"
              aria-sort={sortStateOf(key)}
              className="border-r border-primary-2 p-0"
            >
              <SortHeaderButton
                label={label}
                sort={sortStateOf(key)}
                onClick={() => onSortChange(key)}
              />
            </th>
          ))}
          <td className="bg-on-surface-weak" />
        </tr>
      </thead>
      {children}
    </table>
  );
}
