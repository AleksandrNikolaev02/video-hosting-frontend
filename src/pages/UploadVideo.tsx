import { useEffect, useState } from 'react';
import { hasChannel, createVideo, postVideo, 
  saveAllChunks, uploadChunk, 
  uploadPreview,
  createPreview} from '../api/api';
import { useNavigate } from 'react-router-dom';
import splitFile from '../util/chunk';
import generateKey from '../util/generator';

export default function UploadVideo() {
  const [hasChannelState, setHasChannelState] = useState<boolean | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    hasChannel()
      .then(setHasChannelState)
      .catch(() => setHasChannelState(false));
  }, []);

  // 🔥 Проверка канала
  if (hasChannelState === null) {
    return <div className="p-6">Проверка...</div>;
  }

  if (!hasChannelState) {
    return (
      <div className="p-6">
        <h2 className="text-xl mb-4">
          Чтобы загружать видео, нужно создать канал
        </h2>

        <button
          onClick={() => navigate('/create-channel')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Создать канал
        </button>
      </div>
    );
  }

  const uploadFile = async (file: File, filename: string) => {
    const key = generateKey();
    const chunks = splitFile(file);

    console.log('Chunks:', chunks.length);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const dto = {
        key: key,
        filename: file.name,
        contentType: file.type,
        partIndex: chunk.index
      };

      const formData = new FormData();

      formData.append(
        'dto',
        new Blob([JSON.stringify(dto)], { type: 'application/json' })
      );

      formData.append('file', chunk.blob);

      await uploadChunk(formData);

      // 🔥 прогресс
      setProgress(Math.round(((i + 1) / chunks.length) * 100));

      console.log(`Uploaded chunk ${i + 1}/${chunks.length}`);
    }

    await saveAllChunks(key, filename, 1);
  };

  // 🔥 Отправка
  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setProgress(0);

      // 1️⃣ создаём видео
      const videoRes = await createVideo({
        title,
        description
      });

      const filename = videoRes.filename;

      // 2️⃣ загружаем видео
      await uploadFile(file, filename);

      // 3️⃣ превью
      if (previewFile) {
        const previewRes = await createPreview(filename);
        await uploadPreview(previewFile, previewRes.filename, previewFile.name);
      }

      // 4️⃣ публикация
      await postVideo(filename);

      // ✅ РЕДИРЕКТ
      navigate(`/video?filename=${filename}`);

    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  // 🔥 ОСНОВНОЙ UI
  return (
    <div className="p-6 max-w-2xl">

      <h1 className="text-2xl font-bold mb-6">Загрузка видео</h1>

      {/* title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название видео"
        className="border p-2 w-full mb-4 rounded"
      />

      {/* description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание"
        className="border p-2 w-full mb-4 rounded"
      />

      {/* file */}
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setPreviewFile(e.target.files[0]);
          }
        }}
      />

      {previewFile && (
        <img
          src={URL.createObjectURL(previewFile)}
          className="w-64 mt-2 rounded"
        />
      )}

      {/* кнопка */}
      <button
        onClick={handleUpload}
        disabled={isUploading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isUploading ? 'Загрузка...' : 'Загрузить'}
      </button>

      {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-300 h-4 rounded">
              <div
                className="bg-green-500 h-4 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-sm mt-1">{progress}%</div>
          </div>
        )}

    </div>
  );
}