/** 結果が 0 件のときの文言。文言はデザインに合わせる (課題の PDF の「該当するデータがありません。」とは違う) */
export function EmptyMessage() {
  return (
    <p className="text-base font-light text-on-surface-weak">
      該当するデータはありません
    </p>
  );
}
