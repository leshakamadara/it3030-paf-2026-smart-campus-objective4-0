import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ResourceDetailsPage from "./pages/resource/ResourceDetailsPage";
import ResourceListPage from "./pages/resource/ResourceListPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/resources" replace />} />
        <Route path="/resources" element={<ResourceListPage />} />
        <Route path="/resources/:id" element={<ResourceDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
}