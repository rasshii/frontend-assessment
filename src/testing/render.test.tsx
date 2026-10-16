import { useQuery } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { useSearchParams } from "react-router";
import { describe, expect, test } from "vitest";
import { renderWithProviders } from "@/testing/render";

/** URL のクエリを読み、useQuery で取得した件数を表示する。プロバイダとルータの両方が要る */
function Probe() {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const { data } = useQuery({
    queryKey: ["probe", query],
    queryFn: async () => {
      const response = await fetch(`/api/facilitators?${query}`);
      return response.json();
    },
  });
  return (
    <p>
      {data ? `${data.totalCount}件中 ${data.data.length}件` : "読み込み中"}
    </p>
  );
}

describe("renderWithProviders (プロバイダとルータで包んで描画する)", () => {
  test("initialEntry の URL のクエリで取得した結果が描画される", async () => {
    renderWithProviders(<Probe />, { initialEntry: "/?page=2" });
    expect(await screen.findByText("30件中 10件")).toBeInTheDocument();
  });
});
