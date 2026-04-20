import { useState, useEffect, useRef } from "react";

import type { TicketResponseDTO, CommentDTO } from "../../types/ticketTypes";
import { ticketService } from "../../services/ticketService";
import {
  
  STATUS_FLOW,
  STATUS_META,
} from "../../../constants/Ticket_constants/constants";

import { CURRENT_USER } from "../../../constants/Ticket_constants/ticketConstants";


import { Avatar } from "../../components/Avatar";
import { Badge } from "../../components/Badge";
import { PriorityDot } from "../../components/PriorityDot";
import { Divider } from "../../components/Divider";

import CommentBubble from "../../components/CommentBubble";

export const AdminTicketDetailView = ({
  ticket,
  onClose,
  onUpdate,
}: {
  ticket: TicketResponseDTO;
  onClose: () => void;
  onUpdate: (updated: TicketResponseDTO) => void;
}) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ open: boolean; commentId?: number }>(
    { open: false }
  );

  const [showResolution, setShowResolution] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isAdmin = (currentUser?.role || CURRENT_USER.role) === "ADMIN";
  const isTech = (currentUser?.role || CURRENT_USER.role) === "TECHNICIAN" || (currentUser?.role || CURRENT_USER.role) === "ADMIN";

  const nextStatuses = STATUS_FLOW[ticket.status];

  const commentsContainerRef = useRef<HTMLDivElement | null>(null);

  // Comments (BACKEND PERSISTED)
  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      setLoading(true);
      setError(null);
      await ticketService.addComment(ticket.id, comment);
      const updatedTicket = await ticketService.getWithAttachments(ticket.id);
      onUpdate(updatedTicket);
      setComment("");
    } catch (err) {
      setError("Failed to add comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const editComment = async (id: number, newText: string) => {
    if (!newText.trim()) return;
    try {
      setLoading(true);
      setError(null);
      await ticketService.editComment(ticket.id, id, newText); // You must implement this in ticketService and backend
      const updatedTicket = await ticketService.getWithAttachments(ticket.id);
      onUpdate(updatedTicket);
    } catch (err) {
      setError("Failed to edit comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await ticketService.deleteComment(ticket.id, id);
      const updatedTicket = await ticketService.getWithAttachments(ticket.id);
      onUpdate(updatedTicket);
    } catch (err) {
      setError("Failed to delete comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // fetch current user
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await ticketService.getCurrentUser();
        if (mounted) setCurrentUser(u);
      } catch (err) {
        // fallback to constant CURRENT_USER
        if (mounted) setCurrentUser(CURRENT_USER);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // auto-scroll comments container to bottom when comments change
  useEffect(() => {
    const el = commentsContainerRef.current;
    if (!el) return;
    // scroll to bottom
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [ticket.comments]);

  //  Workflow Actions 
  const advanceStatus = async (status: TicketResponseDTO["status"]) => {
    // If transitioning to RESOLVED without notes, show modal first
    if (status === "RESOLVED" && !showResolution) {
      setShowResolution(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const notes = status === "RESOLVED" ? resolutionNote : undefined;
      await ticketService.updateStatus(ticket.id, status, notes);
      // Refresh ticket data
      const updatedTicket = await ticketService.getWithAttachments(ticket.id);
      onUpdate(updatedTicket);
      setShowResolution(false);
      setResolutionNote("");
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Failed to update ticket status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const rejectTicket = async () => {
    if (!rejectReason.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await ticketService.updateStatus(ticket.id, "REJECTED", rejectReason);
      // Refresh ticket data
      const updatedTicket = await ticketService.getWithAttachments(ticket.id);
      onUpdate(updatedTicket);
      setShowRejectModal(false);
      setRejectReason("");
    } catch (err) {
      console.error("Failed to reject ticket:", err);
      setError("Failed to reject ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Allow Escape key to close modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ minHeight: '100vh', minWidth: '100vw' }}
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ minHeight: 300, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                #{ticket.id}
              </span>

              <Badge status={ticket.status} />
              <PriorityDot priority={ticket.priority} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 leading-tight pr-8">
              {ticket.title}
            </h2>

            {ticket.description && (
              <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                {ticket.description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* MAIN */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Category */}
            {ticket.category && (
              <div className="pb-4">
                <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-medium">
                  {ticket.category}
                </span>
              </div>
            )}

            {/* Description */}
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
                Description
              </p>
              <div className="text-base text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p>{ticket.description}</p>
              </div>
            </div>

            {/* Ticket Reasons Table */}
            {(ticket.resolutionNote || ticket.rejectionReason) && (
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
                  Ticket Resolution Details
                </p>
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Reason/Details</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {ticket.resolutionNote && (
                        <tr className="hover:bg-slate-25">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-2 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                              Resolution
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                            <div className="line-clamp-3">{ticket.resolutionNote}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                              ✓ Completed
                            </span>
                          </td>
                        </tr>
                      )}
                      {ticket.rejectionReason && (
                        <tr className="hover:bg-slate-25">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              Rejection
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                            <div className="line-clamp-3">{ticket.rejectionReason}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200">
                              ✗ Rejected
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Attachments / Evidence — always visible */}
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Attachments</p>
              {ticket.attachments && ticket.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ticket.attachments.map((attachment) => (
                    <div key={attachment.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 shadow-sm">
                      {attachment.cloudinaryUrl && (
                        <img
                          src={attachment.cloudinaryUrl}
                          alt="Attachment"
                          onClick={() => setSelectedImage(attachment.cloudinaryUrl!)}
                          className="h-40 w-full object-cover rounded-xl border border-slate-200 mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      )}
                      <p className="text-xs text-slate-500 font-medium text-center">
                        Uploaded: {new Date(attachment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-base text-slate-500 italic p-4 border border-slate-200 rounded-2xl bg-slate-50 text-center">No attachments uploaded for this ticket.</div>
              )}
            </div>

            <Divider />

            {/* COMMENTS */}
            <div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">
                Comments ({ticket.comments?.length || 0})
              </p>

              <div className="mb-4">
                <div ref={commentsContainerRef} className="bg-white border border-slate-200 rounded-2xl p-4 max-h-80 overflow-y-auto space-y-6">
                {(ticket.comments || []).slice().sort((a: CommentDTO, b: CommentDTO) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((c: CommentDTO) => {
                  const user = currentUser || CURRENT_USER;
                  const authorLabel = c.createdByName ?? c.createdBy ?? "Unknown User";
                  const initials = authorLabel
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "??";
                  const userIdentifier = (user?.username || user?.email || user?.id || null);
                  const isOwn = !!(c.createdBy && userIdentifier && (c.createdBy === userIdentifier));

                  const isStaffComment = c.createdByRole === "ADMIN" || c.createdByRole === "TECHNICIAN";

                  return (
                    <CommentBubble
                      key={c.id}
                      id={String(c.id)}
                      authorName={authorLabel}
                      content={c.comment}
                      createdAt={c.createdAt}
                      updatedAt={c.updatedAt}
                      initials={initials}
                      isOwn={isOwn}
                      isTech={!isStaffComment}
                      onEdit={async (id) => {
                        const newText = prompt("Edit comment:", c.comment);
                        if (newText !== null && newText.trim() !== "") await editComment(Number(id), newText);
                      }}
                      onDelete={async (id) => {
                        setShowDeleteConfirm({ open: true, commentId: Number(id) });
                      }}
                    />
                  );
                })}

                
                </div>
              </div>

              {/* Add Comment (outside scrollable box) */}
              <div className="flex items-start gap-4 pt-4 border-t border-slate-100">
                <Avatar initials={CURRENT_USER.avatar} />

                <div className="flex-1">
                  <textarea
                    className="w-full border border-slate-300 rounded-2xl px-4 py-3 text-sm resize-none placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all bg-white"
                    rows={4}
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={loading}
                  />

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={addComment}
                      disabled={!comment.trim() || loading}
                      className="bg-violet-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                    >
                      {loading ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="w-72 border-l border-slate-100 px-5 py-6 space-y-6 overflow-y-auto bg-slate-50">
            {/* Actions */}
            {(isTech || isAdmin) &&
              ticket.status !== "CLOSED" &&
              ticket.status !== "REJECTED" && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Actions
                  </p>

                  <div className="space-y-2">
                    {nextStatuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          if (s === "RESOLVED") {
                            setShowResolution(true);
                          } else {
                            advanceStatus(s);
                          }
                        }}
                        disabled={loading}
                        className="w-full text-left text-sm px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-violet-200 hover:text-violet-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        → Mark as {STATUS_META[s].label}
                      </button>
                    ))}

                    {isAdmin && ticket.status === "OPEN" && (
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={loading}
                        className="w-full text-left text-sm px-4 py-2 rounded-2xl bg-slate-100 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ✕ Reject Ticket
                      </button>
                    )}
                  </div>
                </div>
              )}

            {/* Ticket Info */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                Ticket Info
              </p>
              <div className="space-y-3 text-sm bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">ID</span>
                  <span className="text-slate-800 font-semibold">#{ticket.id}</span>
                </div>
                {ticket.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Created</span>
                    <span className="text-slate-800">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Priority</span>
                  <span className={`font-semibold ${
                    ticket.priority === "HIGH" ? "text-orange-600" :
                    ticket.priority === "MEDIUM" ? "text-yellow-600" :
                    "text-green-600"
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RESOLUTION MODAL */}
        {showResolution && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Resolve Ticket</h3>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all"
                rows={4}
                placeholder="Add resolution notes..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowResolution(false);
                    setResolutionNote("");
                  }}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => advanceStatus("RESOLVED")}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Resolving..." : "Resolve"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REJECT MODAL */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Reject Ticket</h3>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
                rows={4}
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={rejectTicket}
                  disabled={!rejectReason.trim() || loading}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION */}
        {showDeleteConfirm.open && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Delete Comment</h3>
              <p className="text-sm text-slate-600 mb-4">Are you sure you want to delete this comment? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm({ open: false })}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (showDeleteConfirm.commentId) await deleteComment(showDeleteConfirm.commentId);
                    setShowDeleteConfirm({ open: false });
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <div className="relative w-full max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 text-white w-10 h-10 flex items-center justify-center hover:bg-slate-900"
                aria-label="Close image preview"
              >
                ✕
              </button>
              <img
                src={selectedImage}
                alt="Attachment preview"
                className="w-full max-h-[90vh] object-contain rounded-3xl border border-slate-200 bg-white shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};