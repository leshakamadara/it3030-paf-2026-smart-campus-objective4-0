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
        <div className="rounded-lg border border-[#5a2031] bg-[#32181f] p-4 text-sm text-[#ffc2d0]">{error}</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-white/10 bg-[#0f1011] p-4 text-sm text-[#8a8f98]">Loading profile...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <ProfileCard profile={profile} />
    </main>
  );
}
