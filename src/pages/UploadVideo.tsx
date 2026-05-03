import { useEffect, useRef, useState } from 'react';
import {
  hasChannel, createVideo, postVideo,
  saveAllChunks, uploadChunk,
  uploadPreview, createPreview
} from '../api/api';
import { useNavigate } from 'react-router-dom';
import splitFile from '../util/chunk';
import generateKey from '../util/generator';

export default function UploadVideo() {
  const [hasChannelState, setHasChannelState] = useState<boolean | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    hasChannel()
      .then(setHasChannelState)
      .catch(() => setHasChannelState(false));
  }, []);

  const handleFile = (f: File) => { setFile(f); setProgress(0); };
  const handlePreviewFile = (f: File) => {
    setPreviewFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('video/')) handleFile(f);
  };

  // Чанковая загрузка видеофайла
  const uploadFile = async (file: File, filename: string) => {
    const key = generateKey();
    const chunks = splitFile(file);
    setStage('Загружаем видео...');

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const dto = {
        key,
        filename: file.name,
        contentType: file.type,
        partIndex: chunk.index,
      };
      const formData = new FormData();
      formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
      formData.append('file', chunk.blob);
      await uploadChunk(formData);
      // Прогресс: загрузка файла занимает 0–85% шкалы
      setProgress(Math.round(((i + 1) / chunks.length) * 85));
    }

    await saveAllChunks(key, filename, 1);
  };

  const handleUpload = async (publishNow: boolean) => {
    if (!file) { setError('Выберите видеофайл'); return; }
    if (!title.trim()) { setError('Укажите название видео'); return; }

    try {
      setIsUploading(true);
      setError('');
      setProgress(0);

      // 1. Создаём бизнес-сущность видео
      setStage('Создаём видео...');
      const videoRes = await createVideo({ title, description });
      const filename = videoRes.filename;

      // 2. Загружаем видеофайл чанками с прогрессом
      await uploadFile(file, filename);

      // 3. Превью — два шага: сначала бизнес-сущность, потом файл в другой микросервис
      if (previewFile) {
        setStage('Загружаем обложку...');
        setProgress(88);
        const previewRes = await createPreview(filename);
        await uploadPreview(previewFile, previewRes.filename, previewFile.name);
      }

      setProgress(95);

      // 4. Публикация: сразу или отложенно (со страницы MyChannel)
      if (publishNow) {
        setStage('Публикуем...');
        await postVideo(filename);
        setProgress(100);
        navigate(`/video?filename=${filename}`);
      } else {
        setStage('Сохранено как черновик!');
        setProgress(100);
        setTimeout(() => navigate('/my-channel'), 800);
      }

    } catch (e) {
      console.error(e);
      setError('Ошибка загрузки. Попробуйте ещё раз.');
      setProgress(0);
      setStage('');
    } finally {
      setIsUploading(false);
    }
  };

  // Ожидаем проверку канала
  if (hasChannelState === null) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0d0b14', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Nunito, sans-serif', color: 'rgba(240,236,255,0.3)', fontSize: 16
      }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(155,89,245,0.15)', borderTopColor: '#9b59f5', animation: 'spin 0.8s linear infinite', marginRight: 14 }} />
        Проверка...
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Нет канала
  if (!hasChannelState) {
    return (
      <>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{
          minHeight: '100vh', background: '#0d0b14', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Nunito, sans-serif', padding: 24
        }}>
          <div style={{
            background: '#13111f', border: '1px solid rgba(155,89,245,0.18)',
            borderRadius: 22, padding: '52px 44px', maxWidth: 420, width: '100%',
            textAlign: 'center', animation: 'fadeUp 0.5s ease'
          }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>📺</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, fontWeight: 800, color: '#f0ecff', marginBottom: 10 }}>
              Сначала создай канал
            </div>
            <div style={{ fontSize: 14, color: 'rgba(240,236,255,0.4)', marginBottom: 28 }}>
              Чтобы загружать видео, нужен канал
            </div>
            <button
              onClick={() => navigate('/create-channel')}
              style={{
                padding: '13px 32px', borderRadius: 100,
                background: 'linear-gradient(135deg, #9b59f5, #e040fb)',
                color: 'white', border: 'none', fontFamily: 'Outfit, sans-serif',
                fontSize: 16, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(155,89,245,0.4)'
              }}
            >
              ✦ Создать канал
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .uv-wrap {
          min-height: 100vh; background: #0d0b14;
          font-family: 'Nunito', sans-serif;
          padding: 36px 28px 80px;
          display: flex; flex-direction: column; align-items: center;
        }
        .uv-card {
          background: #13111f;
          border: 1px solid rgba(155,89,245,0.14);
          border-radius: 22px; padding: 44px 40px;
          width: 100%; max-width: 680px;
          position: relative; overflow: hidden;
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .uv-card::before {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 70%; height: 2px;
          background: linear-gradient(90deg, transparent, #9b59f5, #e040fb, transparent);
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }

        .uv-title {
          font-family: 'Outfit', sans-serif; font-size: 27px; font-weight: 900;
          color: #f0ecff; letter-spacing: -0.5px; margin-bottom: 4px;
        }
        .uv-sub { font-size: 14px; color: rgba(240,236,255,0.38); margin-bottom: 36px; }

        /* Drop zone */
        .uv-drop {
          border: 2px dashed rgba(155,89,245,0.25);
          border-radius: 16px; padding: 40px 20px;
          text-align: center; cursor: pointer;
          transition: all 0.25s ease; margin-bottom: 28px;
          background: rgba(155,89,245,0.03);
        }
        .uv-drop:hover, .uv-drop.drag { border-color: rgba(155,89,245,0.55); background: rgba(155,89,245,0.07); }
        .uv-drop.has-file { border-color: rgba(52,211,153,0.45); background: rgba(52,211,153,0.05); border-style: solid; }
        .uv-drop-icon { font-size: 44px; margin-bottom: 12px; display: block; transition: transform 0.25s; }
        .uv-drop:hover .uv-drop-icon { transform: scale(1.1) translateY(-4px); }
        .uv-drop-text { font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 700; color: rgba(240,236,255,0.7); margin-bottom: 6px; }
        .uv-drop-sub { font-size: 13px; color: rgba(240,236,255,0.3); }
        .uv-drop-file { font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 700; color: #34d399; margin-top: 8px; }

        /* Fields */
        .uv-field { margin-bottom: 20px; }
        .uv-label {
          display: block; font-size: 12px; font-weight: 800;
          color: rgba(155,89,245,0.8); margin-bottom: 9px;
          text-transform: uppercase; letter-spacing: 0.8px;
        }
        .uv-input {
          width: 100%; background: rgba(155,89,245,0.05);
          border: 1.5px solid rgba(155,89,245,0.12);
          border-radius: 12px; padding: 13px 18px;
          color: #f0ecff; font-family: 'Nunito', sans-serif;
          font-size: 15px; outline: none; box-sizing: border-box;
          transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
        }
        .uv-input::placeholder { color: rgba(240,236,255,0.22); }
        .uv-input:focus {
          border-color: rgba(155,89,245,0.5);
          background: rgba(155,89,245,0.08);
          box-shadow: 0 0 0 4px rgba(155,89,245,0.1);
        }
        .uv-input:disabled { opacity: 0.5; cursor: not-allowed; }
        textarea.uv-input { resize: vertical; min-height: 100px; }

        /* Preview */
        .uv-preview-row { display: flex; gap: 16px; align-items: center; }
        .uv-preview-thumb {
          width: 140px; height: 79px; border-radius: 10px; flex-shrink: 0; overflow: hidden;
          background: #1a1729; border: 1.5px dashed rgba(155,89,245,0.2);
          display: flex; align-items: center; justify-content: center;
          color: rgba(155,89,245,0.25); font-size: 24px; cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .uv-preview-thumb:hover { border-color: rgba(155,89,245,0.45); background: rgba(155,89,245,0.06); }
        .uv-preview-thumb.has-img { border-style: solid; border-color: rgba(155,89,245,0.3); }
        .uv-preview-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .uv-preview-info { font-size: 13.5px; color: rgba(240,236,255,0.4); line-height: 1.6; }
        .uv-preview-info strong { color: rgba(240,236,255,0.65); }

        /* Progress */
        .uv-progress { margin-bottom: 24px; }
        .uv-progress-bar { height: 8px; background: rgba(155,89,245,0.1); border-radius: 4px; overflow: hidden; }
        .uv-progress-fill {
          height: 100%; background: linear-gradient(90deg, #9b59f5, #e040fb);
          border-radius: 4px; transition: width 0.35s ease;
          box-shadow: 0 0 12px rgba(155,89,245,0.6);
        }
        .uv-progress-meta {
          display: flex; justify-content: space-between; align-items: center; margin-top: 8px;
        }
        .uv-progress-stage { font-size: 13px; color: rgba(155,89,245,0.8); font-family: 'Outfit', sans-serif; font-weight: 600; }
        .uv-progress-pct { font-size: 13px; color: rgba(240,236,255,0.5); font-family: 'Outfit', sans-serif; font-weight: 700; }

        /* Error */
        .uv-error {
          background: rgba(240,50,80,0.1); border: 1px solid rgba(240,50,80,0.22);
          border-radius: 10px; padding: 12px 16px;
          color: #ff6b8a; font-size: 13.5px; margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }

        /* Divider */
        .uv-divider { height: 1px; background: rgba(155,89,245,0.1); margin: 28px 0 22px; }
        .uv-publish-label {
          font-size: 12px; font-weight: 800; color: rgba(155,89,245,0.8);
          text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px;
        }

        /* Two publish buttons */
        .uv-btn-row { display: flex; gap: 12px; }
        .uv-btn-publish {
          flex: 1; padding: 14px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          border: none; border-radius: 13px; color: white;
          font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 800;
          cursor: pointer; box-shadow: 0 6px 24px rgba(155,89,245,0.4);
          transition: all 0.22s ease; position: relative; overflow: hidden;
        }
        .uv-btn-publish::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          border-radius: inherit;
        }
        .uv-btn-publish:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(155,89,245,0.58); }
        .uv-btn-publish:disabled { opacity: 0.55; cursor: not-allowed; }

        .uv-btn-draft {
          flex: 1; padding: 14px;
          background: rgba(155,89,245,0.08);
          border: 1.5px solid rgba(155,89,245,0.2);
          border-radius: 13px; color: #cba3ff;
          font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.22s ease;
        }
        .uv-btn-draft:hover:not(:disabled) { background: rgba(155,89,245,0.15); border-color: rgba(155,89,245,0.4); color: #f0ecff; }
        .uv-btn-draft:disabled { opacity: 0.55; cursor: not-allowed; }

        .uv-btn-hint { font-size: 12px; color: rgba(240,236,255,0.25); text-align: center; margin-top: 10px; }

        .spin { display: inline-block; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="uv-wrap">
        <div className="uv-card">
          <h1 className="uv-title">📤 Загрузить видео</h1>
          <p className="uv-sub">Поделись своим контентом с миром</p>

          {/* Drop zone */}
          <div
            className={`uv-drop${dragging ? ' drag' : ''}${file ? ' has-file' : ''}`}
            onClick={() => !isUploading && fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <span className="uv-drop-icon">{file ? '✅' : '🎬'}</span>
            {file ? (
              <>
                <div className="uv-drop-text">Файл выбран</div>
                <div className="uv-drop-file">📁 {file.name}</div>
                <div className="uv-drop-sub" style={{ marginTop: 6 }}>Нажми, чтобы заменить</div>
              </>
            ) : (
              <>
                <div className="uv-drop-text">Перетащи видео сюда</div>
                <div className="uv-drop-sub">или нажми, чтобы выбрать • MP4, MKV, AVI</div>
              </>
            )}
            <input
              ref={fileRef} type="file" accept="video/*"
              style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          <div className="uv-field">
            <label className="uv-label">Название видео *</label>
            <input
              className="uv-input" placeholder="Введите название..."
              value={title} onChange={e => setTitle(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="uv-field">
            <label className="uv-label">Описание</label>
            <textarea
              className="uv-input" placeholder="Расскажите о видео..."
              value={description} onChange={e => setDescription(e.target.value)}
              disabled={isUploading}
            />
          </div>

          {/* Preview */}
          <div className="uv-field">
            <label className="uv-label">Превью (обложка)</label>
            <div className="uv-preview-row">
              <div
                className={`uv-preview-thumb${previewUrl ? ' has-img' : ''}`}
                onClick={() => !isUploading && previewRef.current?.click()}
              >
                {previewUrl ? <img src={previewUrl} alt="preview" /> : '🖼'}
                <input
                  ref={previewRef} type="file" accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && handlePreviewFile(e.target.files[0])}
                />
              </div>
              <div className="uv-preview-info">
                {previewFile
                  ? <><strong>✅ {previewFile.name}</strong><br />Нажми, чтобы заменить</>
                  : <>Нажми, чтобы выбрать обложку<br />JPG, PNG — <strong>до 5 МБ</strong></>
                }
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div className="uv-progress">
              <div className="uv-progress-bar">
                <div className="uv-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="uv-progress-meta">
                <span className="uv-progress-stage">{stage}</span>
                <span className="uv-progress-pct">{progress}%</span>
              </div>
            </div>
          )}

          {error && <div className="uv-error">⚠️ {error}</div>}

          <div className="uv-divider" />

          <div className="uv-publish-label">Публикация</div>
          <div className="uv-btn-row">
            <button
              className="uv-btn-publish"
              onClick={() => handleUpload(true)}
              disabled={isUploading}
            >
              {isUploading
                ? <><span className="spin">◌</span> Загружаем...</>
                : '🚀 Опубликовать сейчас'
              }
            </button>
            <button
              className="uv-btn-draft"
              onClick={() => handleUpload(false)}
              disabled={isUploading}
            >
              🗂 Сохранить черновик
            </button>
          </div>
          <div className="uv-btn-hint">
            Черновик можно опубликовать позже на странице «Мой канал»
          </div>
        </div>
      </div>
    </>
  );
}
