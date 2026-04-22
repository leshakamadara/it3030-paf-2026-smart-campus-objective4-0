import { useState } from "react";

import { Button } from "@/components/ui/button";

type Mode = "approve" | "reject";

interface ApproveRejectDialogProps {
  open: boolean;
  mode: Mode;
  bookingId: string;
  onClose: () => void;
  onConfirmApprove: (bookingId: string) => Promise<void>;
  onConfirmReject: (bookingId: string, reason: string) => Promise<void>;
}

export function ApproveRejectDialog({
  open,
  mode,
  bookingId,
  onClose,
  onConfirmApprove,
  onConfirmReject,
}: ApproveRejectDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      if (mode === "approve") {
        await onConfirmApprove(bookingId);
      } else {
        await onConfirmReject(bookingId, reason.trim());
      }
      setReason("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#ffffff1f] bg-[#ffffff] p-5">
        <h3 className="text-base font-[590] text-[#191a1b]">
          {mode === "approve" ? "Approve booking" : "Reject booking"}
        </h3>
        <p className="mt-2 text-sm text-[#8a8f98]">Booking ID: {bookingId}</p>

        {mode === "reject" && (
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            placeholder="Enter rejection reason"
            className="mt-4 w-full rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 py-2 text-sm text-[#43464b]"
          />
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button
            onClick={onClose}
            className="border border-[#d0d6e0] bg-[#f7f8f8] text-[#43464b] hover:bg-[#e6e6e6]"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={submitting || (mode === "reject" && reason.trim().length === 0)}
            className={
              mode === "approve"
                ? "border border-[#1f4d33] bg-[#163623] text-[#9af0bc] hover:bg-[#1e442d]"
                : "border border-[#5a2031] bg-[#341522] text-[#ffc2d0] hover:bg-[#462030]"
            }
          >
            {submitting ? "Saving..." : mode === "approve" ? "Approve" : "Reject"}
          </Button>
        </div>
      </div>
    </div>
  );
}
