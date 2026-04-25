import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ticketService } from "@/services/ticketService";
import type { Ticket, TicketStatus, TicketRequestDTO, TicketResponseDTO } from "@/types/ticketTypes";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import TicketCard from "@/components/UserTicketCard";
import CreateTicket from "./CreateTicket";
import TicketDetailView from "./UserTicketDetailView";

type View = "list" | "create" | "detail";

const STATUS_LABELS: { key: TicketStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "CLOSED", label: "Closed" },
  { key: "REJECTED", label: "Rejected" },
];

export default function UserTicketPortal() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("list");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "priority">("newest");
  const [fadeIn, setFadeIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = (v: View) => {
    setFadeIn(false);
    setTimeout(() => { setView(v); setFadeIn(true); }, 150);
  };

  useEffect(() => { fetchTickets(); }, []);

  const convertBackendTicket = (ticket: TicketResponseDTO): Ticket => {
    const createdAt = ticket.createdAt || (ticket as any).created_at || "";
    const updatedAt = ticket.updatedAt || (ticket as any).updated_at || "";
    return {
      id: `TKT-${String(ticket.id).padStart(3, "0")}`,
      backendId: ticket.id,
      title: ticket.title,
      category: ticket.category || "",
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      resourceLocation: ticket.resourceLocation || "",
      images: ticket.attachments
        .map((a) => a.cloudinarySecureUrl || a.cloudinaryUrl || a.linkUrl)
        .filter(Boolean) as string[],
      attachments: ticket.attachments.map((a) => ({
        id: a.id,
        cloudinaryUrl: a.cloudinaryUrl,
        cloudinarySecureUrl: a.cloudinarySecureUrl,
        createdAt: a.createdAt,
      })),
      comments: ticket.comments,
      createdAt,
      updatedAt,
      resolutionNote: ticket.resolutionNote,
      rejectionReason: ticket.rejectionReason,
    };
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const all = await ticketService.getAll();
      // BUG-8 fix: only show the current user's tickets
      const mine = all.filter((t) => t.createdBy === user?.email);
      const converted = mine.map(convertBackendTicket);
      const sorted = converted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setTickets(sorted);
    } catch {
      setError("Unable to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (partial: Partial<Ticket> & { imageFiles?: File[] }) => {
    try {
      setError(null);
      const request: TicketRequestDTO = {
        title: partial.title || "",
        description: partial.description || "",
        priority: partial.priority || "MEDIUM",
        category: partial.category,
        resourceLocation: partial.resourceLocation,
        imageFiles: partial.imageFiles,
      };
      const created = await ticketService.create(request);
      const createdAt = created.createdAt || new Date().toISOString();
      const t: Ticket = {
        id: `TKT-${String(created.id).padStart(3, "0")}`,
        backendId: created.id,
        title: created.title,
        category: created.category || "",
        description: created.description,
        priority: created.priority,
        status: created.status,
        resourceLocation: partial.resourceLocation || "",
        images: created.attachments
          .map((a) => a.cloudinarySecureUrl || a.cloudinaryUrl || a.linkUrl)
          .filter(Boolean) as string[],
        comments: created.comments,
        createdAt,
        updatedAt: created.updatedAt || createdAt,
        resolutionNote: created.resolutionNote,
        rejectionReason: created.rejectionReason,
      };
      setTickets([t, ...tickets]);
    } catch {
      setError("Unable to create ticket. Please try again.");
    }
  };

  const handleDelete = async (backendId: number) => {
    const ticket = tickets.find(
      (t) => (t.backendId ?? parseInt(t.id.replace(/^TKT-/, ""), 10)) === backendId,
    );
    if (!ticket || ticket.status !== "OPEN") {
      setError("Only open tickets can be deleted.");
      return;
    }
    try {
      await ticketService.delete(backendId);
      setTickets(tickets.filter(
        (t) => (t.backendId ?? parseInt(t.id.replace(/^TKT-/, ""), 10)) !== backendId,
      ));
      navigate("list");
    } catch {
      setError("Unable to delete ticket.");
    }
  };

  const handleUpdate = (updated: Ticket) =>
    setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));

  const filtered = tickets.filter(
    (t) =>
      (filterStatus === "ALL" || t.status === filterStatus) &&
      (filterPriority === "ALL" || t.priority === filterPriority) &&
      (searchQuery === "" ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "priority") {
      const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const stats = {
    open: tickets.filter((t) => t.status === "OPEN").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
    rejected: tickets.filter((t) => t.status === "REJECTED").length,
  };

  const selectedTicket = tickets.find((t) => t.id === selectedId);
  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  return (
    <div
      className={`min-h-[calc(100svh-57px)] bg-[#f7f8f8] transition-all duration-150 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}
    >
      <div className="mx-auto max-w-3xl px-4 py-8">

        {/* ── LIST VIEW ─────────────────────────────────── */}
        {view === "list" && (
          <>
            {/* Page header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Breadcrumb className="mb-2">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/dashboard">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Tickets</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <h1 className="mt-1 text-2xl font-[590] tracking-[-0.44px] text-[#191a1b]">
                  Hello, {firstName} 👋
                </h1>
                <p className="mt-1 text-sm text-[#62666d]">
                  Track and manage your maintenance requests below.
                </p>
              </div>
              <button
                id="btn-new-ticket"
                onClick={() => navigate("create")}
                className="shrink-0 rounded-md bg-[#5e6ad2] px-4 py-2 text-xs font-[510] text-white transition-colors hover:bg-[#7170ff]"
              >
                + New Ticket
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-lg border border-[#f0b8c4] bg-[#fff1f4] px-4 py-3 text-sm text-[#8f3346]">
                {error}
                <button onClick={() => setError(null)} className="ml-3 font-[510] underline">
                  Dismiss
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[
                { label: "Open", value: stats.open, color: "text-[#5e6ad2]", bg: "bg-[#eef0fb] border-[#c5c9f0]" },
                { label: "Resolved", value: stats.resolved, color: "text-[#27a644]", bg: "bg-[#edfaf2] border-[#b3e8c4]" },
                { label: "Rejected", value: stats.rejected, color: "text-[#c0392b]", bg: "bg-[#fdf3f3] border-[#f0c4c4]" },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-xl border p-4 text-center ${s.bg}`}
                >
                  <p className={`text-2xl font-[590] tracking-tight ${s.color}`}>{s.value}</p>
                  <p className="mt-1 text-[10px] font-[510] uppercase tracking-[0.15em] text-[#62666d]">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                id="ticket-search"
                type="text"
                placeholder="Search by title, ID or description…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-[#d0d6e0] bg-white px-4 py-2 text-sm text-[#191a1b] placeholder:text-[#8a8f98] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/40"
              />
            </div>

            {/* Status filter pills */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {STATUS_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(filterStatus === key && key !== "ALL" ? "ALL" : key)}
                  className={`rounded-full px-3 py-1 text-xs font-[510] transition-colors ${
                    filterStatus === key
                      ? "bg-[#5e6ad2] text-white"
                      : "bg-[#f3f4f5] text-[#62666d] hover:bg-[#e6e7e8]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Priority & sort */}
            <div className="mb-6 flex items-center gap-3">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="rounded-md border border-[#d0d6e0] bg-white px-3 py-2 text-xs font-[510] text-[#191a1b] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/40"
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "priority")}
                className="rounded-md border border-[#d0d6e0] bg-white px-3 py-2 text-xs font-[510] text-[#191a1b] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/40"
              >
                <option value="newest">Newest first</option>
                <option value="priority">By priority</option>
              </select>
              <button
                onClick={fetchTickets}
                className="ml-auto rounded-md border border-[#d0d6e0] bg-white px-3 py-2 text-xs font-[510] text-[#62666d] transition-colors hover:bg-[#f3f4f5]"
              >
                ↻ Refresh
              </button>
            </div>

            {/* Ticket list */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#5e6ad2] border-t-transparent" />
                <p className="text-sm text-[#8a8f98]">Loading tickets…</p>
              </div>
            ) : sorted.length === 0 ? (
              <div className="rounded-xl border border-[#d0d6e0] bg-white px-8 py-20 text-center">
                <p className="text-4xl">📄</p>
                <p className="mt-4 text-sm font-[510] text-[#191a1b]">No tickets found</p>
                <p className="mt-1 text-xs text-[#8a8f98]">
                  {tickets.length === 0
                    ? "You haven't submitted any tickets yet."
                    : "Try adjusting your filters."}
                </p>
                {tickets.length === 0 && (
                  <button
                    onClick={() => navigate("create")}
                    className="mt-6 rounded-md bg-[#5e6ad2] px-5 py-2 text-xs font-[510] text-white hover:bg-[#7170ff]"
                  >
                    Submit your first ticket
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {sorted.map((t) => (
                  <TicketCard
                    key={t.id}
                    ticket={t}
                    onClick={() => { setSelectedId(t.id); navigate("detail"); }}
                    onDelete={
                      t.status === "OPEN"
                        ? (id) => {
                            if (confirm("Delete this ticket? This cannot be undone.")) {
                              handleDelete(id);
                            }
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── CREATE VIEW ───────────────────────────────── */}
        {view === "create" && (
          <>
            <button
              onClick={() => navigate("list")}
              className="mb-6 flex items-center gap-1.5 text-sm text-[#62666d] transition-colors hover:text-[#191a1b]"
            >
              ← Back to my tickets
            </button>
            <CreateTicket
              onSubmit={(partial) => { handleCreate(partial); navigate("list"); }}
              onCancel={() => navigate("list")}
            />
          </>
        )}

        {/* ── DETAIL VIEW ───────────────────────────────── */}
        {view === "detail" && selectedTicket && (
          <TicketDetailView
            ticket={selectedTicket}
            onBack={() => navigate("list")}
            onUpdate={(updated) => { handleUpdate(updated); setSelectedId(updated.id); }}
          />
        )}
      </div>
    </div>
  );
}