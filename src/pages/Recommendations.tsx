import { useEffect, useState } from 'react';
import { getRecommendations } from '../api/api';
import { Link } from 'react-router-dom';
import type { Video } from '../model/Video';

export default function Recommendations() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    getRecommendations().then(setVideos);
  }, []);

  return (
    <div className="flex flex-col gap-4">

      {videos.map((v) => (
        <Link
          key={v.filename}
          to={`/video?filename=${v.filename}&user_id=${v.userId}`}
          className="flex gap-3 hover:bg-gray-800 p-2 rounded-lg transition"
        >
          {/* превью */}
          <img
            src={v.video_preview}
            className="w-40 h-24 object-cover rounded"
          />

          {/* текст */}
          <div className="flex flex-col justify-between">
            <div className="text-sm font-semibold text-white">
              {v.title}
            </div>

            <div className="text-xs text-gray-400">
              User {v.userId}
            </div>
          </div>
        </Link>
      ))}

    </div>
  );
}