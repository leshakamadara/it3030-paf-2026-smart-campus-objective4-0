import type { Role } from "@/services/users";

const ROLE_OPTIONS: Role[] = ["USER", "TECHNICIAN", "ADMIN", "SUPER_ADMIN"];

interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, disabled = false }: RoleSelectorProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as Role)}
      disabled={disabled}
      className="h-9 rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-2 text-xs text-[#43464b] focus:border-[#7170ff] focus:outline-none disabled:opacity-50"
    >
      {ROLE_OPTIONS.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}
