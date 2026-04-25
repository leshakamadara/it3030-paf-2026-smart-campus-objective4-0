import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ticketService } from "@/services/ticketService";
import type { TicketResponseDTO, TicketStatus, Priority } from "@/types/ticketTypes";
import {
  PRIORITY_META,
  STATUS_META,
} from "../../../constants/Ticket_constants/constants";
import { TicketCard } from "@/components/AdminTicketCard";
import { WorkflowPipeline } from "@/components/WorkflowPipeline";
import { AdminTicketDetailView } from "./AdminTicketDetailView";

const PRIORITY_ORDER: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export default function AdminTicketPortal() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponseDTO | null>(null);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "ALL">("ALL");
  const [filterPriority, setFilterPriority] = useState<Priority | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  // BUG-6 fix: isAdmin includes SUPER_ADMIN
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ticketService.getAll();
      setTickets(data);
    } catch {
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (updated: TicketResponseDTO) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTicket(updated);
  };

  const filtered = tickets
    .filter((t) => {
      if (filterStatus === "ALL") return t.status !== "REJECTED";
      return t.status === filterStatus;
    })
    .filter((t) => filterPriority === "ALL" || t.priority === filterPriority)
    .filter(
      (t) =>
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toString().includes(search) ||
        (t.description ?? "").toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "priority")
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      const diff = Number(a.id) - Number(b.id);
      return sortDir === "desc" ? -diff : diff;
    });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter(
      (t) => t.status === "RESOLVED" || t.status === "CLOSED",
    ).length,
    rejected: tickets.filter((t) => t.status === "REJECTED").length,
  };

  const roleInitials = (user?.fullName ?? user?.email ?? "A")
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-[calc(100svh-57px)] bg-[#f7f8f8]">
      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* ── Page header ───────────────────────────────── */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-[510] uppercase tracking-[0.18em] text-[#5e6ad2]">
              Module C · Admin
            </p>
            <h1 className="mt-1 text-2xl font-[590] tracking-[-0.44px] text-[#191a1b]">
              Maintenance Portal
            </h1>
            <p className="mt-1 text-sm text-[#62666d]">
              Incident Ticketing System — manage and resolve campus maintenance requests.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#d0d6e0] bg-white px-3 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef0fb] text-[11px] font-[590] text-[#5e6ad2]">
              {roleInitials}
            </div>
            <span className="text-xs font-[510] text-[#43464b]">{user?.fullName ?? user?.email}</span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-[510] uppercase ${isAdmin ? "bg-[#eef0fb] text-[#5e6ad2]" : "bg-[#f3f4f5] text-[#62666d]"}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-[#f0b8c4] bg-[#fff1f4] px-4 py-3 text-sm text-[#8f3346]">
            {error}
            <button onClick={fetchTickets} className="ml-3 font-[510] underline">Retry</button>
          </div>
        )}

        {/* ── Stats ──────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: stats.total, color: "text-[#191a1b]", bg: "bg-white" },
            { label: "Open", value: stats.open, color: "text-[#5e6ad2]", bg: "bg-[#eef0fb]" },
            { label: "In Progress", value: stats.inProgress, color: "text-[#d97706]", bg: "bg-[#fffbeb]" },
            { label: "Resolved", value: stats.resolved, color: "text-[#27a644]", bg: "bg-[#edfaf2]" },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.bg} rounded-xl border border-[#d0d6e0] px-4 py-3`}
            >
              <p className="text-[10px] font-[510] uppercase tracking-[0.15em] text-[#8a8f98]">
                {s.label}
              </p>
              <p className={`mt-1 text-2xl font-[590] tracking-tight ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Workflow pipeline ──────────────────────────── */}
        <div className="mb-5 flex items-center justify-between rounded-xl border border-[#d0d6e0] bg-white px-4 py-3">
          <p className="text-[10px] font-[510] uppercase tracking-[0.15em] text-[#8a8f98]">
            Workflow
          </p>
          <WorkflowPipeline tickets={tickets} />
          <button
            onClick={() => setFilterStatus((s) => (s === "REJECTED" ? "ALL" : "REJECTED"))}
            className={`rounded-full border px-3 py-1 text-xs font-[510] transition-colors ${filterStatus === "REJECTED" ? "border-[#c0392b] bg-[#c0392b] text-white" : "border-[#f0c4c4] bg-[#fdf3f3] text-[#c0392b]"}`}
          >
            ✗ Rejected: {stats.rejected}
          </button>
        </div>

        {/* ── Filters ──────────────────────────────────── */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8a8f98]">
              🔍
            </span>
            <input
              id="admin-ticket-search"
              className="w-full rounded-md border border-[#d0d6e0] bg-white py-2 pl-9 pr-4 text-sm text-[#191a1b] placeholder:text-[#8a8f98] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/40"
              placeholder="Search by title, ID or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { key: "ALL", label: "All Active" },
                { key: "OPEN", label: STATUS_META.OPEN.label },
                { key: "IN_PROGRESS", label: STATUS_META.IN_PROGRESS.label },
                { key: "RESOLVED", label: STATUS_META.RESOLVED.label },
                { key: "CLOSED", label: STATUS_META.CLOSED.label },
                { key: "REJECTED", label: STATUS_META.REJECTED.label },
              ] as { key: TicketStatus | "ALL"; label: string }[]
            ).map((s) => (
              <button
                key={s.key}
                onClick={() => setFilterStatus(s.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-[510] transition-colors ${
                  filterStatus === s.key
                    ? "border-[#5e6ad2] bg-[#5e6ad2] text-white"
                    : "border-[#d0d6e0] bg-white text-[#62666d] hover:bg-[#f3f4f5]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Priority */}
          <select
            className="rounded-md border border-[#d0d6e0] bg-white px-3 py-2 text-xs font-[510] text-[#191a1b] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/40"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | "ALL")}
          >
            <option value="ALL">All Priorities</option>
            {(["HIGH", "MEDIUM", "LOW"] as Priority[]).map((p) => (
              <option key={p} value={p}>{PRIORITY_META[p].label}</option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex overflow-hidden rounded-md border border-[#d0d6e0] bg-white">
            <button
              onClick={() => {
                if (sortBy === "date") setSortDir((d) => (d === "desc" ? "asc" : "desc"));
                else { setSortBy("date"); setSortDir("desc"); }
              }}
              className={`px-3 py-2 text-xs font-[510] transition-colors ${sortBy === "date" ? "bg-[#5e6ad2] text-white" : "text-[#62666d] hover:bg-[#f3f4f5]"}`}
            >
              {sortBy === "date" ? (sortDir === "desc" ? "Newest" : "Oldest") : "Date"}
            </button>
            <button
              onClick={() => setSortBy("priority")}
              className={`px-3 py-2 text-xs font-[510] transition-colors ${sortBy === "priority" ? "bg-[#5e6ad2] text-white" : "text-[#62666d] hover:bg-[#f3f4f5]"}`}
            >
              Priority
            </button>
          </div>

          <button
            onClick={fetchTickets}
            className="rounded-md border border-[#d0d6e0] bg-white px-3 py-2 text-xs font-[510] text-[#62666d] transition-colors hover:bg-[#f3f4f5]"
          >
            ↻ Refresh
          </button>
        </div>

        {/* ── Ticket grid ──────────────────────────────── */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#5e6ad2] border-t-transparent" />
            <p className="text-sm text-[#8a8f98]">Loading tickets…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-[#d0d6e0] bg-white px-8 py-24 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-4 text-sm font-[510] text-[#191a1b]">No tickets found</p>
            <p className="mt-1 text-xs text-[#8a8f98]">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <TicketCard key={t.id} ticket={t} onClick={() => setSelectedTicket(t)} />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedTicket && (
        <AdminTicketDetailView
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}