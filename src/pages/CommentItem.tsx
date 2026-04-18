import { useState } from 'react';
import type { Comment } from '../model/Comment';

type Props = {
  comment: Comment;
  filename: string;
  onLike: (id: number) => void;
  onDislike: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, content: string) => void;
  onReply: (parentId: number, text: string) => void;
  onLoadReplies: (parentId: number) => void;
};

export default function CommentItem({
  comment,
  filename,
  onLike,
  onDislike,
  onDelete,
  onEdit,
  onReply,
  onLoadReplies
}: Props) {

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleReplies = async () => {
    if (!comment.replies && !loading) {
      setLoading(true);
      await onLoadReplies(comment.id);
      setLoading(false);
    }

    setOpen(prev => !prev);
  };

  return (
    <div className="mt-4">

      {/* 🔥 карточка комментария */}
      <div className="border border-gray-700 rounded-xl p-4 bg-gray-800 shadow hover:bg-gray-750 transition">

        {/* header */}
        <div className="text-sm text-gray-500 flex justify-between">
          <span>
            User {comment.creatorId} • {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>

        {/* ✏️ редактирование */}
        {editing ? (
          <div className="mt-2 flex gap-2">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="border p-2 flex-1 rounded"
            />

            <button
              onClick={() => {
                onEdit(comment.id, editText);
                setEditing(false);
              }}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Save
            </button>

            <button
              onClick={() => setEditing(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="mt-2 text-gray-200 text-left w-full">
            {comment.content}
          </div>
        )}

        {/* 🔥 кнопки */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">

          <button
            onClick={() => onLike(comment.id)}
            className={comment.like.belong ? 'text-green-500' : 'text-gray-500'}
          >
            👍 {comment.like.count}
          </button>

          <button
            onClick={() => onDislike(comment.id)}
            className={comment.dislike.belong ? 'text-red-500' : 'text-gray-500'}
          >
            👎 {comment.dislike.count}
          </button>

          <button
            onClick={() => {
              setReplyOpen(prev => !prev);
            }}
            className="text-gray-500"
          >
            Reply
          </button>

          <button onClick={handleToggleReplies} className="text-blue-500">
            {loading
              ? 'Загрузка...'
              : open
                ? 'Скрыть ответы'
                : 'Показать ответы'}
          </button>

          {comment.belong && (
            <>
              <button
                onClick={() => {
                  setEditing(true);
                  setEditText(comment.content);
                }}
                className="text-blue-500"
              >
                ✏️ Edit
              </button>

              <button
                onClick={() => onDelete(comment.id)}
                className="text-red-500"
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>

        {/* ✍️ форма ответа */}
        {replyOpen && (
          <div className="mt-3 flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="border p-2 flex-1 rounded"
              placeholder="Ответить..."
            />

            <button
              onClick={() => {
                if (!replyText.trim()) return;

                onReply(comment.id, replyText);
                setReplyText('');
                setReplyOpen(false);
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Send
            </button>
          </div>
        )}

      </div>

      {/* 🔥 РЕКУРСИЯ */}
      {open && comment.replies && (
        <div className="ml-8 border-l pl-4 mt-2">
          {comment.replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              filename={filename}
              onLike={onLike}
              onDislike={onDislike}
              onDelete={onDelete}
              onEdit={onEdit}
              onReply={onReply}
              onLoadReplies={onLoadReplies}
            />
          ))}
        </div>
      )}

    </div>
  );
}