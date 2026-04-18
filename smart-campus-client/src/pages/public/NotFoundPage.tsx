import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-[#f7f8f8] px-6 text-center text-[#191a1b]">
      <section className="w-full max-w-md space-y-4 rounded-xl border border-[#d0d6e0] bg-white p-8 shadow-[0_6px_30px_rgba(0,0,0,0.08)]">
        <p className="text-xs font-[510] uppercase tracking-[0.2em] text-[#7a7fad]">Page not found</p>
        <h1 className="text-5xl font-[590] tracking-[-0.056em] text-[#08090a]">404</h1>
        <p className="text-sm text-[#62666d]">We could not find that route. Use the portal home to continue.</p>
        <div className="pt-2">
          <Link to="/">
            <Button className="bg-[#5e6ad2] text-white hover:bg-[#7170ff]">Go home</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
