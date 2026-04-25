import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProfileCard } from "@/components/settings/ProfileCard";
import { useAuth } from "@/context/AuthContext";
import { fetchCurrentUser } from "@/services/auth";
import type { UserProfile } from "@/services/users";

export function ProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Missing authentication token");
      return;
    }

    void fetchCurrentUser(token)
      .then((result) => {
        if (!result.user) {
          throw new Error("User payload is missing");
        }

        setProfile(result.user as UserProfile);
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Failed to load profile");
      });
  }, [token]);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-[#f0b8c4] bg-[#fff1f4] p-4 text-sm text-[#8f3346]">{error}</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-[#d0d6e0] bg-[#ffffff] p-4 text-sm text-[#62666d]">Loading profile...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
      <header className="rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-5">
        <Breadcrumb className="mb-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-[590] tracking-[-0.44px] text-[#191a1b]">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-[#62666d]">
          Manage your personal information and account details.
        </p>
      </header>
      <ProfileCard profile={profile} />
    </main>
  );
}
