import { useEffect, useState } from "react";

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
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <ProfileCard profile={profile} />
    </main>
  );
}
