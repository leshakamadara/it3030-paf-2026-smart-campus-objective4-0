import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"
import { fetchCurrentUser } from "@/services/auth"

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setSession, clearSession } = useAuth()

  useEffect(() => {
    const token = searchParams.get("token")
    const error = searchParams.get("error")

    if (error || !token) {
      clearSession()
      navigate(`/login?error=${encodeURIComponent(error ?? "oauth2_authentication_failed")}`, { replace: true })
      return
    }

    void fetchCurrentUser(token)
      .then((response) => {
        setSession(token, response.user)
        navigate("/", { replace: true })
      })
      .catch(() => {
        clearSession()
        navigate("/login?error=oauth2_authentication_failed", { replace: true })
      })
  }, [searchParams, navigate, setSession, clearSession])

  return (
    <main className="grid min-h-svh place-items-center bg-[#f7f8f8] px-6 text-[#191a1b]">
      <section className="w-full max-w-md rounded-xl border border-[#d0d6e0] bg-[#ffffff] p-8 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#7170ff] border-t-transparent" />
        <h1 className="text-lg font-[590] tracking-[-0.02em]">Completing sign-in...</h1>
        <p className="mt-2 text-sm text-[#62666d]">Please wait while we validate your campus session.</p>
      </section>
    </main>
  )
}
