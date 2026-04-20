import type { BookingStatus } from "@/types/booking";

const FLOW_STEPS = ["PENDING", "APPROVED", "CANCELLED"] as const;

function isStepActive(step: (typeof FLOW_STEPS)[number], current: BookingStatus): boolean {
  if (current === "REJECTED") {
    return step === "PENDING";
  }
  if (current === "CANCELLED") {
    return step !== "CANCELLED" ? true : true;
  }

  const currentIndex = FLOW_STEPS.indexOf(current as (typeof FLOW_STEPS)[number]);
  const stepIndex = FLOW_STEPS.indexOf(step);
  return currentIndex >= stepIndex;
}

export function WorkflowTimeline({ status }: { status: BookingStatus }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-[510] uppercase tracking-[0.16em] text-[#8a8f98]">Workflow</p>
      <div className="flex flex-wrap items-center gap-2">
        {FLOW_STEPS.map((step, index) => {
          const active = isStepActive(step, status);
          return (
            <div key={step} className="flex items-center gap-2">
              <span
                className={`rounded-md border px-2 py-1 text-[10px] font-[590] ${
                  active
                    ? "border-[#3a4aff] bg-[#252d6e] text-[#e8ecff]"
                    : "border-[#ffffff18] bg-[#15171b] text-[#7f8692]"
                }`}
              >
                {step}
              </span>
              {index < FLOW_STEPS.length - 1 && <span className="text-[#62666d]">→</span>}
            </div>
          );
        })}
        {status === "REJECTED" && (
          <span className="rounded-md border border-[#5a2031] bg-[#32181f] px-2 py-1 text-[10px] font-[590] text-[#ffc2d0]">
            REJECTED
          </span>
        )}
      </div>
    </div>
  );
}
