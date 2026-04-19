import { Button } from "@/components/ui/button"

interface GoogleSignInButtonProps {
  loading?: boolean
  onClick: () => void
}

export function GoogleSignInButton({ loading = false, onClick }: GoogleSignInButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="h-11 w-full rounded-lg border border-[#d0d6e0] bg-white text-[#191a1b] hover:bg-[#f3f4f5]"
    >
      <span className="inline-flex items-center gap-2 text-sm font-[510]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17.1 3 14.8 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.8-.1-1.2H12Z" />
        </svg>
        {loading ? "Redirecting..." : "Sign in with Google"}
      </span>
    </Button>
  )
}
