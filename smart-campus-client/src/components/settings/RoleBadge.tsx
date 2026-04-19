import { Badge } from "@/components/ui/badge";
import type { Role } from "@/services/users";

const ROLE_STYLE: Record<Role, string> = {
  USER: "border-[#cfd7ff] bg-[#eef1ff] text-[#3f4c93]",
  TECHNICIAN: "border-[#b9e1ca] bg-[#edf9f1] text-[#1f8a44]",
  ADMIN: "border-[#f2dfb2] bg-[#fff8e8] text-[#7b5b11]",
  SUPER_ADMIN: "border-[#f0b8c4] bg-[#fff1f4] text-[#8f3346]",
};

export function RoleBadge({ role }: { role: Role }) {
  return <Badge className={ROLE_STYLE[role]}>{role}</Badge>;
}
