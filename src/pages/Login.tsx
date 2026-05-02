import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, twoFactor } from '../api/api';
import { setTokens } from '../util/auth';

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Заполните все поля'); return; }
    try {
      setLoading(true); setError('');
      const res = await login({ email, password });
      if (res.requires2FA) setStep('2fa');
      else { setTokens(res.payload.accessToken, res.payload.refreshToken); navigate('/'); }
    } catch { setError('Неверный email или пароль'); }
    finally { setLoading(false); }
  };

  const handle2FA = async () => {
    if (!code) { setError('Введите код'); return; }
    try {
      setLoading(true); setError('');
      const res = await twoFactor({ email, code });
      setTokens(res.accessToken, res.refreshToken);
      navigate('/');
    } catch { setError('Неверный или устаревший код'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        .login-bg {
          min-height: 100vh;
          background: #0d0b14;
          display: flex; align-items: center; justify-content: center;
          padding: 24px; font-family: 'Nunito', sans-serif;
          position: relative; overflow: hidden;
        }
        /* Ambient orbs */
        .login-bg::before {
          content: '';
          position: fixed; top: -20%; left: 50%; transform: translateX(-50%);
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(155,89,245,0.1) 0%, transparent 65%);
          pointer-events: none;
        }
        .login-bg::after {
          content: '';
          position: fixed; bottom: -10%; right: 10%;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(224,64,251,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .login-card {
          background: #13111f;
          border: 1px solid rgba(155,89,245,0.18);
          border-radius: 24px;
          padding: 52px 44px;
          width: 100%; max-width: 420px;
          position: relative;
          box-shadow: 0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(155,89,245,0.06);
          animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .login-card::before {
          content: '';
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 2px;
          background: linear-gradient(90deg, transparent, #9b59f5, #e040fb, transparent);
          border-radius: 0 0 4px 4px;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Logo */
        .login-logo {
          display: flex; align-items: center; gap: 10px;
          justify-content: center; margin-bottom: 36px;
        }
        .login-logo-gem {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; color: white;
          box-shadow: 0 6px 24px rgba(155,89,245,0.5);
        }
        .login-logo-name {
          font-family: 'Outfit', sans-serif;
          font-size: 26px; font-weight: 800; color: #f0ecff; letter-spacing: -0.5px;
        }
        .login-logo-name em {
          font-style: normal;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Title */
        .login-title {
          font-family: 'Outfit', sans-serif;
          font-size: 24px; font-weight: 800;
          color: #f0ecff; text-align: center;
          margin-bottom: 6px; letter-spacing: -0.4px;
        }
        .login-sub {
          font-size: 14px; color: rgba(240,236,255,0.4);
          text-align: center; margin-bottom: 32px; line-height: 1.5;
        }
        .login-sub strong { color: rgba(240,236,255,0.7); }

        /* Fields */
        .login-field { margin-bottom: 18px; }
        .login-label {
          display: block; font-size: 11.5px; font-weight: 700;
          color: rgba(155,89,245,0.8); margin-bottom: 8px;
          text-transform: uppercase; letter-spacing: 0.8px;
        }
        .login-input {
          width: 100%;
          background: rgba(155,89,245,0.05);
          border: 1.5px solid rgba(155,89,245,0.12);
          border-radius: 12px; padding: 13px 18px;
          color: #f0ecff; font-family: 'Nunito', sans-serif;
          font-size: 15px; outline: none;
          transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: rgba(240,236,255,0.22); }
        .login-input:focus {
          border-color: rgba(155,89,245,0.55);
          background: rgba(155,89,245,0.09);
          box-shadow: 0 0 0 4px rgba(155,89,245,0.1);
        }
        .login-input.code-input {
          letter-spacing: 6px; font-size: 22px;
          text-align: center; font-weight: 700;
          font-family: 'Outfit', sans-serif;
        }

        /* Error */
        .login-error {
          background: rgba(240,50,80,0.1);
          border: 1px solid rgba(240,50,80,0.25);
          border-radius: 10px; padding: 12px 16px;
          color: #ff6b8a; font-size: 13.5px; margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }

        /* Submit btn */
        .login-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          border: none; border-radius: 12px;
          color: white; font-family: 'Outfit', sans-serif;
          font-size: 17px; font-weight: 800;
          cursor: pointer; letter-spacing: 0.2px;
          box-shadow: 0 6px 24px rgba(155,89,245,0.4);
          transition: all 0.22s ease; margin-top: 8px;
          position: relative; overflow: hidden;
        }
        .login-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          border-radius: inherit;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(155,89,245,0.6);
        }
        .login-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .login-back {
          background: none; border: none; color: rgba(240,236,255,0.35);
          font-size: 13.5px; cursor: pointer;
          margin-top: 18px; width: 100%; text-align: center;
          padding: 8px; transition: color 0.2s;
          font-family: 'Nunito', sans-serif;
        }
        .login-back:hover { color: rgba(240,236,255,0.65); }

        .login-hint {
          font-size: 13px; color: rgba(240,236,255,0.28);
          text-align: center; margin-top: 14px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        /* Loading spinner in button */
        .spin { display: inline-block; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="login-bg">
        <div className="login-card">

          <div className="login-logo">
            <div className="login-logo-gem">▶</div>
            <span className="login-logo-name">My<em>Tube</em></span>
          </div>

          {step === 'login' ? (
            <>
              <h2 className="login-title">С возвращением!</h2>
              <p className="login-sub">Войди в свой аккаунт, чтобы продолжить</p>

              {error && <div className="login-error">⚠️ {error}</div>}

              <div className="login-field">
                <label className="login-label">Email</label>
                <input
                  type="email"
                  className="login-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div className="login-field">
                <label className="login-label">Пароль</label>
                <input
                  type="password"
                  className="login-input"
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <button className="login-btn" onClick={handleLogin} disabled={loading}>
                {loading ? <span className="spin">◌</span> : 'Войти →'}
              </button>
            </>
          ) : (
            <>
              <h2 className="login-title">Подтверждение</h2>
              <p className="login-sub">
                Мы отправили код на<br />
                <strong>{email}</strong>
              </p>

              {error && <div className="login-error">⚠️ {error}</div>}

              <div className="login-field">
                <label className="login-label">Код из письма</label>
                <input
                  className="login-input code-input"
                  placeholder="· · · · · ·"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handle2FA()}
                  maxLength={8}
                />
              </div>

              <p className="login-hint">📬 Проверь папку «Спам»</p>

              <button className="login-btn" onClick={handle2FA} disabled={loading}>
                {loading ? <span className="spin">◌</span> : 'Подтвердить →'}
              </button>

              <button className="login-back" onClick={() => { setStep('login'); setError(''); }}>
                ← Назад
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
