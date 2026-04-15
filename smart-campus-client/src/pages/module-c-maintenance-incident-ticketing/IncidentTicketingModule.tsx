import { useState, useEffect } from "react";

import { ticketService } from "./services/ticketService";

import type { TicketResponseDTO, TicketStatus, Priority } from "./types/ticketTypes";
import {
  
  PRIORITY_META,
  STATUS_META,
} from "./constants/constants";
import { CURRENT_USER } from "./constants/ticketConstants";

import { TicketCard } from "./components/AdminTicketCard";
import { WorkflowPipeline } from "./components/WorkflowPipeline";
import { AdminTicketDetailView } from "./components/AdminTicketDetailView";

export default function IncidentTicketingModule() {
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponseDTO | null>(null);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "ALL">("ALL");
  const [filterPriority, setFilterPriority] = useState<Priority | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, we'll use an empty array since the backend doesn't have a getAll endpoint
      // In a real implementation, you'd add a GET /api/tickets endpoint to the backend
      const fetchedTickets = await ticketService.getAll();
      setTickets(fetchedTickets);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Create Ticket
  const handleCreate = async (data: any) => {
    try {
      setError(null);
      const newTicket = await ticketService.create(data);
      setTickets([newTicket, ...tickets]);
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to create ticket:", err);
      setError("Failed to create ticket. Please try again.");
    }
  };

  // Update Ticket
  const handleUpdate = async (updated: TicketResponseDTO) => {
    try {
      setError(null);
      // Update the ticket in the local state
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setSelectedTicket(updated);
    } catch (err) {
      console.error("Failed to update ticket:", err);
      setError("Failed to update ticket. Please try again.");
    }
  };

  //  Filters & Sorting
  const PRIORITY_ORDER: Record<Priority, number> = {
    HIGH: 0,
    MEDIUM: 1,
    LOW: 2,
  };

  const filtered = tickets
    .filter((t) => filterStatus === "ALL" || t.status === filterStatus)
    .filter(
      (t) => filterPriority === "ALL" || t.priority === filterPriority
    )
    .filter(
      (t) =>
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toString().toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) =>
      sortBy === "priority"
        ? PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    resolved: tickets.filter(
      (t) => t.status === "RESOLVED" || t.status === "CLOSED"
    ).length,
  };



  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">⚙</div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">Maintenance Portal</h1>
              <p className="text-xs text-slate-400">Incident Ticketing System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
              <span className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-semibold">
                {CURRENT_USER.avatar}
              </span>
              <span className="font-medium">{CURRENT_USER.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  CURRENT_USER.role === "ADMIN"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {CURRENT_USER.role}
              </span>
            </div>


          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Tickets", value: stats.total, color: "text-slate-700", bg: "bg-white" },
            { label: "Open", value: stats.open, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "Resolved", value: stats.resolved, color: "text-emerald-700", bg: "bg-emerald-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border border-slate-200 rounded-xl px-4 py-3`}>
              <p className="text-xs text-slate-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Workflow pipeline */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Workflow</p>
          <WorkflowPipeline tickets={tickets} />
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span className="bg-red-50 border border-red-200 text-red-600 px-2 py-0.5 rounded-full">
              ✗ Rejected: {tickets.filter(t => t.status === "REJECTED").length}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
              placeholder="Search tickets by title, ID, or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 text-slate-600"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TicketStatus | "ALL")}
            >
              <option value="ALL">All Statuses</option>
              {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"] as TicketStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>

            <select
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 text-slate-600"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as Priority | "ALL")}
            >
              <option value="ALL">All Priorities</option>
              {(["HIGH", "MEDIUM", "LOW"] as Priority[]).map((p) => (
                <option key={p} value={p}>{PRIORITY_META[p].label}</option>
              ))}
            </select>

            <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
              {(["date", "priority"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${sortBy === s ? "bg-violet-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  {s === "date" ? "Newest" : "Priority"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ticket list */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-4xl mb-3">⏳</p>
            <p className="font-medium">Loading tickets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-4xl mb-3"></p>
            <p className="font-medium">No tickets found</p>
            <p className="text-sm mt-1">Try adjusting your filters or create a new ticket.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <TicketCard key={t.id} ticket={t} onClick={() => setSelectedTicket(t)} />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}

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