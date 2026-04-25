import { Button } from "@/components/ui/button";

interface QrCodeDisplayProps {
  token: string | null;
  base64Image: string | null;
}

function downloadQr(base64Image: string, token: string) {
  const link = document.createElement("a");
  link.href = `data:image/png;base64,${base64Image}`;
  link.download = `booking-qr-${token}.png`;
  link.click();
}

export function QrCodeDisplay({ token, base64Image }: QrCodeDisplayProps) {
  if (!token) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-4 shadow-sm">
      <h3 className="text-sm font-[510] tracking-tight text-[#191a1b]">QR Check-in Token</h3>
      <p className="mt-1 break-all font-mono text-xs text-[#8a8f98]">{token}</p>
      {base64Image && (
        <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="inline-flex rounded-lg border border-[#d0d6e0] bg-[#f7f8f8] p-2">
            <img
              src={`data:image/png;base64,${base64Image}`}
              alt="Booking QR code"
              className="h-36 w-36 rounded-md"
            />
          </div>
          <Button
            onClick={() => downloadQr(base64Image, token)}
            className="border border-[#d0d6e0] bg-[#ffffff] text-[#43464b] hover:bg-[#f3f4f5]"
          >
            Download QR
          </Button>
        </div>
      )}
    </div>
  );
}
