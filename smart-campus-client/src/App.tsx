import { type ReactNode } from "react";
import { Link, NavLink, Navigate, Outlet, Route, Routes } from "react-router-dom";

import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { RoleBadge } from "@/components/settings/RoleBadge";
import { UserAvatar } from "@/components/settings/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { AdminBookingsPage } from "@/pages/bookings/AdminBookingsPage";
import { BookingDetailPage } from "@/pages/bookings/BookingDetailPage";
import { CreateBookingPage } from "@/pages/bookings/CreateBookingPage";
import { MyBookingsPage } from "@/pages/bookings/MyBookingsPage";
import { AdminSignupPage } from "@/pages/public/AdminSignupPage";
import { LoginPage } from "@/pages/public/LoginPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { OAuthCallbackPage } from "@/pages/public/OAuthCallbackPage";
import { QrCheckInPage } from "@/pages/public/QrCheckInPage";
import { SignupPage } from "@/pages/public/SignupPage";
import { ForgotPasswordPage } from "@/pages/public/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/public/ResetPasswordPage";
import { LandingPage } from "@/pages/public/LandingPage";
import { AdminUsersPage } from "@/pages/settings/AdminUsersPage";
import { NotificationPrefsPage } from "@/pages/settings/NotificationPrefsPage";
import { NotificationsPage } from "@/pages/notifications/NotificationsPage";
import { ProfilePage } from "@/pages/settings/ProfilePage";
import AdminResourceCreatePage from "@/pages/resource/AdminResourceCreatePage";
import AdminResourceEditPage from "@/pages/resource/AdminResourceEditPage";
import ResourceDetailsPage from "@/pages/resource/ResourceDetailsPage";
import ResourceListPage from "@/pages/resource/ResourceListPage";
import ResourceStatsPage from "@/pages/resource/ResourceStatsPage";
import UserTicketPortal from "@/pages/module-c-maintenance-incident-ticketing/UserTicketPortal";
import AdminTicketPortal from "@/pages/module-c-maintenance-incident-ticketing/AdminTicketPortal";
import { EmailTesterPage } from "@/pages/admin/EmailTesterPage";

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
    return <Navigate to="/dashboard/settings/profile" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return <Navigate to="/dashboard/resources" replace />;
  }

  return <>{children}</>;
}

