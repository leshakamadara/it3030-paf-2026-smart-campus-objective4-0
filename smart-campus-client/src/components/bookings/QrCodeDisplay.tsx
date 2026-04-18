interface QrCodeDisplayProps {
  token: string | null;
  base64Image: string | null;
}

export function QrCodeDisplay({ token, base64Image }: QrCodeDisplayProps) {
  if (!token) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#ffffff14] bg-[#0f1011] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <h3 className="text-sm font-[510] tracking-tight text-[#f7f8f8]">QR Check-in Token</h3>
      <p className="mt-1 break-all font-mono text-xs text-[#8a8f98]">{token}</p>
      {base64Image && (
        <div className="mt-4 inline-flex rounded-lg border border-[#ffffff22] bg-[#08090a] p-2">
          <img
            src={`data:image/png;base64,${base64Image}`}
            alt="Booking QR code"
            className="h-36 w-36 rounded-md"
          />
        </div>
      )}
    </div>
  );
}
