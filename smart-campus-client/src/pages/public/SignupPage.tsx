import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { SignupForm } from "@/components/signup-form"
import { useAuth } from "@/context/AuthContext"
import { campusRegister, getGoogleOAuthUrl } from "@/services/auth"

export function SignupPage() {
  const navigate = useNavigate()
  const { isAuthenticated, setSession } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, navigate])

  async function handleCampusRegister(payload: {
    fullName: string
    email: string
    password: string
    confirmPassword: string
  }) {
    setLoading(true)
    setErrorMessage(null)

    try {
      const response = await campusRegister(payload)
      if (!response.token) {
        throw new Error("No token received from server")
      }

      setSession(response.token.replace(/^Bearer\s+/i, ""), response.user)
      navigate("/", { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Campus registration failed"
      setErrorMessage(message)
      setLoading(false)
    }
  }

  function handleGoogleSignIn() {
    window.location.assign(getGoogleOAuthUrl())
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f7f8f8] text-[#191a1b]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(113,112,255,0.18),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(94,106,210,0.14),transparent_44%)]" />

      <div className="relative mx-auto grid min-h-svh w-full max-w-5xl place-items-center px-4 py-12 sm:px-6">
        <SignupForm
          className="w-full max-w-xl"
          loading={loading}
          errorMessage={errorMessage}
          onCampusRegister={handleCampusRegister}
          onGoogleSignIn={handleGoogleSignIn}
          onNavigateToSignIn={() => navigate("/login")}
        />
      </div>
    </main>
  )
}
