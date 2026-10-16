import { AngleDownIcon } from "@/components/icons";

/** 列のソートの状態。aria-sort と同じ値にして、表の見出しのセルにそのまま付けられるようにする */
export type SortState = "none" | "ascending" | "descending";

type SortHeaderButtonProps = {
  label: string;
  sort: SortState;
  onClick: () => void;
};

/**
 * 表の列見出しのボタン。押したときに何が起きるかは知らず、onClick で知らせるだけ。
 * ソート中の列は濃い背景と白の山形、ほかの列は薄い背景と灰色の山形。降順は山形を上下に反転する。
 */
export function SortHeaderButton({
  label,
  sort,
  onClick,
}: SortHeaderButtonProps) {
  const active = sort !== "none";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 w-full items-center justify-between pr-2 pl-4 text-xs font-semibold text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${active ? "bg-primary-1" : "bg-on-surface-weak"}`}
    >
      {label}
      <AngleDownIcon
        className={`${active ? "text-white" : "text-primary-2"} ${sort === "descending" ? "rotate-180" : ""}`}
      />
    </button>
  );
}
