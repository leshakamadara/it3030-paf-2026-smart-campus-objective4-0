import { STATUS_META } from "../../constants/Ticket_constants/constants";
import type { TicketStatus } from "../types/ticketTypes";
export const Badge = ({ status }: { status: TicketStatus }) => {
  const cfg = STATUS_META[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.badge}`}>
      <span className="font-mono text-[10px]">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
};