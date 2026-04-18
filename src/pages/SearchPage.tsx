import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchVideos } from '../api/api';

type Video = {
  filename: string;
  name: string;
  description: string;
  createdAt: string;
  names: string[];
  userId: number;
};

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('query') || '';

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    setLoading(true);

    searchVideos(query)
      .then(setVideos)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="p-6">

      <h1 className="text-2xl mb-4">
        Результаты поиска: "{query}"
      </h1>

      {loading && <div>Загрузка...</div>}

      {!loading && videos.length === 0 && (
        <div>Ничего не найдено</div>
      )}

      <div className="flex flex-col gap-4">
        {videos.map((v) => (
          <Link
            key={v.filename}
            to={`/video?filename=${v.filename}&user_id=${v.userId}`}
            className="border p-3 rounded hover:bg-gray-800"
          >
            <h3 className="text-lg font-semibold">{v.name}</h3>
            <p className="text-sm text-gray-400">
              {v.description}
            </p>
          </Link>
        ))}
      </div>

    </div>
  );
}