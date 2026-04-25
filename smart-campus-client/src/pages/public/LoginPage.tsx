import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { campusSignIn, getGoogleOAuthUrl } from "@/services/auth"

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth2_authentication_failed: "Google authentication failed. Please use your campus account and try again.",
  oauth_domain_not_allowed: "Your Google account domain is not allowed for this campus.",
  access_denied: "Access was denied. Please approve permissions to continue.",
}

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, setSession } = useAuth()
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [loadingCampus, setLoadingCampus] = useState(false)
  const [campusError, setCampusError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const errorMessage = useMemo(() => {
    const raw = searchParams.get("error")
    if (!raw) {
      return null
    }

    return OAUTH_ERROR_MESSAGES[raw] ?? "Unable to sign in. Please try again."
  }, [searchParams])

  function handleGoogleSignIn() {
    setLoadingGoogle(true)
    window.location.assign(getGoogleOAuthUrl())
  }

  async function handleCampusSignIn(payload: { email: string; password: string }) {
    setLoadingCampus(true)
    setCampusError(null)

    try {
      const response = await campusSignIn(payload)
      if (!response.token) {
        throw new Error("No token received from server")
      }

      setSession(response.token.replace(/^Bearer\s+/i, ""), response.user)
      navigate("/dashboard", { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Campus sign-in failed"
      setCampusError(message)
      setLoadingCampus(false)
    }
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f7f8f8] text-[#191a1b]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(113,112,255,0.2),transparent_44%),radial-gradient(circle_at_84%_82%,rgba(94,106,210,0.14),transparent_40%)]" />

      <div className="relative mx-auto grid min-h-svh w-full max-w-6xl place-items-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-4xl space-y-3">
          <LoginForm
            className="w-full"
            loadingCampus={loadingCampus}
            loadingGoogle={loadingGoogle}
            errorMessage={campusError ?? errorMessage}
            onCampusSignIn={handleCampusSignIn}
            onGoogleSignIn={handleGoogleSignIn}
            onNavigateToSignup={() => navigate("/signup")}
          />
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              className="border-[#d0d6e0] bg-[#ffffff] text-[#43464b] hover:bg-[#f3f4f5]"
              onClick={() => navigate("/signup/admin")}
            >
              Register as Admin (with key)
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
