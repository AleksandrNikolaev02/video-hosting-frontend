import { useState } from 'react';
import { createChannel } from "../api/api";
import { useNavigate } from 'react-router-dom';

export default function CreateChannel() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    await createChannel(name);
    navigate('/upload');
  };

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-xl mb-4">Создать канал</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название канала"
        className="border p-2 w-full mb-3 rounded"
      />

      <button
        onClick={handleCreate}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Создать
      </button>
    </div>
  );
}