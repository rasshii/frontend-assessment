# 0010. スタイルは Tailwind CSS v4、ダイアログは Base UI

## 状態

採用

## 文脈

見た目は Zeplin のデザインに合わせます。デザインには名前の付いた色 (primary_1〜4、on_surface、on_surface_weak、surface_1、surface_2) とフォントがあり、画面のどの部品もこれを使います。

通信エラーのときはダイアログを出します ([ADR 0009](0009-fetch-failure-handling.md))。ダイアログは、開いたときのフォーカスの移動や、背後の画面の扱いなど、見た目のほかに守ることが多い部品です。どう書いてスタイルを当てるかと、ダイアログを何で作るかを決めます。

## 決定

- スタイルは Tailwind CSS v4 で書く。Vite には `@tailwindcss/vite` で組み込む。
- デザインの色とフォントは `src/index.css` の `@theme` に置く。色の名前はデザインに合わせる (`primary-1`〜`primary-4`、`on-surface`、`on-surface-weak`、`surface-1`、`surface-2`)。
- エラーダイアログは Base UI (`@base-ui/react` 1.9.0) の AlertDialog で作る (`src/components/error-dialog.tsx`)。Base UI を使うのはこのダイアログだけにする。
- ダイアログの開閉は `open` だけで決め、`onOpenChange` を渡さない。Esc と外側の押下では閉じない。
- Base UI の peer 依存のうち、任意のもの (`date-fns`・`@date-fns/tz`) は入れない。

## 根拠

- Tailwind CSS v4 は、デザインの色とフォントを CSS の `@theme` に置くと、その名前のクラス (`bg-primary-1`、`text-on-surface` など) が使えます。名前をデザインに合わせたので、デザインの指定とコードのクラスを同じ名前で照らし合わせられます。
- Tailwind CSS は、CSS をビルドのときに作ります。
- Base UI の AlertDialog は、`role="alertdialog"` を付け、開くとダイアログの中のボタンへフォーカスを移し、背後の画面を読み上げから外します。これらを自前で書かずに済みます。開くと「リトライ」にフォーカスが移ることは、ユニットテスト (`src/components/error-dialog.test.tsx`) で確かめています。
- AlertDialog は、外側の押下をもともと閉じる理由にしません (`@base-ui/react` 1.9.0 の `dialog/root/useRenderDialogRoot.mjs` で、AlertDialog のときは `disablePointerDismissal` が常に真になり、`modal` も常に真になる)。Esc で閉じようとしたときは `onOpenChange` で知らせますが、それを渡さないので `open` は変わらず、閉じません。ダイアログを閉じるのは、リトライで取り直しが始まったときだけです ([ADR 0009](0009-fetch-failure-handling.md))。Esc と外側の押下で閉じないことは、ユニットテストで確かめています。
- Base UI の部品は見た目を持たないので、Tailwind CSS のクラスで Zeplin の見た目に合わせられます。
- `date-fns` と `@date-fns/tz` は、Base UI の `peerDependenciesMeta` で任意 (`optional: true`) とされているので、入れていません。

## 採らなかった案

- **素の CSS (CSS Modules)**: デザインの色は CSS の変数で持てますが、部品ごとに CSS のファイルとクラスの名前を別に書き、行き来することになります。
- **`<dialog>` 要素を手で書く**: 開いたときのフォーカスの移動や、背後の画面の扱いを自前で書くことになり、抜けやすくなります。
