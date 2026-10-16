import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { createQueryClient } from "@/app/query-client";
import { AppRouter } from "@/app/router";
import { AppHeader } from "@/components/app-header";

export function App() {
  // 関数を渡すと、React は最初の描画のときだけ呼んで戻り値を持ち続ける (描画のたびに作り直さない)
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* デザインの基準幅 1024px より狭い画面では、縮めずに横スクロールにする */}
      <div className="min-w-[1024px]">
        <AppHeader />
        <AppRouter />
      </div>
    </QueryClientProvider>
  );
}
