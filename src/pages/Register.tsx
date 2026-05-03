import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, twoFactor } from '../api/api';
import { setTokens } from '../util/auth';

type Step = 'form' | 'code' | 'success';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');

  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [code, setCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Шаг 1 — отправка формы регистрации
  const handleRegister = async () => {
    if (!firstName.trim() || !secondName.trim() || !email.trim() || !password) {
      setError('Заполните все поля'); return;
    }
    if (password !== passwordRepeat) {
      setError('Пароли не совпадают'); return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов'); return;
    }
    try {
      setLoading(true); setError('');
      await register({ firstName, secondName, email, password });
      setStep('code');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(msg ?? 'Ошибка регистрации. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  // Шаг 2 — подтверждение кода из почты (twoFactor с type=REGISTER)
  const handleConfirm = async () => {
    if (!code.trim()) { setError('Введите код из письма'); return; }
    try {
      setLoading(true); setError('');
      const res = await twoFactor({ email, code }, 'REGISTER');
      // После подтверждения бэк может вернуть токены — логиним сразу
      if (res?.accessToken) {
        setTokens(res.accessToken, res.refreshToken);
        window.dispatchEvent(new Event('auth:change'));
      }
      setStep('success');
      setTimeout(() => navigate('/'), 1800);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(msg ?? 'Неверный или устаревший код');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .reg-bg {
          min-height: 100vh; background: #0d0b14;
          display: flex; align-items: center; justify-content: center;
          padding: 24px; font-family: 'Nunito', sans-serif;
          position: relative; overflow: hidden;
        }
        .reg-bg::before {
          content: '';
          position: fixed; top: -20%; left: 50%; transform: translateX(-50%);
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(155,89,245,0.09) 0%, transparent 65%);
          pointer-events: none;
        }
        .reg-bg::after {
          content: '';
          position: fixed; bottom: -10%; right: 10%;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(224,64,251,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .reg-card {
          background: #13111f;
          border: 1px solid rgba(155,89,245,0.18);
          border-radius: 24px; padding: 48px 44px;
          width: 100%; max-width: 440px;
          position: relative; overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(155,89,245,0.05);
          animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .reg-card::before {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 65%; height: 2px;
          background: linear-gradient(90deg, transparent, #9b59f5, #e040fb, transparent);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Logo */
        .reg-logo {
          display: flex; align-items: center; gap: 10px;
          justify-content: center; margin-bottom: 32px;
        }
        .reg-logo-gem {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; color: white;
          box-shadow: 0 4px 18px rgba(155,89,245,0.45);
        }
        .reg-logo-name {
          font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800;
          color: #f0ecff; letter-spacing: -0.4px;
        }
        .reg-logo-name em {
          font-style: normal;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Step indicator */
        .reg-steps {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin-bottom: 28px;
        }
        .reg-step-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(155,89,245,0.2);
          transition: all 0.3s ease;
        }
        .reg-step-dot.active {
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          box-shadow: 0 0 10px rgba(155,89,245,0.5);
          width: 24px; border-radius: 4px;
        }
        .reg-step-dot.done { background: rgba(52,211,153,0.6); }

        /* Title */
        .reg-title {
          font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800;
          color: #f0ecff; text-align: center; margin-bottom: 6px; letter-spacing: -0.3px;
        }
        .reg-sub {
          font-size: 14px; color: rgba(240,236,255,0.38);
          text-align: center; margin-bottom: 28px; line-height: 1.5;
        }
        .reg-sub strong { color: rgba(240,236,255,0.65); }

        /* Row for two fields */
        .reg-row { display: flex; gap: 12px; margin-bottom: 16px; }
        .reg-row .reg-field { flex: 1; margin-bottom: 0; }

        /* Field */
        .reg-field { margin-bottom: 16px; }
        .reg-label {
          display: block; font-size: 11.5px; font-weight: 800;
          color: rgba(155,89,245,0.8); margin-bottom: 8px;
          text-transform: uppercase; letter-spacing: 0.8px;
        }
        .reg-input {
          width: 100%; background: rgba(155,89,245,0.05);
          border: 1.5px solid rgba(155,89,245,0.12);
          border-radius: 12px; padding: 12px 16px;
          color: #f0ecff; font-family: 'Nunito', sans-serif;
          font-size: 15px; outline: none; box-sizing: border-box;
          transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
        }
        .reg-input::placeholder { color: rgba(240,236,255,0.22); }
        .reg-input:focus {
          border-color: rgba(155,89,245,0.52);
          background: rgba(155,89,245,0.08);
          box-shadow: 0 0 0 4px rgba(155,89,245,0.1);
        }
        .reg-input.code-input {
          letter-spacing: 6px; font-size: 22px;
          text-align: center; font-weight: 700;
          font-family: 'Outfit', sans-serif;
        }

        /* Password strength */
        .reg-pw-bar {
          height: 3px; border-radius: 2px; margin-top: 7px;
          background: rgba(155,89,245,0.1); overflow: hidden;
        }
        .reg-pw-fill {
          height: 100%; border-radius: 2px;
          transition: width 0.3s ease, background 0.3s ease;
        }
        .reg-pw-hint { font-size: 11.5px; color: rgba(240,236,255,0.3); margin-top: 5px; }

        /* Error */
        .reg-error {
          background: rgba(240,50,80,0.1); border: 1px solid rgba(240,50,80,0.25);
          border-radius: 10px; padding: 11px 15px;
          color: #ff6b8a; font-size: 13.5px; margin-bottom: 18px;
          display: flex; align-items: flex-start; gap: 8px;
        }

        /* Button */
        .reg-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          border: none; border-radius: 12px; color: white;
          font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 800;
          cursor: pointer; letter-spacing: 0.2px;
          box-shadow: 0 6px 24px rgba(155,89,245,0.4);
          transition: all 0.22s ease; position: relative; overflow: hidden;
          margin-top: 4px;
        }
        .reg-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.13), transparent);
          border-radius: inherit;
        }
        .reg-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(155,89,245,0.58); }
        .reg-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Footer link */
        .reg-footer {
          text-align: center; margin-top: 22px;
          font-size: 13.5px; color: rgba(240,236,255,0.35);
        }
        .reg-footer a {
          color: #b47cff; text-decoration: none; font-weight: 700;
          transition: color 0.2s;
        }
        .reg-footer a:hover { color: #cba3ff; }

        /* Back button */
        .reg-back {
          background: none; border: none; color: rgba(240,236,255,0.35);
          font-size: 13px; cursor: pointer;
          margin-top: 16px; width: 100%; text-align: center;
          padding: 8px; transition: color 0.2s; font-family: 'Nunito', sans-serif;
        }
        .reg-back:hover { color: rgba(240,236,255,0.65); }

        /* Code hint */
        .reg-code-hint {
          font-size: 13px; color: rgba(240,236,255,0.28);
          text-align: center; margin-top: 12px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }

        /* Success state */
        .reg-success-icon {
          width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 20px;
          background: linear-gradient(135deg, rgba(52,211,153,0.2), rgba(16,185,129,0.15));
          border: 2px solid rgba(52,211,153,0.35);
          display: flex; align-items: center; justify-content: center;
          font-size: 32px;
          animation: successPop 0.5s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 0 32px rgba(52,211,153,0.2);
        }
        @keyframes successPop {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        .reg-success-title {
          font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800;
          color: #f0ecff; text-align: center; margin-bottom: 8px;
        }
        .reg-success-sub { font-size: 14px; color: rgba(240,236,255,0.38); text-align: center; }
        .reg-redirect-bar {
          height: 3px; border-radius: 2px; background: rgba(155,89,245,0.1);
          margin-top: 24px; overflow: hidden;
        }
        .reg-redirect-fill {
          height: 100%; width: 0%;
          background: linear-gradient(90deg, #9b59f5, #e040fb);
          border-radius: 2px;
          animation: fillBar 1.8s linear forwards;
        }
        @keyframes fillBar { from { width: 0% } to { width: 100% } }

        .spin { display: inline-block; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="reg-bg">
        <div className="reg-card">

          {/* Лого */}
          <div className="reg-logo">
            <div className="reg-logo-gem">▶</div>
            <span className="reg-logo-name">My<em>Tube</em></span>
          </div>

          {/* Индикатор шагов */}
          <div className="reg-steps">
            <div className={`reg-step-dot ${step === 'form' ? 'active' : 'done'}`} />
            <div className={`reg-step-dot ${step === 'code' ? 'active' : step === 'success' ? 'done' : ''}`} />
            <div className={`reg-step-dot ${step === 'success' ? 'active' : ''}`} />
          </div>

          {/* ── Шаг 1: Данные ── */}
          {step === 'form' && (
            <>
              <h2 className="reg-title">Создать аккаунт</h2>
              <p className="reg-sub">Присоединяйся к платформе</p>

              {error && <div className="reg-error">⚠️ {error}</div>}

              <div className="reg-row">
                <div className="reg-field">
                  <label className="reg-label">Имя</label>
                  <input
                    className="reg-input" placeholder="Иван"
                    value={firstName} onChange={e => setFirstName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  />
                </div>
                <div className="reg-field">
                  <label className="reg-label">Фамилия</label>
                  <input
                    className="reg-input" placeholder="Иванов"
                    value={secondName} onChange={e => setSecondName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  />
                </div>
              </div>

              <div className="reg-field">
                <label className="reg-label">Email</label>
                <input
                  type="email" className="reg-input" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                />
              </div>

              <div className="reg-field">
                <label className="reg-label">Пароль</label>
                <input
                  type="password" className="reg-input" placeholder="Минимум 6 символов"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                />
                {/* Индикатор силы пароля */}
                {password && (
                  <>
                    <div className="reg-pw-bar">
                      <div className="reg-pw-fill" style={{
                        width: password.length < 6 ? '25%' : password.length < 10 ? '55%' : '100%',
                        background: password.length < 6
                          ? '#ef4444'
                          : password.length < 10
                            ? '#f59e0b'
                            : '#34d399'
                      }} />
                    </div>
                    <div className="reg-pw-hint">
                      {password.length < 6 ? 'Слабый' : password.length < 10 ? 'Средний' : 'Надёжный'}
                    </div>
                  </>
                )}
              </div>

              <div className="reg-field">
                <label className="reg-label">Повторите пароль</label>
                <input
                  type="password" className="reg-input" placeholder="••••••••"
                  value={passwordRepeat} onChange={e => setPasswordRepeat(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  style={passwordRepeat && password !== passwordRepeat
                    ? { borderColor: 'rgba(240,50,80,0.5)' }
                    : passwordRepeat && password === passwordRepeat
                      ? { borderColor: 'rgba(52,211,153,0.5)' }
                      : {}
                  }
                />
              </div>

              <button className="reg-btn" onClick={handleRegister} disabled={loading}>
                {loading ? <><span className="spin">◌</span> Регистрируем...</> : 'Зарегистрироваться →'}
              </button>

              <div className="reg-footer">
                Уже есть аккаунт? <Link to="/login">Войти</Link>
              </div>
            </>
          )}

          {/* ── Шаг 2: Код из почты ── */}
          {step === 'code' && (
            <>
              <h2 className="reg-title">Подтверди email</h2>
              <p className="reg-sub">
                Мы отправили код на<br />
                <strong>{email}</strong>
              </p>

              {error && <div className="reg-error">⚠️ {error}</div>}

              <div className="reg-field">
                <label className="reg-label">Код из письма</label>
                <input
                  className="reg-input code-input"
                  placeholder="· · · · · ·"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                  maxLength={8}
                />
              </div>

              <p className="reg-code-hint">📬 Проверь папку «Спам»</p>

              <button className="reg-btn" onClick={handleConfirm} disabled={loading} style={{ marginTop: 16 }}>
                {loading ? <><span className="spin">◌</span> Проверяем...</> : 'Подтвердить →'}
              </button>

              <button className="reg-back" onClick={() => { setStep('form'); setCode(''); setError(''); }}>
                ← Изменить данные
              </button>
            </>
          )}

          {/* ── Шаг 3: Успех ── */}
          {step === 'success' && (
            <>
              <div className="reg-success-icon">✅</div>
              <h2 className="reg-success-title">Добро пожаловать!</h2>
              <p className="reg-success-sub">
                Аккаунт успешно создан.<br />
                Перенаправляем тебя на главную...
              </p>
              <div className="reg-redirect-bar">
                <div className="reg-redirect-fill" />
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
