interface ConflictAlertProps {
  message: string;
  onClose: () => void;
}

export function ConflictAlert({ message, onClose }: ConflictAlertProps) {
  return (
    <div className="rounded-lg border border-[#ff6a8b4d] bg-[#2a1018] p-3 text-sm text-[#ffc2d0]">
      <div className="flex items-center justify-between gap-3">
        <p>{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-[#ffffff22] px-2 py-1 text-xs text-[#d0d6e0] hover:bg-[#ffffff0d]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
