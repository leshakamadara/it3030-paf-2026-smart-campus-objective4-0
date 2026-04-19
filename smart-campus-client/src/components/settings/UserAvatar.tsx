interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "md" | "lg";
}

export function UserAvatar({ name, avatarUrl, size = "md" }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClass = size === "lg" ? "h-20 w-20 text-xl" : "h-10 w-10 text-sm";

  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${sizeClass} rounded-full border border-white/10 object-cover`} />;
  }

  return (
    <div className={`${sizeClass} grid place-items-center rounded-full border border-white/10 bg-[#191a1b] font-[590] text-[#d0d6e0]`}>
      {initials || "U"}
    </div>
  );
}
