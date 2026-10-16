/**
 * 取得中のローダー。画面 (ビューポート) の中央に重ねて出す。
 * 前の一覧の上に重ねても操作を止めないよう、クリックやタップは下の要素へ通す (pointer-events-none)。
 * 回る輪は飾りなので読み上げから外し、名前は role="status" の要素が持つ。
 */
export function Loader() {
  return (
    <div
      role="status"
      aria-label="読み込み中"
      className="pointer-events-none fixed inset-0 flex items-center justify-center"
    >
      <div
        aria-hidden="true"
        className="size-10 animate-spin rounded-full border-4 border-primary-3 border-t-primary-1"
      />
    </div>
  );
}
