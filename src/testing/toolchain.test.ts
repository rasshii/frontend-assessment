import { expect, test } from "vitest";

test("テストの道具が動く", () => {
  document.body.innerHTML = "<p>先生</p>";
  expect(document.querySelector("p")).toHaveTextContent("先生");
});
