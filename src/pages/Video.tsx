import { useSearchParams } from 'react-router-dom';
import { getBaseUrl, reactVideo, getReactions, deleteComment,
  checkEvaluate, getComments, addComment, reactComment, editComment, getSubComments } from '../api/api';
import { useState, useEffect } from 'react';
import type { Comment } from '../model/Comment';
import CommentItem from './CommentItem';
import Recommendations from './Recommendations';

export default function Video() {
  const [params] = useSearchParams();

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [reaction, setReaction] = useState<'LIKE' | 'DISLIKE' | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');

  const filename = params.get('filename');
  const user_id = params.get('user_id');

  useEffect(() => {
    if (!filename) return;

    getReactions(filename).then((data) => {
      setLikes(data.likes);
      setDislikes(data.dislikes);
    });
  }, [filename]);

  useEffect(() => {
    if (!filename) return;

    checkEvaluate(filename).then((data) => {
      if (data.likeBelong) {
        setReaction('LIKE');
      } else if (data.dislikeBelong) {
        setReaction('DISLIKE');
      } else {
        setReaction(null);
      }
    });
  }, [filename]);

  useEffect(() => {
    if (!filename) return;

    getComments(filename, 0, 10).then((data) => {
      setComments(data);
    });
  }, [filename]);

  const videoUrl = `${getBaseUrl()}/file-service/file_chunk?filename=${filename}&user_id=${user_id}`;

  const handleLike = async () => {
    if (!filename) return;

    await reactVideo(filename, 'LIKE');

    setReaction(prev => {
      if (prev === 'LIKE') {
        setLikes(likes - 1);
        return null;
      }

      if (prev === 'DISLIKE') {
        setDislikes(dislikes - 1);
        setLikes(likes + 1);
        return 'LIKE';
      }

      setLikes(likes + 1);
      return 'LIKE';
    });
  };

  const handleDislike = async () => {
    if (!filename) return;

    await reactVideo(filename, 'DISLIKE');

    setReaction(prev => {
      if (prev === 'DISLIKE') {
        setDislikes(dislikes - 1);
        return null;
      }

      if (prev === 'LIKE') {
        setLikes(likes - 1);
        setDislikes(dislikes + 1);
        return 'DISLIKE';
      }

      setDislikes(dislikes + 1);
      return 'DISLIKE';
    });
  };

  const handleAddComment = async () => {
    console.log('New text: ' + commentText);

    if (!filename || !commentText.trim()) return;

    await addComment(commentText, filename);

    const data = await getComments(filename, 0, 10);
    setComments(data);

    setCommentText('');
  };

  const handleCommentLike = async (commentId: number) => {
    await reactComment(commentId, 'LIKE');

    setComments(prev =>
      updateCommentTree(prev, commentId, (c) => {
        if (c.like.belong) {
          return {
            ...c,
            like: { count: c.like.count - 1, belong: false }
          };
        }

        if (c.dislike.belong) {
          return {
            ...c,
            like: { count: c.like.count + 1, belong: true },
            dislike: { count: c.dislike.count - 1, belong: false }
          };
        }

        return {
          ...c,
          like: { count: c.like.count + 1, belong: true }
        };
      })
    );
  };

  const handleCommentDislike = async (commentId: number) => {
    await reactComment(commentId, 'DISLIKE');

    setComments(prev =>
      updateCommentTree(prev, commentId, (c) => {

        if (c.dislike.belong) {
          return {
            ...c,
            dislike: { count: c.dislike.count - 1, belong: false }
          };
        }

        if (c.like.belong) {
          return {
            ...c,
            like: { count: c.like.count - 1, belong: false },
            dislike: { count: c.dislike.count + 1, belong: true }
          };
        }

        return {
          ...c,
          dislike: { count: c.dislike.count + 1, belong: true }
        };
      })
    );
  };

  const handleSaveEdit = async (commentId: number, content: string) => {
  await editComment(commentId, content);

  setComments(prev =>
    updateCommentTree(prev, commentId, (c) => ({
      ...c,
      content
    }))
  );
};

  const handleDeleteComment = async (id: number) => {
    await deleteComment(id);

    setComments(prev => removeFromTree(prev, id));
  };

  const handleLoadReplies = async (commentId: number) => {
    const data = await getSubComments(commentId, 0, 10, filename!);

    setComments(prev =>
      updateCommentTree(prev, commentId, (c) => ({
        ...c,
        replies: data
      }))
    );
  };

  const handleAddReply = async (parentId: number, text: string) => {
    await addComment(text, filename!, parentId);

    const data = await getSubComments(parentId, 0, 10, filename!);

    setComments(prev =>
      updateCommentTree(prev, parentId, (c) => ({
        ...c,
        replies: data
      }))
    );
  };

  const updateCommentTree = (comments: Comment[], commentId: number, updater: (c: Comment) => Comment): Comment[] => {
    return comments.map(c => {
      if (c.id === commentId) {
        return updater(c);
      }

      if ((c as any).replies) {
        return {
          ...c,
          replies: updateCommentTree((c as any).replies, commentId, updater)
        };
      }

      return c;
    });
  };

  const removeFromTree = (comments: Comment[], id: number): Comment[] => {
    return comments
      .filter(c => c.id !== id)
      .map(c => ({
        ...c,
        replies: c.replies ? removeFromTree(c.replies, id) : undefined
      }));
  };

   return (

    <div className="flex gap-6 p-6 w-full">

      {/* 🎬 ЛЕВАЯ ЧАСТЬ */}
      <div className="flex-1 min-w-0">

        <video controls className="w-full max-w-[900px]" preload='metadata' src={videoUrl} />

        <div className="mt-4 flex gap-4">
            <button
              onClick={handleLike}
              className={`px-4 py-2 rounded ${
                reaction === 'LIKE' ? 'bg-green-500' : 'bg-gray-500'
              } text-white`}
            >
              👍 {likes}
            </button>

            <button
              onClick={handleDislike}
              className={`px-4 py-2 rounded ${
                reaction === 'DISLIKE' ? 'bg-red-500' : 'bg-gray-500'
              } text-white`}
            >
              👎 {dislikes}
            </button>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Комментарии</h2>

            {/* input */}
            <div className="flex gap-2 mb-4">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="border p-2 flex-1 rounded"
                placeholder="Написать комментарий..."
              />
              <button
                onClick={handleAddComment}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Отправить
              </button>
            </div>

            {/* список */}
            <div className="flex flex-col gap-3">
              {comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  filename={filename!}
                  onLike={handleCommentLike}
                  onDislike={handleCommentDislike}
                  onDelete={handleDeleteComment}
                  onEdit={handleSaveEdit}
                  onReply={handleAddReply}
                  onLoadReplies={handleLoadReplies}
                />
              ))}
            </div>
          </div>

      </div>

      {/* 👉 ПРАВАЯ ЧАСТЬ */}
      <div className="w-[350px] flex-shrink-0 sticky top-4 h-fit">
        <Recommendations />
      </div>

    </div>
  );
}