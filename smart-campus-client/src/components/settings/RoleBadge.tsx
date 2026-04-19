import { Badge } from "@/components/ui/badge";
import type { Role } from "@/services/users";

const ROLE_STYLE: Record<Role, string> = {
  USER: "border-[#3b3f52] bg-[#202433] text-[#c9d2ff]",
  TECHNICIAN: "border-[#1f4d33] bg-[#153124] text-[#8ee8b0]",
  ADMIN: "border-[#4f3d1e] bg-[#2e2414] text-[#ffdfa3]",
  SUPER_ADMIN: "border-[#5a2031] bg-[#32181f] text-[#ffc2d0]",
};

export function RoleBadge({ role }: { role: Role }) {
  return <Badge className={ROLE_STYLE[role]}>{role}</Badge>;
}
