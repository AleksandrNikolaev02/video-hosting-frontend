import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  updateVideo,
  updatePreview,
  addTags,
  deleteTags,
  getVideoInfo,
  createPreview,
  uploadPreview
} from '../api/api';
import type { Video } from '../model/Video';

export default function EditVideo() {
  const [params] = useSearchParams();
  const filename = params.get('filename');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [initialTags, setInitialTags] = useState<string[]>([]);
  const [video, setVideo] = useState<Video | null>(null);

  // 🔥 загрузка данных видео (если есть API)
  useEffect(() => {
    if (!filename) return;

    const loadVideo = async () => {
      try {
        const data = await getVideoInfo(filename);

        setVideo(data);

        setTitle(data.title);
        setDescription(data.description);
        setTags(data.tags || []);
      } catch (e) {
        console.error(e);
      }
    };

    loadVideo();
  }, [filename]);

  // ✏️ сохранить
  const handleSave = async () => {
    if (!filename) return;

    try {
      // 1️⃣ обновляем видео
      await updateVideo(filename, { title, description });

      // 2️⃣ превью
      if (previewFile && video?.video_preview?.previewId) {
        await updatePreview(
          previewFile,
          video.video_preview.previewId,
          previewFile.name
        );
      } else if (previewFile && !video?.video_preview?.previewId) {
        const previewRes = await createPreview(filename);
        await uploadPreview(previewFile, previewRes.filename, previewFile.name);
      }

      // 3️⃣ теги (diff логика)
      const tagsToAdd = tags.filter(t => !initialTags.includes(t));
      const tagsToDelete = initialTags.filter(t => !tags.includes(t));

      if (tagsToAdd.length > 0) {
        await addTags(filename, tagsToAdd);
      }

      if (tagsToDelete.length > 0) {
        await deleteTags(filename, tagsToDelete);
      }

    } catch (e) {
      console.error(e);
    }
  };

  // ➕ добавить тег в UI
  const handleAddTag = () => {
    if (!newTag) return;

    setTags(prev => [...prev, newTag]);
    setNewTag('');
  };

  // ❌ удалить тег
  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    deleteTags(filename!, [tag]);
  };

  return (
    <div className="p-6 max-w-2xl">

      <h1 className="text-xl font-bold mb-4">Редактировать видео</h1>

      {/* title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название"
        className="border p-2 w-full mb-3 rounded"
      />

      {/* description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание"
        className="border p-2 w-full mb-3 rounded"
      />

      {/* preview */}
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
        />

        {previewFile && (
          <img
            src={URL.createObjectURL(previewFile)}
            className="w-40 mt-2 rounded"
          />
        )}
      </div>

      {/* tags */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="border p-2 flex-1 rounded"
            placeholder="Новый тег"
          />

          <button
            onClick={handleAddTag}
            className="bg-blue-500 text-white px-3 rounded"
          >
            +
          </button>
        </div>

        <div className="flex gap-2 mt-2 flex-wrap">
          {tags.map(tag => (
            <div
              key={tag}
              className="bg-gray-700 text-white px-2 py-1 rounded flex items-center gap-1"
            >
              {tag}
              <button onClick={() => handleRemoveTag(tag)}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* save */}
      <button
        onClick={handleSave}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Сохранить
      </button>

    </div>
  );
}