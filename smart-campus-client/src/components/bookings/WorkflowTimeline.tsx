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
    <div className="space-y-3 mt-4">
      <p className="text-xs font-[510] uppercase tracking-[0.16em] text-[#62666d]">Workflow</p>
      <div className="flex flex-wrap items-center gap-2">
        {FLOW_STEPS.map((step, index) => {
          const active = isStepActive(step, status);
          return (
            <div key={step} className="flex items-center gap-2">
              <span
                className={`rounded-md border px-2 py-1 text-[10px] font-[590] ${
                  active
                    ? "border-[#5e6ad2] bg-[#eef2ff] text-[#5e6ad2]"
                    : "border-[#d0d6e0] bg-[#f7f8f8] text-[#8a8f98]"
                }`}
              >
                {step}
              </span>
              {index < FLOW_STEPS.length - 1 && <span className="text-[#d0d6e0]">→</span>}
            </div>
          );
        })}
        {status === "REJECTED" && (
          <span className="rounded-md border border-[#f0b8c4] bg-[#fff1f4] px-2 py-1 text-[10px] font-[590] text-[#8f3346]">
            REJECTED
          </span>
        )}
      </div>
    </div>
  );
}
