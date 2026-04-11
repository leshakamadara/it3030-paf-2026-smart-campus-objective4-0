import { PRIORITY_CONFIG } from "../constants/ticketConstants";
import type { Priority } from "../types/ticketTypes";
export const PriorityDot = ({ priority }: { priority: Priority }) => {
  const cfg = PRIORITY_CONFIG[priority];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};