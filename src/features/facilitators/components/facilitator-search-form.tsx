import { type FormEvent, useState } from "react";
import { SearchIcon } from "@/components/icons";

type FacilitatorSearchFormProps = {
  /** URL の検索語 */
  search: string;
  /** 確定した入力 (整形の前) を知らせる */
  onSubmit: (input: string) => void;
};

/**
 * 先生の検索欄。Enter か検索アイコンで確定する。
 * 入力中の文字はこの中の state だけで持ち、確定したときだけ知らせる (打つたびに URL や一覧を動かさない)。
 * URL の検索語が外から変わったとき (戻る・進む) だけ、入力をそれに合わせる。
 * 合わせ方は effect を使わず、描画中に前の検索語と比べる (react.dev の「props が変わったときに state を合わせる」形)。
 * 要素は作り直さない (key で作り直すと、確定のたびにフォーカスが外れる)。
 */
export function FacilitatorSearchForm({
  search,
  onSubmit,
}: FacilitatorSearchFormProps) {
  const [input, setInput] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setInput(search);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(input);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-84">
      <input
        type="text"
        name="search"
        aria-label="名前、ログインIDで検索"
        placeholder="名前、ログインIDで検索"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        className="h-10 w-full rounded border border-primary-2 bg-surface-1 pr-12 pl-4 text-base font-light text-on-surface placeholder:text-on-surface-weak focus-visible:outline-2 focus-visible:outline-primary-1"
      />
      <button
        type="submit"
        aria-label="検索"
        className="absolute top-2 right-2 text-on-surface focus-visible:outline-2 focus-visible:outline-primary-1"
      >
        <SearchIcon />
      </button>
    </form>
  );
}
