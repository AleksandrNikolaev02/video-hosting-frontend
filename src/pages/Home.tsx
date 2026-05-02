import { useEffect, useState } from 'react';
import { getRecommendations } from '../api/api';
import { Link } from 'react-router-dom';
import type { Video } from '../model/Video';

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendations().then(data => { setVideos(data); setLoading(false); });
  }, []);

  const formatViews = (n?: number) => {
    if (!n) return '';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M просмотров';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K просмотров';
    return `${n} просмотров`;
  };

  return (
    <>
      <style>{`
        .home-wrap {
          min-height: 100vh;
          background: #0d0b14;
          font-family: 'Nunito', sans-serif;
          padding: 36px 28px 80px;
          max-width: 1440px; margin: 0 auto;
        }

        /* Hero strip */
        .home-hero {
          margin-bottom: 40px;
          padding: 32px 36px;
          background: linear-gradient(135deg, rgba(155,89,245,0.12) 0%, rgba(224,64,251,0.08) 100%);
          border: 1px solid rgba(155,89,245,0.18);
          border-radius: 20px;
          position: relative; overflow: hidden;
          animation: fadeUp 0.5s ease;
        }
        .home-hero::before {
          content: '';
          position: absolute; top: -60px; right: -60px;
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(155,89,245,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .home-hero::after {
          content: '';
          position: absolute; bottom: -40px; left: 20%;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(224,64,251,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .home-hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: 32px; font-weight: 800;
          color: #f0ecff; letter-spacing: -0.8px;
          margin-bottom: 8px;
        }
        .home-hero-sub { color: rgba(240,236,255,0.5); font-size: 15px; }
        .home-hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          color: white; font-family: 'Outfit', sans-serif;
          font-size: 12px; font-weight: 700;
          padding: 4px 12px; border-radius: 100px;
          margin-bottom: 14px;
          box-shadow: 0 2px 12px rgba(155,89,245,0.4);
        }

        /* Section title */
        .home-stitle {
          font-family: 'Outfit', sans-serif;
          font-size: 20px; font-weight: 700;
          color: #f0ecff; margin-bottom: 22px;
          display: flex; align-items: center; gap: 10px;
          letter-spacing: -0.3px;
        }
        .home-stitle::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(90deg, rgba(155,89,245,0.2), transparent);
        }

        /* Grid */
        .home-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 22px;
        }

        /* Card */
        .vc {
          background: #13111f;
          border: 1px solid rgba(155,89,245,0.1);
          border-radius: 16px; overflow: hidden;
          text-decoration: none; display: block;
          transition: transform 0.28s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.28s ease, border-color 0.28s ease;
          position: relative;
          animation: fadeUp 0.45s ease both;
        }
        .vc:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(155,89,245,0.25), 0 0 40px rgba(155,89,245,0.12);
          border-color: rgba(155,89,245,0.3);
        }

        /* Thumbnail */
        .vc-thumb {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
          background: #1a1729;
        }
        .vc-thumb img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1);
        }
        .vc:hover .vc-thumb img { transform: scale(1.06); }

        .vc-overlay {
          position: absolute; inset: 0;
          background: rgba(13,11,20,0);
          transition: background 0.28s ease;
          display: flex; align-items: center; justify-content: center;
        }
        .vc:hover .vc-overlay { background: rgba(13,11,20,0.35); }

        .vc-play {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(155,89,245,0.9);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; padding-left: 3px;
          color: white;
          box-shadow: 0 0 30px rgba(155,89,245,0.6);
          opacity: 0; transform: scale(0.7);
          transition: opacity 0.25s ease, transform 0.28s cubic-bezier(0.16,1,0.3,1);
        }
        .vc:hover .vc-play { opacity: 1; transform: scale(1); }

        .vc-thumb-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #1a1729, #201d32);
          color: rgba(155,89,245,0.2); font-size: 40px;
        }

        /* Body */
        .vc-body { padding: 14px 16px 18px; }
        .vc-title {
          font-family: 'Outfit', sans-serif;
          font-size: 15px; font-weight: 600;
          color: #f0ecff; line-height: 1.4; margin-bottom: 7px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .vc-channel { font-size: 13px; color: rgba(155,89,245,0.8); font-weight: 600; margin-bottom: 3px; }
        .vc-meta { font-size: 12.5px; color: rgba(240,236,255,0.35); }

        /* Skeleton */
        .sk {
          background: #13111f;
          border: 1px solid rgba(155,89,245,0.07);
          border-radius: 16px; overflow: hidden;
          animation: fadeUp 0.4s ease both;
        }
        .sk-thumb {
          aspect-ratio: 16/9;
          background: linear-gradient(90deg, #1a1729 25%, #201d35 50%, #1a1729 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }
        .sk-line {
          height: 14px; border-radius: 7px; margin: 16px 16px 8px;
          background: linear-gradient(90deg, #1a1729 25%, #201d35 50%, #1a1729 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }
        .sk-line-s {
          height: 12px; border-radius: 6px; margin: 0 16px 18px;
          width: 55%;
          background: linear-gradient(90deg, #1a1729 25%, #201d35 50%, #1a1729 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

        .home-empty {
          grid-column: 1/-1; text-align: center;
          padding: 100px 20px; color: rgba(240,236,255,0.25); font-size: 16px;
        }
        .home-empty-icon { font-size: 56px; display: block; margin-bottom: 16px; }
      `}</style>

      <div className="home-wrap">

        {/* Hero */}
        <div className="home-hero">
          <div className="home-hero-badge">✦ Персональные рекомендации</div>
          <h1 className="home-hero-title">Смотри. Открывай. Вдохновляйся.</h1>
          <p className="home-hero-sub">Видео подобраны специально для тебя на основе твоих интересов</p>
        </div>

        <h2 className="home-stitle">🎬 Рекомендации</h2>

        <div className="home-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="sk" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="sk-thumb" />
                  <div className="sk-line" />
                  <div className="sk-line-s" />
                </div>
              ))
            : videos.length === 0
              ? (
                <div className="home-empty">
                  <span className="home-empty-icon">🎭</span>
                  Пока нет видео — загляни позже!
                </div>
              )
              : videos.map((v, i) => (
                  <Link
                    to={`/video?filename=${v.filename}`}
                    key={v.filename}
                    className="vc"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="vc-thumb">
                      {v.video_preview
                        ? <img src={v.video_preview as unknown as string} alt={v.title} />
                        : <div className="vc-thumb-placeholder">▶</div>
                      }
                      <div className="vc-overlay">
                        <div className="vc-play">▶</div>
                      </div>
                    </div>
                    <div className="vc-body">
                      <div className="vc-title">{v.title}</div>
                      {v.channelName && <div className="vc-channel">@ {v.channelName}</div>}
                      <div className="vc-meta">{formatViews(v.countViewing)}</div>
                    </div>
                  </Link>
                ))
          }
        </div>
      </div>
    </>
  );
}
