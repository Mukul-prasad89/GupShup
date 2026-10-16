import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function Connections() {
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('loading');
  const load = async () => {
    try {
      const d = await api.follows();
      setRows(d.follows); setState('done');
    } catch (err) { setState('error'); }
  };
  useEffect(() => { load(); }, []);
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 text-white">
      <h1 className="text-2xl font-bold mb-6">Connected people</h1>
      {state === 'loading' && <p className="text-sm text-white/40">Loading…</p>}
      {state === 'done' && rows.length === 0 && <p className="text-sm text-white/40">Empty results.</p>}
      <div className="space-y-3">
        {rows.map((u) => (
          <div key={u.id} className="p-4 rounded-2xl border border-white/10 flex items-center justify-between">
            <Link to={`/u/${u.username}`} className="text-sm font-semibold">@{u.username} <span className="text-white/40">{u.name}</span></Link>
            <button
              onClick={async () => { await api.unfollow(u.id); load(); }}
              className="px-3 py-1.5 text-xs rounded-lg border border-white/15"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
