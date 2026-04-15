import type { TicketResponseDTO } from "../types/ticketTypes";
import { Badge } from "./Badge";
import { PriorityDot } from "./PriorityDot";

export const TicketCard = ({
  ticket,
  onClick,
}: {
  ticket: TicketResponseDTO;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-violet-300 hover:shadow-sm transition-all group"
  >
    <div className="flex items-start justify-between gap-3 mb-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-mono text-xs text-slate-400 shrink-0">#{ticket.id}</span>
        <Badge status={ticket.status} />
      </div>
      <PriorityDot priority={ticket.priority} />
    </div>

    <p className="font-medium text-slate-800 text-sm line-clamp-1 mb-1">
      {ticket.title}
    </p>

    <p className="text-xs text-slate-400 line-clamp-1 mb-3">
      📝 {ticket.description ? ticket.description.substring(0, 50) + (ticket.description.length > 50 ? "..." : "") : "No description"}
    </p>
  </button>
);