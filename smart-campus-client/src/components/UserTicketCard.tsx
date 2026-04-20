import type { Ticket } from "../types/ticketTypes";
import { PRIORITY_META, CATEGORIES } from "../../constants/Ticket_constants/constants";
import { Badge } from "./Badge";
import { timeAgo } from "../utills/ticket_helpers";

export default function TicketCard({
  ticket,
  onClick,
  onDelete,
}: {
  ticket: Ticket;
  onClick: () => void;
  onDelete?: (id: number) => void;
}) {
  const pm = PRIORITY_META[ticket.priority];
  const cat = CATEGORIES.find((c) => c.value === ticket.category);

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      role="button"
      tabIndex={0}
      className="relative w-full text-left bg-white rounded-2xl border border-slate-200 p-5 hover:border-violet-300 hover:shadow-md transition-all duration-200 group cursor-pointer"
    >
      
      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            const bid = ticket.backendId ?? parseInt(ticket.id.replace(/^TKT-/, ""), 10); 
            onDelete && onDelete(bid); 
          }}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-md bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"

          aria-label="Delete ticket"
          title="Delete ticket"
        >
          🗑
        </button>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            {ticket.id}
          </span>
          <Badge status={ticket.status} />
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold shrink-0 ${pm.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />
          {pm.label}
        </span>
      </div>

      <p className="font-semibold text-slate-800 text-sm group-hover:text-violet-700 transition-colors leading-snug mb-1">
        {ticket.title}
      </p>
      <p className="text-xs text-slate-400 mb-3 line-clamp-1">
        <span className="mr-1">{cat?.icon}</span>{ticket.resourceLocation}
      </p>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{ticket.category}</span>
          {ticket.assignedToName && (
            <span className="bg-violet-50 text-violet-500 px-2 py-0.5 rounded-full">
              👤 {ticket.assignedToName.split(" ")[0]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {ticket.comments.length > 0 && <span>💬 {ticket.comments.length}</span>}
          <span>{timeAgo(ticket.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}