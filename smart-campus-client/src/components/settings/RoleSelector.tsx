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
      className="h-9 rounded-md border border-white/10 bg-[#08090a] px-2 text-xs text-[#d0d6e0] focus:border-[#7170ff] focus:outline-none disabled:opacity-50"
    >
      {ROLE_OPTIONS.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}
