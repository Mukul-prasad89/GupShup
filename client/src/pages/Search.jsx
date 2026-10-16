import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function Search() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const run = async (e) => {
    e?.preventDefault();
    if (q.trim().length < 2) { setUsers([]); return; }
    setState('loading'); setError('');
    try {
      const d = await api.searchUsers(q.trim());
      setUsers(d.users);
      setState('done');
    } catch (err) { setError(err.message); setState('error'); }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 text-white">
      <h1 className="text-2xl font-bold mb-4">Find people</h1>
      <form onSubmit={run} className="flex gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by username or name (min 2 chars)" className="flex-1 bg-neutral-800 rounded-xl px-4 py-2.5 text-sm outline-none" />
        <button className="px-5 rounded-xl bg-white text-black text-sm font-semibold">Search</button>
      </form>
      {state === 'loading' && <p className="text-sm text-white/40 mt-6">Loading…</p>}
      {state === 'error' && <p className="text-sm text-red-400 mt-6">{error}</p>}
      {state === 'done' && users.length === 0 && <p className="text-sm text-white/40 mt-6">Empty results.</p>}
      <div className="mt-6 space-y-3">
        {users.map((u) => (
          <Link key={u.id} to={`/u/${u.username}`} className="block p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05]">
            <p className="font-semibold">{u.name} <span className="text-white/40">@{u.username}</span></p>
            {u.bio && <p className="text-sm text-white/50 mt-1">{u.bio}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
