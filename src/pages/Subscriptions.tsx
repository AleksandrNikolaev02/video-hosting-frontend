import { useEffect, useState } from 'react';
import { getMySubscriptions } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function Subscriptions() {
  const [channels, setChannels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMySubscriptions().then(setChannels);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Мои подписки</h1>

      <div className="grid grid-cols-3 gap-4">
        {channels.map((c: any) => (
          <div
            key={c.id}
            onClick={() => navigate(`/channel/${c.id}`)}
            className="cursor-pointer border p-4 rounded hover:shadow"
          >
            <div className="text-lg font-semibold">{c.name}</div>
            <div className="text-sm text-gray-500">
              {c.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}