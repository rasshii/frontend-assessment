import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation, useNavigate, useNavigationType } from "react-router";
import { describe, expect, it } from "vitest";
import { useFacilitatorListParams } from "@/features/facilitators/hooks/use-facilitator-list-params";
import { renderWithProviders } from "@/testing/render";

/** hook が返す条件と URL を表示し、4 つの操作と「戻る」をボタンで呼ぶ */
function Probe() {
  const { params, changePage, replacePage, toggleSort, submitSearch } =
    useFacilitatorListParams();
  const location = useLocation();
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  return (
    <>
      <p data-testid="params">{JSON.stringify(params)}</p>
      <p data-testid="search">{location.search}</p>
      <p data-testid="navigation-type">{navigationType}</p>
      <button type="button" onClick={() => changePage(2)}>
        2 ページへ
      </button>
      <button type="button" onClick={() => replacePage(2)}>
        2 ページに置き換え
      </button>
      <button type="button" onClick={() => toggleSort("name")}>
        名前
      </button>
      <button type="button" onClick={() => toggleSort("loginId")}>
        ログインID
      </button>
      <button type="button" onClick={() => submitSearch("  先生 ")}>
        検索
      </button>
      <button type="button" onClick={() => void navigate(-1)}>
        戻る
      </button>
    </>
  );
}

function currentSearch() {
  return screen.getByTestId("search").textContent;
}

function currentParams() {
  return JSON.parse(screen.getByTestId("params").textContent ?? "") as unknown;
}

describe("useFacilitatorListParams", () => {
  it("URL のクエリを一覧の条件として返す", () => {
    renderWithProviders(<Probe />, {
      initialEntry: "/?page=3&sort=loginId&order=desc&search=abc",
    });

    expect(currentParams()).toEqual({
      page: 3,
      sort: "loginId",
      order: "desc",
      search: "abc",
    });
  });

  it("ページを変えると履歴に積む (戻ると前の URL)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Probe />);

    await user.click(screen.getByRole("button", { name: "2 ページへ" }));
    expect(currentSearch()).toBe("?page=2");

    await user.click(screen.getByRole("button", { name: "戻る" }));
    expect(currentSearch()).toBe("");
  });

  it("ページを置き換えると履歴を置き換える (戻ると、置き換えた URL の前へ)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Probe />);

    await user.click(screen.getByRole("button", { name: "ログインID" }));
    await user.click(
      screen.getByRole("button", { name: "2 ページに置き換え" }),
    );
    expect(currentSearch()).toBe("?page=2&sort=loginId");

    await user.click(screen.getByRole("button", { name: "戻る" }));
    expect(currentSearch()).toBe("");
  });

  it("ソートを切り替えると 1 ページ目に戻る", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Probe />, { initialEntry: "/?page=3" });

    await user.click(screen.getByRole("button", { name: "名前" }));
    expect(currentSearch()).toBe("?order=desc");

    await user.click(screen.getByRole("button", { name: "ログインID" }));
    expect(currentSearch()).toBe("?sort=loginId");
  });

  it("検索を確定すると、前後の空白を除いた検索語で 1 ページ目に戻る", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Probe />, { initialEntry: "/?page=2" });

    await user.click(screen.getByRole("button", { name: "検索" }));

    // URL にも整えた検索語だけが載る (空白が残ると、同じ検索語でも別の URL になる)
    expect(currentSearch()).toBe(`?${new URLSearchParams({ search: "先生" })}`);
    expect(currentParams()).toEqual({
      page: 1,
      sort: "name",
      order: "asc",
      search: "先生",
    });
  });

  it("URL が変わらない操作では、履歴を積まない", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Probe />, { initialEntry: "/?page=2" });

    await user.click(screen.getByRole("button", { name: "2 ページへ" }));

    expect(screen.getByTestId("navigation-type").textContent).toBe("POP");
  });
});
