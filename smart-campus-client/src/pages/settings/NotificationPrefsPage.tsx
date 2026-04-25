import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast-system";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { NotifToggleRow } from "@/components/settings/NotifToggleRow";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { Button } from "@/components/ui/button";
import { getMyProfile, updateMyNotificationPrefs } from "@/services/users";

const PREF_OPTIONS = [
  { key: "BOOKING_APPROVED",      label: "Booking Approved",      description: "When a pending booking is approved." },
  { key: "BOOKING_REJECTED",      label: "Booking Rejected",      description: "When a booking request is rejected." },
  { key: "BOOKING_CANCELLED",     label: "Booking Cancelled",     description: "When an approved booking is cancelled." },
  { key: "BOOKING_REMINDER",      label: "Booking Reminder",      description: "Reminder before your booking start time." },
  { key: "TICKET_STATUS_CHANGED", label: "Ticket Status Changed", description: "When ticket status is updated." },
  { key: "TICKET_COMMENT",        label: "Ticket Comment",        description: "When someone comments on your ticket." },
  { key: "TICKET_ASSIGNED",       label: "Ticket Assigned",       description: "When a ticket is assigned to you." },
] as const;

export function NotificationPrefsPage() {
  const toast = useToast();
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
      await updateMyNotificationPrefs({ notificationPrefs: prefs });
      toast.success("Preferences saved", "Your notification preferences have been updated.");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to save preferences";
      setError(message);
      toast.error("Save failed", message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
      <header className="rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-5">
        <Breadcrumb className="mb-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Notifications</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-[590] tracking-[-0.44px] text-[#191a1b]">
          Notification Settings
        </h1>
        <p className="mt-1 text-sm text-[#62666d]">
          Manage your email and push notification preferences.
        </p>
      </header>
      <SettingsCard
        title="Notification Preferences"
        description="Control which booking and ticket events notify you."
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
            {error && <p className="text-xs text-[#8f3346]">{error}</p>}
          </div>
        </div>
      </SettingsCard>
    </main>
  );
}
