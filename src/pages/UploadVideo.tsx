import { useEffect, useState } from 'react';
import { hasChannel, createVideo, postVideo, 
  saveAllChunks, uploadChunk } from '../api/api';
import { useNavigate } from 'react-router-dom';
import splitFile from '../util/chunk';
import generateKey from '../util/generator';

export default function UploadVideo() {
  const [hasChannelState, setHasChannelState] = useState<boolean | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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

      setProgress(Math.round(((i + 1) / chunks.length) * 100));

      console.log(`Uploaded chunk ${i + 1}/${chunks.length}`);
    }

    // 🔥 собрать файл
    await saveAllChunks(key, filename, 1); // TODO: user_id нужно брать из контекста авторизации, пока просто 1

    // 🔥 опубликовать
    await postVideo(filename);
  };

  // 🔥 Отправка
  const handleUpload = async () => {
    if (!file) {
      alert('Выбери файл');
      return;
    }

    setLoading(true);

    try {
      // 1. создать видео
      const res = await createVideo({
        title,
        description,
      });

      const filename = res.filename;

      // 2. загрузить файл чанками
      await uploadFile(file, filename);

      alert('Видео загружено 🎉');

      navigate(`/video/${filename}`);
    } catch (e) {
      console.error(e);
      alert('Ошибка загрузки');
    } finally {
      setLoading(false);
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

      {/* кнопка */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Загрузка...' : 'Загрузить'}
      </button>

      {loading && (
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