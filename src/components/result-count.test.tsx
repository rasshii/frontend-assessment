import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ResultCount } from "@/components/result-count";

it("総件数と、表示している範囲を出す", () => {
  render(<ResultCount totalCount={30} page={2} pageSize={20} />);

  expect(screen.getByText("30件中 21〜30件を表示")).toBeInTheDocument();
});
