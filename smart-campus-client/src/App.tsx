import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes } from "react-router-dom";

import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { RoleBadge } from "@/components/settings/RoleBadge";
import { UserAvatar } from "@/components/settings/UserAvatar";
import { Button } from "@/components/ui/button";
import { AdminUsersPage } from "@/pages/settings/AdminUsersPage";
import { NotificationPrefsPage } from "@/pages/settings/NotificationPrefsPage";
import { ProfilePage } from "@/pages/settings/ProfilePage";
import { getAuthMe, type UserProfile } from "@/services/users";

function AppLayout({ currentUser }: { currentUser: UserProfile | null }) {
  const role = currentUser?.role;

  return (
    <div className="min-h-svh bg-[#08090a] text-[#f7f8f8]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f1011]/95 backdrop-blur">
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
              {role === "SUPER_ADMIN" && (
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
            {role && <RoleBadge role={role} />}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#191a1b] px-2 py-1">
              <UserAvatar name={currentUser?.fullName ?? "User"} avatarUrl={currentUser?.avatarUrl} />
              <span className="hidden text-xs text-[#d0d6e0] sm:inline">{currentUser?.fullName ?? "User"}</span>
            </div>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/settings/profile" replace />} />
        <Route path="/settings/profile" element={<ProfilePage />} />
        <Route path="/settings/notifications" element={<NotificationPrefsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route
          path="*"
          element={
            <main className="mx-auto w-full max-w-2xl px-4 py-10">
              <div className="rounded-xl border border-white/10 bg-[#0f1011] p-6 text-center">
                <h1 className="text-2xl font-[590] tracking-[-0.04em]">Not Found</h1>
                <p className="mt-2 text-sm text-[#8a8f98]">The requested route does not exist.</p>
                <Link to="/settings/profile" className="mt-4 inline-flex">
                  <Button className="bg-[#5e6ad2] text-white hover:bg-[#7170ff]">Go to profile</Button>
                </Link>
              </div>
            </main>
          }
        />
      </Routes>
    </div>
  );
}

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(() => Boolean(localStorage.getItem("authToken")));

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setHasToken(Boolean(token));

    if (!token) {
      setCurrentUser(null);
      return;
    }

    void getAuthMe()
      .then((response) => {
        setCurrentUser(response.user);
      })
      .catch(() => {
        setCurrentUser(null);
      });
  }, []);

  if (!hasToken) {
    return (
      <main className="grid min-h-svh place-items-center bg-[#08090a] px-4 text-[#f7f8f8]">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0f1011] p-6 text-center">
          <h1 className="text-xl font-[590] tracking-[-0.02em]">Authentication required</h1>
          <p className="mt-2 text-sm text-[#8a8f98]">
            Set a valid JWT in localStorage under authToken, then refresh to access notification settings.
          </p>
        </div>
      </main>
    );
  }

  return <AppLayout currentUser={currentUser} />;
}

export default App;
