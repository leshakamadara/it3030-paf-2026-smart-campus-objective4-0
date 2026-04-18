import { Button } from "@/components/ui/button";

interface UserStatusToggleProps {
  active: boolean;
  onToggle: (nextActive: boolean) => void;
  disabled?: boolean;
}

export function UserStatusToggle({ active, onToggle, disabled = false }: UserStatusToggleProps) {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(!active)}
      className={
        active
          ? "h-8 rounded-md border border-[#1f4d33] bg-[#153124] px-3 text-xs text-[#8ee8b0] hover:bg-[#1e442d]"
          : "h-8 rounded-md border border-[#5a2031] bg-[#32181f] px-3 text-xs text-[#ffc2d0] hover:bg-[#462030]"
      }
    >
      {active ? "Deactivate" : "Activate"}
    </Button>
  );
}
