import { useState } from "react";

import type { TicketResponseDTO, CommentDTO } from "../types/ticketTypes";
import { ticketService } from "../services/ticketService";
import {
  
  STATUS_FLOW,
  STATUS_META,
} from "../constants/constants";

import { CURRENT_USER } from "../constants/ticketConstants";


import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { PriorityDot } from "./PriorityDot";
import { Divider } from "./Divider";

export const TicketDetail = ({
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

  const [showResolution, setShowResolution] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");

  const isAdmin = CURRENT_USER.role === "ADMIN";
  const isTech =
    CURRENT_USER.role === "TECHNICIAN" || CURRENT_USER.role === "ADMIN";

  const nextStatuses = STATUS_FLOW[ticket.status];

  // Comments
  const addComment = async () => {
    if (!comment.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await ticketService.addComment(ticket.id, comment);
      // Refresh ticket data
      const updatedTicket = await ticketService.getWithAttachments(ticket.id);
      onUpdate(updatedTicket);
      setComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      setError("Failed to add comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Workflow Actions ───────────────────────────────────────
  const advanceStatus = async (status: TicketResponseDTO["status"]) => {
    try {
      setLoading(true);
      setError(null);
      await ticketService.updateStatus(ticket.id, status);
      // Refresh ticket data
      const updatedTicket = await ticketService.getWithAttachments(ticket.id);
      onUpdate(updatedTicket);
      setShowResolution(false);
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
      await ticketService.updateStatus(ticket.id, "REJECTED");
      // Refresh ticket data
      const updatedTicket = await ticketService.getWithAttachments(ticket.id);
      onUpdate(updatedTicket);
      setShowRejectModal(false);
    } catch (err) {
      console.error("Failed to reject ticket:", err);
      setError("Failed to reject ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

            {ticket.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                📝 {ticket.description}
              </p>
            )}
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
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Category */}
            {ticket.category && (
              <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                {ticket.category}
              </span>
            )}

            {/* Description */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">
                Description
              </p>
              <p className="text-sm text-slate-700">{ticket.description}</p>
            </div>

            {/* Attachments / Evidence — always visible */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Attachments</p>
              {ticket.attachments && ticket.attachments.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {ticket.attachments.map((attachment) => (
                    <div key={attachment.id} className="border rounded-lg p-3">
                      {attachment.cloudinaryUrl && (
                        <img
                          src={attachment.cloudinaryUrl}
                          alt="Attachment"
                          className="h-24 w-full object-cover rounded border mb-2"
                        />
                      )}
                      <p className="text-xs text-slate-400">
                        {new Date(attachment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400">No attachments uploaded for this ticket.</div>
              )}
            </div>

            <Divider />

            {/* COMMENTS */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-3">
                Comments ({ticket.comments?.length || 0})
              </p>

              <div className="space-y-4">
                {ticket.comments?.map((c: CommentDTO) => {
                  const initials = c.createdBy
                    .split("@")[0]
                    .split(".")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <div key={c.id} className="flex gap-3">
                      <Avatar initials={initials} />

                      <div className="flex-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold">
                            {c.createdBy}
                          </span>

                          <span className="text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm text-slate-700 mt-1">
                          {c.comment}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Add Comment */}
                <div className="flex gap-3 pt-4 border-t">
                  <Avatar initials={CURRENT_USER.avatar} />

                  <div className="flex-1">
                    <textarea
                      className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                      rows={3}
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={loading}
                    />

                    <div className="flex justify-end mt-2">
                      <button
                        onClick={addComment}
                        disabled={!comment.trim() || loading}
                        className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
                      disabled={loading}
                      className="block w-full text-left text-sm mb-2 hover:text-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      → Mark as {STATUS_META[s].label}
                    </button>
                  ))}

                  {isAdmin && ticket.status === "OPEN" && (
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={loading}
                      className="text-red-500 text-sm hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject Ticket
                    </button>
                  )}
                </div>
              )}

            {/* Ticket Info */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">
                Ticket Info
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-500">ID:</span> #{ticket.id}
                </div>
                {ticket.createdAt && (
                  <div>
                    <span className="text-slate-500">Created:</span>{" "}
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Priority:</span>{" "}
                  <span className={`font-medium ${
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
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Resolve Ticket</h3>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
                rows={4}
                placeholder="Add resolution notes..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowResolution(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => advanceStatus("RESOLVED")}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resolving..." : "Resolve"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REJECT MODAL */}
        {showRejectModal && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Reject Ticket</h3>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
                rows={4}
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={rejectTicket}
                  disabled={!rejectReason.trim() || loading}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};