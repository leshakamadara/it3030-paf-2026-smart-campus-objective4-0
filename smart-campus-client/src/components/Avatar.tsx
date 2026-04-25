export const Avatar = ({
  initials,
  src,
  size = "sm",
}: {
  initials: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm",
  };

  const isUrl = (s: string) => s.startsWith('http') || s.includes('googleusercontent.com');
  const safeSrc = src && isUrl(src) ? src : null;
  const safeInitials = initials && !isUrl(initials) ? initials.slice(0, 2).toUpperCase() : "??";

  return (
    <div className={`${sizes[size]} rounded-full bg-violet-100 text-violet-700 font-semibold flex items-center justify-center overflow-hidden shrink-0`}>
      {safeSrc ? (
        <img src={safeSrc} alt="" className="w-full h-full object-cover" />
      ) : (
        <span>{safeInitials}</span>
      )}
    </div>
  );
};