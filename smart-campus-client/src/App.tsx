import { BrowserRouter, Routes, Route } from "react-router-dom"
import IncidentTicketingModule from "./pages/module-c-maintenance-incident-ticketing/IncidentTicketingModule"
import UserTicketPortal from "./pages/module-c-maintenance-incident-ticketing/UserTicketPortal"

export function App() {
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/tickets" element={<IncidentTicketingModule />} />
        <Route path="/ticket" element={<UserTicketPortal />} />
      </Routes>
    </BrowserRouter>
  
  )
}

export default App
