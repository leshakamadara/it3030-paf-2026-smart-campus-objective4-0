import { useEffect, useMemo, useState } from "react";

import { SettingsCard } from "@/components/settings/SettingsCard";
import { UserTable } from "@/components/settings/UserTable";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deactivateUser,
  type Role,
  type UserProfile,
} from "@/services/users";

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const result = await getAllUsers();
      setUsers(result);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load users");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const currentUserId = useMemo(() => {
    if (!currentUser?.id) {
      return undefined;
    }

    return String(currentUser.id);
  }, [currentUser?.id]);

  async function handleRoleChange(userId: string, role: Role) {
    if (currentUserId === userId) {
      return;
    }

    try {
      await updateUserRole(userId, role);
      void refresh();
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
        await updateUserStatus(userId, true);
      } else {
        await deactivateUser(userId);
      }
      void refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update status");
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-8">
      <SettingsCard
        title="Admin Users"
        description="SUPER_ADMIN controls for role management and account activation."
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by full name or email"
            />
            <div className="w-full sm:w-52">
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as Role | "ALL")}
                className="h-10 w-full rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 text-sm text-[#43464b] focus:border-[#7170ff] focus:outline-none"
              >
                <option value="ALL">All roles</option>
                <option value="USER">USER</option>
                <option value="TECHNICIAN">TECHNICIAN</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-[#8f3346]">{error}</p>}

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
