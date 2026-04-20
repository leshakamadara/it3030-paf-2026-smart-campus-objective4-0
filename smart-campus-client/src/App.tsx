<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from "react-router-dom"
import IncidentTicketingModule from "./pages/module-c-maintenance-incident-ticketing/AdminTicketPortal"
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
=======
import { type ReactNode } from "react";
import { Link, NavLink, Navigate, Outlet, Route, Routes } from "react-router-dom";

import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { RoleBadge } from "@/components/settings/RoleBadge";
import { UserAvatar } from "@/components/settings/UserAvatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LoginPage } from "@/pages/public/LoginPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { OAuthCallbackPage } from "@/pages/public/OAuthCallbackPage";
import { QrCheckInPage } from "@/pages/public/QrCheckInPage";
import { SignupPage } from "@/pages/public/SignupPage";
import { AdminUsersPage } from "@/pages/settings/AdminUsersPage";
import { NotificationPrefsPage } from "@/pages/settings/NotificationPrefsPage";
import { ProfilePage } from "@/pages/settings/ProfilePage";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== "SUPER_ADMIN") {
    return <Navigate to="/settings/profile" replace />;
  }

  return <>{children}</>;
}

function AuthenticatedLayout() {
  const { user, clearSession } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-svh bg-[#f7f8f8] text-[#191a1b]">
      <header className="sticky top-0 z-30 border-b border-[#d0d6e0] bg-[#ffffff]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-[590] tracking-[0.02em] text-[#191a1b]">
              Smart Campus
            </Link>
            <nav className="flex items-center gap-2">
              <NavLink
                to="/settings/profile"
                className={({ isActive }) =>
                  isActive
                    ? "rounded-md border border-[#d0d6e0] bg-[#f3f4f5] px-3 py-1 text-xs text-[#191a1b]"
                    : "rounded-md px-3 py-1 text-xs text-[#62666d] hover:text-[#43464b]"
                }
              >
                Profile
              </NavLink>
              <NavLink
                to="/settings/notifications"
                className={({ isActive }) =>
                  isActive
                    ? "rounded-md border border-[#d0d6e0] bg-[#f3f4f5] px-3 py-1 text-xs text-[#191a1b]"
                    : "rounded-md px-3 py-1 text-xs text-[#62666d] hover:text-[#43464b]"
                }
              >
                Notifications
              </NavLink>
              {isSuperAdmin && (
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    isActive
                      ? "rounded-md border border-[#d0d6e0] bg-[#f3f4f5] px-3 py-1 text-xs text-[#191a1b]"
                      : "rounded-md px-3 py-1 text-xs text-[#62666d] hover:text-[#43464b]"
                  }
                >
                  Admin Users
                </NavLink>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <NotificationPanel />
            {user?.role && <RoleBadge role={user.role} />}
            <div className="flex items-center gap-2 rounded-full border border-[#d0d6e0] bg-[#f3f4f5] px-2 py-1">
              <UserAvatar name={user?.fullName ?? "Campus User"} avatarUrl={user?.avatarUrl as string | null | undefined} />
              <span className="hidden text-xs text-[#43464b] sm:inline">{user?.fullName ?? "User"}</span>
            </div>
            <Button
              onClick={clearSession}
              className="h-9 rounded-md border border-[#f0b8c4] bg-[#fff1f4] px-3 text-xs text-[#8f3346] hover:bg-[#ffe6ec]"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}

function HomePage() {
  const { user } = useAuth();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8">
      <section className="rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-8">
        <p className="text-xs font-[510] uppercase tracking-[0.2em] text-[#7170ff]">Module E</p>
        <h1 className="mt-2 text-3xl font-[590] tracking-[-0.044em]">Authentication and Authorization</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#62666d]">
          Welcome {user?.fullName ?? user?.email ?? "User"}. Use the profile, preferences, and admin tools from
          the top navigation.
        </p>
      </section>

      <section className="rounded-xl border border-[#d0d6e0] bg-[#f3f4f5] p-4 text-sm text-[#43464b]">
        Notification overlay UI is implemented here for integration, while full notification APIs remain part of
        Module D backend scope.
      </section>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      <Route path="/qr/:token" element={<QrCheckInPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="settings/profile" element={<ProfilePage />} />
        <Route path="settings/notifications" element={<NotificationPrefsPage />} />
        <Route
          path="admin/users"
          element={
            <SuperAdminRoute>
              <AdminUsersPage />
            </SuperAdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
>>>>>>> 2aab52e4f19fa0d781e6f8c591282b5aac5f0f6f
}

export default App;
