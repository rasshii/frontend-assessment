# 0002. pnpm 10 系と、Node.js の対応範囲

## 状態

採用

## 文脈

手元・CI・コンテナで、同じパッケージ管理の道具と Node.js の版を使いたいです。動かす人が入れる道具の手順も、1 つに決めて README に書きます。

## 決定

- パッケージ管理は pnpm 10 系にし、`package.json` の `packageManager` で `pnpm@10.34.6` に固定する。依存の版は `pnpm-lock.yaml` で固定する。
- Node.js は `package.json` の `engines.node` で 22.22 以上とし、手元・CI・コンテナでは 24 系を使う (`.node-version` に `24`)。
- README で案内する pnpm の入れ方は `npm install -g pnpm@10.34.6` の 1 つにする。

## 根拠

- pnpm は、既定では、プロジェクトの直接の依存だけを `node_modules` の直下に置きます。`package.json` に書いていないパッケージは import できません (pnpm の doc の「Motivation」と「pnpm vs npm」)。依存の書き漏れに、手元で気づけます。
- 10 系にするのは、導入の経路 (手元のバージョン管理の道具、CI、コンテナ、README の入れ方) を、この repo の中で確かめられるためです。npm の `latest-10` は 10.34.6 です。
- Node.js 22.22 以上: React Router 8.4.0 の `engines` が `>=22.22.0` です。pnpm は、プロジェクト自身の `engines` に合わない Node.js での導入を、設定によらず止めます (pnpm の doc の `engineStrict`)。そのため、この下限は README の前提として守られます。
- テストに使う jsdom 30.1.2 は、Node.js `^22.22.2 || ^24.15.0 || >=26.0.0` を求めます。アプリを動かすだけなら 22.22 以上で足りますが、テストまで含めて確かめたのは 24 系です。
- `npm install -g pnpm@10.34.6` は、Node.js に必ず付いてくる npm だけで済み、Corepack の有無に左右されません。

## 採らなかった案

- **npm**: この画面は npm でも作れます。採らないのは、npm が依存を平らに置くので、宣言していない依存を import しても通ってしまうためです (pnpm の doc の「pnpm vs npm」)。
- **pnpm 12 系** (npm の `latest`): ネイティブの実行ファイルに変わった系で、導入の経路 (CI、コンテナ) をこの repo の中で確かめていません。
- **`engines.node` を jsdom の範囲まで狭める**: テストを流さず、アプリを動かすだけの人の導入を妨げうるので、狭めません。
