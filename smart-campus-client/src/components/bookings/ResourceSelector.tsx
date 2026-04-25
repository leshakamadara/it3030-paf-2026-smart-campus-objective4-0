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

  const selectedResource = resources.find((r) => r.id === value);

  return (
    <div className="space-y-2">
      <label className="text-xs font-[510] text-[#43464b]">Resource</label>

      {/* Selected resource preview */}
      {selectedResource && (
        <div className="flex items-center gap-3 rounded-lg border border-[#5e6ad2]/40 bg-[#eef2ff] px-3 py-2">
          {selectedResource.imageUrl ? (
            <img
              src={selectedResource.imageUrl}
              alt={selectedResource.name ?? "Resource"}
              className="h-8 w-8 rounded-md border border-[#d0d6e0] object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-md border border-[#d0d6e0] bg-[#f3f4f5]" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-[590] text-[#191a1b]">
              {selectedResource.name ?? "Unnamed resource"}
            </p>
            <p className="truncate text-[10px] text-[#62666d]">
              ID: {selectedResource.id} · {selectedResource.type ?? "General"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[10px] text-[#5e6ad2] hover:underline"
          >
            Change
          </button>
        </div>
      )}

      {/* Search input */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or type…"
        className="h-10 w-full rounded-md border border-[#d0d6e0] bg-[#f7f8f8] px-3 text-sm text-[#191a1b] placeholder:text-[#8a8f98] focus:border-[#7170ff] focus:outline-none focus:ring-2 focus:ring-[#7170ff]/20"
      />

      {/* Resource list */}
      {filtered.length > 0 && !selectedResource && (
        <div className="max-h-44 space-y-1 overflow-auto rounded-lg border border-[#d0d6e0] bg-[#ffffff] p-2">
          {filtered.slice(0, 20).map((resource) => {
            const active = value === resource.id;
            return (
              <button
                key={resource.id}
                type="button"
                onClick={() => onChange(resource.id)}
                className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-xs transition-all ${
                  active
                    ? "border-[#5e6ad2] bg-[#eef2ff] text-[#5e6ad2]"
                    : "border-[#d0d6e0] bg-[#ffffff] text-[#43464b] hover:border-[#7170ff]/40 hover:bg-[#f7f8ff]"
                }`}
              >
                {resource.imageUrl ? (
                  <img
                    src={resource.imageUrl}
                    alt={resource.name ?? "Resource"}
                    className="h-8 w-8 flex-shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 flex-shrink-0 rounded-md border border-[#d0d6e0] bg-[#f3f4f5]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-[510]">{resource.name ?? "Unnamed resource"}</p>
                  <p className="truncate text-[10px] text-[#8a8f98]">
                    {resource.type ?? "General"} · ID {resource.id}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {resources.length === 0 && (
        <p className="text-xs text-[#8a8f98]">Loading resources…</p>
      )}

      {/* Hidden input for form validation */}
      <input
        type="hidden"
        value={value}
        required
      />
    </div>
  );
}
