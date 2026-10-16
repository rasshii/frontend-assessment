# 0005. 機能単位のディレクトリと、lint で止める依存の向き

## 状態

採用。

## 文脈

一覧の画面は、URL の条件、取得、判定 (取得中・失敗・0 件の出し分け)、表示を持ちます。どこに何を置くか、どこからどこを import してよいかを決め、レビューの注意に頼らずに守りたいです。

## 決定

- 先生や API の形を知っているものは `src/features/facilitators` に、知らないものは共有の層 (`src/components`・`src/lib`) に置く。組み立て (プロバイダ、ルータ) は `src/app`、テストの道具は `src/testing` に置く。
- import の向きは一方向にする。
  - `app` → `features` → 共有の層。共有の層は `features` と `app` を import しない。`features` は `app` を import しない。
  - `features` の中は `components` → `hooks` → `api` → `lib`。`lib` (純粋な関数、型、定数) は `features` の中のほかのディレクトリを import しない。部品 (`components`) は取得の仕組みを知らず、`api` も import しない (hook が返す値だけを使う)。
- `react-router` を import してよいのは、URL を読み書きする `features/*/hooks/use-facilitator-list-params.ts` と `app` (ルータの組み立て) とテストだけにする。`@tanstack/react-query` を import してよいのは、`app` と `features` の `api`・`hooks` とテストだけにする。
- `src/testing` は、テストのファイルと `src/testing` の中からだけ import する。
- import はすべて別名 `@/...` で書く。親への相対 import (`../`) も、同じディレクトリの相対 import (`./`) も使わない。
- 上の決まりは、oxlint の `no-restricted-imports` (置き場ごとの `overrides`) と `import/no-relative-parent-imports` で止める。`overrides` の先頭には `src` 全体の既定の範囲を置き、上に挙げた置き場のどれにも入らないファイルは、いちばん厳しい組 (`app`・`features`・`testing`・`react-router`・`@tanstack/react-query`・`./` をすべて止める) で止める。新しい置き場を作るときは、`.oxlintrc.json` にその置き場の範囲を、既定の範囲の後ろで、例外とテストの範囲より前に足す。
- 再 export だけのファイル (barrel file) は作らない。
- 役割は次のように分ける。外の仕組み (URL と取得) は `features` の `hooks` が画面の言葉に直す。出し分けの規則 (結果の分類、画面に何を出すか、ページャの番号) は、`features` の `lib` と共有の `src/lib` の純粋な関数に置く。ページの部品 (`facilitator-list-page`) は hook を呼び、返った値を部品に渡す。部品は渡された値を表示し、操作を関数で知らせる。
  - hook は 3 つに分ける。URL の条件を読み書きする `use-facilitator-list-params`、条件で取得する `use-facilitators`、範囲外の結果から最終ページへ移す `use-last-page-correction`。
  - 「同じ条件か」の判定は、URL を書き換える hook だけが持つ。検索の確定で URL が変わらなかったかは、その hook の返り値で知らせ、ページはそれを見て取り直しを呼ぶ。

## 根拠

- 知っている範囲で分けると、共有の部品は props だけで動き、先生の事情を知らずにテストできます。たとえば 1 ページの件数は `features` が持ち、共有のページャには引数で渡します。
- `features` の中の下の層ほど知っていることが少なく、単独でテストできます (`lib` の純粋な関数は、API の差し替えなしでユニットテストできる)。
- URL を読み書きする口を 1 つにすると、URL の決まり (既定値は書かない、操作ごとに履歴に積む、など) を直す場所が 1 か所にまとまります。部品が取得の仕組みを直接使わなければ、部品のテストは値を渡すだけで済みます。
- 出し分けの規則を純粋な関数に置くと、取得中・失敗・0 件・範囲外の組合せを、画面を描かずにユニットテストで確かめられます。hook が外の仕組みの状態を画面の言葉に直すので、部品は TanStack Query も React Router も知らず、部品のテストは値を渡すだけで済みます。ページのテストは、API の応答を差し替えて、hook と部品をつないだ流れを確かめます。
- hook を 3 つに分けると、URL を書き換える口が 1 つに保たれ、取得の hook は URL を知らずに条件だけを受け取ります。最終ページへの移動は、URL の操作と取得の結果の両方を使うので、どちらの hook にも入れずに分けています。同じ条件かの判定を 1 か所に置くのは、判定が 2 か所にあると、片方だけを直したときに、確定しても URL も変わらず取り直しもしない経路ができるためです。
- import をすべて `@/...` にすると、import の文字列だけで、どの層からどの層への import かが読めます。lint の規則は、この文字列で層を判定します。相対パスを許すと、同じ逆向きの import を `../features/...` と書き換えて規則をすり抜けられます。bulletproof-react の project standards も、ファイルを移しても import が壊れないことを理由に、`@/*` の絶対 import を常に使うことを勧めています。
- oxlint の `overrides` は、同じルールを同じファイルに当たる複数の範囲に書くと、後ろの範囲の設定で置き換えます (足し合わせない。oxlint 1.88.0 の動き)。この動きを使い、先頭の既定の範囲を、後ろの置き場ごとの範囲で置き換えています。置き場ごとの範囲は重ならないように分け、範囲ごとに当てる制限を全部並べています (「全体で `testing` を禁止」を 1 か所にだけ書くと、後ろの範囲で消えるため)。例外 (`use-facilitator-list-params.ts`、テスト) も、後ろの範囲で制限を外しています。既定の範囲があるので、置き場を間違えたファイルでも、制限のかかった import は検査から漏れずに止まります。テストの範囲がいちばん後ろにあるのも同じ理由で、置き場の範囲をテストの範囲より後ろに足すと、その置き場のテストが `testing` を import できなくなります。
- 止めたい 6 つの形 (別名での逆向き、相対パスでの逆向き、本体からの `testing`、許された場所以外からの `react-router`、部品からの `@tanstack/react-query`、`features` の `lib` からほかのディレクトリ) と、部品からの `api`、どの置き場にも入らないファイルからの制限のかかった import は、どれも error になります。許す import (テストからの `testing`、`use-facilitator-list-params.ts` からの `react-router`、`api` と `hooks` からの `@tanstack/react-query` など) は通ります。

## 採らなかった案

- **種類別のディレクトリ** (最上位に `components`・`hooks`・`utils` を並べる): 1 つの機能に関わるファイルが散ります。
- **barrel file**: どのファイルを import しているかが、import の文字列から読めなくなり、依存の向きの判定がしにくくなります。
- **同じディレクトリの中だけ相対パスで書く**: 層の判定を文字列で一律にできず、相対パスを lint で禁じられません。
- **依存の向きをレビューで守る**: 見落としを止められません。
