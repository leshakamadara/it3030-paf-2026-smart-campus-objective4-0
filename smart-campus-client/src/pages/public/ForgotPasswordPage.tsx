import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPassword } from "@/services/auth"

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const resMessage = await forgotPassword(email)
      setMessage(resMessage || "If an account exists, a reset link has been sent.")
    } catch (err: any) {
      setError(err?.response?.data || err.message || "Failed to process request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f7f8f8] text-[#191a1b]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(113,112,255,0.2),transparent_44%),radial-gradient(circle_at_84%_82%,rgba(94,106,210,0.14),transparent_40%)]" />

      <div className="relative mx-auto grid min-h-svh w-full max-w-6xl place-items-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-[#d0d6e0] bg-white/80 p-8 shadow-xl backdrop-blur-xl">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-[510] tracking-[-0.028em]">Reset Password</h1>
            <p className="text-sm text-[#62666d]">Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-[#f1c7d3] bg-[#fff5f7] p-3 text-sm text-[#8f2547]">
                {error}
              </div>
            )}
            
            {message && (
              <div className="rounded-lg border border-[#b7e6c3] bg-[#f1fff5] p-3 text-sm text-[#1f6b38]">
                {message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#43464b]">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m.scott@dunder-mifflin.com"
                className="border-[#d0d6e0] bg-[#ffffff] focus:border-[#5e6ad2]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5e6ad2] text-white hover:bg-[#7170ff] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Sending link..." : "Send reset link"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <Link to="/login" className="text-[#5e6ad2] hover:text-[#7170ff]">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
