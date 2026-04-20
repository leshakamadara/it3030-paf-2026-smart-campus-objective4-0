export const Avatar = ({
  initials,
  size = "sm",
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
  };

  return (
    <div className={`${sizes[size]} rounded-full bg-violet-100 text-violet-700 font-semibold flex items-center justify-center`}>
      {initials}
    </div>
  );
};