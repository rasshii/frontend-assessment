# 0006. 再描画の抑制を React Compiler に任せ、描画回数のテストで裏付ける

## 状態

採用。描画回数のテストの結果 (React Compiler を外したときの回数を含む) は、画面を作る変更で足します。ESLint と oxlint の両方を流す lint の段 (scripts と CI) は、scripts と CI を足す変更で入れます。

## 文脈

一覧は、検索欄への入力、ページ送り、ソートのたびに状態が変わります。表の行は一覧の中でいちばん数が多い部分なので、要らない描画を減らしたいです。

## 決定

- まず状態の置き場所で、描画の範囲を狭める (検索欄の入力中の文字は検索欄の中だけで持つ、など)。
- 残りは React Compiler に任せる。組み込みは `@vitejs/plugin-react` の `reactCompilerPreset` と `@rolldown/plugin-babel` で行い、build とテストの両方で掛ける。
- 手書きの `memo`・`useCallback`・`useMemo` は原則として書かない。コンパイラが最適化できない書き方は lint で見つけて、書き方を直す。ルールを無効にするコメントは書かない。
- コンパイラ向けの検査には `eslint-plugin-react-hooks` の `recommended-latest` を使う。lint は ESLint (この組) と oxlint の両方を流し、どちらかが error を出せば止める。
- 効果は、行の部品の描画回数を数える部品テストで示す。

## 根拠

- react.dev の React Compiler の解説は、新しいコードではメモ化をコンパイラに任せることを勧めています。
- 手書きのメモ化は、依存の書き漏れや、インラインで書いた関数のために、気づかないまま効かなくなります。
- コンパイラが掛かっていることは、build の出力で分かります。`pnpm build` の出力には、コンパイラが足すメモ化の目印 (`react.memo_cache_sentinel`) が入り (たとえば `App` と `AppRouter` に)、組み込みの行を外すと消えます (react-dom にある 1 個は React の実行時のもので、組み込みに関わらず残ります)。この目印は、部品の中で props や状態に依存しない部分をメモ化したときに出るもので、どの部品にも出るわけではありません。テストも同じ `vite.config.ts` の plugins で変換され、テストの中の `App` と `AppRouter` にも同じ目印があります。表の行の部品にコンパイラが効いていることは、コンパイラを外したときと入れたときの描画回数のテストで示します。
- `eslint-plugin-react-hooks` は React チームが出しているプラグインで、コンパイラ本体 (`babel-plugin-react-compiler`) を中に含み、それで部品を解析して検査します。hook の呼び方の決まりと、コンパイラが最適化をあきらめる書き方 (描画中の setState、描画中に結果が変わる関数を呼ぶ、など) を見つけます。
- oxlint 1.88.0 にも、この組の 17 個のうち 15 個と同じ名前のルールがあります (無いのは `config` と `gating`)。この repo の oxlint の設定 (correctness を error) では、描画中の setState (`react/set-state-in-render`)、描画中の `Date.now()` (`react/purity`)、effect の依存の書き漏れ (`exhaustive-deps`) が error になります。`exhaustive-deps` は ESLint の組では warn なので、依存の書き漏れは oxlint のほうが厳しく止めます。両方を流すのは、それぞれの厳しいほうで止めるためです。

## 採らなかった案

- **手書きの `memo`・`useCallback`・`useMemo` を全体に書く**: 上の理由で、効いているかを人が保ち続けることになります。
- **`eslint-plugin-react-hooks` の `recommended`**: README は `recommended` をすべての推奨のルール、`recommended-latest` を実験的なものを含む最新のコンパイラのルールと書いています。入っている 7.1.1 での違いは、`recommended-latest` にだけ `react-hooks/void-use-memo` が入ることです。コンパイラに任せる前提なので、コンパイラ向けの検査の多い組を選びます。
- **コンパイラ向けの検査を oxlint だけで行い、ESLint を外す**: oxlint の同名のルールは oxlint の中の別の実装で、コンパイラ本体を使いません (oxlint のパッケージの依存はネイティブのバイナリだけで、`babel-plugin-react-compiler` を含みません)。コンパイラ本体で部品を解析する検査が無くなります。
