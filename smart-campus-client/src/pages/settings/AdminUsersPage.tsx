import { useEffect, useState } from "react";

import { SettingsCard } from "@/components/settings/SettingsCard";
import { UserTable } from "@/components/settings/UserTable";
import { Input } from "@/components/ui/input";
import {
  activateUser,
  deactivateUser,
  getAllUsers,
  getAuthMe,
  updateUserRole,
  type Role,
  type UserProfile,
} from "@/services/users";

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);

  async function refreshUsers() {
    try {
      const result = await getAllUsers();
      setUsers(result);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load users");
    }
  }

  useEffect(() => {
    void getAuthMe()
      .then((result) => {
        if (result.user) {
          setCurrentUserId(result.user.id);
          setCurrentUserRole(result.user.role);
        }
      })
      .catch(() => {
        setCurrentUserRole(null);
      });

    void refreshUsers();
  }, []);

  async function handleRoleChange(userId: string, role: Role) {
    if (currentUserId === userId) {
      return;
    }

    try {
      await updateUserRole(userId, role);
      await refreshUsers();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update role");
    }
  }

  async function handleStatusToggle(userId: string, nextActive: boolean) {
    if (currentUserId === userId) {
      return;
    }

    try {
      if (nextActive) {
        await activateUser(userId);
      } else {
        await deactivateUser(userId);
      }
      await refreshUsers();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update status");
    }
  }

  if (currentUserRole && currentUserRole !== "SUPER_ADMIN") {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="rounded-lg border border-[#5a2031] bg-[#32181f] p-4 text-sm text-[#ffc2d0]">
          Access denied. This page is restricted to SUPER_ADMIN users.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-8">
      <SettingsCard
        title="Admin Users"
        description="SUPER_ADMIN tools for role management and account activation."
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by full name or email"
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as Role | "ALL")}
              className="h-10 rounded-md border border-white/10 bg-[#08090a] px-3 text-sm text-[#d0d6e0] focus:border-[#7170ff] focus:outline-none"
            >
              <option value="ALL">All roles</option>
              <option value="USER">USER</option>
              <option value="TECHNICIAN">TECHNICIAN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </div>

          {error && <p className="text-xs text-[#ffc2d0]">{error}</p>}

          <UserTable
            users={users}
            currentUserId={currentUserId}
            search={search}
            roleFilter={roleFilter}
            onRoleChange={handleRoleChange}
            onStatusToggle={handleStatusToggle}
          />
        </div>
      </SettingsCard>
    </main>
  );
}
