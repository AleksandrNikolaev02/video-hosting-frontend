import { useEffect, useState } from 'react';
import { getMyVideos, deleteVideo, postVideo } from '../api/api';
import { useNavigate } from 'react-router-dom';
import type { Video } from '../model/Video';


export default function MyChannel() {
  const [videos, setVideos] = useState<Video[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    getMyVideos().then(setVideos);
  };

  const handleDelete = async (filename: string) => {
    await deleteVideo(filename);
    load();
  };

  const handlePublish = async (filename: string) => {
    await postVideo(filename);
    load();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Мой канал</h1>

      <div className="grid grid-cols-3 gap-4">
        {videos.map((v) => (
          <div key={v.filename} className="border p-3 rounded">

            <img
              src={v.video_preview}
              className="w-full h-40 object-cover rounded"
            />

            <h3 className="mt-2 font-semibold">{v.title}</h3>

            <div className="text-sm text-gray-500">
              Статус: {v.videoStatus}
            </div>

            <div className="text-sm text-gray-500">
              Просмотры: {v.countViewing}
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">

              <button
                onClick={() => navigate(`/video?filename=${v.filename}&user_id=1`)}
                className="bg-blue-500 text-white px-2 py-1 rounded"
              >
                👁 Смотреть
              </button>

              {v.videoStatus === 'DRAFT' && (
                <button
                  onClick={() => handlePublish(v.filename)}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  🚀 Опубликовать
                </button>
              )}

              <button
                onClick={() => handleDelete(v.filename)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                🗑 Удалить
              </button>

            </div>

          </div>
        ))}
      </div>
    </div>
  );
}