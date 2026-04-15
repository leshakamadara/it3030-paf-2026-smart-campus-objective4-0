import { useState } from "react";
import { ticketService } from "../services/ticketService";
import type { Ticket, Comment } from "../types/ticketTypes";
import { CURRENT_USER, STATUS_META, PRIORITY_META, CATEGORIES } from "../constants/constants";
import { timeAgo, formatDate } from "../utills/helpers";
import StatusTracker from "./StatusTracker";

export default function TicketDetailView({
  ticket,
  onBack,
  onUpdate,
  onDelete,
}: {
  ticket: Ticket;
  onBack: () => void;
  onUpdate: (t: Ticket) => void;
  onDelete?: (id: number) => void;
}) {
  
  const [comment, setComment] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const sm = STATUS_META[ticket.status];
  const pm = PRIORITY_META[ticket.priority];
  const cat = CATEGORIES.find((c) => c.value === ticket.category);

  const addComment = () => {
    if (!comment.trim()) return;
    const c: Comment = {
      id: `c-${Date.now()}`,
      authorId: CURRENT_USER.id,
      authorName: CURRENT_USER.name,
      authorRole: "USER",
      content: comment.trim(),
      createdAt: new Date().toISOString(),
    };
    onUpdate({ ...ticket, comments: [...ticket.comments, c] });
    setComment("");
  };

  const saveEdit = (id: string) => {
    onUpdate({
      ...ticket,
      comments: ticket.comments.map((c) =>
        c.id === id ? { ...c, content: editText, updatedAt: new Date().toISOString() } : c
      ),
    });
    setEditId(null);
  };

  const deleteComment = (id: string) => {
    onUpdate({ ...ticket, comments: ticket.comments.filter((c) => c.id !== id) });
  };

  // Edit form state (users can update ticket fields only when OPEN)
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(ticket.title);
  const [localDescription, setLocalDescription] = useState(ticket.description);
  const [localCategory, setLocalCategory] = useState(ticket.category);
  const [localPriority, setLocalPriority] = useState(ticket.priority);
  const [localResourceLocation, setLocalResourceLocation] = useState(ticket.resourceLocation);
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const resetLocalFields = () => {
    setLocalTitle(ticket.title);
    setLocalDescription(ticket.description);
    setLocalCategory(ticket.category);
    setLocalPriority(ticket.priority);
    setLocalResourceLocation(ticket.resourceLocation);
    setLocalImageFile(null);
  };

  const handleSave = async () => {
    const backendId = ticket.backendId ?? parseInt(ticket.id.replace(/^TKT-/, ""), 10);
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", localTitle);
      formData.append("description", localDescription);
      formData.append("priority", localPriority);
      formData.append("category", localCategory);
      formData.append("resourceLocation", localResourceLocation);
      if (localImageFile) formData.append("imageFile", localImageFile);

      // Send update and then fetch ticket with attachments to get canonical attachments list
      await ticketService.update(backendId, formData as any);
      const full = await ticketService.getWithAttachments(backendId);
      onUpdate({ ...ticket, ...mapResponseToTicket(full) });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update ticket:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (attachmentId: number) => {
    const backendId = ticket.backendId ?? parseInt(ticket.id.replace(/^TKT-/, ""), 10);
    try {
      await ticketService.deleteAttachment(attachmentId);
      const full = await ticketService.getWithAttachments(backendId);
      onUpdate({ ...ticket, ...mapResponseToTicket(full) });
    } catch (err) {
      console.error("Failed to delete image:", err);
    }
  };

  const handleCancelEdit = () => {
    resetLocalFields();
    setIsEditing(false);
  };

  const mapResponseToTicket = (resp: any): Partial<Ticket> => {
    return {
      title: resp.title,
      description: resp.description,
      category: resp.category,
      priority: resp.priority,
      resourceLocation: resp.resourceLocation,
      images: resp.attachments ? resp.attachments.map((a: any) => a.cloudinarySecureUrl || a.cloudinaryUrl || a.linkUrl).filter((u: any) => u) : ticket.images,
      attachments: resp.attachments ? resp.attachments.map((a: any) => ({ id: a.id, cloudinaryUrl: a.cloudinaryUrl, cloudinarySecureUrl: a.cloudinarySecureUrl })) : ticket.attachments,
      updatedAt: resp.updatedAt || new Date().toISOString(),
    };
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-5 transition-colors">
        ← Back to my tickets
      </button>

      {/* Ticket Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              {ticket.id}
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${sm.color} ${sm.bg} ${sm.border}`}>
              {sm.icon} {sm.label}
            </span>
          </div>
          <span className={`flex items-center gap-1 text-xs font-bold ${pm.color}`}>
            <span className={`w-2 h-2 rounded-full ${pm.dot}`} />
            {pm.label}
          </span>
        </div>

        <h1 className="text-xl font-bold text-slate-800 mb-1">{ticket.title}</h1>
        <p className="text-sm text-slate-400 mb-4">
          <span className="mr-1">{cat?.icon}</span>{ticket.resourceLocation}
        </p>

        {/* Status tracker */}
        <div className="bg-slate-50 rounded-xl p-4 mb-5">
          <StatusTracker status={ticket.status} />
        </div>

        {/* Assigned technician */}
        {ticket.assignedToName && (
          <div className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl border border-violet-100 mb-4">
            <div className="w-8 h-8 rounded-full bg-violet-200 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">
              {ticket.assignedToName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="text-xs text-violet-500 font-medium">Assigned Technician</p>
              <p className="text-sm font-semibold text-violet-800">{ticket.assignedToName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDelete && onDelete(ticket.backendId ?? parseInt(ticket.id.replace(/^TKT-/, ""), 10))}
                className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete Ticket
              </button>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</p>
          <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
        </div>

        {/* Resolution note */}
        {ticket.resolutionNote && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">✓ Resolution</p>
            <p className="text-sm text-emerald-800 leading-relaxed">{ticket.resolutionNote}</p>
          </div>
        )}

        {/* Rejection */}
        {ticket.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">✗ Rejected</p>
            <p className="text-sm text-red-700">{ticket.rejectionReason}</p>
          </div>
        )}

        {/* Images */}
        {(ticket.attachments && ticket.attachments.length > 0) || (ticket.images && ticket.images.length > 0) ? (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Evidence ({(ticket.attachments && ticket.attachments.length) || ticket.images.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ticket.attachments && ticket.attachments.length > 0
                ? ticket.attachments.map((a) => (
                    <div key={a.id} className="relative">
                      <img src={a.cloudinarySecureUrl || a.cloudinaryUrl} alt="" className="w-full h-24 object-cover rounded-xl border border-slate-200" />

                    </div>
                  ))
                : ticket.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                  ))}
            </div>
          </div>
        ) : null}

        {/* Meta footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-5 pt-4 border-t border-slate-100">
          <span>Submitted {formatDate(ticket.createdAt)}</span>
          <span>Updated {timeAgo(ticket.updatedAt)}</span>
        </div>
        {ticket.status === "OPEN" && (
          <div className="mt-5">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                 Edit Ticket
              </button>
            ) : (
              <div className="w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 border-2 border-blue-300 rounded-2xl p-6 space-y-5 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">✏️ EDIT TICKET</span>
                  <span className="text-xs text-blue-600 font-semibold">Make your changes below</span>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">📝 Ticket Title</label>
                  <input 
                    className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" 
                    value={localTitle} 
                    onChange={(e) => setLocalTitle(e.target.value)}
                    placeholder="Enter ticket title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">📋 Description</label>
                  <textarea 
                    className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none" 
                    rows={4} 
                    value={localDescription} 
                    onChange={(e) => setLocalDescription(e.target.value)}
                    placeholder="Describe the issue in detail"
                  />
                </div>

                {/* Category and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">🏷️ Category</label>
                    <select 
                      value={localCategory} 
                      onChange={(e) => setLocalCategory(e.target.value)} 
                      className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium"
                    >
                      {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.value}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">⚡ Priority</label>
                    <select 
                      value={localPriority} 
                      onChange={(e) => setLocalPriority(e.target.value as any)} 
                      className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium"
                    >
                      {Object.keys(PRIORITY_META).map((k) => (<option key={k} value={k}>{k}</option>))}
                    </select>
                  </div>
                </div>

                {/* Resource Location */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">📍 Resource Location</label>
                  <input 
                    className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" 
                    value={localResourceLocation} 
                    onChange={(e) => setLocalResourceLocation(e.target.value)}
                    placeholder="e.g., Building A, Room 301"
                  />
                </div>

                {/* File Upload */}

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Evidence ({(ticket.attachments && ticket.attachments.length) || ticket.images.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                  {ticket.attachments && ticket.attachments.length > 0
                 ? ticket.attachments.map((a) => (
                    <div key={a.id} className="relative">
                      <img src={a.cloudinarySecureUrl || a.cloudinaryUrl} alt="" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                      {ticket.status === "OPEN" && isEditing && (
                        <button
                          onClick={() => handleDeleteImage(a.id)}
                          className="absolute top-1 right-1 w-7 h-7 bg-red-50 text-red-600 rounded-md flex items-center justify-center hover:bg-red-100"
                          title="Delete image"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  ))
                : ticket.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
                  ))}
            </div>
          </div>

                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">🖼️ Add Evidence Image</label>
                  {(ticket.attachments && ticket.attachments.length >= 3) || (ticket.images && ticket.images.length >= 3) ? (
                    <p className="text-sm text-red-600 font-semibold">You can only have up to 3 images. Please remove existing images to upload new ones.</p>
                  ) : (
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        if (file && file.size > 10 * 1024 * 1024) { // 10MB limit
                          alert("Image size cannot exceed 10MB.");
                          setLocalImageFile(null); // Clear the selected file
                          e.target.value = ''; // Clear the input visually
                        } else {
                          setLocalImageFile(file);
                        }
                      }}
                        className="w-full border-2 border-dashed border-blue-300 rounded-xl px-4 py-4 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm cursor-pointer hover:border-blue-500"
                      />
                    </div>
                  )}
                  {localImageFile && <p className="text-xs text-green-600 mt-2 font-semibold">✓ {localImageFile.name}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t-2 border-blue-200">
                  <button 
                    disabled={saving} 
                    onClick={handleSave} 
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-bold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg uppercase tracking-wider"
                  >
                    {saving ? '⏳ Saving...' : '✅ Save Changes'}
                  </button>
                  <button 
                    onClick={handleCancelEdit} 
                    className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-xl text-sm font-bold hover:bg-gray-400 transition-all shadow-md hover:shadow-lg uppercase tracking-wider"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-sm font-bold text-slate-700 mb-5">
          Updates & Comments
          {ticket.comments.length > 0 && (
            <span className="ml-2 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-semibold">
              {ticket.comments.length}
            </span>
          )}
        </h2>

        {ticket.comments.length === 0 && (
          <div className="text-center py-8 text-slate-300">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">No updates yet. A technician will respond here.</p>
          </div>
        )}

        <div className="space-y-5 mb-6">
          {ticket.comments.map((c) => {
            const isOwn = c.authorId === CURRENT_USER.id;
            const isTech = c.authorRole === "TECHNICIAN" || c.authorRole === "ADMIN";
            const initials = c.authorName.split(" ").map((n) => n[0]).join("").slice(0, 2);

            return (
              <div key={c.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                  isTech ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"
                }`}>
                  {initials}
                </div>
                <div className={`flex-1 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs font-semibold text-slate-700">{c.authorName}</span>
                    {isTech && (
                      <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                        {c.authorRole}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">{timeAgo(c.createdAt)}{c.updatedAt ? " · edited" : ""}</span>
                  </div>

                  {editId === c.id ? (
                    <div className="w-full">
                      <textarea
                        rows={2}
                        className="w-full border border-violet-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2 mt-1.5">
                        <button onClick={() => saveEdit(c.id)} className="text-xs text-violet-600 font-semibold hover:underline">Save</button>
                        <button onClick={() => setEditId(null)} className="text-xs text-slate-400 hover:underline">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className={`group relative max-w-sm`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isOwn
                          ? "bg-violet-600 text-white rounded-tr-sm"
                          : isTech
                          ? "bg-slate-100 text-slate-700 border border-slate-200 rounded-tl-sm"
                          : "bg-slate-100 text-slate-700 rounded-tl-sm"
                      }`}>
                        {c.content}
                      </div>
                      {isOwn && (
                        <div className={`flex gap-2 mt-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity`}>
                          <button
                            onClick={() => { setEditId(c.id); setEditText(c.content); }}
                            className="text-[10px] text-slate-400 hover:text-violet-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button onClick={() => deleteComment(c.id)} className="text-[10px] text-slate-400 hover:text-red-500 transition-colors">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comment input */}
        {ticket.status !== "CLOSED" && ticket.status !== "REJECTED" && (
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center shrink-0">
              {CURRENT_USER.avatar}
            </div>
            <div className="flex-1">
              <textarea
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none placeholder:text-slate-300"
                placeholder="Add a comment or ask a question…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addComment(); }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-slate-300">⌘ + Enter to send</span>
                <button
                  onClick={addComment}
                  disabled={!comment.trim()}
                  className="px-4 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}