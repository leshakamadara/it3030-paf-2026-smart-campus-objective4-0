import { BrowserRouter, Routes, Route } from "react-router-dom"
import IncidentTicketingModule from "./pages/module-c-maintenance-incident-ticketing/IncidentTicketingModule"


export function App() {
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/tickets" element={<IncidentTicketingModule />} />

      </Routes>
    </BrowserRouter>
  
  )
}

export default App
