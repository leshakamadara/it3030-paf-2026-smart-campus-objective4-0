import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { AuthErrorAlert } from "@/components/auth/AuthErrorAlert"
import { BrandLogo } from "@/components/auth/BrandLogo"
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { getGoogleOAuthUrl } from "@/services/auth"

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth2_authentication_failed: "Google authentication failed. Please use your campus account and try again.",
  oauth_domain_not_allowed: "Your Google account domain is not allowed for this campus.",
  access_denied: "Access was denied. Please approve permissions to continue.",
}

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true })
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
    setLoading(true)
    window.location.href = getGoogleOAuthUrl()
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f7f8f8] text-[#191a1b]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(113,112,255,0.12),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(94,106,210,0.1),transparent_40%)]" />

      <div className="relative mx-auto grid min-h-svh w-full max-w-5xl place-items-center px-4 py-12 sm:px-6">
        <Card className="w-full max-w-md border-[#d0d6e0] bg-white/90 backdrop-blur">
          <CardHeader className="space-y-4">
            <BrandLogo />
            <div>
              <CardTitle className="text-3xl tracking-[-0.044em] text-[#08090a]">Sign in to Smart Campus</CardTitle>
              <CardDescription className="mt-2 text-[15px] text-[#62666d]">
                Book spaces, track tickets, and manage your campus workflow from one secure portal.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMessage && <AuthErrorAlert message={errorMessage} />}

            <GoogleSignInButton loading={loading} onClick={handleGoogleSignIn} />

            <p className="text-xs text-[#8a8f98]">
              Continuing means you agree to campus authentication policies and role-based access controls.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
