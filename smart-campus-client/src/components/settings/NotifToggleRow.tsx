import { Switch } from "@/components/ui/switch";

interface NotifToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function NotifToggleRow({ title, description, checked, onCheckedChange }: NotifToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#d0d6e0] bg-[#f3f4f5] px-4 py-3">
      <div>
        <p className="text-sm font-[510] text-[#191a1b]">{title}</p>
        <p className="text-xs text-[#62666d]">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
