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

  // 🔥 ШАГ 1 — логин
  const handleLogin = async () => {
    try {
      const res = await login({ email, password });

      if (res.requires2FA) {
        setStep('2fa');
      } else {
        // если вдруг без 2FA
        setTokens(res.payload.accessToken, res.payload.refreshToken);
        navigate('/');
      }

    } catch (e) {
      console.error(e);
    }
  };

  // 🔥 ШАГ 2 — 2FA
  const handle2FA = async () => {
    try {
      const res = await twoFactor({ email, code });

      setTokens(res.accessToken, res.refreshToken);

      navigate('/');

    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">

      {step === 'login' && (
        <>
          <h2 className="text-xl mb-4">Вход</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 w-full mb-2"
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 w-full mb-4"
          />

          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 w-full"
          >
            Войти
          </button>
        </>
      )}

      {step === '2fa' && (
        <>
          <h2 className="text-xl mb-4">Введите код из почты</h2>

          <input
            placeholder="Код"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="border p-2 w-full mb-4"
          />

          <button
            onClick={handle2FA}
            className="bg-green-500 text-white px-4 py-2 w-full"
          >
            Подтвердить
          </button>
        </>
      )}

    </div>
  );
}