import { useState } from 'react';
import { timeAgo } from '../utills/ticket_helpers';

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
    onEdit,
    onDelete,
    isEditing,
    editText,
    setEditText,
    saveEdit,
  } = props;

  const [hovered, setHovered] = useState(false);

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
    <div
      className={`flex items-start gap-3 ${isTech ? 'justify-start' : 'justify-end'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar — for tech on left, for user on right */}
      {isTech && (
        <div
          className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
            isTech ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-800'
          }`}
        >
          {computedInitials}
        </div>
      )}

      <div className={`max-w-[75%] flex flex-col ${isTech ? 'items-start' : 'items-end'}`}>
        {/* Author name row */}
        <div className={`flex items-center gap-2 mb-1 ${isTech ? 'flex-row' : 'flex-row-reverse'}`}>
          <span className="text-[13px] font-semibold text-slate-800">
            {isOwn ? 'You' : computedAuthorName}
          </span>
          {isTech && authorRole && (
            <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
              {authorRole}
            </span>
          )}
        </div>

        {/* Bubble or edit form */}
        {isEditing ? (
          <div className="w-full">
            <textarea
              rows={2}
              className="w-full border border-violet-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none text-slate-800"
              value={editText}
              onChange={(e) => setEditText && setEditText(e.target.value)}
            />
            <div className="flex gap-2 mt-1.5 justify-end">
              <button
                onClick={() => saveEdit && saveEdit(id)}
                className="text-xs text-violet-600 font-semibold hover:underline"
              >
                Save
              </button>
              <button
                onClick={() => setEditText && setEditText('')}
                className="text-xs text-slate-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div
              className={`p-3 text-sm leading-relaxed ${
                isTech
                  ? 'bg-violet-100 text-violet-900 rounded-tr-2xl rounded-tl-sm rounded-br-2xl rounded-bl-2xl'
                  : 'bg-slate-100 text-slate-900 rounded-tl-2xl rounded-tr-sm rounded-br-2xl rounded-bl-2xl'
              }`}
            >
              <div className="break-words">{content}</div>
              <div
                className={`text-[10px] mt-1.5 ${
                  isTech ? 'text-violet-600' : 'text-slate-500'
                }`}
              >
                {createdAt ? timeAgo(createdAt) : ''}
                {updatedAt ? ' · edited' : ''}
              </div>
            </div>

            {/* Edit / Delete actions — shown on hover */}
            {hovered && !isTech && (onEdit || onDelete) && (
              <div
                className={`flex gap-3 mt-1 ${isTech ? 'justify-end' : 'justify-start'}`}
              >
                {onEdit && (
                  <button
                    onClick={() => onEdit(id)}
                    className="text-[11px] text-slate-500 hover:text-violet-600 font-medium transition-colors"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(id)}
                    className="text-[11px] text-slate-500 hover:text-red-600 font-medium transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Avatar — for user on right */}
      {!isTech && (
        <div
          className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 bg-sky-100 text-sky-800`}
        >
          {computedInitials}
        </div>
      )}
    </div>
  );
}