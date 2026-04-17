import { useState } from "react";
import { Button } from "@/components/ui/button";
import { dummyLogin } from "@/services/auth";

export function App() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await dummyLogin({ email, fullName: fullName || undefined });
      setToken(result.token);
      setUser(result.user);
      if (result.token) {
        localStorage.setItem("authToken", result.token);
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Dummy Auth Tester</h1>
          <p className="text-sm text-muted-foreground">
            Use this simple form to hit the backend authentication API while the real UI
            is being designed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="student@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="fullName">
              Full name (optional)
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Jane Doe"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Dummy login / sign up"}
          </Button>
        </form>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {token && (
          <div className="space-y-2 rounded-md border p-3 text-xs break-all">
            <div className="font-semibold">JWT token</div>
            <div>{token}</div>
          </div>
        )}

        {user && (
          <div className="space-y-2 rounded-md border p-3 text-xs">
            <div className="font-semibold">User payload</div>
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}

        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  );
}

export default App;
