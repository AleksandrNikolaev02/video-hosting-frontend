import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getPreviewUrl, searchVideos } from '../api/api';
import type { Video } from '../model/Video';

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('query') ?? '';
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    searchVideos(query).then(d => { setVideos(d); setLoading(false); });
  }, [query]);

  const formatViews = (n?: number) => {
    if (!n) return '0 просмотров';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M просмотров';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K просмотров';
    return `${n} просмотров`;
  };

  return (
    <>
      <style>{`
        .sp-wrap {
          min-height: 100vh; background: #0d0b14;
          font-family: 'Nunito', sans-serif;
          padding: 32px 28px 80px;
          max-width: 1200px; margin: 0 auto;
        }
        .sp-header { margin-bottom: 28px; animation: fadeUp 0.4s ease; }
        .sp-label {
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1px; color: rgba(155,89,245,0.7); margin-bottom: 6px;
        }
        .sp-title {
          font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800;
          color: #f0ecff; letter-spacing: -0.5px;
        }
        .sp-title em {
          font-style: normal;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sp-count { font-size: 14px; color: rgba(240,236,255,0.35); margin-top: 6px; }

        .sp-divider {
          height: 1px; margin-bottom: 28px;
          background: linear-gradient(90deg, rgba(155,89,245,0.2), rgba(224,64,251,0.1), transparent);
          animation: fadeUp 0.4s ease 0.05s both;
        }

        .sp-list { display: flex; flex-direction: column; gap: 16px; }

        .sp-item {
          display: flex; gap: 16px; align-items: flex-start;
          background: #13111f;
          border: 1px solid rgba(155,89,245,0.08);
          border-radius: 14px; padding: 14px;
          text-decoration: none;
          transition: all 0.26s cubic-bezier(0.16,1,0.3,1);
          animation: fadeUp 0.4s ease both;
          position: relative; overflow: hidden;
        }
        .sp-item::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(155,89,245,0.05), rgba(224,64,251,0.03));
          opacity: 0; transition: opacity 0.26s ease; border-radius: inherit;
        }
        .sp-item:hover {
          transform: translateX(6px);
          border-color: rgba(155,89,245,0.22);
          box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(155,89,245,0.1), -4px 0 20px rgba(155,89,245,0.12);
        }
        .sp-item:hover::before { opacity: 1; }
        .sp-thumb {
          width: 200px; height: 113px; flex-shrink: 0;
          border-radius: 10px; overflow: hidden;
          background: #1a1729; position: relative;
        }
        .sp-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .sp-item:hover .sp-thumb img { transform: scale(1.04); }
        .sp-placeholder {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #1a1729, #201d35);
          color: rgba(155,89,245,0.2); font-size: 28px;
        }
        .sp-play-badge {
          position: absolute; bottom: 8px; right: 8px;
          background: rgba(13,11,20,0.8); color: #b47cff;
          font-size: 11px; font-weight: 700; font-family: 'Outfit', sans-serif;
          padding: 3px 8px; border-radius: 6px;
          backdrop-filter: blur(4px);
        }

        .sp-info { flex: 1; min-width: 0; }
        .sp-video-title {
          font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 700;
          color: #f0ecff; line-height: 1.35; margin-bottom: 8px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .sp-channel {
          font-size: 13.5px; color: rgba(155,89,245,0.75);
          font-weight: 600; margin-bottom: 5px;
        }
        .sp-meta { font-size: 13px; color: rgba(240,236,255,0.32); }

        /* Skeleton */
        .sp-sk {
          display: flex; gap: 16px; align-items: flex-start;
          background: #13111f; border-radius: 14px; padding: 14px;
          border: 1px solid rgba(155,89,245,0.06);
          animation: fadeUp 0.4s ease both;
        }
        .sp-sk-thumb {
          width: 200px; height: 113px; flex-shrink: 0; border-radius: 10px;
          background: linear-gradient(90deg, #1a1729 25%, #201d35 50%, #1a1729 75%);
          background-size: 200% 100%; animation: shimmer 1.6s infinite;
        }
        .sp-sk-body { flex: 1; padding-top: 4px; }
        .sp-sk-line {
          height: 16px; border-radius: 8px; margin-bottom: 10px;
          background: linear-gradient(90deg, #1a1729 25%, #201d35 50%, #1a1729 75%);
          background-size: 200% 100%; animation: shimmer 1.6s infinite;
        }
        .sp-sk-line-s {
          height: 12px; border-radius: 6px; width: 40%;
          background: linear-gradient(90deg, #1a1729 25%, #201d35 50%, #1a1729 75%);
          background-size: 200% 100%; animation: shimmer 1.6s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        .sp-empty {
          text-align: center; padding: 100px 20px;
          color: rgba(240,236,255,0.25); font-size: 15px;
          animation: fadeUp 0.4s ease;
        }
        .sp-empty-icon { font-size: 52px; display: block; margin-bottom: 16px; }
        .sp-empty-q {
          color: #9b59f5; font-family: 'Outfit', sans-serif;
          font-weight: 700; font-size: 17px; margin-top: 6px;
        }
      `}</style>

      <div className="sp-wrap">
        <div className="sp-header">
          <div className="sp-label">Поиск</div>
          <h1 className="sp-title">Результаты для: <em>{query}</em></h1>
          {!loading && <div className="sp-count">{videos.length} видео найдено</div>}
        </div>

        <div className="sp-divider" />

        {loading ? (
          <div className="sp-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="sp-sk" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="sp-sk-thumb" />
                <div className="sp-sk-body">
                  <div className="sp-sk-line" />
                  <div className="sp-sk-line-s" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="sp-empty">
            <span className="sp-empty-icon">🔍</span>
            Ничего не найдено
            <div className="sp-empty-q">«{query}»</div>
          </div>
        ) : (
          <div className="sp-list">
            {videos.map((v, i) => (
              <Link
                to={`/video?filename=${v.filename}`}
                key={v.filename}
                className="sp-item"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="sp-thumb">
                  {v.video_preview
                    ? <img src={getPreviewUrl(v?.video_preview.previewId) as unknown as string} alt={v.title} />
                    : <div className="sp-placeholder">▶</div>
                  }
                  <div className="sp-play-badge">▶ Смотреть</div>
                </div>
                <div className="sp-info">
                  <div className="sp-video-title">{v.title}</div>
                  {v.channelName && <div className="sp-channel">@ {v.channelName}</div>}
                  <div className="sp-meta">{formatViews(v.countViewing)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
