import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

/*
 * ESLint は React Compiler 向けの検査 (eslint-plugin-react-hooks の recommended-latest) だけに使う。
 * ほかの lint は oxlint (.oxlintrc.json) が受け持つ。
 * typescript-eslint は、TSX の文法を読むパーサとしてだけ使う。
 * 型の情報を作る設定 (parserOptions.projectService) は書かず、各ファイルを文法だけで読む。
 */
export default defineConfig([
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { parser: tseslint.parser },
    extends: [reactHooks.configs.flat["recommended-latest"]],
  },
]);
