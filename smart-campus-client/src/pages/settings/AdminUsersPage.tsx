import { useEffect, useMemo, useState } from "react";

import { SettingsCard } from "@/components/settings/SettingsCard";
import { UserTable } from "@/components/settings/UserTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  generateAdminSignupKey,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deactivateUser,
  type GeneratedAdminSignupKey,
  type Role,
  type UserProfile,
} from "@/services/users";

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<GeneratedAdminSignupKey | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);

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

  async function handleGenerateAdminKey() {
    try {
      setGeneratingKey(true);
      const key = await generateAdminSignupKey();
      setGeneratedKey(key);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to generate admin key");
    } finally {
      setGeneratingKey(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-8">
      <SettingsCard
        title="Admin Users"
        description="SUPER_ADMIN controls for role management and account activation."
      >
        <div className="space-y-4">
          <div className="rounded-md border border-[#d0d6e0] bg-[#f7f8f8] p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-[590] text-[#191a1b]">Admin Signup Key</p>
                <p className="text-xs text-[#62666d]">
                  Generate a single-use key for the separate admin registration page.
                </p>
              </div>
              <Button onClick={handleGenerateAdminKey} disabled={generatingKey}>
                {generatingKey ? "Generating..." : "Generate Key"}
              </Button>
            </div>
            {generatedKey && (
              <div className="mt-3 space-y-1 rounded-md border border-[#d0d6e0] bg-white p-3">
                <p className="text-xs text-[#62666d]">Latest key</p>
                <p className="break-all font-mono text-sm text-[#191a1b]">{generatedKey.signupKey}</p>
                <p className="text-xs text-[#62666d]">Expires at: {new Date(generatedKey.expiresAt).toLocaleString()}</p>
              </div>
            )}
          </div>

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
