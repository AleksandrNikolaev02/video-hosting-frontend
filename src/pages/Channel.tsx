import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChannel, getChannelVideos } from '../api/api';
import type { Video } from '../model/Video';
import type { Channel } from '../model/Channel';


export default function ChannelPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    if (!id) return;

    getChannel(Number(id)).then(setChannel);
    getChannelVideos(Number(id)).then(setVideos);
  }, [id]);

  if (!channel) {
    return <div className="p-6">Загрузка...</div>;
  }

  return (
    <div className="p-6">

      {/* 🔥 ШАПКА КАНАЛА */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold">{channel.name}</h1>
        <p className="text-gray-600 mt-2">{channel.description}</p>
      </div>

      {/* 🎬 ВИДЕО */}
      <div className="grid grid-cols-4 gap-4">
        {videos.map((v) => (
          <div
            key={v.filename}
            onClick={() =>
              navigate(`/video?filename=${v.filename}&user_id=1`)
            }
            className="cursor-pointer border rounded p-2 hover:shadow-lg"
          >
            <img
              src={v.video_preview}
              className="w-full h-40 object-cover rounded"
            />

            <h3 className="mt-2 font-semibold">{v.title}</h3>

            <div className="text-sm text-gray-500">
              👁 {v.countViewing}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}