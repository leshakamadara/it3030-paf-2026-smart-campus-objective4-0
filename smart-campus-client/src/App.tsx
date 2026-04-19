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
    <div className="min-h-svh bg-[#08090a] text-[#f7f8f8]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f1011]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-[590] tracking-[0.02em] text-[#f7f8f8]">
              Smart Campus
            </Link>
            <nav className="flex items-center gap-2">
              <NavLink
                to="/settings/profile"
                className={({ isActive }) =>
                  isActive
                    ? "rounded-md border border-white/10 bg-[#191a1b] px-3 py-1 text-xs text-[#f7f8f8]"
                    : "rounded-md px-3 py-1 text-xs text-[#8a8f98] hover:text-[#d0d6e0]"
                }
              >
                Profile
              </NavLink>
              <NavLink
                to="/settings/notifications"
                className={({ isActive }) =>
                  isActive
                    ? "rounded-md border border-white/10 bg-[#191a1b] px-3 py-1 text-xs text-[#f7f8f8]"
                    : "rounded-md px-3 py-1 text-xs text-[#8a8f98] hover:text-[#d0d6e0]"
                }
              >
                Notifications
              </NavLink>
              {isSuperAdmin && (
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    isActive
                      ? "rounded-md border border-white/10 bg-[#191a1b] px-3 py-1 text-xs text-[#f7f8f8]"
                      : "rounded-md px-3 py-1 text-xs text-[#8a8f98] hover:text-[#d0d6e0]"
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
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#191a1b] px-2 py-1">
              <UserAvatar name={user?.fullName ?? "Campus User"} avatarUrl={user?.avatarUrl as string | null | undefined} />
              <span className="hidden text-xs text-[#d0d6e0] sm:inline">{user?.fullName ?? "User"}</span>
            </div>
            <Button
              onClick={clearSession}
              className="h-9 rounded-md border border-[#5a2031] bg-[#341522] px-3 text-xs text-[#ffc2d0] hover:bg-[#462030]"
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
      <section className="rounded-xl border border-white/10 bg-[#0f1011] p-8">
        <p className="text-xs font-[510] uppercase tracking-[0.2em] text-[#7170ff]">Module E</p>
        <h1 className="mt-2 text-3xl font-[590] tracking-[-0.044em]">Authentication and Authorization</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#8a8f98]">
          Welcome {user?.fullName ?? user?.email ?? "User"}. Use the profile, preferences, and admin tools from
          the top navigation.
        </p>
      </section>

      <section className="rounded-xl border border-[#3b3f52] bg-[#1b1d29] p-4 text-sm text-[#c9d2ff]">
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
}

export default App;
