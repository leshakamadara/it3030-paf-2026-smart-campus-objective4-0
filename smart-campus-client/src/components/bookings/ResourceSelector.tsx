import { useMemo, useState } from "react";

import type { ResourceSummary } from "@/types/booking";

interface ResourceSelectorProps {
  resources: ResourceSummary[];
  value: string;
  onChange: (value: string) => void;
}

export function ResourceSelector({ resources, value, onChange }: ResourceSelectorProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return resources;
    }

    return resources.filter((resource) => {
      const haystack = `${resource.id} ${resource.name ?? ""} ${resource.type ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, resources]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-[510] text-[#d0d6e0]">Resource selector</label>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search resource by name or UUID"
        className="h-10 w-full rounded-md border border-[#ffffff14] bg-[#08090a] px-3 text-sm text-[#d0d6e0] placeholder:text-[#62666d] focus:border-[#7170ff] focus:outline-none"
      />

      {filtered.length > 0 && (
        <div className="max-h-40 space-y-2 overflow-auto rounded-lg border border-[#ffffff12] bg-[#0a0b0d] p-2">
          {filtered.slice(0, 20).map((resource) => {
            const active = value === resource.id;
            return (
              <button
                key={resource.id}
                type="button"
                onClick={() => onChange(resource.id)}
                className={`flex w-full items-center gap-3 rounded-md border px-2 py-2 text-left transition ${
                  active
                    ? "border-[#7170ff] bg-[#222754] text-white"
                    : "border-[#ffffff12] bg-[#111214] text-[#d0d6e0] hover:bg-[#1a1c21]"
                }`}
              >
                {resource.imageUrl ? (
                  <img src={resource.imageUrl} alt={resource.name ?? "Resource"} className="h-8 w-8 rounded-md object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-md border border-[#ffffff14] bg-[#17191f]" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-[510]">{resource.name ?? "Unnamed resource"}</p>
                  <p className="truncate text-[10px] text-[#8a8f98]">{resource.id}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Selected Resource UUID"
        required
        className="h-10 w-full rounded-md border border-[#ffffff14] bg-[#08090a] px-3 text-sm text-[#d0d6e0] placeholder:text-[#62666d] focus:border-[#7170ff] focus:outline-none"
      />
    </div>
  );
}
