import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hasChannel } from '../api/api';
import { getAccessToken, clearTokens } from '../util/auth';

export default function Header() {
  const [hasChannelState, setHasChannelState] = useState<boolean | null>(null);
  const [query, setQuery] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const refreshAuth = () => {
    const token = getAccessToken();
    setIsAuth(!!token);
    if (token) {
      hasChannel().then(setHasChannelState).catch(() => setHasChannelState(false));
    } else {
      setHasChannelState(false);
    }
  };

  useEffect(() => {
    refreshAuth();
    window.addEventListener('auth:change', refreshAuth);
    return () => window.removeEventListener('auth:change', refreshAuth);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/search?query=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <style>{`
        .h-root {
          position: sticky; top: 0; z-index: 999;
          background: rgba(13,11,20,0.82);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(155,89,245,0.1);
          transition: box-shadow 0.35s ease, background 0.35s ease;
          font-family: 'Nunito', sans-serif;
        }
        .h-root.scrolled {
          background: rgba(10,8,18,0.96);
          box-shadow: 0 4px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(155,89,245,0.15);
        }
        .h-inner {
          max-width: 1440px; margin: 0 auto;
          display: flex; align-items: center; gap: 18px;
          padding: 0 28px; height: 62px;
        }

        /* Logo */
        .h-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; flex-shrink: 0; }
        .h-logo-gem {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; color: white;
          box-shadow: 0 4px 16px rgba(155,89,245,0.4);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          position: relative; overflow: hidden;
        }
        .h-logo-gem::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.25), transparent);
          border-radius: inherit;
        }
        .h-logo:hover .h-logo-gem { transform: rotate(-6deg) scale(1.1); box-shadow: 0 6px 28px rgba(155,89,245,0.65); }
        .h-logo-name {
          font-family: 'Outfit', sans-serif;
          font-size: 21px; font-weight: 800;
          letter-spacing: -0.6px;
          color: #f0ecff;
        }
        .h-logo-name em {
          font-style: normal;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Search */
        .h-search { flex: 1; max-width: 540px; margin: 0 auto; }
        .h-search-box {
          display: flex; align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(155,89,245,0.12);
          border-radius: 100px; overflow: hidden;
          transition: all 0.25s ease;
        }
        .h-search-box.focused {
          background: rgba(155,89,245,0.07);
          border-color: rgba(155,89,245,0.4);
          box-shadow: 0 0 0 4px rgba(155,89,245,0.1), 0 4px 20px rgba(155,89,245,0.15);
        }
        .h-search-input {
          flex: 1; background: none; border: none; outline: none;
          color: #f0ecff; font-family: 'Nunito', sans-serif;
          font-size: 14.5px; padding: 10px 18px;
        }
        .h-search-input::placeholder { color: rgba(240,236,255,0.3); }
        .h-search-btn {
          background: none; border: none; cursor: pointer;
          padding: 10px 16px; color: rgba(240,236,255,0.4);
          font-size: 15px; display: flex; align-items: center;
          transition: color 0.2s;
        }
        .h-search-box.focused .h-search-btn { color: #b47cff; }
        .h-search-btn:hover { color: #b47cff; }

        /* Actions */
        .h-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .h-divider { width: 1px; height: 22px; background: rgba(155,89,245,0.15); margin: 0 2px; }

        /* Nav links */
        .h-navlink {
          padding: 8px 15px; border-radius: 100px;
          font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600;
          color: rgba(240,236,255,0.6); text-decoration: none;
          background: transparent; border: 1.5px solid transparent;
          cursor: pointer; transition: all 0.2s ease; white-space: nowrap;
        }
        .h-navlink:hover { color: #f0ecff; background: rgba(155,89,245,0.1); border-color: rgba(155,89,245,0.2); }

        /* Primary CTA */
        .h-cta {
          padding: 9px 20px; border-radius: 100px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          color: white; font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 700; border: none;
          cursor: pointer; text-decoration: none;
          box-shadow: 0 4px 18px rgba(155,89,245,0.4);
          transition: all 0.22s ease; white-space: nowrap;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .h-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(155,89,245,0.6); }

        /* Avatar */
        .h-avatar-wrap { position: relative; }
        .h-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          border: 2px solid rgba(155,89,245,0.3);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 800;
          color: white; transition: all 0.22s ease;
        }
        .h-avatar:hover { border-color: rgba(155,89,245,0.7); box-shadow: 0 0 20px rgba(155,89,245,0.4); transform: scale(1.05); }
        .h-avatar.open { border-color: rgba(224,64,251,0.6); box-shadow: 0 0 24px rgba(224,64,251,0.35); }

        /* Dropdown */
        .h-drop {
          position: absolute; top: calc(100% + 12px); right: 0;
          background: #161326;
          border: 1px solid rgba(155,89,245,0.2);
          border-radius: 16px; padding: 8px;
          min-width: 210px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(155,89,245,0.05);
          animation: dropSlide 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes dropSlide {
          from { opacity: 0; transform: translateY(-10px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .h-drop-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 13px; border-radius: 10px;
          color: rgba(240,236,255,0.7); font-size: 14px; font-weight: 600;
          font-family: 'Nunito', sans-serif;
          cursor: pointer; text-decoration: none;
          background: none; border: none; width: 100%; text-align: left;
          transition: all 0.15s ease;
        }
        .h-drop-item:hover { background: rgba(155,89,245,0.12); color: #f0ecff; }
        .h-drop-item.red:hover { background: rgba(240,50,80,0.12); color: #ff6b8a; }
        .h-drop-sep { height: 1px; background: rgba(155,89,245,0.1); margin: 6px 4px; }
      `}</style>

      <header className={`h-root${scrolled ? ' scrolled' : ''}`}>
        <div className="h-inner">

          <Link to="/" className="h-logo">
            <div className="h-logo-gem">▶</div>
            <span className="h-logo-name">My<em>Tube</em></span>
          </Link>

          <div className="h-search">
            <div className={`h-search-box${searchFocused ? ' focused' : ''}`}>
              <input
                className="h-search-input"
                placeholder="Поиск видео, каналов..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button className="h-search-btn" onClick={handleSearch}>🔍</button>
            </div>
          </div>

          <div className="h-actions">
            {!isAuth ? (
              <button className="h-cta" onClick={() => navigate('/login')}>
                ✦ Войти
              </button>
            ) : (
              <>
                <Link to="/subscriptions" className="h-navlink">Подписки</Link>

                {hasChannelState && (
                  <Link to="/upload" className="h-cta">+ Загрузить</Link>
                )}
                {!hasChannelState && hasChannelState !== null && (
                  <Link to="/create-channel" className="h-cta">✦ Создать канал</Link>
                )}

                <div className="h-divider" />

                <div className="h-avatar-wrap" ref={menuRef}>
                  <button
                    className={`h-avatar${menuOpen ? ' open' : ''}`}
                    onClick={() => setMenuOpen(p => !p)}
                  >
                    М
                  </button>
                  {menuOpen && (
                    <div className="h-drop">
                      {hasChannelState && (
                        <Link to="/my-channel" className="h-drop-item" onClick={() => setMenuOpen(false)}>
                          📺 Мой канал
                        </Link>
                      )}
                      <Link to="/subscriptions" className="h-drop-item" onClick={() => setMenuOpen(false)}>
                        🔔 Подписки
                      </Link>
                      {!hasChannelState && hasChannelState !== null && (
                        <Link to="/create-channel" className="h-drop-item" onClick={() => setMenuOpen(false)}>
                          🎬 Создать канал
                        </Link>
                      )}
                      <div className="h-drop-sep" />
                      <button
                        className="h-drop-item red"
                        onClick={() => { clearTokens(); navigate('/login'); window.location.reload(); }}
                      >
                        🚪 Выйти
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
