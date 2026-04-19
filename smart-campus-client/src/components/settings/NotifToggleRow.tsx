import { Switch } from "@/components/ui/switch";

interface NotifToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function NotifToggleRow({ title, description, checked, onCheckedChange }: NotifToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-[#191a1b] px-4 py-3">
      <div>
        <p className="text-sm font-[510] text-[#f7f8f8]">{title}</p>
        <p className="text-xs text-[#8a8f98]">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
