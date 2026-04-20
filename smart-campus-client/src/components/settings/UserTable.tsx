import { useMemo } from "react";

import { RoleBadge } from "@/components/settings/RoleBadge";
import { RoleSelector } from "@/components/settings/RoleSelector";
import { UserAvatar } from "@/components/settings/UserAvatar";
import { UserStatusToggle } from "@/components/settings/UserStatusToggle";
import type { Role, UserProfile } from "@/services/users";

interface UserTableProps {
  users: UserProfile[];
  currentUserId?: string;
  search: string;
  roleFilter: Role | "ALL";
  onRoleChange: (userId: string, role: Role) => void;
  onStatusToggle: (userId: string, nextActive: boolean) => void;
}

export function UserTable({
  users,
  currentUserId,
  search,
  roleFilter,
  onRoleChange,
  onStatusToggle,
}: UserTableProps) {
  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter !== "ALL" && user.role !== roleFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${user.fullName} ${user.email}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [users, roleFilter, normalizedSearch]);

  return (
    <div className="overflow-x-auto rounded-xl border border-[#d0d6e0] bg-[#ffffff]">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[#d0d6e0] bg-[#f3f4f5] text-xs uppercase tracking-[0.12em] text-[#62666d]">
          <tr>
            <th className="px-3 py-3">User</th>
            <th className="px-3 py-3">Role</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Last login</th>
            <th className="px-3 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => {
            const isCurrentUser = currentUserId === user.id;
            return (
              <tr key={user.id} className="border-b border-[#e6e6e6] bg-[#ffffff]">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={user.fullName} avatarUrl={user.avatarUrl} />
                    <div>
                      <p className="text-xs font-[510] text-[#191a1b]">{user.fullName}</p>
                      <p className="text-xs text-[#62666d]">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <RoleBadge role={user.role} />
                    <RoleSelector
                      value={user.role}
                      onChange={(role) => onRoleChange(user.id, role)}
                      disabled={isCurrentUser}
                    />
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className={user.active ? "text-[#1f8a44]" : "text-[#8f3346]"}>
                    {user.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-[#62666d]">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-"}
                </td>
                <td className="px-3 py-3">
                  <UserStatusToggle
                    active={user.active}
                    onToggle={(next) => onStatusToggle(user.id, next)}
                    disabled={isCurrentUser}
                  />
                </td>
              </tr>
            );
          })}

          {filtered.length === 0 && (
            <tr>
              <td className="px-3 py-8 text-center text-sm text-[#62666d]" colSpan={5}>
                No users match your current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
