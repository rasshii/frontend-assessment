import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { createQueryClient } from "@/app/query-client";
import { AppRouter } from "@/app/router";

export function App() {
  // 関数を渡すと、React は最初の描画のときだけ呼んで戻り値を持ち続ける (描画のたびに作り直さない)
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}
