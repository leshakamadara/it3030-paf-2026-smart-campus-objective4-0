import { useState } from "react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  FieldError,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface LoginFormProps extends React.ComponentProps<"div"> {
  loadingCampus?: boolean
  loadingGoogle?: boolean
  errorMessage?: string | null
  onCampusSignIn: (payload: { email: string; password: string }) => void
  onGoogleSignIn: () => void
  onNavigateToSignup: () => void
}

export function LoginForm({
  className,
  loadingCampus = false,
  loadingGoogle = false,
  errorMessage,
  onCampusSignIn,
  onGoogleSignIn,
  onNavigateToSignup,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onCampusSignIn({ email: email.trim(), password })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-[#d0d6e0] bg-[#ffffff] p-0 text-[#191a1b]">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-[590] tracking-[-0.028em] text-[#191a1b]">Welcome back</h1>
                <p className="text-balance text-sm text-[#62666d]">
                  Sign in with your campus account or continue with Google.
                </p>
              </div>
              {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@campus.edu"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="border-[#d0d6e0] bg-[#f5f6f7] text-[#191a1b]"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="ml-auto text-xs text-[#62666d] underline-offset-2 hover:text-[#43464b] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="border-[#d0d6e0] bg-[#f5f6f7] text-[#191a1b]"
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={loadingCampus}
                  className="border border-[#5e6ad2] bg-[#5e6ad2] text-white hover:bg-[#7170ff]"
                >
                  {loadingCampus ? "Signing in..." : "Sign in with campus account"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-[#ffffff]">
                Or continue with
              </FieldSeparator>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  disabled={loadingGoogle}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    onGoogleSignIn()
                  }}
                  className="border-[#d0d6e0] bg-[#ffffff] text-[#191a1b] hover:bg-[#f3f4f5]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {loadingGoogle ? "Redirecting..." : "Sign in with Google"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have a campus account?{" "}
                <button
                  type="button"
                  onClick={onNavigateToSignup}
                  className="text-[#43464b] underline underline-offset-4 hover:text-[#191a1b]"
                >
                  Sign up
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden border-l border-[#d0d6e0] bg-[radial-gradient(circle_at_top,rgba(113,112,255,0.22),rgba(247,248,248,0.94)_50%),linear-gradient(160deg,#ffffff,#f3f4f5)] p-8 md:block">
            <p className="text-xs font-[510] uppercase tracking-[0.18em] text-[#7170ff]">Campus Access</p>
            <h2 className="mt-3 text-2xl font-[590] tracking-[-0.032em] text-[#191a1b]">One secure portal for students and staff</h2>
            <p className="mt-4 text-sm leading-6 text-[#62666d]">
              Use your campus account for direct sign-in or Google SSO for federated access.
            </p>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-[#62666d]">
        By continuing, you agree to campus authentication and role-based access policies.
      </FieldDescription>
    </div>
  )
}
