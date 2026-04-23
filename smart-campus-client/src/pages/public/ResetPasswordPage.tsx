import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/services/auth"

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) {
      setError("Invalid or missing reset token")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError(null)

    try {
      await resetPassword({ token, newPassword: password })
      setSuccess(true)
      setTimeout(() => navigate("/login"), 3000)
    } catch (err: any) {
      setError(err?.message || "Failed to reset password")
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
            <h1 className="text-2xl font-[510] tracking-[-0.028em]">Set New Password</h1>
            <p className="text-sm text-[#62666d]">Enter your new password below.</p>
          </div>

          {!token ? (
            <div className="rounded-lg border border-[#f1c7d3] bg-[#fff5f7] p-3 text-sm text-[#8f2547]">
              Invalid or missing reset token in URL. Please request a new password reset link.
            </div>
          ) : success ? (
            <div className="rounded-lg border border-[#b7e6c3] bg-[#f1fff5] p-3 text-sm text-[#1f6b38] text-center space-y-3">
              <p>Your password has been successfully reset.</p>
              <p>Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-[#f1c7d3] bg-[#fff5f7] p-3 text-sm text-[#8f2547]">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#43464b]">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#d0d6e0] bg-[#ffffff] focus:border-[#5e6ad2]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#43464b]">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-[#d0d6e0] bg-[#ffffff] focus:border-[#5e6ad2]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5e6ad2] text-white hover:bg-[#7170ff] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? "Resetting..." : "Reset password"}
              </Button>
            </form>
          )}

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
