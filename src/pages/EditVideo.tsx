import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  getVideoInfo, updateVideo, deleteVideo,
  updatePreview, createPreview, uploadPreview,
  addTags, deleteTags
} from '../api/api';
import type { Video } from '../model/Video';

export function EditVideo() {
  const [params] = useSearchParams();
  const filename = params.get('filename');
  const navigate = useNavigate();

  const [video, setVideo] = useState<Video | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLInputElement>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [initialTags, setInitialTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!filename) return;
    setLoading(true);
    getVideoInfo(filename).then(v => {
      setVideo(v);
      setTitle(v.title ?? '');
      setDescription(v.description ?? '');
      const t = v.tags ?? [];
      setTags(t);
      setInitialTags(t);
      setLoading(false);
    });
  }, [filename]);

  const handlePreviewFile = (f: File) => {
    setPreviewFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags(prev => [...prev, trimmed]);
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!filename || !title.trim()) { setError('Название не может быть пустым'); return; }
    try {
      setSaving(true); setError('');

      await updateVideo(filename, { title, description });

      if (previewFile) {
        if (video?.video_preview?.previewId) {
          await updatePreview(previewFile, video.video_preview.previewId, previewFile.name);
        } else {
          const previewRes = await createPreview(filename);
          await uploadPreview(previewFile, previewRes.filename, previewFile.name);
        }
      }

      const tagsToAdd = tags.filter(t => !initialTags.includes(t));
      const tagsToDelete = initialTags.filter(t => !tags.includes(t));
      if (tagsToAdd.length > 0) await addTags(filename, tagsToAdd);
      if (tagsToDelete.length > 0) await deleteTags(filename, tagsToDelete);

      navigate('/my-channel');
    } catch {
      setError('Не удалось сохранить. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!filename) return;
    try { setDeleting(true); await deleteVideo(filename); navigate('/my-channel'); }
    catch { setError('Не удалось удалить видео.'); setDeleting(false); setShowConfirm(false); }
  };

  return (
    <>
      <style>{`
        .ev-wrap {
          min-height: 100vh; background: #0d0b14;
          font-family: 'Nunito', sans-serif;
          padding: 36px 28px 80px;
          display: flex; flex-direction: column; align-items: center;
        }
        .ev-card {
          background: #13111f;
          border: 1px solid rgba(155,89,245,0.14);
          border-radius: 22px; padding: 44px 40px;
          width: 100%; max-width: 600px;
          position: relative; overflow: hidden;
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .ev-card::before {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 70%; height: 2px;
          background: linear-gradient(90deg, transparent, #9b59f5, #e040fb, transparent);
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }

        .ev-title {
          font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 900;
          color: #f0ecff; letter-spacing: -0.5px; margin-bottom: 4px;
        }
        .ev-sub { font-size: 14px; color: rgba(240,236,255,0.38); margin-bottom: 36px; }

        .ev-field { margin-bottom: 20px; }
        .ev-label {
          display: block; font-size: 12px; font-weight: 800;
          color: rgba(155,89,245,0.8); margin-bottom: 9px;
          text-transform: uppercase; letter-spacing: 0.8px;
        }
        .ev-input {
          width: 100%; background: rgba(155,89,245,0.05);
          border: 1.5px solid rgba(155,89,245,0.12);
          border-radius: 12px; padding: 13px 18px;
          color: #f0ecff; font-family: 'Nunito', sans-serif;
          font-size: 15px; outline: none; box-sizing: border-box;
          transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
        }
        .ev-input::placeholder { color: rgba(240,236,255,0.22); }
        .ev-input:focus {
          border-color: rgba(155,89,245,0.5);
          background: rgba(155,89,245,0.08);
          box-shadow: 0 0 0 4px rgba(155,89,245,0.1);
        }
        textarea.ev-input { resize: vertical; min-height: 110px; }

        /* Preview */
        .ev-preview-row { display: flex; gap: 16px; align-items: center; }
        .ev-preview-thumb {
          width: 150px; height: 84px; border-radius: 10px; flex-shrink: 0; overflow: hidden;
          background: #1a1729; border: 1.5px dashed rgba(155,89,245,0.2);
          display: flex; align-items: center; justify-content: center;
          color: rgba(155,89,245,0.25); font-size: 26px; cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .ev-preview-thumb:hover { border-color: rgba(155,89,245,0.45); background: rgba(155,89,245,0.06); }
        .ev-preview-thumb.has-img { border-style: solid; border-color: rgba(155,89,245,0.3); }
        .ev-preview-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ev-preview-hint { font-size: 13px; color: rgba(240,236,255,0.35); line-height: 1.6; }
        .ev-preview-hint strong { color: rgba(240,236,255,0.6); }

        /* Tags */
        .ev-tags-input-row { display: flex; gap: 8px; margin-bottom: 10px; }
        .ev-tag-add-btn {
          padding: 0 18px; border-radius: 10px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          color: white; font-family: 'Outfit', sans-serif;
          font-size: 20px; font-weight: 700; border: none; cursor: pointer;
          box-shadow: 0 2px 10px rgba(155,89,245,0.3);
          transition: all 0.2s ease; flex-shrink: 0;
        }
        .ev-tag-add-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(155,89,245,0.45); }
        .ev-tags-list { display: flex; flex-wrap: wrap; gap: 8px; min-height: 20px; }
        .ev-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(155,89,245,0.12);
          border: 1px solid rgba(155,89,245,0.22);
          color: #cba3ff; border-radius: 100px;
          padding: 5px 12px 5px 14px;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          transition: all 0.18s ease;
        }
        .ev-tag:hover { background: rgba(155,89,245,0.2); }
        .ev-tag-remove {
          background: none; border: none; cursor: pointer;
          color: rgba(155,89,245,0.5); font-size: 14px; line-height: 1;
          padding: 0; transition: color 0.15s; display: flex; align-items: center;
        }
        .ev-tag-remove:hover { color: #ff6b8a; }

        .ev-error {
          background: rgba(240,50,80,0.1); border: 1px solid rgba(240,50,80,0.22);
          border-radius: 10px; padding: 12px 16px;
          color: #ff6b8a; font-size: 13.5px; margin-bottom: 20px;
        }

        .ev-btns { display: flex; gap: 12px; margin-top: 8px; }
        .ev-btn-save {
          flex: 1; padding: 14px;
          background: linear-gradient(135deg, #9b59f5, #e040fb);
          border: none; border-radius: 13px; color: white;
          font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 800;
          cursor: pointer; box-shadow: 0 6px 24px rgba(155,89,245,0.38);
          transition: all 0.22s ease;
        }
        .ev-btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(155,89,245,0.55); }
        .ev-btn-save:disabled { opacity: 0.55; cursor: not-allowed; }
        .ev-btn-del {
          padding: 14px 22px; border-radius: 13px;
          background: rgba(240,50,80,0.1); color: #ff6b8a;
          border: 1.5px solid rgba(240,50,80,0.2);
          font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.22s ease;
        }
        .ev-btn-del:hover { background: rgba(240,50,80,0.2); border-color: rgba(240,50,80,0.4); }

        /* Confirm modal */
        .ev-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; backdrop-filter: blur(6px); animation: fadeUp 0.2s ease;
        }
        .ev-modal {
          background: #161326; border: 1px solid rgba(240,50,80,0.25);
          border-radius: 18px; padding: 36px 32px; max-width: 380px; width: 90%;
          text-align: center;
        }
        .ev-modal-icon { font-size: 44px; margin-bottom: 14px; }
        .ev-modal-title {
          font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800;
          color: #f0ecff; margin-bottom: 8px;
        }
        .ev-modal-text { font-size: 14px; color: rgba(240,236,255,0.45); margin-bottom: 24px; }
        .ev-modal-btns { display: flex; gap: 10px; }
        .ev-modal-cancel {
          flex: 1; padding: 12px;
          background: rgba(255,255,255,0.06); color: rgba(240,236,255,0.6);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 10px; font-family: 'Outfit', sans-serif;
          font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .ev-modal-cancel:hover { background: rgba(255,255,255,0.1); color: #f0ecff; }
        .ev-modal-confirm {
          flex: 1; padding: 12px;
          background: linear-gradient(135deg, #f03250, #e040fb);
          color: white; border: none; border-radius: 10px;
          font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 800;
          cursor: pointer; box-shadow: 0 4px 18px rgba(240,50,80,0.35);
          transition: all 0.2s;
        }
        .ev-modal-confirm:hover { transform: translateY(-1px); box-shadow: 0 8px 26px rgba(240,50,80,0.5); }
        .ev-modal-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

        .spin { display: inline-block; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="ev-wrap">
        {loading ? (
          <div style={{ color: 'rgba(240,236,255,0.3)', fontFamily: 'Nunito, sans-serif', fontSize: 16, marginTop: 80 }}>
            Загружаем данные...
          </div>
        ) : (
          <div className="ev-card">
            <h1 className="ev-title">✏️ Редактировать видео</h1>
            <p className="ev-sub">Обнови информацию о своём видео</p>

            {error && <div className="ev-error">⚠️ {error}</div>}

            <div className="ev-field">
              <label className="ev-label">Название</label>
              <input className="ev-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Название видео..." />
            </div>
            <div className="ev-field">
              <label className="ev-label">Описание</label>
              <textarea className="ev-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание видео..." />
            </div>

            {/* Preview */}
            <div className="ev-field">
              <label className="ev-label">Превью (обложка)</label>
              <div className="ev-preview-row">
                <div
                  className={`ev-preview-thumb${previewUrl ? ' has-img' : ''}`}
                  onClick={() => previewRef.current?.click()}
                >
                  {previewUrl
                    ? <img src={previewUrl} alt="preview" />
                    : '🖼'
                  }
                  <input
                    ref={previewRef} type="file" accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => e.target.files?.[0] && handlePreviewFile(e.target.files[0])}
                  />
                </div>
                <div className="ev-preview-hint">
                  {previewFile
                    ? <><strong>✅ {previewFile.name}</strong><br />Нажми, чтобы заменить</>
                    : <>Нажми, чтобы выбрать обложку<br />JPG, PNG — <strong>до 5 МБ</strong></>
                  }
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="ev-field">
              <label className="ev-label">Теги</label>
              <div className="ev-tags-input-row">
                <input
                  className="ev-input"
                  placeholder="Добавить тег..."
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                  style={{ marginBottom: 0 }}
                />
                <button className="ev-tag-add-btn" onClick={handleAddTag}>+</button>
              </div>
              <div className="ev-tags-list">
                {tags.map(tag => (
                  <div key={tag} className="ev-tag">
                    #{tag}
                    <button className="ev-tag-remove" onClick={() => handleRemoveTag(tag)}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="ev-btns">
              <button className="ev-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spin">◌</span> : 'Сохранить изменения →'}
              </button>
              <button className="ev-btn-del" onClick={() => setShowConfirm(true)}>🗑</button>
            </div>
          </div>
        )}

        {showConfirm && (
          <div className="ev-overlay">
            <div className="ev-modal">
              <div className="ev-modal-icon">🗑️</div>
              <div className="ev-modal-title">Удалить видео?</div>
              <div className="ev-modal-text">Это действие необратимо. Видео будет удалено навсегда.</div>
              <div className="ev-modal-btns">
                <button className="ev-modal-cancel" onClick={() => setShowConfirm(false)}>Отмена</button>
                <button className="ev-modal-confirm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <span className="spin">◌</span> : 'Удалить'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default EditVideo;
