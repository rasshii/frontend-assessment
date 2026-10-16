import { AlertDialog } from "@base-ui/react/alert-dialog";

type ErrorDialogProps = {
  open: boolean;
  onRetry: () => void;
};

/**
 * 通信エラーのダイアログ。ボタンは「リトライ」だけ。
 * 開閉は open だけで決め、onOpenChange を渡さない。Esc や外側の押下で Base UI が閉じようとしても
 * open が変わらないので閉じない (閉じるのは、リトライで取り直しが始まったとき)。
 */
export function ErrorDialog({ open, onRetry }: ErrorDialogProps) {
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-on-surface/40" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 flex w-80 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6 rounded bg-surface-1 p-6 shadow-lg">
          <AlertDialog.Title className="text-base font-semibold text-on-surface">
            通信エラーが発生しました。
          </AlertDialog.Title>
          <button
            type="button"
            onClick={onRetry}
            className="h-8 rounded bg-primary-1 px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-1"
          >
            リトライ
          </button>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
