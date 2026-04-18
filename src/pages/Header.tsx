import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { hasChannel } from '../api/api';

export default function Header() {
  const [hasChannelState, setHasChannelState] = useState<boolean | null>(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    hasChannel()
      .then(setHasChannelState)
      .catch(() => setHasChannelState(false));
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;

    navigate(`/search?query=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex justify-between p-4 bg-gray-800">

      <Link to="/" className="text-xl font-bold">
        MyTube
      </Link>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          placeholder="Поиск..."
          className="px-3 py-1 rounded text-white"
        />

        <button
          onClick={handleSearch}
          className="bg-blue-500 px-3 py-1 rounded"
        >
          Search
        </button>
      </div>

      <div className="flex gap-4">

        {hasChannelState && (
            <Link to="/my-channel" className="bg-gray-600 px-3 py-1 rounded">
            My channel
          </Link>
        )}

        {hasChannelState && (
          <Link to="/upload" className="bg-blue-500 px-3 py-1 rounded">
            Upload
          </Link>
        )}

        {!hasChannelState && hasChannelState !== null && (
          <Link to="/create-channel" className="bg-gray-600 px-3 py-1 rounded">
            Create Channel
          </Link>
        )}

      </div>
    </div>
  );
}