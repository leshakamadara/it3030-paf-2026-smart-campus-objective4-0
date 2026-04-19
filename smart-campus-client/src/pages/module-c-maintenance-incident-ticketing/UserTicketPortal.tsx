import { useState, useEffect } from "react";

import { ticketService } from "./services/ticketService";
import type { Ticket, TicketStatus } from "./types/ticketTypes";
import type { TicketRequestDTO, TicketResponseDTO } from "./types/ticketTypes";

import TicketCard from "./components/UserTicketCard";
import CreateTicket from "./components/CreateTicket";
import TicketDetailView from "./components/UserTicketDetailView";

type View = "list" | "create" | "detail";

export default function UserTicketPortal() {
  const [view, setView] = useState<View>("list");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "ALL">("ALL");
  const [fadeIn, setFadeIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = (v: View) => {
    setFadeIn(false);
    setTimeout(() => {
      setView(v);
      setFadeIn(true);
    }, 150);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const convertBackendTicket = (ticket: TicketResponseDTO): Ticket => ({
    id: `TKT-${String(ticket.id).padStart(3, "0")}`,
    backendId: ticket.id,
    title: ticket.title,
    category: ticket.category || "",
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,
    resourceLocation: ticket.resourceLocation || "",

    images: ticket.attachments
      .map((attachment) => attachment.cloudinarySecureUrl || attachment.cloudinaryUrl || attachment.linkUrl)
      .filter(Boolean) as string[],
    attachments: ticket.attachments
      .map((attachment) => ({ id: attachment.id, cloudinaryUrl: attachment.cloudinaryUrl, cloudinarySecureUrl: attachment.cloudinarySecureUrl, createdAt: attachment.createdAt })),
    comments: ticket.comments,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    resolutionNote: ticket.resolutionNote,
    rejectionReason: ticket.rejectionReason,
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetched = await ticketService.getAll();
      setTickets(fetched.map(convertBackendTicket));
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Unable to load tickets from backend.");
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

        // map imageFiles from UI to backend DTO (supports single imageFile or multiple imageFiles handled in service)
        imageFiles: partial.imageFiles ?? undefined,
      };

      const created = await ticketService.create(request);
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
          .map((attachment) => attachment.cloudinarySecureUrl || attachment.cloudinaryUrl || attachment.linkUrl)
          .filter(Boolean) as string[],
        comments: created.comments,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        resolutionNote: created.resolutionNote,
        rejectionReason: created.rejectionReason,
      };

      setTickets([t, ...tickets]);
    } catch (err) {
      console.error("Failed to create ticket:", err);
      setError("Unable to create ticket in backend.");
    }
  };

  const handleDelete = async (backendId: number) => {
    const ticket = tickets.find((t) => (t.backendId ?? parseInt(t.id.replace(/^TKT-/, ""), 10)) === backendId);
    if (!ticket || ticket.status !== "OPEN") {
      setError("Only open tickets can be deleted.");
      return;
    }

    try {
      await ticketService.delete(backendId);
      setTickets(tickets.filter((t) => (t.backendId ?? parseInt(t.id.replace(/^TKT-/, ""), 10)) !== backendId));
      navigate("list");
    } catch (err) {
      console.error("Failed to delete ticket:", err);
      setError("Unable to delete ticket.");
    }
  };

  const handleUpdate = (updated: Ticket) => {
    setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
  };

  const filtered = tickets.filter(
    (t) => filterStatus === "ALL" || t.status === filterStatus
  );

  const selectedTicket = tickets.find((t) => t.id === selectedId);

  const statusCounts = (["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as TicketStatus[]).reduce(
    (acc, s) => {
      acc[s] = tickets.filter((t) => t.status === s).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-[#f7f7fb]">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(view === "create" || view === "detail") && (
              <button
                onClick={() => navigate("list")}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors mr-1"
              >
                ←
              </button>
            )}
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              ⚙
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">
                My Tickets
              </p>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                Maintenance Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center">
                KM
              </div>
              <span className="text-xs text-slate-600 font-medium hidden sm:block">
                Kasun Madhawagtrhrthtrhtrrt
              </span>
            </div>

            {view === "list" && (
              <button
                onClick={() => navigate("create")}
                className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 transition-colors"
              >
                <span className="text-base leading-none">+</span>
                <span className="hidden sm:inline">New Ticket</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main
        className={`max-w-2xl mx-auto px-5 py-7 transition-all duration-150 ${
          fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
        style={{ transition: "opacity 150ms, transform 150ms" }}
      >
        {/* LIST VIEW */}
        {view === "list" && (
          <div>
            <div className="mb-7">
              <h1 className="text-xl font-bold text-slate-800">
                Hello, Kasun 👋
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Track and manage your maintenance requests below.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {([
                ["OPEN", "Open", "bg-sky-50 text-sky-700"],
                ["IN_PROGRESS", "Active", "bg-violet-50 text-violet-700"],
                ["RESOLVED", "Resolved", "bg-emerald-50 text-emerald-700"],
                ["CLOSED", "Closed", "bg-slate-100 text-slate-500"],
                
              ] as [TicketStatus, string, string][]).map(([s, label, cls]) => (
                <button
                  key={s}
                  onClick={() =>
                    setFilterStatus(filterStatus === s ? "ALL" : s)
                  }
                  className={`rounded-xl p-3 text-center transition-all border-2 ${
                    filterStatus === s
                      ? "border-violet-400 ring-2 ring-violet-100"
                      : "border-transparent"
                  } ${cls}`}
                >
                  <p className="text-xl font-black">
                    {statusCounts[s] || 0}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                    {label}
                  </p>
                </button>
              ))}
            </div>

            {/* Tickets */}
            {loading ? (
              <div className="text-center py-16 text-slate-500">
                <p className="text-4xl mb-4">⏳</p>
                <p className="font-semibold">Loading tickets...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-600">
                <p className="text-4xl mb-4">⚠️</p>
                <p className="font-semibold">{error}</p>
                <p className="text-sm mt-2 text-slate-500">Please refresh or try again later.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">📄</p>
                <p className="font-semibold text-slate-600">
                  No tickets here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((t) => (
                  <TicketCard
                    key={t.id}
                    ticket={t}
                    onClick={() => {
                      setSelectedId(t.id);
                      navigate("detail");
                    }}
                    onDelete={t.status === "OPEN" ? (id) => {
                      if (confirm("Are you sure you want to delete this ticket?")) {
                        handleDelete(id);
                      }
                    } : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* CREATE */}
        {view === "create" && (
          <CreateTicket
            onSubmit={(partial) => handleCreate(partial)}
            onCancel={() => navigate("list")}
          />
        )}

        {/* DETAIL */}
        {view === "detail" && selectedTicket && (
          <TicketDetailView
            ticket={selectedTicket}
            onBack={() => navigate("list")}
            onUpdate={(updated) => {
              handleUpdate(updated);
              setSelectedId(updated.id);
            }}
            onDelete={selectedTicket.status === "OPEN" ? (id) => {
              if (confirm("Are you sure you want to delete this ticket?")) {
                handleDelete(id);
              }
            } : undefined}
          />
        )}
      </main>
    </div>
  );
}