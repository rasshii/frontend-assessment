# 0003. CORS を同じオリジンの中継で越える

## 状態

採用

## 文脈

一覧のデータは `https://frontend-assessment-630736206587.asia-northeast1.run.app/api/facilitators` から取得します。この API は CORS を許可していません。`Origin` を変えて要求しても `Access-Control-Allow-Origin` が返らず、別のオリジンのページからブラウザで `fetch` すると失敗します (実測)。

## 決定

- アプリのコードは、常に相対パスの `/api/facilitators` を呼ぶ。
- 開発サーバ (`vite`) が `/api` を同じオリジンで受け、API へ中継する。`vite.config.ts` の `server.proxy` に `/api` → API のオリジンを書き、`changeOrigin: true` で中継する要求の `Host` ヘッダを API のホスト名にする。API 自身が `/api/facilitators` にあるので、パスは書き換えない。
- API のオリジンを書くのは、`vite.config.ts` の定数 1 か所にする。

## 根拠

- ブラウザから見て同じオリジンの `/api` にすれば、CORS の制限は掛かりません。中継はサーバ (開発サーバの Node.js) から API への通信なので、CORS の対象外です。
- アプリは相対パスだけを知ればよく、API がどこにあるかを知りません。中継先を変えるときに、アプリのコードは変わりません。
- `vite preview` の `preview.proxy` の既定値は `server.proxy` です (Vite の doc の preview options)。そのため、ビルドしたものを `vite preview` で配るとき (予定している起動用のコンテナ) にも、同じ中継が効きます。`vite preview` は手元での確認用で、本番向けのサーバではありません (Vite の doc)。本番での配布は、この repo の範囲の外です。

## 採らなかった案

- **`fetch` に `mode: 'no-cors'` を付ける**: 中身を読めない応答 (opaque response) になり、一覧を作れません。
- **第三者の CORS プロキシを使う**: 外部のサービスの状態に、画面が動くかどうかが左右されます。
- **中継用のサーバを自前で書く**: Vite の設定 1 つで足りるのに、動かすものが増えます。
