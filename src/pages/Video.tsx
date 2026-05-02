import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getBaseUrl, reactVideo, getReactions, deleteComment, getVideoInfo,
  checkEvaluate, getComments, addComment, reactComment, editComment,
  getSubComments, getMySubscriptions, addViewing, unsubscribe, subscribe, getPreviewUrl
} from '../api/api';
import { useState, useEffect } from 'react';
import type { Comment } from '../model/Comment';
import type { Video } from '../model/Video';
import CommentItem from './CommentItem';
import Recommendations from './Recommendations';

export default function VideoPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const filename = params.get('filename');

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [reaction, setReaction] = useState<'LIKE' | 'DISLIKE' | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [video, setVideo] = useState<Video | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [viewSent, setViewSent] = useState(false);

  const loadVideo = async () => {
    const data = await getVideoInfo(filename!);
    setVideo(data);
  };

  const formatViews = (n?: number) => {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  };

  useEffect(() => { loadVideo(); }, [filename]);

  useEffect(() => {
    getMySubscriptions().then(subs =>
      setSubscribed(subs.some((c: any) => c.id === video?.channelId))
    );
  }, [video?.channelId]);

  useEffect(() => {
    if (!filename) return;
    getReactions(filename).then(d => { setLikes(d.likes); setDislikes(d.dislikes); });
    checkEvaluate(filename).then(d => {
      if (d.likeBelong) setReaction('LIKE');
      else if (d.dislikeBelong) setReaction('DISLIKE');
      else setReaction(null);
    });
    getComments(filename, 0, 10).then(setComments);
  }, [filename]);

  const videoUrl = `${getBaseUrl()}/noauth/file-service/file_chunk?filename=${filename}&user_id=${video?.userId}`;

  const handleSubscribe = async () => {
    if (!video?.channelId) return;
    if (subscribed) await unsubscribe(video.channelId);
    else await subscribe(video.channelId);
    await loadVideo();
    const subs = await getMySubscriptions();
    setSubscribed(subs.some((c: any) => c.id === video?.channelId));
  };

  const handleTimeUpdate = (e: any) => {
    if (!viewSent && e.target.currentTime > 5) {
      addViewing(filename!);
      setViewSent(true);
    }
  };

  const handleLike = async () => {
    if (!filename) return;
    await reactVideo(filename, 'LIKE');
    setReaction(prev => {
      if (prev === 'LIKE') { setLikes(l => l - 1); return null; }
      if (prev === 'DISLIKE') { setDislikes(d => d - 1); setLikes(l => l + 1); return 'LIKE'; }
      setLikes(l => l + 1); return 'LIKE';
    });
  };

  const handleDislike = async () => {
    if (!filename) return;
    await reactVideo(filename, 'DISLIKE');
    setReaction(prev => {
      if (prev === 'DISLIKE') { setDislikes(d => d - 1); return null; }
      if (prev === 'LIKE') { setLikes(l => l - 1); setDislikes(d => d + 1); return 'DISLIKE'; }
      setDislikes(d => d + 1); return 'DISLIKE';
    });
  };

  const handleAddComment = async () => {
    if (!filename || !commentText.trim()) return;
    await addComment(commentText, filename);
    const data = await getComments(filename, 0, 10);
    setComments(data);
    setCommentText('');
  };

  const handleCommentLike = async (commentId: number) => {
    await reactComment(commentId, 'LIKE');
    setComments(prev => updateTree(prev, commentId, c => {
      if (c.like.belong) return { ...c, like: { count: c.like.count - 1, belong: false } };
      if (c.dislike.belong) return { ...c, like: { count: c.like.count + 1, belong: true }, dislike: { count: c.dislike.count - 1, belong: false } };
      return { ...c, like: { count: c.like.count + 1, belong: true } };
    }));
  };

  const handleCommentDislike = async (commentId: number) => {
    await reactComment(commentId, 'DISLIKE');
    setComments(prev => updateTree(prev, commentId, c => {
      if (c.dislike.belong) return { ...c, dislike: { count: c.dislike.count - 1, belong: false } };
      if (c.like.belong) return { ...c, like: { count: c.like.count - 1, belong: false }, dislike: { count: c.dislike.count + 1, belong: true } };
      return { ...c, dislike: { count: c.dislike.count + 1, belong: true } };
    }));
  };

  const handleSaveEdit = async (commentId: number, content: string) => {
    await editComment(commentId, content);
    setComments(prev => updateTree(prev, commentId, c => ({ ...c, content })));
  };

  const handleDeleteComment = async (id: number) => {
    await deleteComment(id);
    setComments(prev => removeFromTree(prev, id));
  };

  const handleLoadReplies = async (commentId: number) => {
    const data = await getSubComments(commentId, 0, 10, filename!);
    setComments(prev => updateTree(prev, commentId, c => ({ ...c, replies: data })));
  };

  const handleAddReply = async (parentId: number, text: string) => {
    await addComment(text, filename!, parentId);
    const data = await getSubComments(parentId, 0, 10, filename!);
    setComments(prev => updateTree(prev, parentId, c => ({ ...c, replies: data })));
  };

  const updateTree = (list: Comment[], id: number, fn: (c: Comment) => Comment): Comment[] =>
    list.map(c => c.id === id ? fn(c) : { ...c, replies: c.replies ? updateTree(c.replies, id, fn) : undefined });

  const removeFromTree = (list: Comment[], id: number): Comment[] =>
    list.filter(c => c.id !== id).map(c => ({ ...c, replies: c.replies ? removeFromTree(c.replies, id) : undefined }));

  return (
    <>
      <style>{`
        .vp-wrap {
          min-height: 100vh; background: #0d0b14;
          font-family: 'Nunito', sans-serif;
          display: flex; gap: 28px; padding: 28px;
          max-width: 1440px; margin: 0 auto; align-items: flex-start;
        }
        .vp-main { flex: 1; min-width: 0; }

        /* Player */
        .vp-player-box {
          border-radius: 18px; overflow: hidden;
          background: #000;
          box-shadow: 0 16px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(155,89,245,0.08);
          position: relative;
        }
        .vp-player-box video {
          width: 100%; display: block;
          max-height: 70vh; background: #000;
        }

        /* Info strip */
        .vp-info { margin-top: 20px; }
        .vp-title {
          font-family: 'Outfit', sans-serif;
          font-size: 22px; font-weight: 800;
          color: #f0ecff; line-height: 1.3;
          letter-spacing: -0.4px; margin-bottom: 16px;
        }

        /* Channel row */
        .vp-channel-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          background: #13111f;
          border: 1px solid rgba(155,89,245,0.1);
          border-radius: 14px; margin-bottom: 16px;
          gap: 16px;
        }
        .vp-ch-left { display: flex; align-items: center; gap: 14px; }
        .vp-ch-avatar {
          width: 46px; height: 46px; border-radius: 50%;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800;
          color: white; flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(155,89,245,0.35);
          cursor: pointer; transition: transform 0.2s;
        }
        .vp-ch-avatar:hover { transform: scale(1.06); }
        .vp-ch-name {
          font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700;
          color: #f0ecff; cursor: pointer; transition: color 0.2s;
        }
        .vp-ch-name:hover { color: #b47cff; }
        .vp-ch-subs { font-size: 13px; color: rgba(240,236,255,0.4); margin-top: 2px; }

        .vp-sub-btn {
          padding: 9px 22px; border-radius: 100px;
          font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700;
          border: none; cursor: pointer; transition: all 0.22s ease; flex-shrink: 0;
        }
        .vp-sub-btn.subscribed {
          background: rgba(155,89,245,0.12);
          color: #b47cff;
          border: 1.5px solid rgba(155,89,245,0.25);
        }
        .vp-sub-btn.subscribed:hover { background: rgba(155,89,245,0.2); }
        .vp-sub-btn.not-subscribed {
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          color: white;
          box-shadow: 0 4px 16px rgba(155,89,245,0.4);
        }
        .vp-sub-btn.not-subscribed:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(155,89,245,0.55); }

        /* Reactions bar */
        .vp-reactions {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 24px;
        }
        .vp-react-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 100px;
          font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 700;
          border: none; cursor: pointer; transition: all 0.22s ease;
        }
        .vp-react-btn.like {
          background: rgba(155,89,245,0.1);
          color: rgba(240,236,255,0.6);
          border: 1.5px solid rgba(155,89,245,0.12);
        }
        .vp-react-btn.like.active {
          background: rgba(155,89,245,0.22);
          color: #b47cff;
          border-color: rgba(155,89,245,0.4);
          box-shadow: 0 0 20px rgba(155,89,245,0.2);
        }
        .vp-react-btn.like:hover { background: rgba(155,89,245,0.18); color: #b47cff; }

        .vp-react-btn.dislike {
          background: rgba(240,50,80,0.08);
          color: rgba(240,236,255,0.5);
          border: 1.5px solid rgba(240,50,80,0.1);
        }
        .vp-react-btn.dislike.active {
          background: rgba(240,50,80,0.18);
          color: #ff6b8a;
          border-color: rgba(240,50,80,0.35);
        }
        .vp-react-btn.dislike:hover { background: rgba(240,50,80,0.15); color: #ff6b8a; }

        .vp-views {
          margin-left: auto; font-size: 13.5px;
          color: rgba(240,236,255,0.35);
          display: flex; align-items: center; gap: 6px;
        }

        /* Comments */
        .vp-comments { margin-top: 8px; }
        .vp-comments-title {
          font-family: 'Outfit', sans-serif;
          font-size: 18px; font-weight: 700;
          color: #f0ecff; margin-bottom: 18px;
          display: flex; align-items: center; gap: 8px;
        }
        .vp-comment-input-row {
          display: flex; gap: 12px; margin-bottom: 24px;
        }
        .vp-comment-input {
          flex: 1;
          background: rgba(155,89,245,0.05);
          border: 1.5px solid rgba(155,89,245,0.12);
          border-radius: 12px; padding: 12px 16px;
          color: #f0ecff; font-family: 'Nunito', sans-serif;
          font-size: 14.5px; outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .vp-comment-input::placeholder { color: rgba(240,236,255,0.25); }
        .vp-comment-input:focus {
          border-color: rgba(155,89,245,0.45);
          background: rgba(155,89,245,0.08);
          box-shadow: 0 0 0 3px rgba(155,89,245,0.1);
        }
        .vp-comment-send {
          padding: 12px 22px; border-radius: 12px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          color: white; font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 700;
          border: none; cursor: pointer;
          box-shadow: 0 4px 16px rgba(155,89,245,0.35);
          transition: all 0.22s ease; flex-shrink: 0;
        }
        .vp-comment-send:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(155,89,245,0.5); }

        .vp-comments-list { display: flex; flex-direction: column; gap: 0; }

        /* Sidebar */
        .vp-sidebar {
          width: 360px; flex-shrink: 0;
          position: sticky; top: 90px;
          max-height: calc(100vh - 110px); overflow-y: auto;
        }
        .vp-sidebar-title {
          font-family: 'Outfit', sans-serif;
          font-size: 15px; font-weight: 700;
          color: rgba(240,236,255,0.5); margin-bottom: 16px;
          text-transform: uppercase; letter-spacing: 0.8px;
        }
      `}</style>

      <div className="vp-wrap">
        <div className="vp-main">

          {/* Player */}
          <div className="vp-player-box">
            <video
              poster={video?.video_preview ? getPreviewUrl(video.video_preview.previewId) : ''}
              controls
              preload="metadata"
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
            />
          </div>

          <div className="vp-info">
            <h1 className="vp-title">{video?.title}</h1>

            {/* Channel */}
            <div className="vp-channel-row">
              <div className="vp-ch-left">
                <div className="vp-ch-avatar" onClick={() => navigate(`/channel/${video?.channelId}`)}>
                  {video?.channelName?.charAt(0) ?? 'C'}
                </div>
                <div>
                  <div className="vp-ch-name" onClick={() => navigate(`/channel/${video?.channelId}`)}>
                    {video?.channelName}
                  </div>
                  <div className="vp-ch-subs">{video?.subscribersCount ?? 0} подписчиков</div>
                </div>
              </div>
              <button
                className={`vp-sub-btn ${subscribed ? 'subscribed' : 'not-subscribed'}`}
                onClick={handleSubscribe}
              >
                {subscribed ? '✓ Подписан' : '+ Подписаться'}
              </button>
            </div>

            {/* Reactions */}
            <div className="vp-reactions">
              <button className={`vp-react-btn like${reaction === 'LIKE' ? ' active' : ''}`} onClick={handleLike}>
                👍 {likes}
              </button>
              <button className={`vp-react-btn dislike${reaction === 'DISLIKE' ? ' active' : ''}`} onClick={handleDislike}>
                👎 {dislikes}
              </button>
              <div className="vp-views">
                👁 {formatViews(video?.countViewing)} просмотров
              </div>
            </div>

            {/* Comments */}
            <div className="vp-comments">
              <div className="vp-comments-title">
                💬 Комментарии
              </div>
              <div className="vp-comment-input-row">
                <input
                  className="vp-comment-input"
                  placeholder="Напиши что-нибудь..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                />
                <button className="vp-comment-send" onClick={handleAddComment}>
                  Отправить
                </button>
              </div>
              <div className="vp-comments-list">
                {comments.map(c => (
                  <CommentItem
                    key={c.id} comment={c} filename={filename!}
                    onLike={handleCommentLike} onDislike={handleCommentDislike}
                    onDelete={handleDeleteComment} onEdit={handleSaveEdit}
                    onReply={handleAddReply} onLoadReplies={handleLoadReplies}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="vp-sidebar">
          <div className="vp-sidebar-title">Смотреть далее</div>
          <Recommendations />
        </aside>
      </div>
    </>
  );
}
