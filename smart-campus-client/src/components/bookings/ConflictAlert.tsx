interface ConflictAlertProps {
  message: string;
  onClose: () => void;
}

export function ConflictAlert({ message, onClose }: ConflictAlertProps) {
  return (
    <div className="rounded-lg border border-[#f0b8c4] bg-[#fff1f4] p-3 text-sm text-[#8f3346]">
      <div className="flex items-center justify-between gap-3">
        <p>{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-[#f0b8c4] bg-[#ffffff] px-2 py-1 text-xs text-[#8f3346] hover:bg-[#ffe6ec]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
