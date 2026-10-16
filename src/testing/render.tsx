import { QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { createQueryClient } from "@/app/query-client";

type RenderWithProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  /** 描画を始める URL (パスとクエリ)。既定は "/" */
  initialEntry?: string;
};

/**
 * 部品を QueryClientProvider とルータで包んで描画する。
 * QueryClient は本体と同じ関数で、呼ぶたびに新しく作る (テストどうしでキャッシュを混ぜない)。
 * ルータはブラウザの URL ではなくメモリの上の URL を使うので、テストごとに最初の URL を決められる。
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialEntry = "/", ...options }: RenderWithProvidersOptions = {},
) {
  const queryClient = createQueryClient();
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }
  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient };
}
