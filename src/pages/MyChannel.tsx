import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyChannelInfo, getChannelVideos, getPreviewUrl } from '../api/api';
import type { Video } from '../model/Video';

export default function MyChannel() {
  const [channel, setChannel] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyChannelInfo().then(ch => {
      setChannel(ch);
      return getChannelVideos(ch.id);
    }).then(vids => {
      setVideos(vids);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const formatViews = (n?: number) => {
    if (!n) return '0';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0d0b14', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif',
      color: 'rgba(240,236,255,0.3)', fontSize: 16
    }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(155,89,245,0.15)', borderTopColor: '#9b59f5', animation: 'spin 0.8s linear infinite', marginRight: 14 }} />
      Загружаем канал...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        .mc-wrap { min-height: 100vh; background: #0d0b14; font-family: 'Nunito', sans-serif; }

        .mc-banner {
          height: 180px; position: relative; overflow: hidden;
          background: linear-gradient(135deg, #1a1729 0%, #0f0d1e 40%, #1d0d2e 100%);
        }
        .mc-banner::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 50% 80% at 25% 50%, rgba(155,89,245,0.2) 0%, transparent 70%),
            radial-gradient(ellipse 35% 55% at 80% 40%, rgba(224,64,251,0.14) 0%, transparent 65%);
        }
        .mc-banner-grid {
          position: absolute; inset: 0; opacity: 0.04;
          background-image: linear-gradient(rgba(155,89,245,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(155,89,245,1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .mc-top {
          max-width: 1440px; margin: 0 auto;
          padding: 0 28px 32px;
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-top: -52px; position: relative; gap: 20px; flex-wrap: wrap;
        }
        .mc-left { display: flex; align-items: flex-end; gap: 22px; }
        .mc-avatar {
          width: 104px; height: 104px; border-radius: 50%;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif; font-size: 40px; font-weight: 900;
          color: white; border: 4px solid #0d0b14; flex-shrink: 0;
          box-shadow: 0 8px 30px rgba(155,89,245,0.5);
          animation: fadeUp 0.5s ease;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .mc-meta { animation: fadeUp 0.5s ease 0.1s both; }
        .mc-name {
          font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 900;
          color: #f0ecff; letter-spacing: -0.5px; margin-bottom: 5px;
        }
        .mc-stats { display: flex; gap: 18px; }
        .mc-stat { font-size: 14px; color: rgba(240,236,255,0.42); }
        .mc-stat strong { color: rgba(240,236,255,0.72); font-weight: 700; }

        .mc-actions { display: flex; gap: 10px; animation: fadeUp 0.5s ease 0.2s both; }
        .mc-btn-upload {
          padding: 11px 24px; border-radius: 100px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          color: white; font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 700; border: none; cursor: pointer;
          box-shadow: 0 4px 20px rgba(155,89,245,0.4);
          transition: all 0.22s ease; text-decoration: none;
          display: inline-flex; align-items: center; gap: 7px;
        }
        .mc-btn-upload:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(155,89,245,0.56); }

        .mc-divider {
          max-width: 1440px; margin: 0 auto 28px;
          padding: 0 28px;
        }
        .mc-divider-line {
          height: 1px;
          background: linear-gradient(90deg, rgba(155,89,245,0.2), rgba(224,64,251,0.1), transparent);
        }

        .mc-content { max-width: 1440px; margin: 0 auto; padding: 0 28px 80px; }
        .mc-section-title {
          font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700;
          color: #f0ecff; margin-bottom: 20px;
          display: flex; align-items: center; gap: 10px;
        }
        .mc-section-title::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(90deg, rgba(155,89,245,0.18), transparent);
        }

        /* Video management list */
        .mc-vid-list { display: flex; flex-direction: column; gap: 14px; }
        .mc-vid-row {
          display: flex; gap: 14px; align-items: center;
          background: #13111f;
          border: 1px solid rgba(155,89,245,0.09);
          border-radius: 14px; padding: 12px 16px;
          transition: all 0.24s ease;
          animation: fadeUp 0.4s ease both;
        }
        .mc-vid-row:hover {
          border-color: rgba(155,89,245,0.2);
          background: #161326;
          transform: translateX(4px);
        }
        .mc-vid-thumb {
          width: 130px; height: 73px; border-radius: 9px; flex-shrink: 0;
          overflow: hidden; background: #1a1729;
          display: flex; align-items: center; justify-content: center;
          color: rgba(155,89,245,0.2); font-size: 22px; cursor: pointer;
        }
        .mc-vid-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .mc-vid-info { flex: 1; min-width: 0; }
        .mc-vid-title {
          font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 700;
          color: #f0ecff; cursor: pointer; transition: color 0.2s;
          display: -webkit-box; -webkit-line-clamp: 1;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .mc-vid-title:hover { color: #b47cff; }
        .mc-vid-meta { font-size: 13px; color: rgba(240,236,255,0.35); margin-top: 4px; }

        .mc-vid-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .mc-edit-btn {
          padding: 8px 16px; border-radius: 100px;
          background: rgba(155,89,245,0.1); color: #b47cff;
          border: 1.5px solid rgba(155,89,245,0.2);
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.2s; text-decoration: none;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .mc-edit-btn:hover { background: rgba(155,89,245,0.2); border-color: rgba(155,89,245,0.4); }

        .mc-empty {
          text-align: center; padding: 80px 20px;
          color: rgba(240,236,255,0.25); font-size: 15px;
        }
        .mc-empty-icon { font-size: 50px; display: block; margin-bottom: 14px; }
      `}</style>

      <div className="mc-wrap">
        <div className="mc-banner">
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 80% at 25% 50%, rgba(155,89,245,0.2) 0%, transparent 70%), radial-gradient(ellipse 35% 55% at 80% 40%, rgba(224,64,251,0.14) 0%, transparent 65%)' }} />
          <div className="mc-banner-grid" />
        </div>

        <div className="mc-top">
          <div className="mc-left">
            <div className="mc-avatar">
              {channel?.name?.charAt(0)?.toUpperCase() ?? 'М'}
            </div>
            <div className="mc-meta">
              <div className="mc-name">{channel?.name ?? 'Мой канал'}</div>
              <div className="mc-stats">
                <span className="mc-stat"><strong>{channel?.countSubs ?? 0}</strong> подписчиков</span>
                <span className="mc-stat"><strong>{videos.length}</strong> видео</span>
              </div>
            </div>
          </div>
          <div className="mc-actions">
            <Link to="/upload" className="mc-btn-upload">+ Загрузить видео</Link>
          </div>
        </div>

        <div className="mc-divider"><div className="mc-divider-line" /></div>

        <div className="mc-content">
          <div className="mc-section-title">🎬 Мои видео</div>

          {videos.length === 0 ? (
            <div className="mc-empty">
              <span className="mc-empty-icon">🎭</span>
              У тебя пока нет видео. Загрузи первое!
            </div>
          ) : (
            <div className="mc-vid-list">
              {videos.map((v, i) => (
                <div key={v.filename} className="mc-vid-row" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div
                    className="mc-vid-thumb"
                    onClick={() => navigate(`/video?filename=${v.filename}`)}
                  >
                    {v.video_preview
                      ? <img src={getPreviewUrl(v?.video_preview.previewId) as unknown as string} alt={v.title} />
                      : '▶'
                    }
                  </div>
                  <div className="mc-vid-info">
                    <div className="mc-vid-title" onClick={() => navigate(`/video?filename=${v.filename}`)}>
                      {v.title}
                    </div>
                    <div className="mc-vid-meta">
                      👁 {formatViews(v.countViewing)} просмотров
                    </div>
                  </div>
                  <div className="mc-vid-actions">
                    <Link to={`/edit-video?filename=${v.filename}`} className="mc-edit-btn">
                      ✏️ Редактировать
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
