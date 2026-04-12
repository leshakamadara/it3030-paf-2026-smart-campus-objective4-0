import { STATUS_CONFIG } from "../constants/ticketConstants";
import type { TicketResponseDTO, TicketStatus } from "../types/ticketTypes";

export const WorkflowPipeline = ({ tickets }: { tickets: TicketResponseDTO[] }) => {
  const stages: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

  const counts = stages.reduce((acc, s) => {
    acc[s] = tickets.filter((t) => t.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex items-center gap-1">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${STATUS_CONFIG[s].badge}`}>
            <span>{STATUS_CONFIG[s].icon}</span>
            <span>{STATUS_CONFIG[s].label}</span>
            <span className="font-bold">{counts[s] || 0}</span>
          </div>
          {i < stages.length - 1 && <span className="text-slate-300 text-xs">→</span>}
        </div>
      ))}
    </div>
  );
};