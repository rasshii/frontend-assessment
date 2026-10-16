# 0001. Vite + React の SPA にする

## 状態

採用

## 文脈

作るのは、API から取得した先生の一覧の画面 1 つです。ソート、検索、20 件ごとのページ分割、取得中のローダー、通信エラーのダイアログ、0 件のときの文言を持ちます。

API は CORS を許可していないので、ブラウザから別のオリジンとして直接は読めません。同じオリジンに見せる中継が要ります ([ADR 0003](0003-cors-proxy.md))。

一覧の条件 (ページ・ソート・検索語) は、リロードや戻る・進むで同じ一覧を出せるように、URL に置きます。

## 決定

- Vite でビルドと開発サーバを受け持つ、React の SPA にする。
- URL のクエリの読み書きには React Router の `useSearchParams` を使う。React Router は Declarative mode (`<BrowserRouter>` で包み、`<Routes>` と `<Route>` を並べる使い方) で使い、データの取得はほかの仕組み (TanStack Query) に任せる。
- TypeScript は 6.0 系にする。

## 根拠

- この画面に要るのは、1 画面のクライアントの UI と、CORS を越える中継の 2 つです。画面の状態と描画はクライアントで完結し、サーバ側で要るのは中継だけです。Vite は UI のビルドと開発サーバを受け持ち、中継は proxy の設定 1 つで足ります ([ADR 0003](0003-cors-proxy.md))。
- 成果物は静的なファイルなので、中継を配布の形ごとに差し替えられます (手元と、予定している起動用のコンテナでは Vite の proxy、静的な配信先なら配信先の rewrites)。
- この画面で示したいこと (責務の分け方、hook と部品の分割、再描画の抑制) は、クライアントのコードにあります。使わないサーバ側の機能を構成に入れると、説明する対象が増えます。
- React Router の `useSearchParams` を使うと、URL のクエリを React の状態として読み書きでき、戻る・進むでの再描画もルータが受け持ちます。代償は、Node.js の下限が 22.22 になることです (react-router 8.4.0 の `engines`。[ADR 0002](0002-pnpm-and-node.md))。
- TypeScript 6.0 系: Vite の公式の React テンプレートが `~6.0.2` を指定しています。lint に使う typescript-eslint 8.71 が対応する TypeScript は `>=4.8.4 <6.1.0` です (パッケージの `peerDependencies`)。

## 採らなかった案

- **Next.js**: 同じことはできます (rewrites で中継できる)。採らない主な理由は、この課題で使わない機能 (サーバ側の描画、サーバコンポーネント、ファイルの置き場所によるルーティングの規約) が構成に入ることです。加えて、静的な書き出し (`output: 'export'`) では Rewrites と Proxy が使えず (Next.js の doc の Static Exports)、中継を配布の形ごとに差し替える形にできません。
- **URL の状態に nuqs を使う**: React Router と組み合わせるにはアダプタ (`NuqsAdapter`) で包む必要があり、履歴の既定は「置き換え」(`history: 'replace'`) です (nuqs の README)。この画面では条件を変える操作をすべて履歴に積みたいので、既定を変えて使うことになり、道具が 1 つ増える割に得るものがありません。
- **History API を自前で購読する**: 戻る・進むの購読と、それに合わせた再描画の連携を自分で書くことになります。
- **TypeScript 7 系**: 周辺の道具 (typescript-eslint など) との互換を確かめていません。
