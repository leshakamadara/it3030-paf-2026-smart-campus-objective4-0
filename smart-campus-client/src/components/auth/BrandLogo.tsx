export function BrandLogo() {
  return (
    <div className="inline-flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#23252a] bg-[#f5f6f7] shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#5e6ad2]" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 9.5 12 4l9 5.5" />
          <path d="M5.5 10.5V19h13v-8.5" />
          <path d="M9.5 19v-5h5v5" />
        </svg>
      </div>
      <div>
        <p className="text-xs font-[510] uppercase tracking-[0.14em] text-[#7a7fad]">Smart Campus</p>
        <p className="text-sm font-[590] text-[#191a1b]">Access Portal</p>
      </div>
    </div>
  )
}
