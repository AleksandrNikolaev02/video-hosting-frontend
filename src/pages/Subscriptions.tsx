import { useEffect, useState } from 'react';
import { getMySubscriptions } from '../api/api';
import { Link, useNavigate } from 'react-router-dom';

export default function Subscriptions() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMySubscriptions().then(d => { setChannels(d); setLoading(false); });
  }, []);

  return (
    <>
      <style>{`
        .subs-wrap {
          min-height: 100vh; background: #0d0b14;
          font-family: 'Nunito', sans-serif;
          padding: 36px 28px 80px;
          max-width: 1100px; margin: 0 auto;
        }
        .subs-header { margin-bottom: 32px; animation: fadeUp 0.4s ease; }
        .subs-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, rgba(155,89,245,0.15), rgba(224,64,251,0.1));
          border: 1px solid rgba(155,89,245,0.2);
          color: #b47cff; font-family: 'Outfit', sans-serif;
          font-size: 12px; font-weight: 700;
          padding: 4px 14px; border-radius: 100px; margin-bottom: 14px;
        }
        .subs-title {
          font-family: 'Outfit', sans-serif; font-size: 30px; font-weight: 900;
          color: #f0ecff; letter-spacing: -0.6px; margin-bottom: 6px;
        }
        .subs-sub { font-size: 15px; color: rgba(240,236,255,0.38); }

        .subs-divider {
          height: 1px; margin-bottom: 32px;
          background: linear-gradient(90deg, rgba(155,89,245,0.2), rgba(224,64,251,0.1), transparent);
        }

        /* Channel cards */
        .subs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 48px;
        }
        .subs-ch-card {
          background: #13111f;
          border: 1px solid rgba(155,89,245,0.1);
          border-radius: 16px; padding: 24px 20px;
          text-decoration: none; display: flex; flex-direction: column;
          align-items: center; text-align: center;
          transition: all 0.26s cubic-bezier(0.16,1,0.3,1);
          animation: fadeUp 0.4s ease both;
          cursor: pointer;
        }
        .subs-ch-card:hover {
          transform: translateY(-6px);
          border-color: rgba(155,89,245,0.28);
          box-shadow: 0 14px 40px rgba(0,0,0,0.5), 0 0 30px rgba(155,89,245,0.1);
        }
        .subs-ch-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 900;
          color: white; margin-bottom: 14px;
          box-shadow: 0 6px 24px rgba(155,89,245,0.4);
          transition: transform 0.22s, box-shadow 0.22s;
        }
        .subs-ch-card:hover .subs-ch-avatar {
          transform: scale(1.08);
          box-shadow: 0 10px 32px rgba(155,89,245,0.58);
        }
        .subs-ch-name {
          font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 800;
          color: #f0ecff; margin-bottom: 4px; letter-spacing: -0.2px;
        }
        .subs-ch-subs { font-size: 13px; color: rgba(240,236,255,0.38); }

        /* Skeleton */
        .subs-sk {
          background: #13111f; border-radius: 16px; padding: 24px 20px;
          display: flex; flex-direction: column; align-items: center;
          border: 1px solid rgba(155,89,245,0.06);
          animation: fadeUp 0.4s ease both;
        }
        .subs-sk-avatar {
          width: 72px; height: 72px; border-radius: 50%; margin-bottom: 14px;
          background: linear-gradient(90deg, #1a1729 25%, #201d35 50%, #1a1729 75%);
          background-size: 200% 100%; animation: shimmer 1.6s infinite;
        }
        .subs-sk-line {
          height: 13px; border-radius: 7px; width: 80%; margin-bottom: 8px;
          background: linear-gradient(90deg, #1a1729 25%, #201d35 50%, #1a1729 75%);
          background-size: 200% 100%; animation: shimmer 1.6s infinite;
        }
        .subs-sk-line-s {
          height: 11px; border-radius: 6px; width: 50%;
          background: linear-gradient(90deg, #1a1729 25%, #201d35 50%, #1a1729 75%);
          background-size: 200% 100%; animation: shimmer 1.6s infinite;
        }

        .subs-empty {
          text-align: center; padding: 100px 20px;
          color: rgba(240,236,255,0.25); font-size: 15px;
          animation: fadeUp 0.4s ease;
        }
        .subs-empty-icon { font-size: 52px; display: block; margin-bottom: 16px; }
        .subs-empty-btn {
          display: inline-flex; align-items: center; gap: 8px;
          margin-top: 20px; padding: 12px 28px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          color: white; border: none; border-radius: 100px;
          font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 700;
          cursor: pointer; box-shadow: 0 4px 20px rgba(155,89,245,0.4);
          transition: all 0.22s ease;
        }
        .subs-empty-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(155,89,245,0.56); }

        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="subs-wrap">
        <div className="subs-header">
          <div className="subs-badge">🔔 Подписки</div>
          <h1 className="subs-title">Твои каналы</h1>
          <p className="subs-sub">Следи за любимыми авторами</p>
        </div>

        <div className="subs-divider" />

        {loading ? (
          <div className="subs-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="subs-sk" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="subs-sk-avatar" />
                <div className="subs-sk-line" />
                <div className="subs-sk-line-s" />
              </div>
            ))}
          </div>
        ) : channels.length === 0 ? (
          <div className="subs-empty">
            <span className="subs-empty-icon">📺</span>
            Вы ещё не подписаны ни на один канал
            <br />
            <button className="subs-empty-btn" onClick={() => navigate('/')}>
              ✦ Открыть видео
            </button>
          </div>
        ) : (
          <div className="subs-grid">
            {channels.map((ch, i) => (
              <Link
                to={`/channel/${ch.id}`}
                key={ch.id}
                className="subs-ch-card"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="subs-ch-avatar">
                  {ch.name?.charAt(0)?.toUpperCase() ?? 'C'}
                </div>
                <div className="subs-ch-name">{ch.name}</div>
                <div className="subs-ch-subs">{ch.countSubs ?? 0} подписчиков</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
