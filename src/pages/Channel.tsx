import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChannel, getChannelVideos, subscribe, unsubscribe, getMySubscriptions, getPreviewUrl } from '../api/api';
import { Link } from 'react-router-dom';
import type { Video } from '../model/Video';

export default function Channel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getChannel(Number(id)),
      getChannelVideos(Number(id)),
      getMySubscriptions()
    ]).then(([ch, vids, subs]) => {
      setChannel(ch);
      setVideos(vids);
      setSubscribed(subs.some((s: any) => String(s.id) === String(id)));
      setLoading(false);
    });
  }, [id]);

  const handleSubscribe = async () => {
    if (!id) return;
    if (subscribed) await unsubscribe(Number(id));
    else await subscribe(Number(id));
    setSubscribed(p => !p);
  };

  const formatViews = (n?: number) => {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  };

  if (loading) return (
    <>
      <style>{`
        .ch-loading {
          min-height: 100vh; background: #0d0b14;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Nunito', sans-serif; color: rgba(240,236,255,0.3); font-size: 16px;
        }
        .ch-spinner {
          width: 40px; height: 40px; border-radius: 50%;
          border: 3px solid rgba(155,89,245,0.15);
          border-top-color: #9b59f5;
          animation: spin 0.8s linear infinite; margin-right: 14px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div className="ch-loading">
        <div className="ch-spinner" /> Загружаем канал...
      </div>
    </>
  );

  return (
    <>
      <style>{`
        .ch-wrap { min-height: 100vh; background: #0d0b14; font-family: 'Nunito', sans-serif; }

        /* Banner */
        .ch-banner {
          height: 200px; position: relative; overflow: hidden;
          background: linear-gradient(135deg, #1a1729 0%, #0f0d1e 40%, #1d0d2e 100%);
        }
        .ch-banner-glow {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 80% at 30% 50%, rgba(155,89,245,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 75% 40%, rgba(224,64,251,0.12) 0%, transparent 65%);
        }
        .ch-banner-grid {
          position: absolute; inset: 0; opacity: 0.04;
          background-image: linear-gradient(rgba(155,89,245,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(155,89,245,1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Header info */
        .ch-header {
          max-width: 1440px; margin: 0 auto;
          padding: 0 28px 32px;
          display: flex; align-items: flex-end; gap: 24px;
          margin-top: -56px; position: relative;
        }
        .ch-avatar-big {
          width: 112px; height: 112px; border-radius: 50%;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif; font-size: 44px; font-weight: 800;
          color: white; flex-shrink: 0;
          border: 4px solid #0d0b14;
          box-shadow: 0 8px 32px rgba(155,89,245,0.5);
          animation: fadeUp 0.5s ease;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .ch-meta { flex: 1; padding-bottom: 4px; animation: fadeUp 0.5s ease 0.1s both; }
        .ch-name {
          font-family: 'Outfit', sans-serif; font-size: 30px; font-weight: 900;
          color: #f0ecff; letter-spacing: -0.6px; margin-bottom: 6px;
        }
        .ch-stats { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
        .ch-stat { font-size: 14px; color: rgba(240,236,255,0.45); }
        .ch-stat strong { color: rgba(240,236,255,0.75); font-weight: 700; }

        .ch-sub-btn {
          padding: 11px 28px; border-radius: 100px;
          font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 700;
          border: none; cursor: pointer; transition: all 0.22s ease;
          flex-shrink: 0; align-self: flex-end;
          animation: fadeUp 0.5s ease 0.2s both;
        }
        .ch-sub-btn.sub {
          background: rgba(155,89,245,0.12);
          color: #b47cff; border: 1.5px solid rgba(155,89,245,0.25);
        }
        .ch-sub-btn.sub:hover { background: rgba(155,89,245,0.22); }
        .ch-sub-btn.nosub {
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          color: white; box-shadow: 0 4px 20px rgba(155,89,245,0.4);
        }
        .ch-sub-btn.nosub:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(155,89,245,0.58); }

        .ch-divider {
          max-width: 1440px; margin: 0 auto 28px;
          padding: 0 28px;
        }
        .ch-divider-line {
          height: 1px;
          background: linear-gradient(90deg, rgba(155,89,245,0.2), rgba(224,64,251,0.1), transparent);
        }

        /* Content */
        .ch-content { max-width: 1440px; margin: 0 auto; padding: 0 28px 80px; }
        .ch-section-title {
          font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700;
          color: #f0ecff; margin-bottom: 20px;
          display: flex; align-items: center; gap: 10px;
        }
        .ch-section-title::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(90deg, rgba(155,89,245,0.18), transparent);
        }

        .ch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 20px;
        }
        .ch-card {
          background: #13111f;
          border: 1px solid rgba(155,89,245,0.1);
          border-radius: 14px; overflow: hidden;
          text-decoration: none; display: block;
          transition: all 0.26s cubic-bezier(0.16,1,0.3,1);
          animation: fadeUp 0.4s ease both;
        }
        .ch-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 44px rgba(0,0,0,0.55), 0 0 0 1px rgba(155,89,245,0.22), 0 0 30px rgba(155,89,245,0.1);
          border-color: rgba(155,89,245,0.28);
        }
        .ch-card-thumb {
          aspect-ratio: 16/9; position: relative; overflow: hidden; background: #1a1729;
        }
        .ch-card-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .ch-card:hover .ch-card-thumb img { transform: scale(1.05); }
        .ch-card-overlay {
          position: absolute; inset: 0;
          background: rgba(13,11,20,0);
          display: flex; align-items: center; justify-content: center;
          transition: background 0.26s ease;
        }
        .ch-card:hover .ch-card-overlay { background: rgba(13,11,20,0.32); }
        .ch-card-play {
          width: 48px; height: 48px; border-radius: 50%;
          background: rgba(155,89,245,0.9); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; padding-left: 3px;
          opacity: 0; transform: scale(0.7);
          transition: all 0.24s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 0 24px rgba(155,89,245,0.6);
        }
        .ch-card:hover .ch-card-play { opacity: 1; transform: scale(1); }
        .ch-placeholder {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #1a1729, #1d1532); color: rgba(155,89,245,0.2); font-size: 36px;
        }
        .ch-card-body { padding: 12px 14px 16px; }
        .ch-card-title {
          font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600;
          color: #f0ecff; line-height: 1.4; margin-bottom: 5px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .ch-card-views { font-size: 12px; color: rgba(240,236,255,0.35); }

        .ch-empty {
          grid-column: 1/-1; text-align: center;
          padding: 80px 20px; color: rgba(240,236,255,0.25); font-size: 15px;
        }
        .ch-empty-icon { font-size: 48px; display: block; margin-bottom: 14px; }
      `}</style>

      <div className="ch-wrap">
        <div className="ch-banner">
          <div className="ch-banner-glow" />
          <div className="ch-banner-grid" />
        </div>

        <div className="ch-header">
          <div className="ch-avatar-big">
            {channel?.name?.charAt(0)?.toUpperCase() ?? 'C'}
          </div>
          <div className="ch-meta">
            <div className="ch-name">{channel?.name ?? 'Канал'}</div>
            <div className="ch-stats">
              <span className="ch-stat"><strong>{channel?.countSubs ?? 0}</strong> подписчиков</span>
              <span className="ch-stat"><strong>{videos.length}</strong> видео</span>
            </div>
          </div>
          <button
            className={`ch-sub-btn ${subscribed ? 'sub' : 'nosub'}`}
            onClick={handleSubscribe}
          >
            {subscribed ? '✓ Подписан' : '+ Подписаться'}
          </button>
        </div>

        <div className="ch-divider"><div className="ch-divider-line" /></div>

        <div className="ch-content">
          <div className="ch-section-title">🎬 Видео канала</div>
          <div className="ch-grid">
            {videos.length === 0 ? (
              <div className="ch-empty">
                <span className="ch-empty-icon">📭</span>
                На этом канале пока нет видео
              </div>
            ) : videos.map((v, i) => (
              <Link
                to={`/video?filename=${v.filename}`}
                key={v.filename}
                className="ch-card"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="ch-card-thumb">
                  {v.video_preview
                    ? <img src={getPreviewUrl(v?.video_preview.previewId) as unknown as string} alt={v.title} />
                    : <div className="ch-placeholder">▶</div>
                  }
                  <div className="ch-card-overlay">
                    <div className="ch-card-play">▶</div>
                  </div>
                </div>
                <div className="ch-card-body">
                  <div className="ch-card-title">{v.title}</div>
                  <div className="ch-card-views">{formatViews(v.countViewing)} просмотров</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
