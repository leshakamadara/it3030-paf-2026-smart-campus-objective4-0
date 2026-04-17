import React from 'react';
import { timeAgo } from '../utills/helpers';

type Props = {
  id: string;
  authorName?: string | null;
  authorRole?: string | null;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  initials?: string;
  isOwn?: boolean;
  isTech?: boolean;
  isStaff?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isEditing?: boolean;
  editText?: string;
  setEditText?: (v: string) => void;
  saveEdit?: (id: string) => void;
};

export default function CommentBubble(props: Props) {
  const {
    id,
    authorName,
    authorRole,
    content,
    createdAt,
    updatedAt,
    initials,
    isOwn,
    isTech,
    isStaff,
    onEdit,
    onDelete,
    isEditing,
    editText,
    setEditText,
    saveEdit,
  } = props;

  const computedAuthorName = authorName?.trim() ? authorName : 'Unknown User';
  const computedInitials = initials?.trim()
    ? initials
    : computedAuthorName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('') || '??';

  return (
    <div className={`flex items-start gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${isTech ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
          {computedInitials}
        </div>
      )}

      <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`text-[12px] text-slate-600 mb-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          <span className="font-semibold">{computedAuthorName}</span>
          {isTech && (
            <span className="ml-2 text-[10px] bg-violet-100 text-violet-600 px-1 py-0.5 rounded uppercase">{authorRole}</span>
          )}
        </div>

        {isEditing ? (
          <div className="w-full">
            <textarea
              rows={2}
              className="w-full border border-violet-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
              value={editText}
              onChange={(e) => setEditText && setEditText(e.target.value)}
            />
            <div className="flex gap-2 mt-1.5 justify-end">
              <button onClick={() => saveEdit && saveEdit(id)} className="text-xs text-violet-600 font-semibold hover:underline">Save</button>
              <button onClick={() => setEditText && setEditText('')} className="text-xs text-slate-400 hover:underline">Cancel</button>
            </div>
          </div>
        ) : (
          <div className={`relative inline-block p-3 text-sm leading-relaxed ${isOwn ? 'bg-emerald-600 text-white rounded-tl-2xl rounded-tr-xl rounded-bl-2xl' : 'bg-slate-100 text-slate-800 rounded-tr-2xl rounded-tl-xl rounded-br-2xl'}`}>
            <div className="break-words">{content}</div>
            <div className={`text-[10px] mt-1 ${isOwn ? 'text-emerald-100' : 'text-slate-400'}`}>{createdAt ? timeAgo(createdAt) : ''}{updatedAt ? ' · edited' : ''}</div>

            {(isOwn || isStaff) && (
              <div className="absolute -bottom-6 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit && onEdit(id)} className="text-[12px] text-white/80 hover:text-white">Edit</button>
                <button onClick={() => onDelete && onDelete(id)} className="text-[12px] text-white/80 hover:text-white">Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      {isOwn && (
        <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${isTech ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
          {computedInitials}
        </div>
      )}
    </div>
  );
}
