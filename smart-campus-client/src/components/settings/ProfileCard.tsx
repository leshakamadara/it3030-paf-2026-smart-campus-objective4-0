import { Link } from "react-router-dom";

import { RoleBadge } from "@/components/settings/RoleBadge";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { UserAvatar } from "@/components/settings/UserAvatar";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/services/users";

interface ProfileCardProps {
  profile: UserProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <SettingsCard title="Profile" description="Google-synced account details and current role.">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <UserAvatar name={profile.fullName} avatarUrl={profile.avatarUrl} size="lg" />
          <div>
            <h3 className="text-xl font-[590] tracking-[-0.02em] text-[#f7f8f8]">{profile.fullName}</h3>
            <p className="text-sm text-[#8a8f98]">{profile.email}</p>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border border-white/10 bg-[#191a1b] p-4 text-sm text-[#d0d6e0] sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#62666d]">Role</p>
            <div className="mt-1">
              <RoleBadge role={profile.role} />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#62666d]">Account status</p>
            <p className="mt-1 font-[510] text-[#f7f8f8]">{profile.active ? "Active" : "Inactive"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#62666d]">Last login</p>
            <p className="mt-1 font-[510] text-[#f7f8f8]">
              {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : "Not available"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[#62666d]">Google sub</p>
            <p className="mt-1 truncate font-mono text-xs text-[#8a8f98]">{profile.googleSub ?? "-"}</p>
          </div>
        </div>

        <Link to="/settings/notifications">
          <Button className="bg-[#5e6ad2] text-white hover:bg-[#7170ff]">Manage Notification Preferences</Button>
        </Link>
      </div>
    </SettingsCard>
  );
}