function AuthenticatedLayout() {
  const { user, clearSession } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isResourceAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "rounded-md bg-[#eef0fb] px-3 py-1.5 text-xs font-[510] text-[#5e6ad2] transition-colors"
      : "rounded-md px-3 py-1.5 text-xs font-[400] text-[#62666d] transition-colors hover:bg-[#f3f4f5] hover:text-[#191a1b]";

  const adminNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "rounded-md bg-[#eef0fb] border border-[#c5c9f0] px-3 py-1.5 text-xs font-[510] text-[#5e6ad2] transition-colors"
      : "rounded-md border border-transparent px-3 py-1.5 text-xs font-[400] text-[#62666d] transition-colors hover:border-[#d0d6e0] hover:bg-[#f3f4f5] hover:text-[#191a1b]";

  return (
    <div className="min-h-svh bg-[#f7f8f8] text-[#191a1b]">
      <header className="sticky top-0 z-30 bg-[#ffffff]/95 backdrop-blur-sm border-b border-[#d0d6e0]">
        {/* Brand accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#5e6ad2] via-[#7170ff] to-[#5e6ad2]" />

        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-0">
            {/* Logo */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2 pr-4 text-sm font-[590] tracking-[0.02em] text-[#191a1b] hover:text-[#5e6ad2] transition-colors"
            >
              <img src="/HelaUni.png" alt="HelaUni Logo" className="h-6 w-auto object-contain" />
              HelaUni.app
            </Link>

            {/* Separator */}
            <div className="h-5 w-px bg-[#d0d6e0] mr-3" />

            {/* Navigation links */}
            <nav className="flex items-center gap-0.5">
              {/* User links */}
              {!isResourceAdmin && (
                <>
                  <NavLink to="/dashboard/bookings" className={navLinkClass}>Bookings</NavLink>
                  <NavLink to="/dashboard/resources" className={navLinkClass}>Resources</NavLink>
                  <NavLink to="/dashboard/tickets" className={navLinkClass}>My Tickets</NavLink>

                  {/* Separator before common links */}
                  <div className="mx-1.5 h-4 w-px bg-[#e6e6e6]" />
                </>
              )}

              <NavLink to="/dashboard/settings/profile" className={navLinkClass}>Profile</NavLink>
              <NavLink to="/dashboard/notifications" className={navLinkClass}>Notifications</NavLink>

              {/* Admin links — visually grouped with separator */}
              {isResourceAdmin && (
                <>
                  <div className="mx-1.5 h-4 w-px bg-[#e6e6e6]" />
                  {isSuperAdmin && (
                    <NavLink to="/dashboard/admin/users" className={adminNavLinkClass}>Users</NavLink>
                  )}
                  <NavLink to="/dashboard/admin/resources/stats" className={adminNavLinkClass}>Resources</NavLink>
                  <NavLink to="/dashboard/admin/bookings" className={adminNavLinkClass}>Bookings</NavLink>
                  <NavLink to="/dashboard/admin/tickets" className={adminNavLinkClass}>Tickets</NavLink>
                  <NavLink to="/dashboard/email-tester" className={adminNavLinkClass}>Email</NavLink>
                </>
              )}

              {/* SuperAdmin users link (non-admin) */}
              {!isResourceAdmin && isSuperAdmin && (
                <>
                  <div className="mx-1.5 h-4 w-px bg-[#e6e6e6]" />
                  <NavLink to="/dashboard/admin/users" className={adminNavLinkClass}>Admin Users</NavLink>
                </>
              )}
            </nav>
          </div>

          {/* Right: User info */}
          <div className="flex items-center gap-2">
            <NotificationPanel />
            {user?.role && <RoleBadge role={user.role} />}
            <UserAvatar
              name={user?.fullName ?? "Campus User"}
              avatarUrl={user?.avatarUrl as string | null | undefined}
            />
            <span className="hidden text-xs font-[510] text-[#43464b] sm:inline">
              {user?.fullName ?? "User"}
            </span>
            <Button
              onClick={clearSession}
              className="h-8 rounded-md border border-[#f0b8c4] bg-[#fff1f4] px-3 text-xs text-[#8f3346] hover:bg-[#ffe6ec] shadow-none"
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
  const isResourceAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8">
      <section className="rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-8">
        <p className="text-xs font-[510] uppercase tracking-[0.2em] text-[#7170ff]">HelaUni.app</p>
        <h1 className="mt-2 text-3xl font-[590] tracking-[-0.044em]">Modules Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#62666d]">
          Welcome {user?.fullName ?? user?.email ?? "User"}. Access {isResourceAdmin ? "administrative tools" : "bookings, facilities catalogue, and account tools"} from the top navigation or quick links below.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-[#d0d6e0] bg-[#ffffff]">
          <CardHeader>
            <CardTitle className="text-base">{isResourceAdmin ? "Booking Management" : "Module B: Bookings"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[#62666d]">
              {isResourceAdmin ? "Review and manage campus reservation requests." : "Create and manage booking requests for campus resources."}
            </p>
            <div className="flex flex-wrap gap-2">
              {!isResourceAdmin && (
                <>
                  <Button asChild variant="outline" className="border-[#d0d6e0] bg-[#f7f8f8]">
                    <Link to="/dashboard/bookings">My Bookings</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-[#d0d6e0] bg-[#f7f8f8]">
                    <Link to="/dashboard/bookings/new">Create Booking</Link>
                  </Button>
                </>
              )}
              {isResourceAdmin && (
                <Button asChild variant="outline" className="border-[#d0d6e0] bg-[#f7f8f8]">
                  <Link to="/dashboard/admin/bookings">Admin Bookings</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#d0d6e0] bg-[#ffffff]">
          <CardHeader>
            <CardTitle className="text-base">{isResourceAdmin ? "Resource Management" : "Module A: Facilities Catalogue"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[#62666d]">
              {isResourceAdmin ? "Configure campus resources and monitor utilization." : "Browse campus facilities and view detailed resource information."}
            </p>
            <div className="flex flex-wrap gap-2">
              {!isResourceAdmin && (
                <Button asChild variant="outline" className="border-[#d0d6e0] bg-[#f7f8f8]">
                  <Link to="/dashboard/resources">Browse Resources</Link>
                </Button>
              )}
              {isResourceAdmin && (
                <Button asChild variant="outline" className="border-[#d0d6e0] bg-[#f7f8f8]">
                  <Link to="/dashboard/admin/resources/stats">Resource Admin</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-xl border border-[#d0d6e0] bg-[#f3f4f5] p-4 text-sm text-[#43464b]">
        Notification overlay UI is implemented here for integration, while full notification APIs remain part of
        Module D backend scope.
      </section>

      <section className="rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-6">
        <p className="text-xs font-[510] uppercase tracking-[0.18em] text-[#5e6ad2] mb-1">Module C</p>
        <h2 className="text-base font-[590] tracking-tight text-[#191a1b] mb-1">
          {isResourceAdmin ? "Maintenance & Incident Management" : "Maintenance & Incident Tickets"}
        </h2>
        <p className="text-sm text-[#62666d] mb-4">
          {isResourceAdmin ? "Track and resolve campus incident reports and maintenance requests." : "Report campus incidents and track their resolution progress."}
        </p>
        <div className="flex flex-wrap gap-2">
          {!isResourceAdmin && (
            <Button asChild variant="outline" className="border-[#d0d6e0] bg-[#f7f8f8]">
              <Link to="/dashboard/tickets">My Tickets</Link>
            </Button>
          )}
          {isResourceAdmin && (
            <Button asChild variant="outline" className="border-[#d0d6e0] bg-[#f7f8f8]">
              <Link to="/dashboard/admin/tickets">Ticket Admin</Link>
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signup/admin" element={<AdminSignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      <Route path="/qr/:token" element={<QrCheckInPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/email-tester" element={<EmailTesterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="bookings/new" element={<CreateBookingPage />} />
        <Route path="bookings/:id" element={<BookingDetailPage />} />
        <Route
          path="admin/bookings"
          element={
            <AdminRoute>
              <AdminBookingsPage />
            </AdminRoute>
          }
        />
        <Route path="settings/profile" element={<ProfilePage />} />
        <Route path="settings/notifications" element={<NotificationPrefsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route
          path="admin/users"
          element={
            <SuperAdminRoute>
              <AdminUsersPage />
            </SuperAdminRoute>
          }
        />
        <Route
          path="admin/resources/create"
          element={
            <AdminRoute>
              <AdminResourceCreatePage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/resources/edit/:id"
          element={
            <AdminRoute>
              <AdminResourceEditPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/resources/stats"
          element={
            <AdminRoute>
              <ResourceStatsPage />
            </AdminRoute>
          }
        />
        <Route path="resources/:id" element={<ResourceDetailsPage />} />
        <Route path="resources" element={<ResourceListPage />} />
        <Route path="tickets" element={<UserTicketPortal />} />
        <Route
          path="admin/tickets"
          element={
            <AdminRoute>
              <AdminTicketPortal />
            </AdminRoute>
          }
        />
        <Route path="email-tester" element={<EmailTesterPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
