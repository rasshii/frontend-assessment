import { BrowserRouter, Route, Routes } from "react-router";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<p className="text-primary-1">先生一覧 (準備中)</p>}
        />
      </Routes>
    </BrowserRouter>
  );
}
