import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createChannel } from '../api/api';

export default function CreateChannel() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) { setError('Введите название канала'); return; }
    try {
      setLoading(true); setError('');
      await createChannel(name, description);
      navigate('/my-channel');
    } catch {
      setError('Не удалось создать канал. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .cc-bg {
          min-height: 100vh; background: #0d0b14;
          display: flex; align-items: center; justify-content: center;
          padding: 28px; font-family: 'Nunito', sans-serif;
          position: relative; overflow: hidden;
        }
        .cc-bg::before {
          content: '';
          position: fixed; top: -10%; left: 50%; transform: translateX(-50%);
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(155,89,245,0.09) 0%, transparent 65%);
          pointer-events: none;
        }
        .cc-bg::after {
          content: '';
          position: fixed; bottom: 0; right: 15%;
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(224,64,251,0.06) 0%, transparent 65%);
          pointer-events: none;
        }

        .cc-card {
          background: #13111f;
          border: 1px solid rgba(155,89,245,0.16);
          border-radius: 24px; padding: 52px 44px;
          width: 100%; max-width: 460px;
          position: relative; overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(155,89,245,0.05);
          animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .cc-card::before {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 65%; height: 2px;
          background: linear-gradient(90deg, transparent, #9b59f5, #e040fb, transparent);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .cc-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          display: flex; align-items: center; justify-content: center;
          font-size: 32px; margin: 0 auto 24px;
          box-shadow: 0 8px 28px rgba(155,89,245,0.5);
          animation: iconBounce 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        @keyframes iconBounce {
          from { opacity: 0; transform: scale(0.7) rotate(-10deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        .cc-title {
          font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 900;
          color: #f0ecff; text-align: center; letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .cc-sub {
          font-size: 14px; color: rgba(240,236,255,0.38);
          text-align: center; margin-bottom: 36px; line-height: 1.5;
        }

        .cc-field { margin-bottom: 20px; }
        .cc-label {
          display: block; font-size: 12px; font-weight: 800;
          color: rgba(155,89,245,0.8); margin-bottom: 9px;
          text-transform: uppercase; letter-spacing: 0.8px;
        }
        .cc-input {
          width: 100%; background: rgba(155,89,245,0.05);
          border: 1.5px solid rgba(155,89,245,0.12);
          border-radius: 12px; padding: 13px 18px;
          color: #f0ecff; font-family: 'Nunito', sans-serif;
          font-size: 15px; outline: none; box-sizing: border-box;
          transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
        }
        .cc-input::placeholder { color: rgba(240,236,255,0.22); }
        .cc-input:focus {
          border-color: rgba(155,89,245,0.52);
          background: rgba(155,89,245,0.08);
          box-shadow: 0 0 0 4px rgba(155,89,245,0.1);
        }
        textarea.cc-input { resize: vertical; min-height: 100px; }

        /* Live preview */
        .cc-preview {
          background: rgba(155,89,245,0.06);
          border: 1px solid rgba(155,89,245,0.12);
          border-radius: 12px; padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 28px;
          transition: all 0.25s ease;
        }
        .cc-preview-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 900;
          color: white; flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(155,89,245,0.35);
        }
        .cc-preview-info {}
        .cc-preview-name {
          font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 800;
          color: ${name ? '#f0ecff' : 'rgba(240,236,255,0.25)'};
        }
        .cc-preview-label { font-size: 12px; color: rgba(240,236,255,0.3); margin-top: 2px; }

        .cc-error {
          background: rgba(240,50,80,0.1); border: 1px solid rgba(240,50,80,0.22);
          border-radius: 10px; padding: 12px 16px;
          color: #ff6b8a; font-size: 13.5px; margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }

        .cc-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          border: none; border-radius: 13px; color: white;
          font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 800;
          cursor: pointer; letter-spacing: 0.2px;
          box-shadow: 0 6px 24px rgba(155,89,245,0.4);
          transition: all 0.22s ease; position: relative; overflow: hidden;
        }
        .cc-btn::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.14), transparent);
          border-radius: inherit;
        }
        .cc-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(155,89,245,0.58); }
        .cc-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .spin { display: inline-block; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="cc-bg">
        <div className="cc-card">
          <div className="cc-icon">🎬</div>
          <h1 className="cc-title">Создать канал</h1>
          <p className="cc-sub">Начни делиться своим контентом<br />с аудиторией</p>

          {/* Live preview */}
          <div className="cc-preview">
            <div className="cc-preview-avatar">
              {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="cc-preview-info">
              <div className="cc-preview-name">{name || 'Название канала'}</div>
              <div className="cc-preview-label">Предпросмотр</div>
            </div>
          </div>

          {error && <div className="cc-error">⚠️ {error}</div>}

          <div className="cc-field">
            <label className="cc-label">Название канала *</label>
            <input
              className="cc-input"
              placeholder="Как будет называться твой канал?"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              maxLength={60}
            />
          </div>
          <div className="cc-field">
            <label className="cc-label">Описание</label>
            <textarea
              className="cc-input"
              placeholder="Расскажи о своём канале..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          <button className="cc-btn" onClick={handleCreate} disabled={loading}>
            {loading ? <><span className="spin">◌</span> Создаём...</> : '✦ Создать канал →'}
          </button>
        </div>
      </div>
    </>
  );
}
