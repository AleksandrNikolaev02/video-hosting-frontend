import { useEffect, useState } from 'react';
import { getRecommendations } from '../api/api';
import { Link } from 'react-router-dom';
import type { Video } from '../model/Video';

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
  getRecommendations().then((data) => {
    console.log("API RESPONSE:", data);
    setVideos(data);
  });
}, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Рекомендации</h1>

      <div className="grid grid-cols-4 gap-4">
        {videos.map((v) => (
          <Link to={`/video?filename=${v.filename}&user_id=${v.userId}`} key={v.filename}>
            <div className="border rounded-xl p-2 hover:shadow-lg">
              <img
                src={v.video_preview}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="mt-2 font-semibold">{v.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}