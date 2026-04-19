import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AuthErrorAlertProps {
  message: string
}

export function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  return (
    <Alert className="border-[#e6e6e6] bg-[#ffffff] text-[#191a1b]">
      <AlertTitle className="text-[#3d0f1f]">Authentication Error</AlertTitle>
      <AlertDescription className="text-[#6d2a3f]">{message}</AlertDescription>
    </Alert>
  )
}
