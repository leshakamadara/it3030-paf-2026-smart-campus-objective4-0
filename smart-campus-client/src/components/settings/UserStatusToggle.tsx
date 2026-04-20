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
          ? "h-8 rounded-md border border-[#b9e1ca] bg-[#edf9f1] px-3 text-xs text-[#1f8a44] hover:bg-[#dff4e8]"
          : "h-8 rounded-md border border-[#f0b8c4] bg-[#fff1f4] px-3 text-xs text-[#8f3346] hover:bg-[#ffe6ec]"
      }
    >
      {active ? "Deactivate" : "Activate"}
    </Button>
  );
}
