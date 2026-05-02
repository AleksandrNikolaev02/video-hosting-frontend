import { useState } from 'react';
import type { Comment } from '../model/Comment';

interface Props {
  comment: Comment;
  filename: string;
  onLike: (id: number) => void;
  onDislike: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, content: string) => void;
  onReply: (parentId: number, text: string) => void;
  onLoadReplies: (id: number) => void;
  depth?: number;
}

export default function CommentItem({
  comment, filename, onLike, onDislike, onDelete, onEdit, onReply, onLoadReplies, depth = 0
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);

  const handleEdit = () => { onEdit(comment.id, editText); setEditing(false); };
  const handleReply = () => { if (!replyText.trim()) return; onReply(comment.id, replyText); setReplyText(''); setReplying(false); };
  const handleToggleReplies = () => {
    if (!showReplies && !comment.replies) onLoadReplies(comment.id);
    setShowReplies(p => !p);
  };

  return (
    <>
      <style>{`
        .ci-wrap {
          padding: 16px 0;
          border-bottom: 1px solid rgba(155,89,245,0.07);
          animation: fadeUp 0.3s ease;
        }
        .ci-wrap:last-child { border-bottom: none; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .ci-row { display: flex; gap: 12px; align-items: flex-start; }
        .ci-avatar {
          width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 800;
          color: white;
        }
        .ci-avatar.small { width: 28px; height: 28px; font-size: 12px; }
        .ci-body { flex: 1; min-width: 0; }
        .ci-author {
          font-family: 'Outfit', sans-serif; font-size: 13.5px; font-weight: 700;
          color: rgba(155,89,245,0.85); margin-bottom: 4px;
        }
        .ci-text { font-size: 14px; color: rgba(240,236,255,0.8); line-height: 1.5; word-break: break-word; }

        .ci-edit-input {
          width: 100%;
          background: rgba(155,89,245,0.06);
          border: 1.5px solid rgba(155,89,245,0.25);
          border-radius: 10px; padding: 10px 14px;
          color: #f0ecff; font-family: 'Nunito', sans-serif;
          font-size: 14px; outline: none; resize: vertical; min-height: 60px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ci-edit-input:focus {
          border-color: rgba(155,89,245,0.5);
          box-shadow: 0 0 0 3px rgba(155,89,245,0.1);
        }

        .ci-actions { display: flex; align-items: center; gap: 4px; margin-top: 10px; flex-wrap: wrap; }
        .ci-action-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 100px;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          background: none; border: none; cursor: pointer;
          color: rgba(240,236,255,0.45); transition: all 0.18s ease;
        }
        .ci-action-btn:hover { background: rgba(155,89,245,0.1); color: rgba(240,236,255,0.8); }
        .ci-action-btn.active-like { color: #b47cff; background: rgba(155,89,245,0.12); }
        .ci-action-btn.active-dislike { color: #ff6b8a; background: rgba(240,50,80,0.1); }
        .ci-action-btn.danger:hover { background: rgba(240,50,80,0.1); color: #ff6b8a; }
        .ci-action-btn.success:hover { background: rgba(52,211,153,0.1); color: #34d399; }

        .ci-reply-box { margin-top: 12px; display: flex; gap: 8px; }
        .ci-reply-input {
          flex: 1; background: rgba(155,89,245,0.05);
          border: 1.5px solid rgba(155,89,245,0.15);
          border-radius: 10px; padding: 10px 14px;
          color: #f0ecff; font-family: 'Nunito', sans-serif;
          font-size: 14px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ci-reply-input::placeholder { color: rgba(240,236,255,0.25); }
        .ci-reply-input:focus {
          border-color: rgba(155,89,245,0.4);
          box-shadow: 0 0 0 3px rgba(155,89,245,0.08);
        }
        .ci-reply-send {
          padding: 10px 16px; border-radius: 10px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          color: white; font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 700; border: none; cursor: pointer;
          box-shadow: 0 2px 12px rgba(155,89,245,0.3);
          transition: all 0.2s ease; flex-shrink: 0;
        }
        .ci-reply-send:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(155,89,245,0.45); }

        .ci-edit-btns { display: flex; gap: 8px; margin-top: 8px; }
        .ci-edit-save {
          padding: 8px 18px; border-radius: 8px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          color: white; font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 700; border: none; cursor: pointer;
          box-shadow: 0 2px 10px rgba(155,89,245,0.3);
          transition: all 0.2s;
        }
        .ci-edit-save:hover { transform: translateY(-1px); }
        .ci-edit-cancel {
          padding: 8px 18px; border-radius: 8px;
          background: rgba(255,255,255,0.05); color: rgba(240,236,255,0.5);
          border: 1.5px solid rgba(255,255,255,0.08);
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .ci-edit-cancel:hover { background: rgba(255,255,255,0.09); color: rgba(240,236,255,0.8); }

        .ci-replies { margin-top: 12px; padding-left: 20px; border-left: 2px solid rgba(155,89,245,0.12); }
        .ci-show-replies {
          background: none; border: none; cursor: pointer;
          color: #9b59f5; font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 700;
          padding: 6px 0; margin-top: 8px;
          display: flex; align-items: center; gap: 6px;
          transition: color 0.2s;
        }
        .ci-show-replies:hover { color: #b47cff; }
      `}</style>

      <div className="ci-wrap">
        <div className="ci-row">
          <div className={`ci-avatar${depth > 0 ? ' small' : ''}`}>
            {comment.authorName?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="ci-body">
            <div className="ci-author">{comment.authorName ?? 'Аноним'}</div>

            {editing ? (
              <>
                <textarea
                  className="ci-edit-input"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                />
                <div className="ci-edit-btns">
                  <button className="ci-edit-save" onClick={handleEdit}>Сохранить</button>
                  <button className="ci-edit-cancel" onClick={() => setEditing(false)}>Отмена</button>
                </div>
              </>
            ) : (
              <div className="ci-text">{comment.content}</div>
            )}

            <div className="ci-actions">
              <button
                className={`ci-action-btn${comment.like?.belong ? ' active-like' : ''}`}
                onClick={() => onLike(comment.id)}
              >
                👍 {comment.like?.count ?? 0}
              </button>
              <button
                className={`ci-action-btn${comment.dislike?.belong ? ' active-dislike' : ''}`}
                onClick={() => onDislike(comment.id)}
              >
                👎 {comment.dislike?.count ?? 0}
              </button>
              {depth === 0 && (
                <button className="ci-action-btn" onClick={() => setReplying(p => !p)}>
                  💬 Ответить
                </button>
              )}
              {comment.belong && (
                <>
                  <button className="ci-action-btn success" onClick={() => { setEditing(true); setEditText(comment.content); }}>
                    ✏️ Изменить
                  </button>
                  <button className="ci-action-btn danger" onClick={() => onDelete(comment.id)}>
                    🗑 Удалить
                  </button>
                </>
              )}
            </div>

            {replying && (
              <div className="ci-reply-box">
                <input
                  className="ci-reply-input"
                  placeholder="Напишите ответ..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReply()}
                />
                <button className="ci-reply-send" onClick={handleReply}>↩ Ответить</button>
              </div>
            )}

            {depth === 0 && (
              <button className="ci-show-replies" onClick={handleToggleReplies}>
                {showReplies ? '▲ Скрыть ответы' : '▼ Ответы'}
              </button>
            )}

            {showReplies && comment.replies && (
              <div className="ci-replies">
                {comment.replies.map(r => (
                  <CommentItem
                    key={r.id} comment={r} filename={filename}
                    onLike={onLike} onDislike={onDislike}
                    onDelete={onDelete} onEdit={onEdit}
                    onReply={onReply} onLoadReplies={onLoadReplies}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
