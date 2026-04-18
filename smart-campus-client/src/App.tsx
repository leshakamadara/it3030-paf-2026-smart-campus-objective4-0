import { Navigate, NavLink, Route, Routes } from "react-router-dom";

import { AdminBookingsPage } from "@/pages/bookings/AdminBookingsPage";
import { BookingDetailPage } from "@/pages/bookings/BookingDetailPage";
import { CreateBookingPage } from "@/pages/bookings/CreateBookingPage";
import { MyBookingsPage } from "@/pages/bookings/MyBookingsPage";

export function App() {
  return (
    <div className="min-h-svh bg-[#08090a] px-4 py-8 text-[#d0d6e0] md:px-8">
      <main className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl border border-[#ffffff0f] bg-[#0f1011] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <p className="text-xs font-[510] uppercase tracking-[0.18em] text-[#7170ff]">Module B</p>
          <h1 className="mt-2 text-3xl font-[510] tracking-[-0.04em] text-[#f7f8f8]">Booking Management</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8a8f98]">
            Request resource usage, detect schedule conflicts, and approve requests with QR-based check-in verification.
          </p>
        </header>

        <nav className="flex flex-wrap gap-2">
          {[
            { to: "/bookings", label: "My Bookings", end: true },
            { to: "/bookings/new", label: "Create Booking", end: false },
            { to: "/admin/bookings", label: "Admin Moderation", end: false },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive
                  ? "inline-flex h-9 items-center rounded-4xl bg-[#5e6ad2] px-4 text-sm font-medium text-white hover:bg-[#7170ff]"
                  : "inline-flex h-9 items-center rounded-4xl border border-[#ffffff14] bg-[#191a1b] px-4 text-sm font-medium text-[#d0d6e0] hover:bg-[#24252a]"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <section>
          <Routes>
            <Route path="/" element={<Navigate to="/bookings" replace />} />
            <Route path="/bookings" element={<MyBookingsPage />} />
            <Route path="/bookings/new" element={<CreateBookingPage />} />
            <Route path="/bookings/:id" element={<BookingDetailPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="*" element={<Navigate to="/bookings" replace />} />
          </Routes>
        </section>

        <div className="font-mono text-xs text-[#62666d]">(Press <kbd>d</kbd> to toggle dark mode)</div>
      </main>
    </div>
  );
}

export default App;
