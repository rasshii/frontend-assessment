import type { Facilitator } from "@/features/facilitators/lib/facilitator";

type FacilitatorRowsProps = {
  facilitators: Facilitator[];
};

/**
 * 表の行。受け取るのは行のデータだけにする。取得中かどうかや検索欄の入力などが変わっても、
 * 行のデータが同じなら React Compiler がこの部品の描画を飛ばせるようにするため。
 * 長い値は 1 行のまま末尾を「…」で省く。
 */
export function FacilitatorRows({ facilitators }: FacilitatorRowsProps) {
  return (
    <tbody>
      {facilitators.map((facilitator) => (
        <tr
          key={facilitator.id}
          className="h-12 border-x border-b border-primary-3 odd:bg-surface-1 even:bg-surface-2"
        >
          <td className="truncate px-4 text-base font-light text-on-surface">
            {facilitator.name}
          </td>
          <td className="truncate px-4 text-xs font-light text-on-surface">
            {facilitator.loginId}
          </td>
          <td />
        </tr>
      ))}
    </tbody>
  );
}
