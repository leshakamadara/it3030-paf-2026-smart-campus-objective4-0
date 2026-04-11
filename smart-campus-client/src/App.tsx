import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminResourceCreatePage from "./pages/resource/AdminResourceCreatePage";
import AdminResourceEditPage from "./pages/resource/AdminResourceEditPage";
import ResourceDetailsPage from "./pages/resource/ResourceDetailsPage";
import ResourceListPage from "./pages/resource/ResourceListPage";
import ResourceStatsPage from "./pages/resource/ResourceStatsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/resources" replace />} />
        <Route path="/resources" element={<ResourceListPage />} />
        <Route path="/resources/:id" element={<ResourceDetailsPage />} />
        <Route path="/admin/resources/create" element={<AdminResourceCreatePage />} />
        <Route path="/admin/resources/edit/:id" element={<AdminResourceEditPage />} />
        <Route path="/admin/resources/stats" element={<ResourceStatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}