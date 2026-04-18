import { NotificationPanel } from "@/components/notifications/NotificationPanel";

export function App() {
  return (
    <div className="min-h-svh bg-linear-to-b from-background to-muted/40 p-6 md:p-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Smart Campus Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Manage system updates, booking events, and ticket changes in one place.
          </p>
        </div>

        <NotificationPanel />

        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  );
}

export default App;
