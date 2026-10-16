import { BrowserRouter, Route, Routes } from "react-router";
import { FacilitatorListPage } from "@/features/facilitators/components/facilitator-list-page";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FacilitatorListPage />} />
      </Routes>
    </BrowserRouter>
  );
}
