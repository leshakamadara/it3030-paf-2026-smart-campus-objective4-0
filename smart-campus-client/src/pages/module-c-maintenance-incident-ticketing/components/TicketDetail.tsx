import { useState } from "react";

import type { Ticket, Comment, User } from "../types/ticketTypes";
import {
  CURRENT_USER,
  TECHNICIANS,
  STATUS_FLOW,
  STATUS_CONFIG,
} from "../constants/ticketConstants";

import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { PriorityDot } from "./PriorityDot";
import { Divider } from "./Divider";

export const TicketDetail = ({
  ticket,
  onClose,
  onUpdate,
}: {
  ticket: Ticket;
  onClose: () => void;
  onUpdate: (updated: Ticket) => void;
}) => {
  const [comment, setComment] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [showAssign, setShowAssign] = useState(false);

  const [showResolution, setShowResolution] = useState(false);
  const [resolutionNote, setResolutionNote] = useState(
    ticket.resolutionNote || ""
  );

  const isAdmin = CURRENT_USER.role === "ADMIN";
  const isTech =
    CURRENT_USER.role === "TECHNICIAN" || CURRENT_USER.role === "ADMIN";

  const nextStatuses = STATUS_FLOW[ticket.status];

  // Comments 
  const addComment = () => {
    if (!comment.trim()) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorId: CURRENT_USER.id,
      authorName: CURRENT_USER.name,
      authorRole: CURRENT_USER.role,
      content: comment,
      createdAt: new Date().toISOString(),
    };

    onUpdate({
      ...ticket,
      comments: [...ticket.comments, newComment],
      updatedAt: new Date().toISOString(),
    });

    setComment("");
  };

  const deleteComment = (id: string) => {
    onUpdate({
      ...ticket,
      comments: ticket.comments.filter((c) => c.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  const saveEditComment = (id: string) => {
    onUpdate({
      ...ticket,
      comments: ticket.comments.map((c) =>
        c.id === id
          ? {
              ...c,
              content: editContent,
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
      updatedAt: new Date().toISOString(),
    });

    setEditingComment(null);
  };

  // ─── Workflow Actions ───────────────────────────────────────
  const advanceStatus = (status: Ticket["status"]) => {
    if (status === "RESOLVED" && !resolutionNote) {
      setShowResolution(true);
      return;
    }

    onUpdate({
      ...ticket,
      status,
      resolutionNote:
        status === "RESOLVED" ? resolutionNote : ticket.resolutionNote,
      updatedAt: new Date().toISOString(),
    });
  };

  const assignTechnician = (tech: User) => {
    onUpdate({
      ...ticket,
      assignedTo: tech.id,
      assignedToName: tech.name,
      updatedAt: new Date().toISOString(),
    });

    setShowAssign(false);
  };

  const rejectTicket = () => {
    if (!rejectReason.trim()) return;

    onUpdate({
      ...ticket,
      status: "REJECTED",
      rejectionReason: rejectReason,
      updatedAt: new Date().toISOString(),
    });

    setShowRejectModal(false);
  };

  const canEditComment = (c: Comment) =>
    c.authorId === CURRENT_USER.id || isAdmin;

  const canDeleteComment = (c: Comment) =>
    c.authorId === CURRENT_USER.id || isAdmin;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-slate-400 bg-slate-50 border px-2 py-0.5 rounded">
                {ticket.id}
              </span>

              <Badge status={ticket.status} />
              <PriorityDot priority={ticket.priority} />
            </div>

            <h2 className="text-lg font-semibold text-slate-800 truncate">
              {ticket.title}
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              📍 {ticket.resourceLocation}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* MAIN */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Category */}
            <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
              {ticket.category}
            </span>

            {/* Description */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">
                Description
              </p>
              <p className="text-sm text-slate-700">{ticket.description}</p>
            </div>

            {/* Images */}
            {ticket.images.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">
                  Evidence
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {ticket.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="h-24 w-full object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Resolution */}
            {ticket.resolutionNote && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <p className="text-xs text-emerald-700 font-semibold mb-1">
                  Resolution
                </p>
                <p className="text-sm text-emerald-800">
                  {ticket.resolutionNote}
                </p>
              </div>
            )}

            {/* Rejection */}
            {ticket.rejectionReason && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <p className="text-xs text-red-700 font-semibold mb-1">
                  Rejected
                </p>
                <p className="text-sm text-red-700">
                  {ticket.rejectionReason}
                </p>
              </div>
            )}

            <Divider />

            {/* COMMENTS */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-3">
                Comments ({ticket.comments.length})
              </p>

              <div className="space-y-4">
                {ticket.comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar
                      initials={c.authorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    />

                    <div className="flex-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold">
                          {c.authorName}
                        </span>

                        <span className="text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {editingComment === c.id ? (
                        <>
                          <textarea
                            className="w-full border rounded px-2 py-1 text-sm"
                            value={editContent}
                            onChange={(e) =>
                              setEditContent(e.target.value)
                            }
                          />
                          <div className="flex gap-2 text-xs mt-1">
                            <button
                              onClick={() => saveEditComment(c.id)}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingComment(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-slate-600">
                            {c.content}
                          </p>

                          <div className="text-xs flex gap-2 mt-1">
                            {canEditComment(c) && (
                              <button
                                onClick={() => {
                                  setEditingComment(c.id);
                                  setEditContent(c.content);
                                }}
                              >
                                Edit
                              </button>
                            )}

                            {canDeleteComment(c) && (
                              <button
                                onClick={() => deleteComment(c.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              {ticket.status !== "CLOSED" &&
                ticket.status !== "REJECTED" && (
                  <div className="mt-4 flex gap-3">
                    <Avatar initials={CURRENT_USER.avatar} />

                    <div className="flex-1">
                      <textarea
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={comment}
                        onChange={(e) =>
                          setComment(e.target.value)
                        }
                      />

                      <button
                        onClick={addComment}
                        className="text-xs mt-1 bg-violet-600 text-white px-3 py-1 rounded"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="w-64 border-l px-4 py-5 space-y-5">
            {/* Actions */}
            {(isTech || isAdmin) &&
              ticket.status !== "CLOSED" &&
              ticket.status !== "REJECTED" && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-2">
                    Actions
                  </p>

                  {nextStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => advanceStatus(s)}
                      className="block w-full text-left text-sm mb-2"
                    >
                      → Mark as {STATUS_CONFIG[s].label}
                    </button>
                  ))}

                  {isAdmin && ticket.status === "OPEN" && (
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="text-red-500 text-sm"
                    >
                      Reject Ticket
                    </button>
                  )}
                </div>
              )}

            {/* Assign */}
            {isAdmin && (
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">
                  Assigned
                </p>

                {ticket.assignedToName ? (
                  <p className="text-sm">{ticket.assignedToName}</p>
                ) : (
                  <p className="text-xs text-slate-400">Unassigned</p>
                )}

                <button
                  onClick={() => setShowAssign(!showAssign)}
                  className="text-xs text-violet-600"
                >
                  Assign
                </button>

                {showAssign &&
                  TECHNICIANS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => assignTechnician(t)}
                      className="block text-sm"
                    >
                      {t.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* RESOLUTION MODAL */}
        {showResolution && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white p-4 rounded">
              <textarea
                value={resolutionNote}
                onChange={(e) =>
                  setResolutionNote(e.target.value)
                }
              />
              <button
                onClick={() => {
                  onUpdate({
                    ...ticket,
                    status: "RESOLVED",
                    resolutionNote,
                  });
                  setShowResolution(false);
                }}
              >
                Resolve
              </button>
            </div>
          </div>
        )}

        {/* REJECT MODAL */}
        {showRejectModal && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white p-4 rounded">
              <textarea
                value={rejectReason}
                onChange={(e) =>
                  setRejectReason(e.target.value)
                }
              />
              <button onClick={rejectTicket}>Reject</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};