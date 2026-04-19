import { useEffect, useState } from "react";
import { toast } from "sonner";

import { NotifToggleRow } from "@/components/settings/NotifToggleRow";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { Button } from "@/components/ui/button";
import { getMyProfile, updateMyNotificationPrefs } from "@/services/users";

const PREF_OPTIONS = [
  { key: "BOOKING_APPROVED", label: "Booking Approved", description: "When a pending booking gets approved." },
  { key: "BOOKING_REJECTED", label: "Booking Rejected", description: "When a booking request is rejected." },
  { key: "BOOKING_CANCELLED", label: "Booking Cancelled", description: "When an approved booking is cancelled." },
  { key: "TICKET_STATUS_CHANGED", label: "Ticket Status Changed", description: "When a ticket changes status." },
  { key: "TICKET_COMMENT", label: "Ticket Comment", description: "When someone comments on your ticket." },
  { key: "TICKET_ASSIGNED", label: "Ticket Assigned", description: "When a ticket is assigned to you." },
] as const;

export function NotificationPrefsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getMyProfile()
      .then((profile) => {
        setPrefs(profile.notificationPrefs ?? {});
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Failed to load notification preferences");
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      await updateMyNotificationPrefs(prefs);
      toast.success("Notification preferences saved");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to save preferences";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <SettingsCard
        title="Notification Preferences"
        description="Toggle booking and ticket notification types for your account."
      >
        <div className="space-y-3">
          {PREF_OPTIONS.map((option) => (
            <NotifToggleRow
              key={option.key}
              title={option.label}
              description={option.description}
              checked={Boolean(prefs[option.key])}
              onCheckedChange={(checked) => setPrefs((current) => ({ ...current, [option.key]: checked }))}
            />
          ))}

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => void handleSave()}
              disabled={saving}
              className="bg-[#5e6ad2] text-white hover:bg-[#7170ff]"
            >
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
            {error && <p className="text-xs text-[#ffc2d0]">{error}</p>}
          </div>
        </div>
      </SettingsCard>
    </main>
  );
}
