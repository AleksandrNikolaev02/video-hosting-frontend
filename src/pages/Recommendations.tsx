import { useEffect, useState } from 'react';
import { getRecommendations } from '../api/api';
import { Link } from 'react-router-dom';
import type { Video } from '../model/Video';

export default function Recommendations() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendations().then(d => { setVideos(d.slice(0, 12)); setLoading(false); });
  }, []);

  return (
    <>
      <style>{`
        .rec-list { display: flex; flex-direction: column; gap: 12px; }
        .rec-item {
          display: flex; gap: 10px; align-items: flex-start;
          text-decoration: none;
          padding: 10px; border-radius: 12px;
          border: 1px solid transparent;
          transition: all 0.22s ease;
          background: transparent;
        }
        .rec-item:hover {
          background: rgba(155,89,245,0.06);
          border-color: rgba(155,89,245,0.12);
          transform: translateX(3px);
        }
        .rec-thumb {
          width: 120px; height: 68px; flex-shrink: 0;
          border-radius: 8px; overflow: hidden;
          background: #1a1729; position: relative;
        }
        .rec-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .rec-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #1a1729, #201d35);
          color: rgba(155,89,245,0.25); font-size: 20px;
        }
        .rec-body { flex: 1; min-width: 0; }
        .rec-title {
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          color: #f0ecff; line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          margin-bottom: 4px;
        }
        .rec-channel { font-size: 12px; color: rgba(155,89,245,0.7); font-weight: 600; }
        .rec-views { font-size: 11.5px; color: rgba(240,236,255,0.3); margin-top: 2px; }
        .rec-sk {
          display: flex; gap: 10px; padding: 10px;
          animation: fadeUp 0.35s ease both;
        }
        .rec-sk-thumb {
          width: 120px; height: 68px; flex-shrink: 0;
          border-radius: 8px;
          background: linear-gradient(90deg, #1a1729 25%, #201d35 50%, #1a1729 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }
        .rec-sk-lines { flex: 1; padding-top: 4px; }
        .rec-sk-line1 {
          height: 12px; border-radius: 6px; margin-bottom: 6px;
          background: linear-gradient(90deg, #1a1729 25%, #201d35 50%, #1a1729 75%);
          background-size: 200% 100%; animation: shimmer 1.6s infinite;
        }
        .rec-sk-line2 {
          height: 10px; border-radius: 5px; width: 60%;
          background: linear-gradient(90deg, #1a1729 25%, #201d35 50%, #1a1729 75%);
          background-size: 200% 100%; animation: shimmer 1.6s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="rec-list">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rec-sk" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="rec-sk-thumb" />
                <div className="rec-sk-lines">
                  <div className="rec-sk-line1" />
                  <div className="rec-sk-line2" />
                </div>
              </div>
            ))
          : videos.map((v, i) => (
              <Link
                to={`/video?filename=${v.filename}`}
                key={v.filename}
                className="rec-item"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="rec-thumb">
                  {v.video_preview
                    ? <img src={v.video_preview as unknown as string} alt={v.title} />
                    : <div className="rec-placeholder">▶</div>
                  }
                </div>
                <div className="rec-body">
                  <div className="rec-title">{v.title}</div>
                  {v.channelName && <div className="rec-channel">@ {v.channelName}</div>}
                  <div className="rec-views">{v.countViewing ?? 0} просмотров</div>
                </div>
              </Link>
            ))
        }
      </div>
    </>
  );
}
