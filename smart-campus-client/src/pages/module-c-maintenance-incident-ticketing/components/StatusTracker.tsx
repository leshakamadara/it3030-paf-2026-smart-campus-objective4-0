import type { TicketStatus } from "../types/ticket";
import { STATUS_META } from "../constants/constants";

export default function StatusTracker({ status }: { status: TicketStatus }) {
  if (status === "REJECTED") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
        <span className="text-red-500 text-sm">✗</span>
        <span className="text-sm font-medium text-red-600">This ticket was rejected</span>
      </div>
    );
  }

  const steps: { key: TicketStatus; label: string }[] = [
    { key: "OPEN", label: "Submitted" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "RESOLVED", label: "Resolved" },
    { key: "CLOSED", label: "Closed" },
  ];

  const currentStep = STATUS_META[status].step;

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        const done = STATUS_META[s.key].step < currentStep;
        const active = s.key === status;
        return (
          <div key={s.key} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? "bg-emerald-500 text-white" :
                active ? "bg-violet-600 text-white ring-4 ring-violet-100" :
                "bg-slate-200 text-slate-400"
              }`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${active ? "text-violet-700" : done ? "text-emerald-600" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mb-4 transition-colors ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}